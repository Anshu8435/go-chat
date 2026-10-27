import test from 'node:test';
import assert from 'node:assert/strict';
import net from 'node:net';

import { findAvailablePort } from '../src/config/port.js';

test('findAvailablePort skips occupied ports and picks the next free port', async () => {
  const preferredPort = 45201;
  const server = net.createServer();

  await new Promise((resolve) => server.listen(preferredPort, '127.0.0.1', resolve));

  try {
    const nextPort = await findAvailablePort(preferredPort, 5);
    assert.notEqual(nextPort, preferredPort);
    assert.ok(nextPort >= preferredPort);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
