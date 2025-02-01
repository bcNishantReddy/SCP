import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Heart, Share2, Image, Link, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  image_url: string | null;
  likes_count: number;
  profile: {
    name: string;
    avatar_url: string | null;
  };
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
  profile: {
    name: string;
    avatar_url: string | null;
  };
}

const LiveFeed = () => {
  const [newPost, setNewPost] = useState("");
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts with profiles and comments
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(name, avatar_url),
          comments:comments(
            id,
            content,
            user_id,
            created_at,
            profile:profiles(name, avatar_url)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });

  // Create post mutation
  const createPost = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('posts')
        .insert([{ content, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost("");
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create comment mutation
  const createComment = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('comments')
        .insert([{ 
          post_id: postId,
          content,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewComment({});
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Like post mutation
  const likePost = useMutation({
    mutationFn: async (postId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('posts')
        .update({ likes_count: posts?.find(p => p.id === postId)?.likes_count + 1 })
        .eq('id', postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;
    createPost.mutate(newPost);
  };

  const handleCreateComment = async (postId: string) => {
    if (!newComment[postId]?.trim()) return;
    createComment.mutate({ postId, content: newComment[postId] });
  };

  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Create Post */}
          <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
            <Textarea
              placeholder="What's on your mind?"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              className="w-full min-h-[100px]"
            />
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm">
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button variant="ghost" size="sm">
                  <Link className="h-4 w-4 mr-2" />
                  Link
                </Button>
              </div>
              <Button 
                className="bg-sage-600 hover:bg-sage-700"
                onClick={handleCreatePost}
                disabled={createPost.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Post
              </Button>
            </div>
          </div>

          {/* Posts */}
          {postsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 space-y-4 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-sage-200" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-sage-200 rounded" />
                      <div className="h-3 w-16 bg-sage-200 rounded" />
                    </div>
                  </div>
                  <div className="h-20 bg-sage-200 rounded" />
                </div>
              ))}
            </div>
          ) : (
            posts?.map((post) => (
              <div key={post.id} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-sage-200 overflow-hidden">
                    {post.profile.avatar_url && (
                      <img 
                        src={post.profile.avatar_url} 
                        alt={post.profile.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{post.profile.name}</h3>
                    <p className="text-sm text-sage-600">
                      {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">{post.content}</p>
                {post.image_url && (
                  <img 
                    src={post.image_url} 
                    alt="Post content" 
                    className="rounded-lg max-h-96 w-full object-cover"
                  />
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => likePost.mutate(post.id)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    {post.likes_count || 0} Likes
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Comment
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Comments Section */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment[post.id] || ''}
                      onChange={(e) => setNewComment({
                        ...newComment,
                        [post.id]: e.target.value
                      })}
                    />
                    <Button
                      onClick={() => handleCreateComment(post.id)}
                      disabled={!newComment[post.id]?.trim()}
                    >
                      Send
                    </Button>
                  </div>
                  
                  {post.comments?.map((comment: Comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="h-8 w-8 rounded-full bg-sage-200 overflow-hidden flex-shrink-0">
                        {comment.profile.avatar_url && (
                          <img 
                            src={comment.profile.avatar_url} 
                            alt={comment.profile.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 bg-sage-50 rounded-lg p-3">
                        <div className="font-semibold text-sm">{comment.profile.name}</div>
                        <p className="text-sm">{comment.content}</p>
                        <span className="text-xs text-sage-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default LiveFeed;