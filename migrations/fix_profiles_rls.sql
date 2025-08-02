-- Fix RLS policies for profiles table to prevent infinite recursion
BEGIN;

-- Drop existing policies that might cause recursion
DROP POLICY IF EXISTS "Admins can see all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can see their profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Create helper function to check admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
  RETURNS boolean
  LANGUAGE sql STABLE SECURITY DEFINER
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE id = _uid AND role IN ('admin', 'superadmin')
    );
$$;

-- Create new RLS policies using the helper function
CREATE POLICY "Users can see their profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can see all profiles"
  ON public.profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update profiles"
  ON public.profiles
  FOR UPDATE
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (is_admin(auth.uid()));

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

COMMIT;