import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface CapstoneProject {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  instructions: string | null;
  due_date: string | null;
  created_at: string;
  course?: {
    title: string;
  };
}

export interface CapstoneSubmission {
  id: string;
  user_id: string;
  project_id: string;
  submission_link: string | null;
  notes: string | null;
  status: string;
  grade: number | null;
  feedback: string | null;
  revision_requested: boolean | null;
  submitted_at: string;
  graded_at: string | null;
}

export function useCapstoneProjects() {
  return useQuery({
    queryKey: ["capstone-projects"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capstone_projects")
        .select(`
          *,
          course:courses(title)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as CapstoneProject[];
    },
  });
}

export function useCapstoneSubmissions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["capstone-submissions", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("capstone_submissions")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as CapstoneSubmission[];
    },
    enabled: !!user,
  });
}

export function useSubmitCapstone() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, submissionLink, notes }: { projectId: string; submissionLink: string; notes?: string }) => {
      if (!user) throw new Error("Must be logged in");

      // Check if already submitted
      const { data: existing } = await supabase
        .from("capstone_submissions")
        .select("id")
        .eq("user_id", user.id)
        .eq("project_id", projectId)
        .maybeSingle();

      if (existing) {
        // Update existing submission
        const { data, error } = await supabase
          .from("capstone_submissions")
          .update({
            submission_link: submissionLink,
            notes,
            status: "submitted",
            submitted_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new submission
        const { data, error } = await supabase
          .from("capstone_submissions")
          .insert({
            user_id: user.id,
            project_id: projectId,
            submission_link: submissionLink,
            notes,
            status: "submitted",
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capstone-submissions"] });
      toast.success("Project submitted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to submit: " + error.message);
    },
  });
}

// Admin hooks for managing capstone projects
export function useCreateCapstoneProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: {
      title: string;
      description?: string;
      instructions?: string;
      course_id?: string;
      due_date?: string;
    }) => {
      const { data, error } = await supabase
        .from("capstone_projects")
        .insert(project)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capstone-projects"] });
      toast.success("Capstone project created!");
    },
    onError: (error) => {
      toast.error("Failed to create project: " + error.message);
    },
  });
}

export function useUpdateCapstoneProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      description?: string;
      instructions?: string;
      course_id?: string;
      due_date?: string;
    }) => {
      const { error } = await supabase
        .from("capstone_projects")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capstone-projects"] });
      toast.success("Capstone project updated!");
    },
    onError: (error) => {
      toast.error("Failed to update project: " + error.message);
    },
  });
}

export function useDeleteCapstoneProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("capstone_projects")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["capstone-projects"] });
      toast.success("Capstone project deleted!");
    },
    onError: (error) => {
      toast.error("Failed to delete project: " + error.message);
    },
  });
}
