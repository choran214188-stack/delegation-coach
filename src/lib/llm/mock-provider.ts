import type { CompletionRequest, LlmProvider } from "./provider";
import { DEVELOPMENT_LEVELS, type DevelopmentLevel } from "@/config/blanchard";
import type {
  DelegationPlan,
  DevelopmentSignals,
  DiagnosisResult,
  SupportiveApproach,
} from "@/types/diagnosis";

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
      confidence: "보통",
      confidenceNote:
        "키워드 기반 예시 판정이라 확신도는 '보통'입니다. API 키를 설정하면 입력 근거로 정밀하게 판단합니다.",
      summary: `${info.name}(${level})으로 추정됩니다. ${info.description} 이 결과는 API 키가 없어 예시(Mock)로 생성된 것으로, 실제 분석 품질은 키를 설정하면 나옵니다.`,
      supportActions: MOCK_ACTIONS[level],
      watchOuts: MOCK_WATCHOUTS[level],
      delegationPlan: MOCK_PLANS[level],
      developmentSignals: MOCK_SIGNALS[level],
      supportiveApproach: MOCK_SUPPORT[level],
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
    expectedOutcome: "방법과 절차까지 구체화합니다. 어떤 결과를 언제까지 어떻게 낼지, 세부 기준과 프로세스를 제시하세요.",
    authorityScope: "정해진 범위 내에서 실행하게 합니다. 선택권은 최소화하고, 중요한 결정은 부서장이 수행합니다.",
    checkInMethod: "짧은 주기로 자주 확인합니다. 진행 상황을 수시로 체크하고 즉시 피드백·방향 재조정을 해줍니다.",
    supportRequestCriteria: "즉시 개입이 필요한 경우 요청하게 합니다. 방법을 몰라 진행이 어려울 때, 오류나 위험 징후가 보일 때.",
  },
  D2: {
    expectedOutcome: "작은 목표를 설정하고 단계를 제시합니다. 핵심 결과를 단계별로 구체화하고 달성 기준을 명확히 하세요.",
    authorityScope: "일부 선택권은 부여하되 중요 결정은 협의합니다. 작은 의사결정 권한을 주고 주요 의사결정은 함께 논의합니다.",
    checkInMethod: "단계별 점검과 과정 피드백. 중간 점검으로 진행을 확인하고 과정 중심의 피드백을 제공합니다.",
    supportRequestCriteria: "코칭이 필요한 경우 요청하게 합니다. 진행이 정체되거나 실패가 반복될 때, 동기·자신감이 낮아질 때.",
  },
  D3: {
    expectedOutcome: "결과 기준은 명확히 제시합니다. 최종 결과와 기준은 합의하고, 방법과 과정은 자율에 맡기세요.",
    authorityScope: "대부분 자율로 결정하게 합니다. 폭넓은 판단·결정 권한을 부여하고 주요 이슈만 사전/사후 협의합니다.",
    checkInMethod: "주요 마일스톤 중심으로 확인합니다. 핵심 일정·성과 지점에서 점검하고 필요 시 피드백·방향을 논의합니다.",
    supportRequestCriteria: "지원이 필요한 경우 요청하게 합니다. 의사결정이 어렵거나 확신이 없을 때, 자원·협업·우선순위 조정이 필요할 때.",
  },
  D4: {
    expectedOutcome: "핵심 결과와 기준만 합의합니다. 최종 결과와 방향만 설정하고 세부 방법은 전적으로 자율에 맡기세요.",
    authorityScope: "폭넓은 판단·의사결정 권한을 부여합니다. 결과 달성을 위한 결정 권한을 주고 리더 승인은 예외적인 경우만 둡니다.",
    checkInMethod: "결과 중심으로 확인합니다. 중간 개입은 최소화하고 최종 결과와 성과로 평가합니다.",
    supportRequestCriteria: "리더 개입이 필요한 경우 요청하게 합니다. 구성원이 도움을 요청할 때, 중대한 리스크나 방향 이탈이 있을 때.",
  },
};

const MOCK_SIGNALS: Record<DevelopmentLevel, DevelopmentSignals> = {
  D1: {
    levelUp: ["기본 절차를 스스로 처리하기 시작함", "먼저 방법을 제안해 옴"],
    warning: ["같은 질문을 반복하거나 진행이 멈춤", "의욕은 있으나 방향을 자주 잃음"],
  },
  D2: {
    levelUp: ["다시 자신감을 회복하고 스스로 시도함", "막혀도 먼저 해결책을 들고 옴"],
    warning: ["이탈 신호(회피·침묵)가 보임", "실패가 반복되며 동기가 더 떨어짐"],
  },
  D3: {
    levelUp: ["확신을 갖고 스스로 결정·완수함", "도움 요청이 눈에 띄게 줄어듦"],
    warning: ["결정을 자꾸 미루거나 확인받으려 함", "부담되는 이슈에서 위축됨"],
  },
  D4: {
    levelUp: ["더 큰 범위·난도의 일을 자원함", "다른 사람을 이끌기 시작함"],
    warning: ["결과 품질이 떨어지거나 방향을 이탈함", "혼자 끌어안고 리스크를 늦게 공유함"],
  },
};

const MOCK_SUPPORT: Record<DevelopmentLevel, SupportiveApproach> = {
  D1: {
    listen: "어떤 부분이 가장 헷갈려요? 어려운 지점부터 같이 짚어봐요.",
    decide: "우선 방향은 제가 잡을게요. 대신 해보다가 느낀 점은 바로 말해주세요.",
    recognize: "지금처럼 하나씩 해내고 있어요. 이 속도면 충분히 잘 할 수 있어요.",
    grow: "이번엔 제가 같이 갈게요. 익숙해지면 다음엔 직접 해보는 걸로 해요.",
  },
  D2: {
    listen: "지금 가장 막히는 게 뭐예요? 왜 어렵게 느껴지는지 같이 풀어봐요.",
    decide: "본인 생각엔 어떤 방법이 나아 보여요? 그 방향으로 한번 가봅시다.",
    recognize: "여기까지 해낸 것만 봐도 충분히 가능성이 보여요.",
    grow: "초안은 직접 잡아보고, 막히는 부분은 제가 같이 도울게요.",
  },
  D3: {
    listen: "혹시 망설여지는 지점 있어요? 걸리는 부분 편하게 말해줘요.",
    decide: "이 건은 본인 판단을 중심으로 결정해도 좋을 것 같아요.",
    recognize: "역량은 충분해요. 지금 필요한 건 확신이니 믿고 가봅시다.",
    grow: "방법은 알아서 정해요. 필요한 순간에만 제가 지원할게요.",
  },
  D4: {
    listen: "큰 방향만 한번 맞춰볼까요? 실행은 본인 판단대로 가면 돼요.",
    decide: "핵심 결과와 일정만 합의하고, 세부 실행은 직접 주도해 주세요.",
    recognize: "결과뿐 아니라 그 과정의 판단도 신뢰해요.",
    grow: "자원이나 도움이 필요할 때만 알려줘요. 바로 지원할게요.",
  },
};
