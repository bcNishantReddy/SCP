import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Star, Mail, Link2 } from "lucide-react";

const People = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">People</h1>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search people..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((person) => (
              <div
                key={person}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 bg-sage-200" />
                <div className="relative px-4 pt-12 pb-4">
                  <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                    <div className="h-20 w-20 rounded-full bg-sage-300 border-4 border-white" />
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="font-semibold text-lg">John Doe</h3>
                    <p className="text-sage-600 text-sm">
                      {person % 4 === 0
                        ? "Student"
                        : person % 4 === 1
                        ? "Faculty"
                        : person % 4 === 2
                        ? "Investor"
                        : "Alumni"}
                    </p>
                  </div>
                  <div className="flex justify-center space-x-2">
                    <Button variant="outline" size="sm" className="text-sage-600">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" className="text-sage-600">
                      <Star className="h-4 w-4 mr-2" />
                      Star
                    </Button>
                    <Button variant="outline" size="sm" className="text-sage-600">
                      <Link2 className="h-4 w-4 mr-2" />
                      Portfolio
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

export default People;