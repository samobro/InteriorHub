import { Route, Switch } from "wouter";
import Home from "@/pages/public/Home";
import AppLayout from "@/components/layout/AppLayout";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/home" component={Home} />
        <Route path="/" component={Home} />
      </Switch>
    </AppLayout>
  );
}

export default function App() {
  return <Router />;
}
