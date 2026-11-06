import type { FastifyReply } from 'fastify';

export function sendProblem(reply: FastifyReply, status: number, detail: string): FastifyReply {
  return reply.code(status).type('application/problem+json').send({
    type: 'https://meter.example/problems/request-rejected',
    title: status >= 500 ? 'Internal server error' : 'Request rejected',
    status,
    detail,
  });
}