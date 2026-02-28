# 🧪 Nzamy Platform — Testing Checklist

> Run all tests on `http://localhost:3000` after `npm run dev`
> Use **Incognito** mode to avoid cached sessions interfering.

---

## Phase 0: SQL Setup ⚡
- [ ] Run `schema-part4-rls.sql` in Supabase SQL Editor (if not done already)
- [ ] Confirm "Success" with no errors

---

## Phase 1: Homepage & Public Pages

### 1.1 Homepage
- [ ] Go to `/` → Hero section visible with background + title
- [ ] Features section renders cards
- [ ] Services section renders
- [ ] Stats counter section visible
- [ ] Client logos visible
- [ ] Founders/Team section visible
- [ ] Footer renders with links and social icons
- [ ] Header shows: Logo, Nav links, Language toggle, Theme toggle, **Login**, **Sign Up** buttons
- [ ] ❌ No "احجز استشارتك" button in header (removed)

### 1.2 Header Auth Buttons
- [ ] When **NOT logged in**: show دخول (Login) + تسجيل (Sign Up)
- [ ] When **logged in**: show لوحة التحكم (Dashboard) button instead

### 1.3 Country Selector
- [ ] Only **Saudi Arabia 🇸🇦** and **Egypt 🇪🇬** appear
- [ ] Default country is **Saudi Arabia**

### 1.4 Language & Theme
- [ ] Click 🌐 → switches Arabic ↔ English
- [ ] Click 🌙 → switches Dark ↔ Light mode
- [ ] All sections update with language change

### 1.5 Other Public Pages
- [ ] `/blog` → Blog listing page loads (may be empty if no posts)
- [ ] `/faq` → FAQ page loads
- [ ] `/contact` → Contact form loads

---

## Phase 2: Signup Flow

### 2.1 Individual Seeker Signup
- [ ] Go to `/signup`
- [ ] Step 1 (Country): 🇸🇦 Saudi and 🇪🇬 Egypt buttons appear
- [ ] Pick Saudi Arabia → Next
- [ ] Step 2 (Account Type): Choose "أحتاج خدمات قانونية" (I need legal services)
- [ ] Step 3 (Sub Type): Choose "فرد" (Individual)
- [ ] Step 4 (Details): Enter name, email, password → Submit
- [ ] ✅ Success message appears
- [ ] Check Supabase `profiles` table:
  - `account_cat` = `seeker`
  - `s_type` = `individual`
  - `country_id` = Saudi Arabia's UUID

### 2.2 Provider Signup (Independent Lawyer)
- [ ] Sign out first (or use different incognito window)
- [ ] Go to `/signup`
- [ ] Pick Saudi Arabia → "أقدم خدمات قانونية" (I provide services) → "محامي مستقل" (Independent Lawyer)
- [ ] Enter different email, name, password → Submit
- [ ] Check Supabase `profiles` table:
  - `account_cat` = `provider`
  - `p_type` = `independent_lawyer`

---

## Phase 3: Login & Dashboard

### 3.1 Individual Seeker Dashboard
- [ ] Go to `/login` → sign in with Individual account
- [ ] Redirects to `/dashboard/seeker/individual`
- [ ] ✅ Sidebar visible with 5 items: الرئيسية, المستشار الذكي, تصفح المحامين, قضاياي, المحفظة
- [ ] ✅ Welcome message with your name
- [ ] ✅ Stats cards showing counts
- [ ] ✅ "إنشاء طلب جديد" button visible

### 3.2 Lawyer Dashboard
- [ ] Sign out → login with Lawyer account
- [ ] Redirects to `/dashboard/provider/independent_lawyer`
- [ ] ✅ Sidebar visible with 7 items
- [ ] ✅ Tabbed layout (Overview / Inbox / Board / Community)
- [ ] ✅ Profile card on the right

---

## Phase 4: Service Request Flow

### 4.1 Create Request (as Individual)
- [ ] Login as Individual → go to dashboard
- [ ] Click "إنشاء طلب جديد"
- [ ] Modal appears with category selection
- [ ] Pick a category (e.g. استشارة قانونية)
- [ ] Enter title (e.g. "مساعدة في عقد عمل")
- [ ] Click "إرسال الطلب"
- [ ] ✅ Request appears in "قضاياي" list
- [ ] ✅ Category badge visible next to title (e.g. blue "استشارة")
- [ ] ✅ Timeline tracker shows "بانتظار التعيين" (Pending Match)

### 4.2 View Request as Lawyer
- [ ] Sign out → login as Lawyer
- [ ] Go to Inbox tab → the request from 4.1 should appear under "Available Pool Requests"
- [ ] Click ✅ to accept → moves to "My Requests"

---

## Phase 5: Sign Out
- [ ] Click the 🚪 red logout icon in the dashboard topbar
- [ ] ✅ Redirected to homepage
- [ ] ✅ Page reloads cleanly
- [ ] ✅ Header shows Login/Sign Up buttons again (not Dashboard)

---

## Known Issues / Notes
| Issue | Status | Notes |
|-------|--------|-------|
| AbortError warnings in console | ⚠️ Harmless | React StrictMode in dev causes double-mount. Ignore these. |
| TypeScript strict errors | ⚠️ Non-blocking | Pre-existing TS strictness with Supabase generated types. Build succeeds. |
| `ERR_CONNECTION_CLOSED` | ⚠️ Transient | Supabase free tier may pause. Refresh to retry. |

---

## ✅ After Testing
Once all checks pass, we continue with:
- Wiring remaining dashboards (Company, Government, NGO, Trainee, Notary, Marriage, Arbitrator)
- AI Copilot widget (n8n integration)
- Supabase Realtime subscriptions
- Document upload flows
