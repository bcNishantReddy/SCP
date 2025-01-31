import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, Building2, GraduationCap } from "lucide-react";
import { AddOpportunityModal } from "@/components/modals/AddOpportunityModal";

const Opportunities = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Opportunities</h1>
            <AddOpportunityModal />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search opportunities..."
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {[1, 2, 3, 4].map((opportunity) => (
              <div
                key={opportunity}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-sage-100 rounded-lg">
                      {opportunity % 3 === 0 ? (
                        <Briefcase className="h-6 w-6 text-sage-600" />
                      ) : opportunity % 3 === 1 ? (
                        <Building2 className="h-6 w-6 text-sage-600" />
                      ) : (
                        <GraduationCap className="h-6 w-6 text-sage-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        {opportunity % 3 === 0
                          ? "Summer Internship"
                          : opportunity % 3 === 1
                          ? "Research Position"
                          : "Mentorship Program"}
                      </h3>
                      <p className="text-sage-600 text-sm mb-2">Company/Institution Name</p>
                      <div className="flex items-center space-x-4 text-sm text-sage-500">
                        <span>Location: Remote</span>
                        <span>Duration: 3 months</span>
                        <span>Posted: 2 days ago</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="text-sage-600 hover:text-sage-700">
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Opportunities;