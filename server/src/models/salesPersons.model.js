import { z } from "zod";

export const SalesPersonSchema = z.object({
  id: z.number().int(),
  code: z.string(),
  name: z.string(),
  start_work_date: z.string().min(8), // YYYY-MM-DD
});

// export const CreateSalesPersonBodySchema = z.object({
//   code: z.string().optional(),
//   name: z.string().min(1),
//   address_line1: z.string().optional(),
//   address_line2: z.string().optional(),
//   country_id: z.coerce.number().int().optional(),
//   credit_limit: z.coerce.number().optional(),
// });

// export const UpdateSalesPersonBodySchema = z.object({
//   code: z.string().optional(),
//   name: z.string().optional(),
//   address_line1: z.string().optional(),
//   address_line2: z.string().optional(),
//   country_id: z.coerce.number().int().optional(),
//   credit_limit: z.coerce.number().optional(),
// });

