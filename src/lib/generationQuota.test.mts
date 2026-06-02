import assert from "node:assert/strict";
import test from "node:test";
import {
  GENERATION_QUOTA_LIMIT,
  GENERATION_QUOTA_WINDOW_MS,
  checkGenerationQuota,
} from "./generationQuota.ts";

const secret = "test-secret";

test("allows a new visitor and returns a quota cookie", () => {
  const result = checkGenerationQuota({
    cookieValue: undefined,
    secret,
    now: 1_000,
  });

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, GENERATION_QUOTA_LIMIT - 1);
  assert.match(result.cookie, /^ey/);
});

test("blocks a visitor after the daily generations in the rolling window", () => {
  let cookie: string | undefined;

  for (let i = 0; i < GENERATION_QUOTA_LIMIT; i += 1) {
    const result = checkGenerationQuota({
      cookieValue: cookie,
      secret,
      now: 100_000 + i,
    });
    assert.equal(result.allowed, true);
    cookie = result.cookie;
  }

  const blocked = checkGenerationQuota({
    cookieValue: cookie,
    secret,
    now: 100_000 + GENERATION_QUOTA_LIMIT,
  });

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.cookie, cookie);
});

test("resets quota after the window rolls off", () => {
  let cookie: string | undefined;

  for (let i = 0; i < GENERATION_QUOTA_LIMIT; i += 1) {
    const result = checkGenerationQuota({
      cookieValue: cookie,
      secret,
      now: 200_000 + i,
    });
    cookie = result.cookie;
  }

  const result = checkGenerationQuota({
    cookieValue: cookie,
    secret,
    now: 200_000 + GENERATION_QUOTA_WINDOW_MS + GENERATION_QUOTA_LIMIT + 1,
  });

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, GENERATION_QUOTA_LIMIT - 1);
});

test("ignores forged quota cookies", () => {
  const result = checkGenerationQuota({
    cookieValue:
      "eyJ2IjoxLCJ2aXNpdG9ySWQiOiJ2aXNpdG9yIiwiYXR0ZW1wdHMiOlsxLDIsM119.fake-signature",
    secret,
    now: 10_000,
  });

  assert.equal(result.allowed, true);
  assert.equal(result.remaining, GENERATION_QUOTA_LIMIT - 1);
});
