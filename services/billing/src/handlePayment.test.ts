import { describe, expect, it } from 'vitest';
import { handlePayment } from './handlePayment.js';
import type { PaymentLedger } from './handlePayment.js';

const payment = { paymentId: 'test-payment-1', accountId: 'test-account-1', amountCents: 500 };

describe('handlePayment', () => {
  it('accepts a valid payment', () => {
    const ledger: PaymentLedger = new Map();

    const result = handlePayment(payment, ledger);

    expect(result.status).toBe('accepted');
  });

  it('stores accepted payments', () => {
    const ledger: PaymentLedger = new Map();

    handlePayment(payment, ledger);

    expect(ledger.get(payment.paymentId)).toEqual(payment);
  });

  it('makes repeated payments idempotent', () => {
    const ledger: PaymentLedger = new Map([[payment.paymentId, payment]]);

    const result = handlePayment(payment, ledger);

    expect(result.status).toBe('duplicate');
  });

  it('rejects a conflicting payment ID', () => {
    const ledger: PaymentLedger = new Map([[payment.paymentId, payment]]);

    const result = handlePayment({ ...payment, amountCents: 600 }, ledger);

    expect(result.status).toBe('rejected');
  });

  it.each([0, -1, 1.5])('rejects invalid cents: %s', (amountCents) => {
    const ledger: PaymentLedger = new Map();

    const result = handlePayment({ ...payment, amountCents }, ledger);

    expect(result.status).toBe('rejected');
  });
});