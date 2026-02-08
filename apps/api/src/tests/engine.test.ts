import { describe, expect, it } from 'vitest';
import { advanceMonth } from '../domain/sim/engine.js';

describe('sim engine', () => {
  it('is deterministic for same seed/month', () => {
    const input: any = {
      save: { seed: 42 },
      month: 2,
      cash: 1000000,
      reputation: 40,
      quality: 0.6,
      hype: 0.5,
      subscribers: 100000,
      marketShare: 0.1,
      difficulty: 'normal',
      avgPrice: 20,
      marketingSpend: 300000,
      competitorPressure: 0.6,
      regionalDemand: 0.4
    };
    expect(advanceMonth(input)).toEqual(advanceMonth(input));
  });
});
