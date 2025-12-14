import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileMenu } from "@/components/dashboard/MobileMenu";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 border-b border-border flex items-center justify-between px-4 bg-card sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <MobileMenu />
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">L</span>
            </div>
            <span className="font-semibold text-foreground">LearnHub</span>
          </div>
          <ThemeToggle />
        </header>

        {/* Main Content */}
        <main className={cn(
          "flex-1 p-4 md:p-8 transition-all duration-300",
          "lg:ml-0",
          isExpanded ? "lg:ml-56" : "lg:ml-16"
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}
