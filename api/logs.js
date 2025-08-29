import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const tokenJwt = auth.split(' ')[1];
  let decoded;
  try { decoded = jwt.verify(tokenJwt, process.env.JWT_SECRET); } catch { return res.status(401).json({ error: 'Token invalid' }); }

  const logs = await prisma.log.findMany({ where: { userId: decoded.userId }, orderBy: { createdAt: 'desc' } });
  return res.json(logs);
}