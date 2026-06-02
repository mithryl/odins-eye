import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_ANTHROPIC_MODEL, getAnthropicModel } from "./anthropicModel.ts";

test("uses the supported Sonnet default model", () => {
  assert.equal(DEFAULT_ANTHROPIC_MODEL, "claude-sonnet-4-6");
  assert.equal(getAnthropicModel(undefined), "claude-sonnet-4-6");
});

test("allows the model to be overridden by environment", () => {
  assert.equal(
    getAnthropicModel("claude-sonnet-4-5-20250929"),
    "claude-sonnet-4-5-20250929",
  );
});
