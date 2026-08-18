import type { DevelopmentLevel, LeadershipStyle } from "@/config/blanchard";

/** 사용자(부서장)가 입력하는 진단 요청. */
export interface DiagnoseInput {
  /** 위임하려는 업무 */
  task: string;
  /** 대상 구성원 이름 또는 호칭 (선택) */
  memberName?: string;
  /** 구성원의 성격·업무 역량·의지·현재 상황 자유 서술 */
  memberContext: string;
}

/** 발달수준에 맞춘 위임 실행 가이드 (부서장이 실제로 정할 것들). */
export interface DelegationPlan {
  expectedOutcome: string;
  authorityScope: string;
  checkInMethod: string;
  supportRequestCriteria: string;
}

/** 발달 신호 — 사람을 성장시켜 위임 수준을 조정하기 위한 관찰 포인트. */
export interface DevelopmentSignals {
  /** 다음 단계로 위임 수준을 올려도 되는 신호 */
  levelUp: string[];
  /** 뒤로 밀렸으니 지원을 늘려야 하는 경고 신호 */
  warning: string[];
}

/** 지원적 행동 한 관점 — 구체 지침 + 예시 대사. */
export interface SupportiveItem {
  /** 이 관점에서 실제로 어떻게 해야 하는지 (구체 지침, 명령형) */
  how: string;
  /** 이 구성원·업무에 맞춘 실제 예시 대사 */
  example: string;
}

/** 지원적 행동 대화 접근 (4가지 관점). */
export interface SupportiveApproach {
  /** 의견 경청 및 질문 */
  listen: SupportiveItem;
  /** 참여적 의사결정 */
  decide: SupportiveItem;
  /** 인정과 격려 */
  recognize: SupportiveItem;
  /** 자율성 및 성장 지원 */
  grow: SupportiveItem;
}

/** AI 분석 결과. */
export interface DiagnosisResult {
  developmentLevel: DevelopmentLevel;
  leadershipStyle: LeadershipStyle;
  /** 진단 확신도 (높음 / 보통 / 낮음) */
  confidence: string;
  /** 확신도에 대한 부연 — 경계 케이스나 추가로 확인할 점 */
  confidenceNote: string;
  /** 역량에 대한 판단 근거 */
  competenceReading: string;
  /** 의욕/의지에 대한 판단 근거 */
  commitmentReading: string;
  /** 진단 요약 (2~3문장) */
  summary: string;
  /** 구체적인 지원 방법 */
  supportActions: string[];
  /** 주의할 점 / 흔한 실수 */
  watchOuts: string[];
  /** 위임 실행 가이드 (기대결과·권한범위·점검방식·지원요청기준) */
  delegationPlan: DelegationPlan;
  /** 발달 신호 (레벨 이동 판단) */
  developmentSignals: DevelopmentSignals;
  /** 지원적 행동 대화 접근 (4가지 관점, 상황 맞춤 예시) */
  supportiveApproach: SupportiveApproach;
}

export interface DiagnoseSuccess {
  ok: true;
  result: DiagnosisResult;
  mock: boolean;
}

export interface DiagnoseFailure {
  ok: false;
  error: string;
}

export type DiagnoseResponse = DiagnoseSuccess | DiagnoseFailure;
