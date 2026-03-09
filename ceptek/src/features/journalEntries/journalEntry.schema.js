import { z } from "zod";

export const TRANSACTION_TYPES = [
  "manual", "payment", "receipt", "purchase", "expense",
  "salary", "advance", "return", "adjustment",
  "opening", "closing", "transfer",
];

export const journalLineSchema = z.object({
  account_id: z.coerce.number().positive("Account is required"),
  debit: z.coerce.number().min(0).default(0),
  credit: z.coerce.number().min(0).default(0),
  description: z.string().optional().default(""),
});

export const journalEntrySchema = z
  .object({
    entry_date: z.string().min(1, "Date is required"),
    transaction_type: z.string().min(1, "Type is required"),
    description: z.string().optional().default(""),
    reference: z.string().optional().default(""),
    lines: z.array(journalLineSchema).min(2, "At least 2 lines required"),
  })
  .refine(
    (data) => {
      const totalDebit = data.lines.reduce((s, l) => s + (l.debit || 0), 0);
      const totalCredit = data.lines.reduce((s, l) => s + (l.credit || 0), 0);
      return Math.abs(totalDebit - totalCredit) < 0.001;
    },
    { message: "Total debit must equal total credit", path: ["lines"] }
  )
  .refine(
    (data) => data.lines.every((l) => (l.debit > 0) !== (l.credit > 0)),
    { message: "Each line must have debit or credit, not both", path: ["lines"] }
  );

export const emptyLine = { account_id: "", debit: 0, credit: 0, description: "" };

export const journalEntryDefaults = {
  entry_date: new Date().toISOString().slice(0, 10),
  transaction_type: "manual",
  description: "",
  reference: "",
  lines: [
    { ...emptyLine },
    { ...emptyLine },
  ],
};
