import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import PendingApproval from "./pages/auth/PendingApproval";
import NotFound from "./pages/NotFound";
import LiveFeed from "./pages/LiveFeed";
import Projects from "./pages/Projects";
import Opportunities from "./pages/Opportunities";
import People from "./pages/People";
import Events from "./pages/Events";
import Groups from "./pages/Groups";
import Portfolios from "./pages/Portfolios";
import Tutorials from "./pages/Tutorials";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LiveFeed />} />
          <Route path="/auth/signin" element={<SignIn />} />
          <Route path="/auth/signup" element={<SignUp />} />
          <Route path="/auth/pending" element={<PendingApproval />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/people" element={<People />} />
          <Route path="/events" element={<Events />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/tutorials" element={<Tutorials />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;