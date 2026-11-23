import type { FastifyInstance } from 'fastify';
import type { ReadingStore } from '../store.js';

export function registerReadingsListRoute(app: FastifyInstance, store: ReadingStore): void {
  app.get('/readings', (_request, reply) => reply.send({ readings: store.all().reverse() }));
}