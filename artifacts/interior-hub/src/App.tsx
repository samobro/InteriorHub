import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppLayout } from "@/components/layout";
import { EngineerLayout } from "@/components/engineer-layout";

// Admin pages
import Dashboard from "@/pages/dashboard";
import Engineers from "@/pages/engineers";
import Categories from "@/pages/categories";
import Projects from "@/pages/projects";
import ContactRequests from "@/pages/contact-requests";
import Settings from "@/pages/settings";

// Engineer portal pages
import EngineerProfilePage from "@/pages/engineer/profile";
import EngineerProjects from "@/pages/engineer/projects";
import ProjectImages from "@/pages/engineer/project-images";
import EngineerContactRequests from "@/pages/engineer/contact-requests";

import NotFound from "@/pages/not-found";

// Auth pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

// Context
import { AuthProvider } from "@/context/AuthContext";

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  const isEngineerRoute = location.startsWith("/engineer");
  const isAuthRoute = location === "/login" || location === "/register";

  if (isAuthRoute) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
      </Switch>
    );
  }

  if (isEngineerRoute) {
    return (
      <EngineerLayout>
        <Switch>
          <Route path="/engineer/profile" component={EngineerProfilePage} />
          <Route path="/engineer/projects/:id/images" component={ProjectImages} />
          <Route path="/engineer/projects" component={EngineerProjects} />
          <Route path="/engineer/contact-requests" component={EngineerContactRequests} />
          <Route component={NotFound} />
        </Switch>
      </EngineerLayout>
    );
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/engineers" component={Engineers} />
        <Route path="/categories" component={Categories} />
        <Route path="/projects" component={Projects} />
        <Route path="/contact-requests" component={ContactRequests} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
