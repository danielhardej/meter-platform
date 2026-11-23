import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import { ReadingStore } from '../store.js';

const firstReading = { nmi: 'TEST000001', kWh: 2.5, readAt: '2026-11-02T10:00:00Z', quality: 'A' } as const;
const secondReading = { nmi: 'TEST000002', kWh: 1.8, readAt: '2026-11-02T10:05:00Z', quality: 'E' } as const;
const clock = () => new Date('2026-11-02T12:00:00Z');

describe('GET /readings', () => {
  it('returns an empty reading list', async () => {
    const app = buildApp({ clock });

    const response = await app.inject({ method: 'GET', url: '/readings' });

    expect(response.json()).toEqual({ readings: [] });
  });

  it('includes accepted single and batch readings', async () => {
    const app = buildApp({ clock });
    await app.inject({ method: 'POST', url: '/readings', payload: firstReading });
    await app.inject({ method: 'POST', url: '/readings/batch', payload: { readings: [secondReading] } });

    const response = await app.inject({ method: 'GET', url: '/readings' });
    const body = response.json<{ readings: typeof firstReading[] }>();

    expect(body.readings).toEqual(expect.arrayContaining([firstReading, secondReading]));
  });

  it('returns the most recently accepted reading first', async () => {
    const store = new ReadingStore();
    store.add(firstReading);
    store.add(secondReading);
    const app = buildApp({ store, clock });

    const response = await app.inject({ method: 'GET', url: '/readings' });
    const body = response.json<{ readings: typeof firstReading[] }>();

    expect(body.readings).toEqual([secondReading, firstReading]);
  });

  it('excludes rejected readings', async () => {
    const app = buildApp({ clock });
    await app.inject({ method: 'POST', url: '/readings', payload: { ...firstReading, kWh: -1 } });

    const response = await app.inject({ method: 'GET', url: '/readings' });

    expect(response.json()).toEqual({ readings: [] });
  });
});