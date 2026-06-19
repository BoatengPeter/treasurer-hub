import { z } from 'zod';

const categoryEnum = z.enum(['Dues', 'Offering', 'Special Contribution', 'Donation', 'Welfare', 'Transport', 'Stationery', 'Honorarium', 'Other']);
const paymentMethodEnum = z.enum(['Cash', 'Cheque', 'Mobile Money', 'Bank Transfer']);

export const transactionFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  type: z.enum(['income', 'expense']),
  category: categoryEnum,
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  payment_method: paymentMethodEnum,
  reference: z.string().optional().default(''),
  description: z.string().optional().default(''),
  member_id: z.string().optional(),
  meeting_id: z.string().optional(),
  lodgment_id: z.string().optional(),
  receipt_image: z.string().optional().default(''),
});

export type TransactionFormData = z.infer<typeof transactionFormSchema>;
