import { calculateTariff } from '../../packages/domain/src/index.js';
import type { Reading } from '../../packages/domain/src/index.js';

export function tariffPreview(reading: Pick<Reading, 'kWh' | 'readAt'>): string {
  return `AUD ${calculateTariff(reading).toFixed(2)}`;
}