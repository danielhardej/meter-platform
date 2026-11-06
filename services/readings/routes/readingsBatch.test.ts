import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { ReadingStore } from '../store.js';

const reading = { nmi: 'TEST000001', kWh: 2.5, readAt: '2026-11-02T10:00:00Z', quality: 'A' };
const clock = () => new Date('2026-11-02T12:00:00Z');

describe('POST /readings/batch', () => {
  it('accepts a batch', async () => {
    const app = buildApp({ clock });

    const response = await app.inject({ method: 'POST', url: '/readings/batch', payload: { readings: [reading] } });

    expect(response.json()).toEqual({ accepted: 1 });
  });

  it('does not partially store a rejected batch', async () => {
    const store = new ReadingStore();
    const app = buildApp({ store, clock });
    const payload = { readings: [reading, { ...reading, kWh: -1 }] };

    await app.inject({ method: 'POST', url: '/readings/batch', payload });

    expect(store.all()).toEqual([]);
  });

  it('rejects an empty batch', async () => {
    const app = buildApp({ clock });

    const response = await app.inject({ method: 'POST', url: '/readings/batch', payload: { readings: [] } });

    expect(response.statusCode).toBe(400);
  });
});