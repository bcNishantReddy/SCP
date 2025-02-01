import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Edit } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    category: string;
    banner_url: string | null;
    user_id: string;
  };
  currentUserId: string | undefined;
}

export const ProjectCard = ({ project, currentUserId }: ProjectCardProps) => {
  const { toast } = useToast();

  // Fetch join requests for this project
  const { data: joinRequests } = useQuery({
    queryKey: ['projectJoinRequests', project.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_join_requests')
        .select('*')
        .eq('project_id', project.id);
      
      if (error) throw error;
      return data;
    },
  });

  const handleJoinRequest = async () => {
    try {
      const { error } = await supabase
        .from('project_join_requests')
        .insert({
          project_id: project.id,
          user_id: currentUserId,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Join request sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive",
      });
    }
  };

  const isOwner = project.user_id === currentUserId;
  const hasRequestedToJoin = joinRequests?.some(
    request => request.user_id === currentUserId
  );

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {project.banner_url && (
        <div 
          className="h-48 bg-cover bg-center rounded-t-lg" 
          style={{ backgroundImage: `url(${project.banner_url})` }}
        />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{project.title}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {project.category}
            </Badge>
          </div>
          {isOwner && (
            <Button variant="ghost" size="icon">
              <Edit className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">
          {project.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {joinRequests?.length || 0} members
          </span>
        </div>
        {!isOwner && !hasRequestedToJoin && (
          <Button onClick={handleJoinRequest}>
            Request to Join
          </Button>
        )}
        {hasRequestedToJoin && (
          <Badge variant="secondary">Request Pending</Badge>
        )}
      </CardFooter>
    </Card>
  );
};