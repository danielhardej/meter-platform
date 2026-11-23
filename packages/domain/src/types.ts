export type QualityFlag = 'A' | 'E' | 'S';

export interface Reading {
  nmi: string;
  kWh: number;
  readAt: string;
  quality: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

export interface TariffRates {
  peakCentsPerKwh: number;
  offPeakCentsPerKwh: number;
  feedInRateCentsPerKwh?: number;
}

export interface QuoteInput {
  kWh: number;
  exportKwh?: number | undefined;
  readAt: string;
}

export interface QuoteBreakdown {
  amount: number;
  feedInCredit: number;
  netAmount: number;
}