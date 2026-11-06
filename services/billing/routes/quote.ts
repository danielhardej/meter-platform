import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { calculateTariff } from '../../../packages/domain/src/index.js';
import { sendProblem } from '../../readings/problem.js';

const quoteSchema = z.object({
  kWh: z.number().nonnegative(),
  readAt: z.iso.datetime({ offset: true }),
}).strict();

export function registerQuoteRoute(app: FastifyInstance): void {
  app.post('/quotes', (request, reply) => {
    const parsed = quoteSchema.safeParse(request.body);
    if (!parsed.success) {
      return sendProblem(reply, 400, 'Expected non-negative kWh and an ISO timestamp');
    }
    return reply.send({ currency: 'AUD', amount: calculateTariff(parsed.data) });
  });
}