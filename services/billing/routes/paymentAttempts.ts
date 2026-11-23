import type { FastifyInstance } from 'fastify';
import type { PaymentAttemptStore } from '../src/paymentAttemptStore.js';

export function registerPaymentAttemptsRoute(app: FastifyInstance, attempts: PaymentAttemptStore): void {
  app.get('/payments', (_request, reply) => reply.send({ attempts: attempts.allNewestFirst() }));
}