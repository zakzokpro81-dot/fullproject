import { z } from "zod";

export const productTypeAttributesSchema = z.object({
  product_type_id: z
    .number({ required_error: "Product Type is required" })
    .min(1, "Product Type is required"),
  attribute_id: z
    .number({ required_error: "Attribute is required" })
    .min(1, "Attribute is required"),
});

export const productTypeAttributesDefaults = {
  product_type_id: null,
  attribute_id: null,
};
