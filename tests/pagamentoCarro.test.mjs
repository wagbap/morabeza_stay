import test from 'node:test';
import assert from 'node:assert/strict';
import { prazoPagamentoCarro, segundosPagamentoCarro, pagamentoCarroEmCurso } from '../src/features/carros/utils/pagamentoCarro.js';

test('refresh uses remaining server time, including a different browser clock', () => {
  const first = prazoPagamentoCarro({ clientSecret: 'fixture', expiresAt: '2026-11-07T12:05:00Z', serverNow: '2026-11-07T12:00:00Z' }, 0);
  assert.equal(segundosPagamentoCarro(first.prazoLocal, 0), 300);
  const refresh = prazoPagamentoCarro({ clientSecret: 'fixture', expiresAt: '2026-11-07T12:05:00Z', serverNow: '2026-11-07T12:03:00Z' }, 900000);
  assert.equal(segundosPagamentoCarro(refresh.prazoLocal, 900000), 120);
  assert.equal(segundosPagamentoCarro(refresh.prazoLocal, 1020000), 0);
  assert.throws(() => prazoPagamentoCarro({ clientSecret: 'fixture' }));
});

test('processing, authentication and approved payments stay protected', () => {
  for (const status of ['processing', 'requires_action', 'requires_capture', 'succeeded']) assert.equal(pagamentoCarroEmCurso(status), true);
  for (const status of ['requires_payment_method', 'canceled']) assert.equal(pagamentoCarroEmCurso(status), false);
});
