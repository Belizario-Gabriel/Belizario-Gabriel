import express from 'express';
import cors from 'cors';
import { router } from './routes/index.js';

export const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', router);
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: err instanceof Error ? err.message : 'unknown_error' });
});
