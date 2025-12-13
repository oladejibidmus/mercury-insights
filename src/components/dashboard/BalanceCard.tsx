import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardProps {
  accountName: string;
  balance: number;
  isLoading?: boolean;
}

export function BalanceCard({ accountName, balance, isLoading }: BalanceCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 hover-glow animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-muted-foreground text-sm font-medium mb-1">
            Available Balance
          </p>
          <h2 className="text-3xl font-semibold tracking-tighter">
            {isLoading ? (
              <span className="inline-block w-40 h-9 bg-muted rounded animate-pulse" />
            ) : (
              formatCurrency(balance)
            )}
          </h2>
        </div>
        <div className="flex items-center gap-1 text-success text-sm font-medium bg-success/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          <span>+12.5%</span>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{accountName}</p>
        <div className="flex gap-2">
          <button className="ripple px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            Send
          </button>
          <button className="ripple px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-foreground hover:bg-secondary transition-colors">
            Receive
          </button>
        </div>
      </div>
    </div>
  );
}
