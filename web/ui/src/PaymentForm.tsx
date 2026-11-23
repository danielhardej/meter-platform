import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { ApiError, fetchPaymentAttempts, submitPayment } from './api.js';
import type { PaymentAttempt } from './api.js';
import { FormStatus } from './FormStatus.js';
import { errorMessage, formatAudFromCents, formatDateTime } from './formUtils.js';

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
  const [attempts, setAttempts] = useState<PaymentAttempt[]>([]);
  const [listPending, setListPending] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  async function loadAttempts() {
    setListPending(true);
    setListError(null);
    try {
      setAttempts(await fetchPaymentAttempts());
    } catch (error) {
      setListError(errorMessage(error));
    } finally {
      setListPending(false);
    }
  }

  useEffect(() => {
    void loadAttempts();
  }, []);

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
      void loadAttempts();
    } catch (error) {
      setStatus({ kind: 'error', title: 'Payment not accepted', detail: errorMessage(error) });
      if (error instanceof ApiError && error.status === 409) {
        void loadAttempts();
      }
    } finally {
      setPending(false);
    }
  }

  function createPaymentId() {
    setFields((current) => ({ ...current, paymentId: `demo-payment-${Date.now().toString().slice(-6)}` }));
    setStatus(null);
  }

  return (
    <div className="operation-content">
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

      <section className="history-section" aria-labelledby="payment-attempts-title">
        <div className="history-toolbar">
          <div>
            <p className="section-kicker">In-memory history</p>
            <h3 id="payment-attempts-title">Payment attempts</h3>
            <span>{attempts.length} recorded</span>
          </div>
          <button className="button button--secondary button--small" type="button" onClick={() => void loadAttempts()} disabled={listPending}>
            {listPending ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {listError && <FormStatus kind="error" title="Payment attempts unavailable" detail={listError} />}
        {!listError && listPending && attempts.length === 0 && <p className="history-state" role="status">Loading payment attempts...</p>}
        {!listError && !listPending && attempts.length === 0 && <p className="history-state">No payment attempts have been recorded yet.</p>}
        {attempts.length > 0 && (
          <div className="table-wrap">
            <table className="history-table history-table--payments" aria-label="Payment attempts">
              <thead>
                <tr><th>Payment ID</th><th>Account ID</th><th>Amount</th><th>Outcome</th><th>Submitted</th></tr>
              </thead>
              <tbody>
                {attempts.map((attempt, index) => (
                  <tr key={`${attempt.paymentId}-${attempt.submittedAt}-${index}`}>
                    <td>{attempt.paymentId}</td>
                    <td>{attempt.accountId}</td>
                    <td>{formatAudFromCents(attempt.amountCents)}</td>
                    <td><strong className={`outcome outcome--${attempt.outcome}`}>{attempt.outcome}</strong></td>
                    <td>{formatDateTime(attempt.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}