import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
            navigate("/auth/signin", { 
              replace: true,
              state: { from: location.pathname }  // Save the attempted path
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

        if (!profile.is_approved) {
          console.log("User not approved, redirecting to pending page");
          await supabase.auth.signOut();
          navigate("/auth/pending", { replace: true });
          setIsAuthenticated(false);
          return;
        }

        // Attempt to refresh the session if it's close to expiring
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
            state: { from: location.pathname }
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        
        if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          if (!location.pathname.includes('/auth/')) {
            navigate("/auth/signin", { 
              replace: true,
              state: { from: location.pathname }
            });
          }
        } else if (event === 'SIGNED_IN') {
          // Check if user is approved when they sign in
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('is_approved')
              .eq('id', session.user.id)
              .single();

            if (profile?.is_approved) {
              setIsAuthenticated(true);
              // Redirect to the saved path if it exists
              const savedPath = location.state?.from || '/feed';
              navigate(savedPath, { replace: true });
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
  }, [navigate, location.pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-sage-600" />
          <p className="text-sage-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !location.pathname.includes('/auth/')) {
    return null;
  }

  return <>{children}</>;
}