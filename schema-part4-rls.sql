-- ========================================================================================
-- NIZAMI — Phase 4: Fix RLS to allow testing
-- Run this in Supabase SQL Editor ONCE
-- ========================================================================================

-- 1. Drop conflicting policies if they exist (schema-part4 originally created these)
DROP POLICY IF EXISTS "Seekers can create requests" ON public.service_requests;

DROP POLICY IF EXISTS "Seekers can update own requests" ON public.service_requests;

DROP POLICY IF EXISTS "Providers can update assigned requests" ON public.service_requests;

DROP POLICY IF EXISTS "Providers can claim pool requests" ON public.service_requests;

DROP POLICY IF EXISTS "Users can upload documents" ON public.documents;

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;

-- 2. Drop the strict pool view policy and replace with a testing-friendly version
DROP POLICY IF EXISTS "Requests View" ON public.service_requests;

-- Recreated: Providers can see pool requests even if not verified (for testing)
CREATE POLICY "Requests View" ON public.service_requests FOR
SELECT USING (
        seeker_id = auth.uid ()
        OR provider_id = auth.uid ()
        OR (
            status = 'pending_match'
            AND EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE
                    id = auth.uid ()
                    AND account_cat = 'provider'
            )
        )
        OR workspace_id IN (
            SELECT workspace_id
            FROM public.workspace_members
            WHERE
                user_id = auth.uid ()
        )
    );

-- 3. Fix the INSERT policy to work without the user_country_id() function
DROP POLICY IF EXISTS "Requests Insert" ON public.service_requests;

CREATE POLICY "Requests Insert" ON public.service_requests FOR INSERT
WITH
    CHECK (auth.uid () = seeker_id);

-- 4. UPDATE policies for service_requests
CREATE POLICY "Requests Update Own" ON public.service_requests
FOR UPDATE
    USING (
        auth.uid () = seeker_id
        OR auth.uid () = provider_id
        OR (
            provider_id IS NULL
            AND status = 'pending_match'
        )
    );