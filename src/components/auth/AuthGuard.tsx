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
          // Only redirect to signin if not already there
          if (!location.pathname.includes('/auth/')) {
            console.log("No session found, redirecting to signin");
            navigate("/auth/signin");
          }
        } else if (location.pathname.includes('/auth/')) {
          // If authenticated and trying to access auth pages, redirect to feed
          console.log("User is authenticated, redirecting to feed");
          navigate("/feed");
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (!location.pathname.includes('/auth/')) {
          navigate("/auth/signin");
        }
      } finally {
        setIsLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        if (!session && !location.pathname.includes('/auth/')) {
          navigate("/auth/signin");
        } else if (session && location.pathname.includes('/auth/')) {
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