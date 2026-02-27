-- ========================================================================================
-- NIZAMI — Phase 3: Fix handle_new_user trigger + RPC for RBAC profile setup
-- Run this in Supabase SQL Editor ONCE
-- ========================================================================================

-- 1. Keep trigger simple (just basic profile creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC function to set RBAC fields after signup
-- This runs with SECURITY DEFINER so it bypasses RLS
-- (needed because the user might not have an active session yet due to email confirmation)
CREATE OR REPLACE FUNCTION public.setup_user_role(
  user_id UUID,
  p_country_id UUID,
  p_account_cat TEXT,
  p_s_type TEXT DEFAULT NULL,
  p_p_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET 
    country_id = p_country_id,
    account_cat = p_account_cat::account_category,
    s_type = CASE WHEN p_s_type IS NOT NULL THEN p_s_type::seeker_type ELSE NULL END,
    p_type = CASE WHEN p_p_type IS NOT NULL THEN p_p_type::provider_type ELSE NULL END
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;