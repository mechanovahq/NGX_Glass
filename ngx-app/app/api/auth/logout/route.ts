import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase/admin';
import { logAudit, getIP } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  const ip = getIP(req.headers);
  const ua = req.headers.get('user-agent') ?? undefined;

  // Extract bearer token from Authorization header
  const auth  = req.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;

  if (!token) {
    return NextResponse.json({ error: 'Missing authorization token.' }, { status: 401 });
  }

  const admin = getAdminClient();

  // Validate token and get user identity
  const { data: { user }, error } = await admin.auth.getUser(token);

  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired token.' }, { status: 401 });
  }

  // Revoke all sessions for this user (global sign-out)
  await admin.auth.admin.signOut(user.id, 'global');

  await logAudit({
    event_type: 'logout', status: 'success',
    user_id: user.id, ip_address: ip, user_agent: ua,
  });

  return NextResponse.json({ message: 'Signed out successfully.' });
}
