// @vitest-environment jsdom

import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.js';

type ApiOverride = (path: string, method: string) => Response | undefined;

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': status >= 400 ? 'application/problem+json' : 'application/json' },
  });
}

function stubApi(override?: ApiOverride) {
  const fetchMock = vi.fn((input: string | URL, init?: RequestInit) => {
    const path = String(input);
    const method = init?.method ?? 'GET';
    const response = override?.(path, method);
    if (response) {
      return Promise.resolve(response);
    }
    if (path === '/readings' && method === 'GET') {
      return Promise.resolve(jsonResponse({ readings: [] }));
    }
    if (path === '/payments' && method === 'GET') {
      return Promise.resolve(jsonResponse({ attempts: [] }));
    }
    return Promise.reject(new Error(`Unexpected request: ${method} ${path}`));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('API workbench', () => {
  it('calculates and displays a tariff quote', async () => {
    const fetchMock = stubApi((path, method) => path === '/quotes' && method === 'POST'
      ? jsonResponse({ currency: 'AUD', amount: 0.8 })
      : undefined);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /quote/i }));
    await user.click(screen.getByRole('button', { name: 'Calculate quote' }));

    expect(await screen.findByText('$0.80')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/quotes', expect.objectContaining({ method: 'POST' }));
  });

  it('shows duplicate payments as a successful result', async () => {
    stubApi((path, method) => path === '/payments' && method === 'POST'
      ? jsonResponse({ status: 'duplicate' })
      : undefined);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /payment/i }));
    await user.click(screen.getByRole('button', { name: 'Submit payment' }));

    expect(await screen.findByText('Duplicate confirmed')).toBeTruthy();
  });

  it('adds and removes editable batch rows', async () => {
    stubApi();
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /batch/i }));
    await user.click(screen.getByRole('button', { name: 'Add row' }));
    expect(screen.getByText('3 of 100 readings')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Remove row 3' }));
    expect(screen.getByText('2 of 100 readings')).toBeTruthy();
  });

  it('shows an empty submitted-readings state', async () => {
    stubApi();

    render(<App />);

    expect(await screen.findByText('No readings have been accepted yet.')).toBeTruthy();
  });

  it('manually refreshes submitted readings', async () => {
    const reading = { nmi: 'TEST000002', kWh: 1.8, readAt: '2026-11-02T10:05:00Z', quality: 'E' };
    let readingRequests = 0;
    stubApi((path, method) => {
      if (path === '/readings' && method === 'GET') {
        readingRequests += 1;
        return jsonResponse({ readings: readingRequests === 1 ? [] : [reading] });
      }
      return undefined;
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('No readings have been accepted yet.');

    await user.click(screen.getByRole('button', { name: 'Refresh' }));

    expect(await screen.findByRole('cell', { name: 'TEST000002' })).toBeTruthy();
    expect(screen.getByRole('cell', { name: 'Estimated' })).toBeTruthy();
  });

  it('refreshes readings after a successful submission', async () => {
    const reading = { nmi: 'TEST000001', kWh: 2.5, readAt: '2026-11-02T10:00:00Z', quality: 'A' };
    let accepted = false;
    stubApi((path, method) => {
      if (path === '/readings' && method === 'POST') {
        accepted = true;
        return jsonResponse({ status: 'accepted' }, 201);
      }
      if (path === '/readings' && method === 'GET') {
        return jsonResponse({ readings: accepted ? [reading] : [] });
      }
      return undefined;
    });
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('No readings have been accepted yet.');

    await user.click(screen.getByRole('button', { name: 'Submit reading' }));

    expect(await screen.findByText('Reading accepted')).toBeTruthy();
    expect(await screen.findByRole('cell', { name: 'TEST000001' })).toBeTruthy();
  });

  it('shows accepted, duplicate and conflict payment attempts', async () => {
    const submittedAt = '2026-11-02T12:00:00.000Z';
    stubApi((path, method) => path === '/payments' && method === 'GET'
      ? jsonResponse({ attempts: [
        { paymentId: 'payment-3', accountId: 'account-1', amountCents: 700, outcome: 'conflict', submittedAt },
        { paymentId: 'payment-2', accountId: 'account-1', amountCents: 600, outcome: 'duplicate', submittedAt },
        { paymentId: 'payment-1', accountId: 'account-1', amountCents: 500, outcome: 'accepted', submittedAt },
      ] })
      : undefined);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /payment/i }));

    const table = await screen.findByRole('table', { name: 'Payment attempts' });
    expect(within(table).getByText('accepted')).toBeTruthy();
    expect(within(table).getByText('duplicate')).toBeTruthy();
    expect(within(table).getByText('conflict')).toBeTruthy();
    expect(within(table).getByText('$5.00')).toBeTruthy();
  });

  it('refreshes payment attempts after a conflict', async () => {
    const attempt = {
      paymentId: 'demo-payment-001',
      accountId: 'demo-account-001',
      amountCents: 500,
      outcome: 'conflict',
      submittedAt: '2026-11-02T12:00:00.000Z',
    };
    let conflictRecorded = false;
    stubApi((path, method) => {
      if (path === '/payments' && method === 'POST') {
        conflictRecorded = true;
        return jsonResponse({ detail: 'Payment conflicts with an existing payment' }, 409);
      }
      if (path === '/payments' && method === 'GET') {
        return jsonResponse({ attempts: conflictRecorded ? [attempt] : [] });
      }
      return undefined;
    });
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: /payment/i }));
    await screen.findByText('No payment attempts have been recorded yet.');

    await user.click(screen.getByRole('button', { name: 'Submit payment' }));

    expect(await screen.findByText('Payment not accepted')).toBeTruthy();
    const table = await screen.findByRole('table', { name: 'Payment attempts' });
    expect(within(table).getByText('conflict')).toBeTruthy();
  });
});
