/**
 * 블랜차드(Ken Blanchard)의 상황대응 리더십 II (Situational Leadership® II, SLII) 모델 정의.
 *
 * - 직원의 발달수준(Development Level): D1~D4 = 역량(competence) × 의욕/헌신(commitment)
 * - 리더의 리더십 스타일(Leadership Style): S1~S4 = 지시적 행동 × 지원적 행동
 * - 각 발달수준에는 대응되는 권장 스타일이 있다. (D1→S1, D2→S2, D3→S3, D4→S4)
 *
 * 이 도구는 인사평가나 심리진단이 아니라, 위임/코칭 상황을 점검하기 위한 교육용 참고 도구입니다.
 */

export type DevelopmentLevel = "D1" | "D2" | "D3" | "D4";
export type LeadershipStyle = "S1" | "S2" | "S3" | "S4";

export interface DevelopmentLevelInfo {
  id: DevelopmentLevel;
  name: string;
  competence: string; // 역량 수준
  commitment: string; // 의욕/헌신 수준
  description: string;
  recommendedStyle: LeadershipStyle;
  /** 위임 방식 부제 (예: 구체적 지시 중심 / 단계적 위임 / 자율 + 지원 / 결과 중심 위임) */
  delegationMode: string;
  /** 한 줄 요약 (위임 방식 핵심) */
  oneLiner: string;
  /** 유형별 포인트 색 (교육 자료 색상 코드) */
  accent: string;
}

export interface LeadershipStyleInfo {
  id: LeadershipStyle;
  name: string;
  keyword: string;
  directive: "높음" | "낮음";
  supportive: "높음" | "낮음";
  description: string;
  /** 2x2 그리드 배치용 좌표 (지시적=x, 지원적=y). 0 = 낮음, 1 = 높음 */
  grid: { directive: 0 | 1; supportive: 0 | 1 };
}

export const DEVELOPMENT_LEVELS: Record<DevelopmentLevel, DevelopmentLevelInfo> = {
  D1: {
    id: "D1",
    name: "열정적 초심자",
    competence: "낮음",
    commitment: "높음",
    description:
      "업무를 처음 맡아 방법·기준은 아직 모르지만 배우려는 의욕과 기대는 높은 상태입니다.",
    recommendedStyle: "S1",
    delegationMode: "구체적 지시 중심",
    oneLiner: "구체적으로 지시하고, 자주 확인합니다.",
    accent: "#C0453A",
  },
  D2: {
    id: "D2",
    name: "좌절한 학습자",
    competence: "낮음~중간",
    commitment: "낮음",
    description:
      "어느 정도 해봤지만 생각보다 어렵다는 걸 깨닫고 자신감·의욕이 떨어진 상태입니다. 가장 세심한 지원이 필요한 구간입니다.",
    recommendedStyle: "S2",
    delegationMode: "단계적 위임",
    oneLiner: "작게 나누어 맡기고, 함께 풀어갑니다.",
    accent: "#C67B2C",
  },
  D3: {
    id: "D3",
    name: "유능하나 신중한 실행자",
    competence: "중간~높음",
    commitment: "변동적",
    description:
      "역량은 충분하지만 스스로에 대한 확신이 부족하거나 의욕이 오르내리는 상태입니다. 밀어주는 지원이 필요합니다.",
    recommendedStyle: "S3",
    delegationMode: "자율 + 지원",
    oneLiner: "자율성을 보장하고, 필요할 때 지원합니다.",
    accent: "#3F7A5B",
  },
  D4: {
    id: "D4",
    name: "자기주도적 성취자",
    competence: "높음",
    commitment: "높음",
    description: "역량과 의욕이 모두 높아 스스로 판단하고 실행할 수 있는 상태입니다.",
    recommendedStyle: "S4",
    delegationMode: "결과 중심 위임",
    oneLiner: "결과만 합의하고, 자율적으로 맡깁니다.",
    accent: "#2F5D86",
  },
};

export const LEADERSHIP_STYLES: Record<LeadershipStyle, LeadershipStyleInfo> = {
  S1: {
    id: "S1",
    name: "지시형",
    keyword: "Directing",
    directive: "높음",
    supportive: "낮음",
    description:
      "무엇을·어떻게·언제까지 하는지 구체적으로 알려주고, 자주 확인하며 방향을 잡아줍니다.",
    grid: { directive: 1, supportive: 0 },
  },
  S2: {
    id: "S2",
    name: "코칭형",
    keyword: "Coaching",
    directive: "높음",
    supportive: "높음",
    description:
      "방향은 계속 제시하되 이유를 설명하고, 의견을 듣고 격려하며 의욕을 회복시켜 줍니다.",
    grid: { directive: 1, supportive: 1 },
  },
  S3: {
    id: "S3",
    name: "지원형",
    keyword: "Supporting",
    directive: "낮음",
    supportive: "높음",
    description:
      "결정은 본인에게 맡기고, 들어주고 인정하고 자신감을 북돋우며 옆에서 지지해 줍니다.",
    grid: { directive: 0, supportive: 1 },
  },
  S4: {
    id: "S4",
    name: "위임형",
    keyword: "Delegating",
    directive: "낮음",
    supportive: "낮음",
    description:
      "목표와 권한을 넘기고, 필요할 때만 개입하며 결과에 대한 책임과 자율을 부여합니다.",
    grid: { directive: 0, supportive: 0 },
  },
};

export const DEVELOPMENT_LEVEL_IDS: DevelopmentLevel[] = ["D1", "D2", "D3", "D4"];
export const LEADERSHIP_STYLE_IDS: LeadershipStyle[] = ["S1", "S2", "S3", "S4"];

export function isDevelopmentLevel(value: unknown): value is DevelopmentLevel {
  return typeof value === "string" && (DEVELOPMENT_LEVEL_IDS as string[]).includes(value);
}

export function isLeadershipStyle(value: unknown): value is LeadershipStyle {
  return typeof value === "string" && (LEADERSHIP_STYLE_IDS as string[]).includes(value);
}
