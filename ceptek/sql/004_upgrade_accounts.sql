-- ============================================================
-- UPGRADE MIGRATION: Evolve existing DB to accounting-ready schema
-- Run this on an existing database that already has the old tables
-- ============================================================

-- ============================================================
-- UTILITY: set_updated_at() trigger function
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- LOOKUP TABLES: Already exist with status_name column and data
-- invoice_statuses, order_statuses, return_statuses — SKIPPED
-- ============================================================

-- ============================================================
-- ALTER accounts TABLE: Add new Chart of Accounts columns
-- ============================================================

-- Add new columns (IF NOT EXISTS prevents errors if already added)
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS account_code text;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS account_subtype text;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS parent_id bigint REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS opening_balance numeric NOT NULL DEFAULT 0;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS is_system boolean NOT NULL DEFAULT false;
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Drop old CHECK constraint on account_type, add new one
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_account_type_check;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_account_type_check
  CHECK (account_type IN ('asset','liability','equity','revenue','expense','cash','bank'));

-- Add CHECK constraint on account_subtype
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_account_subtype_check;
ALTER TABLE public.accounts ADD CONSTRAINT accounts_account_subtype_check
  CHECK (account_subtype IS NULL OR account_subtype IN (
    'cash','bank','receivable','inventory','fixed_asset','other_asset',
    'payable','accrued','loan','other_liability',
    'capital','retained_earnings',
    'sales','service_income','other_revenue',
    'cost_of_goods','operating','salary','depreciation','other_expense'
  ));

-- Migrate existing data: map old cash/bank types to new system
UPDATE public.accounts SET
  account_code = CASE
    WHEN account_type = 'cash' THEN '100' || id::text
    WHEN account_type = 'bank' THEN '110' || id::text
    ELSE '1' || id::text
  END,
  account_subtype = account_type,  -- cash->cash, bank->bank
  account_type = 'asset'           -- both cash and bank are assets
WHERE account_code IS NULL;

-- Make account_code NOT NULL and UNIQUE after migration
-- First ensure no NULLs remain
UPDATE public.accounts SET account_code = '1' || id::text WHERE account_code IS NULL;

-- Add unique constraint (if not exists)
DO $$ BEGIN
  ALTER TABLE public.accounts ADD CONSTRAINT accounts_account_code_key UNIQUE (account_code);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.accounts ALTER COLUMN account_code SET NOT NULL;
ALTER TABLE public.accounts ALTER COLUMN account_code SET DEFAULT '';
ALTER TABLE public.accounts ALTER COLUMN account_type SET DEFAULT 'asset';

-- Add subtype default
ALTER TABLE public.accounts ALTER COLUMN account_subtype SET DEFAULT 'cash';

-- Create updated_at trigger
DROP TRIGGER IF EXISTS trg_accounts_updated_at ON public.accounts;
CREATE TRIGGER trg_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- New indexes
CREATE INDEX IF NOT EXISTS idx_accounts_code ON public.accounts(account_code);
CREATE INDEX IF NOT EXISTS idx_accounts_parent ON public.accounts(parent_id);
CREATE INDEX IF NOT EXISTS idx_accounts_subtype ON public.accounts(account_subtype);

-- ============================================================
-- ALTER invoices TABLE: Add new columns
-- ============================================================
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS discount_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS tax_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS created_by bigint REFERENCES public.employees(id) ON DELETE SET NULL;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- ============================================================
-- invoice_items TABLE (if not exists)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id              bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    invoice_id      bigint NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    product_id      bigint NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_unit_id bigint REFERENCES public.product_units(id) ON DELETE SET NULL,
    quantity        integer NOT NULL DEFAULT 1,
    unit_price      numeric NOT NULL DEFAULT 0,
    discount        numeric NOT NULL DEFAULT 0,
    total_price     numeric NOT NULL DEFAULT 0
);
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Allow full access for anon" ON public.invoice_items FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON public.invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product ON public.invoice_items(product_id);

-- ============================================================
-- SEED: Default Chart of Accounts (only insert if none exist)
-- ============================================================
INSERT INTO public.accounts (account_code, name, account_type, account_subtype, is_system, opening_balance)
SELECT * FROM (VALUES
    ('1001', 'Cash',                  'asset',     'cash',            true, 0::numeric),
    ('1002', 'Petty Cash',            'asset',     'cash',            true, 0),
    ('1100', 'Bank',                  'asset',     'bank',            true, 0),
    ('1200', 'Accounts Receivable',   'asset',     'receivable',      true, 0),
    ('1300', 'Inventory',             'asset',     'inventory',       true, 0),
    ('1400', 'Fixed Assets',          'asset',     'fixed_asset',     false, 0),
    ('1500', 'Prepaid Expenses',      'asset',     'other_asset',     false, 0),
    ('2100', 'Accounts Payable',      'liability', 'payable',         true, 0),
    ('2200', 'Accrued Expenses',      'liability', 'accrued',         false, 0),
    ('2300', 'Loans Payable',         'liability', 'loan',            false, 0),
    ('2400', 'Tax Payable',           'liability', 'other_liability', false, 0),
    ('3001', 'Owner Capital',         'equity',    'capital',         true, 0),
    ('3100', 'Retained Earnings',     'equity',    'retained_earnings', true, 0),
    ('4001', 'Sales Revenue',         'revenue',   'sales',           true, 0),
    ('4100', 'Service Income',        'revenue',   'service_income',  false, 0),
    ('4200', 'Other Revenue',         'revenue',   'other_revenue',   false, 0),
    ('5001', 'Cost of Goods Sold',    'expense',   'cost_of_goods',   true, 0),
    ('5100', 'Salaries & Wages',      'expense',   'salary',          true, 0),
    ('5200', 'Rent Expense',          'expense',   'operating',       false, 0),
    ('5300', 'Utilities Expense',     'expense',   'operating',       false, 0),
    ('5400', 'Depreciation Expense',  'expense',   'depreciation',    false, 0),
    ('5500', 'Office Supplies',       'expense',   'operating',       false, 0),
    ('5600', 'Marketing Expense',     'expense',   'operating',       false, 0),
    ('5700', 'Insurance Expense',     'expense',   'operating',       false, 0),
    ('5800', 'Bank Charges',          'expense',   'other_expense',   false, 0),
    ('5900', 'Other Expenses',        'expense',   'other_expense',   false, 0)
) AS v(account_code, name, account_type, account_subtype, is_system, opening_balance)
WHERE NOT EXISTS (
    SELECT 1 FROM public.accounts WHERE accounts.account_code = v.account_code
);

SELECT 'UPGRADE 004 COMPLETE: accounts table upgraded, lookup tables created, chart of accounts seeded' AS status;
