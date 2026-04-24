import { getAdminClient } from '@/lib/supabase/admin';

export type AuditEvent =
  | 'signup'
  | 'login'
  | 'login_failed'
  | 'logout'
  | 'account_locked'
  | 'password_reset_request'
  | 'password_reset_complete'
  | 'email_verified'
  | 'token_refresh';

interface AuditPayload {
  event_type: AuditEvent;
  status: 'success' | 'failure';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, unknown>;
}

/** Fire-and-forget — audit failures must never crash the request. */
export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    const admin = getAdminClient();
    await admin.from('audit_logs').insert(payload);
  } catch {
    console.error('[audit] failed to log:', payload.event_type);
  }
}

/** Extract a safe IP from Next.js request headers */
export function getIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}
