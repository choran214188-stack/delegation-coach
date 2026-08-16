import { AnthropicProvider } from "./anthropic-provider";
import { MockProvider } from "./mock-provider";
import type { LlmProvider } from "./provider";

/**
 * 환경변수 기준으로 Provider 를 선택한다.
 *
 *   - LLM_PROVIDER (anthropic | mock)  — 명시하지 않으면 키 존재로 자동 판별
 *   - ANTHROPIC_API_KEY / ANTHROPIC_MODEL (기본 claude-sonnet-5)
 *
 * 사용할 수 있는 키가 없으면 Mock 으로 동작한다. (배포 직후 키 없이도 화면 확인 가능)
 */
export function getProvider(): LlmProvider {
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const model = process.env.ANTHROPIC_MODEL?.trim() || undefined;
  const providerName = (process.env.LLM_PROVIDER || "").toLowerCase();

  if (providerName === "mock") return new MockProvider();
  if (providerName === "anthropic") {
    return anthropicKey ? new AnthropicProvider(anthropicKey, model) : new MockProvider();
  }

  // provider 미지정: 키가 있으면 anthropic, 없으면 mock
  return anthropicKey ? new AnthropicProvider(anthropicKey, model) : new MockProvider();
}

export * from "./provider";
