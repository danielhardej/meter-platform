import type { Payment } from './handlePayment.js';

export type PaymentAttemptOutcome = 'accepted' | 'duplicate' | 'conflict';

export interface PaymentAttempt extends Payment {
  outcome: PaymentAttemptOutcome;
  submittedAt: string;
}

export class PaymentAttemptStore {
  private readonly attempts: PaymentAttempt[] = [];

  add(payment: Payment, outcome: PaymentAttemptOutcome, submittedAt: Date): void {
    this.attempts.push({ ...payment, outcome, submittedAt: submittedAt.toISOString() });
  }

  allNewestFirst(): PaymentAttempt[] {
    return this.attempts.slice().reverse().map((attempt) => ({ ...attempt }));
  }
}