import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TutorialDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: tutorial, isLoading } = useQuery({
    queryKey: ["tutorial", id],
    queryFn: async () => {
      console.log("Fetching tutorial details...");
      const { data, error } = await supabase
        .from("tutorials")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching tutorial:", error);
        toast({
          title: "Error",
          description: "Failed to load tutorial details",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Fetched tutorial:", data);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-20">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-sage-200 rounded w-1/3 mb-4" />
            <div className="h-64 bg-sage-200 rounded mb-4" />
            <div className="h-4 bg-sage-200 rounded mb-2" />
            <div className="h-4 bg-sage-200 rounded w-2/3" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate("/tutorials")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Button>

          <h1 className="text-3xl font-bold text-sage-800 mb-6">{tutorial?.title}</h1>

          {tutorial?.video_url && (
            <div className="relative aspect-video bg-sage-200 rounded-lg mb-6">
              <Button
                size="icon"
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
              >
                <Play className="h-6 w-6 text-sage-600" />
              </Button>
            </div>
          )}

          <div className="prose max-w-none">
            <p className="text-sage-600">{tutorial?.content}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorialDetails;