import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      <main className={cn(
        "flex-1 p-8 transition-all duration-300",
        isExpanded ? "ml-56" : "ml-16"
      )}>
        {children}
      </main>
    </div>
  );
}
