
-- Fix the credit_transactions table to allow 'coupon_redemption' transaction type
ALTER TABLE public.credit_transactions 
DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;

-- Add updated constraint that includes 'coupon_redemption'
ALTER TABLE public.credit_transactions 
ADD CONSTRAINT credit_transactions_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'usage', 'coupon_redemption', 'refund'));
