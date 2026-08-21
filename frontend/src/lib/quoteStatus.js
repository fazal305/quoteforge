// Valid quote status transitions, mirroring the state machine enforced
// server-side in supabase/migrations/0003_quote_save_rpc.sql
// (transition_quote_status). This client-side copy exists only so the UI
// can disable actions that the backend would reject anyway — the backend
// is the actual source of truth, not this map.
export const QUOTE_TRANSITIONS = {
  DRAFT: ['SENT'],
  SENT: ['VIEWED', 'APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED'],
  VIEWED: ['APPROVED', 'REJECTED', 'CHANGE_REQUESTED', 'EXPIRED'],
  CHANGE_REQUESTED: ['SENT'],
  APPROVED: ['CONVERTED'],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
}
