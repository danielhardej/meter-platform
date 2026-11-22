import { calculateTariff } from './calculateTariff.js';
import type { QuoteBreakdown, QuoteInput } from './types.js';

const feedInCentsPerKwh = 8;

function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateQuote(input: QuoteInput): QuoteBreakdown {
  if (!Number.isFinite(input.exportedKWh) || input.exportedKWh < 0) {
    throw new RangeError('A quote requires non-negative exported energy');
  }

  const amount = calculateTariff(input);
  const feedInCredit = roundToCents(input.exportedKWh * feedInCentsPerKwh / 100);
  return { amount, feedInCredit, netAmount: roundToCents(amount - feedInCredit) };
}