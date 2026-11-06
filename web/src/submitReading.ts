import { MeterApiClient } from '../../generated/meter-api-client.js';
import type { ApiReading } from '../../generated/meter-api-client.js';

export function submitReading(reading: ApiReading, client = new MeterApiClient()): Promise<boolean> {
  return client.validateReading(reading);
}