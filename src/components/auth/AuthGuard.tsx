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
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Checking auth session:", session);
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          if (!location.pathname.includes('/auth/')) {
            console.log("No session found, redirecting to signin");
            navigate("/auth/signin", { replace: true });
          }
          setIsAuthenticated(false);
        } else {
          // Attempt to refresh the session if it's close to expiring
          const expiresAt = session?.expires_at ?? 0;
          const timeNow = Math.floor(Date.now() / 1000);
          
          if (expiresAt - timeNow < 300) { // Increased to 5 minutes for safety
            console.log("Session about to expire, refreshing...");
            try {
              const { data: { session: refreshedSession }, error: refreshError } = 
                await supabase.auth.refreshSession();
                
              if (refreshError) {
                console.error("Session refresh error:", refreshError);
                throw refreshError;
              }
              
              if (!refreshedSession) {
                throw new Error("Failed to refresh session");
              }
              
              console.log("Session refreshed successfully");
            } catch (refreshError) {
              console.error("Failed to refresh session:", refreshError);
              throw refreshError;
            }
          }
          
          setIsAuthenticated(true);
        }
      } catch (error: any) {
        console.error("Auth error:", error);
        
        // Handle specific error cases
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('refresh_token_not_found')) {
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive",
          });
          
          // Clear any existing session data
          await supabase.auth.signOut();
          setIsAuthenticated(false);
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
        
        if (event === 'SIGNED_OUT') {
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