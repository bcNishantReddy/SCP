import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Users, Calendar, Edit, UserCheck, UserMinus } from "lucide-react";
import Navbar from "@/components/Navbar";
import { format } from "date-fns";
import { useToast } from "@/components/ui/toast";
import { useEffect, useState } from "react";

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentUserId, setCurrentUserId] = useState<string>();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getUser();
  }, []);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      console.log('Fetching project details for id:', id);
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          owner:profiles!projects_user_id_fkey (
            id,
            name,
            title,
            avatar_url
          )
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching project:', error);
        throw error;
      }
      console.log('Project data:', data);
      return data;
    },
  });

  const { data: joinRequests } = useQuery({
    queryKey: ['projectJoinRequests', id],
    queryFn: async () => {
      console.log('Fetching join requests for project:', id);
      const { data, error } = await supabase
        .from('project_join_requests')
        .select(`
          *,
          profiles!project_join_requests_user_id_fkey (
            id,
            name,
            title,
            avatar_url
          )
        `)
        .eq('project_id', id);
      
      if (error) {
        console.error('Error fetching join requests:', error);
        throw error;
      }
      console.log('Join requests:', data);
      return data;
    },
  });

  const updateRequestStatus = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string, status: 'approved' | 'rejected' }) => {
      const { error } = await supabase
        .from('project_join_requests')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectJoinRequests', id] });
      toast({
        title: "Success",
        description: "Request status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update request status",
        variant: "destructive",
      });
    },
  });

  const isOwner = project?.user_id === currentUserId;
  const pendingRequests = joinRequests?.filter(req => req.status === 'pending') || [];
  const approvedRequests = joinRequests?.filter(req => req.status === 'approved') || [];

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

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Project not found</h1>
            <Button 
              className="mt-4"
              onClick={() => navigate('/projects')}
            >
              Back to Projects
            </Button>
          </div>
        </main>
      </div>
    );
  }

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
            <div className="h-64 bg-emerald-500 rounded-lg mb-6" />
          )}

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              <Badge variant="secondary" className="mb-4">
                {project.category}
              </Badge>
            </div>
            {isOwner && (
              <Button variant="outline" onClick={() => navigate(`/projects/${id}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            )}
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
            </div>
            
            <div className="space-y-4">
              {/* Project Owner */}
              {project.owner && (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0">
                    {project.owner.avatar_url ? (
                      <img 
                        src={project.owner.avatar_url} 
                        alt={project.owner.name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-emerald-200 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-medium">
                          {project.owner.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{project.owner.name}</h3>
                    <p className="text-sm text-muted-foreground">Project Owner • {project.owner.title}</p>
                  </div>
                </div>
              )}

              {/* Approved Team Members */}
              {approvedRequests.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex-shrink-0">
                    {member.profiles?.avatar_url ? (
                      <img 
                        src={member.profiles.avatar_url} 
                        alt={member.profiles.name}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-emerald-200 rounded-full flex items-center justify-center">
                        <span className="text-emerald-700 font-medium">
                          {member.profiles?.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{member.profiles?.name}</h3>
                    <p className="text-sm text-muted-foreground">Team Member • {member.profiles?.title}</p>
                  </div>
                </div>
              ))}

              {/* Pending Requests - Only visible to owner */}
              {isOwner && pendingRequests.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Pending Requests</h3>
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mb-2">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {request.profiles?.avatar_url ? (
                            <img 
                              src={request.profiles.avatar_url} 
                              alt={request.profiles.name}
                              className="h-12 w-12 rounded-full"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-emerald-200 rounded-full flex items-center justify-center">
                              <span className="text-emerald-700 font-medium">
                                {request.profiles?.name?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{request.profiles?.name}</h3>
                          <p className="text-sm text-muted-foreground">{request.profiles?.title}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRequestStatus.mutate({ requestId: request.id, status: 'approved' })}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateRequestStatus.mutate({ requestId: request.id, status: 'rejected' })}
                        >
                          <UserMinus className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  {approvedRequests.length + 1} team members
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