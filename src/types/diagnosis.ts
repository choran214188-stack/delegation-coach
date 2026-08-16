import type { DevelopmentLevel, LeadershipStyle } from "@/config/blanchard";

/** 사용자(부서장)가 입력하는 진단 요청. */
export interface DiagnoseInput {
  /** 위임하려는 업무 */
  task: string;
  /** 대상 팀장 이름 또는 호칭 (선택) */
  memberName?: string;
  /** 팀장의 성격·업무 역량·의지·현재 상황 자유 서술 */
  memberContext: string;
}

/** 발달수준에 맞춘 위임 실행 가이드 (부서장이 실제로 정할 것들). */
export interface DelegationPlan {
  /** 이 위임에서 현실적으로 기대할 결과 수준 */
  expectedOutcome: string;
  /** 어디까지 권한을 넘길지 (의사결정 권한의 범위) */
  authorityScope: string;
  /** 어떤 주기·방식으로 점검할지 */
  checkInMethod: string;
  /** 팀장이 부서장에게 도움을 요청해야 하는 기준 */
  supportRequestCriteria: string;
}

/** AI 분석 결과. */
export interface DiagnosisResult {
  developmentLevel: DevelopmentLevel;
  leadershipStyle: LeadershipStyle;
  /** 역량에 대한 한 줄 판단 근거 */
  competenceReading: string;
  /** 의욕/의지에 대한 한 줄 판단 근거 */
  commitmentReading: string;
  /** 진단 요약 (2~3문장) */
  summary: string;
  /** 구체적인 지원 방법 (권장 스타일에 맞춘 행동) */
  supportActions: string[];
  /** 주의할 점 / 흔한 실수 */
  watchOuts: string[];
  /** 위임 실행 가이드 (기대결과·권한범위·점검방식·지원요청기준) */
  delegationPlan: DelegationPlan;
  /** 대화를 시작할 때 쓸 수 있는 예시 한마디 */
  openingLine: string;
}

export interface DiagnoseSuccess {
  ok: true;
  result: DiagnosisResult;
  /** 실제 LLM으로 분석했는지, 키가 없어 Mock으로 동작했는지 */
  mock: boolean;
}

export interface DiagnoseFailure {
  ok: false;
  error: string;
}

export type DiagnoseResponse = DiagnoseSuccess | DiagnoseFailure;
