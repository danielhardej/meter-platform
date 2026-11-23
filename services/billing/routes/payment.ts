import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendProblem } from '../../readings/problem.js';
import { handlePayment } from '../src/handlePayment.js';
import type { PaymentLedger } from '../src/handlePayment.js';
import type { PaymentAttemptOutcome, PaymentAttemptStore } from '../src/paymentAttemptStore.js';

const paymentSchema = z.object({
  paymentId: z.string().min(1).max(64),
  accountId: z.string().min(1).max(64),
  amountCents: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
}).strict();

export function registerPaymentRoute(
  app: FastifyInstance,
  ledger: PaymentLedger,
  attempts: PaymentAttemptStore,
  clock: () => Date,
): void {
  app.post('/payments', (request, reply) => {
    const parsed = paymentSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendProblem(reply, 400, 'Expected a payment ID, synthetic account ID and positive integer cents');
    }
    const result = handlePayment(parsed.data, ledger);
    const outcome: PaymentAttemptOutcome = result.status === 'rejected' ? 'conflict' : result.status;
    attempts.add(parsed.data, outcome, clock());
    if (result.status === 'rejected') {
      return sendProblem(reply, 409, 'Payment conflicts with an existing payment');
    }
    return reply.code(result.status === 'accepted' ? 201 : 200).send(result);
  });
}