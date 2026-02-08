import { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/jwt.js';

export type AuthedRequest = Request & { userId?: string };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const raw = req.headers.authorization;
  const token = raw?.startsWith('Bearer ') ? raw.slice(7) : undefined;
  if (!token) return res.status(401).json({ error: 'unauthorized' });
  try {
    req.userId = verifyToken(token).userId;
    next();
  } catch {
    res.status(401).json({ error: 'invalid_token' });
  }
}
