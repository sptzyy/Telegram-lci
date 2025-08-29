import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const tokenJwt = auth.split(' ')[1];
  let decoded;
  try { decoded = jwt.verify(tokenJwt, process.env.JWT_SECRET); } catch { return res.status(401).json({ error: 'Token invalid' }); }

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token bot diperlukan' });

  // simpan token
  await prisma.botToken.create({ data: { token, userId: decoded.userId } });
  await prisma.log.create({ data: { message: 'Bot dimulai', action: 'START_BOT', userId: decoded.userId } });

  // set webhook ke /api/webhook (single endpoint)
  const webhookUrl = `https://${process.env.VERCEL_URL}/api/webhook`;
  const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
  try {
    const r = await fetch(url);
    const j = await r.json();
    return res.json({ message: 'Bot dijalankan', data: j });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}