import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      } catch (error: any) {
        console.error("Auth error:", error);
        
        // Handle specific auth errors
        if (error.message?.includes('refresh_token_not_found')) {
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive",
          });
        }
        
        if (!location.pathname.includes('/auth/')) {
          navigate("/auth/signin", { replace: true });
        }
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial auth check
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          setIsAuthenticated(false);
          if (!location.pathname.includes('/auth/')) {
            navigate("/auth/signin", { replace: true });
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
        }
      }
    );

    // Cleanup subscription
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