import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { ReadingStore } from '../store.js';

const store = new ReadingStore();
const app = buildApp({ store, clock: () => new Date('2026-11-02T12:00:00Z') });
const reading = { nmi: 'TEST000001', kWh: 2.5, readAt: '2026-11-02T10:00:00Z', quality: 'A' };
afterEach(() => { store.metrics.clear(); });

describe('POST /readings', () => {
  it('accepts a valid reading', async () => {
    const payload = { ...reading };

    const response = await app.inject({ method: 'POST', url: '/readings', payload });

    expect(response.statusCode).toBe(201);
  });

  it('stores an accepted reading', async () => {
    const before = store.all().length;

    await app.inject({ method: 'POST', url: '/readings', payload: reading });

    expect(store.all()).toHaveLength(before + 1);
  });

  it('returns problem details for an invalid shape', async () => {
    const payload = { kWh: 1 };

    const response = await app.inject({ method: 'POST', url: '/readings', payload });

    expect(response.json()).toMatchObject({ status: 400, title: 'Request rejected' });
  });

  it('rejects negative usage', async () => {
    const payload = { ...reading, kWh: -1 };

    const response = await app.inject({ method: 'POST', url: '/readings', payload });

    expect(response.statusCode).toBe(422);
  });

  it('increments the rejection metric', async () => {
    const payload = { ...reading, kWh: -1 };

    await app.inject({ method: 'POST', url: '/readings', payload });

    expect(store.metrics.get('validateReading.rejected')).toBe(1);
  });

  it('does not disclose the NMI in a rejection', async () => {
    const payload = { ...reading, kWh: -1 };

    const response = await app.inject({ method: 'POST', url: '/readings', payload });

    expect(response.body).not.toContain(reading.nmi);
  });

  it('uses the problem details media type', async () => {
    const payload = { ...reading, quality: 'X' };

    const response = await app.inject({ method: 'POST', url: '/readings', payload });

    expect(response.headers['content-type']).toContain('application/problem+json');
  });

  it('returns problem details for malformed JSON', async () => {
    const payload = '{';

    const response = await app.inject({ method: 'POST', url: '/readings', payload,
      headers: { 'content-type': 'application/json' } });

    expect(response.json()).toMatchObject({ status: 400 });
  });
});