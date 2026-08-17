import { NextResponse } from "next/server";
import { getProvider } from "@/lib/llm";
import { LlmError } from "@/lib/llm/provider";
import { buildUserMessage, SYSTEM_PROMPT } from "@/lib/diagnose/prompt";
import { diagnoseInputSchema, parseDiagnosis } from "@/lib/diagnose/schema";
import type { DiagnoseResponse } from "@/types/diagnosis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<NextResponse<DiagnoseResponse>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const parsedInput = diagnoseInputSchema.safeParse(body);
  if (!parsedInput.success) {
    const message = parsedInput.error.issues[0]?.message ?? "입력값을 확인해 주세요.";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }

  const provider = getProvider();
  try {
    const raw = await provider.complete({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(parsedInput.data) }],
      maxTokens: 2400,
    });
    const result = parseDiagnosis(raw);
    return NextResponse.json({ ok: true, result, mock: provider.isMock });
  } catch (err) {
    if (err instanceof LlmError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 502 });
    }
    const message = err instanceof Error ? err.message : "진단 중 오류가 발생했습니다.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
