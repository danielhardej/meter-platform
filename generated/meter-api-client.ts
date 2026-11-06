// Code generated from openapi.yaml. DO NOT EDIT.

export interface ApiReading {
  nmi: string;
  kWh: number;
  readAt: string;
  quality: 'A' | 'E' | 'S';
}

export class MeterApiClient {
  constructor(private readonly baseUrl = 'https://api.meter.example') {}

  async validateReading(reading: ApiReading): Promise<boolean> {
    const response = await fetch(`${this.baseUrl}/readings/validate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(reading),
    });
    if (!response.ok) {
      throw new Error('Meter API validation failed');
    }
    const result = await response.json() as { valid: boolean };
    return result.valid;
  }
}