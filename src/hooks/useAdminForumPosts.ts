import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  course_id: string | null;
  status: string;
  replies_count: number | null;
  upvotes: number | null;
  is_pinned: boolean | null;
  created_at: string;
  updated_at: string;
  author_email?: string;
  author_name?: string;
  course_title?: string;
}

export function useAdminForumPosts() {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ["admin-forum-posts"],
    queryFn: async () => {
      // Fetch forum posts
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Fetch author profiles
      const authorIds = [...new Set(postsData?.map(p => p.author_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, email")
        .in("user_id", authorIds);

      // Fetch course titles
      const courseIds = [...new Set(postsData?.filter(p => p.course_id).map(p => p.course_id) || [])];
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);

      // Merge data
      const enrichedPosts: ForumPost[] = (postsData || []).map((post) => {
        const author = profiles?.find(p => p.user_id === post.author_id);
        const course = courses?.find(c => c.id === post.course_id);
        
        return {
          ...post,
          author_email: author?.email || "Unknown",
          author_name: author?.name || author?.email || "Unknown",
          course_title: course?.title || "General",
        };
      });

      return enrichedPosts;
    },
  });

  const updatePostStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("forum_posts")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-posts"] });
      toast.success("Post status updated");
    },
    onError: (error) => {
      toast.error("Failed to update post: " + error.message);
    },
  });

  const togglePinPost = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from("forum_posts")
        .update({ is_pinned: !isPinned })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-posts"] });
      toast.success("Post pin status updated");
    },
    onError: (error) => {
      toast.error("Failed to update pin status: " + error.message);
    },
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("forum_posts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-forum-posts"] });
      toast.success("Post deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete post: " + error.message);
    },
  });

  return {
    posts,
    isLoading,
    error,
    updatePostStatus,
    togglePinPost,
    deletePost,
  };
}