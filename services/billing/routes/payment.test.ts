import { beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../readings/app.js';
import { handlePayment } from '../src/handlePayment.js';

vi.mock('../src/handlePayment.js', () => ({ handlePayment: vi.fn() }));
beforeEach(() => { vi.mocked(handlePayment).mockReset(); });
const payment = { paymentId: 'test-payment-1', accountId: 'test-account-1', amountCents: 500 };

describe('POST /payments', () => {
  it('delegates valid payments to the handler', async () => {
    const app = buildApp();
    vi.mocked(handlePayment).mockReturnValue({ status: 'accepted' });

    await app.inject({ method: 'POST', url: '/payments', payload: payment });

    expect(handlePayment).toHaveBeenCalledWith(payment, expect.any(Map));
  });

  it('returns 201 for an accepted payment', async () => {
    const app = buildApp();
    vi.mocked(handlePayment).mockReturnValue({ status: 'accepted' });

    const response = await app.inject({ method: 'POST', url: '/payments', payload: payment });

    expect(response.statusCode).toBe(201);
  });

  it('returns 200 for a duplicate payment', async () => {
    const app = buildApp();
    vi.mocked(handlePayment).mockReturnValue({ status: 'duplicate' });

    const response = await app.inject({ method: 'POST', url: '/payments', payload: payment });

    expect(response.statusCode).toBe(200);
  });

  it('returns problem details for conflicting payments', async () => {
    const app = buildApp();
    vi.mocked(handlePayment).mockReturnValue({ status: 'rejected' });

    const response = await app.inject({ method: 'POST', url: '/payments', payload: payment });

    expect(response.json()).toMatchObject({ status: 409 });
  });

  it('rejects invalid input before calling the handler', async () => {
    const app = buildApp();
    const payload = { ...payment, amountCents: -1 };

    await app.inject({ method: 'POST', url: '/payments', payload });

    expect(handlePayment).not.toHaveBeenCalled();
  });
});