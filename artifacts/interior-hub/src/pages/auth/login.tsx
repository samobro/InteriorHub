import React, { useState } from "react";
import { useLocation, Link } from "wouter";
import { apiClient } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

function parseJwt(token: string): any {
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
}

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = new URLSearchParams();
      payload.set("grant_type", "password");
      payload.set("username", email);
      payload.set("password", password);
      payload.set("scope", "offline_access");

      const clientId = import.meta.env.VITE_OIDC_CLIENT_ID?.trim();
      if (clientId) {
        payload.set("client_id", clientId);
      }

      const response = await apiClient.post("/connect/token", payload.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const accessToken = response.data?.access_token;
      const refreshToken = response.data?.refresh_token ?? null;
      if (!accessToken) {
        throw new Error("The token response did not include an access token.");
      }

      login(accessToken, refreshToken);

      const tokenPayload = parseJwt(accessToken);
      const userName = tokenPayload.unique_name || tokenPayload.name || "there";
      const role = tokenPayload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || tokenPayload.role || "Engineer";

      toast({
        title: "Login successful",
        description: `Welcome back, ${userName}!`,
      });

      if (role === "Admin") {
        setLocation("/"); // Dashboard for admin
      } else {
        setLocation("/engineer/profile"); // Engineer portal
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err.response?.data?.error || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">InteriorHub</CardTitle>
          <CardDescription className="text-center">Sign in to your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-sm text-center text-slate-500">
              Don't have an account? <Link href="/register" className="text-primary hover:underline">Register here</Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
