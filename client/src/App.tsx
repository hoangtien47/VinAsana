import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Tasks from "@/pages/tasks";
import Documents from "@/pages/documents";
import Team from "@/pages/team";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import Landing from "@/pages/landing";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

function AuthenticatedRouter() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/landing'];
  const isPublicRoute = publicRoutes.includes(location);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !isPublicRoute) {
    // Redirect to login when not authenticated and not on public route
    window.location.href = '/api/login';
    return null;
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      
      {/* Protected routes */}
      {user && (
        <>
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/documents" component={Documents} />
          <Route path="/team" component={Team} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthenticatedRouter />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
