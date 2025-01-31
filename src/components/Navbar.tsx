import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Home,
  Briefcase,
  Award,
  Users,
  Calendar,
  BookOpen,
  FileText,
  Bell,
  User,
} from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="text-xl font-bold text-sage-700">
              Platform
            </Link>
            <div className="hidden md:flex space-x-4">
              <NavLink to="/" icon={<Home size={18} />} label="Feed" />
              <NavLink to="/projects" icon={<Briefcase size={18} />} label="Projects" />
              <NavLink to="/opportunities" icon={<Award size={18} />} label="Opportunities" />
              <NavLink to="/people" icon={<Users size={18} />} label="People" />
              <NavLink to="/events" icon={<Calendar size={18} />} label="Events" />
              <NavLink to="/groups" icon={<Users size={18} />} label="Groups" />
              <NavLink to="/portfolios" icon={<FileText size={18} />} label="Portfolios" />
              <NavLink to="/tutorials" icon={<BookOpen size={18} />} label="Tutorials" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-sage-500 rounded-full" />
            </Button>
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex items-center space-x-1 text-sage-600 hover:text-sage-800 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;