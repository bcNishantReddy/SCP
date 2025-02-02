import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found, redirecting to signin");
          navigate("/auth/signin");
        } else if (location.pathname === "/" || location.pathname === "/auth/signin") {
          console.log("User is authenticated, redirecting to feed");
          navigate("/feed");
        }
      } catch (error) {
        console.error("Auth error:", error);
        navigate("/auth/signin");
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        if (!session) {
          navigate("/auth/signin");
        } else if (location.pathname === "/" || location.pathname === "/auth/signin") {
          navigate("/feed");
        }
      }
    );

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}