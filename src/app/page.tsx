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
  const [mock, setMock] = useState(false);

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
      setMock(data.mock);
      setStatus("done");
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
    <main className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500">
          블랜차드 상황대응 리더십 (SLII)
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">위임 코치</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          위임하려는 <b>업무</b>와 그 일을 맡길 <b>팀장의 정보</b>(성격·역량·의지 등)를 입력하면, 그 팀장이
          이 업무에 대해 어느 발달수준(D1~D4)에 있는지 진단하고 어떤 리더십으로 어떻게 위임을 설계·실행할지
          알려드립니다.
        </p>
      </header>

      {status !== "done" && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <Field label="위임할 업무" required hint="예: 다음 분기 신제품 런칭 행사 기획 총괄">
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={2}
              placeholder="어떤 일을 맡기려 하나요?"
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field label="대상 팀장 이름 · 호칭" hint="선택 사항">
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="예: 김팀장, 박리더"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          <Field
            label="이 팀장의 정보 (성격 · 업무 역량 · 의지 · 현재 상황)"
            required
            hint="이 업무 기준으로 얼마나 해봤는지, 잘하는지, 성격은 어떤지, 요즘 의욕·자신감은 어떤지 자유롭게 적어주세요."
          >
            <textarea
              value={memberContext}
              onChange={(e) => setMemberContext(e.target.value)}
              rows={6}
              placeholder={
                "예:\n· 성격: 꼼꼼하고 책임감 강함, 다만 실수에 예민\n· 역량: 유사 업무 2년 경험, 규모 큰 행사는 처음\n· 의지: 잘하고 싶은 마음은 큰데 요즘 부담을 느껴 자주 확인받으려 함"
              }
              className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm leading-relaxed outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </Field>

          {status === "error" && error && (
            <p className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit || status === "loading"}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {status === "loading" ? "진단 중…" : "진단하기"}
          </button>

          <p className="text-center text-[11px] leading-relaxed text-slate-400">
            이 도구는 인사평가나 심리진단이 아니라 위임·코칭을 돕기 위한 교육용 참고 도구입니다.
          </p>
        </form>
      )}

      {status === "done" && result && (
        <div>
          <ResultView result={result} mock={mock} memberName={memberName} />
          <button
            onClick={handleReset}
            className="mt-6 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            다른 상황 진단하기
          </button>
        </div>
      )}
    </main>
  );
}

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
      <span className="mb-1.5 flex items-baseline gap-2">
        <span className="text-sm font-semibold text-slate-800">{label}</span>
        {required && <span className="text-xs font-medium text-indigo-500">필수</span>}
      </span>
      {hint && <span className="mb-1.5 block text-xs text-slate-500">{hint}</span>}
      {children}
    </label>
  );
}
