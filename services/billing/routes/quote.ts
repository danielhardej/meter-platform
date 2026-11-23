import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import Joi from 'joi';
import { z } from 'zod';
import { calculateQuote } from '../../../packages/domain/src/index.js';
import { sendProblem } from '../../readings/problem.js';

const quoteSchema = z.object({
  nmi: z.string().optional(),
  kWh: z.number().nonnegative(),
  exportKwh: z.number().optional(),
  readAt: z.iso.datetime({ offset: true }),
}).strict();

const exportKwhSchema = Joi.number().min(0);

function rejectQuote(request: FastifyRequest, reply: FastifyReply, status: number, detail: string): FastifyReply {
  const { nmi } = (request.body ?? {}) as { nmi?: string };
  request.log.warn({ nmi }, 'Quote rejected');
  return sendProblem(reply, status, detail);
}

export function registerQuoteRoute(app: FastifyInstance): void {
  app.post('/quotes', (request, reply) => {
    const parsed = quoteSchema.safeParse(request.body);
    if (!parsed.success) {
      return rejectQuote(request, reply, 400, 'Expected non-negative usage and export energy with an ISO timestamp');
    }
    const { error } = exportKwhSchema.validate(parsed.data.exportKwh);
    if (error) {
      return rejectQuote(request, reply, 422, 'Export energy must not be negative');
    }
    return reply.send({ currency: 'AUD', ...calculateQuote(parsed.data) });
  });
}