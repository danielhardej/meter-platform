import Fastify from 'fastify';
import type { FastifyError } from 'fastify';
import { registerPaymentRoute } from '../billing/routes/payment.js';
import { registerQuoteRoute } from '../billing/routes/quote.js';
import type { Payment, PaymentLedger } from '../billing/src/handlePayment.js';
import { sendProblem } from './problem.js';
import { registerReadingRoute } from './routes/reading.js';
import { registerReadingsBatchRoute } from './routes/readingsBatch.js';
import { ReadingStore } from './store.js';

export function buildApp(options: {
  store?: ReadingStore;
  ledger?: PaymentLedger;
  clock?: () => Date;
} = {}) {
  const app = Fastify({ logger: false });
  const store = options.store ?? new ReadingStore();
  const clock = options.clock ?? (() => new Date());

  app.setErrorHandler((error: FastifyError, _request, reply) => {
    store.reject();
    return sendProblem(reply, error.statusCode ?? 500, 'Request could not be processed');
  });
  app.setNotFoundHandler((_request, reply) => sendProblem(reply, 404, 'Route not found'));
  registerReadingRoute(app, store, clock);
  registerReadingsBatchRoute(app, store, clock);
  registerPaymentRoute(app, options.ledger ?? new Map<string, Payment>());
  registerQuoteRoute(app);
  return app;
}