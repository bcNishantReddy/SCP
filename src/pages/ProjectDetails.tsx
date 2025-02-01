import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Edit } from "lucide-react";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";

const ProjectDetails = () => {
  const { id } = useParams();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          profiles:user_id (
            name,
            title,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: collaborators } = useQuery({
    queryKey: ['projectCollaborators', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_join_requests')
        .select(`
          *,
          profiles:user_id (
            name,
            title,
            avatar_url
          )
        `)
        .eq('project_id', id)
        .eq('status', 'approved');
      
      if (error) throw error;
      return data;
    },
  });

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-20">
          <div className="animate-pulse">
            <div className="h-64 bg-muted rounded-lg mb-6" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-24 bg-muted rounded" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          {project.banner_url ? (
            <div 
              className="h-64 bg-cover bg-center rounded-lg mb-6" 
              style={{ backgroundImage: `url(${project.banner_url})` }}
            />
          ) : (
            <div className="h-64 bg-sage-500 rounded-lg mb-6" />
          )}

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <Badge variant="secondary" className="mb-4">
                {project.category}
              </Badge>
            </div>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>

          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">About</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {project.description}
            </p>
          </Card>

          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Team</h2>
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
            </div>
            
            <div className="space-y-4">
              {/* Project Owner */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex-shrink-0">
                  {project.profiles.avatar_url ? (
                    <img 
                      src={project.profiles.avatar_url} 
                      alt={project.profiles.name}
                      className="h-12 w-12 rounded-full"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-sage-200 rounded-full flex items-center justify-center">
                      <span className="text-sage-700 font-medium">
                        {project.profiles.name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{project.profiles.name}</h3>
                  <p className="text-sm text-muted-foreground">Project Owner • {project.profiles.title}</p>
                </div>
              </div>

              {/* Collaborators */}
              {collaborators?.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0">
                    {collaborator.profiles.avatar_url ? (
                      <img 
                        src={collaborator.profiles.avatar_url} 
                        alt={collaborator.profiles.name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-sage-200 rounded-full flex items-center justify-center">
                        <span className="text-sage-700 font-medium">
                          {collaborator.profiles.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{collaborator.profiles.name}</h3>
                    <p className="text-sm text-muted-foreground">Collaborator • {collaborator.profiles.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Created on {format(new Date(project.created_at), 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {collaborators?.length || 0} team members
                </span>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ProjectDetails;