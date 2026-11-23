import { describe, expect, it } from 'vitest';
import { PaymentAttemptStore } from './paymentAttemptStore.js';

const payment = { paymentId: 'test-payment-1', accountId: 'test-account-1', amountCents: 500 };

describe('PaymentAttemptStore', () => {
  it('records a payment attempt', () => {
    const store = new PaymentAttemptStore();

    store.add(payment, 'accepted', new Date('2026-11-02T12:00:00Z'));

    expect(store.allNewestFirst()).toEqual([{
      ...payment,
      outcome: 'accepted',
      submittedAt: '2026-11-02T12:00:00.000Z',
    }]);
  });

  it('returns attempts newest first', () => {
    const store = new PaymentAttemptStore();
    store.add(payment, 'accepted', new Date('2026-11-02T12:00:00Z'));
    store.add({ ...payment, paymentId: 'test-payment-2' }, 'duplicate', new Date('2026-11-02T12:01:00Z'));

    const attempts = store.allNewestFirst();

    expect(attempts.map((attempt) => attempt.paymentId)).toEqual(['test-payment-2', 'test-payment-1']);
  });

  it('does not expose stored objects for mutation', () => {
    const store = new PaymentAttemptStore();
    store.add(payment, 'accepted', new Date('2026-11-02T12:00:00Z'));

    const [attempt] = store.allNewestFirst();
    if (!attempt) {
      throw new Error('Expected a stored payment attempt');
    }
    attempt.amountCents = 999;

    expect(store.allNewestFirst()[0]?.amountCents).toBe(500);
  });
});