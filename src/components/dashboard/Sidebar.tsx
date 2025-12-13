import { LayoutDashboard, Compass, Route, ClipboardCheck, FolderKanban, Award, MessageSquare, HelpCircle, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
interface SidebarProps {
  activeItem?: string;
  isExpanded: boolean;
  onToggle: () => void;
}
const topItems = [{
  id: "dashboard",
  icon: LayoutDashboard,
  label: "Dashboard"
}, {
  id: "explore",
  icon: Compass,
  label: "Explore Courses",
  badge: "12"
}];
const myLearningItems = [{
  id: "learning-path",
  icon: Route,
  label: "Learning Path"
}, {
  id: "quiz",
  icon: ClipboardCheck,
  label: "Quiz and Assessment"
}];
const progressItems = [{
  id: "capstone",
  icon: FolderKanban,
  label: "Capstone Project"
}, {
  id: "certificates",
  icon: Award,
  label: "Certificates"
}];
const forumItems = [{
  id: "forum",
  icon: MessageSquare,
  label: "Course Forum"
}, {
  id: "qa",
  icon: HelpCircle,
  label: "Q&A"
}];
interface NavItemProps {
  id: string;
  icon: React.ElementType;
  label: string;
  badge?: string;
  isActive: boolean;
  isExpanded: boolean;
}
function NavItem({
  id,
  icon: Icon,
  label,
  badge,
  isActive,
  isExpanded
}: NavItemProps) {
  return <button className={cn("ripple flex items-center gap-3 h-10 rounded-lg transition-all duration-200 px-3 w-full", isActive ? "bg-primary/10 text-primary" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")} title={!isExpanded ? label : undefined}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      {isExpanded && <>
          <span className="text-sm truncate flex-1 text-left font-sans font-normal">{label}</span>
          {badge && <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">
              {badge}
            </span>}
        </>}
    </button>;
}
function SectionHeader({
  label,
  isExpanded
}: {
  label: string;
  isExpanded: boolean;
}) {
  if (!isExpanded) return null;
  return <div className="mt-4 mb-2 px-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>;
}
export function Sidebar({
  activeItem = "dashboard",
  isExpanded,
  onToggle
}: SidebarProps) {
  return <aside className={cn("fixed left-0 top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50", isExpanded ? "w-56" : "w-16")}>
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-sidebar-border px-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-semibold text-sm">L</span>
        </div>
        {isExpanded && <span className="ml-3 font-semibold text-foreground animate-fade-in">LearnHub</span>}
      </div>

      {/* Search */}
      {isExpanded && <div className="px-3 py-3 border-b border-sidebar-border">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search items..." className="pl-8 h-9 bg-sidebar-accent/50 border-sidebar-border text-sm" />
          </div>
        </div>}

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col py-4 px-2 gap-1 overflow-y-auto">
        {/* Top Items */}
        {topItems.map(item => <NavItem key={item.id} {...item} isActive={activeItem === item.id} isExpanded={isExpanded} />)}

        {/* My Learning Section */}
        <SectionHeader label="My Learning" isExpanded={isExpanded} />
        {myLearningItems.map(item => <NavItem key={item.id} {...item} isActive={activeItem === item.id} isExpanded={isExpanded} />)}

        {/* Progress Section */}
        <SectionHeader label="Progress" isExpanded={isExpanded} />
        {progressItems.map(item => <NavItem key={item.id} {...item} isActive={activeItem === item.id} isExpanded={isExpanded} />)}

        {/* Forum Section */}
        <SectionHeader label="Forum" isExpanded={isExpanded} />
        {forumItems.map(item => <NavItem key={item.id} {...item} isActive={activeItem === item.id} isExpanded={isExpanded} />)}
      </nav>

      {/* Toggle Button */}
      <div className="py-4 px-2 border-t border-sidebar-border">
        <button onClick={onToggle} className="ripple flex items-center gap-3 h-10 rounded-lg px-3 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200" title={isExpanded ? "Collapse sidebar" : "Expand sidebar"}>
          {isExpanded ? <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">Collapse</span>
            </> : <ChevronRight className="w-5 h-5 flex-shrink-0" />}
        </button>
      </div>
    </aside>;
}