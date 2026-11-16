import { useState } from 'react';
import type { FormEvent } from 'react';
import { submitReading } from './api.js';
import type { ReadingRequest } from './api.js';
import { FormStatus } from './FormStatus.js';
import { currentLocalDateTime, errorMessage, toIsoTimestamp } from './formUtils.js';

interface ReadingFields {
  nmi: string;
  kWh: string;
  readAt: string;
  quality: ReadingRequest['quality'];
}

function sampleReading(): ReadingFields {
  return { nmi: 'TEST000001', kWh: '2.5', readAt: currentLocalDateTime(), quality: 'A' };
}

export function ReadingForm() {
  const [fields, setFields] = useState(sampleReading);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; title: string; detail: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const kWh = Number(fields.kWh);
    const readAt = toIsoTimestamp(fields.readAt);

    if (!/^TEST[A-Z0-9]{6}$/.test(fields.nmi) || !Number.isFinite(kWh) || kWh < 0 || !readAt) {
      setStatus({ kind: 'error', title: 'Check the reading', detail: 'Use a 10-character TEST NMI, non-negative usage and a valid read time.' });
      return;
    }

    setPending(true);
    setStatus(null);
    try {
      await submitReading({ nmi: fields.nmi, kWh, readAt, quality: fields.quality });
      setStatus({ kind: 'success', title: 'Reading accepted', detail: `${fields.kWh} kWh was accepted by the local API.` });
    } catch (error) {
      setStatus({ kind: 'error', title: 'Reading not accepted', detail: errorMessage(error) });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="operation-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="form-grid form-grid--two">
        <label className="field">
          <span>NMI</span>
          <input value={fields.nmi} onChange={(event) => setFields({ ...fields, nmi: event.target.value.toUpperCase() })} maxLength={10} required />
          <small>10 characters beginning with TEST</small>
        </label>
        <label className="field">
          <span>Usage (kWh)</span>
          <input type="number" min="0" step="0.01" value={fields.kWh} onChange={(event) => setFields({ ...fields, kWh: event.target.value })} required />
        </label>
        <label className="field">
          <span>Read time</span>
          <input type="datetime-local" value={fields.readAt} onChange={(event) => setFields({ ...fields, readAt: event.target.value })} required />
          <small>Local time, sent to the API as UTC</small>
        </label>
        <label className="field">
          <span>Quality</span>
          <select value={fields.quality} onChange={(event) => setFields({ ...fields, quality: event.target.value as ReadingRequest['quality'] })}>
            <option value="A">Actual</option>
            <option value="E">Estimated</option>
            <option value="S">Substituted</option>
          </select>
        </label>
      </div>
      <div className="form-actions">
        <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Submitting...' : 'Submit reading'}</button>
        <button className="button button--secondary" type="button" onClick={() => { setFields(sampleReading()); setStatus(null); }}>Reset sample</button>
      </div>
      {status && <FormStatus {...status} />}
    </form>
  );
}