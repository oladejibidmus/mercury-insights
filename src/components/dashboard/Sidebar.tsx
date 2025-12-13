import { Home, ArrowUpDown, CreditCard, Settings, PieChart, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem?: string;
  isExpanded: boolean;
  onToggle: () => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "transactions", icon: ArrowUpDown, label: "Transactions" },
  { id: "cards", icon: CreditCard, label: "Cards" },
  { id: "analytics", icon: PieChart, label: "Analytics" },
];

const bottomItems = [
  { id: "settings", icon: Settings, label: "Settings" },
  { id: "help", icon: HelpCircle, label: "Help" },
];

export function Sidebar({ activeItem = "home", isExpanded, onToggle }: SidebarProps) {
  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 z-50",
        isExpanded ? "w-52" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-sidebar-border px-4">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span className="text-primary-foreground font-semibold text-sm">M</span>
        </div>
        {isExpanded && (
          <span className="ml-3 font-semibold text-foreground animate-fade-in">Mercury</span>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col py-4 px-2 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={cn(
                "ripple flex items-center gap-3 h-10 rounded-lg transition-all duration-200 px-3",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col py-4 px-2 gap-1 border-t border-sidebar-border">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="ripple flex items-center gap-3 h-10 rounded-lg px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {isExpanded && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </button>
          );
        })}
        
        {/* Toggle Button */}
        <button
          onClick={onToggle}
          className="ripple flex items-center gap-3 h-10 rounded-lg px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 mt-2"
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
