import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Edit, Mail, Link2, MapPin, Building2, Calendar } from "lucide-react";

const Profile = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="pt-16">
        {/* Cover Image */}
        <div className="h-64 bg-sage-200" />

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="relative -mt-20 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-32 w-32 rounded-full bg-sage-300 border-4 border-white" />
                    <div>
                      <h1 className="text-2xl font-bold text-sage-800">John Doe</h1>
                      <p className="text-sage-600">Student at University</p>
                    </div>
                  </div>
                  <Button className="bg-sage-600 hover:bg-sage-700">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-sage-600">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    john.doe@example.com
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    San Francisco, CA
                  </div>
                  <div className="flex items-center">
                    <Link2 className="h-4 w-4 mr-2" />
                    portfolio.com/johndoe
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">About</h2>
              <p className="text-sage-600">
                A passionate student interested in technology and innovation. Looking
                to connect with like-minded individuals and explore new opportunities.
              </p>
            </div>

            {/* Experience */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Experience</h2>
              <div className="space-y-6">
                {[1, 2].map((exp) => (
                  <div key={exp} className="flex space-x-4">
                    <div className="flex-shrink-0">
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

            {/* Education */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Education</h2>
              <div className="space-y-6">
                {[1].map((edu) => (
                  <div key={edu} className="flex space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded bg-sage-100 flex items-center justify-center">
                        <Building2 className="h-6 w-6 text-sage-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">University Name</h3>
                      <p className="text-sage-600">Bachelor's Degree</p>
                      <div className="flex items-center text-sm text-sage-500 mt-1">
                        <Calendar className="h-4 w-4 mr-2" />
                        2020 - 2024
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