import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validateEmail, sanitize } from '@/lib/auth/validation';
import { rateLimit } from '@/lib/auth/rateLimit';
import { logAudit, getIP } from '@/lib/auth/audit';
import { getAdminClient } from '@/lib/supabase/admin';

const LOCKOUT_THRESHOLD = 5;     // failed attempts before lockout
const LOCKOUT_MINUTES   = 15;    // lockout duration

export async function POST(req: NextRequest) {
  const ip = getIP(req.headers);
  const ua = req.headers.get('user-agent') ?? undefined;

  // Dual rate limits: per-IP and per-email to thwart distributed brute-force
  const rlIP = rateLimit(`login:ip:${ip}`, 20, 15 * 60_000);
  if (!rlIP.allowed) {
    return NextResponse.json(
      { error: 'Too many requests from this network. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rlIP.resetAt - Date.now()) / 1000)) } }
    );
  }

  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const email    = sanitize(body.email    ?? '').toLowerCase();
  const password = body.password ?? '';

  if (!validateEmail(email) || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  // Per-email rate limit
  const rlEmail = rateLimit(`login:email:${email}`, 10, 15 * 60_000);
  if (!rlEmail.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts for this account. Try again in 15 minutes.' },
      { status: 429 }
    );
  }

  const admin = getAdminClient();

  // Check account lockout before attempting authentication
  const { data: profile } = await admin
    .from('profiles')
    .select('id, locked_until, failed_login_attempts')
    .eq('email', email)
    .maybeSingle();

  if (profile?.locked_until && new Date(profile.locked_until) > new Date()) {
    const minutesLeft = Math.ceil(
      (new Date(profile.locked_until).getTime() - Date.now()) / 60_000
    );
    await logAudit({
      event_type: 'login_failed', status: 'failure',
      user_id: profile.id, ip_address: ip, user_agent: ua,
      metadata: { reason: 'account_locked' },
    });
    return NextResponse.json(
      { error: `Account locked. Try again in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.` },
      { status: 423 }
    );
  }

  // Attempt authentication (Supabase GoTrue handles bcrypt verify)
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await sb.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    // Increment failed attempts and potentially lock
    if (profile) {
      const attempts = (profile.failed_login_attempts ?? 0) + 1;
      const lock     = attempts >= LOCKOUT_THRESHOLD;
      await admin.from('profiles').update({
        failed_login_attempts: attempts,
        ...(lock ? { locked_until: new Date(Date.now() + LOCKOUT_MINUTES * 60_000).toISOString() } : {}),
      }).eq('id', profile.id);

      if (lock) {
        await logAudit({
          event_type: 'account_locked', status: 'failure',
          user_id: profile.id, ip_address: ip, user_agent: ua,
          metadata: { attempts },
        });
        return NextResponse.json(
          { error: `Too many failed attempts. Account locked for ${LOCKOUT_MINUTES} minutes.` },
          { status: 423 }
        );
      }
    }

    await logAudit({
      event_type: 'login_failed', status: 'failure',
      user_id: profile?.id, ip_address: ip, user_agent: ua,
      metadata: { reason: error?.message },
    });

    // Generic message — don't reveal whether the email exists
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  // Success — reset lockout counters and record login metadata
  if (profile) {
    await admin.from('profiles').update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
      last_login_ip: ip === 'unknown' ? null : ip,
    }).eq('id', profile.id);
  }

  await logAudit({
    event_type: 'login', status: 'success',
    user_id: data.user.id, ip_address: ip, user_agent: ua,
  });

  return NextResponse.json({
    session: {
      access_token:  data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in:    data.session.expires_in,
    },
    user: {
      id:        data.user.id,
      email:     data.user.email,
      full_name: data.user.user_metadata?.full_name ?? null,
    },
  });
}
