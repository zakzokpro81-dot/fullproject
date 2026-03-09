import { z } from "zod";

export const ACCOUNT_TYPES = ["asset", "liability", "equity", "revenue", "expense"];

export const ACCOUNT_SUBTYPES = {
  asset:     ["cash", "bank", "receivable", "inventory", "fixed_asset", "other_asset"],
  liability: ["payable", "accrued", "loan", "other_liability"],
  equity:    ["capital", "retained_earnings"],
  revenue:   ["sales", "service_income", "other_revenue"],
  expense:   ["cost_of_goods", "operating", "salary", "depreciation", "other_expense"],
};

export const accountSchema = z.object({
  account_code: z.string().min(1, "Account code is required").trim(),
  name: z.string().min(2, "Account name is required").trim(),
  account_type: z.string().min(1, "Please select account type"),
  account_subtype: z.string().min(1, "Please select subtype"),
  parent_id: z.coerce.number().positive().optional().nullable().or(z.literal("")),
  description: z.string().optional().default(""),
  opening_balance: z.coerce.number().default(0),
  balance: z.coerce.number().default(0),
  is_active: z.boolean().optional().default(true),
});

export const accountDefaults = {
  account_code: "",
  name: "",
  account_type: "asset",
  account_subtype: "cash",
  parent_id: "",
  description: "",
  opening_balance: 0,
  balance: 0,
  is_active: true,
};