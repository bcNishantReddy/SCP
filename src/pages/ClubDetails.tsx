import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Plus, Users, MessageSquare } from "lucide-react";

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDiscussion, setNewDiscussion] = useState({ title: "", description: "" });
  const [newMessage, setNewMessage] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);

  // Fetch club details, discussions, and messages
  const { data: clubData } = useQuery({
    queryKey: ['club', id],
    queryFn: async () => {
      console.log("Fetching club details...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: club, error } = await supabase
        .from('groups')
        .select(`
          *,
          members:group_members(user_id),
          discussions(
            id,
            title,
            description,
            created_at,
            creator:profiles(name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      const isMember = club.members.some((m: any) => m.user_id === user.id);
      const isCreator = club.creator_id === user.id;

      return { ...club, isMember, isCreator };
    },
  });

  // Fetch messages for selected discussion
  const { data: messages } = useQuery({
    queryKey: ['messages', selectedDiscussion],
    queryFn: async () => {
      if (!selectedDiscussion) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles(name, avatar_url)
        `)
        .eq('discussion_id', selectedDiscussion)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedDiscussion,
  });

  // Create new discussion
  const createDiscussion = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('discussions')
        .insert([{
          group_id: id,
          creator_id: user.id,
          title: newDiscussion.title,
          description: newDiscussion.description
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', id] });
      setNewDiscussion({ title: "", description: "" });
      toast({
        title: "Success",
        description: "Discussion created successfully",
      });
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('messages')
        .insert([{
          discussion_id: selectedDiscussion,
          user_id: user.id,
          content: newMessage
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedDiscussion] });
      setNewMessage("");
    },
  });

  if (!clubData) return null;

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/clubs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h1 className="text-2xl font-bold text-sage-800 mb-2">{clubData.name}</h1>
            <p className="text-sage-600 mb-4">{clubData.description}</p>
            
            {clubData.isCreator && !selectedDiscussion && (
              <div className="space-y-4 mb-6 border-t pt-4">
                <h2 className="text-lg font-semibold">Create New Discussion</h2>
                <Input
                  placeholder="Discussion Title"
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Discussion Description"
                  value={newDiscussion.description}
                  onChange={(e) => setNewDiscussion(prev => ({ ...prev, description: e.target.value }))}
                />
                <Button
                  onClick={() => createDiscussion.mutate()}
                  disabled={createDiscussion.isPending}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Discussion
                </Button>
              </div>
            )}

            {selectedDiscussion ? (
              <div className="space-y-4">
                <Button
                  variant="ghost"
                  onClick={() => setSelectedDiscussion(null)}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discussions
                </Button>

                <div className="h-[400px] overflow-y-auto border rounded-lg p-4 space-y-4">
                  {messages?.map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-sage-200">
                          {message.sender.avatar_url && (
                            <img
                              src={message.sender.avatar_url}
                              alt={message.sender.name}
                              className="h-full w-full rounded-full"
                            />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{message.sender.name}</p>
                        <p className="text-sage-600">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newMessage.trim()) {
                        sendMessage.mutate();
                      }
                    }}
                  />
                  <Button
                    onClick={() => sendMessage.mutate()}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {clubData.discussions?.map((discussion: any) => (
                  <div
                    key={discussion.id}
                    className="border rounded-lg p-4 hover:bg-sage-50 cursor-pointer"
                    onClick={() => setSelectedDiscussion(discussion.id)}
                  >
                    <h3 className="font-semibold">{discussion.title}</h3>
                    <p className="text-sm text-sage-600">{discussion.description}</p>
                    <div className="text-xs text-sage-500 mt-2">
                      Created by {discussion.creator.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClubDetails;