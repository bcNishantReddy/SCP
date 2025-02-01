import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { AddProjectModal } from "@/components/modals/AddProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string>();
  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getUser();
  }, []);

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('projects')
        .select('*');
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  if (error) {
    toast({
      title: "Error",
      description: "Failed to load projects",
      variant: "destructive",
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-foreground">Projects</h1>
            <AddProjectModal />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[300px] bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects?.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  currentUserId={currentUserId}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;