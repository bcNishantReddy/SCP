import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, MessageSquare, ArrowLeft } from "lucide-react";
import { CreateGroupModal } from "@/components/modals/CreateGroupModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Groups = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: groups, isLoading } = useQuery({
    queryKey: ["groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          creator:profiles!groups_creator_id_fkey(name),
          group_members(id),
          discussions(id)
        `);

      if (error) throw error;
      return data;
    },
  });

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
    },
  });

  const { data: joinedGroups } = useQuery({
    queryKey: ["joined-groups"],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", user.id);

      if (error) throw error;
      return data.map(g => g.group_id);
    },
    enabled: !!user,
  });

  const handleJoinGroup = async (groupId: string, isPrivate: boolean) => {
    try {
      if (isPrivate) {
        const { error } = await supabase
          .from("group_join_requests")
          .insert({ group_id: groupId, user_id: user?.id });

        if (error) throw error;
        toast({
          title: "Request Sent",
          description: "Your request to join this club has been sent to the owner.",
        });
      } else {
        const { error } = await supabase
          .from("group_members")
          .insert({ group_id: groupId, user_id: user?.id });

        if (error) throw error;
        toast({
          title: "Success",
          description: "You have joined the club successfully.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredGroups = groups?.filter(
    (group) =>
      group.name?.toLowerCase().includes(search.toLowerCase()) ||
      group.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sage-50">
        <Navbar />
        <main className="container mx-auto px-4 pt-20">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg h-48 shadow-sm" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-sage-800">Clubs</h1>
            <CreateGroupModal />
          </div>

          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-sage-500" />
            <Input
              placeholder="Search clubs..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups?.map((group) => (
              <div
                key={group.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="h-32 bg-sage-200 bg-cover bg-center"
                  style={group.banner_url ? { backgroundImage: `url(${group.banner_url})` } : {}}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{group.name}</h3>
                    {group.is_private && (
                      <span className="text-xs bg-sage-100 text-sage-600 px-2 py-1 rounded-full">
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-sage-600 text-sm mb-4">
                    {group.description}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-sage-500">
                      <Users className="h-4 w-4" />
                      <span>{group.group_members?.length || 0} members</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-sage-500">
                      <MessageSquare className="h-4 w-4" />
                      <span>{group.discussions?.length || 0} discussions</span>
                    </div>
                  </div>
                  {joinedGroups?.includes(group.id) ? (
                    <Button 
                      className="w-full bg-sage-600 hover:bg-sage-700"
                      onClick={() => navigate(`/clubs/${group.id}`)}
                    >
                      View Club
                    </Button>
                  ) : (
                    <Button 
                      className="w-full bg-sage-600 hover:bg-sage-700"
                      onClick={() => handleJoinGroup(group.id, group.is_private)}
                    >
                      {group.is_private ? "Request to Join" : "Join Club"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Groups;