export interface Payment {
  paymentId: string;
  accountId: string;
  amountCents: number;
}

export type PaymentLedger = Map<string, Payment>;
export type PaymentResult = { status: 'accepted' | 'duplicate' | 'rejected' };

export function handlePayment(payment: Payment, ledger: PaymentLedger): PaymentResult {
  if (!payment.paymentId || !payment.accountId || !Number.isSafeInteger(payment.amountCents) || payment.amountCents <= 0) {
    return { status: 'rejected' };
  }
  const previous = ledger.get(payment.paymentId);
  if (previous) {
    return { status: previous.accountId === payment.accountId && previous.amountCents === payment.amountCents
      ? 'duplicate' : 'rejected' };
  }
  ledger.set(payment.paymentId, { ...payment });
  return { status: 'accepted' };
}