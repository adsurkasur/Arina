import React from "react";
import { Switch, Route, Redirect } from "wouter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import './i18n';

// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

// Components
import AuthModal from "@/components/auth/AuthModal";

function ProtectedRoute({ component: Component }: { component: any }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <UniversalLoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function UniversalLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <span className="ml-4 text-gray-500 text-lg">Loading...</span>
    </div>
  );
}

function App() {
  return (
    <>
      {/* <Toaster /> Removed to prevent duplicate toasts */}
      <AuthModal />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/">
          <ProtectedRoute component={Dashboard} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;
