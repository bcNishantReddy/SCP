import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, MapPin, Users } from "lucide-react";
import { CreateEventModal } from "@/components/modals/CreateEventModal";
import { EventRegistrationModal } from "@/components/modals/EventRegistrationModal";

const Events = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Events</h1>
            <CreateEventModal />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search events..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((event) => (
              <div
                key={event}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-sage-200" />
                <div className="p-4">
                  <div className="flex items-center space-x-2 text-sage-600 text-sm mb-2">
                    <Calendar className="h-4 w-4" />
                    <span>Mar 15, 2024 • 2:00 PM</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Event Title</h3>
                  <p className="text-sage-600 text-sm mb-4">
                    A brief description of the event and what participants can expect.
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-sage-500 mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Location</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>50 attending</span>
                    </div>
                  </div>
                  <EventRegistrationModal />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Events;