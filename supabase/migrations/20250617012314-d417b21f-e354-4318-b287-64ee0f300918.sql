
-- Remove coupon redemption records from credit_transactions
DELETE FROM public.credit_transactions 
WHERE transaction_type = 'coupon_redemption';

-- Update the credit_transactions constraint to remove 'coupon_redemption'
ALTER TABLE public.credit_transactions 
DROP CONSTRAINT IF EXISTS credit_transactions_transaction_type_check;

ALTER TABLE public.credit_transactions 
ADD CONSTRAINT credit_transactions_transaction_type_check 
CHECK (transaction_type IN ('purchase', 'usage', 'refund'));

-- Drop the coupon_redemptions table
DROP TABLE IF EXISTS public.coupon_redemptions;

-- Drop the coupons table
DROP TABLE IF EXISTS public.coupons;
