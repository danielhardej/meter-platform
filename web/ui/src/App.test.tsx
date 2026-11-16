// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App.js';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('API workbench', () => {
  it('calculates and displays a tariff quote', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ currency: 'AUD', amount: 0.8 }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /quote/i }));
    await user.click(screen.getByRole('button', { name: 'Calculate quote' }));

    expect(await screen.findByText('$0.80')).toBeTruthy();
    expect(fetch).toHaveBeenCalledWith('/quotes', expect.objectContaining({ method: 'POST' }));
  });

  it('shows duplicate payments as a successful result', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(
      JSON.stringify({ status: 'duplicate' }),
      { status: 200, headers: { 'content-type': 'application/json' } },
    )));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /payment/i }));
    await user.click(screen.getByRole('button', { name: 'Submit payment' }));

    expect(await screen.findByText('Duplicate confirmed')).toBeTruthy();
  });

  it('adds and removes editable batch rows', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /batch/i }));
    await user.click(screen.getByRole('button', { name: 'Add row' }));
    expect(screen.getByText('3 of 100 readings')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: 'Remove row 3' }));
    expect(screen.getByText('2 of 100 readings')).toBeTruthy();
  });
});