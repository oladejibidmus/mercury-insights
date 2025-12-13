-- Create accounts table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  balance DECIMAL(15, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (public read for demo purposes)
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create public read policies for demo
CREATE POLICY "Public read access for accounts"
ON public.accounts FOR SELECT USING (true);

CREATE POLICY "Public read access for transactions"
ON public.transactions FOR SELECT USING (true);

CREATE POLICY "Public insert for accounts"
ON public.accounts FOR INSERT WITH CHECK (true);

CREATE POLICY "Public insert for transactions"
ON public.transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update for accounts"
ON public.accounts FOR UPDATE USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Create function to update account balance on transaction insert
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'credit' THEN
    UPDATE public.accounts SET balance = balance + NEW.amount, updated_at = now() WHERE id = NEW.account_id;
  ELSIF NEW.type = 'debit' THEN
    UPDATE public.accounts SET balance = balance - NEW.amount, updated_at = now() WHERE id = NEW.account_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic balance updates
CREATE TRIGGER update_balance_on_transaction
AFTER INSERT ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_account_balance();

-- Seed test data: Create main account
INSERT INTO public.accounts (id, name, balance) VALUES 
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Main Operating Account', 284750.42);

-- Seed test transactions
INSERT INTO public.transactions (account_id, amount, type, description, date) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 15000.00, 'credit', 'Client payment - Acme Corp', now() - interval '1 day'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2340.50, 'debit', 'AWS Infrastructure', now() - interval '2 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 8500.00, 'credit', 'Invoice #1042', now() - interval '3 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 1250.00, 'debit', 'Stripe subscription', now() - interval '4 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 45000.00, 'credit', 'Series A funding transfer', now() - interval '5 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 890.25, 'debit', 'Office supplies', now() - interval '6 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 22000.00, 'credit', 'Client payment - TechStart', now() - interval '8 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 5600.00, 'debit', 'Payroll - Engineering', now() - interval '10 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 3200.00, 'credit', 'Refund - Vendor', now() - interval '12 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 18500.00, 'credit', 'Client payment - GlobalTech', now() - interval '15 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 4500.00, 'debit', 'Marketing campaign', now() - interval '18 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 12000.00, 'credit', 'Invoice #1038', now() - interval '22 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 7800.00, 'debit', 'Legal services', now() - interval '25 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 35000.00, 'credit', 'Q4 bonus allocation', now() - interval '28 days'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 2100.00, 'debit', 'Software licenses', now() - interval '32 days');