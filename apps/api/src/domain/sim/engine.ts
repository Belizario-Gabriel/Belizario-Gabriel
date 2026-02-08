import { Save } from '@prisma/client';

export type SimInput = {
  save: Save;
  month: number;
  cash: number;
  reputation: number;
  quality: number;
  hype: number;
  subscribers: number;
  marketShare: number;
  difficulty: 'sandbox' | 'normal' | 'hardcore';
  avgPrice: number;
  marketingSpend: number;
  competitorPressure: number;
  regionalDemand: number;
};

export type SimOutput = {
  churn: number;
  growth: number;
  revenue: number;
  costs: number;
  profit: number;
  valuation: number;
  nps: number;
  marketShare: number;
  subscribers: number;
  reputation: number;
  quality: number;
  hype: number;
};

const mulberry32 = (seed: number) => () => {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export function advanceMonth(input: SimInput): SimOutput {
  const rng = mulberry32(input.save.seed + input.month);
  const diffMult = input.difficulty === 'sandbox' ? 0.6 : input.difficulty === 'hardcore' ? 1.4 : 1;

  // churn sobe com preço alto + baixa qualidade + concorrência
  const churn = Math.max(0.01, Math.min(0.35, (input.avgPrice * 0.015 + (1 - input.quality) * 0.12 + input.competitorPressure * 0.1) * diffMult));

  // crescimento aumenta por hype + qualidade + marketing + demanda regional
  const growth = Math.max(0, (input.hype * 0.08 + input.quality * 0.1 + Math.log10(input.marketingSpend + 1) * 0.03 + input.regionalDemand * 0.05) - churn * 0.6);

  const deltaSubs = Math.floor(input.subscribers * growth - input.subscribers * churn + (rng() - 0.5) * 5000);
  const subscribers = Math.max(1000, input.subscribers + deltaSubs);
  const revenue = subscribers * input.avgPrice + input.marketingSpend * 0.2 + input.marketShare * 200000;

  const costs = input.marketingSpend + subscribers * 1.2 + 350000 * diffMult;
  const profit = revenue - costs;

  // market share: diferencial preço x qualidade x catálogo(aprox por hype) x marketing
  const marketShare = Math.max(0.01, Math.min(0.8, input.marketShare + (input.quality - input.avgPrice * 0.03 + input.hype * 0.04 + Math.log10(input.marketingSpend + 1) * 0.02 - input.competitorPressure * 0.04) * 0.05));

  const reputation = Math.max(0, Math.min(100, input.reputation + profit / 1_000_000 + (rng() - 0.5) * 3));
  const quality = Math.max(0.1, Math.min(1, input.quality + (rng() - 0.5) * 0.04 + 0.01));
  const hype = Math.max(0.05, Math.min(1.5, input.hype * 0.92 + Math.log10(input.marketingSpend + 10) * 0.08));

  const annualizedRevenue = revenue * 12;
  const growthAdj = 1 + growth * 2;
  const riskAdj = 1 - churn * 0.8;
  // valuation = múltiplo * receita anualizada ajustada por crescimento/risco
  const valuation = annualizedRevenue * 2.8 * growthAdj * Math.max(0.3, riskAdj);

  const nps = Math.max(-100, Math.min(100, 60 * quality - 140 * churn + 20));

  return { churn, growth, revenue, costs, profit, valuation, nps, marketShare, subscribers, reputation, quality, hype };
}
