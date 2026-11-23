import type { FastifyInstance } from 'fastify';
import Joi from 'joi';
import { z } from 'zod';
import { calculateQuote } from '../../../packages/domain/src/index.js';
import { sendProblem } from '../../readings/problem.js';

const quoteSchema = z.object({
  kWh: z.number().nonnegative(),
  exportedKWh: z.number().default(0),
  readAt: z.iso.datetime({ offset: true }),
}).strict();

const exportedEnergySchema = Joi.number().min(0).required();

export function registerQuoteRoute(app: FastifyInstance): void {
  app.post('/quotes', (request, reply) => {
    const parsed = quoteSchema.safeParse(request.body);
    if (!parsed.success) {
      request.log.warn({ nmi: 'TEST******' }, 'Quote rejected');
      return sendProblem(reply, 400, 'Expected non-negative usage and exported energy with an ISO timestamp');
    }
    const exportValidation = exportedEnergySchema.validate(parsed.data.exportedKWh, {
      convert: false,
    });
    if (exportValidation.error) {
      request.log.warn({ nmi: 'TEST******' }, 'Quote rejected');
      return sendProblem(
        reply,
        422,
        'Expected non-negative exported energy',
      );
    }
    return reply.send({ currency: 'AUD', ...calculateQuote(parsed.data) });
  });
}