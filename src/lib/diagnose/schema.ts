import { z } from "zod";
import {
  DEVELOPMENT_LEVEL_IDS,
  LEADERSHIP_STYLE_IDS,
  DEVELOPMENT_LEVELS,
} from "@/config/blanchard";
import type { DiagnosisResult } from "@/types/diagnosis";

/** 사용자 입력 검증 스키마. */
export const diagnoseInputSchema = z.object({
  task: z
    .string()
    .trim()
    .min(2, "위임할 업무를 조금 더 구체적으로 입력해 주세요.")
    .max(1000, "업무 설명이 너무 깁니다. 1000자 이내로 입력해 주세요."),
  memberName: z.string().trim().max(50).optional(),
  memberContext: z
    .string()
    .trim()
    .min(5, "대상 팀장의 성격·역량·의지를 조금 더 설명해 주세요.")
    .max(2000, "설명이 너무 깁니다. 2000자 이내로 입력해 주세요."),
});

const shortText = z.string().trim().min(1);

/** LLM 응답(JSON) 검증 스키마. */
const resultSchema = z.object({
  developmentLevel: z.enum(DEVELOPMENT_LEVEL_IDS as [string, ...string[]]),
  leadershipStyle: z.enum(LEADERSHIP_STYLE_IDS as [string, ...string[]]),
  confidence: shortText,
  confidenceNote: shortText,
  competenceReading: shortText,
  commitmentReading: shortText,
  summary: shortText,
  supportActions: z.array(shortText).min(1).max(6),
  watchOuts: z.array(shortText).min(1).max(5),
  delegationPlan: z.object({
    expectedOutcome: shortText,
    authorityScope: shortText,
    checkInMethod: shortText,
    supportRequestCriteria: shortText,
  }),
  developmentSignals: z.object({
    levelUp: z.array(shortText).min(1).max(4),
    warning: z.array(shortText).min(1).max(4),
  }),
  conversationScript: z
    .array(z.object({ stage: shortText, line: shortText }))
    .min(2)
    .max(6),
});

/**
 * LLM 원문 문자열에서 JSON 을 최대한 관대하게 추출·검증한다.
 * 코드펜스나 앞뒤 잡텍스트가 있어도 첫 번째 JSON 객체를 뽑아낸다.
 */
export function parseDiagnosis(raw: string): DiagnosisResult {
  const jsonText = extractJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("AI 응답을 해석하지 못했습니다. 다시 시도해 주세요.");
  }

  const result = resultSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("AI 응답 형식이 올바르지 않습니다. 다시 시도해 주세요.");
  }

  const data = result.data;
  // 발달수준-스타일 정합성 보정: 스타일이 권장 스타일과 다르면 권장 스타일로 맞춘다.
  const recommended =
    DEVELOPMENT_LEVELS[data.developmentLevel as keyof typeof DEVELOPMENT_LEVELS].recommendedStyle;

  return {
    developmentLevel: data.developmentLevel as DiagnosisResult["developmentLevel"],
    leadershipStyle: (data.leadershipStyle === recommended
      ? data.leadershipStyle
      : recommended) as DiagnosisResult["leadershipStyle"],
    confidence: data.confidence,
    confidenceNote: data.confidenceNote,
    competenceReading: data.competenceReading,
    commitmentReading: data.commitmentReading,
    summary: data.summary,
    supportActions: data.supportActions,
    watchOuts: data.watchOuts,
    delegationPlan: data.delegationPlan,
    developmentSignals: data.developmentSignals,
    conversationScript: data.conversationScript,
  };
}

function extractJson(raw: string): string {
  const trimmed = raw.trim();
  // ```json ... ``` 코드펜스 제거
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fenceMatch ? fenceMatch[1] : trimmed;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) return body.trim();
  return body.slice(start, end + 1);
}
