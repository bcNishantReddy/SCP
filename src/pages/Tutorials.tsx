import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Play, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Tutorials = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: tutorials, isLoading } = useQuery({
    queryKey: ["tutorials"],
    queryFn: async () => {
      console.log("Fetching tutorials...");
      const { data, error } = await supabase
        .from("tutorials")
        .select("*")
        .ilike("title", `%${searchQuery}%`);

      if (error) {
        console.error("Error fetching tutorials:", error);
        toast({
          title: "Error",
          description: "Failed to load tutorials",
          variant: "destructive",
        });
        throw error;
      }

      console.log("Fetched tutorials:", data);
      return data;
    },
  });

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Tutorials</h1>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search tutorials..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-sm h-[300px] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorials?.map((tutorial) => (
                <div
                  key={tutorial.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/tutorials/${tutorial.id}`)}
                >
                  <div className="relative">
                    <div className="h-48 bg-sage-200">
                      {tutorial.video_url && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                        >
                          <Play className="h-6 w-6 text-sage-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center space-x-2 text-sage-600 text-sm mb-2">
                      <BookOpen className="h-4 w-4" />
                      <span>{tutorial.category || "General"}</span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{tutorial.title}</h3>
                    <p className="text-sage-600 text-sm mb-4 line-clamp-2">
                      {tutorial.content}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-sage-500">
                        <Clock className="h-4 w-4" />
                        <span>5 min read</span>
                      </div>
                      <Button variant="outline" className="text-sage-600 hover:text-sage-700">
                        Start Tutorial
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Tutorials;