# 🔧 n8n Workflows — Required for Nzamy SaaS Backend

> These n8n workflows act as the serverless backend for Nzamy.
> Each workflow is triggered via a Webhook node and returns JSON responses.
> The frontend calls these webhooks via `services/n8nClient.ts`.

---

## Workflow List

### 1. 🤖 AI Legal Chat Assistant
- **Webhook:** `VITE_N8N_WEBHOOK_CHAT`
- **Method:** POST
- **Input:**
  ```json
  {
    "prompt": "string",
    "role": "seeker_individual | seeker_company | provider_lawyer | ...",
    "country": "SA | EG",
    "language": "ar | en",
    "history": [{ "role": "user|assistant", "content": "..." }]
  }
  ```
- **What it does:**
  1. Receives the user message + conversation history
  2. Builds a role-specific system prompt (comforter for individuals, scanner for companies, co-pilot for lawyers)
  3. Calls Gemini / OpenAI with RAG context (Saudi labor law docs, etc.)
  4. Returns the AI response
- **Output:** `{ "response": "string", "suggestHandoff": boolean, "suggestedCategory": "string" }`
- **Priority:** 🟡 MEDIUM

---

### 2. 📄 Smart Contract Scanner
- **Webhook:** `VITE_N8N_WEBHOOK_SCAN_CONTRACT`
- **Method:** POST
- **Input:**
  ```json
  {
    "fileUrl": "string (Supabase Storage URL)",
    "scanType": "full | quick | red_flags_only",
    "context": { "industry": "string", "country": "SA | EG" }
  }
  ```
- **What it does:**
  1. Downloads the PDF/DOCX from Supabase Storage
  2. Extracts text (via PDF parser node)
  3. Sends to Gemini with contract analysis prompt
  4. Returns structured red flags, compliant clauses, and review items
- **Output:**
  ```json
  {
    "redFlags": [{ "clause": "string", "risk": "high|medium|low", "explanation": "string" }],
    "compliantClauses": [{ "clause": "string", "note": "string" }],
    "needsReview": [{ "clause": "string", "reason": "string" }],
    "summary": "string"
  }
  ```
- **Priority:** 🟡 MEDIUM

---

### 3. 🤝 Smart Handoff (Lawyer Matching)
- **Webhook:** `VITE_N8N_WEBHOOK_SMART_HANDOFF`
- **Method:** POST
- **Input:**
  ```json
  {
    "caseDescription": "string",
    "category": "consultation | case_pleading | contract_review | ...",
    "countryId": "UUID"
  }
  ```
- **What it does:**
  1. Queries Supabase for verified providers matching the category + country
  2. Ranks them by `visibility_score` + specialty match
  3. Returns top 5 suggestions
- **Output:**
  ```json
  {
    "providers": [{
      "id": "UUID",
      "full_name": "string",
      "specialty": "string",
      "visibility_score": 42,
      "avatar_url": "string"
    }]
  }
  ```
- **Priority:** 🟡 MEDIUM

---

### 4. 📝 Legal Template Generator
- **Webhook:** `VITE_N8N_WEBHOOK_GENERATE_TEMPLATE`
- **Method:** POST
- **Input:**
  ```json
  {
    "templateType": "power_of_attorney | employment_contract | nda | rental_agreement | ...",
    "data": { "partyA": "string", "partyB": "string", ... },
    "country": "SA | EG",
    "language": "ar | en"
  }
  ```
- **What it does:**
  1. Selects a base template matching the type + country
  2. Fills in dynamic fields via AI
  3. Generates a PDF
  4. Uploads to Supabase Storage
  5. Returns the file URL
- **Output:** `{ "fileUrl": "string", "previewHtml": "string" }`
- **Priority:** 🟢 LOW

---

### 5. ✅ Compliance Checker
- **Webhook:** `VITE_N8N_WEBHOOK_COMPLIANCE_CHECK`
- **Method:** POST
- **Input:**
  ```json
  {
    "documentText": "string",
    "checkType": "charity_compliance | government_decision | corporate_bylaws",
    "country": "SA | EG"
  }
  ```
- **What it does:**
  1. Analyzes text against country-specific regulations
  2. Returns compliance status per regulation
- **Output:**
  ```json
  {
    "overall": "compliant | partially_compliant | non_compliant",
    "checks": [{ "regulation": "string", "status": "pass|fail|warning", "note": "string" }]
  }
  ```
- **Priority:** 🟢 LOW

---

### 6. 🔔 Notification Dispatcher
- **Webhook:** `VITE_N8N_WEBHOOK_NOTIFY`
- **Method:** POST
- **Input:**
  ```json
  {
    "userId": "UUID",
    "type": "request_accepted | request_completed | new_message | document_verified",
    "data": { "requestId": "UUID", "title": "string" }
  }
  ```
- **What it does:**
  1. Inserts notification into a `notifications` table (future)
  2. Optionally sends WhatsApp/SMS via Twilio
  3. Optionally sends email via SendGrid/Resend
- **Output:** `{ "success": true }`
- **Priority:** 🟢 LOW

---

### 7. 📊 Auto Report Generator
- **Webhook:** `VITE_N8N_WEBHOOK_GENERATE_REPORT`
- **Method:** POST
- **Input:**
  ```json
  {
    "reportType": "monthly_summary | case_status | risk_assessment",
    "userId": "UUID",
    "dateRange": { "from": "ISO", "to": "ISO" }
  }
  ```
- **What it does:**
  1. Queries Supabase for user's service requests in date range
  2. Generates AI summary
  3. Creates PDF report
  4. Returns download URL
- **Output:** `{ "fileUrl": "string", "summary": "string" }`
- **Priority:** 🟢 LOW

---

## Environment Variables Required

```env
# n8n Webhook Base URL
VITE_N8N_BASE_URL=https://your-n8n-instance.com/webhook

# Individual webhook paths (appended to base URL)
VITE_N8N_WEBHOOK_CHAT=/chat
VITE_N8N_WEBHOOK_SCAN_CONTRACT=/scan-contract
VITE_N8N_WEBHOOK_SMART_HANDOFF=/smart-handoff
VITE_N8N_WEBHOOK_GENERATE_TEMPLATE=/generate-template
VITE_N8N_WEBHOOK_COMPLIANCE_CHECK=/compliance-check
VITE_N8N_WEBHOOK_NOTIFY=/notify
VITE_N8N_WEBHOOK_GENERATE_REPORT=/generate-report
```

---

## Build Order

| # | Workflow | Needed for Phase |
|---|---|---|
| 1 | AI Legal Chat | Phase 8.2 (AI Chat Upgrade) |
| 2 | Smart Contract Scanner | Phase 8.3 (Contract Scanner Widget) |
| 3 | Smart Handoff | Phase 8.4 (Lawyer Matching) |
| 4 | Legal Template Generator | Phase 8 (AI Integration) |
| 5 | Compliance Checker | Phase 8 (Gov/NGO dashboards) |
| 6 | Notification Dispatcher | Phase 9 (Real-Time) |
| 7 | Auto Report Generator | Phase 10 (Admin Panel) |
