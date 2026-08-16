import { DEVELOPMENT_LEVELS, LEADERSHIP_STYLES } from "@/config/blanchard";
import type { DiagnosisResult } from "@/types/diagnosis";
import { SliiGrid } from "./SliiGrid";

export function ResultView({
  result,
  mock,
  memberName,
}: {
  result: DiagnosisResult;
  mock: boolean;
  memberName?: string;
}) {
  const level = DEVELOPMENT_LEVELS[result.developmentLevel];
  const style = LEADERSHIP_STYLES[result.leadershipStyle];
  const who = memberName?.trim() || "이 팀원";

  return (
    <div className="space-y-5">
      {mock && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          지금은 <b>예시(Mock) 모드</b>로 동작 중입니다. 정식 진단은 서버에 <code>ANTHROPIC_API_KEY</code>
          를 설정하면 나옵니다.
        </div>
      )}

      {/* 핵심 진단 배지 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{who}의 발달수준</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {level.id} · {level.name}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            역량 <b>{level.competence}</b> · 의욕/헌신 <b>{level.commitment}</b>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{level.description}</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <p className="text-xs font-medium text-indigo-500">권장 리더십 스타일</p>
          <p className="mt-1 text-2xl font-bold text-indigo-800">
            {style.id} · {style.name}
            <span className="ml-2 text-base font-medium text-indigo-500">({style.keyword})</span>
          </p>
          <p className="mt-2 text-sm text-indigo-700">
            지시적 행동 <b>{style.directive}</b> · 지원적 행동 <b>{style.supportive}</b>
          </p>
          <p className="mt-2 text-sm leading-relaxed text-indigo-700">{style.description}</p>
        </div>
      </div>

      {/* 그리드 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="mb-3 text-sm font-semibold text-slate-700">
          상황대응 리더십 지도에서 지금 위치
        </p>
        <SliiGrid active={result.leadershipStyle} />
      </div>

      {/* 판단 근거 + 요약 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700">진단 요약</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">{result.summary}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <Reading label="역량 판단" text={result.competenceReading} />
          <Reading label="의욕·헌신 판단" text={result.commitmentReading} />
        </div>
      </div>

      {/* 지원 방법 */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
        <p className="text-sm font-semibold text-emerald-800">이렇게 지원하세요</p>
        <ul className="mt-3 space-y-2">
          {result.supportActions.map((action, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-emerald-900">
              <span className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 주의점 */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
        <p className="text-sm font-semibold text-rose-800">이런 실수를 조심하세요</p>
        <ul className="mt-3 space-y-2">
          {result.watchOuts.map((w, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-rose-900">
              <span className="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-rose-500" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 오프닝 멘트 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-sm font-semibold text-slate-700">대화를 이렇게 시작해 보세요</p>
        <blockquote className="mt-2 border-l-4 border-indigo-300 bg-slate-50 px-4 py-3 text-sm italic leading-relaxed text-slate-700">
          “{result.openingLine}”
        </blockquote>
      </div>
    </div>
  );
}

function Reading({ label, text }: { label: string; text: string }) {
  return (
    <div className="rounded-lg bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}
