import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body || {};
    if (!username || !password) return res.status(400).json({ error: 'username & password required' });
    const hashed = await bcrypt.hash(password, 10);
    try {
      await prisma.user.create({ data: { username, password: hashed } });
      return res.json({ message: 'User berhasil dibuat' });
    } catch (e) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }
  }
  res.status(405).json({ error: 'Method not allowed' });
}