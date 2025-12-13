import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { BookOpen, GraduationCap, Users, Award, ArrowRight } from "lucide-react";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-semibold tracking-tight">LearnHub</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Master New Skills with
            <span className="block text-primary mt-2">Expert-Led Courses</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners advancing their careers through data science, 
            analytics, and visualization courses taught by industry professionals.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/auth?tab=signup">
              <Button size="lg" className="gap-2">
                Start Learning Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">Why Choose LearnHub?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card rounded-xl p-6 border border-border animate-fade-in-delay-1">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Instructors</h3>
              <p className="text-muted-foreground">
                Learn from industry professionals with real-world experience in data science and analytics.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border animate-fade-in-delay-2">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Community Support</h3>
              <p className="text-muted-foreground">
                Connect with fellow learners, ask questions, and collaborate on projects.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border animate-fade-in-delay-3">
              <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Earn Certificates</h3>
              <p className="text-muted-foreground">
                Complete courses and receive certificates to showcase your achievements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Ready to Start Your Learning Journey?</h2>
          <p className="text-muted-foreground mb-8">
            Create your free account today and get access to our library of courses.
          </p>
          <Link to="/auth?tab=signup">
            <Button size="lg" className="gap-2">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>LearnHub</span>
          </div>
          <p>© 2024 LearnHub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
