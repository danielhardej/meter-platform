import { describe, expect, it } from 'vitest';
import { buildApp } from '../../readings/app.js';

describe('POST /quotes', () => {
  it('quotes the usage charge and feed-in credit in Australian dollars', async () => {
    const app = buildApp();
    const payload = { kWh: 10, exportedKWh: 5, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toEqual({ currency: 'AUD', amount: 3.2, feedInCredit: 0.4, netAmount: 2.8 });
  });

  it('defaults exported energy to zero for existing callers', async () => {
    const app = buildApp();
    const payload = { kWh: 10, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toEqual({ currency: 'AUD', amount: 3.2, feedInCredit: 0, netAmount: 3.2 });
  });

  it('returns a negative net amount when the credit exceeds the charge', async () => {
    const app = buildApp();
    const payload = { kWh: 1, exportedKWh: 10, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toEqual({ currency: 'AUD', amount: 0.32, feedInCredit: 0.8, netAmount: -0.48 });
  });

  it('rejects negative usage with problem details', async () => {
    const app = buildApp();
    const payload = { kWh: -1, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toMatchObject({ status: 400 });
  });

  it('rejects negative exported energy with problem details', async () => {
    const app = buildApp();
    const payload = { kWh: 1, exportedKWh: -1, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toMatchObject({
      title: 'Request rejected',
      status: 400,
      detail: 'Expected non-negative usage and exported energy with an ISO timestamp',
    });
  });
});