import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Send, Plus, Users, MessageSquare, Image } from "lucide-react";
import { CreatePost } from "@/components/feed/CreatePost";

const ClubDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newDiscussion, setNewDiscussion] = useState({ title: "", description: "" });
  const [newMessage, setNewMessage] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<string | null>(null);
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
          discussions:discussions(
            id,
            title,
            description,
            created_at,
            creator:profiles(name, avatar_url)
          ),
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

      // Fetch user's memberships - using maybeSingle() instead of single()
      const { data: membership, error: membershipError } = await supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      // Handle the case where user is not a member
      const isMember = !membershipError && membership !== null;
      const isCreator = club.creator_id === user.id;
      setIsPublic(!club.is_private);

      return { 
        ...club, 
        isMember,
        isCreator,
        posts: club.group_posts || [],
        _count: {
          members: club.members?.[0]?.count || 0,
          discussions: club.discussions?.length || 0
        }
      };
    },
  });

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel('group-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `group_id=eq.${id}`,
        },
        (payload) => {
          console.log('New message:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', selectedDiscussion] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
          filter: `group_id=eq.${id}`,
        },
        (payload) => {
          console.log('New post:', payload);
          queryClient.invalidateQueries({ queryKey: ['club', id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, queryClient, selectedDiscussion]);

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
        description: `Group is now ${isPublic ? 'private' : 'public'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['club', id] });
    },
  });

  // Handle join requests
  const handleJoinRequest = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('group_members')
        .insert([{ group_id: id, user_id: userId }]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member added to the group",
      });
      queryClient.invalidateQueries({ queryKey: ['club', id] });
    },
  });

  if (!clubData) return null;

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/clubs')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubs
          </Button>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-sage-800">{clubData.name}</h1>
              {clubData.isCreator && (
                <Button
                  onClick={() => togglePrivacy.mutate()}
                  variant="outline"
                >
                  {isPublic ? 'Make Private' : 'Make Public'}
                </Button>
              )}
            </div>
            <p className="text-sage-600 mb-4">{clubData.description}</p>
            
            {(clubData.isMember || clubData.isCreator) && (
              <div className="space-y-6">
                <div className="border-t pt-6">
                  <h2 className="text-lg font-semibold mb-4">Group Feed</h2>
                  <CreatePost groupId={id} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['club', id] })} />
                  
                  <div className="space-y-4 mt-6">
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