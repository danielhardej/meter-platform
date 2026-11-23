import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, fetchPaymentAttempts, fetchReadings, requestQuote, submitReading } from './api.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('API client', () => {
  it('returns a successful JSON response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ currency: 'AUD', amount: 0.8 }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )));

    await expect(requestQuote({ kWh: 2.5, readAt: '2026-11-02T10:00:00Z' }))
      .resolves.toEqual({ currency: 'AUD', amount: 0.8 });
  });

  it('returns readings from the list endpoint', async () => {
    const reading = { nmi: 'TEST000001', kWh: 2.5, readAt: '2026-11-02T10:00:00Z', quality: 'A' };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ readings: [reading] }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )));

    await expect(fetchReadings()).resolves.toEqual([reading]);
    expect(fetch).toHaveBeenCalledWith('/readings', { method: 'GET' });
  });

  it('surfaces problem detail from a failed list request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ detail: 'Payment attempts are unavailable' }),
      { status: 503, headers: { 'content-type': 'application/problem+json' } },
    )));

    await expect(fetchPaymentAttempts())
      .rejects.toMatchObject({ status: 503, message: 'Payment attempts are unavailable' });
  });

  it('surfaces safe problem detail from a rejected request', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ detail: 'NMI must be 10 characters starting with TEST' }),
      { status: 422, headers: { 'content-type': 'application/problem+json' } },
    )));

    await expect(submitReading({ nmi: 'invalid', kWh: 1, readAt: '2026-11-02T10:00:00Z', quality: 'A' }))
      .rejects.toMatchObject({ status: 422, message: 'NMI must be 10 characters starting with TEST' });
  });

  it('reports a transport failure without exposing a payload', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('connection refused')));

    await expect(requestQuote({ kWh: 1, readAt: '2026-11-02T10:00:00Z' }))
      .rejects.toEqual(new ApiError('The local API could not be reached. Check that the server is running.', 0));
  });

  it('reports a non-JSON API response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('not json', { status: 502 })));

    await expect(requestQuote({ kWh: 1, readAt: '2026-11-02T10:00:00Z' }))
      .rejects.toMatchObject({ status: 502, message: 'The API returned an unreadable response.' });
  });
});