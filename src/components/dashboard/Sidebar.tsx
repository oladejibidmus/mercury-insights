import { LayoutDashboard, Compass, Route, ClipboardCheck, FolderKanban, Award, MessageSquare, HelpCircle, ChevronLeft, ChevronRight, Search, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const topItems = [{
  id: "dashboard",
  icon: LayoutDashboard,
  label: "Dashboard",
  path: "/dashboard"
}, {
  id: "explore",
  icon: Compass,
  label: "Explore Courses",
  badge: "12",
  path: "/explore-courses"
}];

const myLearningItems = [{
  id: "learning-path",
  icon: Route,
  label: "Learning Path",
  path: "/learning-path"
}, {
  id: "quiz",
  icon: ClipboardCheck,
  label: "Quiz and Assessment",
  path: "/quiz-assessment"
}];

const progressItems = [{
  id: "capstone",
  icon: FolderKanban,
  label: "Capstone Project",
  path: "/capstone-project"
}, {
  id: "certificates",
  icon: Award,
  label: "Certificates",
  path: "/certificates"
}];

const forumItems = [{
  id: "forum",
  icon: MessageSquare,
  label: "Course Forum",
  path: "/course-forum"
}, {
  id: "qa",
  icon: HelpCircle,
  label: "Q&A",
  path: "/qa"
}];

const adminItem = {
  id: "admin",
  icon: Shield,
  label: "Admin Portal",
  path: "/admin"
};

interface NavItemProps {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  path: string;
  isExpanded: boolean;
}

function NavItem({
  icon: Icon,
  label,
  badge,
  path,
  isExpanded
}: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={cn(
        "ripple flex items-center gap-3 h-10 rounded-lg transition-all duration-200 px-3 w-full",
        isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
      title={!isExpanded ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {isExpanded && (
        <>
          <span className="text-sm truncate flex-1 text-left font-sans font-normal">{label}</span>
          {badge && (
            <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}

function SectionHeader({
  label,
  isExpanded
}: {
  label: string;
  isExpanded: boolean;
}) {
  if (!isExpanded) return null;
  return (
    <div className="mt-4 mb-2 px-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function Sidebar({
  isExpanded,
  onToggle
}: SidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };
  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
      isExpanded ? "w-56" : "w-16"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-sidebar-border px-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-semibold text-sm">L</span>
        </div>
        {isExpanded && <span className="ml-3 font-semibold text-foreground animate-fade-in">LearnHub</span>}
      </div>

      {/* Search */}
      {isExpanded && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-8 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm" />
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col py-4 px-2 gap-1 overflow-y-auto">
        {/* Top Items */}
        {topItems.map(item => <NavItem key={item.id} {...item} isExpanded={isExpanded} />)}

        {/* My Learning Section */}
        <SectionHeader label="My Learning" isExpanded={isExpanded} />
        {myLearningItems.map(item => <NavItem key={item.id} {...item} isExpanded={isExpanded} />)}

        {/* Progress Section */}
        <SectionHeader label="Progress" isExpanded={isExpanded} />
        {progressItems.map(item => <NavItem key={item.id} {...item} isExpanded={isExpanded} />)}

        {/* Forum Section */}
        <SectionHeader label="Forum" isExpanded={isExpanded} />
        {forumItems.map(item => <NavItem key={item.id} {...item} isExpanded={isExpanded} />)}

        {/* Admin Section */}
        <SectionHeader label="Admin" isExpanded={isExpanded} />
        <NavItem {...adminItem} isExpanded={isExpanded} />
      </nav>

      {/* Sign Out & Toggle */}
      <div className="py-4 px-2 border-t border-sidebar-border space-y-1">
        {user && (
          <button
            onClick={handleSignOut}
            className="ripple flex items-center gap-3 h-10 rounded-lg px-3 w-full text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            title={isExpanded ? "Sign out" : "Sign out"}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isExpanded && <span className="text-sm font-medium">Sign Out</span>}
          </button>
        )}
        <button
          onClick={onToggle}
          className="ripple flex items-center gap-3 h-10 rounded-lg px-3 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
          title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isExpanded ? (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Collapse</span>
            </>
          ) : (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          )}
        </button>
      </div>
    </aside>
  );
}
