
-- Create coupons table to store coupon definitions
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  credits_amount INTEGER NOT NULL,
  max_uses INTEGER, -- NULL means unlimited
  uses_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create coupon_redemptions table to track individual user redemptions
CREATE TABLE public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  coupon_code TEXT NOT NULL REFERENCES public.coupons(code) ON DELETE CASCADE,
  credits_awarded INTEGER NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, coupon_code) -- Prevent duplicate redemptions per user per coupon
);

-- Enable Row Level Security
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policies for coupons (readable by all authenticated users)
CREATE POLICY "Authenticated users can view active coupons" ON public.coupons
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);

-- Create policies for coupon_redemptions (users can only see their own)
CREATE POLICY "Users can view their own redemptions" ON public.coupon_redemptions
  FOR SELECT USING (auth.uid() = user_id OR email = auth.email());

CREATE POLICY "Allow insert for redemptions" ON public.coupon_redemptions
  FOR INSERT WITH CHECK (true);

-- Create trigger for updated_at on coupons
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the initial "BEST100" coupon
INSERT INTO public.coupons (code, credits_amount, is_active)
VALUES ('BEST100', 100, true);
