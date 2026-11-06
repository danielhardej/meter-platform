import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validateReading } from '../../../packages/domain/src/index.js';
import { sendProblem } from '../problem.js';
import type { ReadingStore } from '../store.js';

export const readingSchema = z.object({
  nmi: z.string(),
  kWh: z.number(),
  readAt: z.iso.datetime({ offset: true }),
  quality: z.enum(['A', 'E', 'S']),
}).strict();

export function registerReadingRoute(app: FastifyInstance, store: ReadingStore, clock: () => Date): void {
  app.post('/readings', (request, reply) => {
    const parsed = readingSchema.safeParse(request.body);
    if (!parsed.success) {
      store.reject();
      return sendProblem(reply, 400, 'Expected a reading with nmi, kWh, readAt and quality');
    }
    const result = validateReading(parsed.data, clock());
    if (!result.valid) {
      store.reject();
      return sendProblem(reply, 422, result.errors.join('; '));
    }
    store.add(parsed.data);
    return reply.code(201).send({ status: 'accepted' });
  });
}