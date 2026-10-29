import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarApiBaseUrl } from '../src/utils/apiBaseUrl.js';
test('API root works with a host, an API path or trailing slashes', () => {
  for (const base of ['https://welovepalop.com', 'https://welovepalop.com/', 'https://welovepalop.com/api', 'https://welovepalop.com/api/', ' https://welovepalop.com/api/ ', undefined]) {
    assert.equal(normalizarApiBaseUrl(base), 'https://welovepalop.com/api');
  }
});
