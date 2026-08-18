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

  const compHigh = has([
    "역량이 있", "역량과", "역량은 있", "지식이 있", "지식은 있", "능력이 있", "잘함", "잘하는",
    "능숙", "베테랑", "전문가", "전문성", "노련", "경험이 많", "10년", "시니어", "숙련", "잘 처리",
  ]);
  const compLow = has([
    "신입", "처음", "입사", "배우고", "새로 왔", "주니어", "해본 적 없", "미숙", "경험이 없", "서툴",
  ]);
  const willHigh = has([
    "의욕이 높", "열정", "의지", "적극", "하고 싶", "동기부여", "동기도", "충분함", "충만",
  ]);
  const willLow = has([
    "지쳐", "번아웃", "자신감이 없", "좌절", "힘들어", "포기", "의욕이 없", "의욕이 떨어",
    "불안", "머뭇", "확신이 없", "확인받으려",
  ]);

  // 역량이 뚜렷하면(지식 포함): 의지가 낮거나 불명확하면 D3, 명확히 높으면 D4. (역량 있으면 D1 불가)
  if (compHigh && !compLow) {
    if (willHigh && !willLow) return "D4";
    return "D3";
  }
  // 역량이 낮으면(처음·신입): 의지 낮으면 D2(좌절), 아니면 D1(열정적 초보자)
  if (compLow) return willLow ? "D2" : "D1";

  // 역량 신호가 애매할 때는 의지 신호로 추정
  if (willLow) return "D2";
  if (willHigh) return "D1";
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
      "완벽한 결과물을 기대하지 마세요. 이번엔 '기본 절차를 익히는 것'을 목표로 잡고, 어떤 결과를 언제까지 낼지 예시까지 딱 정해서 알려주세요.",
    authorityScope:
      "정해진 절차 안에서만 실행하게 하세요. 방법·우선순위 같은 주요 결정은 부서장이 직접 잡아주고, 선택지는 최소화해 헷갈리지 않게 하세요.",
    checkInMethod:
      "이틀에 한 번, 10분씩 짧게 확인하세요. 진행 상황을 직접 보고, 잘못된 부분은 그 자리에서 바로잡아 다시 알려주세요.",
    supportRequestCriteria:
      "'막히면 혼자 붙들지 말고 바로 물어보라'고 명확히 정해두세요. 특히 오류나 위험 신호가 보이면 즉시 알리게 하세요.",
  },
  D2: {
    expectedOutcome:
      "성과보다 '작은 성공 경험'을 목표로 삼으세요. 큰 일을 한 번에 맡기지 말고, 이번엔 여기까지만 해내면 성공이라고 범위를 좁혀 정해주세요.",
    authorityScope:
      "실행 방식 같은 작은 결정은 스스로 정하게 하세요. 단, 핵심 판단은 '같이 정하자'고 미리 말해두고 주요 결정은 함께 논의하세요.",
    checkInMethod:
      "단계가 끝날 때마다 점검 미팅을 잡으세요. 진행 확인과 함께 '요즘 어떤지'도 물어보고, 과정에서 잘한 점을 짚어 격려하세요.",
    supportRequestCriteria:
      "'어려움이 쌓이기 전에 먼저 말하라'고 정해두세요. 진행이 정체되거나 자신감이 떨어질 때 바로 공유하도록 격려하세요.",
  },
  D3: {
    expectedOutcome:
      "최종 결과와 기준만 합의하고, 방법은 맡기세요. '이 기준만 충족하면 방식은 자유'라고 명확히 정해 스스로 완수하는 경험을 주세요.",
    authorityScope:
      "실행 방법과 대부분의 결정은 구성원이 정하게 하세요. 조직 차원의 리스크나 자원 배분만 사전/사후로 공유받으세요.",
    checkInMethod:
      "핵심 마일스톤에서만 확인하세요. 지시보다 '어떻게 진행하고 싶은지'를 먼저 묻고, 필요할 때만 피드백을 주세요.",
    supportRequestCriteria:
      "'판단이 갈리거나 확신이 안 서면 같이 검토하자'고 정해두세요. 평소 실행은 믿고 맡기세요.",
  },
  D4: {
    expectedOutcome:
      "결과와 방향만 합의하고 세부는 전적으로 맡기세요. 목표 수준을 함께 정하되, 개선·확장까지 스스로 제안하도록 기대치를 높여 잡으세요.",
    authorityScope:
      "방법·자원 배분까지 결정 권한을 넘기세요. 리더 승인은 예외적인 상위 의사결정에만 두고, 나머지는 전적으로 위임하세요.",
    checkInMethod:
      "정기 결과 공유 외에는 먼저 찾아가지 마세요. 중간 개입을 최소화하고 최종 결과와 성과로 소통하세요.",
    supportRequestCriteria:
      "'중대한 리스크나 상위 의사결정이 걸릴 때만 알리라'고 정해두세요. 평소 실행은 온전히 맡기세요.",
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
    listen: {
      how: "지시가 많은 구간이라 오히려 먼저 물어보세요. 어디가 막히는지 구체적으로 짚어 확인하고, 모른다고 답해도 괜찮은 분위기를 만드세요.",
      example: "어떤 부분이 가장 헷갈리시나요? 어려운 지점부터 함께 짚어보겠습니다.",
    },
    decide: {
      how: "방향은 부서장이 정하되, 실행하며 느낀 점을 바로 말하게 해 참여감을 주세요. 작은 선택지 한두 개는 직접 고르게 하세요.",
      example: "우선 방향은 제가 정하겠습니다. 진행하시면서 느낀 점은 바로 말씀해 주세요.",
    },
    recognize: {
      how: "완성도가 아니라 '해낸 과정'을 그때그때 구체적으로 인정하세요. 작은 성공도 바로 짚어 자신감을 쌓아주세요.",
      example: "지금처럼 하나씩 잘 해내고 계세요. 이 속도면 충분히 하실 수 있습니다.",
    },
    grow: {
      how: "이번엔 함께 하되, 다음엔 스스로 하도록 성장 경로를 미리 말해주세요. '익숙해지면 넘긴다'는 약속을 주세요.",
      example: "이번에는 제가 함께하겠습니다. 익숙해지시면 다음부터는 직접 해보시죠.",
    },
  },
  D2: {
    listen: {
      how: "먼저 어려움과 감정을 충분히 듣고, '왜 어렵게 느끼는지'를 열린 질문으로 끌어내세요. 판단·조언보다 경청이 먼저입니다.",
      example: "지금 가장 막히는 부분이 무엇인가요? 왜 어렵게 느껴지시는지 함께 풀어봅시다.",
    },
    decide: {
      how: "본인 의견을 먼저 묻고 그 안을 존중해 함께 결정하세요. 스스로 고른 방법이라는 느낌을 줘 의욕을 회복시키세요.",
      example: "어떤 방법이 더 나아 보이시나요? 말씀하신 방향으로 한번 진행해 봅시다.",
    },
    recognize: {
      how: "지금까지 해낸 부분을 구체적으로 인정해 '가능성 있다'는 신호를 주세요. 실수보다 진전에 초점을 맞추세요.",
      example: "여기까지 해내신 것만 봐도 충분히 가능성이 보입니다.",
    },
    grow: {
      how: "초안·시도는 스스로 하게 하되, 막히는 지점은 곁에서 함께 풀어 자신감을 되살리세요. 혼자 방치하지 마세요.",
      example: "초안은 직접 잡아보시고, 막히는 부분은 제가 함께 돕겠습니다.",
    },
  },
  D3: {
    listen: {
      how: "역량은 충분하니 지시 대신 경청하세요. 망설이는 지점만 열린 질문으로 확인하고, 스스로 답을 말하게 기다리세요.",
      example: "혹시 망설여지는 지점이 있으신가요? 걸리는 부분을 편하게 말씀해 주세요.",
    },
    decide: {
      how: "결정을 본인 판단 중심으로 넘기세요. 부서장은 거들 뿐, 최종 선택은 구성원이 하도록 명확히 하세요.",
      example: "이 건은 판단을 믿고 직접 결정하셔도 좋을 것 같습니다.",
    },
    recognize: {
      how: "능력을 이미 갖췄음을 분명히 말해 확신을 채워주세요. 결과보다 '믿는다'는 신뢰 표현이 핵심입니다.",
      example: "역량은 충분하십니다. 지금 필요한 건 확신이니 믿고 진행해 보시죠.",
    },
    grow: {
      how: "방법을 전적으로 맡기고, 필요한 순간에만 지원하세요. 자율 경험을 통해 확신이 자라도록 개입을 줄이세요.",
      example: "방법은 직접 정하세요. 필요한 순간에만 제가 지원하겠습니다.",
    },
  },
  D4: {
    listen: {
      how: "큰 방향만 맞추고 세부는 판단에 맡기세요. 실행 방식을 캐묻지 말고, 필요한 것이 있는지만 물으세요.",
      example: "큰 방향만 한번 맞춰볼까요? 실행은 생각하신 판단대로 진행하시면 됩니다.",
    },
    decide: {
      how: "핵심 결과와 일정만 합의하고 실행 주도권을 완전히 넘기세요. 세부 의사결정에 개입하지 마세요.",
      example: "핵심 결과와 일정만 합의하고, 세부 실행은 직접 주도해 주세요.",
    },
    recognize: {
      how: "결과뿐 아니라 판단력 자체를 신뢰한다고 표현하세요. 자율성을 존중하는 인정이 동기를 높입니다.",
      example: "결과뿐 아니라 그 과정의 판단력도 신뢰합니다.",
    },
    grow: {
      how: "먼저 개입하지 말고, 도움이 필요할 때 바로 지원할 수 있게 문을 열어두세요. 더 큰 도전으로 성장을 이끄세요.",
      example: "자원이나 도움이 필요하실 때만 알려주세요. 바로 지원하겠습니다.",
    },
  },
};
