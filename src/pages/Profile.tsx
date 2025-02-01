import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Edit, Mail, Link2, MapPin, Building2, Calendar } from "lucide-react";
import { EditProfileModal } from "@/components/modals/EditProfileModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const navigate = useNavigate();

  // Fetch current user's profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Check if profile needs to be completed
  useEffect(() => {
    if (profile && !profile.name) {
      // Show toast or modal prompting user to complete profile
      console.log("Profile needs to be completed");
    }
  }, [profile]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="pt-16">
        {/* Cover Image */}
        <div className="h-32 md:h-64 bg-sage-200 transition-all duration-300" />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="relative -mt-16 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 md:gap-6">
                  <div className="flex flex-col md:flex-row items-center md:space-x-4">
                    <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-sage-300 border-4 border-white shrink-0">
                      {profile?.avatar_url && (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.name || "Profile"} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      )}
                    </div>
                    <div className="text-center md:text-left mt-4 md:mt-0">
                      <h1 className="text-xl md:text-2xl font-bold text-sage-800">
                        {profile?.name || profile?.email}
                      </h1>
                      <p className="text-sage-600">{profile?.title || "No title set"}</p>
                    </div>
                  </div>
                  <EditProfileModal />
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-sage-600 mt-4">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    <span className="break-all">{profile?.email}</span>
                  </div>
                  {profile?.title && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{profile.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <p className="text-sage-600">
                {profile?.bio || "No bio added yet. Click Edit Profile to add one!"}
              </p>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Experience</h2>
              <div className="space-y-6">
                {[1, 2].map((exp) => (
                  <div key={exp} className="flex flex-col md:flex-row md:space-x-4">
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <div className="h-12 w-12 rounded bg-sage-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-sage-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">Position Title</h3>
                      <p className="text-sage-600">Company Name</p>
                      <div className="flex items-center text-sm text-sage-500 mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        Jan 2023 - Present
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;