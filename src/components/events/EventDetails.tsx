import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Users } from "lucide-react";
import { EventRegistrationModal } from "@/components/modals/EventRegistrationModal";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const EventDetails = () => {
  const { id } = useParams();

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select(`
          *,
          profiles:user_id (name, avatar_url),
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
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <EventDetailsSkeleton />;
  }

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="h-64 bg-sage-200" />
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">{event.title}</h1>
          
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