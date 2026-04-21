import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const PRICES_URL =
  'https://raw.githubusercontent.com/mechanovahq/NGX_Glass/main/data/prices.json';

export async function GET() {
  // Try upstream GitHub URL first
  try {
    const res = await fetch(PRICES_URL, {
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data, {
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }
  } catch {
    // fall through to local fallback
  }

  // Fallback: read bundled data/prices.json
  try {
    const localPath = path.join(process.cwd(), 'data', 'prices.json');
    const raw = await readFile(localPath, 'utf-8');
    const data = JSON.parse(raw);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'No price data available' },
      { status: 503 }
    );
  }
}
