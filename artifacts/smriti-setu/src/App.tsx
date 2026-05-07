import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { isAuthenticated } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import AncestorsList from "@/pages/ancestors";
import AddAncestor from "@/pages/ancestors/new";
import AncestorDetail from "@/pages/ancestors/detail";
import EditAncestor from "@/pages/ancestors/edit";
import Panchangam from "@/pages/panchangam";
import Notifications from "@/pages/notifications";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/ancestors/new">
        <ProtectedRoute component={AddAncestor} />
      </Route>
      <Route path="/ancestors/:id/edit">
        <ProtectedRoute component={EditAncestor} />
      </Route>
      <Route path="/ancestors/:id">
        <ProtectedRoute component={AncestorDetail} />
      </Route>
      <Route path="/ancestors">
        <ProtectedRoute component={AncestorsList} />
      </Route>
      <Route path="/panchangam">
        <ProtectedRoute component={Panchangam} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute component={Notifications} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
