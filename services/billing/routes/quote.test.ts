import { describe, expect, it } from 'vitest';
import { buildApp } from '../../readings/app.js';
import type { QuoteBreakdown } from '../../../packages/domain/src/index.js';

describe('POST /quotes', () => {
  const peakReadAt = '2026-11-02T10:00:00Z';
  // 250 kWh at the 32c peak rate is a usage charge of exactly $80.00
  const usageKwh = 250;

  it('AC-1 shows the feed-in credit as its own line', async () => {
    const app = buildApp();
    const payload = { kWh: usageKwh, exportKwh: 120, readAt: peakReadAt };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    const quote = response.json<QuoteBreakdown>();
    expect(quote.feedInCredit.toFixed(2)).toBe('6.00');
    expect(quote.amount.toFixed(2)).toBe('80.00');
    expect(quote.netAmount.toFixed(2)).toBe('74.00');
  });

  it('AC-2 matches the existing quote when exportKwh is omitted', async () => {
    const app = buildApp();
    const payload = { kWh: 10, readAt: peakReadAt };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toEqual({ currency: 'AUD', amount: 3.2, feedInCredit: 0, netAmount: 3.2 });
  });

  it('AC-5 caps the feed-in credit at the usage charge', async () => {
    const app = buildApp();
    const payload = { kWh: usageKwh, exportKwh: 2000, readAt: peakReadAt };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    const quote = response.json<QuoteBreakdown>();
    expect(quote.feedInCredit.toFixed(2)).toBe('80.00');
    expect(quote.netAmount.toFixed(2)).toBe('0.00');
  });

  it('rejects negative usage with problem details', async () => {
    const app = buildApp();
    const payload = { kWh: -1, readAt: peakReadAt };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toMatchObject({ status: 400 });
  });

  it('rejects negative export energy with problem details', async () => {
    const app = buildApp();
    const payload = { kWh: 1, exportKwh: -1, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toMatchObject({
      title: 'Request rejected',
      status: 400,
      detail: 'Expected non-negative usage and export energy with an ISO timestamp',
    });
  });
});