import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validateReadings } from '../../../packages/domain/src/index.js';
import { sendProblem } from '../problem.js';
import type { ReadingStore } from '../store.js';
import { readingSchema } from './reading.js';

const batchSchema = z.object({ readings: z.array(readingSchema).min(1).max(100) }).strict();

export function registerReadingsBatchRoute(app: FastifyInstance, store: ReadingStore, clock: () => Date): void {
  app.post('/readings/batch', (request, reply) => {
    const parsed = batchSchema.safeParse(request.body);
    if (!parsed.success) {
      store.reject();
      return sendProblem(reply, 400, 'Expected between 1 and 100 readings');
    }
    const results = validateReadings(parsed.data.readings, clock());
    const rejected = results.filter((result) => !result.valid).length;
    if (rejected > 0) {
      store.reject(rejected);
      return sendProblem(reply, 422, `${rejected} readings rejected; the batch was not stored`);
    }
    parsed.data.readings.forEach((reading) => store.add(reading));
    return reply.code(201).send({ accepted: parsed.data.readings.length });
  });
}