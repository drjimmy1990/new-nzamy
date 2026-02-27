-- ========================================================================================
-- NIZAMI LAW FIRM — Phase 1: Role-Based Access Control (RBAC), Workspaces, & Core Entities
-- (CORRECTED: Functions moved to public schema)
-- ========================================================================================

-- ========================================================================================
-- 1. CREATE CUSTOM ENUM TYPES (Safe execution using DO blocks)
-- ========================================================================================
DO $$ BEGIN
    CREATE TYPE account_category AS ENUM ('seeker', 'provider', 'admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE seeker_type AS ENUM ('individual', 'company', 'government', 'ngo');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE provider_type AS ENUM ('law_firm', 'independent_lawyer', 'trainee_lawyer', 'notary', 'marriage_official', 'arbitrator');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE service_category AS ENUM ('consultation', 'case_pleading', 'contract_review', 'notarization', 'marriage', 'arbitration', 'other');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE request_status AS ENUM ('draft', 'pending_match', 'in_progress', 'pending_approval', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE workspace_role AS ENUM ('owner', 'admin', 'member', 'trainee');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ========================================================================================
-- 2. EXPAND EXISTING `profiles` TABLE
-- ========================================================================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS country_id UUID REFERENCES public.countries (id),
ADD COLUMN IF NOT EXISTS account_cat account_category DEFAULT 'seeker',
ADD COLUMN IF NOT EXISTS s_type seeker_type,
ADD COLUMN IF NOT EXISTS p_type provider_type,
ADD COLUMN IF NOT EXISTS visibility_score INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS specialty TEXT;
-- e.g., 'Labor Law', 'Corporate'

-- Create an index for faster lookups when n8n routes cases
CREATE INDEX IF NOT EXISTS idx_profiles_roles ON public.profiles (
    account_cat,
    p_type,
    country_id
);

-- Helper Function for RLS: Created in PUBLIC schema to avoid permission denied errors
CREATE OR REPLACE FUNCTION public.user_country_id() 
RETURNS UUID AS $$
  SELECT country_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========================================================================================
-- 3. WORKSPACES (Umbrella Accounts for Law Firms & B2B Companies)
-- ========================================================================================
CREATE TABLE IF NOT EXISTS public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID NOT NULL REFERENCES public.countries (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type account_category NOT NULL, -- Is this a Provider workspace (Law Firm) or Seeker (Company)?
    owner_id UUID NOT NULL REFERENCES auth.users (id),
    commercial_record_number TEXT,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workspace_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    role workspace_role DEFAULT 'member',
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (workspace_id, user_id)
);

-- ========================================================================================
-- 4. CORE BUSINESS ENTITIES: Service Requests & Documents
-- ========================================================================================
-- This table is what n8n will read/write to orchestrate the business logic.
CREATE TABLE IF NOT EXISTS public.service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID NOT NULL REFERENCES public.countries (id) ON DELETE CASCADE,
    seeker_id UUID NOT NULL REFERENCES auth.users (id),
    provider_id UUID REFERENCES auth.users (id), -- Null until assigned/accepted
    workspace_id UUID REFERENCES public.workspaces (id), -- If it belongs to a firm/company
    category service_category NOT NULL,
    status request_status DEFAULT 'draft',
    title TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb, -- n8n will inject dynamic form data here (e.g., marriage details, contract clauses)
    price DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    request_id UUID NOT NULL REFERENCES public.service_requests (id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users (id),
    document_type TEXT NOT NULL, -- e.g., 'ID', 'Contract_Draft', 'Medical_Report'
    file_url TEXT NOT NULL,
    verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected' (Updated by AI/n8n)
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================================================
-- 5. COMMUNITY PLATFORM (Public Q&A for Gamification & SEO)
-- ========================================================================================
CREATE TABLE IF NOT EXISTS public.community_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    country_id UUID NOT NULL REFERENCES public.countries (id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users (id), -- Can be null for anonymous questions
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    question_id UUID NOT NULL REFERENCES public.community_questions (id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INT DEFAULT 0,
    is_endorsed BOOLEAN DEFAULT false, -- If Admin or AI marks it as 100% legally accurate
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========================================================================================
-- 6. STRICT ROW LEVEL SECURITY (RLS) - The Brains of Data Privacy
-- ========================================================================================
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.community_answers ENABLE ROW LEVEL SECURITY;

-- 🛡️ WORKSPACES: Must match country, and user must be owner or a member.
CREATE POLICY "Workspaces View" ON public.workspaces FOR
SELECT USING (
        country_id = public.user_country_id ()
        AND (
            owner_id = auth.uid ()
            OR id IN (
                SELECT workspace_id
                FROM public.workspace_members
                WHERE
                    user_id = auth.uid ()
            )
        )
    );

-- 🛡️ SERVICE REQUESTS: The most critical policy
CREATE POLICY "Requests View" ON public.service_requests FOR
SELECT USING (
        country_id = public.user_country_id ()
        AND (
            seeker_id = auth.uid ()
            OR -- Seekers see their own requests
            provider_id = auth.uid ()
            OR -- Providers see requests assigned to them
            (
                status = 'pending_match'
                AND EXISTS ( -- Providers can see public pool requests if they are verified
                    SELECT 1
                    FROM public.profiles
                    WHERE
                        id = auth.uid ()
                        AND account_cat = 'provider'
                        AND is_verified = true
                )
            )
            OR workspace_id IN (
                SELECT workspace_id
                FROM public.workspace_members
                WHERE
                    user_id = auth.uid ()
            ) -- Firm members see firm cases
        )
    );

CREATE POLICY "Requests Insert" ON public.service_requests FOR INSERT
WITH
    CHECK (
        country_id = public.user_country_id ()
        AND seeker_id = auth.uid ()
    );

-- 🛡️ COMMUNITY: Strict Country Isolation. Saudis see SA questions, Egyptians see EG questions.
CREATE POLICY "Community Q View" ON public.community_questions FOR
SELECT USING (
        country_id = public.user_country_id ()
    );

CREATE POLICY "Community A View" ON public.community_answers FOR
SELECT USING (
        question_id IN (
            SELECT id
            FROM public.community_questions
            WHERE
                country_id = public.user_country_id ()
        )
    );

-- ========================================================================================
-- 7. TRIGGERS (Auto Update Timestamps & Gamification)
-- ========================================================================================
-- Reuse your existing timestamp trigger
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_service_requests_updated_at BEFORE UPDATE ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Gamification Trigger: When a provider gets an upvote on an answer, increase their visibility score!
CREATE OR REPLACE FUNCTION public.update_provider_visibility() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.upvotes > OLD.upvotes THEN
        UPDATE public.profiles SET visibility_score = visibility_score + 1 WHERE id = NEW.provider_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_answer_upvote
    AFTER UPDATE OF upvotes ON public.community_answers
    FOR EACH ROW EXECUTE FUNCTION public.update_provider_visibility();