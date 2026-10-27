import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMongoUri } from '../src/config/db.js';

test('normalizeMongoUri strips duplicated MONGO_URI prefixes', () => {
  const raw = 'MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/GO-chatApp?retryWrites=true&w=majority';
  const normalized = normalizeMongoUri(raw);

  assert.equal(
    normalized,
    'mongodb+srv://user:pass@cluster.mongodb.net/GO-chatApp?retryWrites=true&w=majority'
  );
});

test('normalizeMongoUri returns null for empty values', () => {
  assert.equal(normalizeMongoUri(''), null);
  assert.equal(normalizeMongoUri(null), null);
});
