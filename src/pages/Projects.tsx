import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users } from "lucide-react";
import { AddProjectModal } from "@/components/modals/AddProjectModal";

const Projects = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Projects</h1>
            <AddProjectModal />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search projects..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((project) => (
              <div
                key={project}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-sage-200" />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Project Title</h3>
                  <p className="text-sage-600 text-sm mb-4">
                    A brief description of the project and its goals. This could be a
                    few lines long.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((member) => (
                        <div
                          key={member}
                          className="h-8 w-8 rounded-full bg-sage-300 border-2 border-white"
                        />
                      ))}
                    </div>
                    <Button variant="outline" className="text-sage-600 hover:text-sage-700">
                      Interested
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;