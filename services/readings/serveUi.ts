import { existsSync } from 'node:fs';
import { join } from 'node:path';
import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

export function registerBuiltUi(app: FastifyInstance, root: string): boolean {
  if (!existsSync(join(root, 'index.html'))) {
    return false;
  }

  void app.register(fastifyStatic, {
    root,
    wildcard: false,
    index: ['index.html'],
  });
  return true;
}