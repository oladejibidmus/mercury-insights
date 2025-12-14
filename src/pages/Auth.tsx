import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Lightbulb, Rocket, Zap, Loader2, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "signin";
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(defaultTab as "signin" | "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [justSignedUp, setJustSignedUp] = useState(false);
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't auto-redirect if user just signed up - let them see the success message
    if (user && !justSignedUp) {
      navigate("/explore-courses");
    }
  }, [user, navigate, justSignedUp]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signIn(email, password);
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
    const { error } = await signUp(email, password, { 
      name: fullName.trim(), 
      bio: bio.trim() || undefined 
    });
    setIsLoading(false);
    if (error) {
      setJustSignedUp(false);
      toast.error(error.message);
    } else {
      toast.success("Account created successfully! Check your email for a welcome message.", {
        duration: 4000,
      });
      // Delay navigation to let user see the success message
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
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth?tab=signin`,
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

  const features = [
    {
      icon: Lightbulb,
      title: "Spark your imagination",
      description: "Dive into a world where your creative ideas are instantly brought to life. Let's paint your thoughts in digital strokes."
    },
    {
      icon: Rocket,
      title: "Simplify the complex",
      description: "Say goodbye to mundane tasks. Our platform streamlines your workflow, freeing you to focus on what truly matters."
    },
    {
      icon: Zap,
      title: "Boost your brainpower",
      description: "Elevate your learning with tailored insights and resources. It's like having a personal coach in your pocket."
    }
  ];

  return (
    <div className="flex min-h-screen w-full flex-wrap items-center justify-center gap-12 bg-background px-12 py-12 max-md:flex-col max-md:gap-12 max-md:px-6 max-md:py-12">
      {/* Back to Home Link */}
      <Link 
        to="/" 
        className="absolute left-6 top-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Left Side - Features */}
      <div className="flex max-w-[576px] grow shrink-0 basis-0 flex-col items-center justify-center gap-12 self-stretch max-md:h-auto max-md:w-full max-md:max-w-[576px] max-md:flex-none">
        <div className="flex flex-col items-center justify-center gap-6 px-12 max-md:px-0 max-md:py-0">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="flex w-full items-start justify-center gap-4 px-2 py-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <feature.icon className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex flex-col items-start gap-1">
                <span className="w-full text-lg font-semibold text-primary">
                  {feature.title}
                </span>
                <span className="w-full text-sm text-muted-foreground">
                  {feature.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex max-w-[448px] grow shrink-0 basis-0 flex-col items-center justify-center gap-6 rounded-md bg-card px-12 py-12 shadow-lg border border-border">
        <div className="flex w-full flex-col items-center justify-center gap-8">
          <span className="w-full text-2xl font-semibold text-foreground text-center">
            {activeTab === "signup" ? "Create your account" : "Welcome back"}
          </span>

          {activeTab === "signin" ? (
            <form onSubmit={handleSignIn} className="flex w-full flex-col items-start justify-center gap-6">
              <div className="w-full space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="w-full space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password">Password</Label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setResetDialogOpen(true);
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <Button type="submit" className="h-10 w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Sign In
              </Button>
              <div className="flex w-full flex-wrap items-center justify-center gap-1">
                <span className="text-sm text-foreground">
                  Don't have an account?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("signup")}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Sign Up
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="flex w-full flex-col items-start justify-center gap-6">
              <div className="w-full space-y-2">
                <Label htmlFor="signup-name">Name <span className="text-destructive">*</span></Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="signup-email">Email <span className="text-destructive">*</span></Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-10"
                />
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="signup-password">Password <span className="text-destructive">*</span></Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
              <div className="w-full space-y-2">
                <Label htmlFor="signup-bio">Tell us about yourself <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea
                  id="signup-bio"
                  placeholder="I'm excited to learn new skills..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <Button type="submit" className="h-10 w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Create account
              </Button>
              <div className="flex w-full flex-wrap items-center justify-center gap-1">
                <span className="text-sm text-foreground">
                  Have an account?
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab("signin")}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Sign In
                </button>
              </div>
            </form>
          )}
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
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResetDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Send Reset Link
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
