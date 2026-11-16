export interface ReadingRequest {
  nmi: string;
  kWh: number;
  readAt: string;
  quality: 'A' | 'E' | 'S';
}

export interface PaymentRequest {
  paymentId: string;
  accountId: string;
  amountCents: number;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('The local API could not be reached. Check that the server is running.', 0);
  }

  const text = await response.text();
  let payload: unknown;
  try {
    payload = text.length > 0 ? JSON.parse(text) : null;
  } catch {
    throw new ApiError('The API returned an unreadable response.', response.status);
  }

  if (!response.ok) {
    const detail = typeof payload === 'object' && payload !== null && 'detail' in payload
      && typeof payload.detail === 'string'
      ? payload.detail
      : `The request failed with status ${response.status}.`;
    throw new ApiError(detail, response.status);
  }

  return payload as TResponse;
}

export function submitReading(reading: ReadingRequest) {
  return postJson<{ status: 'accepted' }>('/readings', reading);
}

export function submitReadings(readings: ReadingRequest[]) {
  return postJson<{ accepted: number }>('/readings/batch', { readings });
}

export function requestQuote(request: Pick<ReadingRequest, 'kWh' | 'readAt'>) {
  return postJson<{ currency: 'AUD'; amount: number }>('/quotes', request);
}

export function submitPayment(payment: PaymentRequest) {
  return postJson<{ status: 'accepted' | 'duplicate' }>('/payments', payment);
}