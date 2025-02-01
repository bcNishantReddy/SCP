import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Image, Link, Send } from "lucide-react";
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
  has_liked?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const LiveFeed = () => {
  const [newPost, setNewPost] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  const [isAddingLink, setIsAddingLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch posts with profiles and check if current user has liked each post
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profile:profiles(name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch likes for current user
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      const likedPostIds = new Set(likes?.map(like => like.post_id));

      return data.map((post: Post) => ({
        ...post,
        has_liked: likedPostIds.has(post.id)
      }));
    },
  });

  const createPost = useMutation({
    mutationFn: async ({ content, imageFile, link }: { content: string; imageFile: File | null; link: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let image_url = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('files')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('files')
          .getPublicUrl(filePath);

        image_url = publicUrl;
      }

      const finalContent = link ? `${content}\n${link}` : content;

      const { data, error } = await supabase
        .from('posts')
        .insert([{ 
          content: finalContent, 
          user_id: user.id,
          image_url
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setNewPost("");
      setSelectedImage(null);
      setPreviewUrl(null);
      setLinkUrl("");
      setIsAddingLink(false);
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

  const toggleLike = useMutation({
    mutationFn: async ({ postId, hasLiked }: { postId: string; hasLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (hasLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert([{ post_id: postId, user_id: user.id }]);
      }

      // Update likes count
      const { data, error } = await supabase
        .from('posts')
        .update({ 
          likes_count: hasLiked 
            ? supabase.sql`likes_count - 1`
            : supabase.sql`likes_count + 1`
        })
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

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim() && !selectedImage && !linkUrl) return;
    createPost.mutate({ 
      content: newPost, 
      imageFile: selectedImage,
      link: linkUrl
    });
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
            {previewUrl && (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-64 rounded-lg"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setSelectedImage(null);
                    setPreviewUrl(null);
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
            {isAddingLink && (
              <Input
                placeholder="Enter URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
              />
            )}
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-4 w-4 mr-2" />
                  Image
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setIsAddingLink(!isAddingLink)}
                >
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
                <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
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
                    onClick={() => toggleLike.mutate({ 
                      postId: post.id, 
                      hasLiked: post.has_liked || false 
                    })}
                    className={post.has_liked ? "text-red-500" : ""}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${post.has_liked ? "fill-current" : ""}`} />
                    {post.likes_count || 0} Likes
                  </Button>
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