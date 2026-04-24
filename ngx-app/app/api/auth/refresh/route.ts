import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAudit, getIP } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  const ip = getIP(req.headers);
  const ua = req.headers.get('user-agent') ?? undefined;

  let body: { refresh_token?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const refreshToken = body.refresh_token;
  if (!refreshToken) {
    return NextResponse.json({ error: 'refresh_token is required.' }, { status: 400 });
  }

  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await sb.auth.refreshSession({ refresh_token: refreshToken });

  if (error || !data.session) {
    return NextResponse.json({ error: 'Session expired. Please sign in again.' }, { status: 401 });
  }

  await logAudit({
    event_type: 'token_refresh', status: 'success',
    user_id: data.user?.id, ip_address: ip, user_agent: ua,
  });

  return NextResponse.json({
    session: {
      access_token:  data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in:    data.session.expires_in,
    },
  });
}
