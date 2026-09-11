import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const KV_KEY = 'visitor_duas';
const MAX_NAME_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 500;
const MAX_STORED_DUAS = 200;

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    }

    if (req.method === 'POST') {
      return await handlePost(req, res);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Visitor Duas API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/visitor-duas — returns all visitor du'as (newest first)
 */
async function handleGet(req, res) {
  const duas = await redis.lrange(KV_KEY, 0, -1);
  return res.status(200).json(duas || []);
}

/**
 * POST /api/visitor-duas — add a new visitor du'a
 * Body: { "name": "عمرو", "message": "اللهم ارحمها" }
 */
async function handlePost(req, res) {
  const { name, message } = req.body || {};

  // Validate name
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'يرجى كتابة اسمك' });
  }

  // Validate message
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'يرجى كتابة دعاءك' });
  }

  // Sanitize
  const cleanName = sanitize(name, MAX_NAME_LENGTH);
  const cleanMessage = sanitize(message, MAX_MESSAGE_LENGTH);

  if (!cleanName || !cleanMessage) {
    return res.status(400).json({ error: 'يرجى كتابة بيانات صحيحة' });
  }

  // Create dua entry
  const dua = {
    id: generateId(),
    name: cleanName,
    message: cleanMessage,
    createdAt: new Date().toISOString(),
  };

  // Push to front of list (newest first)
  await redis.lpush(KV_KEY, JSON.stringify(dua));

  // Trim list to max size to prevent unbounded growth
  await redis.ltrim(KV_KEY, 0, MAX_STORED_DUAS - 1);

  return res.status(201).json(dua);
}

/**
 * Sanitize input: trim, limit length, remove control characters
 */
function sanitize(str, maxLength) {
  if (typeof str !== 'string') return '';
  let cleaned = str.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, '');
  cleaned = cleaned.trim();
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }
  return cleaned;
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}
