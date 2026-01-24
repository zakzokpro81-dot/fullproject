import { z } from 'zod';

export const warehouseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  location: z.string().optional(),
  is_active: z.boolean().default(true),
});
