import { AnthropicProvider } from "./anthropic-provider";
import { OpenAIProvider } from "./openai-provider";
import { MockProvider } from "./mock-provider";
import type { LlmProvider } from "./provider";

/**
 * 환경변수 기준으로 Provider 를 선택한다.
 *
 *   - LLM_PROVIDER (openai | anthropic | mock)  — 명시하지 않으면 키 존재로 자동 판별
 *   - OPENAI_API_KEY / OPENAI_MODEL       (기본 gpt-4o-mini)
 *   - ANTHROPIC_API_KEY / ANTHROPIC_MODEL (기본 claude-sonnet-5)
 *
 * provider 미지정 시: OpenAI 키가 있으면 openai, 없고 Anthropic 키가 있으면 anthropic,
 * 둘 다 없으면 예시(Mock) 로 동작한다. (배포 직후 키 없이도 화면 확인 가능)
 */
export function getProvider(): LlmProvider {
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  const anthropicKey = process.env.ANTHROPIC_API_KEY?.trim();
  const providerName = (process.env.LLM_PROVIDER || "").toLowerCase();

  if (providerName === "mock") return new MockProvider();
  if (providerName === "openai") {
    return openaiKey
      ? new OpenAIProvider(openaiKey, process.env.OPENAI_MODEL?.trim() || undefined)
      : new MockProvider();
  }
  if (providerName === "anthropic") {
    return anthropicKey
      ? new AnthropicProvider(anthropicKey, process.env.ANTHROPIC_MODEL?.trim() || undefined)
      : new MockProvider();
  }

  // provider 미지정: 키 자동 감지 (OpenAI → Anthropic → Mock)
  if (openaiKey) return new OpenAIProvider(openaiKey, process.env.OPENAI_MODEL?.trim() || undefined);
  if (anthropicKey)
    return new AnthropicProvider(anthropicKey, process.env.ANTHROPIC_MODEL?.trim() || undefined);
  return new MockProvider();
}

export * from "./provider";
