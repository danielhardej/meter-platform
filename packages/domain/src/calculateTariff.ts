import type { Reading, TariffRates } from './types.js';

const defaultRates: TariffRates = { peakCentsPerKwh: 32, offPeakCentsPerKwh: 18 };

function applyTimeOfUseRates(reading: Pick<Reading, 'kWh' | 'readAt'>, rates: TariffRates): number {
  const hour = new Date(reading.readAt).getUTCHours();
  const rate = hour >= 7 && hour < 22 ? rates.peakCentsPerKwh : rates.offPeakCentsPerKwh;
  return reading.kWh * rate / 100;
}

function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateTariff(
  reading: Pick<Reading, 'kWh' | 'readAt'>,
  rates: TariffRates = defaultRates,
): number {
  if (!Number.isFinite(reading.kWh) || reading.kWh < 0 || !Number.isFinite(Date.parse(reading.readAt))) {
    throw new RangeError('A tariff requires non-negative usage and a valid timestamp');
  }
  if (![rates.peakCentsPerKwh, rates.offPeakCentsPerKwh].every((rate) => Number.isFinite(rate) && rate >= 0)) {
    throw new RangeError('Tariff rates must be finite and non-negative');
  }
  return roundToCents(applyTimeOfUseRates(reading, rates));
}