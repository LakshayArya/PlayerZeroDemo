import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { handler } from '../src/server.mjs';

async function withServer(run) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    await run('http://127.0.0.1:' + server.address().port);
  } finally {
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
}

test('health explicitly reports mock mode', async () => {
  await withServer(async base => {
    const response = await fetch(base + '/api/health');
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, mode: 'mock' });
  });
});

test('lists incidents and retrieves synthetic evidence', async () => {
  await withServer(async base => {
    const list = await (await fetch(base + '/api/incidents')).json();
    assert.ok(list.length > 0);
    const response = await fetch(base + '/api/incidents/' + list[0].id);
    assert.equal(response.status, 200);
    const incident = await response.json();
    assert.ok(incident.hypothesis);
    assert.ok(incident.nextSteps.length);
    assert.ok(incident.signals.length);
  });
});

test('unknown incident and non-GET methods are rejected', async () => {
  await withServer(async base => {
    assert.equal((await fetch(base + '/api/incidents/UNKNOWN')).status, 404);
    assert.equal((await fetch(base + '/api/incidents', { method: 'POST' })).status, 405);
  });
});

test('serves local demo page', async () => {
  await withServer(async base => {
    const response = await fetch(base);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /synthetic demonstration/);
  });
});
