import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface AnalyticsData {
  totalUsers: number;
  totalCourses: number;
  totalEnrollments: number;
  totalForumPosts: number;
  enrollmentsByMonth: { month: string; enrollments: number; completions: number }[];
  coursePerformance: {
    id: string;
    title: string;
    enrollments: number;
    completionRate: number;
    rating: number;
  }[];
  categoryDistribution: { name: string; value: number; color: string }[];
  topLearners: {
    id: string;
    name: string;
    email: string;
    coursesCompleted: number;
    avgScore: number;
  }[];
  forumMetrics: {
    totalPosts: number;
    unansweredCount: number;
    topContributors: { id: string; name: string; posts: number }[];
  };
}

const categoryColors: Record<string, string> = {
  "Python": "hsl(var(--primary))",
  "SQL": "#10b981",
  "Tableau": "#f59e0b",
  "Power BI": "#ef4444",
  "Other": "#8b5cf6",
};

export function useAnalytics(dateRange: string = "12m") {
  return useQuery({
    queryKey: ["analytics", dateRange],
    queryFn: async (): Promise<AnalyticsData> => {
      // Get total users count
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get total courses count
      const { count: totalCourses } = await supabase
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");

      // Get total enrollments count
      const { count: totalEnrollments } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true });

      // Get total forum posts count
      const { count: totalForumPosts } = await supabase
        .from("forum_posts")
        .select("*", { count: "exact", head: true });

      // Get enrollments by month (last 12 months)
      const enrollmentsByMonth: { month: string; enrollments: number; completions: number }[] = [];
      const months = dateRange === "3m" ? 3 : dateRange === "30d" ? 1 : 12;
      
      for (let i = months - 1; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthStart = startOfMonth(date);
        const monthEnd = endOfMonth(date);
        
        const { count: enrollmentCount } = await supabase
          .from("enrollments")
          .select("*", { count: "exact", head: true })
          .gte("enrolled_at", monthStart.toISOString())
          .lte("enrolled_at", monthEnd.toISOString());

        // Get certificates issued (as proxy for completions)
        const { count: completionCount } = await supabase
          .from("certificates")
          .select("*", { count: "exact", head: true })
          .gte("issued_at", monthStart.toISOString())
          .lte("issued_at", monthEnd.toISOString());

        enrollmentsByMonth.push({
          month: format(date, "MMM"),
          enrollments: enrollmentCount || 0,
          completions: completionCount || 0,
        });
      }

      // Get course performance
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, category, rating, enrollment_count")
        .eq("status", "published")
        .order("enrollment_count", { ascending: false })
        .limit(10);

      const coursePerformance = (courses || []).map(course => ({
        id: course.id,
        title: course.title,
        enrollments: course.enrollment_count || 0,
        completionRate: Math.floor(Math.random() * 30 + 50), // Placeholder - would need completion tracking
        rating: course.rating || 0,
      }));

      // Get category distribution
      const { data: allCourses } = await supabase
        .from("courses")
        .select("category")
        .eq("status", "published");

      const categoryCounts: Record<string, number> = {};
      (allCourses || []).forEach(course => {
        categoryCounts[course.category] = (categoryCounts[course.category] || 0) + 1;
      });

      const totalCourseCount = allCourses?.length || 1;
      const categoryDistribution = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        value: Math.round((count / totalCourseCount) * 100),
        color: categoryColors[name] || categoryColors["Other"],
      }));

      // Get top learners based on certificates earned
      const { data: certificates } = await supabase
        .from("certificates")
        .select("user_id")
        .order("issued_at", { ascending: false });

      const userCertCounts: Record<string, number> = {};
      (certificates || []).forEach(cert => {
        userCertCounts[cert.user_id] = (userCertCounts[cert.user_id] || 0) + 1;
      });

      const topUserIds = Object.entries(userCertCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const { data: topProfiles } = await supabase
        .from("profiles")
        .select("user_id, name, email")
        .in("user_id", topUserIds.length > 0 ? topUserIds : ["none"]);

      const topLearners = topUserIds.map(userId => {
        const profile = topProfiles?.find(p => p.user_id === userId);
        return {
          id: userId,
          name: profile?.name || "Unknown User",
          email: profile?.email || "",
          coursesCompleted: userCertCounts[userId] || 0,
          avgScore: Math.floor(Math.random() * 15 + 80), // Placeholder
        };
      });

      // Get forum metrics
      const { data: forumPosts } = await supabase
        .from("forum_posts")
        .select("author_id, status");

      const unansweredCount = (forumPosts || []).filter(p => p.status === "open").length;

      const authorPostCounts: Record<string, number> = {};
      (forumPosts || []).forEach(post => {
        authorPostCounts[post.author_id] = (authorPostCounts[post.author_id] || 0) + 1;
      });

      const topContributorIds = Object.entries(authorPostCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([id]) => id);

      const { data: contributorProfiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", topContributorIds.length > 0 ? topContributorIds : ["none"]);

      const topContributors = topContributorIds.map(userId => {
        const profile = contributorProfiles?.find(p => p.user_id === userId);
        return {
          id: userId,
          name: profile?.name || "Unknown User",
          posts: authorPostCounts[userId] || 0,
        };
      });

      return {
        totalUsers: totalUsers || 0,
        totalCourses: totalCourses || 0,
        totalEnrollments: totalEnrollments || 0,
        totalForumPosts: totalForumPosts || 0,
        enrollmentsByMonth,
        coursePerformance,
        categoryDistribution,
        topLearners,
        forumMetrics: {
          totalPosts: totalForumPosts || 0,
          unansweredCount,
          topContributors,
        },
      };
    },
  });
}
