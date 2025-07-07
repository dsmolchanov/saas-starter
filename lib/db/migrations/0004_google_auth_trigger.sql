-- Supabase migration: Fill public.users table when new auth user created

-- Allow password_hash to be nullable so we can insert OAuth users
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;

-- Function to copy data from auth.users to public.users
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  full_name text;
BEGIN
  -- derive full name from metadata if available
  full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email);

  INSERT INTO public.users (email, name, password_hash, role, created_at, updated_at)
  VALUES (
    NEW.email,
    full_name,
    '',
    'member',
    NOW(),
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run after insert on auth.users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_auth_user(); 