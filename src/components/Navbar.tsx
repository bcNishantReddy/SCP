import { Link, useNavigate } from "react-router-dom";
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
  Menu,
  LogOut,
  Settings
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/auth/signin", { replace: true });
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 text-white md:text-sage-600">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-sage-100/80 to-sage-200/80 backdrop-blur-md" />
        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link to="/feed" className="flex items-center space-x-2 group">
                <img src="/logo.svg" alt="Campus Connect Logo" className="w-8 h-8 transition-transform group-hover:scale-110" />
              </Link>
              <div className="hidden md:flex space-x-1 pl-10">
                <NavLink to="/feed" icon={<Home size={18} />} label="Feed" />
                <NavLink to="/projects" icon={<Briefcase size={18} />} label="Projects" />
                <NavLink to="/opportunities" icon={<Award size={18} />} label="Opportunities" />
                <NavLink to="/people" icon={<Users size={18} />} label="People" />
                <NavLink to="/events" icon={<Calendar size={18} />} label="Events" />
                <NavLink to="/clubs" icon={<Users size={18} />} label="Clubs" />
                <NavLink to="/portfolios" icon={<FileText size={18} />} label="Portfolios" />
                <NavLink to="/tutorials" icon={<BookOpen size={18} />} label="Tutorials" />
                {isAdmin && (
                  <NavLink to="/admin" icon={<Settings size={18} />} label="Admin" />
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative hover:bg-sage-200/50"
              >
                <Bell className="h-5 w-5 text-white" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-sage-500 rounded-full ring-2 ring-white" />
              </Button>
              <Link to="/profile">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="hover:bg-sage-200/50"
                >
                  <User className="h-5 w-5 text-white" />
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleLogout}
                className="hover:bg-sage-200/50"
              >
                <LogOut className="h-5 w-5 text-white" />
              </Button>
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="hover:bg-sage-200/50">
                    <Menu className="h-5 w-5 text-sage-700" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-white/95 backdrop-blur-xl">
                  <SheetHeader>
                    <SheetTitle className="text-sage-700">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-4 mt-6">
                    <MobileNavLink to="/feed" icon={<Home size={18} />} label="Feed" />
                    <MobileNavLink to="/projects" icon={<Briefcase size={18} />} label="Projects" />
                    <MobileNavLink to="/opportunities" icon={<Award size={18} />} label="Opportunities" />
                    <MobileNavLink to="/people" icon={<Users size={18} />} label="People" />
                    <MobileNavLink to="/events" icon={<Calendar size={18} />} label="Events" />
                    <MobileNavLink to="/clubs" icon={<Users size={18} />} label="Clubs" />
                    <MobileNavLink to="/portfolios" icon={<FileText size={18} />} label="Portfolios" />
                    <MobileNavLink to="/tutorials" icon={<BookOpen size={18} />} label="Tutorials" />
                    {isAdmin && (
                      <MobileNavLink to="/admin" icon={<Settings size={18} />} label="Admin" />
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex items-center space-x-1 text-white px-2 hover:text-sage-800 transition-colors"
  >
    {icon}
    <span>{label}</span>
  </Link>
);

const MobileNavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
  <Link
    to={to}
    className="flex items-center space-x-3 text-sage-600 hover:text-sage-800 transition-colors p-2 rounded-md hover:bg-sage-50"
  >
    {icon}
    <span className="text-base">{label}</span>
  </Link>
);

export default Navbar;
