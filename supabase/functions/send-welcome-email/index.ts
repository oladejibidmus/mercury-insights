import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Send welcome email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name }: WelcomeEmailRequest = await req.json();
    console.log(`Sending welcome email to: ${email}, name: ${name}`);

    const displayName = name || "Learner";

    const emailResponse = await resend.emails.send({
      from: "LearnHub <onboarding@resend.dev>",
      to: [email],
      subject: "Welcome to LearnHub! 🎓 Start Your Learning Journey",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5; padding: 40px 20px;">
              <tr>
                <td align="center">
                  <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #9a3412; padding: 32px 40px; text-align: center;">
                        <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Welcome to LearnHub!</h1>
                      </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                      <td style="padding: 40px;">
                        <h2 style="margin: 0 0 16px; color: #18181b; font-size: 24px;">Hi ${displayName}! 👋</h2>
                        <p style="margin: 0 0 24px; color: #52525b; font-size: 16px; line-height: 1.6;">
                          We're thrilled to have you join our community of learners! Your account has been successfully created, and you're all set to start your learning journey.
                        </p>
                        
                        <h3 style="margin: 0 0 16px; color: #18181b; font-size: 18px;">Here's what you can do:</h3>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 16px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 12px;">
                              <strong style="color: #92400e;">📚 Explore Courses</strong>
                              <p style="margin: 8px 0 0; color: #78350f; font-size: 14px;">Browse our extensive library of courses across various topics.</p>
                            </td>
                          </tr>
                        </table>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 16px; background-color: #dbeafe; border-radius: 8px;">
                              <strong style="color: #1e40af;">🛤️ Learning Paths</strong>
                              <p style="margin: 8px 0 0; color: #1e3a8a; font-size: 14px;">Follow structured learning paths to master new skills step by step.</p>
                            </td>
                          </tr>
                        </table>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                          <tr>
                            <td style="padding: 16px; background-color: #dcfce7; border-radius: 8px;">
                              <strong style="color: #166534;">🏆 Earn Certificates</strong>
                              <p style="margin: 8px 0 0; color: #14532d; font-size: 14px;">Complete courses and earn certificates to showcase your achievements.</p>
                            </td>
                          </tr>
                        </table>
                        
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                          <tr>
                            <td style="padding: 16px; background-color: #f3e8ff; border-radius: 8px;">
                              <strong style="color: #7c3aed;">💬 Join the Community</strong>
                              <p style="margin: 8px 0 0; color: #5b21b6; font-size: 14px;">Connect with fellow learners in our forums and Q&A sections.</p>
                            </td>
                          </tr>
                        </table>
                        
                        <!-- CTA Button -->
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center">
                              <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '.lovable.app')}/explore-courses" 
                                 style="display: inline-block; padding: 16px 32px; background-color: #9a3412; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                                Start Learning Now →
                              </a>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                      <td style="padding: 24px 40px; background-color: #f4f4f5; text-align: center; border-top: 1px solid #e4e4e7;">
                        <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                          Happy Learning! 🚀
                        </p>
                        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                          The LearnHub Team
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, data: emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
