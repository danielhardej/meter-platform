import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';
import { registerBuiltUi } from './serveUi.js';

const app = buildApp();
registerBuiltUi(app, fileURLToPath(new URL('../../ui/', import.meta.url)));
await app.listen({ host: '127.0.0.1', port: 3000 });