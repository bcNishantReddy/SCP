import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, Trash } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: event, isLoading } = useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          profile:profiles(name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const deleteEvent = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      navigate('/events');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const isOwner = user?.id === event.user_id;

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/events')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Events
            </Button>
            {isOwner && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {/* Add edit functionality */}}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Event
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteEvent.mutate()}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Event
                </Button>
              </div>
            )}
          </div>

          {event.banner_url && (
            <div className="w-full h-64 mb-6 rounded-lg overflow-hidden">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-sage-600">
                Organized by {event.profile?.name}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-2">Date & Time</h2>
                <p>{new Date(event.date).toLocaleString()}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Location</h2>
                <p>{event.location}</p>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>

              {event.registration_url && (
                <div className="pt-4">
                  <Button
                    className="w-full sm:w-auto"
                    onClick={() => window.open(event.registration_url, '_blank')}
                  >
                    Register Now
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}