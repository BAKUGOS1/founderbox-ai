import { ApiError } from "@/lib/server/api";

type Bucket = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as unknown as {
  founderBoxRateLimit?: Map<string, Bucket>;
};

const buckets = globalForRateLimit.founderBoxRateLimit ?? new Map<string, Bucket>();
globalForRateLimit.founderBoxRateLimit = buckets;

export function enforceRateLimit(
  request: Request,
  scope: string,
  limit = 60,
  windowMs = 60_000
) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwardedFor || request.headers.get("x-real-ip") || "local";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (bucket.count >= limit) {
    throw new ApiError(429, "Too many requests. Please retry shortly.");
  }

  bucket.count += 1;
}
