import { calculateTariff, defaultRates } from './calculateTariff.js';
import type { QuoteBreakdown, QuoteInput, TariffRates } from './types.js';

function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateQuote(input: QuoteInput, rates: TariffRates = defaultRates): QuoteBreakdown {
  const exportKwh = input.exportKwh ?? 0;
  const feedInRate = rates.feedInRateCentsPerKwh ?? 0;
  if (!Number.isFinite(exportKwh) || exportKwh < 0) {
    throw new RangeError('A quote requires non-negative export energy');
  }
  if (!Number.isFinite(feedInRate) || feedInRate < 0) {
    throw new RangeError('The feed-in rate must be finite and non-negative');
  }

  const amount = calculateTariff(input, rates);
  const feedInCredit = Math.min(roundToCents(exportKwh * feedInRate), amount);
  return { amount, feedInCredit, netAmount: roundToCents(amount - feedInCredit) };
}