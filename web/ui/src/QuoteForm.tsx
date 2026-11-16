import { useState } from 'react';
import type { FormEvent } from 'react';
import { requestQuote } from './api.js';
import { FormStatus } from './FormStatus.js';
import { currentLocalDateTime, errorMessage, toIsoTimestamp } from './formUtils.js';

export function QuoteForm() {
  const [kWh, setKWh] = useState('2.5');
  const [readAt, setReadAt] = useState(currentLocalDateTime);
  const [pending, setPending] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const usage = Number(kWh);
    const timestamp = toIsoTimestamp(readAt);
    if (!Number.isFinite(usage) || usage < 0 || !timestamp) {
      setError('Enter non-negative usage and a valid read time.');
      return;
    }

    setPending(true);
    setAmount(null);
    setError(null);
    try {
      const result = await requestQuote({ kWh: usage, readAt: timestamp });
      setAmount(result.amount);
    } catch (requestError) {
      setError(errorMessage(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="operation-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="form-grid form-grid--two">
        <label className="field">
          <span>Usage (kWh)</span>
          <input type="number" min="0" step="0.01" value={kWh} onChange={(event) => setKWh(event.target.value)} required />
        </label>
        <label className="field">
          <span>Read time</span>
          <input type="datetime-local" value={readAt} onChange={(event) => setReadAt(event.target.value)} required />
          <small>Tariff windows are calculated in UTC</small>
        </label>
      </div>
      <div className="form-actions">
        <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Calculating...' : 'Calculate quote'}</button>
      </div>
      {amount !== null && (
        <div className="quote-result" role="status">
          <span>Estimated charge</span>
          <strong>{new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' }).format(amount)}</strong>
          <small>Illustrative tariff only</small>
        </div>
      )}
      {error && <FormStatus kind="error" title="Quote unavailable" detail={error} />}
    </form>
  );
}