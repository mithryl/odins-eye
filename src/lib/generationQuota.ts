import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

export const GENERATION_QUOTA_COOKIE = "odins-eye-generation-quota";
export const GENERATION_QUOTA_LIMIT = 3;
export const GENERATION_QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;

type QuotaPayload = {
  v: 1;
  visitorId: string;
  attempts: number[];
};

type QuotaResult = {
  allowed: boolean;
  remaining: number;
  cookie: string;
  resetAt: number;
};

type CheckQuotaOptions = {
  cookieValue: string | undefined;
  secret?: string;
  now?: number;
};

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function signaturesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  return left.length === right.length && timingSafeEqual(left, right);
}

function parseQuotaCookie(cookieValue: string | undefined, secret: string): QuotaPayload | null {
  if (!cookieValue) return null;

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature) return null;
  if (!signaturesMatch(signature, signPayload(payload, secret))) return null;

  try {
    const parsed = JSON.parse(base64UrlDecode(payload)) as Partial<QuotaPayload>;
    if (parsed.v !== 1 || typeof parsed.visitorId !== "string" || !Array.isArray(parsed.attempts)) {
      return null;
    }

    return {
      v: 1,
      visitorId: parsed.visitorId,
      attempts: parsed.attempts.filter((value) => Number.isFinite(value)),
    };
  } catch {
    return null;
  }
}

function serializeQuotaCookie(payload: QuotaPayload, secret: string): string {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

function getSigningSecret(secret: string | undefined): string {
  const signingSecret = secret || process.env.GENERATION_QUOTA_SECRET || process.env.ANTHROPIC_API_KEY;
  if (!signingSecret) {
    throw new Error("GENERATION_QUOTA_SECRET or ANTHROPIC_API_KEY must be configured");
  }

  return signingSecret;
}

function createPayload(): QuotaPayload {
  return {
    v: 1,
    visitorId: randomUUID(),
    attempts: [],
  };
}

export function checkGenerationQuota({
  cookieValue,
  secret,
  now = Date.now(),
}: CheckQuotaOptions): QuotaResult {
  const signingSecret = getSigningSecret(secret);
  const windowStart = now - GENERATION_QUOTA_WINDOW_MS;
  const payload = parseQuotaCookie(cookieValue, signingSecret) || createPayload();
  const attempts = payload.attempts.filter((attempt) => attempt > windowStart);
  const resetAt = attempts[0] ? attempts[0] + GENERATION_QUOTA_WINDOW_MS : now + GENERATION_QUOTA_WINDOW_MS;

  if (attempts.length >= GENERATION_QUOTA_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      cookie: serializeQuotaCookie({ ...payload, attempts }, signingSecret),
      resetAt,
    };
  }

  const nextAttempts = [...attempts, now];

  return {
    allowed: true,
    remaining: GENERATION_QUOTA_LIMIT - nextAttempts.length,
    cookie: serializeQuotaCookie({ ...payload, attempts: nextAttempts }, signingSecret),
    resetAt: nextAttempts[0] + GENERATION_QUOTA_WINDOW_MS,
  };
}
