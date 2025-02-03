import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { validateSignUpForm } from "@/utils/auth-validation";

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

    try {
      // Validate form
      const errors = validateSignUpForm(formData);
      if (errors.length > 0) {
        throw new Error(errors[0]);
      }

      console.log("Starting signup process for:", { 
        email: formData.email.trim(),
        role: formData.role 
      });

      // First check if user already exists
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(
        formData.email.trim()
      );

      if (existingUser) {
        throw new Error("An account with this email already exists");
      }

      // Validate role
      const validRoles = ["student", "faculty", "investor", "alumni"];
      if (!validRoles.includes(formData.role)) {
        throw new Error("Invalid role selected");
      }

      // Attempt signup with metadata
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name.trim(),
            role: formData.role,
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

      // Verify profile creation
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error("Profile verification error:", profileError);
        // Don't throw here, just log the error
      } else {
        console.log("Profile created successfully:", profile);
      }

      // Show success message
      toast({
        title: "Registration Successful!",
        description: "You can now sign in to your account.",
      });
      
      // Redirect to signin page
      navigate("/auth/signin");
    } catch (error: any) {
      console.error("Signup process error:", error);
      
      let errorMessage = "An error occurred during signup.";
      
      if (error.message.includes("duplicate key")) {
        errorMessage = "An account with this email already exists.";
      } else if (error.message.includes("Password")) {
        errorMessage = error.message;
      } else if (error.message.includes("valid email")) {
        errorMessage = "Please enter a valid email address.";
      } else if (error.message.includes("role")) {
        errorMessage = "Please select a valid role.";
      } else {
        errorMessage = error.message;
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
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="text-muted-foreground">
            Enter your details to get started
          </p>
        </div>
        <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} />
        <div className="text-center">
          <Button
            variant="link"
            className="text-sm text-muted-foreground hover:text-foreground"
            onClick={() => navigate("/auth/signin")}
          >
            Already have an account? Sign in
          </Button>
        </div>
      </div>
    </AuthLayout>
  );
}