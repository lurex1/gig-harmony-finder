-- Set beta trial expiry to 2026-06-01 for all existing trial subscriptions
UPDATE public.subscriptions
SET trial_ends_at = '2026-06-01'::date
WHERE status = 'trial';

-- Update handle_new_user trigger to use fixed beta expiry instead of now()+7days
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'musician')::user_role
  )
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.subscriptions (user_id, plan, status, trial_ends_at)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'musician')::subscription_plan,
    'trial'::subscription_status,
    '2026-06-01'::date
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;
