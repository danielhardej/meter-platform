import { expect, it } from 'vitest';
import { validateReadings } from './index.js';

it('returns a validation result for each reading in order', () => {
  const reading = { nmi: 'TEST000001', kWh: 1, readAt: '2026-11-02T10:00:00Z', quality: 'A' };
  const readings = [reading, { ...reading, kWh: -1 }];

  const results = validateReadings(readings, new Date('2026-11-02T12:00:00Z'));

  expect(results.map((result) => result.valid)).toEqual([true, false]);
});