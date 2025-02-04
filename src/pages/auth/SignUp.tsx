import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { validateSignUpForm } from "@/utils/auth-validation";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignUp = async (formData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    setIsLoading(true);
    console.log("Starting signup process for:", { 
      email: formData.email.trim(),
      role: formData.role || 'student'
    });

    try {
      // First check if user already exists in profiles
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email.trim())
        .maybeSingle();

      if (profileError) {
        console.error("Error checking existing profile:", profileError);
        throw new Error("Failed to verify account availability");
      }

      if (existingProfile) {
        throw new Error("An account with this email already exists");
      }

      // Validate form data
      const errors = validateSignUpForm(formData);
      if (errors.length > 0) {
        throw new Error(errors[0]);
      }

      // Ensure role is valid
      const role = formData.role ? formData.role as UserRole : 'student';

      // Attempt signup
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            role: role,
          },
        },
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("No user data returned from signup");
      }

      console.log("Signup successful:", data.user);

      toast({
        title: "Welcome to Boss Y!",
        description: "Your account has been created successfully. Please check your email to verify your account.",
      });
      
      navigate("/auth/signin");
    } catch (error: any) {
      console.error("Signup process error:", error);
      
      let errorMessage = "An error occurred during signup.";
      
      if (error.message?.includes("duplicate key") || 
          error.message?.includes("already registered") ||
          error.message?.includes("already exists")) {
        errorMessage = "An account with this email already exists.";
      } else if (error.message?.includes("Password")) {
        errorMessage = "Password must be at least 6 characters long.";
      } else if (error.message?.includes("valid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message?.includes("role")) {
        errorMessage = "Please select a valid role.";
      } else if (error.message?.includes("Database error")) {
        errorMessage = "There was an issue creating your account. Please try again.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }
      
      toast({
        title: "Sign up failed",
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
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">
            Join Boss Y to get started
          </p>
        </div>
        <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/auth/signin")}
            disabled={isLoading}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}