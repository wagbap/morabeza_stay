import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dataLocalDeISO, dataLocalParaISO } from '../src/components/Calendario/dataLocal.js';

test('date-only API values survive local calendar conversion across timezones', () => {
  const previous = process.env.TZ;
  try {
    for (const tz of ['Atlantic/Cape_Verde', 'Europe/Lisbon', 'Pacific/Kiritimati', 'America/Los_Angeles']) {
      process.env.TZ = tz;
      for (const value of ['2026-10-28', '2026-03-29', '2026-10-25', '2028-02-29']) {
        assert.equal(dataLocalParaISO(dataLocalDeISO(value)), value, `${tz}: ${value}`);
      }
    }
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});
test('empty fields and invalid dates never become an unintended booking day', () => {
  for (const value of ['', undefined, null, '2026-02-30', '2026-13-01', '28/10/2026', '2026-01-00']) {
    assert.equal(dataLocalDeISO(value), null);
  }
  assert.equal(dataLocalParaISO(null), '');
  assert.equal(dataLocalParaISO(new Date('invalid')), '');
});
test('historical dates remain selectable for filters and reviews', () => {
  assert.equal(dataLocalParaISO(dataLocalDeISO('2020-01-01')), '2020-01-01');
});
