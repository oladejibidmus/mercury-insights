import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
export interface Transaction {
  id: string;
  amount: number;
  type: "credit" | "debit";
  description: string | null;
  date: string;
}
interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}
export function TransactionsTable({
  transactions,
  isLoading
}: TransactionsTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2
    }).format(amount);
  };
  if (isLoading) {
    return <div className="bg-card rounded-xl border border-border animate-fade-in-delay-2">
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold">Recent Transactions</h3>
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1">
                <div className="w-32 h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="w-20 h-3 bg-muted rounded animate-pulse" />
              </div>
              <div className="w-24 h-4 bg-muted rounded animate-pulse" />
            </div>)}
        </div>
      </div>;
  }
  return <div className="bg-card rounded-xl border border-border animate-fade-in-delay-2">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="text-lg font-semibold">Total Signups
 </h3>
        <button className="text-primary text-sm font-medium hover:underline">
          View all
        </button>
      </div>
      <div className="divide-y divide-border">
        {transactions.length === 0 ? <div className="p-8 text-center text-muted-foreground">
            No transactions found
          </div> : transactions.map((tx, index) => <div key={tx.id} className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors" style={{
        animationDelay: `${index * 50}ms`
      }}>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", tx.type === "credit" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                {tx.type === "credit" ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {tx.description || "Transaction"}
                </p>
                <p className="text-muted-foreground text-xs">
                  {format(new Date(tx.date), "MMM d, yyyy • h:mm a")}
                </p>
              </div>
              <p className={cn("font-semibold text-sm tabular-nums", tx.type === "credit" ? "text-success" : "text-foreground")}>
                {tx.type === "credit" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </p>
            </div>)}
      </div>
    </div>;
}