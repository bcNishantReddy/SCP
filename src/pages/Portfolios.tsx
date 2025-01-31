import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, FileText, Download, Eye } from "lucide-react";

const Portfolios = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Portfolios</h1>
            <Button className="bg-sage-600 hover:bg-sage-700">
              <Plus className="h-4 w-4 mr-2" />
              Upload Portfolio
            </Button>
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search portfolios..."
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((portfolio) => (
              <div
                key={portfolio}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="h-12 w-12 rounded-full bg-sage-200" />
                    <div>
                      <h3 className="font-semibold">John Doe</h3>
                      <p className="text-sm text-sage-600">Updated 2 days ago</p>
                    </div>
                  </div>
                  <div className="bg-sage-50 rounded-lg p-4 mb-4">
                    <FileText className="h-8 w-8 text-sage-600 mx-auto mb-2" />
                    <p className="text-center text-sm text-sage-600">portfolio.pdf</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download
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

export default Portfolios;