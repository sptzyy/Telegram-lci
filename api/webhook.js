import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const update = req.body || {};

  try {
    if (update.message) {
      const text = update.message.text || '';
      const from = update.message.from || {};
      const username = from.username || from.first_name || null;
      // NOTE: In this simplified setup we don't map token->bot; logs are saved with userId=1 placeholder
      // For production, map token or use per-bot webhook path.
      const userId = 1;
      await prisma.log.create({ data: { message: text.slice(0, 1000), action: 'MESSAGE', userId } });

      // simple auto-replies for command examples
      const chatId = update.message.chat.id;
      if (text === '/start') {
        await sendMessage(process.env.DUMMY_BOT_TOKEN, chatId, 'Halo! Bot via webhook aktif.');
      } else if (text.startsWith('/echo ')) {
        await sendMessage(process.env.DUMMY_BOT_TOKEN, chatId, text.slice(6));
      } else if (text === '/time') {
        await sendMessage(process.env.DUMMY_BOT_TOKEN, chatId, new Date().toString());
      }
    }
  } catch (e) {
    console.error(e);
  }

  return res.json({ ok: true });
}

async function sendMessage(token, chatId, text) {
  if (!token) return;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: chatId, text }) });
}