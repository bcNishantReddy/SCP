import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
      console.log('Fetching join requests for project:', project.id);
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

  const handleViewDetails = () => {
    navigate(`/projects/${project.id}`);
  };

  // Get the current user's join request status
  const userJoinRequest = joinRequests?.find(
    request => request.user_id === currentUserId
  );

  // Calculate member count (including owner)
  const approvedMembers = joinRequests?.filter(request => request.status === 'approved').length || 0;
  const memberCount = approvedMembers + 1; // +1 for the owner

  // Truncate title and description
  const truncatedTitle = project.title.length > 50 
    ? project.title.substring(0, 50) + '...'
    : project.title;

  const truncatedDescription = project.description.length > 100
    ? project.description.substring(0, 100) + '...'
    : project.description;

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
            <CardTitle className="text-xl">{truncatedTitle}</CardTitle>
            <Badge variant="secondary" className="mt-2">
              {project.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">
          {truncatedDescription}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm text-muted-foreground">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
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
          {!isOwner && !userJoinRequest && (
            <Button 
              onClick={handleJoinRequest} 
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Request to Join
            </Button>
          )}
          {!isOwner && userJoinRequest?.status === 'pending' && (
            <Badge variant="secondary" className="px-4 py-2">
              Request Pending
            </Badge>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};