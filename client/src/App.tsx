import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeContext, useThemeProvider } from "@/hooks/useTheme";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import Dashboard from "@/pages/dashboard";
import CarListings from "@/pages/car-listings";
import CarDetail from "@/pages/car-detail";
import DriversPage from "@/pages/drivers";
import SettingsPage from "@/pages/settings";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-0">
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/car-listings" component={CarListings} />
        <Route path="/cars/:id" component={CarDetail} />
        <Route path="/drivers" component={DriversPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  const themeProps = useThemeProvider();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeContext.Provider value={themeProps}>
        <TooltipProvider>
          <div className={themeProps.theme}>
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </ThemeContext.Provider>
    </QueryClientProvider>
  );
}

export default App;
