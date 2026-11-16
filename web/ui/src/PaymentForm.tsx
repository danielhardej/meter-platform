import { useState } from 'react';
import type { FormEvent } from 'react';
import { submitPayment } from './api.js';
import { FormStatus } from './FormStatus.js';
import { errorMessage } from './formUtils.js';

interface PaymentFields {
  paymentId: string;
  accountId: string;
  amountCents: string;
}

const samplePayment: PaymentFields = { paymentId: 'demo-payment-001', accountId: 'demo-account-001', amountCents: '500' };

export function PaymentForm() {
  const [fields, setFields] = useState(samplePayment);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; title: string; detail: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountCents = Number(fields.amountCents);
    if (!fields.paymentId || fields.paymentId.length > 64 || !fields.accountId || fields.accountId.length > 64
      || !Number.isSafeInteger(amountCents) || amountCents <= 0) {
      setStatus({ kind: 'error', title: 'Check the payment', detail: 'Use IDs up to 64 characters and a positive whole-number amount in cents.' });
      return;
    }

    setPending(true);
    setStatus(null);
    try {
      const result = await submitPayment({ paymentId: fields.paymentId, accountId: fields.accountId, amountCents });
      setStatus(result.status === 'duplicate'
        ? { kind: 'success', title: 'Duplicate confirmed', detail: 'This exact payment was already accepted; no second payment was created.' }
        : { kind: 'success', title: 'Payment accepted', detail: 'The payment was added to the in-memory ledger.' });
    } catch (error) {
      setStatus({ kind: 'error', title: 'Payment not accepted', detail: errorMessage(error) });
    } finally {
      setPending(false);
    }
  }

  function createPaymentId() {
    setFields((current) => ({ ...current, paymentId: `demo-payment-${Date.now().toString().slice(-6)}` }));
    setStatus(null);
  }

  return (
    <form className="operation-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="form-grid form-grid--two">
        <label className="field">
          <span>Payment ID</span>
          <input value={fields.paymentId} maxLength={64} onChange={(event) => setFields({ ...fields, paymentId: event.target.value })} required />
          <small>Reuse the same ID to test duplicate handling</small>
        </label>
        <label className="field">
          <span>Account ID</span>
          <input value={fields.accountId} maxLength={64} onChange={(event) => setFields({ ...fields, accountId: event.target.value })} required />
        </label>
        <label className="field">
          <span>Amount (cents)</span>
          <input type="number" min="1" step="1" value={fields.amountCents} onChange={(event) => setFields({ ...fields, amountCents: event.target.value })} required />
        </label>
      </div>
      <div className="form-actions">
        <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Submitting...' : 'Submit payment'}</button>
        <button className="button button--secondary" type="button" onClick={createPaymentId}>New payment ID</button>
      </div>
      {status && <FormStatus {...status} />}
    </form>
  );
}