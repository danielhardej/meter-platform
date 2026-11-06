import { describe, expect, it } from 'vitest';
import { validateReading } from './index.js';
import type { Reading } from './index.js';

const now = new Date('2026-11-02T12:00:00Z');
const reading: Reading = { nmi: 'TEST000001', kWh: 2.5, readAt: '2026-11-02T10:00:00Z', quality: 'A' };

describe('validateReading', () => {
  it('accepts a synthetic reading', () => {
    const input = { ...reading };

    const result = validateReading(input, now);

    expect(result).toEqual({ valid: true });
  });

  it.each(['TEST00001', 'FAKE000001', 'TEST0000001'])('rejects an invalid NMI format: %s', (nmi) => {
    const input = { ...reading, nmi };

    const result = validateReading(input, now);

    expect(result.valid).toBe(false);
  });

  it.each([-1, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid usage: %s', (kWh) => {
    const input = { ...reading, kWh };

    const result = validateReading(input, now);

    expect(result.valid).toBe(false);
  });

  it('accepts zero usage', () => {
    const input = { ...reading, kWh: 0 };

    const result = validateReading(input, now);

    expect(result.valid).toBe(true);
  });

  it('rejects a future timestamp', () => {
    const input = { ...reading, readAt: '2026-11-03T00:00:00Z' };

    const result = validateReading(input, now);

    expect(result.valid).toBe(false);
  });

  it('rejects an invalid timestamp', () => {
    const input = { ...reading, readAt: 'not-a-date' };

    const result = validateReading(input, now);

    expect(result.valid).toBe(false);
  });

  it.each(['A', 'E', 'S'])('accepts quality flag %s', (quality) => {
    const input = { ...reading, quality };

    const result = validateReading(input, now);

    expect(result.valid).toBe(true);
  });

  it('rejects an unknown quality flag', () => {
    const input = { ...reading, quality: 'X' };

    const result = validateReading(input, now);

    expect(result.valid).toBe(false);
  });
});