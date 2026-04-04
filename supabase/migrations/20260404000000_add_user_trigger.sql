-- Trigger automatycznie tworzący profil i subskrypcję po rejestracji użytkownika
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Nowy użytkownik'),
    (new.raw_user_meta_data->>'role')::user_role
  );

  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (
    new.id,
    (new.raw_user_meta_data->>'role')::subscription_plan,
    'trial'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
