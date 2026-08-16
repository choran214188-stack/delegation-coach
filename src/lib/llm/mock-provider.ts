import type { CompletionRequest, LlmProvider } from "./provider";
import { DEVELOPMENT_LEVELS, type DevelopmentLevel } from "@/config/blanchard";
import type { DiagnosisResult } from "@/types/diagnosis";

/**
 * API Key 가 없을 때 동작하는 Mock Provider.
 *
 * 실제 LLM 대신 간단한 키워드 규칙으로 발달수준을 추정한다.
 * 배포 직후 키 없이도 화면 흐름을 확인할 수 있게 하려는 용도이며,
 * 정식 진단 품질은 Anthropic 키를 넣었을 때 나온다.
 */
export class MockProvider implements LlmProvider {
  readonly name = "mock";
  readonly isMock = true;

  async complete({ messages }: CompletionRequest): Promise<string> {
    const userText = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join("\n")
      .toLowerCase();

    const level = guessLevel(userText);
    const info = DEVELOPMENT_LEVELS[level];
    const result: DiagnosisResult = {
      developmentLevel: level,
      leadershipStyle: info.recommendedStyle,
      competenceReading: `입력 내용에서 역량은 '${info.competence}' 수준으로 보입니다. (예시 분석)`,
      commitmentReading: `의욕·헌신은 '${info.commitment}' 수준으로 보입니다. (예시 분석)`,
      summary: `${info.name}(${level})으로 추정됩니다. ${info.description} 이 결과는 API 키가 없어 예시(Mock)로 생성된 것으로, 실제 분석 품질은 Anthropic 키를 설정하면 나옵니다.`,
      supportActions: MOCK_ACTIONS[level],
      watchOuts: MOCK_WATCHOUTS[level],
      openingLine: MOCK_OPENINGS[level],
    };
    return JSON.stringify(result);
  }
}

function guessLevel(text: string): DevelopmentLevel {
  const has = (words: string[]) => words.some((w) => text.includes(w));

  // 좌절/번아웃 신호 → D2
  if (has(["지쳐", "번아웃", "자신감이 없", "좌절", "실수", "힘들어", "포기", "의욕이 없", "동기부여"])) {
    return "D2";
  }
  // 신입/처음 + 의욕 → D1
  if (has(["신입", "처음", "입사", "배우고", "열정", "의욕이 높", "새로 왔", "주니어"])) {
    return "D1";
  }
  // 베테랑/능숙/자율 → D4
  if (has(["베테랑", "능숙", "알아서", "믿고 맡", "전문가", "리드", "주도적", "10년", "시니어"])) {
    return "D4";
  }
  // 잘하지만 불안/확신 부족 → D3
  if (has(["잘하는데", "불안", "확신이 없", "머뭇", "완벽주의", "부담", "눈치"])) {
    return "D3";
  }
  return "D3";
}

const MOCK_ACTIONS: Record<DevelopmentLevel, string[]> = {
  D1: [
    "업무의 목표·방법·기한을 구체적으로 문서/예시로 알려주기",
    "작은 단위로 쪼개서 첫 단계부터 함께 시작하기",
    "중간 점검 시점을 미리 정해 자주 확인하기",
  ],
  D2: [
    "왜 이 일이 중요한지 맥락과 큰 그림을 다시 설명하기",
    "잘한 점을 먼저 인정하고 감정·어려움을 들어주기",
    "방향은 계속 제시하되 함께 문제를 풀어가며 자신감 회복 돕기",
  ],
  D3: [
    "결정 권한을 넘기고 '어떻게 하고 싶은지' 먼저 물어보기",
    "잘하고 있다는 점을 구체적으로 인정하고 격려하기",
    "지시보다 경청·질문 중심으로 옆에서 지지하기",
  ],
  D4: [
    "목표와 권한을 명확히 위임하고 방법은 맡기기",
    "필요할 때만 개입하고 평소엔 결과로 소통하기",
    "성과를 인정하고 더 큰 도전 기회를 제안하기",
  ],
};

const MOCK_WATCHOUTS: Record<DevelopmentLevel, string[]> = {
  D1: ["의욕이 높다고 바로 전권 위임하면 방향을 잃기 쉽습니다.", "지나친 방임은 초기 실수를 키웁니다."],
  D2: ["이 구간에서 방치하면 이탈로 이어지기 쉽습니다.", "질책·압박보다 지원이 먼저입니다."],
  D3: ["세세한 지시는 오히려 자율성과 신뢰를 떨어뜨립니다.", "확신 부족을 능력 부족으로 오해하지 마세요."],
  D4: ["과도한 확인·간섭은 동기를 떨어뜨립니다.", "완전 방치가 아니라 신뢰 기반의 소통은 유지하세요."],
};

const MOCK_OPENINGS: Record<DevelopmentLevel, string> = {
  D1: "이번 일 처음이라 낯설 텐데, 목표랑 첫 단계부터 같이 정리해볼까요?",
  D2: "요즘 이 업무가 생각보다 만만치 않죠. 어떤 부분이 제일 부담되는지 편하게 말해줄래요?",
  D3: "이 부분은 충분히 잘 해내고 있어요. 어떻게 진행하고 싶은지 먼저 들어보고 싶어요.",
  D4: "이 건은 목표만 공유하고 방식은 믿고 맡길게요. 필요할 때 편하게 얘기해요.",
};
