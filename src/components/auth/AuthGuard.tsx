import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Checking auth session:", session);
        
        if (!session) {
          if (!location.pathname.includes('/auth/')) {
            console.log("No session found, redirecting to signin");
            navigate("/auth/signin", { replace: true });
          }
        } else {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (!location.pathname.includes('/auth/')) {
          navigate("/auth/signin", { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        if (session) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          if (!location.pathname.includes('/auth/')) {
            navigate("/auth/signin", { replace: true });
          }
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

  if (!isAuthenticated && !location.pathname.includes('/auth/')) {
    return null;
  }

  return <>{children}</>;
}