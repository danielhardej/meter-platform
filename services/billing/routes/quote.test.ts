import { describe, expect, it } from 'vitest';
import { buildApp } from '../../readings/app.js';

describe('POST /quotes', () => {
  it('quotes the peak tariff in Australian dollars', async () => {
    const app = buildApp();
    const payload = { kWh: 10, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toEqual({ currency: 'AUD', amount: 3.2 });
  });

  it('rejects negative usage with problem details', async () => {
    const app = buildApp();
    const payload = { kWh: -1, readAt: '2026-11-02T10:00:00Z' };

    const response = await app.inject({ method: 'POST', url: '/quotes', payload });

    expect(response.json()).toMatchObject({ status: 400 });
  });
});