import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ForumPost {
  id: string;
  author_id: string;
  course_id: string | null;
  title: string;
  content: string;
  status: string;
  replies_count: number | null;
  upvotes: number | null;
  is_pinned: boolean | null;
  created_at: string;
  updated_at: string;
  author?: {
    name: string | null;
    avatar_url: string | null;
  };
  course?: {
    title: string;
  };
}

export function useForumPosts(courseId?: string) {
  return useQuery({
    queryKey: ["forum-posts", courseId],
    queryFn: async () => {
      let query = supabase
        .from("forum_posts")
        .select(`
          *,
          course:courses(title)
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (courseId) {
        query = query.eq("course_id", courseId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch author profiles separately
      const authorIds = [...new Set(data.map(p => p.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", authorIds);
      
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
      
      return data.map(post => ({
        ...post,
        author: profileMap.get(post.author_id) || null,
      })) as ForumPost[];
    },
  });
}

export function useCreateForumPost() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, content, courseId }: { title: string; content: string; courseId?: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("forum_posts")
        .insert({
          author_id: user.id,
          title,
          content,
          course_id: courseId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      toast.success("Post created!");
    },
    onError: (error) => {
      toast.error("Failed to create post: " + error.message);
    },
  });
}

export function useUpvotePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // First get current upvotes
      const { data: post, error: fetchError } = await supabase
        .from("forum_posts")
        .select("upvotes")
        .eq("id", postId)
        .single();

      if (fetchError) throw fetchError;

      const { error } = await supabase
        .from("forum_posts")
        .update({ upvotes: (post.upvotes || 0) + 1 })
        .eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
    },
  });
}
