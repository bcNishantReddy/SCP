import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
        .select("*, profile:profiles(name)")
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

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : null;
  };

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

  if (!tutorial) {
    return (
      <div className="min-h-screen bg-sage-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-sage-800">Tutorial not found</h1>
              <Button
                variant="ghost"
                onClick={() => navigate('/tutorials')}
                className="mt-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tutorials
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const embedUrl = getYouTubeEmbedUrl(tutorial.video_url);

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/tutorials')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Button>

          {embedUrl && (
            <div className="aspect-video w-full mb-8">
              <iframe
                src={embedUrl}
                title={tutorial.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full rounded-lg shadow-lg"
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-sage-800">{tutorial.title}</h1>
              
              {tutorial.profile?.name && (
                <p className="text-sage-600">
                  Created by {tutorial.profile.name}
                </p>
              )}

              {tutorial.category && (
                <div className="inline-block bg-sage-100 text-sage-800 px-3 py-1 rounded-full text-sm">
                  {tutorial.category}
                </div>
              )}

              <div className="prose max-w-none">
                <p className="text-sage-600 whitespace-pre-wrap">{tutorial.content}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TutorialDetails;