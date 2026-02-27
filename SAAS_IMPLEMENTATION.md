# 🚀 Nzamy SaaS Transformation — Detailed Implementation Plan

> **Source of truth:** `plan.md` (Product Vision) · `schema.sql` (v1 CMS DB) · `schema-part2.sql` (v2 RBAC DB — already executed)

---

## 📊 Current State Audit

### Database (Supabase)

**schema.sql (v1) — 16 CMS Tables (LIVE):**
| # | Table | Purpose |
|---|---|---|
| 1 | `profiles` | `id, full_name, avatar_url, role (admin\|user)` — basic |
| 2 | `countries` | 8 countries seeded (SA default, EG, AE, KW, BH, OM, QA, JO) |
| 3 | `site_settings` | Key-value bilingual settings per country |
| 4 | `hero_content` | Landing page hero per country |
| 5 | `features` | Why-us features per country |
| 6 | `services` | Personal + Company services per country |
| 7 | `stats` | Animated counter stats per country |
| 8 | `team_members` | Founders/team with slug routing |
| 9 | `testimonials` | Client reviews per country |
| 10 | `blog_posts` | Bilingual blog with approval workflow |
| 11 | `blog_comments` | Threaded comments |
| 12 | `blog_likes` | One-per-user likes |
| 13 | `faq_items` | FAQ accordion per country |
| 14 | `social_links` | Footer social icons |
| 15 | `nav_links` | CMS-driven navigation with parent-child nesting |
| 16 | `contact_submissions` | Contact form entries |
| 17 | `client_logos` | Marquee logos |
| 18 | `pages` | Generic CMS pages (/page/:slug) |

**schema-part2.sql (v2) — RBAC Expansion (EXECUTED):**
| # | Item | Details |
|---|---|---|
| 1 | **6 ENUMs** | `account_category`, `seeker_type`, `provider_type`, `service_category`, `request_status`, `workspace_role` |
| 2 | **profiles expanded** | +`country_id`, `account_cat`, `s_type`, `p_type`, `visibility_score`, `is_verified`, `specialty` |
| 3 | `workspaces` | Umbrella accounts for Law Firms & Companies |
| 4 | `workspace_members` | Links users to workspaces with roles (owner/admin/member/trainee) |
| 5 | `service_requests` | Central hub for all work (consultations, cases, contracts, etc.) with `metadata` JSONB |
| 6 | `documents` | File attachments per service_request with verification_status |
| 7 | `community_questions` | Public Q&A with country isolation |
| 8 | `community_answers` | Provider answers with upvotes + endorsed flag |
| 9 | **RLS Policies** | Country isolation via `user_country_id()`, workspace-scoped visibility, provider pool access |
| 10 | **Triggers** | `update_provider_visibility()` — auto-increments `visibility_score` on upvote |

> [!IMPORTANT]
> The `handle_new_user()` trigger in schema.sql v1 inserts profiles with only `(id, full_name, role='user')`.
> It does NOT populate `account_cat`, `s_type`, `p_type`, or `country_id`.
> **We must update this trigger** or set these fields during the onboarding flow.

### Frontend (React + Vite + TypeScript + Tailwind)

| File | Current State | What Needs to Change |
|---|---|---|
| `types/database.ts` | Only knows v1 schema (16 interfaces). No ENUMs from v2. | Add all 6 ENUMs + 6 new interfaces (Workspace, WorkspaceMember, ServiceRequest, Document, CommunityQuestion, CommunityAnswer). Expand Profile interface. |
| `contexts/AuthContext.tsx` | Fetches `profiles.*`, exposes `isAdmin` only. `signUp()` takes `(email, password, fullName)` only. | Must fetch expanded profile fields. Expose `accountType`, `seekerType`, `providerType`, `workspaceId`, `isVerified`. Update `signUp` to accept role data. |
| `contexts/CountryContext.tsx` | Stores selected country in localStorage. Used for content filtering. | Good as-is for public pages. For logged-in users, country should come from `profile.country_id` and be immutable. |
| `App.tsx` | Flat routes: `/`, `/blog`, `/faq`, `/contact`, `/login`. All wrapped in one `Layout` (Header+Footer). | Needs two layout branches: `PublicLayout` (landing pages) and `DashboardLayout` (sidebar + topbar). Needs 10+ new dashboard routes with role guards. |
| `pages/Login.tsx` | Basic email/password form. Redirects to `/admin`. | Must redirect to correct dashboard based on user role. |
| `pages/` (missing) | No `Signup.tsx`. No dashboard pages at all. | Need multi-step `Signup.tsx` + 10 dashboard page files + `Community.tsx`. |
| `hooks/useContent.ts` | 13 hooks for CMS content + `useContact` for form submission. | Need new hooks: `useWorkspace`, `useServiceRequests`, `useCommunity`, `useDocuments`. |
| `hooks/useBlog.ts` | Blog CRUD hooks. | Good as-is. |
| `components/` | 12 landing page components (Header, Hero, Features, etc.). | These stay as public landing. Need new `DashboardLayout.tsx`, `DashboardSidebar.tsx`, shared widgets. |

---

## 🏗️ Phase 1: TypeScript Types & Auth Context Sync

**Goal:** Make the frontend "aware" of the new RBAC database structure.

### 1.1 Update `types/database.ts`

#### [MODIFY] [database.ts](file:///c:/Users/LOQ/Desktop/nzamy/nzamy-landing-page/types/database.ts)

Add the following:

```typescript
// ===== NEW ENUMS from schema-part2 =====
export type AccountCategory = 'seeker' | 'provider' | 'admin';
export type SeekerType = 'individual' | 'company' | 'government' | 'ngo';
export type ProviderType = 'law_firm' | 'independent_lawyer' | 'trainee_lawyer' | 'notary' | 'marriage_official' | 'arbitrator';
export type ServiceCategoryV2 = 'consultation' | 'case_pleading' | 'contract_review' | 'notarization' | 'marriage' | 'arbitration' | 'other';
export type RequestStatus = 'draft' | 'pending_match' | 'in_progress' | 'pending_approval' | 'completed' | 'cancelled';
export type WorkspaceRole = 'owner' | 'admin' | 'member' | 'trainee';
```

Expand `Profile` interface:
```typescript
export interface Profile {
    // ... existing fields ...
    country_id: string | null;        // NEW
    account_cat: AccountCategory;      // NEW
    s_type: SeekerType | null;         // NEW
    p_type: ProviderType | null;       // NEW
    visibility_score: number;          // NEW
    is_verified: boolean;              // NEW
    specialty: string | null;          // NEW
}
```

Add 6 new interfaces:
```typescript
export interface Workspace { id, country_id, name, type, owner_id, commercial_record_number, is_verified, created_at, updated_at }
export interface WorkspaceMember { id, workspace_id, user_id, role: WorkspaceRole, created_at }
export interface ServiceRequest { id, country_id, seeker_id, provider_id, workspace_id, category, status, title, description, metadata, price, created_at, updated_at }
export interface Document { id, request_id, uploaded_by, document_type, file_url, verification_status, created_at }
export interface CommunityQuestion { id, country_id, author_id, title, content, category, created_at, updated_at }
export interface CommunityAnswer { id, question_id, provider_id, content, upvotes, is_endorsed, created_at, updated_at }
```

### 1.2 Refactor `contexts/AuthContext.tsx`

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/LOQ/Desktop/nzamy/nzamy-landing-page/contexts/AuthContext.tsx)

**Changes:**
- `fetchProfile` must `SELECT *` from expanded profiles (already does `select('*')` so types just need updating).
- Add computed role helpers to the context value:
  ```typescript
  isSeeker: profile?.account_cat === 'seeker'
  isProvider: profile?.account_cat === 'provider'
  seekerType: profile?.s_type       // 'individual' | 'company' | 'government' | 'ngo' | null
  providerType: profile?.p_type     // 'law_firm' | 'independent_lawyer' | ... | null
  isVerified: profile?.is_verified ?? false
  ```
- Update `signUp` to accept `account_cat`, `s_type`, `p_type`, `country_id`.

### 1.3 Fix `handle_new_user()` Trigger (Database)

#### [NEW] `schema-part3-fix-trigger.sql`

The current trigger inserts `(id, full_name, role='user')`. It needs to also populate the new fields from `raw_user_meta_data`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, country_id, account_cat, s_type, p_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'user',
    (NEW.raw_user_meta_data->>'country_id')::UUID,
    COALESCE((NEW.raw_user_meta_data->>'account_cat')::account_category, 'seeker'),
    (NEW.raw_user_meta_data->>'s_type')::seeker_type,
    (NEW.raw_user_meta_data->>'p_type')::provider_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🛣️ Phase 2: Smart Onboarding & Auth Pages

**Goal:** Users select their country, role, and sub-role during signup. Login redirects to the correct dashboard.

### 2.1 Multi-Step Signup

#### [NEW] `pages/Signup.tsx`

A 4-step animated wizard:
1. **Country Selection** — Grid of flags (SA 🇸🇦, EG 🇪🇬 from `countries` table).
2. **Intent** — Two large cards: "أحتاج خدمة قانونية / I need legal services" (Seeker) vs "أقدم خدمات قانونية / I provide legal services" (Provider).
3. **Entity Type**:
   - If Seeker → Individual, Company, Government Entity, NGO (4 cards with icons).
   - If Provider → Law Firm, Independent Lawyer, Trainee Lawyer, Notary, Marriage Official, Arbitrator (6 cards).
4. **Credentials** — Email, Password, Full Name + conditional fields:
   - Company/Law Firm → Commercial Record Number.
   - Lawyer/Notary → License Number.
   - Trainee → Invite Code (from supervising firm).

On submit: `supabase.auth.signUp({ options: { data: { full_name, country_id, account_cat, s_type, p_type } } })`.
The trigger populates the profile automatically.

### 2.2 Update Login Redirect

#### [MODIFY] `pages/Login.tsx`

After successful login, redirect based on profile role:

```typescript
// Redirect logic
if (profile.account_cat === 'provider') {
    navigate(`/dashboard/provider/${profile.p_type}`); 
} else if (profile.account_cat === 'seeker') {
    navigate(`/dashboard/seeker/${profile.s_type}`);
} else {
    navigate('/admin');
}
```

---

## 🧭 Phase 3: Routing & Layout Architecture

**Goal:** Separate the public landing pages from the authenticated dashboard area.

### 3.1 Route Guards

#### [NEW] `components/auth/RequireAuth.tsx`
Redirects to `/login` if no session.

#### [NEW] `components/auth/RequireRole.tsx`
Accepts `allowedRoles: AccountCategory[]` or `allowedTypes: (SeekerType | ProviderType)[]`.
Shows 403 page or redirects if user doesn't match.

### 3.2 Dashboard Layout

#### [NEW] `components/dashboard/DashboardLayout.tsx`
- **Sidebar:** Dynamic menu items based on user role (different items for Lawyer vs Notary vs Company).
- **Topbar:** User avatar, notifications bell, country flag badge, language toggle.
- **Main content area:** Renders `<Outlet />`.

#### [NEW] `components/dashboard/DashboardSidebar.tsx`
Menu configuration per role:

| Role | Menu Items |
|---|---|
| **Individual (B2C)** | My Cases, AI Chat, Browse Lawyers, Contracts, Wallet |
| **Company (B2B)** | Contract Scanner, Cases Board, Risk Dashboard, AI Agent, Team, Wallet |
| **Government (B2G)** | Compliance Engine, Cases, Approvals, Reports |
| **NGO** | Compliance Checker, Partnerships, Board Portal, Wallet |
| **Law Firm** | Order Inbox, Workflow Monitor, Team, CRM Analytics, Community, Wallet |
| **Lawyer** | Order Inbox, Kanban Board, Calendar, AI Co-pilot, Templates, Community, Wallet |
| **Trainee** | Task Inbox, Drafting Zone, Academy, Performance |
| **Notary** | Live Radar (Map), Queue, Templates, Archive, Wallet |
| **Marriage Official** | Digital Dossier, Ceremony Mode, Calendar, Archive |
| **Arbitrator** | Virtual Tribunal, Evidence Room, Rulings Drafter, Escrow, Archive |

### 3.3 Updated App.tsx Routes

#### [MODIFY] [App.tsx](file:///c:/Users/LOQ/Desktop/nzamy/nzamy-landing-page/App.tsx)

```text
/                              → PublicLayout > HomePage (existing landing)
/blog, /blog/:slug             → PublicLayout > BlogList / BlogPost
/faq, /contact, /page/:slug    → PublicLayout > FAQ / Contact / PageRenderer
/community                     → PublicLayout > CommunityPage (new)
/login                         → Login
/signup                        → Signup (new)
/team/:slug                    → PublicLayout > TeamMemberPage

/dashboard/seeker/individual   → RequireAuth > RequireRole > DashboardLayout > IndividualDashboard
/dashboard/seeker/company      → RequireAuth > RequireRole > DashboardLayout > CompanyDashboard
/dashboard/seeker/government   → RequireAuth > RequireRole > DashboardLayout > GovernmentDashboard
/dashboard/seeker/ngo          → RequireAuth > RequireRole > DashboardLayout > NgoDashboard

/dashboard/provider/law_firm   → RequireAuth > RequireRole > DashboardLayout > LawFirmDashboard
/dashboard/provider/independent_lawyer → RequireAuth > RequireRole > DashboardLayout > LawyerDashboard
/dashboard/provider/trainee_lawyer     → RequireAuth > RequireRole > DashboardLayout > TraineeDashboard
/dashboard/provider/notary     → RequireAuth > RequireRole > DashboardLayout > NotaryDashboard
/dashboard/provider/marriage_official  → RequireAuth > RequireRole > DashboardLayout > MarriageDashboard
/dashboard/provider/arbitrator → RequireAuth > RequireRole > DashboardLayout > ArbitratorDashboard

/admin/*                       → RequireAuth > RequireRole(admin) > AdminLayout
```

### 3.4 New File Structure

```text
pages/
├── public/                        # Existing pages (rename/move)
│   ├── BlogList.tsx               (exists)
│   ├── BlogPost.tsx               (exists)
│   ├── FAQ.tsx                    (exists)
│   ├── Contact.tsx                (exists)
│   ├── PageRenderer.tsx           (exists)
│   └── Community.tsx              (NEW — public Q&A)
├── auth/
│   ├── Login.tsx                  (exists — move here)
│   └── Signup.tsx                 (NEW)
└── dashboard/
    ├── seeker/
    │   ├── IndividualDashboard.tsx (NEW)
    │   ├── CompanyDashboard.tsx    (NEW)
    │   ├── GovernmentDashboard.tsx (NEW)
    │   └── NgoDashboard.tsx       (NEW)
    └── provider/
        ├── LawFirmDashboard.tsx   (NEW)
        ├── LawyerDashboard.tsx    (NEW)
        ├── TraineeDashboard.tsx   (NEW)
        ├── NotaryDashboard.tsx    (NEW)
        ├── MarriageDashboard.tsx  (NEW)
        └── ArbitratorDashboard.tsx (NEW)

components/
├── auth/
│   ├── RequireAuth.tsx            (NEW)
│   └── RequireRole.tsx            (NEW)
├── dashboard/
│   ├── DashboardLayout.tsx        (NEW)
│   └── DashboardSidebar.tsx       (NEW)
└── widgets/                       (NEW — Phase 4)
```

---

## 🧩 Phase 4: Shared Smart Widgets

**Goal:** Build modular, role-aware components that are assembled differently per dashboard.

### Hooks Layer (Data Access)

#### [NEW] `hooks/useWorkspace.ts`
- `useWorkspace(workspaceId)` — fetch workspace details + members.
- `useWorkspaceMembers(workspaceId)` — list members with roles.
- `addMember(userId, role)`, `removeMember(userId)`.

#### [NEW] `hooks/useServiceRequests.ts`
- `useMyRequests(userId)` — seeker's own requests.
- `useProviderRequests(providerId)` — assigned to this provider.
- `usePoolRequests(countryId, specialty)` — open pool (status = 'pending_match').
- `createRequest(data)`, `updateRequestStatus(id, status)`.

#### [NEW] `hooks/useCommunity.ts`
- `useQuestions(countryId, category?)` — paginated list.
- `useQuestionDetail(id)` — single question + answers.
- `askQuestion(data)`, `submitAnswer(questionId, content)`.
- `upvoteAnswer(answerId)`.

#### [NEW] `hooks/useDocuments.ts`
- `useDocuments(requestId)` — files for a service request.
- `uploadDocument(requestId, file, type)`, `verifyDocument(docId, status)`.

### Widget Components

| # | Widget | Used By | Description |
|---|---|---|---|
| 1 | `OrderInboxWidget` | Law Firm, Lawyer, Notary, Marriage, Arbitrator | Displays incoming `service_requests` with accept/reject actions |
| 2 | `KanbanBoardWidget` | Lawyer, Company, Law Firm | Drag-and-drop columns tracking request status changes |
| 3 | `DocumentVaultWidget` | ALL dashboards | Upload/download/preview documents for a service request |
| 4 | `AiCopilotWidget` | Individual, Company, Lawyer, Government | Chat interface that sends prompts to n8n webhook. System prompt changes per role |
| 5 | `SmartWalletWidget` | ALL providers + Companies | Balance, transaction history, 5% referral commission tracker |
| 6 | `CommunityRadarWidget` | ALL providers | Shows unanswered questions matching provider's `specialty`. "Answer Now" button boosts `visibility_score` |
| 7 | `CaseTimelineWidget` | Individual, Company, Government | Visual timeline for a single `service_request` lifecycle |
| 8 | `CalendarWidget` | Lawyer, Notary, Marriage Official | Upcoming appointments from `service_requests` with dates |
| 9 | `ProfileCardWidget` | ALL providers | Public-facing profile editor (bio, video, specialties, NFC link) |
| 10 | `StatsOverviewWidget` | ALL dashboards | Summary cards (total requests, completed, pending, revenue) |

---

## 👥 Phase 5: Seeker Dashboard Features (Clients)

### Individual (B2C) — Mobile-First
*Features from plan.md sections أولًا (ب.الأفراد):*
- **Nzamy AI Chat** — First thing they see. `AiCopilotWidget` in "comforter" mode.
- **Smart Handoff** — AI suggests lawyers matching the case specialty. Links to "Browse Lawyers" page.
- **Browse Lawyers** — Filterable list of verified providers (`is_verified = true`) with `visibility_score` ranking.
- **My Cases Tracker** — `CaseTimelineWidget` for each active `service_request`.
- **Contract Review** — Upload a contract for AI analysis (triggers n8n webhook).
- **Quick Actions** — 4 big buttons: "Request Consultation", "Review Contract", "Find Lawyer", "Track Case".
- **Wallet & Referral** — `SmartWalletWidget` with unique referral link.

### Company (B2B) — Desktop-First
*Features from plan.md sections ثانيًا (ب.الشركات):*
- **Contract Scanner** — Upload PDF → n8n → Gemini → Red Flags report.
- **Bulk Review** — Upload multiple contracts, get summarized table.
- **Contract Lifecycle** — Track drafts through to renewal/termination.
- **War Gaming** — Upload opposing memo for counter-argument generation.
- **Kanban Board** — `KanbanBoardWidget` for cases/contracts/consultations.
- **Legal Risk Dashboard** — Charts showing total exposure, case counts, priorities.
- **AI Agent** — `AiCopilotWidget` in "risk scanner" mode, role-selectable.
- **Workspace & Roles** — Team members with permission management.

### Government (B2G) — Audit Trail Focused
*Features from plan.md sections ثالثًا (ب.الجهات الحكومية):*
- **Compliance Engine** — Check decisions against regulations via AI.
- **Advanced Law Search** — Filter by year, ministry, type.
- **Hierarchical Approvals** — Employee → Manager → Legal Counsel chain.
- **Case Tracking** — All government-party cases.
- **Auto Reports** — Periodic AI-generated legal status reports.

### NGO — Compliance-First
*Features from plan.md sections رابعًا (ب.الجمعيات):*
- **Charity Compliance Checker** — Validate campaigns against charity laws.
- **Activity Pre-Check** — Before launching programs.
- **Board Portal** — Secure meeting minutes, voting, bylaws.
- **Funding & Grants** — Track grant contracts and reporting deadlines.

---

## ⚖️ Phase 6: Provider Dashboard Features (Vendors)

### Law Firm — Umbrella Dashboard
*Features from plan.md sections أولًا (واجهة شركة المحاماة):*
- **White-Label Profile** — Firm branding; all work delivered under firm identity.
- **Team Management** — Add/remove lawyers, trainees, consultants (via `workspace_members`).
- **Central Dispatch** — Auto-assign `service_requests` based on specialty + availability.
- **Workflow Monitor** — Multi-column overview (New → In Progress → Awaiting Approval → Delivered).
- **Optional Approval Cycle** — Configurable per task type.
- **CRM Analytics** — Top clients, popular services, traffic sources.
- **Unified Wallet** — All firm revenue in one place.
- **Visibility Score & Community Radar** — Firm-level engagement metrics.

### Independent Lawyer — Virtual Office
*Features from plan.md sections ثانيًا (واجهة المحامي المرخص):*
- **Order Inbox** — Categorized: consultation, contract review, power of attorney.
- **Kanban Board** — Personal task management.
- **Calendar** — Appointments, deadlines, court dates.
- **AI Legal Co-pilot** — Research, draft review, precedent search.
- **Smart Templates** — Customizable legal document templates.
- **Encrypted Client Chat** — Per-case messaging.

### Trainee Lawyer — Supervised Environment
*Features from plan.md sections ثالثًا (واجهة المحامي المتدرب):*
- **Task Inbox** — Assigned tasks from firm's dispatch system.
- **Protected Drafting Zone** — No "Send to Client" button. Only "Request Approval".
- **Mandatory Approval Cycle** — Trainee → Supervisor → Client delivery.
- **Educational AI Co-pilot** — Explains WHY a law applies, not just the answer.
- **Nzamy Academy** — Legal writing courses, template library, annotated precedents.
- **Performance Dashboard** — Tasks completed, first-pass acceptance rate, supervisor notes.

### Notary — Field-First Mobile Dashboard
*Features from plan.md sections رابعًا (واجهة الموثق):*
- **Live Radar Map** — Like delivery apps: nearby notarization requests on a map.
- **Digital Queue** — Time-slot booking for office appointments.
- **Remote Requests** — Documents verified and notarized digitally.
- **Dual Identity Verification** — ID upload + OTP or biometric confirmation.
- **Dynamic Templates** — Select document type → auto-fill from client data → PDF + digital seal.
- **Auto Fee Calculator** — Base fee + platform fee + travel cost.
- **Document Archive** — Searchable history of all notarizations.

### Marriage Official — Ceremony-Optimized
*Features from plan.md sections خامسًا (واجهة المأذون):*
- **Digital Dossier** — Pre-wedding checklist: IDs, medical reports, guardian data, witnesses with progress bar.
- **Requirements Portal** — Detailed document review with approve/reject per item.
- **Witness & Guardian Portal** — Auto-sends SMS/WhatsApp links for pre-verification.
- **Ceremony Mode** — Full-screen tablet UI with large buttons: party data, Mahr entry, e-signatures, "Complete & Notarize" button. Offline-capable.
- **Audio Recording** — Optional Ijab/Qabool recording.
- **Auto-Archive** — Generates official PDF, auto-saves to both parties' accounts.
- **Geographic Calendar** — Map view of scheduled ceremonies.

### Arbitrator — Virtual Tribunal
*Features from plan.md sections سادسًا (واجهة المحكم):*
- **Secure Case Room** — Encrypted per-case workspace with strict access control.
- **AI Evidence Explorer** — Search across thousands of documents: "Find all penalty clauses from Party A's contracts".
- **Hearing Management** — Schedule video hearings, send official notifications, manage deadlines.
- **Panel Deliberation** — Private channel for multi-arbitrator panels.
- **Ruling Drafter** — Enforces mandatory structure: Preamble → Facts → Legal Reasoning → Ruling.
- **AI Ruling Review** — Pre-publication check for formal completeness + nullification risk.
- **Escrow Tracker** — Confirms arbitration fees are deposited before proceedings.
- **Arbitrator KPIs** — Average resolution time, cases arbitrated, non-nullified percentage.

---

## 🤖 Phase 7: n8n Orchestration & AI Integration

### API Bridge

#### [NEW] `services/n8nClient.ts`

```typescript
const N8N_BASE = import.meta.env.VITE_N8N_WEBHOOK_URL;

export const n8n = {
  scanContract: (fileUrl: string, context: object) => fetch(`${N8N_BASE}/scan-contract`, { method: 'POST', body: JSON.stringify({ fileUrl, context }) }),
  chatAssistant: (prompt: string, role: string, history: object[]) => fetch(`${N8N_BASE}/chat`, { method: 'POST', body: JSON.stringify({ prompt, role, history }) }),
  generateTemplate: (templateType: string, data: object) => fetch(`${N8N_BASE}/generate-template`, { method: 'POST', body: JSON.stringify({ templateType, data }) }),
  smartHandoff: (caseDescription: string, countryId: string) => fetch(`${N8N_BASE}/smart-handoff`, { method: 'POST', body: JSON.stringify({ caseDescription, countryId }) }),
};
```

### Supabase Realtime Subscriptions
Subscribe to `service_requests` and `documents` tables for live UI updates when n8n completes background processing.

---

## 🌐 Phase 8: Public Community Q&A Platform

#### [NEW] `pages/public/Community.tsx`

- **Question Feed** — Paginated, filtered by `country_id`, searchable by category.
- **Ask a Question** — Form (anonymous option available for seekers).
- **Answer Section** — Only verified providers can answer. Shows provider's name, specialty, and `visibility_score`.
- **Upvote System** — Upvoting an answer triggers the PostgreSQL `on_answer_upvote` trigger, which auto-increments the provider's `visibility_score` in their profile.
- **Endorsed Badge** — Admin/AI can mark answers as highly accurate.

---

## 🛡️ Phase 9: Database Fixes Needed

| # | Issue | Fix |
|---|---|---|
| 1 | `handle_new_user()` trigger doesn't populate new profile fields | Update trigger (see Phase 1.3) |
| 2 | No `INSERT` RLS policy on `workspaces` | Add `CREATE POLICY "Workspaces Insert" ON public.workspaces FOR INSERT WITH CHECK (owner_id = auth.uid())` |
| 3 | No `UPDATE/DELETE` RLS on `service_requests` | Add policies for providers to update status, seekers to cancel own requests |
| 4 | No `INSERT` RLS on `documents` | Add `CREATE POLICY "Documents Insert" ON public.documents FOR INSERT WITH CHECK (uploaded_by = auth.uid())` |
| 5 | No `INSERT` RLS on `community_questions` | Add policy allowing anyone authenticated to insert |
| 6 | No `INSERT` RLS on `community_answers` | Add policy allowing verified providers to insert |
| 7 | No `UPDATE` RLS on `community_answers` for upvotes | Add policy for upvote increments |
| 8 | `documents` has no `country_id` | Inherits via `service_requests.country_id` — acceptable |

---

## 🏁 Execution Order (Build Sequence)

| Epic | Phases | Deliverable | Estimated Effort |
|---|---|---|---|
| **Epic 1** | Phase 1 + 2 | Types sync, Auth refactor, Smart Signup, Login redirect | Foundation |
| **Epic 2** | Phase 3 | Route guards, DashboardLayout, 10 empty dashboard pages | Skeleton |
| **Epic 3** | Phase 4 | Shared hooks + 10 widget components | Building Blocks |
| **Epic 4** | Phase 5 | B2C Individual dashboard (first full dashboard) | First User Flow |
| **Epic 5** | Phase 6.2 | Independent Lawyer dashboard | First Provider Flow |
| **Epic 6** | Phase 6.1 + 6.3 | Law Firm + Trainee (workspace flow) | Team Workflow |
| **Epic 7** | Phase 6.4 + 6.5 | Notary + Marriage Official (field dashboards) | Specialized UIs |
| **Epic 8** | Phase 5.2 + 5.3 + 5.4 | Company + Government + NGO dashboards | Enterprise Flows |
| **Epic 9** | Phase 6.6 | Arbitrator dashboard | High-Security Flow |
| **Epic 10** | Phase 7 | n8n webhook connections + AI features | Intelligence Layer |
| **Epic 11** | Phase 8 | Community Q&A platform | SEO & Gamification |
| **Epic 12** | Phase 9 | Database fixes + missing RLS policies | Security Hardening |
