import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const PendingApprovalsSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingUsers } = useQuery({
    queryKey: ["pendingUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false);

      if (error) throw error;
      return data;
    },
  });

  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      console.log("Approving user:", userId);
      
      // First update the user's approval status
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (updateError) throw updateError;

      // Get the admin's profile ID from the profiles table
      const { data: adminProfile, error: profileError } = await supabase
        .from("profiles")
        .select("id, role")
        .eq("role", "admin")
        .single();

      if (profileError) {
        console.error("Error getting admin profile:", profileError);
        throw profileError;
      }

      if (!adminProfile) {
        throw new Error("Admin profile not found");
      }

      if (adminProfile.role !== 'admin') {
        throw new Error("User is not an admin");
      }

      console.log("Logging admin action with admin profile:", adminProfile.id);
      
      // Use the admin's profile ID for the admin_actions record
      const { error: logError } = await supabase
        .from("admin_actions")
        .insert({
          admin_id: adminProfile.id,
          action_type: "approve_user",
          target_table: "profiles",
          target_id: userId,
          details: { action: "approved_user" }
        });

      if (logError) {
        console.error("Error logging admin action:", logError);
        throw logError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      toast({
        title: "Success",
        description: "User approved successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error in approveUser mutation:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        Pending Approvals
      </h2>
      <div className="space-y-4">
        {pendingUsers?.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 bg-sage-50 rounded-lg"
          >
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-sage-600">{user.email}</p>
              <p className="text-sm text-sage-500 capitalize">{user.role}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-green-600"
                onClick={() => approveUser.mutate(user.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </div>
          </div>
        ))}
        {pendingUsers?.length === 0 && (
          <p className="text-center text-sage-500">
            No pending approvals
          </p>
        )}
      </div>
    </div>
  );
};