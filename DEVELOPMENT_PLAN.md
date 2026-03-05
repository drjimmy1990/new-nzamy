# 🚀 Nzamy SaaS — Next Phase Development Plan

> **Date:** March 5, 2026
> **Previous plan:** `SAAS_IMPLEMENTATION.md` (Phases 1–4 completed)
> **Database:** `schema.sql` + `schema-part2.sql` + `schema-part3-fix-trigger.sql` + `schema-part4-rls.sql`
> **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS

---

## 📊 Current State — What's Already Built

### ✅ Database (Supabase — LIVE)

| Layer | Tables | Status |
|---|---|---|
| **CMS (schema.sql)** | `profiles`, `countries` (8 seeded), `site_settings`, `hero_content`, `features`, `services`, `stats`, `team_members`, `testimonials`, `blog_posts`, `blog_comments`, `blog_likes`, `faq_items`, `social_links`, `nav_links`, `contact_submissions`, `client_logos`, `pages` | ✅ Live |
| **RBAC (schema-part2.sql)** | 6 ENUMs (`account_category`, `seeker_type`, `provider_type`, `service_category`, `request_status`, `workspace_role`), `profiles` expanded (+`country_id`, `account_cat`, `s_type`, `p_type`, `visibility_score`, `is_verified`, `specialty`), `workspaces`, `workspace_members`, `service_requests`, `documents`, `community_questions`, `community_answers` | ✅ Live |
| **Trigger Fix (schema-part3)** | `handle_new_user()` simplified (inserts basic profile), `setup_user_role()` RPC (SECURITY DEFINER) sets RBAC fields post-signup | ✅ Live |
| **RLS Fix (schema-part4)** | Relaxed `service_requests` policies for testing (removed `user_country_id()` requirement on INSERT, removed `is_verified` requirement for providers viewing pool) | ✅ Live |

### ✅ Frontend — Completed Features

| Component | File(s) | Status |
|---|---|---|
| **Public Landing Pages** | `Hero.tsx`, `Features.tsx`, `Services.tsx`, `Stats.tsx`, `Clients.tsx`, `Founders.tsx`, `Header.tsx`, `Footer.tsx`, `FloatingActions.tsx` | ✅ Fully functional, bilingual (AR/EN), country-aware, dark mode |
| **Blog System** | `BlogList.tsx`, `BlogPost.tsx`, `useBlog.ts` | ✅ Full CRUD with comments, likes, approval workflow |
| **Community Q&A** | `Community.tsx`, `useCommunity.ts` | ✅ Questions list, posting, answers with upvotes, country-filtered |
| **FAQ & Contact** | `FAQ.tsx`, `Contact.tsx` | ✅ Dynamic from Supabase |
| **CMS Pages** | `PageRenderer.tsx` | ✅ Renders `/page/:slug` from `pages` table |
| **Team Member Pages** | `TeamMemberPage.tsx` | ✅ Individual team member profiles |
| **Auth: Signup** | `Signup.tsx` | ✅ 4-step wizard (Country → Intent → Type → Credentials), calls `setup_user_role` RPC |
| **Auth: Login** | `Login.tsx` | ✅ Email/password, redirects to homepage after login |
| **Auth: Logout** | `Header.tsx`, `DashboardSidebar.tsx` | ✅ Logout button in header (desktop + mobile) and dashboard sidebar |
| **Auth Context** | `AuthContext.tsx` | ✅ Dual Supabase clients (`supabase` + `supabasePublic`), RBAC helpers (`isSeeker`, `isProvider`, `getDashboardPath()`), profile fetch with fallback |
| **Route Guards** | `RequireAuth.tsx` | ✅ Redirects unauthenticated users to `/login` |
| **Dashboard Layout** | `DashboardLayout.tsx`, `DashboardSidebar.tsx` | ✅ Responsive sidebar with role-aware menu items for all 10 user types |
| **Dashboard Pages (10)** | `Individual`, `Company`, `Government`, `NGO`, `LawFirm`, `Lawyer`, `Trainee`, `Notary`, `Marriage`, `Arbitrator` | ⚠️ Skeleton UIs only — stats, tabs, placeholder widgets |
| **Hooks** | `useContent.ts` (13 hooks), `useBlog.ts`, `useCommunity.ts`, `useServiceRequests.ts`, `useDocuments.ts`, `useWorkspace.ts` | ✅ Created, basic CRUD |
| **Widgets (8)** | `StatsOverviewWidget`, `KanbanBoardWidget`, `CaseTimelineWidget`, `DocumentVaultWidget`, `OrderInboxWidget`, `CalendarWidget`, `ProfileCardWidget`, `CommunityRadarWidget` | ⚠️ Created but display static/dummy data |
| **AI Chat** | `ChatWidget.tsx`, `geminiService.ts` | ⚠️ Basic Gemini integration, no legal RAG, no role-awareness |
| **Supabase Clients** | `supabaseClient.ts` | ✅ Dual clients (`supabase` for auth, `supabasePublic` for public content fetching bypassing RLS) |

### ⚠️ Known Issues & Technical Debt

| # | Issue | Impact |
|---|---|---|
| 1 | "Multiple GoTrueClient instances detected" console warning | Cosmetic — functionality works correctly |
| 2 | `RequireRole.tsx` not implemented | Any authenticated user can access any dashboard URL directly |
| 3 | No email verification enforced | Users can login without confirming email |
| 4 | `Signup.tsx` fetches countries using auth `supabase` client, not `supabasePublic` | May fail if RLS blocks anonymous reads during signup |
| 5 | Dashboard widgets show placeholder/dummy data | Widgets are not connected to real business logic |
| 6 | No admin panel | Content management done directly in Supabase dashboard |
| 7 | `geminiService.ts` uses `process.env.API_KEY` (Node.js) instead of `import.meta.env.VITE_GEMINI_KEY` | Won't work in browser — needs fix |
| 8 | No `INSERT` RLS policies on `workspaces`, `documents`, `community_questions`, `community_answers` | Write operations will be blocked by RLS |
| 9 | Chunk size warning on build (>500KB vendor-react bundle) | Needs manual chunking in `vite.config.ts` |

---

## 🏗️ Next Phase — Feature Implementation Roadmap

### Phase 5: Make Dashboards Functional (Priority: HIGH)

**Goal:** Transform skeleton dashboard pages into working applications with real data flows.

---

#### 5.1 — Service Request Creation Flow

**What:** Allow seekers (Individual, Company, Government, NGO) to create service requests from their dashboard.

**Files to create/modify:**

| Action | File | Details |
|---|---|---|
| NEW | `components/widgets/CreateRequestModal.tsx` | Modal form: select category (`consultation`, `case_pleading`, `contract_review`, etc.), title, description, optional file upload. Uses `useCreateRequest` hook. |
| MODIFY | `pages/dashboard/seeker/IndividualDashboard.tsx` | Add "طلب جديد / New Request" button → opens `CreateRequestModal`. Wire `useMyRequests` to display real requests in `CaseTimelineWidget`. |
| MODIFY | `pages/dashboard/seeker/CompanyDashboard.tsx` | Same flow + add contract upload for "Contract Scanner" tab. |
| MODIFY | `pages/dashboard/seeker/GovernmentDashboard.tsx` | Same flow + compliance check category. |
| MODIFY | `pages/dashboard/seeker/NgoDashboard.tsx` | Same flow + charity compliance category. |
| MODIFY | `components/widgets/CaseTimelineWidget.tsx` | Display real `service_request` data with status badges and timestamps. |
| MODIFY | `components/widgets/KanbanBoardWidget.tsx` | Connect to `useMyRequests`, enable drag-and-drop status updates via `useUpdateRequestStatus`. |

**Database requirements:** ✅ Already have `service_requests` table + INSERT/UPDATE RLS policies.

---

#### 5.2 — Provider Order Inbox & Request Acceptance

**What:** Allow providers (Lawyers, Law Firms, Notaries, Marriage Officials, Arbitrators) to see incoming requests and accept/reject them.

**Files to create/modify:**

| Action | File | Details |
|---|---|---|
| MODIFY | `components/widgets/OrderInboxWidget.tsx` | Fetch `usePoolRequests(countryId)` for unassigned requests. Add Accept/Reject buttons. On accept: update `provider_id` to current user, set status to `in_progress`. |
| MODIFY | `pages/dashboard/provider/LawyerDashboard.tsx` | Wire `OrderInboxWidget` with real pool data + `useProviderRequests` for accepted cases. |
| MODIFY | `pages/dashboard/provider/LawFirmDashboard.tsx` | Same + workspace-level view of all firm cases. |
| MODIFY | `pages/dashboard/provider/NotaryDashboard.tsx` | Filter pool requests by `category = 'notarization'`. |
| MODIFY | `pages/dashboard/provider/MarriageDashboard.tsx` | Filter pool by `category = 'marriage'`. |
| MODIFY | `pages/dashboard/provider/ArbitratorDashboard.tsx` | Filter pool by `category = 'arbitration'`. |
| MODIFY | `pages/dashboard/provider/TraineeDashboard.tsx` | Show only workspace-assigned tasks (no direct pool access). |

**Database requirements:**
- ✅ `service_requests` table exists with `provider_id` field
- ✅ RLS allows providers to see `pending_match` pool requests
- ⚠️ Need UPDATE policy for providers to set `provider_id` on acceptance

**New SQL needed:**
```sql
-- Allow providers to claim pool requests (set provider_id on pending_match requests)
CREATE POLICY "Provider Claim Request" ON public.service_requests
FOR UPDATE USING (
    status = 'pending_match'
    AND provider_id IS NULL
    AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND account_cat = 'provider'
    )
);
```

---

#### 5.3 — Document Upload & Management

**What:** Allow users to upload documents (contracts, IDs, medical reports) to service requests.

**Files to create/modify:**

| Action | File | Details |
|---|---|---|
| MODIFY | `components/widgets/DocumentVaultWidget.tsx` | Connect to `useDocuments(requestId)`. Implement Supabase Storage upload via `supabase.storage.from('documents').upload()`. Show file list with download links. |
| MODIFY | `hooks/useDocuments.ts` | Add `uploadDocument()` function that: (1) uploads file to Supabase Storage, (2) inserts row in `documents` table with `file_url`. |
| NEW | Supabase Storage bucket `documents` | Create via Supabase dashboard. Set RLS: users can only access their own documents. |

**Database requirements:**
- ✅ `documents` table exists
- ⚠️ Missing INSERT RLS policy

**New SQL needed:**
```sql
CREATE POLICY "Documents Insert" ON public.documents
FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Documents View Own" ON public.documents
FOR SELECT USING (
    uploaded_by = auth.uid()
    OR request_id IN (
        SELECT id FROM public.service_requests
        WHERE seeker_id = auth.uid() OR provider_id = auth.uid()
    )
);
```

---

#### 5.4 — Real Stats & Analytics Widgets

**What:** Replace dummy numbers in `StatsOverviewWidget` with real computed data.

**Files to modify:**

| Action | File | Details |
|---|---|---|
| MODIFY | All 10 dashboard pages | Compute stats from `requests` array: `requests.filter(r => r.status === 'in_progress').length`, etc. Currently partially done in Individual/Company dashboards. |
| NEW | `hooks/useStats.ts` | Reusable hook: `useDashboardStats(userId, role)` → returns `{ totalRequests, activeRequests, completedRequests, pendingRequests }` |

---

### Phase 6: Role Guard & Security (Priority: HIGH)

**Goal:** Prevent unauthorized dashboard access and harden RLS.

---

#### 6.1 — RequireRole Component

| Action | File | Details |
|---|---|---|
| NEW | `components/auth/RequireRole.tsx` | Props: `allowedCats?: AccountCategory[]`, `allowedTypes?: (SeekerType \| ProviderType)[]`. If user's profile doesn't match → redirect to their correct dashboard or show 403. |
| MODIFY | `App.tsx` | Wrap each dashboard route with `<RequireRole>`. Example: `/dashboard/seeker/company` → `<RequireRole allowedCats={['seeker']} allowedTypes={['company']}>` |

---

#### 6.2 — Missing RLS Policies

**New SQL file: `schema-part5-rls-complete.sql`**

```sql
-- Workspaces: owners can create
CREATE POLICY "Workspaces Insert" ON public.workspaces
FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Workspaces: owners can update
CREATE POLICY "Workspaces Update" ON public.workspaces
FOR UPDATE USING (owner_id = auth.uid());

-- Community Questions: any authenticated user can post
CREATE POLICY "Community Q Insert" ON public.community_questions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Community Answers: only providers can answer
CREATE POLICY "Community A Insert" ON public.community_answers
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND account_cat = 'provider'
    )
);

-- Community Answers: anyone can upvote (increment upvotes field)
CREATE POLICY "Community A Update Upvote" ON public.community_answers
FOR UPDATE USING (true)
WITH CHECK (true);
```

---

### Phase 7: Workspace & Team Management (Priority: MEDIUM)

**Goal:** Enable Law Firms and Companies to manage team members.

---

#### 7.1 — Workspace Creation on Signup

| Action | File | Details |
|---|---|---|
| MODIFY | `AuthContext.tsx` → `signUp()` | After `setup_user_role` RPC succeeds, if `accountCat === 'seeker' && subType === 'company'` OR `accountCat === 'provider' && subType === 'law_firm'`, auto-create a workspace and add the user as owner. |
| NEW | `services/workspaceService.ts` | `createWorkspace(name, type, countryId)`, `addMember(workspaceId, userId, role)`, `removeMember(workspaceId, userId)` |

#### 7.2 — Team Management UI

| Action | File | Details |
|---|---|---|
| NEW | `components/widgets/TeamManagementWidget.tsx` | List workspace members with roles. Add member by email (invite flow). Remove member. Change role. |
| MODIFY | `pages/dashboard/seeker/CompanyDashboard.tsx` | Wire "Team" tab to `TeamManagementWidget`. |
| MODIFY | `pages/dashboard/provider/LawFirmDashboard.tsx` | Wire "Team" tab to `TeamManagementWidget`. |

---

### Phase 8: AI Integration via n8n (Priority: MEDIUM)

**Goal:** Replace basic Gemini chat with intelligent, role-aware AI features powered by n8n webhooks.

---

#### 8.1 — n8n Webhook Client

| Action | File | Details |
|---|---|---|
| NEW | `services/n8nClient.ts` | Centralized n8n webhook caller with error handling. Endpoints: `/chat`, `/scan-contract`, `/smart-handoff`, `/generate-template`, `/compliance-check`. |
| MODIFY | `.env` | Add `VITE_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook` |

#### 8.2 — AI Chat Widget Upgrade

| Action | File | Details |
|---|---|---|
| MODIFY | `components/ChatWidget.tsx` | Replace direct Gemini calls with n8n webhook calls. Send user's `accountType`, `seekerType/providerType`, conversation history. n8n handles prompt engineering + RAG. |
| DELETE | `services/geminiService.ts` | No longer needed — AI processing moves to n8n server-side. |

#### 8.3 — Smart Contract Scanner

| Action | File | Details |
|---|---|---|
| NEW | `components/widgets/ContractScannerWidget.tsx` | Upload PDF → call n8n `/scan-contract` → display results (red flags, compliant clauses, review needed). Used in Company, LawFirm, Lawyer dashboards. |

#### 8.4 — Smart Handoff

| Action | File | Details |
|---|---|---|
| NEW | `components/widgets/SmartHandoffWidget.tsx` | After AI chat suggests a lawyer: n8n `/smart-handoff` returns ranked list of verified providers matching the case specialty + country. User can pick one to create a `service_request`. |

---

### Phase 9: Real-Time Features (Priority: MEDIUM)

**Goal:** Add live updates using Supabase Realtime subscriptions.

---

| Action | File | Details |
|---|---|---|
| NEW | `hooks/useRealtimeRequests.ts` | Subscribe to `service_requests` table changes. Auto-update dashboard when a request status changes (e.g., provider accepts a case). |
| NEW | `hooks/useRealtimeNotifications.ts` | Bell icon in dashboard topbar. Subscribe to changes relevant to the current user (new request assigned, status changed, message received). |
| MODIFY | `components/dashboard/DashboardLayout.tsx` | Add notification bell with unread count badge. |

---

### Phase 10: Admin Panel (Priority: MEDIUM)

**Goal:** Build an admin dashboard for managing all platform content and users.

---

| Action | File | Details |
|---|---|---|
| NEW | `pages/admin/AdminDashboard.tsx` | Overview: total users, active requests, revenue, recent signups. |
| NEW | `pages/admin/AdminUsers.tsx` | User list with filters (role, country, verified). Verify/unverify providers. Promote to admin. |
| NEW | `pages/admin/AdminRequests.tsx` | All service requests across the platform. Override status. Resolve disputes. |
| NEW | `pages/admin/AdminContent.tsx` | CRUD for CMS tables: hero_content, features, services, stats, FAQ, nav_links, social_links, client_logos, pages. |
| NEW | `pages/admin/AdminBlog.tsx` | Approve/reject blog posts. Moderate comments. |
| NEW | `pages/admin/AdminCommunity.tsx` | Moderate community Q&A. Endorse answers. |
| NEW | `components/admin/AdminLayout.tsx` | Admin-specific sidebar + topbar. |
| MODIFY | `App.tsx` | Add `/admin/*` routes with `<RequireRole allowedCats={['admin']}>` guard. |

---

### Phase 11: Payment & Wallet System (Priority: LOW)

**Goal:** Enable financial transactions between seekers and providers.

---

| Action | File | Details |
|---|---|---|
| NEW | Database table `wallet_transactions` | `id`, `user_id`, `type` (credit/debit), `amount`, `currency`, `description`, `reference_id`, `created_at`. |
| NEW | Database table `wallets` | `id`, `user_id`, `balance`, `currency`, `updated_at`. |
| NEW | `hooks/useWallet.ts` | `useWallet(userId)` → balance, transactions. `deposit()`, `withdraw()`. |
| NEW | `components/widgets/SmartWalletWidget.tsx` | Balance display, transaction history, referral link with 5% commission tracking. |
| NEW | `services/paymentService.ts` | Integration with payment gateway (Moyasar/Tap/HyperPay for SA, Paymob for EG). |

---

### Phase 12: Deployment & Production Readiness (Priority: LOW)

**Goal:** Prepare for production launch.

---

| Task | Details |
|---|---|
| Vite build optimization | Manual chunks in `vite.config.ts` to fix >500KB vendor bundle warning. |
| Environment variables audit | Ensure all `VITE_*` vars are documented and validated on app start. |
| Error boundaries | Add React error boundaries around dashboard routes. |
| SEO meta tags | Dynamic `<title>` and `<meta>` per page using `react-helmet-async`. |
| PWA support | `vite-plugin-pwa` for offline access + installability. |
| Analytics | Google Analytics 4 / Mixpanel integration. |
| Monitoring | Sentry for error tracking. |
| CI/CD | GitHub Actions → Vercel/Netlify auto-deploy on push to `main`. |
| Domain & SSL | Custom domain with SSL via hosting provider. |

---

## 📐 Database Schema Reference

### ENUMs

| ENUM | Values |
|---|---|
| `account_category` | `seeker`, `provider`, `admin` |
| `seeker_type` | `individual`, `company`, `government`, `ngo` |
| `provider_type` | `law_firm`, `independent_lawyer`, `trainee_lawyer`, `notary`, `marriage_official`, `arbitrator` |
| `service_category` | `consultation`, `case_pleading`, `contract_review`, `notarization`, `marriage`, `arbitration`, `other` |
| `request_status` | `draft`, `pending_match`, `in_progress`, `pending_approval`, `completed`, `cancelled` |
| `workspace_role` | `owner`, `admin`, `member`, `trainee` |

### Core Business Tables

```
profiles (expanded)
├── id (UUID, PK, FK → auth.users)
├── full_name, avatar_url, role (admin|user)
├── country_id (FK → countries)
├── account_cat (seeker|provider|admin)
├── s_type (individual|company|government|ngo) — if seeker
├── p_type (law_firm|independent_lawyer|...) — if provider
├── visibility_score, is_verified, specialty
└── created_at, updated_at

workspaces
├── id, country_id, name, type, owner_id
├── commercial_record_number, is_verified
└── created_at, updated_at

workspace_members
├── id, workspace_id, user_id, role
└── UNIQUE(workspace_id, user_id)

service_requests
├── id, country_id, seeker_id, provider_id (nullable)
├── workspace_id (nullable), category, status
├── title, description, metadata (JSONB), price
└── created_at, updated_at

documents
├── id, request_id, uploaded_by
├── document_type, file_url, verification_status
└── created_at

community_questions
├── id, country_id, author_id (nullable)
├── title, content, category
└── created_at, updated_at

community_answers
├── id, question_id, provider_id
├── content, upvotes, is_endorsed
└── created_at, updated_at
```

### CMS Tables (18 tables)

`countries`, `site_settings`, `hero_content`, `features`, `services`, `stats`, `team_members`, `testimonials`, `blog_posts`, `blog_comments`, `blog_likes`, `faq_items`, `social_links`, `nav_links`, `contact_submissions`, `client_logos`, `pages`

All CMS tables follow the pattern: `country_id` FK, bilingual columns (`*_ar`, `*_en`), `display_order`, `is_active`, public SELECT RLS, admin-only write RLS.

---

## 🔗 Current File Structure

```
nzamy-landing-page/
├── App.tsx                          # Router: PublicLayout + DashboardLayout (10 routes)
├── index.css                        # Global styles
├── main.tsx                         # Entry point
├── .env                             # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, API_KEY
│
├── contexts/
│   ├── AuthContext.tsx               # Dual Supabase clients, RBAC, signIn/signUp/signOut
│   ├── CountryContext.tsx            # Country selection (uses supabasePublic)
│   ├── LanguageContext.tsx           # AR/EN toggle
│   └── ThemeContext.tsx              # Dark/light mode
│
├── services/
│   ├── supabaseClient.ts            # supabase (auth) + supabasePublic (anon, custom storage)
│   └── geminiService.ts             # Basic Gemini chat (⚠️ broken: uses process.env)
│
├── hooks/
│   ├── useContent.ts                # 13 CMS hooks (hero, features, services, stats, etc.)
│   ├── useBlog.ts                   # Blog CRUD + comments + likes
│   ├── useCommunity.ts              # Community Q&A
│   ├── useServiceRequests.ts        # useMyRequests, useProviderRequests, usePoolRequests
│   ├── useDocuments.ts              # useDocuments, uploadDocument
│   └── useWorkspace.ts              # useWorkspace, useWorkspaceMembers
│
├── types/
│   └── database.ts                  # 6 ENUMs + 12 interfaces (Profile, Workspace, ServiceRequest, etc.)
│
├── components/
│   ├── Header.tsx                   # Nav + auth buttons + logout
│   ├── Hero.tsx, Features.tsx, ...  # Landing page sections
│   ├── ChatWidget.tsx               # Floating AI chat (uses geminiService)
│   ├── FloatingActions.tsx          # WhatsApp + Chat FABs
│   ├── Footer.tsx                   # Social links, nav links
│   ├── auth/
│   │   └── RequireAuth.tsx          # Route guard (auth check only)
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx      # Sidebar + topbar + Outlet
│   │   └── DashboardSidebar.tsx     # Role-aware menu (10 menu configs) + logout
│   └── widgets/
│       ├── StatsOverviewWidget.tsx   # Summary stat cards
│       ├── KanbanBoardWidget.tsx     # Drag-and-drop board
│       ├── CaseTimelineWidget.tsx    # Single request timeline
│       ├── DocumentVaultWidget.tsx   # File upload/download
│       ├── OrderInboxWidget.tsx      # Incoming requests list
│       ├── CalendarWidget.tsx        # Appointments grid
│       ├── ProfileCardWidget.tsx     # Provider profile editor
│       └── CommunityRadarWidget.tsx  # Unanswered questions radar
│
├── pages/
│   ├── Login.tsx                    # Email/password → redirect to /
│   ├── Signup.tsx                   # 4-step wizard → setup_user_role RPC
│   ├── Community.tsx                # Public Q&A (read + write)
│   ├── BlogList.tsx, BlogPost.tsx   # Blog system
│   ├── FAQ.tsx, Contact.tsx         # Static-ish pages
│   ├── PageRenderer.tsx             # CMS pages
│   └── dashboard/
│       ├── seeker/
│       │   ├── IndividualDashboard.tsx
│       │   ├── CompanyDashboard.tsx
│       │   ├── GovernmentDashboard.tsx
│       │   └── NgoDashboard.tsx
│       └── provider/
│           ├── LawFirmDashboard.tsx
│           ├── LawyerDashboard.tsx
│           ├── TraineeDashboard.tsx
│           ├── NotaryDashboard.tsx
│           ├── MarriageDashboard.tsx
│           └── ArbitratorDashboard.tsx
│
└── SQL schemas/
    ├── schema.sql                   # v1 CMS (18 tables + seed data)
    ├── schema-part2.sql             # v2 RBAC (6 ENUMs + 6 tables + RLS)
    ├── schema-part3-fix-trigger.sql # Fixed trigger + setup_user_role RPC
    └── schema-part4-rls.sql         # Relaxed RLS for testing
```

---

## 🏁 Execution Priority Order

| # | Phase | Deliverable | Priority | Depends On |
|---|---|---|---|---|
| 1 | **Phase 5.1** | Service Request Creation Flow | 🔴 HIGH | — |
| 2 | **Phase 5.2** | Provider Order Inbox & Acceptance | 🔴 HIGH | Phase 5.1 |
| 3 | **Phase 5.3** | Document Upload & Management | 🔴 HIGH | Phase 5.1 |
| 4 | **Phase 5.4** | Real Stats & Analytics | 🔴 HIGH | Phase 5.1 |
| 5 | **Phase 6.1** | RequireRole Route Guard | 🔴 HIGH | — |
| 6 | **Phase 6.2** | Complete RLS Policies | 🔴 HIGH | — |
| 7 | **Phase 7** | Workspace & Team Management | 🟡 MEDIUM | Phase 6.2 |
| 8 | **Phase 8** | n8n AI Integration | 🟡 MEDIUM | Phase 5.1 |
| 9 | **Phase 9** | Real-Time Subscriptions | 🟡 MEDIUM | Phase 5.2 |
| 10 | **Phase 10** | Admin Panel | 🟡 MEDIUM | Phase 6.1 |
| 11 | **Phase 11** | Payment & Wallet | 🟢 LOW | Phase 5.2 |
| 12 | **Phase 12** | Deployment & Production | 🟢 LOW | All above |

---

## ⚡ Quick Wins (Can be done immediately)

1. **Fix `geminiService.ts`** — Change `process.env.API_KEY` to `import.meta.env.VITE_GEMINI_KEY`.
2. **Fix Signup country fetch** — Use `supabasePublic` instead of `supabase` for fetching countries in `Signup.tsx`.
3. **Add `RequireRole.tsx`** — Simple component, prevents wrong-role dashboard access immediately.
4. **Wire real data to Stats** — Dashboards already compute `inProgressCount`/`completedCount` from `requests` array; just needs consistent pattern across all 10 dashboards.
5. **Add `schema-part5-rls-complete.sql`** — Run the missing INSERT/UPDATE policies in Supabase SQL editor.
