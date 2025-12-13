import { Home, ArrowUpDown, CreditCard, Settings, PieChart, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeItem?: string;
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

export function Sidebar({ activeItem = "home" }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 flex flex-col bg-sidebar border-r border-sidebar-border animate-slide-in-left">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-semibold text-sm">M</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center py-4 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              className={cn(
                "ripple w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="flex flex-col items-center py-4 gap-1 border-t border-sidebar-border">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className="ripple w-10 h-10 rounded-lg flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
              title={item.label}
            >
              <Icon className="w-5 h-5" />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
