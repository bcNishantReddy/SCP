import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<LiveFeed />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/people" element={<People />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/portfolios" element={<Portfolios />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tutorials" element={<Tutorials />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;