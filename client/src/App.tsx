import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import Onboarding from "@/pages/Onboarding";
import NewDashboard from "@/pages/NewDashboard";
import Product from "@/pages/Product";
import AllTeams from "@/pages/AllTeams";
import AIAgents from "@/pages/AIAgents";
import Pricing from "@/pages/Pricing";
import Solutions from "@/pages/Solutions";
import Resources from "@/pages/Resources";
import { GeneratedDesign } from "./pages/GeneratedDesign";
import Connectors from "@/pages/Connectors";
import Profile from "@/pages/Profile";
import Integrations from "@/pages/Integrations";

import Reports from "@/pages/Reports";

function Router() {
  return (
    <Switch>
      <Route path="/" component={GeneratedDesign} />
      <Route path="/product" component={Product} />
      <Route path="/product/ai-agents" component={AIAgents} />
      <Route path="/solutions" component={Solutions} />
      <Route path="/solutions/all-teams" component={AllTeams} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/resources" component={Resources} />
      <Route path="/landing" component={SignUp} />
      <Route path="/sign-up" component={SignUp} />
      <Route path="/sign-in" component={SignIn} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={NewDashboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/connectors" component={Connectors} />
      <Route path="/integrations" component={Integrations} />

      <Route path="/reports" component={Reports} />
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
