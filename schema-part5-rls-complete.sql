-- ========================================================================================
-- NIZAMI — Phase 5: Complete Missing RLS Policies
-- Run this in Supabase SQL Editor ONCE
-- ========================================================================================

-- =====================
-- 1. DOCUMENTS TABLE
-- =====================
-- Allow authenticated users to upload documents
CREATE POLICY "Documents Insert" ON public.documents FOR INSERT
WITH
    CHECK (uploaded_by = auth.uid ());

-- Allow users to view documents for their own requests
CREATE POLICY "Documents View Own" ON public.documents FOR
SELECT USING (
        uploaded_by = auth.uid ()
        OR request_id IN (
            SELECT id
            FROM public.service_requests
            WHERE
                seeker_id = auth.uid ()
                OR provider_id = auth.uid ()
        )
    );

-- =====================
-- 2. WORKSPACES TABLE
-- =====================
-- Allow workspace creation
CREATE POLICY "Workspaces Insert" ON public.workspaces FOR INSERT
WITH
    CHECK (owner_id = auth.uid ());

-- Allow owners to update their workspace
CREATE POLICY "Workspaces Update" ON public.workspaces
FOR UPDATE
    USING (owner_id = auth.uid ());

-- =====================
-- 3. WORKSPACE MEMBERS
-- =====================
-- Allow workspace owners/admins to add members
CREATE POLICY "WS Members Insert" ON public.workspace_members FOR INSERT
WITH
    CHECK (
        workspace_id IN (
            SELECT id
            FROM public.workspaces
            WHERE
                owner_id = auth.uid ()
        )
    );

-- Allow members to view their workspace colleagues
CREATE POLICY "WS Members View" ON public.workspace_members FOR
SELECT USING (
        user_id = auth.uid ()
        OR workspace_id IN (
            SELECT workspace_id
            FROM public.workspace_members
            WHERE
                user_id = auth.uid ()
        )
    );

-- Allow workspace owners to remove members
CREATE POLICY "WS Members Delete" ON public.workspace_members FOR DELETE USING (
    workspace_id IN (
        SELECT id
        FROM public.workspaces
        WHERE
            owner_id = auth.uid ()
    )
);

-- =====================
-- 4. COMMUNITY QUESTIONS
-- =====================
-- Allow any authenticated user to post questions
CREATE POLICY "Community Q Insert" ON public.community_questions FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);

-- Allow authors to update/delete their own questions
CREATE POLICY "Community Q Update Own" ON public.community_questions
FOR UPDATE
    USING (author_id = auth.uid ());

CREATE POLICY "Community Q Delete Own" ON public.community_questions FOR DELETE USING (author_id = auth.uid ());

-- =====================
-- 5. COMMUNITY ANSWERS
-- =====================
-- Allow providers to answer questions
CREATE POLICY "Community A Insert" ON public.community_answers FOR INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE
                id = auth.uid ()
                AND account_cat = 'provider'
        )
    );

-- Allow anyone to upvote (update upvotes field)
CREATE POLICY "Community A Update Upvote" ON public.community_answers
FOR UPDATE
    USING (true);

-- Allow authors to delete their own answers
CREATE POLICY "Community A Delete Own" ON public.community_answers FOR DELETE USING (provider_id = auth.uid ());

-- =====================
-- 6. PROVIDER REQUEST CLAIM
-- =====================
-- Allow providers to claim pending_match requests (set provider_id)
DO $$ BEGIN
    DROP POLICY IF EXISTS "Provider Claim Request" ON public.service_requests;
EXCEPTION WHEN undefined_object THEN null; END $$;

CREATE POLICY "Provider Claim Request" ON public.service_requests
FOR UPDATE
    USING (
        (
            -- Providers can claim unassigned pending requests
            status = 'pending_match'
            AND provider_id IS NULL
            AND EXISTS (
                SELECT 1
                FROM public.profiles
                WHERE
                    id = auth.uid ()
                    AND account_cat = 'provider'
            )
        )
        OR (
            -- Seekers and providers can update their own requests
            auth.uid () = seeker_id
            OR auth.uid () = provider_id
        )
    );