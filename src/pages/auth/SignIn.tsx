import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Attempting sign in for email:", email.trim());
      
      // First check if the user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('email', email.trim())
        .maybeSingle();

      if (profileError) {
        console.error("Error checking profile:", profileError);
      }

      console.log("Profile check result:", profile);

      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        console.error("Sign in error:", error);
        throw error;
      }

      if (!data.user || !data.session) {
        throw new Error("No user data returned from authentication");
      }

      console.log("Sign in successful:", data.user);
      
      toast({
        title: "Success!",
        description: "You have successfully signed in.",
      });
      
      navigate("/feed");
    } catch (error: any) {
      console.error("Sign in process error:", error);
      let errorMessage = "An error occurred during sign in.";
      
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email address before signing in.";
      } else if (error.message.includes("Database error")) {
        errorMessage = "There was an issue connecting to the database. Please try again later.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-sage-600 hover:bg-sage-700"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/auth/signup")}
          >
            Don't have an account? Sign up
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}