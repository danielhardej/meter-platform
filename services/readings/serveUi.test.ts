import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import { registerBuiltUi } from './serveUi.js';

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe('registerBuiltUi', () => {
  it('serves a built index without masking API not-found responses', async () => {
    const root = await mkdtemp(join(tmpdir(), 'meter-ui-'));
    directories.push(root);
    await writeFile(join(root, 'index.html'), '<!doctype html><title>Meter Platform</title>');
    const app = buildApp();
    registerBuiltUi(app, root);

    const indexResponse = await app.inject({ method: 'GET', url: '/' });
    const readingsResponse = await app.inject({ method: 'GET', url: '/readings' });

    expect(indexResponse.statusCode).toBe(200);
    expect(indexResponse.body).toContain('Meter Platform');
    expect(readingsResponse.statusCode).toBe(404);
    expect(readingsResponse.headers['content-type']).toContain('application/problem+json');
  });

  it('leaves the API usable when no UI build exists', async () => {
    const app = buildApp();

    expect(registerBuiltUi(app, join(tmpdir(), 'missing-meter-ui'))).toBe(false);
    const response = await app.inject({ method: 'POST', url: '/quotes', payload: { kWh: 2.5, readAt: '2026-11-02T10:00:00Z' } });
    expect(response.statusCode).toBe(200);
  });
});