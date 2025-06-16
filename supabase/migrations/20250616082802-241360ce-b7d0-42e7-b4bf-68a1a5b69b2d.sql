
-- Insert admin record for albertcanz66@gmail.com
INSERT INTO public.user_credits (
  user_id,
  email,
  credits,
  is_admin,
  created_at,
  updated_at
) VALUES (
  '326e860f-e009-4774-99f4-b02bd4fb36dd',
  'albertcanz66@gmail.com',
  999999,
  true,
  now(),
  now()
)
ON CONFLICT (email) 
DO UPDATE SET
  credits = 999999,
  is_admin = true,
  updated_at = now();
