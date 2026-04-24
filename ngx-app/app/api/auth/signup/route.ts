import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { validatePassword, validateEmail, validateName, sanitize } from '@/lib/auth/validation';
import { rateLimit } from '@/lib/auth/rateLimit';
import { logAudit, getIP } from '@/lib/auth/audit';

export async function POST(req: NextRequest) {
  const ip = getIP(req.headers);
  const ua = req.headers.get('user-agent') ?? undefined;

  // Rate limit: 5 registrations per IP per hour
  const rl = rateLimit(`signup:${ip}`, 5, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Too many sign-up attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name     = sanitize(body.name     ?? '');
  const email    = sanitize(body.email    ?? '').toLowerCase();
  const password = body.password ?? '';

  // Input validation
  if (!validateName(name)) {
    return NextResponse.json({ error: 'Name must be 2–100 characters.' }, { status: 400 });
  }
  if (!validateEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
  }
  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    return NextResponse.json(
      { error: `Password requires: ${pwCheck.errors.join(', ')}.` },
      { status: 400 }
    );
  }

  // Use a non-persistent client — Supabase handles bcrypt internally (GoTrue)
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name },
      emailRedirectTo: `${process.env.SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    await logAudit({ event_type: 'signup', status: 'failure', ip_address: ip, user_agent: ua,
      metadata: { reason: error.message } });

    // Don't confirm whether the email is taken — generic message always
    return NextResponse.json(
      { message: 'If this email is available, you will receive a verification link.' },
      { status: 200 }
    );
  }

  await logAudit({
    event_type: 'signup', status: 'success',
    user_id: data.user?.id, ip_address: ip, user_agent: ua,
  });

  return NextResponse.json(
    { message: 'Account created. Check your email to verify your address before signing in.' },
    { status: 201 }
  );
}
