import { NextRequest, NextResponse } from 'next/server';

const GROQ_API    = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL  = 'llama-3.3-70b-versatile';
const CLAUDE_API  = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM = `You are NGXGlass AI — a senior equity analyst specializing in the Nigerian Exchange (NGX) with deep expertise in West African capital markets.

Your analytical frameworks:
• Stock screening: P/E vs sector averages, dividend yield sustainability, revenue trends, debt-to-equity health
• Valuation: DCF assumptions, fair value ranges, bull/bear price targets, entry zones
• Risk analysis: sector concentration, interest rate sensitivity, liquidity risk, position sizing
• Portfolio construction: allocation percentages, diversification, rebalancing triggers
• Technical signals: trend direction, support/resistance, momentum interpretation
• Earnings analysis: beat/miss history, consensus estimates, key metrics to watch
• Sector intelligence: competitive moats, regulatory risks, macro tailwinds/headwinds

Output rules:
- Be concise but substantive — 150-250 words per reply
- Use ₦ for Naira. Always reference NGX tickers in CAPS (ZENITHBANK, DANGCEM, GTCO etc.)
- Structure with bullet points or short numbered lists where appropriate
- Provide specific NGX stock symbols when screening or recommending — never be vague
- For every analysis add a brief risk caveat and "DYOR — not financial advice"
- If live market context is provided, use it to ground your answer in current data`;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  const groqKey      = process.env.GROQ_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (!groqKey && !anthropicKey) {
    return NextResponse.json(
      { error: 'AI not configured. Add GROQ_API_KEY (free) or ANTHROPIC_API_KEY to environment.' },
      { status: 503, headers: cors }
    );
  }

  try {
    const body = await request.json();
    const { message, context = '', history = [] } = body as {
      message: string;
      context?: string;
      history?: { role: string; content: string }[];
    };

    if (!message || typeof message !== 'string' || message.length > 1200) {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400, headers: cors });
    }

    const systemPrompt = context
      ? `${SYSTEM}\n\nLive NGX market snapshot (use this data in your answer):\n${context}`
      : SYSTEM;

    const trimmedHistory = history.slice(-8);
    let reply: string;

    if (groqKey) {
      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: GROQ_MODEL,
          max_tokens: 700,
          temperature: 0.4,
          messages: [
            { role: 'system', content: systemPrompt },
            ...trimmedHistory,
            { role: 'user', content: message },
          ],
        }),
      });
      if (!res.ok) throw new Error(`Groq ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      reply = data.choices?.[0]?.message?.content ?? '(no response)';

    } else {
      const res = await fetch(CLAUDE_API, {
        method: 'POST',
        headers: {
          'x-api-key': anthropicKey!,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: CLAUDE_MODEL,
          max_tokens: 700,
          system: systemPrompt,
          messages: [...trimmedHistory, { role: 'user', content: message }],
        }),
      });
      if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      reply = data.content?.[0]?.text ?? '(no response)';
    }

    return NextResponse.json({ reply }, { headers: cors });

  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500, headers: cors }
    );
  }
}
