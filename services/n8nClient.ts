/// <reference types="vite/client" />

/**
 * n8n Webhook Client
 * Centralized service for calling n8n backend workflows.
 * Each endpoint corresponds to a webhook in the n8n instance.
 */

const BASE_URL = (import.meta.env.VITE_N8N_BASE_URL as string) || '';

interface N8nResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

async function callWebhook<T = unknown>(
    webhookPath: string,
    body: Record<string, unknown>
): Promise<N8nResponse<T>> {
    const url = `${BASE_URL}${webhookPath}`;

    if (!BASE_URL) {
        console.warn('[n8nClient] VITE_N8N_BASE_URL not configured');
        return { success: false, error: 'n8n webhook URL not configured' };
    }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { success: false, error: `n8n error (${res.status}): ${errorText}` };
        }

        const data = await res.json();
        return { success: true, data: data as T };
    } catch (err) {
        console.error('[n8nClient] Request failed:', err);
        return { success: false, error: err instanceof Error ? err.message : 'Network error' };
    }
}

// ─── Exported API ───────────────────────────────────────────────────

/** AI Legal Chat — role-aware conversation */
export const chatAssistant = (
    prompt: string,
    role: string,
    country: string,
    language: string,
    history: { role: string; content: string }[]
) => callWebhook<{ response: string; suggestHandoff?: boolean; suggestedCategory?: string }>(
    import.meta.env.VITE_N8N_WEBHOOK_CHAT || '/chat',
    { prompt, role, country, language, history }
);

/** Smart Contract Scanner — upload PDF for AI analysis */
export const scanContract = (
    fileUrl: string,
    scanType: 'full' | 'quick' | 'red_flags_only',
    context: { industry?: string; country: string }
) => callWebhook<{
    redFlags: { clause: string; risk: string; explanation: string }[];
    compliantClauses: { clause: string; note: string }[];
    summary: string;
}>(
    import.meta.env.VITE_N8N_WEBHOOK_SCAN_CONTRACT || '/scan-contract',
    { fileUrl, scanType, context }
);

/** Smart Handoff — match case to best providers */
export const smartHandoff = (
    caseDescription: string,
    category: string,
    countryId: string
) => callWebhook<{
    providers: { id: string; full_name: string; specialty: string; visibility_score: number; avatar_url: string }[];
}>(
    import.meta.env.VITE_N8N_WEBHOOK_SMART_HANDOFF || '/smart-handoff',
    { caseDescription, category, countryId }
);

/** Legal Template Generator — create documents from templates */
export const generateTemplate = (
    templateType: string,
    data: Record<string, unknown>,
    country: string,
    language: string
) => callWebhook<{ fileUrl: string; previewHtml: string }>(
    import.meta.env.VITE_N8N_WEBHOOK_GENERATE_TEMPLATE || '/generate-template',
    { templateType, data, country, language }
);

/** Compliance Checker — validate documents against regulations */
export const complianceCheck = (
    documentText: string,
    checkType: 'charity_compliance' | 'government_decision' | 'corporate_bylaws',
    country: string
) => callWebhook<{
    overall: string;
    checks: { regulation: string; status: string; note: string }[];
}>(
    import.meta.env.VITE_N8N_WEBHOOK_COMPLIANCE_CHECK || '/compliance-check',
    { documentText, checkType, country }
);

/** Notification Dispatcher — trigger notifications via n8n */
export const sendNotification = (
    userId: string,
    type: string,
    data: Record<string, unknown>
) => callWebhook<{ success: boolean }>(
    import.meta.env.VITE_N8N_WEBHOOK_NOTIFY || '/notify',
    { userId, type, data }
);

/** Auto Report Generator — generate AI summary reports */
export const generateReport = (
    reportType: string,
    userId: string,
    dateRange: { from: string; to: string }
) => callWebhook<{ fileUrl: string; summary: string }>(
    import.meta.env.VITE_N8N_WEBHOOK_GENERATE_REPORT || '/generate-report',
    { reportType, userId, dateRange }
);
