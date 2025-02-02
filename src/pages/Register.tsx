import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Register = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-sage-50">
      <div className="bg-white p-8 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-sage-800 mb-6">Register</h1>
        <Button onClick={() => navigate("/auth/signup")}>Go to Sign Up</Button>
      </div>
    </div>
  );
};

export default Register;