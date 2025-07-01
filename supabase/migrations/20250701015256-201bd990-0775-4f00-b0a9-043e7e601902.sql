
-- Create guest_usage table to track anonymous usage by IP address
CREATE TABLE public.guest_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  last_reset_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique index on ip_address for fast lookups and prevent duplicates
CREATE UNIQUE INDEX idx_guest_usage_ip ON public.guest_usage(ip_address);

-- Create index on last_reset_date for efficient cleanup queries
CREATE INDEX idx_guest_usage_reset_date ON public.guest_usage(last_reset_date);

-- Enable Row Level Security (but allow all operations since it's IP-based, not user-based)
ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (no user authentication required for guest usage)
CREATE POLICY "Allow all operations on guest_usage" ON public.guest_usage
  FOR ALL USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_guest_usage_updated_at
  BEFORE UPDATE ON public.guest_usage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
