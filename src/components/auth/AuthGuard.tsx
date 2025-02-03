import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Starting auth check...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log("No session found, redirecting to signin");
          if (!location.pathname.includes('/auth/')) {
            navigate("/auth/signin", { 
              replace: true,
              state: { returnTo: location.pathname }
            });
          }
          if (mounted) setIsAuthenticated(false);
          return;
        }

        // Session refresh logic
        const expiresAt = session?.expires_at ?? 0;
        const timeNow = Math.floor(Date.now() / 1000);
        
        if (expiresAt - timeNow < 300) {
          console.log("Session about to expire, refreshing...");
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
        }
        
        console.log("Authentication check completed successfully");
        if (mounted) setIsAuthenticated(true);

        // Check if there's a return path after successful sign in
        const returnTo = location.state?.returnTo;
        if (returnTo && location.pathname === '/auth/signin') {
          navigate(returnTo, { replace: true });
        }

      } catch (error: any) {
        console.error("Auth error:", error);
        
        if (error.message?.includes('session_not_found') || 
            error.message?.includes('refresh_token_not_found')) {
          toast({
            title: "Session Expired",
            description: "Please sign in again",
            variant: "destructive",
          });
          
          await supabase.auth.signOut();
          if (mounted) setIsAuthenticated(false);
        }
        
        if (!location.pathname.includes('/auth/')) {
          navigate("/auth/signin", { 
            replace: true,
            state: { returnTo: location.pathname }
          });
        }
      }
    };

    // Initial auth check
    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          if (mounted) setIsAuthenticated(false);
          if (!location.pathname.includes('/auth/')) {
            navigate("/auth/signin", { replace: true });
          }
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            if (mounted) setIsAuthenticated(true);
            // Check if there's a return path after successful sign in
            const returnTo = location.state?.returnTo;
            if (returnTo && location.pathname === '/auth/signin') {
              navigate(returnTo, { replace: true });
            }
          }
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return null;
  }

  // If not authenticated and not on an auth page, show nothing
  if (!isAuthenticated && !location.pathname.includes('/auth/')) {
    return null;
  }

  // If authenticated or on auth page, render children
  return <>{children}</>;
}