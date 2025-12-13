import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar isExpanded={isExpanded} onToggle={() => setIsExpanded(!isExpanded)} />
      <main
        className={cn(
          "flex-1 p-8 transition-all duration-300",
          isExpanded ? "ml-56" : "ml-16"
        )}
      >
        {children}
      </main>
    </div>
  );
}
