import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);

  const { data: group } = useQuery({
    queryKey: ["group", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("groups")
        .select(`
          *,
          creator:profiles!groups_creator_id_fkey(id, name),
          group_members(
            user:profiles(id, name, avatar_url)
          ),
          discussions(
            id,
            title,
            description,
            creator:profiles!discussions_creator_id_fkey(name)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: messages } = useQuery({
    queryKey: ["messages", id, selectedDiscussion],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("messages")
        .select(`
          *,
          sender:profiles(name, avatar_url)
        `)
        .eq(selectedDiscussion ? "discussion_id" : "group_id", selectedDiscussion || id)
        .order("created_at", { ascending: true });

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

  const { data: joinRequests } = useQuery({
    queryKey: ["join-requests", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("group_join_requests")
        .select(`
          *,
          user:profiles(name, avatar_url)
        `)
        .eq("group_id", id)
        .eq("status", "pending");

      if (error) throw error;
      return data;
    },
    enabled: group?.creator?.id === user?.id,
  });

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          content: message,
          user_id: user?.id,
          group_id: selectedDiscussion ? null : id,
          discussion_id: selectedDiscussion,
        });

      if (error) throw error;

      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["messages", id, selectedDiscussion] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateDiscussion = async (title: string, description: string) => {
    try {
      const { error } = await supabase
        .from("discussions")
        .insert({
          title,
          description,
          group_id: id,
          creator_id: user?.id,
        });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast({
        title: "Success",
        description: "Discussion created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleApproveJoinRequest = async (requestId: string, userId: string) => {
    try {
      const { error: updateError } = await supabase
        .from("group_join_requests")
        .update({ status: "approved" })
        .eq("id", requestId);

      if (updateError) throw updateError;

      const { error: memberError } = await supabase
        .from("group_members")
        .insert({ group_id: id, user_id: userId });

      if (memberError) throw memberError;

      queryClient.invalidateQueries({ queryKey: ["join-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast({
        title: "Success",
        description: "Member approved successfully",
      });
    } catch (error: any) {
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="ghost"
              className="mr-4"
              onClick={() => navigate("/clubs")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-sage-800">{group?.name}</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Club Info */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-sage-600 mb-4">{group?.description}</p>
                <div className="text-sm text-sage-500">
                  Created by {group?.creator?.name}
                </div>
              </div>

              {/* Discussions */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Discussions</h3>
                  {group?.creator?.id === user?.id && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-sage-600 hover:bg-sage-700">
                          <Plus className="h-4 w-4 mr-2" />
                          New
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Discussion</DialogTitle>
                          <DialogDescription>
                            Start a new discussion topic for club members.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          handleCreateDiscussion(
                            formData.get("title") as string,
                            formData.get("description") as string
                          );
                        }}>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="title">Title</Label>
                              <Input id="title" name="title" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="description">Description</Label>
                              <Textarea
                                id="description"
                                name="description"
                                required
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button type="submit" className="bg-sage-600 hover:bg-sage-700">
                              Create Discussion
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    variant={selectedDiscussion === null ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedDiscussion(null)}
                  >
                    Main Chat
                  </Button>
                  {group?.discussions?.map((discussion: any) => (
                    <Button
                      key={discussion.id}
                      variant={selectedDiscussion === discussion.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedDiscussion(discussion.id)}
                    >
                      {discussion.title}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Members */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Members</h3>
                  {group?.creator?.id === user?.id && joinRequests?.length > 0 && (
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="outline">
                          Requests ({joinRequests.length})
                        </Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader>
                          <SheetTitle>Join Requests</SheetTitle>
                          <SheetDescription>
                            Review and approve join requests for your club.
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-4 space-y-4">
                          {joinRequests.map((request: any) => (
                            <div
                              key={request.id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                <img
                                  src={request.user.avatar_url || "/placeholder.svg"}
                                  alt={request.user.name}
                                  className="w-8 h-8 rounded-full"
                                />
                                <span>{request.user.name}</span>
                              </div>
                              <Button
                                size="sm"
                                className="bg-sage-600 hover:bg-sage-700"
                                onClick={() => handleApproveJoinRequest(request.id, request.user_id)}
                              >
                                Approve
                              </Button>
                            </div>
                          ))}
                        </div>
                      </SheetContent>
                    </Sheet>
                  )}
                </div>
                <div className="space-y-2">
                  {group?.group_members?.map((member: any) => (
                    <div
                      key={member.user.id}
                      className="flex items-center space-x-2"
                    >
                      <img
                        src={member.user.avatar_url || "/placeholder.svg"}
                        alt={member.user.name}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="text-sm">
                        {member.user.name}
                        {member.user.id === group.creator.id && (
                          <span className="text-sage-500 ml-1">(Owner)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-3 bg-white rounded-lg shadow-sm p-4">
              <div className="h-[600px] flex flex-col">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages?.map((message: any) => (
                    <div
                      key={message.id}
                      className={`flex items-start space-x-2 ${
                        message.sender.id === user?.id ? "flex-row-reverse space-x-reverse" : ""
                      }`}
                    >
                      <img
                        src={message.sender.avatar_url || "/placeholder.svg"}
                        alt={message.sender.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <div
                        className={`max-w-[70%] ${
                          message.sender.id === user?.id
                            ? "bg-sage-500 text-white"
                            : "bg-gray-100"
                        } rounded-lg p-3`}
                      >
                        <div className="text-xs mb-1">
                          {message.sender.name}
                        </div>
                        <div className="text-sm">{message.content}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    className="bg-sage-600 hover:bg-sage-700"
                    onClick={handleSendMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDetails;