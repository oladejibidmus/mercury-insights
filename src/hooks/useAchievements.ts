import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: { type: string; count: number };
  points: number;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export function useAchievements() {
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .order("points", { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
  });
}

export function useUserAchievements(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ["user-achievements", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq("user_id", targetUserId)
        .order("earned_at", { ascending: false });

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!targetUserId,
  });
}

export function useCheckAndAwardAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) return [];

      // Fetch all achievements
      const { data: achievements } = await supabase
        .from("achievements")
        .select("*");

      // Fetch user's existing achievements
      const { data: userAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", user.id);

      const earnedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      const newAchievements: Achievement[] = [];

      // Check each achievement criteria
      for (const achievement of achievements || []) {
        if (earnedIds.has(achievement.id)) continue;

        const criteria = achievement.criteria as { type: string; count: number };
        let count = 0;

        switch (criteria.type) {
          case "forum_posts": {
            const { count: c } = await supabase
              .from("forum_posts")
              .select("*", { count: "exact", head: true })
              .eq("author_id", user.id);
            count = c || 0;
            break;
          }
          case "enrollments": {
            const { count: c } = await supabase
              .from("enrollments")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);
            count = c || 0;
            break;
          }
          case "quiz_attempts": {
            const { count: c } = await supabase
              .from("quiz_attempts")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);
            count = c || 0;
            break;
          }
          case "perfect_quiz": {
            const { count: c } = await supabase
              .from("quiz_attempts")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id)
              .eq("score", 100);
            count = c || 0;
            break;
          }
          case "certificates": {
            const { count: c } = await supabase
              .from("certificates")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);
            count = c || 0;
            break;
          }
          case "accepted_answers": {
            const { count: c } = await supabase
              .from("forum_replies")
              .select("*", { count: "exact", head: true })
              .eq("author_id", user.id)
              .eq("is_answer", true);
            count = c || 0;
            break;
          }
        }

        if (count >= criteria.count) {
          // Award achievement
          const { error } = await supabase
            .from("user_achievements")
            .insert({ user_id: user.id, achievement_id: achievement.id });

          if (!error) {
            newAchievements.push(achievement as Achievement);
          }
        }
      }

      return newAchievements;
    },
    onSuccess: (newAchievements) => {
      if (newAchievements.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
        newAchievements.forEach((a) => {
          toast.success(`🏆 Achievement Unlocked: ${a.name}!`, {
            description: a.description,
          });
        });
      }
    },
  });
}
