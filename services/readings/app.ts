import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import { registerPaymentAttemptsRoute } from '../billing/routes/paymentAttempts.js';
import { registerPaymentRoute } from '../billing/routes/payment.js';
import { registerQuoteRoute } from '../billing/routes/quote.js';
import type { Payment, PaymentLedger } from '../billing/src/handlePayment.js';
import { PaymentAttemptStore } from '../billing/src/paymentAttemptStore.js';
import { sendProblem } from './problem.js';
import { registerReadingRoute } from './routes/reading.js';
import { registerReadingsListRoute } from './routes/readingsList.js';
import { registerReadingsBatchRoute } from './routes/readingsBatch.js';
import { ReadingStore } from './store.js';

export function buildApp(options: {
  store?: ReadingStore;
  ledger?: PaymentLedger;
  paymentAttempts?: PaymentAttemptStore;
  clock?: () => Date;
} = {}) {
  const app = Fastify({ logger: false });
  const store = options.store ?? new ReadingStore();
  const ledger = options.ledger ?? new Map<string, Payment>();
  const paymentAttempts = options.paymentAttempts ?? new PaymentAttemptStore();
  const clock = options.clock ?? (() => new Date());

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    store.reject();
    return sendProblem(reply, error.statusCode ?? 500, 'Request could not be processed');
  });
  app.setNotFoundHandler((_request, reply) => sendProblem(reply, 404, 'Route not found'));
  registerReadingRoute(app, store, clock);
  registerReadingsListRoute(app, store);
  registerReadingsBatchRoute(app, store, clock);
  registerPaymentRoute(app, ledger, paymentAttempts, clock);
  registerPaymentAttemptsRoute(app, paymentAttempts);
  registerQuoteRoute(app);
  return app;
}