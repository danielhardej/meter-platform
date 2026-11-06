import type { Reading } from '../../packages/domain/src/index.js';

export class ReadingStore {
  private readonly readings: Reading[] = [];
  readonly metrics = new Map<string, number>();

  add(reading: Reading): void {
    this.readings.push({ ...reading });
  }

  all(): Reading[] {
    return this.readings.map((reading) => ({ ...reading }));
  }

  reject(count = 1): void {
    const metric = 'validateReading.rejected';
    this.metrics.set(metric, (this.metrics.get(metric) ?? 0) + count);
  }
}