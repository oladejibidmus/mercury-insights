import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
interface AdminSettings {
  site: {
    platformName: string;
    description: string;
    contactEmail: string;
    logo: string;
  };
  notifications: {
    emailWelcome: boolean;
    emailCourseCompletion: boolean;
    emailPasswordReset: boolean;
    emailDigest: boolean;
    inAppNewCourse: boolean;
    inAppForumReply: boolean;
    inAppCertificate: boolean;
  };
  auth: {
    autoConfirmEmail: boolean;
    allowSignup: boolean;
    requireEmailVerification: boolean;
  };
}

const defaultSettings: AdminSettings = {
  site: {
    platformName: "LearnHub",
    description: "Your gateway to professional learning",
    contactEmail: "support@learnhub.com",
    logo: "",
  },
  notifications: {
    emailWelcome: true,
    emailCourseCompletion: true,
    emailPasswordReset: true,
    emailDigest: false,
    inAppNewCourse: true,
    inAppForumReply: true,
    inAppCertificate: true,
  },
  auth: {
    autoConfirmEmail: true,
    allowSignup: true,
    requireEmailVerification: false,
  },
};

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_settings")
        .select("key, value");

      if (error) throw error;

      const settings = { ...defaultSettings };
      
      data?.forEach((row) => {
        if (row.key === "site") settings.site = row.value as AdminSettings["site"];
        if (row.key === "notifications") settings.notifications = row.value as AdminSettings["notifications"];
        if (row.key === "auth") settings.auth = row.value as AdminSettings["auth"];
      });

      return settings;
    },
  });
}

export function useUpdateAdminSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: Json }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if setting exists
      const { data: existing } = await supabase
        .from("admin_settings")
        .select("id")
        .eq("key", key)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("admin_settings")
          .update({
            value,
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          })
          .eq("key", key);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("admin_settings")
          .insert([{
            key,
            value,
            updated_at: new Date().toISOString(),
            updated_by: user?.id,
          }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: () => {
      toast.error("Failed to save settings");
    },
  });
}
