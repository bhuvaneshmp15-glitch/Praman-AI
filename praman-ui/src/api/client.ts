import { HealthResponse, DiscrepancyCase, CitationDetailResponse, ApprovalResponse } from '../types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCases(): Promise<DiscrepancyCase[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error(`Fetch cases failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCase(caseId: string): Promise<DiscrepancyCase> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error(`Fetch case ${caseId} failed: ${res.statusText}`);
  return res.json();
}

export async function triggerCase(scenarioId: string): Promise<{ case: DiscrepancyCase; stream_url: string }> {
  const res = await fetch(`${API_BASE}/cases/trigger/${scenarioId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Trigger scenario ${scenarioId} failed: ${res.statusText}`);
  return res.json();
}

export async function fetchCitation(caseId: string, citationKey: string): Promise<CitationDetailResponse> {
  // Encode # as %23 if present in key
  const safeKey = citationKey.replace('#', '%23');
  const res = await fetch(`${API_BASE}/citations/${caseId}/${safeKey}`);
  if (!res.ok) throw new Error(`Fetch citation ${citationKey} failed: ${res.statusText}`);
  return res.json();
}

export async function approveCase(caseId: string, actions?: any[]): Promise<ApprovalResponse> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/approve`, {
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
  const eventSource = new EventSource(`${API_BASE}/cases/${caseId}/stream`);

  const eventTypes = [
    'trigger_received',
    'agent_thought',
    'sql_attempt',
    'ifsc_verified',
    'pincode_verified',
    'breach_checked',
    'fx_retrieved',
    'finding_recorded',
    'runway_calculated',
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
