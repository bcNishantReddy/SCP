import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Users, Lock, LockOpen } from "lucide-react";
import { CreatePost } from "@/components/feed/CreatePost";

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);

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
          members:group_members(count),
          group_posts:posts(
            id,
            content,
            image_url,
            created_at,
            user:profiles(name, avatar_url)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      // Fetch user's membership status
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      const isMember = !membershipError && membership !== null;
      const isCreator = club.creator_id === user.id;
      setIsPublic(!club.is_private);

      return { 
        ...club, 
        isMember,
        isCreator,
        posts: club.group_posts || [],
        _count: {
          members: club.members?.[0]?.count || 0
        }
      };
    },
  });

  // Toggle group privacy
  const togglePrivacy = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('groups')
        .update({ is_private: !isPublic })
        .eq('id', id);

      if (error) throw error;
      setIsPublic(!isPublic);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Club is now ${isPublic ? 'private' : 'public'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['club', id] });
    },
  });

  // Handle joining the group
  const joinGroup = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: id, user_id: user.id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You have joined the club",
      });
      queryClient.invalidateQueries({ queryKey: ['club', id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to join the club",
        variant: "destructive",
      });
      console.error("Join error:", error);
    },
  });

  if (!clubData) return null;

  return (
    <div className="min-h-screen bg-sage-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-20 pb-4 flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
          <Button
            variant="ghost"
            className="mb-6 w-fit"
            onClick={() => navigate('/clubs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-sage-800">{clubData.name}</h1>
              <div className="flex gap-2">
                {!clubData.isMember && !clubData.isCreator && (
                  <Button
                    onClick={() => joinGroup.mutate()}
                    className="bg-sage-600 hover:bg-sage-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Join Club
                  </Button>
                )}
                {clubData.isCreator && (
                  <Button
                    onClick={() => togglePrivacy.mutate()}
                    variant="outline"
                    className="flex items-center"
                  >
                    {isPublic ? (
                      <>
                        <LockOpen className="h-4 w-4 mr-2" />
                        Make Private
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Make Public
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-sage-600 mb-4">{clubData.description}</p>
            
            {(clubData.isMember || clubData.isCreator) && (
              <div className="space-y-6 flex-1 flex flex-col">
                <div className="border-t pt-6 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold mb-4">Group Feed</h2>
                  <CreatePost groupId={id} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['club', id] })} />
                  
                  <ScrollArea className="flex-1 mt-6">
                    <div className="space-y-4">
                      {clubData.posts?.map((post: any) => (
                        <div key={post.id} className="bg-white rounded-lg shadow-sm p-4">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="h-8 w-8 rounded-full bg-sage-200 overflow-hidden">
                              {post.user.avatar_url && (
                                <img
                                  src={post.user.avatar_url}
                                  alt={post.user.name}
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{post.user.name}</p>
                              <p className="text-sm text-sage-500">
                                {new Date(post.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-sage-800">{post.content}</p>
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt="Post attachment"
                              className="mt-2 rounded-lg max-h-96 w-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="mt-4 border-t pt-4">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1"
                      />
                      <Button>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClubDetails;