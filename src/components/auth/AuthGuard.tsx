import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
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
          setIsAuthenticated(false);
          return;
        }

        // Check if user is approved
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
          throw profileError;
        }

        if (!profile?.is_approved) {
          console.log("User not approved, redirecting to pending page");
          await supabase.auth.signOut();
          navigate("/auth/pending", { replace: true });
          setIsAuthenticated(false);
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
        setIsAuthenticated(true);
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
          setIsAuthenticated(false);
        }
        
        if (!location.pathname.includes('/auth/')) {
          navigate("/auth/signin", { 
            replace: true,
            state: { returnTo: location.pathname }
          });
        }
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          if (!location.pathname.includes('/auth/')) {
            navigate("/auth/signin", { replace: true });
          }
        } else if (event === 'SIGNED_IN') {
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_approved')
              .eq('id', session.user.id)
              .single();

            if (profile?.is_approved) {
              setIsAuthenticated(true);
              // Check if there's a return path after successful sign in
              const returnTo = location.state?.returnTo;
              if (returnTo && location.pathname === '/auth/signin') {
                navigate(returnTo, { replace: true });
              }
            } else {
              navigate("/auth/pending", { replace: true });
              setIsAuthenticated(false);
            }
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location, toast]);

  if (!isAuthenticated && !location.pathname.includes('/auth/')) {
    return null;
  }

  return <>{children}</>;
}