import { Crisis, Prisma, Save } from '@prisma/client';
import { prisma } from '../utils/prisma.js';
import { advanceMonth } from '../domain/sim/engine.js';

export async function createSave(userId: string, data: { name: string; scenario: string; difficulty: string; seed: number }) {
  const initialCash = data.difficulty === 'sandbox' ? 50_000_000 : data.difficulty === 'hardcore' ? 3_000_000 : 12_000_000;
  const save = await prisma.save.create({ data: { ...data, userId, currentCash: initialCash } });
  const regions = await prisma.region.findMany({ take: 1 });
  if (regions[0]) {
    await prisma.saveRegionExpansion.create({ data: { saveId: save.id, regionId: regions[0].id, marketPenetration: 0.08 } });
  }
  for (const c of ['Stellar Vision', 'NovaWave Media', 'Atlas Broadcast']) {
    await prisma.competitor.create({ data: { saveId: save.id, name: c, strategy: 'balanced', price: 19, quality: 0.65, marketingPower: 0.6, launchesPerYear: 5, marketShare: 0.12 } });
  }
  await prisma.gameState.create({
    data: {
      saveId: save.id,
      month: 1,
      cash: initialCash,
      revenue: 0,
      profit: 0,
      valuation: initialCash * 2,
      reputation: 50,
      quality: 0.55,
      hype: 0.4,
      subscribers: 120000,
      marketShare: 0.08,
      churn: 0.08,
      nps: 12,
      libraryValue: 500000,
      snapshotJson: { notes: 'initial state' }
    }
  });
  return save;
}

async function rollCrises(save: Save, month: number): Promise<Crisis[]> {
  const crisisChance = save.difficulty === 'hardcore' ? 0.45 : save.difficulty === 'sandbox' ? 0.15 : 0.28;
  if (Math.random() > crisisChance) return [];
  const types = ['PR', 'processo', 'vazamento', 'greve', 'boicote', 'falha_streaming', 'review_bombing'];
  const type = types[Math.floor(Math.random() * types.length)];
  const severity = 1 + Math.floor(Math.random() * 5);
  const crisis = await prisma.crisis.create({
    data: {
      saveId: save.id,
      type,
      severity,
      duration: 2 + severity,
      remaining: 2 + severity,
      impactCash: -severity * 120000,
      impactReputation: -severity * 2.3,
      startedMonth: month
    }
  });
  return [crisis];
}

export async function advanceTurn(userId: string, saveId: string) {
  const save = await prisma.save.findFirst({ where: { id: saveId, userId } });
  if (!save) throw new Error('save_not_found');

  const prev = await prisma.gameState.findFirst({ where: { saveId }, orderBy: { month: 'desc' } });
  if (!prev) throw new Error('state_not_found');

  const month = prev.month + 1;
  const campaigns = await prisma.marketingCampaign.findMany({ where: { saveId, active: true } });
  const marketingSpend = campaigns.reduce((acc, c) => acc + c.budget, 0);
  const competitors = await prisma.competitor.findMany({ where: { saveId } });
  const competitorPressure = competitors.reduce((acc, c) => acc + c.marketingPower, 0) / Math.max(1, competitors.length);
  const expansions = await prisma.saveRegionExpansion.findMany({ where: { saveId }, include: { region: true } });
  const regionalDemand = expansions.reduce((acc, r) => acc + r.region.demandIndex * r.marketPenetration, 0);

  const sim = advanceMonth({
    save,
    month,
    cash: prev.cash,
    reputation: prev.reputation,
    quality: prev.quality,
    hype: prev.hype,
    subscribers: prev.subscribers,
    marketShare: prev.marketShare,
    difficulty: save.difficulty as 'sandbox' | 'normal' | 'hardcore',
    avgPrice: 19,
    marketingSpend,
    competitorPressure,
    regionalDemand
  });

  const crises = await rollCrises(save, month);
  const crisisCash = crises.reduce((a, c) => a + c.impactCash, 0);
  const crisisRep = crises.reduce((a, c) => a + c.impactReputation, 0);

  const cash = prev.cash + sim.profit + crisisCash;
  const rep = Math.max(0, sim.reputation + crisisRep);

  await prisma.$transaction([
    prisma.save.update({ where: { id: saveId }, data: { currentMonth: month, currentCash: cash } }),
    prisma.gameState.create({
      data: {
        saveId,
        month,
        cash,
        revenue: sim.revenue,
        profit: sim.profit + crisisCash,
        valuation: sim.valuation,
        reputation: rep,
        quality: sim.quality,
        hype: sim.hype,
        subscribers: sim.subscribers,
        marketShare: sim.marketShare,
        churn: sim.churn,
        nps: sim.nps,
        libraryValue: prev.libraryValue + sim.revenue * 0.05,
        snapshotJson: { crises: crises.length }
      }
    }),
    prisma.transaction.create({ data: { saveId, month, category: 'receita', amount: sim.revenue, description: 'Receita consolidada mensal' } }),
    prisma.transaction.create({ data: { saveId, month, category: 'custos', amount: -sim.costs, description: 'Custos operacionais e produção' } }),
    prisma.eventLog.create({ data: { saveId, month, type: 'turn', severity: 1, message: `Mês ${month} avançado`, metadata: { profit: sim.profit } } }),
    ...crises.map((c) => prisma.eventLog.create({ data: { saveId, month, type: 'crise', severity: c.severity, message: `Crise: ${c.type}`, metadata: { crisisId: c.id } } }))
  ] as Prisma.PrismaPromise<unknown>[]);

  return { month, cash, sim, crises };
}
