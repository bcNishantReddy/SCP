import { Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Home from "@/pages/Home";
import Groups from "@/pages/Groups";
import Clubs from "@/pages/Clubs";
import GroupDetails from "@/pages/GroupDetails";
import NotFound from "@/pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/groups" element={<AuthGuard><Groups /></AuthGuard>} />
      <Route path="/clubs" element={<AuthGuard><Clubs /></AuthGuard>} />
      <Route path="/clubs/:id" element={<AuthGuard><GroupDetails /></AuthGuard>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
