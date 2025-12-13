import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import type { Transaction } from "@/components/dashboard/TransactionsTable";

interface Account {
  id: string;
  name: string;
  balance: number;
}

type DateFilter = "7d" | "30d" | "all";

export function useDashboardData(dateFilter: DateFilter) {
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);

      try {
        // Fetch account
        const { data: accountData, error: accountError } = await supabase
          .from("accounts")
          .select("*")
          .limit(1)
          .maybeSingle();

        if (accountError) {
          console.error("Error fetching account:", accountError);
          return;
        }

        if (accountData) {
          setAccount({
            id: accountData.id,
            name: accountData.name,
            balance: Number(accountData.balance),
          });
        }

        // Calculate date range
        const now = new Date();
        let fromDate: Date | null = null;
        if (dateFilter === "7d") {
          fromDate = subDays(now, 7);
        } else if (dateFilter === "30d") {
          fromDate = subDays(now, 30);
        }

        // Fetch transactions
        let query = supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: false });

        if (fromDate) {
          query = query.gte("date", fromDate.toISOString());
        }

        const { data: txData, error: txError } = await query;

        if (txError) {
          console.error("Error fetching transactions:", txError);
          return;
        }

        setTransactions(
          (txData || []).map((tx) => ({
            id: tx.id,
            amount: Number(tx.amount),
            type: tx.type as "credit" | "debit",
            description: tx.description,
            date: tx.date,
          }))
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [dateFilter]);

  // Set up realtime subscriptions
  useEffect(() => {
    // Subscribe to account changes
    const accountChannel = supabase
      .channel("accounts-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "accounts" },
        (payload) => {
          if (payload.eventType === "UPDATE" && payload.new) {
            setAccount((prev) => {
              if (prev && prev.id === payload.new.id) {
                return {
                  ...prev,
                  balance: Number(payload.new.balance),
                };
              }
              return prev;
            });
          }
        }
      )
      .subscribe();

    // Subscribe to transaction changes
    const txChannel = supabase
      .channel("transactions-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        (payload) => {
          const newTx = payload.new;
          setTransactions((prev) => [
            {
              id: newTx.id,
              amount: Number(newTx.amount),
              type: newTx.type as "credit" | "debit",
              description: newTx.description,
              date: newTx.date,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(accountChannel);
      supabase.removeChannel(txChannel);
    };
  }, []);

  return { account, transactions, isLoading };
}
