import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DOMPurify from "isomorphic-dompurify";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    created_at: string;
    image_url: string | null;
    likes_count: number;
    profile: {
      name: string;
      avatar_url: string | null;
    };
    has_liked?: boolean;
  };
}

interface ToggleLikeParams {
  postId: string;
  hasLiked: boolean;
}

export function PostCard({ post }: PostCardProps) {
  const [isLiking, setIsLiking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const toggleLike = useMutation({
    mutationFn: async ({ postId, hasLiked }: ToggleLikeParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setIsLiking(true);

      if (hasLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        const { data: existingLike } = await supabase
          .from('post_likes')
          .select()
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (!existingLike) {
          await supabase
            .from('post_likes')
            .insert([{ post_id: postId, user_id: user.id }]);
        }
      }

      const { data, error } = await supabase
        .rpc(hasLiked ? 'decrement_likes' : 'increment_likes', { post_id: postId })
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
    onSettled: () => {
      setIsLiking(false);
    },
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
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
      <div 
        className="text-gray-700 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ 
          __html: DOMPurify.sanitize(post.content) 
        }}
      />
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
          onClick={() => {
            if (!isLiking) {
              toggleLike.mutate({ 
                postId: post.id, 
                hasLiked: post.has_liked || false 
              });
            }
          }}
          className={`group ${post.has_liked ? "text-red-500" : ""}`}
        >
          <Heart 
            className={`h-4 w-4 mr-2 transition-transform group-hover:scale-125 ${
              post.has_liked ? "fill-current" : ""
            } ${isLiking ? "animate-ping" : ""}`} 
          />
          {post.likes_count || 0} Likes
        </Button>
      </div>
    </div>
  );
}