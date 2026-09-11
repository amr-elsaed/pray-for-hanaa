import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const KV_KEY = 'visitor_duas';
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 500;
const MAX_STORED_DUAS = 200;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const duas = await redis.lrange(KV_KEY, 0, -1);
      return res.status(200).json(duas || []);
    }

    if (req.method === 'POST') {
      const { name, message } = req.body || {};

      if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'يرجى كتابة اسمك' });
      }
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'يرجى كتابة دعاءك' });
      }

      const cleanName = sanitize(name, MAX_NAME_LENGTH);
      const cleanMessage = sanitize(message, MAX_MESSAGE_LENGTH);

      if (!cleanName || !cleanMessage) {
        return res.status(400).json({ error: 'يرجى كتابة بيانات صحيحة' });
      }

      const dua = {
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
        name: cleanName,
        message: cleanMessage,
        createdAt: new Date().toISOString(),
      };

      await redis.lpush(KV_KEY, JSON.stringify(dua));
      await redis.ltrim(KV_KEY, 0, MAX_STORED_DUAS - 1);

      return res.status(201).json(dua);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Visitor Duas API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

function sanitize(str, maxLength) {
  if (typeof str !== 'string') return '';
  let cleaned = str.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  cleaned = cleaned.trim();
  if (cleaned.length > maxLength) cleaned = cleaned.substring(0, maxLength);
  return cleaned;
}
