import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CourseCompletionRequest {
  userId: string;
  courseId: string;
  courseTitle: string;
  credentialId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Check if course completion emails are enabled
    const { data: notificationSettings } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "notifications")
      .single();

    const emailCourseCompletion = notificationSettings?.value?.emailCourseCompletion ?? true;

    if (!emailCourseCompletion) {
      console.log("Course completion emails are disabled in admin settings");
      return new Response(
        JSON.stringify({ message: "Course completion emails are disabled" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const { userId, courseId, courseTitle, credentialId }: CourseCompletionRequest = await req.json();

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("user_id", userId)
      .single();

    if (!profile?.email) {
      console.error("User profile or email not found");
      return new Response(
        JSON.stringify({ error: "User email not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const userName = profile.name || "Learner";
    const userEmail = profile.email;

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "LearnHub <noreply@mydatalearn.co.uk>",
        to: [userEmail],
        subject: `🎉 Congratulations! You've completed "${courseTitle}"`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background: linear-gradient(135deg, #9a3412 0%, #c2410c 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🎓 Course Completed!</h1>
            </div>
            
            <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="font-size: 18px; margin-bottom: 20px;">Hi <strong>${userName}</strong>,</p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Congratulations on completing <strong>"${courseTitle}"</strong>! 🎉
              </p>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                Your dedication and hard work have paid off. You've earned a certificate of completion!
              </p>
              
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; font-size: 14px;">
                  <strong>Certificate ID:</strong> ${credentialId}
                </p>
              </div>
              
              <p style="font-size: 16px; margin-bottom: 20px;">
                You can view and download your certificate from your dashboard at any time.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://aomeifyoavxpjjzxywsb.lovable.app/certificates" 
                   style="background: linear-gradient(135deg, #9a3412 0%, #c2410c 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
                  View My Certificate
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #6b7280; text-align: center;">
                Keep learning! Check out more courses to continue your growth.
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p>© 2025 LearnHub. All rights reserved.</p>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const data = await res.json();
    console.log("Course completion email sent successfully:", data);

    return new Response(
      JSON.stringify({ message: "Course completion email sent", data }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending course completion email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
};

serve(handler);
