# 🔧 n8n Workflow Build Specifications

> Detailed step-by-step node configurations for each n8n workflow.  
> Use these specs to build each workflow in n8n's visual editor.  
> Frontend already calls these webhooks via `services/n8nClient.ts`.

---

## 1. 🤖 AI Legal Chat Assistant

**Webhook Path:** `/chat`  
**Test URL:** `{n8n_base}/webhook-test/chat`  
**Production URL:** `{n8n_base}/webhook/chat`

### Node Flow:
```
Webhook → Set System Prompt → Gemini Chat → Respond to Webhook
```

### Nodes:

#### Node 1: Webhook (Trigger)
- **Type:** Webhook
- **HTTP Method:** POST
- **Path:** `chat`
- **Response Mode:** Last Node
- **Authentication:** None (add Header Auth later for production)

#### Node 2: Set System Prompt (Code Node)
- **Type:** Code (JavaScript)
- **Purpose:** Build a role-specific system prompt based on the user's role
```javascript
const { role, country, language } = $input.first().json.body;

const rolePrompts = {
  'seeker_individual': `أنت مستشار قانوني ذكي متخصص في مساعدة الأفراد. 
    تحدث بلغة بسيطة وواضحة. لا تقدم استشارات نهائية بل وجّه المستخدم.
    إذا كان السؤال معقداً اقترح الاتصال بمحامي متخصص.`,
  'seeker_company': `أنت مساعد قانوني متخصص للشركات.
    ركّز على العقود التجارية، قانون العمل، والامتثال.
    قدّم نصائح عملية مع الإشارة للأنظمة ذات الصلة.`,
  'seeker_government': `أنت مستشار حكومي رقمي.
    تخصص في الأنظمة واللوائح الحكومية والقرارات الإدارية.`,
  'seeker_ngo': `أنت مستشار قانوني متخصص بالجمعيات والمؤسسات الخيرية.
    ركّز على أنظمة الجمعيات والامتثال الخيري.`,
  'provider_lawyer': `أنت مساعد ذكي للمحامين. ساعد في البحث القانوني والصياغة.`,
};

const systemPrompt = rolePrompts[role] || rolePrompts['seeker_individual'];
const countryContext = country === 'SA' 
  ? 'السياق: المملكة العربية السعودية - الأنظمة السعودية'
  : 'السياق: جمهورية مصر العربية - القانون المصري';

return [{
  json: {
    systemPrompt: `${systemPrompt}\n${countryContext}\nاللغة: ${language === 'ar' ? 'عربي' : 'English'}`,
    userMessage: $input.first().json.body.prompt,
    history: $input.first().json.body.history || []
  }
}];
```

#### Node 3: Gemini Chat (AI Node)
- **Type:** Google Gemini Chat Model (or OpenAI)
- **Model:** `gemini-2.0-flash` (or `gemini-1.5-pro`)
- **System Message:** `{{ $json.systemPrompt }}`
- **User Message:** `{{ $json.userMessage }}`
- **Temperature:** 0.7
- **Max Tokens:** 1024
- **Memory:** Window Buffer Memory (last 10 messages)
  - **Input Key:** connect from `history` field

#### Node 4: Respond to Webhook
- **Type:** Respond to Webhook
- **Response Body:**
```json
{
  "response": "{{ $json.output }}",
  "suggestHandoff": false,
  "suggestedCategory": null
}
```

### Test Payload:
```json
{
  "prompt": "ما هي حقوق الموظف عند الفصل التعسفي؟",
  "role": "seeker_individual",
  "country": "SA",
  "language": "ar",
  "history": []
}
```

---

## 2. 📄 Smart Contract Scanner

**Webhook Path:** `/scan-contract`

### Node Flow:
```
Webhook → Download File → Extract Text → AI Analysis → Format Results → Respond
```

### Nodes:

#### Node 1: Webhook
- **Path:** `scan-contract`
- **Method:** POST

#### Node 2: HTTP Request (Download File)
- **Type:** HTTP Request
- **URL:** `{{ $json.body.fileUrl }}`
- **Method:** GET
- **Response Format:** File (Binary)

#### Node 3: Extract Text (Code Node)
- **Type:** Code (JavaScript)
- **Purpose:** Extract text from PDF binary data
```javascript
// If using a PDF parser node, connect it here
// Otherwise, use the binary data directly with AI
const fileUrl = $('Webhook').first().json.body.fileUrl;
const scanType = $('Webhook').first().json.body.scanType;
const context = $('Webhook').first().json.body.context;

return [{
  json: {
    fileUrl,
    scanType,
    industry: context?.industry || 'general',
    country: context?.country || 'SA'
  }
}];
```

#### Node 4: Gemini Analysis (AI Node)
- **Type:** Google Gemini Chat Model
- **Model:** `gemini-2.0-flash`
- **System Message:**
```
أنت محلل عقود قانوني ذكي. حلل العقد التالي وأعد النتائج بصيغة JSON فقط.

يجب أن يحتوي الرد على:
1. redFlags: قائمة بالمخاطر والثغرات القانونية
2. compliantClauses: البنود المتوافقة مع الأنظمة
3. needsReview: البنود التي تحتاج مراجعة إضافية
4. summary: ملخص تنفيذي موجز

أعد النتيجة كـ JSON صالح فقط بدون أي نص إضافي.
البلد: {{ $json.country }}
```
- **User Message:** `حلل هذا العقد: {{ $json.extractedText }}`
- **Temperature:** 0.3 (lower for accuracy)

#### Node 5: Parse JSON (Code Node)
```javascript
const aiOutput = $json.output;
try {
  const parsed = JSON.parse(aiOutput);
  return [{ json: parsed }];
} catch {
  return [{
    json: {
      redFlags: [],
      compliantClauses: [],
      needsReview: [],
      summary: aiOutput
    }
  }];
}
```

#### Node 6: Respond to Webhook
- Return the parsed JSON object

### Test Payload:
```json
{
  "fileUrl": "https://your-supabase.co/storage/v1/object/public/documents/test.pdf",
  "scanType": "full",
  "context": { "industry": "real_estate", "country": "SA" }
}
```

---

## 3. 🤝 Smart Handoff (Lawyer Matching)

**Webhook Path:** `/smart-handoff`

### Node Flow:
```
Webhook → Supabase Query → Rank Providers → Respond
```

### Nodes:

#### Node 1: Webhook
- **Path:** `smart-handoff`
- **Method:** POST

#### Node 2: Supabase (Select)
- **Type:** Supabase node
- **Operation:** Get Many (Read)
- **Table:** `profiles`
- **Filters:**
  - `account_cat` = `provider`
  - `is_verified` = `true`
  - `country_id` = `{{ $json.body.countryId }}`
- **Return Fields:** `id, full_name, specialty, visibility_score, avatar_url, p_type`
- **Order By:** `visibility_score` DESC
- **Limit:** 10

#### Node 3: Rank & Filter (Code Node)
```javascript
const providers = $input.all().map(item => item.json);
const category = $('Webhook').first().json.body.category;

// Map categories to provider types
const categoryToType = {
  'consultation': ['independent_lawyer', 'law_firm'],
  'case_pleading': ['independent_lawyer', 'law_firm'],
  'contract_review': ['independent_lawyer', 'law_firm'],
  'notarization': ['notary'],
  'marriage': ['marriage_official'],
  'arbitration': ['arbitrator'],
};

const allowedTypes = categoryToType[category] || ['independent_lawyer', 'law_firm'];
const filtered = providers
  .filter(p => allowedTypes.includes(p.p_type))
  .slice(0, 5);

return [{ json: { providers: filtered } }];
```

#### Node 4: Respond to Webhook
- Return `{ "providers": [...] }`

### Test Payload:
```json
{
  "caseDescription": "نزاع عمالي حول الفصل التعسفي",
  "category": "case_pleading",
  "countryId": "your-country-uuid"
}
```

---

## 4. 📝 Legal Template Generator

**Webhook Path:** `/generate-template`

### Node Flow:
```
Webhook → Select Template → AI Fill → Generate PDF → Upload to Supabase → Respond
```

### Nodes:

#### Node 1: Webhook
- **Path:** `generate-template`

#### Node 2: Select Template (Code Node)
```javascript
const { templateType, data, country, language } = $json.body;

const templates = {
  'power_of_attorney': {
    ar: 'وكالة عامة / خاصة',
    structure: 'بسم الله الرحمن الرحيم\nوكالة {{type}}\n...'
  },
  'employment_contract': {
    ar: 'عقد عمل',
    structure: 'عقد عمل\nالطرف الأول: {{partyA}}\n...'
  },
  'nda': {
    ar: 'اتفاقية عدم إفصاح',
    structure: 'اتفاقية سرية وعدم إفصاح\n...'
  },
};

return [{ json: { template: templates[templateType], data, country, language } }];
```

#### Node 3: AI Fill (Gemini)
- Fill template placeholders with AI-generated legal text based on `data`

#### Node 4: Generate PDF (HTML to PDF node or similar)
- Convert the filled template to PDF

#### Node 5: Supabase Storage Upload
- Upload the PDF to `documents` bucket

#### Node 6: Respond to Webhook
```json
{ "fileUrl": "{{ storage_url }}", "previewHtml": "{{ filled_template }}" }
```

---

## 5. ✅ Compliance Checker

**Webhook Path:** `/compliance-check`

### Node Flow:
```
Webhook → AI Analysis → Format → Respond
```

### Nodes:

#### Node 1: Webhook
- **Path:** `compliance-check`

#### Node 2: Gemini Analysis
- **System Prompt:**
```
أنت مدقق امتثال قانوني. حلل النص المقدم وتحقق من توافقه مع اللوائح.
البلد: {{ $json.body.country }}
نوع الفحص: {{ $json.body.checkType }}

أعد النتيجة كـ JSON:
{
  "overall": "compliant | partially_compliant | non_compliant",
  "checks": [{ "regulation": "name", "status": "pass|fail|warning", "note": "details" }]
}
```
- **User Message:** `{{ $json.body.documentText }}`

#### Node 3: Parse + Respond

---

## 6. 🔔 Notification Dispatcher

**Webhook Path:** `/notify`

### Node Flow:
```
Webhook → Insert Notification → Send Email (optional) → Respond
```

### Nodes:

#### Node 1: Webhook
- **Path:** `notify`

#### Node 2: Supabase Insert
- **Table:** `notifications` (create this table if needed)
- **Fields:**
  - `user_id`: `{{ $json.body.userId }}`
  - `type`: `{{ $json.body.type }}`
  - `title`: based on type mapping
  - `data`: `{{ $json.body.data }}`
  - `read`: `false`

#### Node 3: IF - Check notification type
- If type is `request_accepted` or `request_completed` → send email

#### Node 4: Send Email (optional)
- Use SendGrid / Resend / SMTP node
- Template based on notification type

#### Node 5: Respond
```json
{ "success": true }
```

### SQL for notifications table (run in Supabase):
```sql
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE USING (auth.uid() = user_id);
```

---

## 7. 📊 Auto Report Generator

**Webhook Path:** `/generate-report`

### Node Flow:
```
Webhook → Supabase Query → AI Summary → Generate PDF → Upload → Respond
```

### Nodes:

#### Node 1: Webhook
- **Path:** `generate-report`

#### Node 2: Supabase Query
- **Table:** `service_requests`
- **Filter:** `seeker_id = userId` OR `provider_id = userId`
- **Date filter:** `created_at` between `from` and `to`

#### Node 3: Gemini Summary
- Summarize the fetched requests into a report

#### Node 4: Generate PDF + Upload to Supabase Storage

#### Node 5: Respond
```json
{ "fileUrl": "{{ pdf_url }}", "summary": "{{ ai_summary }}" }
```

---

## Priority Build Order

| # | Workflow | Build First |
|---|---|---|
| 1 | ✅ AI Legal Chat | Start here — most visible |
| 2 | ✅ Smart Handoff | Needed for lawyer matching |
| 3 | 🟡 Contract Scanner | Needs PDF download setup |
| 4 | 🟡 Notification Dispatcher | Create `notifications` table first |
| 5 | 🟢 Compliance Checker | For Gov/NGO dashboards |
| 6 | 🟢 Template Generator | Needs PDF generation node |
| 7 | 🟢 Report Generator | Phase 10+ |

---

## Supabase Connection in n8n

1. **Add Supabase credentials** in n8n:
   - Go to Credentials → New → Supabase API
   - **Host:** Your Supabase project URL
   - **Service Role Key:** From Supabase → Settings → API → `service_role` key
2. Use these credentials in all Supabase nodes

## Gemini Connection in n8n

1. **Add Google Gemini credentials** in n8n:
   - Go to Credentials → New → Google Gemini API
   - **API Key:** Your Gemini API key
2. Use `gemini-2.0-flash` model for speed, `gemini-1.5-pro` for quality
