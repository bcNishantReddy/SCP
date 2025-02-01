import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Events from "@/pages/Events";
import { EventDetails } from "@/components/events/EventDetails";
import LiveFeed from "@/pages/LiveFeed";
import Projects from "@/pages/Projects";
import Opportunities from "@/pages/Opportunities";
import People from "@/pages/People";
import Groups from "@/pages/Groups";
import Portfolios from "@/pages/Portfolios";
import Profile from "@/pages/Profile";
import Tutorials from "@/pages/Tutorials";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import { AuthGuard } from "@/components/auth/AuthGuard";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <AuthGuard>
                <LiveFeed />
              </AuthGuard>
            }
          />
          <Route
            path="/projects"
            element={
              <AuthGuard>
                <Projects />
              </AuthGuard>
            }
          />
          <Route
            path="/opportunities"
            element={
              <AuthGuard>
                <Opportunities />
              </AuthGuard>
            }
          />
          <Route
            path="/people"
            element={
              <AuthGuard>
                <People />
              </AuthGuard>
            }
          />
          <Route
            path="/events"
            element={
              <AuthGuard>
                <Events />
              </AuthGuard>
            }
          />
          <Route
            path="/events/:id"
            element={
              <AuthGuard>
                <EventDetails />
              </AuthGuard>
            }
          />
          <Route
            path="/groups"
            element={
              <AuthGuard>
                <Groups />
              </AuthGuard>
            }
          />
          <Route
            path="/portfolios"
            element={
              <AuthGuard>
                <Portfolios />
              </AuthGuard>
            }
          />
          <Route
            path="/profile"
            element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            }
          />
          <Route
            path="/tutorials"
            element={
              <AuthGuard>
                <Tutorials />
              </AuthGuard>
            }
          />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;