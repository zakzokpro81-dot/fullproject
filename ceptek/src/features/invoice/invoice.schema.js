import { z } from "zod";

export const invoiceSchema = z.object({
  customer_id: z.coerce.number().min(1, "Customer is required"),
  warehouse_id: z.coerce.number().min(1, "Warehouse is required"),
  account_id: z.coerce.number().min(1, "Account is required"),

  paid_amount: z.coerce.number().min(0, "Paid amount cannot be negative"),

  items: z.array(
    z.object({
      product_id: z.number(),
      product_name: z.string(),
      quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
      unit_price: z.coerce.number().min(0.01, "Unit price must be greater than 0"),
      total: z.coerce.number()
    })
  ).min(1, "Cart must contain at least one item")
})
.superRefine((data, ctx) => {
  const subTotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  if (data.paid_amount > subTotal) {
    ctx.addIssue({
      path: ["paid_amount"],
      message: "Paid amount cannot exceed total amount",
      code: z.ZodIssueCode.custom,
    });
  }
});
