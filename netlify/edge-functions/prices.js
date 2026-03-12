// NGXGlass — Live NGX price proxy
// Serves data/prices.json committed by the GitHub Actions fetch-prices workflow.
// Runs as a Netlify Edge Function (low latency, CORS-safe proxy to GitHub raw).

const PRICES_URL =
  'https://raw.githubusercontent.com/mechanovahq/NGX_Glass/main/data/prices.json';

export default async () => {
  try {
    const res = await fetch(PRICES_URL, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`GitHub raw returned ${res.status}`);
    const data = await res.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        // Cache for 60s — GitHub raw has a 5-min CDN cache itself
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
