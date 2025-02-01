import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Edit, ExternalLink, UserPlus, Eye } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const isOwner = project.user_id === currentUserId;

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
          status: 'pending'
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

  const hasRequestedToJoin = joinRequests?.some(
    request => request.user_id === currentUserId
  );

  const handleViewDetails = () => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      {project.banner_url ? (
        <div 
          className="h-48 bg-cover bg-center rounded-t-lg" 
          style={{ backgroundImage: `url(${project.banner_url})` }}
        />
      ) : (
        <div className="h-48 bg-emerald-500 rounded-t-lg" />
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${project.id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate(`/projects/${project.id}/team`)}>
                <Users className="h-4 w-4 mr-2" />
                Manage Team
              </Button>
            </div>
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleViewDetails}
            className="hover:bg-secondary"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {!isOwner && !hasRequestedToJoin && (
            <Button 
              onClick={handleJoinRequest} 
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Request to Join
            </Button>
          )}
          {hasRequestedToJoin && (
            <Badge variant="secondary" className="px-4 py-2">
              Request Pending
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};