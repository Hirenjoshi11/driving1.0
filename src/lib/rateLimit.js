/**
 * In-Memory Sliding Window Rate Limiter for DPDP & Security Endpoints
 * 
 * Supports configurable windowMs and max requests per client key (IP or user ID).
 */

const hitMap = new Map();

/**
 * Checks if a request exceeds rate limits.
 * 
 * @param {string} key - Unique client identifier (IP address, userId, or phone)
 * @param {number} maxRequests - Max permitted requests in the window
 * @param {number} windowMs - Window duration in milliseconds (default: 60s)
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
export function checkRateLimit(key, maxRequests = 10, windowMs = 60 * 1000) {
  const now = Date.now();
  const safeKey = String(key || 'unknown');

  let record = hitMap.get(safeKey);
  if (!record || now > record.resetTime) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    hitMap.set(safeKey, record);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Express / Next.js response helper for 429 Too Many Requests
 */
export function rateLimitExceededResponse(resetTime) {
  const retryAfterSec = Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
  return new Response(
    JSON.stringify({
      error: 'Too many requests. Please slow down and try again shortly.',
      retryAfterSeconds: retryAfterSec,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSec),
      },
    }
  );
}
