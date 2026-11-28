import { HealthResponse, DiscrepancyCase, CitationDetailResponse, ApprovalResponse } from '../types';

declare const process: any;

const rawBase = (
  typeof (import.meta as any)?.env?.VITE_API_BASE_URL === 'string'
    ? (import.meta as any).env.VITE_API_BASE_URL
    : (typeof process !== 'undefined' && (process?.env?.BACKEND_URL || process?.env?.PRAMAN_API_URL)
        ? String(process.env.BACKEND_URL || process.env.PRAMAN_API_URL)
        : '')
).replace(/\/$/, '');

export const API_BASE: string = rawBase.endsWith('/api') ? rawBase.slice(0, -4) : rawBase;

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCases(): Promise<DiscrepancyCase[]> {
  const res = await fetch(`${API_BASE}/api/cases`);
  if (!res.ok) throw new Error(`Fetch cases failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCase(caseId: string): Promise<DiscrepancyCase> {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}`);
  if (!res.ok) throw new Error(`Fetch case ${caseId} failed: ${res.statusText}`);
  return res.json();
}

export async function resetCases(): Promise<{ status: string; message: string }> {
  const res = await fetch(`${API_BASE}/api/cases/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Reset cases failed: ${res.statusText}`);
  return res.json();
}

export async function triggerCase(scenarioId: string): Promise<{ case: DiscrepancyCase; stream_url: string }> {
  const res = await fetch(`${API_BASE}/api/cases/trigger/${scenarioId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Trigger scenario ${scenarioId} failed: ${res.statusText}`);
  return res.json();
}

export async function triggerCustomCase(query: string, rawNarration?: string): Promise<{ case: DiscrepancyCase; stream_url: string }> {
  const res = await fetch(`${API_BASE}/api/cases/custom`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, raw_narration: rawNarration }),
  });
  if (!res.ok) throw new Error(`Trigger custom case failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCitation(caseId: string, citationKey: string): Promise<CitationDetailResponse> {
  // Encode # as %23 if present in key
  const safeKey = citationKey.replace('#', '%23');
  const res = await fetch(`${API_BASE}/api/citations/${caseId}/${safeKey}`);
  if (!res.ok) throw new Error(`Fetch citation ${citationKey} failed: ${res.statusText}`);
  return res.json();
}

export async function approveCase(caseId: string, actions?: any[]): Promise<ApprovalResponse> {
  const res = await fetch(`${API_BASE}/api/cases/${caseId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actions_to_execute: actions }),
  });
  if (!res.ok) throw new Error(`Approve case ${caseId} failed: ${res.statusText}`);
  return res.json();
}

export function subscribeToCaseStream(
  caseId: string,
  onEvent: (eventType: string, data: any) => void,
  onError?: (err: any) => void,
  onComplete?: () => void
): () => void {
  const eventSource = new EventSource(`${API_BASE}/api/cases/${caseId}/stream`);

  const eventTypes = [
    'trigger_received',
    'agent_thought',
    'ai_extract_intake',
    'ai_intake_extracted',
    'sql_attempt',
    'ifsc_verified',
    'pincode_verified',
    'breach_checked',
    'fx_retrieved',
    'finding_recorded',
    'runway_calculated',
    'ai_synthesize_memo',
    'ai_memo_synthesized',
    'brief_completed'
  ];

  eventTypes.forEach(evt => {
    eventSource.addEventListener(evt, (e: MessageEvent) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(evt, parsed);
        if (evt === 'brief_completed') {
          if (onComplete) {
            onComplete();
          }
          eventSource.close();
        }
      } catch (err) {
        console.error(`Failed to parse SSE ${evt}:`, err);
      }
    });
  });

  eventSource.onerror = (err) => {
    if (eventSource.readyState === EventSource.CLOSED) {
      return;
    }
    eventSource.close();
    if (onError) onError(err);
  };

  return () => {
    eventSource.close();
  };
}
