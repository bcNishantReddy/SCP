
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Mail, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

const roles: { value: UserRole; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "investor", label: "Investor" },
  { value: "alumni", label: "Alumni" },
];

interface SignUpFormProps {
  onSubmit: (formData: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
  }) => Promise<void>;
  isLoading: boolean;
}

export function SignUpForm({ onSubmit, isLoading }: SignUpFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student" as UserRole,
  });
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    console.log("Validating form data:", { 
      ...formData, 
      password: "REDACTED" 
    });
    
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.password) {
      setError("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }
    if (!/\d/.test(formData.password)) {
      setError("Password must contain at least one number");
      return false;
    }
    if (!roles.some(r => r.value === formData.role)) {
      console.error("Invalid role selected:", formData.role);
      setError("Please select a valid role");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    console.log("Starting form submission with data:", { 
      ...formData, 
      password: "REDACTED"
    });

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    try {
      const cleanedData = {
        ...formData,
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role,
      };
      console.log("Submitting cleaned form data:", { 
        ...cleanedData, 
        password: "REDACTED" 
      });
      
      await onSubmit(cleanedData);
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage = error.message || "An error occurred during sign up";
      console.error("Setting error message:", errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="bg-red-50/50 backdrop-blur-sm">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <div className="relative">
          <User className="absolute left-3 top-3 h-5 w-5 text-sage-500" />
          <Input
            id="name"
            placeholder="John Doe"
            className="pl-10 bg-white/50 border-sage-200 focus:border-sage-400 focus:ring-sage-400"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-5 w-5 text-sage-500" />
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            className="pl-10 bg-white/50 border-sage-200 focus:border-sage-400 focus:ring-sage-400"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-5 w-5 text-sage-500" />
          <Input
            id="password"
            type="password"
            className="pl-10 bg-white/50 border-sage-200 focus:border-sage-400 focus:ring-sage-400"
            placeholder="Min. 6 characters"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={isLoading}
            required
            minLength={6}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Select
          value={formData.role}
          onValueChange={(value: UserRole) =>
            setFormData({ ...formData, role: value })
          }
          disabled={isLoading}
          required
        >
          <SelectTrigger className="bg-white/50 border-sage-200 focus:border-sage-400 focus:ring-sage-400">
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            {roles.map((role) => (
              <SelectItem key={role.value} value={role.value}>
                {role.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-sage-600 to-sage-700 hover:from-sage-700 hover:to-sage-800 text-white shadow-lg"
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
