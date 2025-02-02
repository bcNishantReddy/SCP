import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-sage-800">Welcome to Our Platform</h1>
        <p className="text-sage-600 max-w-md mx-auto">
          Connect with others, share ideas, and grow together.
        </p>
        <div className="space-x-4">
          <Button 
            onClick={() => navigate("/auth/signin")}
            className="bg-sage-600 hover:bg-sage-700"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/auth/signup")}
            variant="outline"
          >
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}