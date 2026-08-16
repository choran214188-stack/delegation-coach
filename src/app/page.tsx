"use client";

import { useState } from "react";
import { ResultView } from "@/components/ResultView";
import type { DiagnoseResponse, DiagnosisResult } from "@/types/diagnosis";

type Status = "idle" | "loading" | "done" | "error";

export default function Page() {
  const [task, setTask] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberContext, setMemberContext] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task, memberName, memberContext }),
      });
      const data = (await res.json()) as DiagnoseResponse;
      if (!data.ok) {
        setError(data.error);
        setStatus("error");
        return;
      }
      setResult(data.result);
      setStatus("done");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해 주세요.");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  const canSubmit = task.trim().length >= 2 && memberContext.trim().length >= 5;

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      {/* 헤더 */}
      <header className="mb-9 text-center">
        <p className="eyebrow text-gold">Blanchard SLII · 상황대응 리더십</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-[2.75rem]">
          위임 나침반
        </h1>
        <div className="mx-auto mt-4 h-px w-14 bg-gradient-to-r from-transparent via-gold to-transparent" />
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
          위임할 업무와 팀장의 정보를 넣으면, 그 팀장이 이 업무에서 어느 발달수준에 있는지 진단하고 어떤
          리더십으로 위임을 설계·실행할지 안내합니다.
        </p>
      </header>

      {status !== "done" && (
        <form
          onSubmit={handleSubmit}
          className="animate-rise rounded-3xl border border-line bg-surface p-6 shadow-panel sm:p-8"
        >
          <div className="space-y-6">
            <Field label="위임할 업무" required hint="예 · 다음 분기 신제품 런칭 행사 기획 총괄">
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                rows={2}
                placeholder="어떤 일을 맡기려 하나요?"
                className={inputClass + " resize-none"}
              />
            </Field>

            <Field label="대상 팀장 · 호칭" hint="선택">
              <input
                value={memberName}
                onChange={(e) => setMemberName(e.target.value)}
                placeholder="예 · 김팀장, 박리더"
                className={inputClass}
              />
            </Field>

            <Field
              label="팀장 정보"
              required
              hint="성격 · 업무 역량 · 의지 · 현재 상황을 자유롭게"
            >
              <textarea
                value={memberContext}
                onChange={(e) => setMemberContext(e.target.value)}
                rows={6}
                placeholder={
                  "예)\n· 성격 — 꼼꼼하고 책임감 강함, 실수에 예민\n· 역량 — 유사 업무 2년, 큰 규모 행사는 처음\n· 의지 — 잘하고 싶지만 요즘 부담을 느껴 자주 확인받으려 함"
                }
                className={inputClass + " resize-none leading-relaxed"}
              />
            </Field>

            {status === "error" && error && (
              <p className="rounded-xl border border-clay/30 bg-clay-pale px-4 py-3 text-sm text-clay">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!canSubmit || status === "loading"}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-4 text-[15px] font-semibold text-white shadow-soft transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
            >
              {status === "loading" ? (
                <>
                  <Spinner />
                  진단하는 중…
                </>
              ) : (
                <>
                  진단하기
                  <span className="text-gold-soft transition group-hover:translate-x-0.5">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {status === "done" && result && (
        <div className="animate-rise">
          <ResultView result={result} memberName={memberName} />
          <button
            onClick={handleReset}
            className="mt-8 w-full rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm font-semibold text-ink-soft shadow-soft transition hover:border-ink/20 hover:text-ink"
          >
            다른 상황 진단하기
          </button>
        </div>
      )}

      <p className="mt-8 text-center text-[11px] leading-relaxed text-ink-muted/70">
        인사평가나 심리진단이 아니라, 위임·코칭을 돕기 위한 교육용 참고 도구입니다.
      </p>
    </main>
  );
}

const inputClass =
  "w-full rounded-xl border border-line bg-canvas/60 px-4 py-3 text-sm text-ink placeholder:text-ink-muted/60 outline-none transition focus:border-gold focus:bg-surface focus:ring-2 focus:ring-gold/20";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">
          {label}
          {required && <span className="ml-1 text-gold">*</span>}
        </span>
        {hint && <span className="text-[11px] text-ink-muted">{hint}</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Spinner() {
  return (
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}
