import { LlmError, type CompletionRequest, type LlmProvider } from "./provider";

const API_URL = "https://api.openai.com/v1/chat/completions";
const MAX_ATTEMPTS = 4; // 최초 1회 + 재시도 3회

type OpenAIChoice = { message?: { content?: string } };
type OpenAIResponse = { choices?: OpenAIChoice[] };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 지수 백오프 + 지터 (attempt: 1,2,3…). 약 0.8s → 1.6s → 3.2s (+무작위). */
function backoffMs(attempt: number): number {
  const base = 800 * 2 ** (attempt - 1);
  return base + Math.floor(Math.random() * 400);
}

/**
 * OpenAI Chat Completions (GPT) provider.
 *
 * - 기본 모델은 gpt-4o-mini. OPENAI_MODEL 로 바꿀 수 있다.
 * - 저가 모델이 JSON 을 삐끗하지 않도록 response_format=json_object 로 강제한다.
 *   (JSON 강제는 프롬프트에 'json' 단어가 있어야 동작 — 진단 프롬프트에 이미 포함됨)
 * - temperature 는 보내지 않는다(일부 신형 모델이 기본값 외 temperature 를 거부).
 * - 동시 사용(예: 교육 현장 30명 동시)에 대비해 429(속도 제한)·5xx·네트워크 오류는
 *   지수 백오프로 자동 재시도한다. Retry-After 헤더가 오면 그 값을 우선 존중한다.
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
    const body = JSON.stringify({
      model: this.model,
      max_tokens: maxTokens ?? 2048,
      messages: [{ role: "system", content: system }, ...messages],
      response_format: { type: "json_object" },
    });

    let lastErr: LlmError = new LlmError("upstream_error", "LLM 응답을 받지 못했습니다.");

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      let response: Response;
      try {
        response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${this.apiKey}`,
          },
          body,
        });
      } catch {
        // 네트워크 오류 → 재시도
        lastErr = new LlmError("network_error", "LLM 서버에 연결하지 못했습니다.");
        if (attempt < MAX_ATTEMPTS) {
          await sleep(backoffMs(attempt));
          continue;
        }
        throw lastErr;
      }

      if (response.ok) {
        const data = (await response.json()) as OpenAIResponse;
        const text = (data.choices?.[0]?.message?.content ?? "").trim();
        if (!text) throw new LlmError("empty_response", "LLM 응답이 비어 있습니다.");
        return text;
      }

      // 429(속도 제한) 또는 5xx(일시 장애)는 재시도, 그 외 4xx 는 즉시 실패
      const retriable = response.status === 429 || response.status >= 500;
      const detail = await response.text().catch(() => "");
      console.error("[openai-provider] request failed", response.status, detail.slice(0, 500));
      lastErr = new LlmError("upstream_error", "LLM 응답을 받지 못했습니다.");

      if (retriable && attempt < MAX_ATTEMPTS) {
        const retryAfter = Number(response.headers.get("retry-after"));
        const wait =
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : backoffMs(attempt);
        await sleep(wait);
        continue;
      }
      throw lastErr;
    }

    throw lastErr;
  }
}
