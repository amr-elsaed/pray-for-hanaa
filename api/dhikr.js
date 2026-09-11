import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const DHIKR_KEYS = ['subhanallah', 'alhamdulillah', 'astaghfirullah', 'lahawla'];

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
    console.error('Dhikr API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/dhikr — returns all dhikr counts
 */
async function handleGet(req, res) {
  const counts = {};

  // Fetch all counts in parallel
  const results = await Promise.all(
    DHIKR_KEYS.map((key) => redis.get(`dhikr:${key}`))
  );

  DHIKR_KEYS.forEach((key, i) => {
    counts[key] = results[i] || 0;
  });

  return res.status(200).json(counts);
}

/**
 * POST /api/dhikr — increment a specific dhikr counter
 * Body: { "key": "subhanallah" }
 */
async function handlePost(req, res) {
  const { key } = req.body || {};

  if (!key || !DHIKR_KEYS.includes(key)) {
    return res.status(400).json({
      error: 'Invalid key. Must be one of: ' + DHIKR_KEYS.join(', '),
    });
  }

  // Atomic increment — no race conditions
  const newCount = await redis.incr(`dhikr:${key}`);

  // Return all counts for convenience
  const counts = {};
  const results = await Promise.all(
    DHIKR_KEYS.map((k) => (k === key ? Promise.resolve(newCount) : redis.get(`dhikr:${k}`)))
  );

  DHIKR_KEYS.forEach((k, i) => {
    counts[k] = results[i] || 0;
  });

  return res.status(200).json(counts);
}
