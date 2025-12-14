import { useState } from "react";
import { Menu, X, LayoutDashboard, Compass, Route, ClipboardCheck, FolderKanban, Award, MessageSquare, HelpCircle, Shield, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const navItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { id: "explore", icon: Compass, label: "Explore Courses", path: "/explore-courses" },
  { id: "learning-path", icon: Route, label: "Learning Path", path: "/learning-path" },
  { id: "quiz", icon: ClipboardCheck, label: "Quiz & Assessment", path: "/quiz-assessment" },
  { id: "capstone", icon: FolderKanban, label: "Capstone Project", path: "/capstone-project" },
  { id: "certificates", icon: Award, label: "Certificates", path: "/certificates" },
  { id: "forum", icon: MessageSquare, label: "Course Forum", path: "/course-forum" },
  { id: "qa", icon: HelpCircle, label: "Q&A", path: "/qa" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminCheck();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    setOpen(false);
    navigate("/");
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="w-5 h-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">L</span>
            </div>
            <SheetTitle className="text-foreground">LearnHub</SheetTitle>
          </div>
        </SheetHeader>

        <nav className="flex flex-col py-4 px-2 gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.path)}
                className={cn(
                  "flex items-center gap-3 h-11 rounded-lg transition-all duration-200 px-3 w-full text-left",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}

          {isAdmin && (
            <>
              <div className="mt-4 mb-2 px-3">
                <span className="text-xs font-medium text-muted-foreground">Admin</span>
              </div>
              <button
                onClick={() => handleNavClick("/admin")}
                className={cn(
                  "flex items-center gap-3 h-11 rounded-lg transition-all duration-200 px-3 w-full text-left",
                  location.pathname.startsWith("/admin")
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">Admin Portal</span>
              </button>
            </>
          )}

          {user && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 h-11 rounded-lg px-3 w-full text-left mt-4 text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
