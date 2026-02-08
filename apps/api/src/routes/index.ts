import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/prisma.js';
import { signToken } from '../utils/jwt.js';
import { AuthedRequest, requireAuth } from '../middleware/auth.js';
import { advanceTurn, createSave } from '../services/gameService.js';

export const router = Router();

router.post('/auth/register', async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) return res.status(409).json({ error: 'email_exists' });
  const passwordHash = await bcrypt.hash(body.password, 10);
  const user = await prisma.user.create({ data: { email: body.email, passwordHash } });
  res.json({ token: signToken(user.id) });
});

router.post('/auth/login', async (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) return res.status(401).json({ error: 'invalid_credentials' });
  res.json({ token: signToken(user.id) });
});

router.post('/saves', requireAuth, async (req: AuthedRequest, res) => {
  const body = z.object({ name: z.string(), scenario: z.string(), difficulty: z.enum(['sandbox', 'normal', 'hardcore']), seed: z.number().int() }).parse(req.body);
  const save = await createSave(req.userId!, body);
  res.json(save);
});
router.get('/saves', requireAuth, async (req: AuthedRequest, res) => {
  res.json(await prisma.save.findMany({ where: { userId: req.userId }, orderBy: { createdAt: 'desc' } }));
});
router.get('/saves/:id', requireAuth, async (req: AuthedRequest, res) => {
  const data = await prisma.save.findFirst({ where: { id: req.params.id, userId: req.userId }, include: { snapshots: { orderBy: { month: 'asc' } } } });
  if (!data) return res.status(404).json({ error: 'not_found' });
  res.json(data);
});
router.post('/saves/:id/load', requireAuth, async (req: AuthedRequest, res) => {
  const save = await prisma.save.findFirst({ where: { id: req.params.id, userId: req.userId } });
  if (!save) return res.status(404).json({ error: 'not_found' });
  const snapshot = await prisma.gameState.findFirst({ where: { saveId: save.id }, orderBy: { month: 'desc' } });
  res.json({ save, snapshot });
});

router.post('/turn/advance', requireAuth, async (req: AuthedRequest, res) => {
  const body = z.object({ saveId: z.string() }).parse(req.body);
  res.json(await advanceTurn(req.userId!, body.saveId));
});

router.post('/productions', requireAuth, async (req: AuthedRequest, res) => {
  const body = z.object({ saveId: z.string(), productionId: z.string(), budget: z.number(), durationMonths: z.number(), risk: z.number(), targetRegions: z.string() }).parse(req.body);
  res.json(await prisma.productionInstance.create({ data: { ...body, stage: 'pré' } }));
});
router.get('/productions', requireAuth, async (req: AuthedRequest, res) => {
  const saveId = String(req.query.saveId);
  res.json(await prisma.productionInstance.findMany({ where: { saveId }, include: { production: true } }));
});

router.post('/employees', requireAuth, async (_req, res) => res.json(await prisma.employee.create({ data: z.object({ saveId: z.string(), name: z.string(), department: z.string(), salary: z.number(), skill: z.number(), productivity: z.number(), morale: z.number() }).parse(_req.body) })));
router.get('/employees', requireAuth, async (req, res) => res.json(await prisma.employee.findMany({ where: { saveId: String(req.query.saveId) } })));

router.post('/campaigns', requireAuth, async (req, res) => res.json(await prisma.marketingCampaign.create({ data: z.object({ saveId: z.string(), channel: z.string(), budget: z.number(), target: z.string(), startedMonth: z.number() }).parse(req.body) })));
router.get('/campaigns', requireAuth, async (req, res) => res.json(await prisma.marketingCampaign.findMany({ where: { saveId: String(req.query.saveId) } })));

router.post('/regions-expansion', requireAuth, async (req, res) => {
  const body = z.object({ saveId: z.string(), regionId: z.string() }).parse(req.body);
  res.json(await prisma.saveRegionExpansion.upsert({ where: { saveId_regionId: { saveId: body.saveId, regionId: body.regionId } }, update: { active: true }, create: { ...body } }));
});
router.get('/regions', requireAuth, async (_req, res) => res.json(await prisma.region.findMany()));

router.get('/dashboards/:saveId', requireAuth, async (req, res) => {
  const snapshots = await prisma.gameState.findMany({ where: { saveId: req.params.saveId }, orderBy: { month: 'asc' } });
  const latest = snapshots.at(-1);
  res.json({ latest, series: snapshots });
});

router.get('/tech', requireAuth, async (req, res) => {
  const saveId = String(req.query.saveId);
  const [techs, queue] = await Promise.all([prisma.techTree.findMany(), prisma.techQueue.findMany({ where: { saveId }, include: { tech: true } })]);
  res.json({ techs, queue });
});
router.post('/tech/queue', requireAuth, async (req, res) => {
  const body = z.object({ saveId: z.string(), techId: z.string(), currentMonth: z.number() }).parse(req.body);
  const tech = await prisma.techTree.findUniqueOrThrow({ where: { id: body.techId } });
  res.json(await prisma.techQueue.create({ data: { saveId: body.saveId, techId: body.techId, startedMonth: body.currentMonth, completesMonth: body.currentMonth + tech.duration } }));
});

router.get('/auctions/current', requireAuth, async (req, res) => {
  const month = Number(req.query.month ?? 1);
  let auctions = await prisma.auction.findMany({ where: { month, status: 'open' }, include: { ipAsset: true } });
  if (!auctions.length) {
    const ips = await prisma.ipAsset.findMany({ where: { ownerSaveId: null }, take: 2 });
    for (const ip of ips) await prisma.auction.create({ data: { month, ipAssetId: ip.id, basePrice: ip.baseValue, highestBid: ip.baseValue } });
    auctions = await prisma.auction.findMany({ where: { month, status: 'open' }, include: { ipAsset: true } });
  }
  res.json(auctions);
});
router.post('/auctions/:id/bid', requireAuth, async (req: AuthedRequest, res) => {
  const body = z.object({ saveId: z.string(), value: z.number() }).parse(req.body);
  const auction = await prisma.auction.findUniqueOrThrow({ where: { id: req.params.id } });
  if (body.value <= auction.highestBid) return res.status(400).json({ error: 'bid_too_low' });
  const updated = await prisma.auction.update({ where: { id: auction.id }, data: { highestBid: body.value, highestBidderSaveId: body.saveId } });
  res.json(updated);
});

router.get('/crises', requireAuth, async (req, res) => res.json(await prisma.crisis.findMany({ where: { saveId: String(req.query.saveId) }, orderBy: { startedMonth: 'desc' } })));
router.post('/crises/:id/respond', requireAuth, async (req, res) => {
  const body = z.object({ option: z.enum(['pay', 'apologize', 'consulting', 'security']) }).parse(req.body);
  const crisis = await prisma.crisis.findUniqueOrThrow({ where: { id: req.params.id } });
  const cost = body.option === 'pay' ? 350000 : body.option === 'consulting' ? 180000 : body.option === 'security' ? 260000 : 60000;
  await prisma.transaction.create({ data: { saveId: crisis.saveId, month: crisis.startedMonth, category: 'crise_resposta', amount: -cost, description: body.option } });
  res.json(await prisma.crisis.update({ where: { id: crisis.id }, data: { status: 'mitigated', remaining: Math.max(0, crisis.remaining - 2) } }));
});

router.get('/reports/:saveId/csv', requireAuth, async (req, res) => {
  const txs = await prisma.transaction.findMany({ where: { saveId: req.params.saveId }, orderBy: [{ month: 'asc' }] });
  const csv = ['month,category,amount,description', ...txs.map((t) => `${t.month},${t.category},${t.amount},"${t.description}"`)].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});
