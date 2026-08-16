import type { DevelopmentLevel, LeadershipStyle } from "@/config/blanchard";

/** 사용자가 입력하는 진단 요청. */
export interface DiagnoseInput {
  /** 위임하려는 업무 */
  task: string;
  /** 대상자(팀원) 이름 또는 호칭 (선택) */
  memberName?: string;
  /** 대상자의 경험·역량·성향·현재 상황 자유 서술 */
  memberContext: string;
}

/** AI 분석 결과. */
export interface DiagnosisResult {
  developmentLevel: DevelopmentLevel;
  leadershipStyle: LeadershipStyle;
  /** 역량에 대한 한 줄 판단 근거 */
  competenceReading: string;
  /** 의욕/헌신에 대한 한 줄 판단 근거 */
  commitmentReading: string;
  /** 진단 요약 (2~3문장) */
  summary: string;
  /** 구체적인 지원 방법 (권장 스타일에 맞춘 행동) */
  supportActions: string[];
  /** 주의할 점 / 흔한 실수 */
  watchOuts: string[];
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
