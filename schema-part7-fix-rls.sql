-- ========================================================================================
-- NIZAMI — Part 7b: Fix Infinite Recursion in RLS Policies
-- Run this in Supabase SQL Editor ONCE
-- ========================================================================================
-- The problem: workspaces policy references workspace_members,
-- and workspace_members policy references workspaces = infinite loop.
-- Fix: workspaces SELECT only checks owner_id (no cross-table reference).

-- =====================
-- 1. DROP the broken policies
-- =====================
DROP POLICY IF EXISTS "Workspaces View Own" ON public.workspaces;

DROP POLICY IF EXISTS "WS Members View" ON public.workspace_members;

DROP POLICY IF EXISTS "WS Members Update" ON public.workspace_members;

-- =====================
-- 2. WORKSPACES — Simple SELECT (no reference to workspace_members)
-- =====================
CREATE POLICY "Workspaces View Own" ON public.workspaces FOR
SELECT USING (owner_id = auth.uid ());

-- =====================
-- 3. WORKSPACE_MEMBERS — Simple SELECT (no reference to workspaces)
-- =====================
CREATE POLICY "WS Members View" ON public.workspace_members FOR
SELECT USING (user_id = auth.uid ());

-- Update policy for members (only workspace owner can update)
CREATE POLICY "WS Members Update" ON public.workspace_members
FOR UPDATE
    USING (
        workspace_id IN (
            SELECT id
            FROM public.workspaces
            WHERE
                owner_id = auth.uid ()
        )
    );

-- =====================
-- 4. SERVICE_REQUESTS — Fix if still failing
-- =====================
DROP POLICY IF EXISTS "Requests View" ON public.service_requests;

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
    );

-- =====================
-- 5. STORAGE — Add policies if not already added
-- =====================
DO $$ BEGIN
    CREATE POLICY "Allow authenticated uploads"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated reads"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow public reads"
    ON storage.objects FOR SELECT TO anon
    USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Allow authenticated updates"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'documents');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;