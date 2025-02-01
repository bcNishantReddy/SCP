import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users } from "lucide-react";
import { EventRegistrationModal } from "@/components/modals/EventRegistrationModal";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { EditEventModal } from "@/components/modals/EditEventModal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const EventDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:user_id (name, avatar_url, role),
          event_registrations (
            id,
            user:user_id (
              id,
              name,
              avatar_url,
              role
            )
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      navigate("/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  const isOwner = user?.id === event.user_id;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-64 bg-sage-200" />
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold">{event.title}</h1>
            {isOwner && (
              <div className="flex space-x-2">
                <EditEventModal event={event} />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Event</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Event</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this event? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sage-600 mb-6">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              <span>{format(new Date(event.date), "PPP • p")}</span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              <span>{event.location}</span>
            </div>
          </div>

          <p className="text-sage-600 mb-8">{event.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sage-600">
              <Users className="h-5 w-5 mr-2" />
              <span>{event.event_registrations.length} registered</span>
            </div>
            <EventRegistrationModal />
          </div>

          {event.profiles?.role === "admin" && event.event_registrations.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Registered Users</h2>
              <div className="space-y-4">
                {event.event_registrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center space-x-4 p-4 bg-sage-50 rounded-lg"
                  >
                    <div className="h-10 w-10 rounded-full bg-sage-200 overflow-hidden">
                      {registration.user.avatar_url && (
                        <img
                          src={registration.user.avatar_url}
                          alt={registration.user.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{registration.user.name}</p>
                      <p className="text-sm text-sage-600 capitalize">
                        {registration.user.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EventDetailsSkeleton = () => (
  <div className="max-w-4xl mx-auto p-6">
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Skeleton className="h-64 w-full" />
      <div className="p-6">
        <Skeleton className="h-8 w-2/3 mb-4" />
        <div className="space-y-4 mb-6">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
        </div>
        <Skeleton className="h-24 w-full mb-8" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  </div>
);