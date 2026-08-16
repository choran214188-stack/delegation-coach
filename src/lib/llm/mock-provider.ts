import type { CompletionRequest, LlmProvider } from "./provider";
import { DEVELOPMENT_LEVELS, type DevelopmentLevel } from "@/config/blanchard";
import type { DelegationPlan, DiagnosisResult } from "@/types/diagnosis";

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
      commitmentReading: `의욕·의지는 '${info.commitment}' 수준으로 보입니다. (예시 분석)`,
      summary: `${info.name}(${level})으로 추정됩니다. ${info.description} 이 결과는 API 키가 없어 예시(Mock)로 생성된 것으로, 실제 분석 품질은 Anthropic 키를 설정하면 나옵니다.`,
      supportActions: MOCK_ACTIONS[level],
      watchOuts: MOCK_WATCHOUTS[level],
      delegationPlan: MOCK_PLANS[level],
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

const MOCK_PLANS: Record<DevelopmentLevel, DelegationPlan> = {
  D1: {
    expectedOutcome:
      "완성도 높은 결과보다 기본기 습득과 절차 이해에 무게를 두세요. 첫 사이클은 학습이 성과입니다.",
    authorityScope:
      "정해진 절차·기준 안에서 실행하도록 권한을 좁게 부여합니다. 방향·우선순위 결정은 부서장이 함께 잡아 줍니다.",
    checkInMethod: "짧은 주기(수시~주 2~3회)로 자주 확인하고, 구체적이고 즉각적인 피드백을 줍니다.",
    supportRequestCriteria: "막히거나 확신이 서지 않으면 바로 물어보게 합니다. 혼자 오래 붙들지 않도록 안내하세요.",
  },
  D2: {
    expectedOutcome:
      "성과 자체보다 자신감 회복과 이탈 방지가 우선입니다. 작은 성공 경험을 만들어 주는 것을 목표로 하세요.",
    authorityScope:
      "권한은 조금씩 넓히되 핵심 판단은 함께 결정합니다. 스스로 정할 영역과 함께 정할 영역을 분명히 구분해 주세요.",
    checkInMethod: "정서적 지지가 섞인 코칭형 점검. 진행 상황과 함께 '요즘 어떤지'도 함께 물어봅니다.",
    supportRequestCriteria: "어려움·불안이 쌓이기 전에 공유하도록 합니다. 부정적 신호를 빨리 꺼내는 것을 격려하세요.",
  },
  D3: {
    expectedOutcome:
      "안정적인 완수와 함께 스스로에 대한 확신 회복을 기대합니다. 결과와 자율적 판단 경험을 함께 얻게 하세요.",
    authorityScope: "방법과 실행 권한은 대부분 위임합니다. 조직 차원의 리스크·자원 배분만 확인받게 하세요.",
    checkInMethod: "질문·경청 중심의 지원형 점검. 지시보다 '어떻게 하고 싶은지'를 먼저 듣습니다.",
    supportRequestCriteria: "판단이 갈리거나 의사결정에 확신이 안 설 때 함께 검토하자고 요청하게 합니다.",
  },
  D4: {
    expectedOutcome:
      "높은 자율성 아래 목표 달성은 물론 개선·확장까지 기대할 수 있습니다. 더 큰 책임으로 이어질 성과를 지향하세요.",
    authorityScope: "목표만 합의하고 방법·자원 배분까지 위임합니다. 예외적으로 상위 의사결정만 확인받게 하세요.",
    checkInMethod: "결과 중심의 최소 개입. 정기 결과 공유 외에는 먼저 찾아가지 않습니다.",
    supportRequestCriteria: "중대한 리스크나 상위 의사결정이 걸릴 때만 요청하게 합니다. 평소 실행은 전적으로 맡깁니다.",
  },
};

const MOCK_OPENINGS: Record<DevelopmentLevel, string> = {
  D1: "이번 일 처음이라 낯설 텐데, 목표랑 첫 단계부터 같이 정리해볼까요?",
  D2: "요즘 이 업무가 생각보다 만만치 않죠. 어떤 부분이 제일 부담되는지 편하게 말해줄래요?",
  D3: "이 부분은 충분히 잘 해내고 있어요. 어떻게 진행하고 싶은지 먼저 들어보고 싶어요.",
  D4: "이 건은 목표만 공유하고 방식은 믿고 맡길게요. 필요할 때 편하게 얘기해요.",
};
