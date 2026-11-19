import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

export const incidents = Object.freeze([
  {
    id: 'INC-101',
    title: 'Checkout billing edits fail after release',
    severity: 'high',
    status: 'investigating',
    ticket: 'Support reports payment method updates failing for some accounts.',
    signals: ['Synthetic 403 errors increased after deployment', 'Synthetic error rate: 8.4% on billing updates'],
    changes: ['Example deployment: checkout-service v2.8.0', 'Example diff: permission check moved ahead of token refresh'],
    hypothesis: 'The change may reject a valid session before refresh completes.',
    nextSteps: ['Reproduce using an expired session', 'Inspect authorization and refresh ordering', 'Propose a fix in a reviewable PR', 'Run regression tests and require release approval']
  },
  {
    id: 'INC-102',
    title: 'Intermittent order timeout',
    severity: 'medium',
    status: 'investigating',
    ticket: 'Customers occasionally experience a stalled order confirmation.',
    signals: ['Synthetic p95 latency: 4.2s', 'Synthetic DB connection pool usage spikes'],
    changes: ['Example deployment: order-api v1.4.2', 'Example diff: new synchronous inventory lookup'],
    hypothesis: 'Inventory calls may contend for connections during bursts.',
    nextSteps: ['Correlate traces with DB pool saturation', 'Test concurrency with realistic fixtures', 'Consider timeouts and bounded retries', 'Review results with SRE before rollout']
  }
]);

const HTML = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PlayerZeroDemo — Incident workflow</title>
<style>
:root{font-family:system-ui,-apple-system,sans-serif;color:#e9edf8;background:#101624}
*{box-sizing:border-box}body{margin:0}main{max-width:1100px;margin:auto;padding:36px 20px}
small,.muted{color:#aab4c8}.eyebrow{color:#88c5ff;text-transform:uppercase;letter-spacing:.13em;font-weight:700}
h1{font-size:clamp(2rem,5vw,3.3rem);margin:12px 0}p{line-height:1.6}
.grid{display:grid;grid-template-columns:minmax(230px,330px) 1fr;gap:20px;margin-top:28px}
.panel{border:1px solid #344157;background:#1b2537;border-radius:15px;padding:22px}
button{display:block;text-align:left;width:100%;padding:15px;margin:10px 0;border:1px solid #465873;border-radius:10px;background:#243249;color:inherit;cursor:pointer;font:inherit}
button:hover,button[aria-pressed=true]{border-color:#89caff;background:#293e5b}
h2{margin-top:0}h3{color:#9bcfff;margin:18px 0 6px;font-size:.97rem}li{margin:7px 0;line-height:1.5}
.tag{font-size:.76rem;border:1px solid #6b7e9b;border-radius:99px;padding:3px 9px;margin-left:6px}
footer{margin-top:30px;color:#aab4c8;font-size:.9rem}
@media(max-width:720px){.grid{grid-template-columns:1fr}}
</style></head>
<body><main><div class="eyebrow">Production engineering · synthetic demonstration</div>
<h1>From support ticket to an investigation hypothesis</h1>
<p class="muted">Explore how ticket, telemetry, code, and deployment context could be correlated in a PlayerZero-style workflow. This demo is local mock data; no live PlayerZero analysis occurs.</p>
<section class="grid"><div class="panel"><h2>Sample incidents</h2><div id="incidents">Loading…</div></div>
<div class="panel" id="detail" aria-live="polite"><h2>Select an incident</h2></div></section>
<footer>Mock mode · Human review required for fixes and deployment · <a style="color:#9bcfff" href="https://playerzero.ai/" rel="noopener noreferrer">PlayerZero official site</a></footer>
</main><script>
const list = document.querySelector('#incidents');
const detail = document.querySelector('#detail');
function el(tag, text, parent) { const node = document.createElement(tag); node.textContent = text; parent.append(node); return node; }
function section(name, values) { el('h3', name, detail); if(Array.isArray(values)){const ul=document.createElement('ul'); detail.append(ul);values.forEach(v=>el('li',v,ul));}else{el('p',values,detail);} }
async function show(id) {
  try {
    const response=await fetch('/api/incidents/'+encodeURIComponent(id));
    if(!response.ok)throw new Error('Incident unavailable');
    const item=await response.json();
    detail.replaceChildren();
    el('h2',item.title,detail);
    section('Ticket',item.ticket);
    section('Signals (synthetic)',item.signals);
    section('Code / deployment context (synthetic)',item.changes);
    section('Unverified hypothesis',item.hypothesis);
    section('Proposed next steps',item.nextSteps);
    document.querySelectorAll('button[data-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.id===id)));
  } catch { detail.textContent='Unable to load incident.'; }
}
fetch('/api/incidents').then(r=>{if(!r.ok)throw Error();return r.json()}).then(items=>{
  list.replaceChildren();
  items.forEach(item=>{const b=el('button',item.id+' · '+item.title,list);b.dataset.id=item.id;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>show(item.id));});
  if(items.length)show(items[0].id);
}).catch(()=>{list.textContent='Unable to load sample incidents.';});
</script></body></html>`;

export function handler(req, res) {
  const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
  const send = (status, body, type = 'application/json; charset=utf-8') => {
    res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'" });
    res.end(type.startsWith('application/json') ? JSON.stringify(body) : body);
  };
  if (req.method !== 'GET') return send(405, { error: 'Method not allowed' });
  if (pathname === '/') return send(200, HTML, 'text/html; charset=utf-8');
  if (pathname === '/api/health') return send(200, { ok: true, mode: 'mock' });
  if (pathname === '/api/incidents') return send(200, incidents.map(({ id, title, severity, status }) => ({ id, title, severity, status })));
  if (pathname.startsWith('/api/incidents/')) {
    const incident = incidents.find(item => '/api/incidents/' + item.id === pathname);
    return incident ? send(200, incident) : send(404, { error: 'Incident not found' });
  }
  return send(404, { error: 'Not found' });
}

export function startServer(port = 3000) {
  return createServer(handler).listen(port);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    console.error('PORT must be an integer from 0 to 65535');
    process.exitCode = 1;
  } else {
    startServer(port).on('listening', () => console.log(`PlayerZeroDemo (mock) listening on http://localhost:${port}`));
  }
}
