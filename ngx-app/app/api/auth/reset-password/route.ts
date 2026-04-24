import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabase/admin';
import { validateEmail, validatePassword, sanitize } from '@/lib/auth/validation';
import { rateLimit } from '@/lib/auth/rateLimit';
import { logAudit, getIP } from '@/lib/auth/audit';

/**
 * POST { email }           → sends a password-reset email (Supabase magic link)
 * POST { token, password } → sets a new password after clicking the link
 */
export async function POST(req: NextRequest) {
  const ip = getIP(req.headers);
  const ua = req.headers.get('user-agent') ?? undefined;

  let body: { email?: string; token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // ── Branch A: request a reset email ──────────────────────────────
  if (body.email && !body.token) {
    const email = sanitize(body.email).toLowerCase();

    if (!validateEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // Rate limit: 3 reset requests per email per hour
    const rl = rateLimit(`reset:${email}`, 3, 60 * 60_000);
    if (!rl.allowed) {
      // Still return 200 so we don't reveal rate-limiting to attackers
      return NextResponse.json({ message: 'If that account exists, a reset link has been sent.' });
    }

    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    await sb.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL ?? 'http://localhost:3000'}/auth/reset`,
    });

    // Always return same message — don't leak whether the email exists
    await logAudit({
      event_type: 'password_reset_request', status: 'success',
      ip_address: ip, user_agent: ua,
      metadata: { email },
    });

    return NextResponse.json({ message: 'If that account exists, a reset link has been sent.' });
  }

  // ── Branch B: complete the reset with a new password ─────────────
  if (body.token && body.password) {
    const pwCheck = validatePassword(body.password);
    if (!pwCheck.valid) {
      return NextResponse.json(
        { error: `Password requires: ${pwCheck.errors.join(', ')}.` },
        { status: 400 }
      );
    }

    const admin = getAdminClient();

    // Exchange the token for a session (Supabase OTP-style reset flow)
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: verifyData, error: verifyErr } = await sb.auth.verifyOtp({
      token_hash: body.token,
      type: 'recovery',
    });

    if (verifyErr || !verifyData.user) {
      return NextResponse.json({ error: 'Invalid or expired reset link.' }, { status: 400 });
    }

    const { error: updateErr } = await admin.auth.admin.updateUserById(
      verifyData.user.id,
      { password: body.password }
    );

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update password. Please try again.' }, { status: 500 });
    }

    // Revoke all existing sessions after password change
    await admin.auth.admin.signOut(verifyData.user.id, 'global');

    await logAudit({
      event_type: 'password_reset_complete', status: 'success',
      user_id: verifyData.user.id, ip_address: ip, user_agent: ua,
    });

    return NextResponse.json({ message: 'Password updated. You can now sign in.' });
  }

  return NextResponse.json({ error: 'Provide either email or token + password.' }, { status: 400 });
}
