import { LayoutDashboard, Users, BookOpen, MessageSquare, BarChart3, ChevronLeft, ChevronRight, Search, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "react-router-dom";

interface AdminSidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
}

const navItems = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/admin"
  },
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
    id: "moderation",
    icon: MessageSquare,
    label: "Forum Moderation",
    path: "/admin/moderation"
  },
  {
    id: "analytics",
    icon: BarChart3,
    label: "Analytics & Reports",
    path: "/admin/analytics"
  },
  {
    id: "settings",
    icon: Shield,
    label: "Settings",
    path: "/admin/settings"
  },
];

interface NavItemProps {
  id: string;
  icon: React.ElementType;
  label: string;
  path: string;
  isExpanded: boolean;
}

function NavItem({ icon: Icon, label, path, isExpanded }: NavItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 h-10 rounded-lg transition-all duration-200 px-3 w-full",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
      title={!isExpanded ? label : undefined}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {isExpanded && (
        <span className="text-sm truncate flex-1 text-left font-normal">{label}</span>
      )}
    </Link>
  );
}

export function AdminSidebar({ isExpanded, onToggle }: AdminSidebarProps) {
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
        {navItems.map((item) => (
          <NavItem key={item.id} {...item} isExpanded={isExpanded} />
        ))}
      </nav>

      {/* Back to Student Portal */}
      <div className="px-2 pb-2">
        <Link
          to="/"
          className="flex items-center gap-3 h-10 rounded-lg px-3 w-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          {isExpanded && <span>Back to Student Portal</span>}
        </Link>
      </div>

      {/* Toggle Button */}
      <div className="py-4 px-2 border-t border-sidebar-border">
        <button
          onClick={onToggle}
          className="flex items-center gap-3 h-10 rounded-lg px-3 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
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
