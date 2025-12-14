import { AdminLayout } from "@/components/admin/AdminLayout";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { TransactionsTable } from "@/components/dashboard/TransactionsTable";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useState } from "react";

type FilterOption = "7d" | "30d" | "all";

const AdminDashboard = () => {
  const [dateFilter, setDateFilter] = useState<FilterOption>("30d");
  const { account, transactions, isLoading } = useDashboardData(dateFilter);

  return (
    <AdminLayout>
      {/* Header */}
      <header className="h-16 -mt-8 -mx-8 px-8 mb-6 border-b border-border flex items-center justify-between bg-background animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <DateFilter value={dateFilter} onChange={setDateFilter} />
          <ThemeToggle />
        </div>
      </header>

      {/* Dashboard Grid */}
      <div>
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
    </AdminLayout>
  );
};

export default AdminDashboard;