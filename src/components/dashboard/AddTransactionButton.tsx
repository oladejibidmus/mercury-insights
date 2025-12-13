import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface AddTransactionButtonProps {
  accountId: string;
}

export function AddTransactionButton({ accountId }: AddTransactionButtonProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    type: "credit" as "credit" | "debit",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("transactions").insert({
        account_id: accountId,
        amount: parseFloat(formData.amount),
        type: formData.type,
        description: formData.description || null,
        date: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Transaction added successfully");
      setOpen(false);
      setFormData({ amount: "", type: "credit", description: "" });
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="ripple flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Amount
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, amount: e.target.value }))
              }
              placeholder="0.00"
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "credit" }))
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  formData.type === "credit"
                    ? "bg-success text-success-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Credit (Income)
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, type: "debit" }))
                }
                className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  formData.type === "debit"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                Debit (Expense)
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter description..."
              className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="ripple w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Adding..." : "Add Transaction"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
