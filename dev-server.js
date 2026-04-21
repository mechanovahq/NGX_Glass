#!/usr/bin/env node
// NGXGlass local dev server
// Serves ngx-dashboard-v1.html and proxies /api/ngx/ → afx.kwayisi.org
// Usage: node dev-server.js
//        Then open http://localhost:3000

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const url   = require('url');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

function proxyAFX(req, res, afxPath) {
  const target = `https://afx.kwayisi.org${afxPath}`;
  const opts = {
    method: 'GET',
    headers: {
      'User-Agent':      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept':          'text/html,application/xhtml+xml,*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer':         'https://afx.kwayisi.org/',
    },
  };
  https.get(target, opts, upstream => {
    res.writeHead(upstream.statusCode, {
      'Content-Type':                upstream.headers['content-type'] || 'text/html',
      'Access-Control-Allow-Origin': '*',
    });
    upstream.pipe(res);
  }).on('error', err => {
    res.writeHead(502); res.end(`Proxy error: ${err.message}`);
  });
}

const server = http.createServer((req, res) => {
  const parsed  = url.parse(req.url);
  const reqPath = parsed.pathname;

  // Proxy: /api/ngx/* → afx.kwayisi.org/ngx/*
  if (reqPath.startsWith('/api/ngx')) {
    const afxPath = reqPath.replace('/api/ngx', '/ngx') + (parsed.search || '');
    return proxyAFX(req, res, afxPath);
  }

  // Static file serving
  let filePath = reqPath === '/' ? '/ngx-dashboard-v1.html' : reqPath;
  filePath = path.join(ROOT, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback to dashboard for any unknown path (SPA-style)
      fs.readFile(path.join(ROOT, 'ngx-dashboard-v1.html'), (e2, d2) => {
        if (e2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(d2);
      });
      return;
    }
    const ext  = path.extname(filePath);
    const type = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nNGXGlass dev server running at http://localhost:${PORT}\n`);
  console.log('  • Proxies /api/ngx/ → afx.kwayisi.org (live NGX prices)');
  console.log('  • Serves ngx-dashboard-v1.html at /\n');
});
