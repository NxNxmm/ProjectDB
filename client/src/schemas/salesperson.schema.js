// Validation rules for customer form (used with react-hook-form + zod)
import { z } from "zod";

export const salesPersonFormSchema = z.object({
  code: z.string().optional(),
  name: z.string().min(1, "Name should not be null"),
  start_work_date: z.string().min(8), // YYYY-MM-DD
});
