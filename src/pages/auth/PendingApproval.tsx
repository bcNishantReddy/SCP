import { AuthLayout } from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

export default function PendingApproval() {
  const navigate = useNavigate();

  return (
    <AuthLayout className="text-center">
      <div className="space-y-6">
        <div className="flex justify-center">
          <Clock className="h-16 w-16 text-sage-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Pending Approval
          </h1>
          <p className="text-muted-foreground">
            Your account is currently pending admin approval. You'll receive an
            email once your account has been approved.
          </p>
        </div>
        <Button
          variant="outline"
          className="hover-effect"
          onClick={() => navigate("/auth/signin")}
        >
          Return to Sign In
        </Button>
      </div>
    </AuthLayout>
  );
}