import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { submitReadings } from './api.js';
import type { ReadingRequest } from './api.js';
import { FormStatus } from './FormStatus.js';
import { currentLocalDateTime, errorMessage, toIsoTimestamp } from './formUtils.js';

interface BatchRow {
  id: number;
  nmi: string;
  kWh: string;
  readAt: string;
  quality: ReadingRequest['quality'];
}

function createRow(id: number): BatchRow {
  return {
    id,
    nmi: `TEST${String(id).padStart(6, '0')}`,
    kWh: id === 1 ? '1.8' : '3.1',
    readAt: currentLocalDateTime(),
    quality: id === 1 ? 'A' : 'E',
  };
}

function toReading(row: BatchRow): ReadingRequest | null {
  const kWh = Number(row.kWh);
  const readAt = toIsoTimestamp(row.readAt);
  if (!/^TEST[A-Z0-9]{6}$/.test(row.nmi) || !Number.isFinite(kWh) || kWh < 0 || !readAt) {
    return null;
  }
  return { nmi: row.nmi, kWh, readAt, quality: row.quality };
}

export function BatchForm() {
  const [rows, setRows] = useState(() => [createRow(1), createRow(2)]);
  const nextId = useRef(3);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; title: string; detail: string } | null>(null);

  function updateRow(id: number, change: Partial<Omit<BatchRow, 'id'>>) {
    setRows((current) => current.map((row) => row.id === id ? { ...row, ...change } : row));
  }

  function addRow() {
    if (rows.length >= 100) return;
    const id = nextId.current;
    nextId.current += 1;
    setRows((current) => [...current, createRow(id)]);
    setStatus(null);
  }

  function removeRow(id: number) {
    if (rows.length === 1) return;
    setRows((current) => current.filter((row) => row.id !== id));
    setStatus(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const readings = rows.map(toReading);
    if (readings.some((reading) => reading === null)) {
      setStatus({ kind: 'error', title: 'Check the batch', detail: 'Every row needs a valid TEST NMI, non-negative usage and read time.' });
      return;
    }

    setPending(true);
    setStatus(null);
    try {
      const result = await submitReadings(readings as ReadingRequest[]);
      setStatus({ kind: 'success', title: 'Batch accepted', detail: `${result.accepted} readings were accepted together.` });
    } catch (error) {
      setStatus({ kind: 'error', title: 'Batch not accepted', detail: errorMessage(error) });
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="operation-form" onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div className="batch-toolbar">
        <span>{rows.length} of 100 readings</span>
        <button className="button button--secondary button--small" type="button" onClick={addRow} disabled={rows.length >= 100}>Add row</button>
      </div>
      <div className="table-wrap">
        <table className="batch-table">
          <thead>
            <tr><th>NMI</th><th>Usage (kWh)</th><th>Read time</th><th>Quality</th><th><span className="visually-hidden">Actions</span></th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td><input aria-label={`NMI for row ${index + 1}`} value={row.nmi} maxLength={10} onChange={(event) => updateRow(row.id, { nmi: event.target.value.toUpperCase() })} /></td>
                <td><input aria-label={`Usage for row ${index + 1}`} type="number" min="0" step="0.01" value={row.kWh} onChange={(event) => updateRow(row.id, { kWh: event.target.value })} /></td>
                <td><input aria-label={`Read time for row ${index + 1}`} type="datetime-local" value={row.readAt} onChange={(event) => updateRow(row.id, { readAt: event.target.value })} /></td>
                <td>
                  <select aria-label={`Quality for row ${index + 1}`} value={row.quality} onChange={(event) => updateRow(row.id, { quality: event.target.value as ReadingRequest['quality'] })}>
                    <option value="A">Actual</option><option value="E">Estimated</option><option value="S">Substituted</option>
                  </select>
                </td>
                <td><button className="table-action" type="button" onClick={() => removeRow(row.id)} disabled={rows.length === 1} aria-label={`Remove row ${index + 1}`}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="form-actions">
        <button className="button button--primary" type="submit" disabled={pending}>{pending ? 'Submitting...' : `Submit ${rows.length} readings`}</button>
      </div>
      {status && <FormStatus {...status} />}
    </form>
  );
}