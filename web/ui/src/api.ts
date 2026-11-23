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

export interface PaymentAttempt extends PaymentRequest {
  outcome: 'accepted' | 'duplicate' | 'conflict';
  submittedAt: string;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function requestJson<TResponse>(path: string, init: RequestInit): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(path, init);
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

function getJson<TResponse>(path: string): Promise<TResponse> {
  return requestJson(path, { method: 'GET' });
}

function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  return requestJson(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function fetchReadings(): Promise<ReadingRequest[]> {
  const response = await getJson<{ readings: ReadingRequest[] }>('/readings');
  return response.readings;
}

export async function fetchPaymentAttempts(): Promise<PaymentAttempt[]> {
  const response = await getJson<{ attempts: PaymentAttempt[] }>('/payments');
  return response.attempts;
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