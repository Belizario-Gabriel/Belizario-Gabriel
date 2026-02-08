import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.region.createMany({
    data: [
      { name: 'América do Norte', demandIndex: 1.2, taxRate: 0.28, operatingCost: 1.1, regulationRisk: 0.1 },
      { name: 'América Latina', demandIndex: 0.9, taxRate: 0.2, operatingCost: 0.7, regulationRisk: 0.18 },
      { name: 'Europa', demandIndex: 1.1, taxRate: 0.31, operatingCost: 1.0, regulationRisk: 0.12 },
      { name: 'Ásia-Pacífico', demandIndex: 1.3, taxRate: 0.24, operatingCost: 0.9, regulationRisk: 0.2 }
    ],
    skipDuplicates: true
  });

  const techs = [
    ['studio_upgrade', 'Expansão de Estúdios', 2000000, 3, 0.1, 0.08, 0, 0],
    ['cgi_pipeline', 'Pipeline CGI', 1500000, 2, 0.12, 0.05, 0, 0],
    ['recommendation_ai', 'Algoritmo de Recomendação', 2500000, 4, 0, 0, 0.08, 0.14],
    ['streaming_infra', 'Infraestrutura Streaming', 1800000, 3, 0, 0.04, 0.06, 0.05],
    ['marketing_analytics', 'Marketing Analytics', 1000000, 2, 0, 0, 0.02, 0.12],
    ['legal_compliance', 'Jurídico/Compliance', 900000, 2, 0, 0, 0, 0]
  ];

  for (const [key, name, cost, duration, qualityBonus, costReduction, churnReduction, conversionBonus] of techs) {
    await prisma.techTree.upsert({
      where: { key },
      update: {},
      create: {
        key,
        name,
        description: `${name} upgrade`,
        cost,
        duration,
        qualityBonus,
        costReduction,
        churnReduction,
        conversionBonus
      }
    });
  }

  await prisma.ipAsset.createMany({
    data: [
      { name: 'Nebula Rangers', kind: 'HQ', baseValue: 500000, franchisePotential: 0.8 },
      { name: 'Echo City', kind: 'Direitos de Adaptação', baseValue: 800000, franchisePotential: 0.7 },
      { name: 'Moonline Beats', kind: 'Catálogo Musical', baseValue: 350000, franchisePotential: 0.4 }
    ],
    skipDuplicates: true
  });

  await prisma.production.createMany({
    data: [
      { title: 'Projeto Aurora', kind: 'filme', baseDuration: 6, baseRisk: 0.4, genre: 'ficção', audience: 'adulto', baseQuality: 0.7 },
      { title: 'Rua Estelar', kind: 'série', baseDuration: 9, baseRisk: 0.3, genre: 'drama', audience: 'geral', baseQuality: 0.65 }
    ],
    skipDuplicates: true
  });
}

main().finally(() => prisma.$disconnect());
