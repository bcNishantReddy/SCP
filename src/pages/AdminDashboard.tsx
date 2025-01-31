import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  XCircle,
  Users,
  MessageSquare,
  Calendar,
  Briefcase,
} from "lucide-react";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-sage-800 mb-6">Admin Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: Users, label: "Total Users", value: "1,234" },
              { icon: MessageSquare, label: "Total Posts", value: "5,678" },
              { icon: Calendar, label: "Active Events", value: "12" },
              { icon: Briefcase, label: "Projects", value: "89" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm p-6"
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-sage-100 rounded-lg">
                    <stat.icon className="h-6 w-6 text-sage-600" />
                  </div>
                  <div>
                    <p className="text-sm text-sage-600">{stat.label}</p>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4">Pending Approvals</h2>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
              <Input
                placeholder="Search users..."
                className="pl-10"
              />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((user) => (
                <div
                  key={user}
                  className="flex items-center justify-between p-4 bg-sage-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-sage-200" />
                    <div>
                      <h3 className="font-semibold">John Doe</h3>
                      <p className="text-sm text-sage-600">Student • Joined 2 days ago</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="text-green-600 hover:text-green-700">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((activity) => (
                <div
                  key={activity}
                  className="flex items-center space-x-4 p-4 hover:bg-sage-50 rounded-lg transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-sage-200" />
                  <div>
                    <p className="text-sage-800">
                      <span className="font-semibold">John Doe</span>{" "}
                      {activity % 3 === 0
                        ? "created a new project"
                        : activity % 3 === 1
                        ? "posted in the forum"
                        : "registered for an event"}
                    </p>
                    <p className="text-sm text-sage-500">2 hours ago</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;