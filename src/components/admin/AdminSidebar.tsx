import { LayoutDashboard, Users, BookOpen, MessageSquare, BarChart3, ChevronLeft, ChevronRight, Search, Shield, Settings, LogOut, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AdminSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const overviewItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/admin"
  },
];

const managementItems = [
  {
    id: "users",
    icon: Users,
    label: "User Management",
    path: "/admin/users"
  },
  {
    id: "courses",
    icon: BookOpen,
    label: "Course Management",
    path: "/admin/courses"
  },
  {
    id: "capstone-grading",
    icon: ClipboardCheck,
    label: "Capstone Grading",
    path: "/admin/capstone-grading"
  },
];

const moderationItems = [
  {
    id: "moderation",
    icon: MessageSquare,
    label: "Forum Moderation",
    path: "/admin/moderation"
  },
];

const analyticsItems = [
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics & Reports",
    path: "/admin/analytics"
  },
];

const settingsItems = [
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    path: "/admin/settings"
  },
];

interface NavItemProps {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  path: string;
  isExpanded: boolean;
}

function NavItem({ icon: Icon, label, badge, path, isExpanded }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={cn(
        "ripple flex items-center gap-3 h-10 rounded-lg transition-all duration-200 px-3 w-full",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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

function SectionHeader({ label, isExpanded }: { label: string; isExpanded: boolean }) {
  if (!isExpanded) return null;
  return (
    <div className="mt-4 mb-2 px-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}

export function AdminSidebar({ isExpanded, onToggle }: AdminSidebarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
        isExpanded ? "w-56" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-sidebar-border px-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-primary-foreground" />
        </div>
        {isExpanded && (
          <span className="ml-3 font-semibold text-foreground animate-fade-in">Admin Portal</span>
        )}
      </div>

      {/* Search */}
      {isExpanded && (
        <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm"
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 flex flex-col py-4 px-2 gap-1 overflow-y-auto">
        {/* Overview */}
        {overviewItems.map((item) => (
          <NavItem key={item.id} {...item} isExpanded={isExpanded} />
        ))}

        {/* Management Section */}
        <SectionHeader label="Management" isExpanded={isExpanded} />
        {managementItems.map((item) => (
          <NavItem key={item.id} {...item} isExpanded={isExpanded} />
        ))}

        {/* Moderation Section */}
        <SectionHeader label="Moderation" isExpanded={isExpanded} />
        {moderationItems.map((item) => (
          <NavItem key={item.id} {...item} isExpanded={isExpanded} />
        ))}

        {/* Analytics Section */}
        <SectionHeader label="Insights" isExpanded={isExpanded} />
        {analyticsItems.map((item) => (
          <NavItem key={item.id} {...item} isExpanded={isExpanded} />
        ))}

        {/* Settings Section */}
        <SectionHeader label="System" isExpanded={isExpanded} />
        {settingsItems.map((item) => (
          <NavItem key={item.id} {...item} isExpanded={isExpanded} />
        ))}
      </nav>

      {/* Sign Out and Back to Student Portal */}
      <div className="px-2 pb-2 space-y-1 border-t border-sidebar-border pt-2">
        <button
          onClick={handleSignOut}
          className="ripple flex items-center gap-3 h-10 rounded-lg px-3 w-full text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          title={!isExpanded ? "Sign Out" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {isExpanded && <span className="text-sm font-medium">Sign Out</span>}
        </button>
        <Link
          to="/dashboard"
          className="ripple flex items-center gap-3 h-10 rounded-lg px-3 w-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
          title={!isExpanded ? "Back to Student Portal" : undefined}
        >
          <ChevronLeft className="w-4 h-4" />
          {isExpanded && <span>Back to Student Portal</span>}
        </Link>
      </div>

      {/* Toggle Button */}
      <div className="py-4 px-2 border-t border-sidebar-border">
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