import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Calendar, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

export function OpportunityDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("opportunities")
        .select(`
          *,
          profiles:user_id (
            name,
            role
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!opportunity) {
    return <div>Opportunity not found</div>;
  }

  const isOwner = user?.id === opportunity.user_id;
  const isExpired = opportunity.deadline ? new Date(opportunity.deadline) < new Date() : false;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-6">
        <h1 className="text-3xl font-bold text-sage-800">{opportunity.title}</h1>
        {isOwner && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/opportunities/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={async () => {
                const { error } = await supabase
                  .from("opportunities")
                  .delete()
                  .eq("id", id);

                if (error) {
                  toast({
                    title: "Error",
                    description: "Failed to delete opportunity",
                    variant: "destructive",
                  });
                } else {
                  toast({
                    title: "Success",
                    description: "Opportunity deleted successfully",
                  });
                  navigate("/opportunities");
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex items-center text-sage-600">
          <Calendar className="h-5 w-5 mr-2" />
          {opportunity.deadline ? (
            <span>
              Deadline: {format(new Date(opportunity.deadline), "PPP")}
              {isExpired && (
                <span className="ml-2 text-red-500 font-medium">(Closed)</span>
              )}
            </span>
          ) : (
            <span>No deadline specified</span>
          )}
        </div>

        <div className="prose max-w-none">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="whitespace-pre-wrap">{opportunity.description}</p>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Posted by</h2>
          <div className="flex items-center gap-2">
            <span className="font-medium">{opportunity.profiles.name}</span>
            <span className="text-sage-500">({opportunity.profiles.role})</span>
          </div>
        </div>

        {!isExpired && (
          <div className="mt-8">
            <Button className="w-full sm:w-auto bg-sage-600 hover:bg-sage-700">
              <LinkIcon className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}