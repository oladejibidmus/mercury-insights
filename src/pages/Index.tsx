import { useState } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { AddTransactionButton } from "@/components/dashboard/AddTransactionButton";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { useDashboardData } from "@/hooks/useDashboardData";

type FilterOption = "7d" | "30d" | "all";

const Index = () => {
  const [dateFilter, setDateFilter] = useState<FilterOption>("30d");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const { account, transactions, isLoading } = useDashboardData(dateFilter);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        activeItem="home" 
        isExpanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
      />
      
      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarExpanded ? "pl-52" : "pl-16"}`}>
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 animate-fade-in">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <DateFilter value={dateFilter} onChange={setDateFilter} />
            {account && <AddTransactionButton accountId={account.id} />}
            <ThemeToggle />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="lg:col-span-1">
              <BalanceCard
                accountName={account?.name || "Loading..."}
                balance={account?.balance || 0}
                isLoading={isLoading}
              />
            </div>

            {/* Cash Flow Chart */}
            <div className="lg:col-span-2">
              <CashFlowChart
                transactions={transactions}
                dateFilter={dateFilter}
                isLoading={isLoading}
              />
            </div>

            {/* Transactions Table */}
            <div className="lg:col-span-3">
              <TransactionsTable
                transactions={transactions.slice(0, 10)}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
