import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, BookOpen, Play, Clock } from "lucide-react";

const Tutorials = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Tutorials</h1>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search tutorials..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((tutorial) => (
              <div
                key={tutorial}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <div className="h-48 bg-sage-200" />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                  >
                    <Play className="h-6 w-6 text-sage-600" />
                  </Button>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 text-sage-600 text-sm mb-2">
                    <BookOpen className="h-4 w-4" />
                    <span>Getting Started</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Tutorial Title</h3>
                  <p className="text-sage-600 text-sm mb-4">
                    Learn how to make the most of the platform's features with this
                    comprehensive guide.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-sage-500">
                      <Clock className="h-4 w-4" />
                      <span>5 min read</span>
                    </div>
                    <Button variant="outline" className="text-sage-600 hover:text-sage-700">
                      Start Tutorial
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

export default Tutorials;