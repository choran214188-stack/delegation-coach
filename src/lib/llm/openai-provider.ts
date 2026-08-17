import { LlmError, type CompletionRequest, type LlmProvider } from "./provider";

const API_URL = "https://api.openai.com/v1/chat/completions";

type OpenAIChoice = { message?: { content?: string } };
type OpenAIResponse = { choices?: OpenAIChoice[] };

/**
 * OpenAI Chat Completions (GPT) provider.
 *
 * - 기본 모델은 가장 저렴한 축인 gpt-4o-mini. OPENAI_MODEL 로 바꿀 수 있다.
 * - 저가 모델이 JSON 을 삐끗하지 않도록 response_format=json_object 로 강제한다.
 *   (JSON 강제는 프롬프트에 'json' 단어가 있어야 동작 — 진단 프롬프트에 이미 포함됨)
 * - temperature 는 보내지 않는다: 일부 신형 모델은 기본값 외 temperature 를 거부하므로,
 *   호환성을 위해 생략한다.
 */
export class OpenAIProvider implements LlmProvider {
  readonly name = "openai";
  readonly isMock = false;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model?: string) {
    this.apiKey = apiKey;
    this.model = model || "gpt-4o-mini";
  }

  async complete({ system, messages, maxTokens }: CompletionRequest): Promise<string> {
    let response: Response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: maxTokens ?? 1500,
          messages: [{ role: "system", content: system }, ...messages],
          response_format: { type: "json_object" },
        }),
      });
    } catch {
      throw new LlmError("network_error", "LLM 서버에 연결하지 못했습니다.");
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("[openai-provider] request failed", response.status, detail.slice(0, 500));
      throw new LlmError("upstream_error", "LLM 응답을 받지 못했습니다.");
    }

    const data = (await response.json()) as OpenAIResponse;
    const text = (data.choices?.[0]?.message?.content ?? "").trim();

    if (!text) throw new LlmError("empty_response", "LLM 응답이 비어 있습니다.");
    return text;
  }
}
