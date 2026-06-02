export const DEFAULT_ANTHROPIC_MODEL = "claude-sonnet-4-6";

export function getAnthropicModel(model = process.env.ANTHROPIC_MODEL): string {
  return model || DEFAULT_ANTHROPIC_MODEL;
}
