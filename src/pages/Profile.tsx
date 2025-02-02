import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Edit, Mail, Link2, MapPin, Building2, Calendar } from "lucide-react";
import { EditProfileModal } from "@/components/modals/EditProfileModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioCard } from "@/components/portfolios/PortfolioCard";
import { ProjectCard } from "@/components/projects/ProjectCard";

const Profile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the ID from URL if viewing another user's profile
  const [currentUserId, setCurrentUserId] = useState<string>();

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id);
    };
    getCurrentUser();
  }, []);

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile', id || currentUserId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user && !id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('profiles')
        .select('*, portfolios(*), projects(*)')
        .eq('id', id || user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!currentUserId || !!id
  });

  // Fetch user's portfolios
  const { data: portfolios, isLoading: portfoliosLoading } = useQuery({
    queryKey: ['userPortfolios'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch user's projects
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['userProjects'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // Check if profile needs to be completed
  useEffect(() => {
    if (profile && !profile.name) {
      console.log("Profile needs to be completed");
    }
  }, [profile]);

  if (profileLoading || portfoliosLoading || projectsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="pt-16">
        {/* Cover Image */}
        <div 
          className="h-32 md:h-64 bg-sage-200 transition-all duration-300 bg-cover bg-center"
          style={profile?.banner_url ? { backgroundImage: `url(${profile.banner_url})` } : {}}
        />

        {/* Back Button (when viewing other's profile) */}
        {!isOwnProfile && (
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        )}

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

            {/* Portfolios Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">My Portfolios</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {portfolios?.map((portfolio) => (
                  <PortfolioCard
                    key={portfolio.id}
                    portfolio={portfolio}
                    currentUserId={profile?.id}
                    onDelete={() => {
                      // Refetch portfolios after deletion
                      window.location.reload();
                    }}
                  />
                ))}
                {portfolios?.length === 0 && (
                  <p className="text-sage-600 col-span-2">No portfolios yet.</p>
                )}
              </div>
            </div>

            {/* Projects Section */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">My Projects</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects?.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    currentUserId={profile?.id}
                    onDelete={() => {
                      // Refetch projects after deletion
                      window.location.reload();
                    }}
                  />
                ))}
                {projects?.length === 0 && (
                  <p className="text-sage-600 col-span-2">No projects yet.</p>
                )}
              </div>
            </div>

            {/* Experience Section */}
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
