import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

interface TypingUser {
  id: string;
  name: string;
}

export function useForumRealtime(postId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Subscribe to new posts
    const postsChannel = supabase
      .channel("forum-posts-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "forum_posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["forum-posts"] });
        }
      )
      .subscribe();

    // Subscribe to replies if viewing a specific post
    let repliesChannel: ReturnType<typeof supabase.channel> | null = null;
    if (postId) {
      repliesChannel = supabase
        .channel(`forum-replies-${postId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "forum_replies",
            filter: `post_id=eq.${postId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["forum-replies", postId] });
          }
        )
        .subscribe();
    }

    return () => {
      supabase.removeChannel(postsChannel);
      if (repliesChannel) {
        supabase.removeChannel(repliesChannel);
      }
    };
  }, [postId, queryClient]);
}

export function useTypingIndicator(channelName: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    const channel = supabase.channel(channelName);

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence) => {
            if (presence.isTyping && presence.userId !== user?.id) {
              users.push({ id: presence.userId, name: presence.userName });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName, user?.id]);

  const setTyping = useCallback(
    async (isTyping: boolean, userName: string) => {
      if (!user) return;

      const channel = supabase.channel(channelName);
      await channel.track({
        userId: user.id,
        userName,
        isTyping,
        online_at: new Date().toISOString(),
      });
    },
    [channelName, user]
  );

  return { typingUsers, setTyping };
}
