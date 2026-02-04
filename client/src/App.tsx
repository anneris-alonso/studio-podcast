import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Navbar, MobileNavbar } from "@/components/Navbar";
import { Loader2 } from "lucide-react";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Bookings from "@/pages/Bookings";
import UIShowcase from "@/pages/UIShowcase";

function PrivateRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect handled by effect in practice, but rendering Login is safer here
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-background flex pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
        <Component />
      </main>
      <MobileNavbar />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <PrivateRoute component={Dashboard} />} />
      <Route path="/bookings" component={() => <PrivateRoute component={Bookings} />} />
      <Route path="/ui" component={() => <PrivateRoute component={UIShowcase} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
