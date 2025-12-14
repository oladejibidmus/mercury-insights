import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Check, Github, Mail, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab as "signin" | "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const {
    user,
    signIn,
    signUp
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user && !justSignedUp) {
      navigate("/explore-courses");
    }
  }, [user, navigate, justSignedUp]);
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const {
      error
    } = await signIn(email, password);
    setIsLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Signed in successfully!");
      navigate("/");
    }
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setJustSignedUp(true);
    setIsLoading(true);
    const {
      error
    } = await signUp(email, password, {
      name: fullName.trim(),
      bio: bio.trim() || undefined
    });
    setIsLoading(false);
    if (error) {
      setJustSignedUp(false);
      toast.error(error.message);
    } else {
      toast.success("Account created successfully! Check your email for a welcome message.", {
        duration: 4000
      });
      setTimeout(() => {
        navigate("/explore-courses");
      }, 2000);
    }
  };
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    setIsResetting(true);
    const {
      error
    } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?tab=signin`
    });
    setIsResetting(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset email sent! Check your inbox.");
      setResetDialogOpen(false);
      setResetEmail("");
    }
  };
  const features = ["100+ hands-on courses in Python, SQL, Tableau, and Power BI", "Industry-recognized certificates upon completion", "Learn at your own pace with lifetime access", "Real-time Q&A forum with expert instructors"];
  return <div className="flex w-full items-start min-h-screen max-md:flex-col max-md:flex-nowrap max-md:gap-0">
      {/* Left Panel - Marketing */}
      <div className="flex min-w-[448px] grow shrink-0 basis-0 flex-col items-start justify-between self-stretch px-12 py-12 bg-gradient-to-br from-primary to-primary/80 max-md:w-full max-md:min-w-0 max-md:grow max-md:shrink-0 max-md:basis-0 max-md:px-6 max-md:py-8">
        <div className="flex w-full flex-col items-start gap-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-white font-semibold text-xl">DataLearn</span>
          </div>
          <div className="flex w-full flex-col items-start gap-4">
            <span className="w-full text-3xl text-white leading-tight font-semibold">
              Master Data Analytics with Expert-Led Courses
            </span>
            <span className="w-full text-lg font-medium text-white/90">
              Join thousands of learners advancing their careers in data science, analytics, and visualization
            </span>
          </div>
        </div>
        
        <div className="flex w-full flex-col items-start gap-6 my-8">
          {features.map((feature, index) => <div key={index} className="flex items-center gap-3">
              <Check className="h-5 w-5 text-white flex-shrink-0" />
              <span className="text-sm text-white">
                {feature}
              </span>
            </div>)}
        </div>

        <div className="flex w-full flex-col items-start gap-2">
          <span className="text-xs text-white/70">
            Trusted by data professionals worldwide
          </span>
          <div className="flex items-center gap-4">
            <div className="h-6 w-16 bg-white/20 rounded" />
            <div className="h-6 w-16 bg-white/20 rounded" />
            <div className="h-6 w-16 bg-white/20 rounded" />
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex min-w-[448px] grow shrink-0 basis-0 flex-col items-center justify-center gap-8 self-stretch bg-background px-12 py-12 max-md:w-full max-md:min-w-0 max-md:grow max-md:shrink-0 max-md:basis-0 max-md:px-6 max-md:py-8">
        <div className="flex w-full max-w-[384px] flex-col items-start gap-8">
          {/* Header */}
          <div className="flex w-full flex-col items-start gap-2">
            <span className="w-full text-3xl font-bold text-foreground">
              {activeTab === "signin" ? "Sign in to your account" : "Create your account"}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">
                {activeTab === "signin" ? "New to our platform?" : "Already have an account?"}
              </span>
              <button type="button" onClick={() => setActiveTab(activeTab === "signin" ? "signup" : "signin")} className="text-sm font-medium text-primary hover:underline">
                {activeTab === "signin" ? "Create an account" : "Sign in"}
              </button>
            </div>
          </div>

          {/* Sign In Form */}
          {activeTab === "signin" ? <form onSubmit={handleSignIn} className="flex w-full flex-col items-start gap-4">
              <div className="w-full space-y-2">
                <Label htmlFor="signin-email">Email address</Label>
                <Input id="signin-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-10" />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input id="signin-password" type="password" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required className="h-10" />
              </div>
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" checked={rememberMe} onCheckedChange={checked => setRememberMe(checked as boolean)} />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
                <button type="button" onClick={() => {
              setResetEmail(email);
              setResetDialogOpen(true);
            }} className="text-sm font-medium text-primary hover:underline">
                  Forgot password?
                </button>
              </div>

              <div className="flex w-full flex-col items-start gap-3 pt-4">
                <Button type="submit" className="h-10 w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sign in
                </Button>
                
                <div className="flex w-full items-center gap-3">
                  <div className="flex h-px grow shrink-0 basis-0 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    Or continue with
                  </span>
                  <div className="flex h-px grow shrink-0 basis-0 bg-border" />
                </div>

                <div className="flex w-full items-center gap-3">
                  <Button type="button" variant="outline" className="h-10 grow shrink-0 basis-0" onClick={() => toast.info("Google sign in coming soon")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="h-10 grow shrink-0 basis-0" onClick={() => toast.info("GitHub sign in coming soon")}>
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </div>
              </div>
            </form> : (/* Sign Up Form */
        <form onSubmit={handleSignUp} className="flex w-full flex-col items-start gap-4">
              <div className="w-full space-y-2">
                <Label htmlFor="signup-name">Full Name <span className="text-destructive">*</span></Label>
                <Input id="signup-name" type="text" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required className="h-10" />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="signup-email">Email address <span className="text-destructive">*</span></Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="h-10" />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="signup-password">Password <span className="text-destructive">*</span></Label>
                <Input id="signup-password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-10" />
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="signup-bio">Tell us about yourself <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea id="signup-bio" placeholder="I'm excited to learn new skills..." value={bio} onChange={e => setBio(e.target.value)} rows={3} className="resize-none" />
              </div>

              <div className="flex w-full flex-col items-start gap-3 pt-4">
                <Button type="submit" className="h-10 w-full" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create account
                </Button>
                
                <div className="flex w-full items-center gap-3">
                  <div className="flex h-px grow shrink-0 basis-0 bg-border" />
                  <span className="text-xs text-muted-foreground">
                    Or continue with
                  </span>
                  <div className="flex h-px grow shrink-0 basis-0 bg-border" />
                </div>

                <div className="flex w-full items-center gap-3">
                  <Button type="button" variant="outline" className="h-10 grow shrink-0 basis-0" onClick={() => toast.info("Google sign up coming soon")}>
                    <Mail className="h-4 w-4 mr-2" />
                    Google
                  </Button>
                  <Button type="button" variant="outline" className="h-10 grow shrink-0 basis-0" onClick={() => toast.info("GitHub sign up coming soon")}>
                    <Github className="h-4 w-4 mr-2" />
                    GitHub
                  </Button>
                </div>
              </div>
            </form>)}

          {/* Terms */}
          <div className="flex w-full flex-col items-center gap-2">
            <span className="text-xs text-muted-foreground text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </span>
          </div>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input id="reset-email" type="email" placeholder="you@example.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Auth;