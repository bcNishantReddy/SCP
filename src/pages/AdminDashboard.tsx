import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Users, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type UserRole = Database["public"]["Enums"]["user_role"];

const AdminDashboard = () => {
  const [file, setFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending users
  const { data: pendingUsers } = useQuery({
    queryKey: ["pendingUsers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_approved", false);

      if (error) throw error;
      return data;
    },
  });

  // Fetch all users
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .ilike("name", `%${searchTerm}%`);

      if (error) throw error;
      return data;
    },
  });

  // Update user role mutation
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Approve user mutation
  const approveUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_approved: true })
        .eq("id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingUsers"] });
      toast({
        title: "Success",
        description: "User approved successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle bulk user upload
  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file",
        variant: "destructive",
      });
      return;
    }

    try {
      const workbook = await file.arrayBuffer();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("bulk_user_uploads")
        .insert({
          admin_id: user.id,
          file_name: file.name,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Create FormData to send file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadId", data.id);

      const { data: functionData, error: functionError } = await supabase.functions.invoke('bulk-upload', {
        body: formData,
      });

      if (functionError) throw functionError;

      toast({
        title: "Success",
        description: "File uploaded successfully. Processing users...",
      });
      
      // Reset file input
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    } catch (error: any) {
      console.error("Bulk upload error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Bulk Upload Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Bulk User Upload
            </h2>
            <div className="space-y-4">
              <Input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              <p className="text-sm text-muted-foreground">
                Upload an Excel file (.xlsx or .xls) with the following columns:
                email, name, role (student/faculty/investor/alumni), password
              </p>
              <Button onClick={handleFileUpload} disabled={!file}>
                Upload and Process
              </Button>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Pending Approvals
            </h2>
            <div className="space-y-4">
              {pendingUsers?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-sage-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-sage-600">{user.email}</p>
                    <p className="text-sm text-sage-500 capitalize">{user.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="text-green-600"
                      onClick={() => approveUser.mutate(user.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
              {pendingUsers?.length === 0 && (
                <p className="text-center text-sage-500">
                  No pending approvals
                </p>
              )}
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              User Management
            </h2>
            <div className="space-y-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users?.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value: UserRole) =>
                              updateUserRole.mutate({
                                userId: user.id,
                                role: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="faculty">Faculty</SelectItem>
                              <SelectItem value="investor">Investor</SelectItem>
                              <SelectItem value="alumni">Alumni</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
