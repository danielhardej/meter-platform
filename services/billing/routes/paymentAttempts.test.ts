import { describe, expect, it } from 'vitest';
import { buildApp } from '../../readings/app.js';
import type { PaymentAttempt } from '../src/paymentAttemptStore.js';

const payment = { paymentId: 'test-payment-1', accountId: 'test-account-1', amountCents: 500 };
const clock = () => new Date('2026-11-02T12:00:00Z');

describe('GET /payments', () => {
  it('returns an empty attempt list', async () => {
    const app = buildApp({ clock });

    const response = await app.inject({ method: 'GET', url: '/payments' });

    expect(response.json()).toEqual({ attempts: [] });
  });

  it('records an accepted payment', async () => {
    const app = buildApp({ clock });
    await app.inject({ method: 'POST', url: '/payments', payload: payment });

    const response = await app.inject({ method: 'GET', url: '/payments' });
    const body = response.json<{ attempts: PaymentAttempt[] }>();

    expect(body.attempts).toEqual([{
      ...payment,
      outcome: 'accepted',
      submittedAt: '2026-11-02T12:00:00.000Z',
    }]);
  });

  it('records a duplicate payment', async () => {
    const app = buildApp({ clock });
    await app.inject({ method: 'POST', url: '/payments', payload: payment });
    await app.inject({ method: 'POST', url: '/payments', payload: payment });

    const response = await app.inject({ method: 'GET', url: '/payments' });
    const body = response.json<{ attempts: PaymentAttempt[] }>();

    expect(body.attempts[0]?.outcome).toBe('duplicate');
  });

  it('records a conflicting payment', async () => {
    const app = buildApp({ clock });
    await app.inject({ method: 'POST', url: '/payments', payload: payment });
    await app.inject({ method: 'POST', url: '/payments', payload: { ...payment, amountCents: 600 } });

    const response = await app.inject({ method: 'GET', url: '/payments' });
    const body = response.json<{ attempts: PaymentAttempt[] }>();

    expect(body.attempts[0]?.outcome).toBe('conflict');
  });

  it('returns attempts newest first', async () => {
    const app = buildApp({ clock });
    await app.inject({ method: 'POST', url: '/payments', payload: payment });
    await app.inject({ method: 'POST', url: '/payments', payload: { ...payment, paymentId: 'test-payment-2' } });

    const response = await app.inject({ method: 'GET', url: '/payments' });
    const body = response.json<{ attempts: PaymentAttempt[] }>();

    expect(body.attempts.map((attempt) => attempt.paymentId))
      .toEqual(['test-payment-2', 'test-payment-1']);
  });

  it('excludes malformed payment requests', async () => {
    const app = buildApp({ clock });
    await app.inject({ method: 'POST', url: '/payments', payload: { ...payment, amountCents: -1 } });

    const response = await app.inject({ method: 'GET', url: '/payments' });

    expect(response.json()).toEqual({ attempts: [] });
  });
});