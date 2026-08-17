"use client";

import { useEffect, useState } from "react";
import { ResultView } from "@/components/ResultView";
import { encodeShare, decodeShare } from "@/lib/share";
import type { DiagnoseResponse, DiagnosisResult } from "@/types/diagnosis";

type Status = "idle" | "loading" | "done" | "error";

export default function Page() {
  const [task, setTask] = useState("");
  const [memberName, setMemberName] = useState("");
  const [memberContext, setMemberContext] = useState("");

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  // 공유 관련 상태
  const [shared, setShared] = useState(false); // 공유 링크로 열린 결과인가
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // 공유 링크(#r=...)로 접속하면 결과를 복원해 바로 렌더링
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#r=")) return;
    decodeShare(hash.slice(3))
      .then((payload) => {
        setResult(payload.result);
        setMemberName(payload.memberName ?? "");
        setShared(true);
        setStatus("done");
      })
      .catch(() => setToast("공유 링크를 여는 데 실패했어요. 링크가 잘렸을 수 있어요."));
  }, []);

  // 결과가 준비되면 공유 URL 을 미리 계산(클릭 시 지연 없이 네이티브 공유가 뜨도록)
  useEffect(() => {
    if (status !== "done" || !result) {
      setShareUrl(null);
      return;
    }
    let alive = true;
    encodeShare({ result, memberName })
      .then((code) => {
        if (alive) setShareUrl(`${window.location.origin}${window.location.pathname}#r=${code}`);
      })
      .catch(() => {
        if (alive) setShareUrl(null);
      });
    return () => {
      alive = false;
    };
  }, [status, result, memberName]);

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
    setShared(false);
    setToast(null);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  async function handleShare() {
    if (!shareUrl) return;
    const who = memberName.trim() || "이 팀장";
    // 모바일: 네이티브 공유 시트(카카오톡 등). shareUrl 을 미리 만들어 둬 제스처 안에서 바로 호출.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `${who} 위임 진단 결과 · 위임 나침반`, url: shareUrl });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return; // 사용자가 취소
      }
    }
    // 폴백: 링크 복사
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("링크가 복사되었어요. 카카오톡 등에 붙여넣어 공유하세요.");
    } catch {
      showToast("링크 복사에 실패했어요. 주소창의 링크를 직접 복사해 주세요.");
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4000);
  }

  const canSubmit = task.trim().length >= 2 && memberContext.trim().length >= 5;

  return (
    <main className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      {/* 헤더 */}
      <header className="mb-9 text-center">
        <p className="eyebrow text-gold">상황대응 리더십</p>
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
          {shared && (
            <div className="mb-4 rounded-2xl border border-gold/30 bg-gold-pale px-4 py-3 text-center text-[13px] leading-relaxed text-ink-soft">
              공유받은 진단 결과입니다. 아래에서 직접 진단해 볼 수도 있어요.
            </div>
          )}

          <ResultView result={result} memberName={memberName} />

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleShare}
              disabled={!shareUrl}
              className="flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
            >
              <ShareIcon />
              결과 공유하기
            </button>
            <button
              onClick={handleReset}
              className="rounded-2xl border border-line bg-surface px-4 py-3.5 text-sm font-semibold text-ink-soft shadow-soft transition hover:border-ink/20 hover:text-ink"
            >
              {shared ? "직접 진단해보기" : "다른 상황 진단하기"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <p className="mt-4 rounded-xl border border-sage/25 bg-sage-pale px-4 py-2.5 text-center text-[13px] leading-relaxed text-sage">
          {toast}
        </p>
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

function ShareIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}
