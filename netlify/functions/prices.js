// NGXGlass — Live NGX price proxy (fallback Lambda function)
// Primary handler is the Edge Function. This serves as Lambda fallback.
// Endpoint: /api/prices

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

// afx uses minimized HTML — no closing </tr> or </td> tags.
// Parse by splitting on <tr> and <td> rather than regex with closing tags.
function parseNGXHtml(html) {
  const results = [];
  const tagRe = /<[^>]+>/g;

  // Find the stock listing table (contains the "Ticker" column header)
  const tableStart = html.indexOf('<th>Ticker');
  if (tableStart === -1) return results;

  // Split on <tr> to get individual rows; skip the header row (index 0)
  const rows = html.slice(tableStart).split('<tr>').slice(1);

  for (const row of rows) {
    // Split on <td> to get cells
    const cellChunks = row.split('<td>').slice(1);
    const cells = cellChunks.map(c => c.replace(tagRe, '').trim());

    if (cells.length < 4) continue;

    const sym = cells[0].toUpperCase().replace(/[^A-Z0-9]/g, '');
    const price = parseFloat(cells[3].replace(/,/g, ''));
    const change = parseFloat((cells[4] || '0').replace(/,/g, '')) || 0;

    if (sym.length >= 2 && !isNaN(price) && price > 0) {
      const prevPrice = price - change;
      const changePct = prevPrice > 0 ? (change / prevPrice) * 100 : 0;
      results.push({ sym, price, change, changePct });
    }
  }
  return results;
}

const AFX_URLS = [1, 2].map(p =>
  p === 1 ? 'https://afx.kwayisi.org/ngx/' : `https://afx.kwayisi.org/ngx/?page=${p}`
);

// Try direct first, fall back to allorigins.win proxy
async function fetchHtml(url) {
  const direct = await fetch(url, {
    headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*' },
  }).catch(() => null);
  if (direct && direct.ok) return direct.text();

  const proxy = await fetch(
    `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    { headers: { 'User-Agent': UA } }
  );
  if (!proxy.ok) throw new Error(`proxy returned ${proxy.status} for ${url}`);
  return proxy.text();
}

export default async () => {
  try {
    const [page1, page2] = await Promise.all(AFX_URLS.map(fetchHtml));
    const all = [...parseNGXHtml(page1), ...parseNGXHtml(page2)];

    // Deduplicate — keep first occurrence
    const seen = new Set();
    const result = all.filter(r => {
      if (seen.has(r.sym)) return false;
      seen.add(r.sym);
      return true;
    });

    if (!result.length) throw new Error('Parsed 0 stocks — HTML structure may have changed');

    return new Response(JSON.stringify({ result }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/prices' };
