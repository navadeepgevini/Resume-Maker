/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach keyed by client IP.
 *
 * NOTE: This resets on server restart and is per-instance only.
 * For production, use Redis or a distributed store.
 */

const requestCounts = new Map<string, number[]>();

// Prune expired entries every 10 minutes to prevent memory leak
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestCounts.entries()) {
    // Assuming the longest window we use is 60000ms (1 min). We can just keep the ones < 10 mins.
    // Or just clear the map if it's very large, or properly prune.
    // Let's prune timestamps older than 60000ms.
    const recent = timestamps.filter((t) => now - t < 60000);
    if (recent.length === 0) {
      requestCounts.delete(ip);
    } else {
      requestCounts.set(ip, recent);
    }
  }
}, 10 * 60 * 1000).unref?.(); // .unref() prevents setInterval from keeping Node alive if applicable

/**
 * Check whether a request from `ip` is within the allowed rate.
 * Mutates the internal map to record the current timestamp if allowed.
 *
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export function checkRateLimit(
  ip: string,
  maxRequests: number,
  windowMs: number = 60_000,
): boolean {
  const now = Date.now();
  const timestamps = requestCounts.get(ip) ?? [];
  const recent = timestamps.filter((t) => now - t < windowMs);

  if (recent.length >= maxRequests) {
    return false;
  }

  recent.push(now);
  requestCounts.set(ip, recent);
  return true;
}

export function getClientIP(request: Request): string {
  // Use Next.js direct IP property if available (Vercel)
  // @ts-expect-error Next.js headers API compatibility - Some Request implementations have ip
  if (request.ip) return request.ip;

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // Use x-forwarded-for carefully (can be spoofed, but usually proxy appends to end)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    // The most reliable IP is typically the rightmost (added by the last proxy) or leftmost depending on proxy chain
    // In standard environments like Vercel, x-real-ip is preferred anyway.
    return parts[parts.length - 1].trim();
  }

  return 'unknown';
}
