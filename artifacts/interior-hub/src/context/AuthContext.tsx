import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface AuthUser {
  engineerId: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function parseJwt(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function getUserFromToken(token: string | null): AuthUser | null {
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;

  return {
    engineerId: parseInt(payload.EngineerId || payload.nameid || "0", 10),
    name: payload.unique_name || payload.name || "",
    email: payload.email || "",
    role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role || "Engineer",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("interiorrhub_token"));

  const currentUser = getUserFromToken(token);
  const isAuthenticated = !!currentUser;

  const login = (newToken: string) => {
    localStorage.setItem("interiorrhub_token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("interiorrhub_token");
    setToken(null);
    setLocation("/login");
  };

  // Route protection logic
  useEffect(() => {
    const isEngineerRoute = location.startsWith("/engineer");
    const isAdminRoute = location.startsWith("/admin") || location === "/engineers" || location === "/categories" || location === "/projects" || location === "/contact-requests" || location === "/settings" || location === "/";

    // In the current wouter setup from App.tsx, the admin routes are top-level paths (/, /engineers, /categories, etc.)
    // We assume any non-engineer route that isn't public is an admin route.
    const isPublicRoute = location === "/login" || location === "/register";

    if (!isAuthenticated && !isPublicRoute) {
      setLocation("/login");
      return;
    }

    if (isAuthenticated) {
      if (isEngineerRoute && currentUser?.role !== "Engineer" && currentUser?.role !== "Admin") {
        // Technically Admins can see engineer routes too, or we can restrict it.
      } else if (isAdminRoute && !isPublicRoute && currentUser?.role !== "Admin") {
        // Engineer trying to access admin routes -> redirect to their profile
        setLocation("/engineer/profile");
      }
    }
  }, [location, isAuthenticated, currentUser, setLocation]);

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
