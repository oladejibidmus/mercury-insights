import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface ForumReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_answer: boolean | null;
  upvotes: number | null;
  created_at: string;
  updated_at: string;
  author?: {
    name: string | null;
    avatar_url: string | null;
  };
}

export function useForumReplies(postId: string | null) {
  return useQuery({
    queryKey: ["forum-replies", postId],
    queryFn: async () => {
      if (!postId) return [];

      const { data, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Fetch author profiles
      const authorIds = [...new Set(data.map((r) => r.author_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url")
        .in("user_id", authorIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return data.map((reply) => ({
        ...reply,
        author: profileMap.get(reply.author_id) || null,
      })) as ForumReply[];
    },
    enabled: !!postId,
  });
}

export function useCreateForumReply() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      if (!user) throw new Error("Must be logged in");

      const { data, error } = await supabase
        .from("forum_replies")
        .insert({
          post_id: postId,
          author_id: user.id,
          content,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      toast.success("Reply posted!");
    },
    onError: (error) => {
      toast.error("Failed to post reply: " + error.message);
    },
  });
}

export function useMarkAsAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ replyId, postId }: { replyId: string; postId: string }) => {
      // First, unmark any existing answers for this post
      await supabase
        .from("forum_replies")
        .update({ is_answer: false })
        .eq("post_id", postId);

      // Mark the selected reply as answer
      const { error: replyError } = await supabase
        .from("forum_replies")
        .update({ is_answer: true })
        .eq("id", replyId);

      if (replyError) throw replyError;

      // Update post status to answered
      const { error: postError } = await supabase
        .from("forum_posts")
        .update({ status: "answered" })
        .eq("id", postId);

      if (postError) throw postError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["forum-replies", variables.postId] });
      queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
      toast.success("Marked as answer!");
    },
    onError: (error) => {
      toast.error("Failed to mark as answer: " + error.message);
    },
  });
}
