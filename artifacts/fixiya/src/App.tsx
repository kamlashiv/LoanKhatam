import { Switch, Route, Redirect, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Splash from "@/pages/splash";
import Welcome from "@/pages/welcome";
import Login from "@/pages/login";
import Otp from "@/pages/otp";
import Home from "@/pages/home";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import Book from "@/pages/book";
import BookingConfirmed from "@/pages/booking-confirmed";
import Requests from "@/pages/requests";
import RequestDetail from "@/pages/request-detail";
import Profile from "@/pages/profile";
import Notifications from "@/pages/notifications";

const queryClient = new QueryClient();

function FullScreen({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100">
      <div className="app-container">
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/splash" />
      </Route>

      <Route path="/splash">
        <FullScreen>
          <Splash />
        </FullScreen>
      </Route>
      <Route path="/welcome">
        <FullScreen>
          <Welcome />
        </FullScreen>
      </Route>
      <Route path="/login">
        <FullScreen>
          <Login />
        </FullScreen>
      </Route>
      <Route path="/otp">
        <FullScreen>
          <Otp />
        </FullScreen>
      </Route>
      <Route path="/booking-confirmed">
        <FullScreen>
          <BookingConfirmed />
        </FullScreen>
      </Route>

      <Route path="/home">
        <Layout showBottomNav>
          <Home />
        </Layout>
      </Route>
      <Route path="/services">
        <Layout showBottomNav>
          <Services />
        </Layout>
      </Route>
      <Route path="/requests">
        <Layout showBottomNav>
          <Requests />
        </Layout>
      </Route>
      <Route path="/notifications">
        <Layout showBottomNav>
          <Notifications />
        </Layout>
      </Route>
      <Route path="/profile">
        <Layout showBottomNav>
          <Profile />
        </Layout>
      </Route>

      <Route path="/service/:id">
        {(params) => (
          <Layout>
            <ServiceDetail id={params.id} />
          </Layout>
        )}
      </Route>
      <Route path="/book/:id">
        {(params) => (
          <Layout>
            <Book id={params.id} />
          </Layout>
        )}
      </Route>
      <Route path="/request/:id">
        {(params) => (
          <Layout>
            <RequestDetail id={params.id} />
          </Layout>
        )}
      </Route>

      <Route>
        <FullScreen>
          <NotFound />
        </FullScreen>
      </Route>
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
