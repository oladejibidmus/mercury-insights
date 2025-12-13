import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO, startOfDay, eachDayOfInterval, subDays } from "date-fns";
import type { Transaction } from "./TransactionsTable";

interface CashFlowChartProps {
  transactions: Transaction[];
  dateFilter: "7d" | "30d" | "all";
  isLoading?: boolean;
}

export function CashFlowChart({ transactions, dateFilter, isLoading }: CashFlowChartProps) {
  const chartData = useMemo(() => {
    if (!transactions.length) return [];

    const now = new Date();
    const daysToShow = dateFilter === "7d" ? 7 : dateFilter === "30d" ? 30 : 60;
    const startDate = subDays(now, daysToShow);

    // Create a map of daily cash flow
    const dailyFlow = new Map<string, { inflow: number; outflow: number }>();

    // Initialize all days with zero values
    const days = eachDayOfInterval({ start: startDate, end: now });
    days.forEach((day) => {
      const key = format(day, "yyyy-MM-dd");
      dailyFlow.set(key, { inflow: 0, outflow: 0 });
    });

    // Aggregate transactions by day
    transactions.forEach((tx) => {
      const txDate = startOfDay(parseISO(tx.date));
      const key = format(txDate, "yyyy-MM-dd");
      const existing = dailyFlow.get(key);
      
      if (existing) {
        if (tx.type === "credit") {
          existing.inflow += tx.amount;
        } else {
          existing.outflow += tx.amount;
        }
      }
    });

    // Convert to array for chart
    return Array.from(dailyFlow.entries())
      .map(([date, { inflow, outflow }]) => ({
        date,
        inflow,
        outflow,
        net: inflow - outflow,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions, dateFilter]);

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in-delay-1">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Cash Flow</h3>
        </div>
        <div className="h-64 flex items-center justify-center">
          <div className="w-full h-full bg-muted/30 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}k`;
    }
    return `$${value}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 animate-fade-in-delay-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Cash Flow</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-muted-foreground">Inflow</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Outflow</span>
          </div>
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="inflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="outflowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(0, 72%, 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }}
              tickFormatter={(value) => format(parseISO(value), "MMM d")}
              tickMargin={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }}
              tickFormatter={formatYAxis}
              tickMargin={8}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 7%)",
                border: "1px solid hsl(0, 0%, 14%)",
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              }}
              labelFormatter={(value) => format(parseISO(value), "MMMM d, yyyy")}
              formatter={(value: number, name: string) => [
                `$${value.toLocaleString()}`,
                name.charAt(0).toUpperCase() + name.slice(1),
              ]}
            />
            <Area
              type="monotone"
              dataKey="inflow"
              stroke="hsl(142, 76%, 36%)"
              strokeWidth={2}
              fill="url(#inflowGradient)"
            />
            <Area
              type="monotone"
              dataKey="outflow"
              stroke="hsl(0, 72%, 51%)"
              strokeWidth={2}
              fill="url(#outflowGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
