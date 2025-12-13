import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Profile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
}

export interface UserWithRole extends Profile {
  role: "admin" | "user";
  enrolled_courses?: number;
  completed_courses?: number;
}

export function useAdminUsers() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Fetch enrollment counts
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from("enrollments")
        .select("user_id, status");

      // Merge data
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRoles = roles?.filter((r) => r.user_id === profile.user_id) || [];
        const isAdmin = userRoles.some((r) => r.role === "admin");
        const userEnrollments = enrollments?.filter((e) => e.user_id === profile.user_id) || [];
        
        return {
          ...profile,
          role: isAdmin ? "admin" : "user",
          enrolled_courses: userEnrollments.length,
          completed_courses: userEnrollments.filter((e) => e.status === "completed").length,
        };
      });

      return usersWithRoles;
    },
  });

  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ status })
        .eq("user_id", userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User status updated");
    },
    onError: (error) => {
      toast.error("Failed to update user status: " + error.message);
    },
  });

  const updateUserRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: "admin" | "user" }) => {
      // First remove existing admin role if downgrading
      if (role === "user") {
        const { error: deleteError } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (deleteError) throw deleteError;
      } else {
        // Add admin role
        const { error: insertError } = await supabase
          .from("user_roles")
          .upsert({ user_id: userId, role: "admin" }, { onConflict: "user_id,role" });

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("User role updated");
    },
    onError: (error) => {
      toast.error("Failed to update user role: " + error.message);
    },
  });

  return {
    users,
    isLoading,
    error,
    updateUserStatus,
    updateUserRole,
  };
}