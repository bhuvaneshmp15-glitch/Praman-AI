export interface TableStats {
  [table: string]: number;
}

export interface HealthResponse {
  status: string;
  engine: string;
  total_rows: number;
  table_counts: TableStats;
  registered_udfs: string[];
  semantic_guardrails: string[];
}

export interface ActionPlan {
  action: string;
  invoice_id?: string;
  amount?: number;
  net_amount?: number;
  target?: string;
  reason?: string;
  gstin?: string;
  commitment_id?: string;
  due_date?: string;
  rrn_utr?: string;
  dispute_amount?: number;
  new_status?: string;
}

export interface CitationItem {
  citation_id: string;
  source_table: string;
  row_id: string;
  field?: string;
  value?: any;
  note?: string;
  confidence?: number;
}

export interface BriefVerdict {
  status: string;
  headline: string;
  decision: 'HOLD_DISPUTED_PORTION' | 'NO_DISCREPANCY_FOUND' | 'NOT_FOUND_IN_STATEMENT' | string;
  markdown_brief: string;
  actions: ActionPlan[];
  citations: CitationItem[];
}

export interface DiscrepancyCase {
  case_id: string;
  title: string;
  scenario_id: string;
  vendor_or_customer: string;
  amount_at_risk: number;
  amount_formatted?: string;
  status: 'TRIGGERED' | 'INVESTIGATING' | 'BRIEF_READY' | 'APPROVED' | 'DISMISSED';
  timestamp: string;
  invoice_or_ref_id?: string;
  brief?: BriefVerdict;
  actions?: ActionPlan[];
  citations?: CitationItem[];
  scenario_metadata?: Record<string, any>;
}

export interface CitationDetailResponse {
  citation_key: string;
  case_id: string;
  source_table: string;
  row_id: string;
  target_row: Record<string, any>;
  context_rows: Record<string, any>[];
  live_ifsc?: Record<string, any> | null;
}

export interface RunwayImpact {
  current_bank_balance: number;
  upcoming_30d_critical_emi: number;
  disputed_or_payout_amount: number;
  recommended_hold_or_recovery: number;
  cash_after_full_payout: number;
  cash_after_praman_action: number;
  post_emi_free_cash_without_praman: number;
  post_emi_free_cash_with_praman: number;
  emi_coverage_ratio_without_praman: number;
  emi_coverage_ratio_with_praman: number;
  formatted: {
    current_bank_balance: string;
    upcoming_30d_critical_emi: string;
    disputed_or_payout_amount: string;
    recommended_hold_or_recovery: string;
    cash_after_full_payout: string;
    cash_after_praman_action: string;
    post_emi_free_cash_without_praman: string;
    post_emi_free_cash_with_praman: string;
    coverage_without_praman: string;
    coverage_with_praman: string;
  };
}

export interface SqlAttemptEvent {
  phase: 'EXECUTE' | 'RETRY_HEALING' | 'OBSERVATION';
  status?: string;
  raw_sql?: string;
  purpose?: string;
  error?: string;
  healing_strategy?: string;
  attempt?: number;
  elapsed_ms?: number;
  row_count?: number;
  columns?: string[];
}

export interface InvestigationFeedEvent {
  id: string;
  type:
    | 'thought'
    | 'ai_extract_intake'
    | 'ai_intake_extracted'
    | 'ai_synthesize_memo'
    | 'ai_memo_synthesized'
    | 'sql_attempt'
    | 'sql_retry'
    | 'ifsc_verified'
    | 'pincode_verified'
    | 'breach_checked'
    | 'fx_retrieved'
    | 'finding_recorded'
    | 'runway_calculated'
    | 'verdict'
    | 'brief_completed';
  timestamp: string;
  data: any;
}

export interface ApprovalResponse {
  case_id: string;
  status: string;
  executed_at: string;
  idempotency_key: string;
  external_reference_id: string;
  actions_dispatched: ActionPlan[];
  live_ifsc_headers: Record<string, any>;
  rendered_html_notice?: string;
  audit_trail_entry: Record<string, any>;
}
