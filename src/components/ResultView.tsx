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
  const who = memberName?.trim() || "이 팀장";
  const plan = result.delegationPlan;

  const guides = [
    { n: "01", label: "기대결과", text: plan.expectedOutcome },
    { n: "02", label: "권한범위", text: plan.authorityScope },
    { n: "03", label: "점검방식", text: plan.checkInMethod },
    { n: "04", label: "지원요청 기준", text: plan.supportRequestCriteria },
  ];

  return (
    <div className="space-y-4">
      {mock && (
        <div className="rounded-2xl border border-gold/30 bg-gold-pale px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
          지금은 <b className="text-ink">예시 모드</b>입니다. 서버에{" "}
          <code className="rounded bg-white/70 px-1 py-0.5 text-[12px]">ANTHROPIC_API_KEY</code> 를
          설정하면 실제 AI 진단이 나옵니다.
        </div>
      )}

      {/* 히어로: 발달수준 */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-panel sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-gold/20 blur-3xl"
          aria-hidden
        />
        <p className="eyebrow text-gold-soft">진단 결과 · {who}</p>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-display text-6xl font-bold leading-none text-white">{level.id}</span>
          <span className="pb-1 text-2xl font-bold tracking-tight text-white">{level.name}</span>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">{level.description}</p>

        <div className="mt-6 h-px w-full bg-white/10" />
        <div className="mt-5 grid grid-cols-2 gap-4">
          <Stat label="역량" value={level.competence} reading={result.competenceReading} />
          <Stat label="의욕 · 의지" value={level.commitment} reading={result.commitmentReading} />
        </div>
      </div>

      {/* 권장 리더십 스타일 */}
      <Card>
        <p className="eyebrow text-gold">권장 리더십</p>
        <div className="mt-2 flex items-baseline gap-2.5">
          <span className="font-display text-3xl font-bold text-ink">{style.id}</span>
          <span className="text-xl font-bold text-ink">{style.name}</span>
          <span className="text-sm font-medium text-ink-muted">{style.keyword}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Pill>지시적 행동 {style.directive}</Pill>
          <Pill>지원적 행동 {style.supportive}</Pill>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{style.description}</p>
      </Card>

      {/* SLII 지도 */}
      <Card>
        <SectionTitle eyebrow="포지션" title="상황대응 리더십 지도" />
        <div className="mt-4">
          <SliiGrid active={result.leadershipStyle} />
        </div>
      </Card>

      {/* 진단 요약 */}
      <Card>
        <SectionTitle eyebrow="요약" title="진단 요약" />
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{result.summary}</p>
      </Card>

      {/* 위임 실행 가이드 */}
      <Card>
        <SectionTitle
          eyebrow="Delegation Plan"
          title="위임 실행 가이드"
          note={`${level.id} 수준에 맞춘 초안 — 상황에 맞게 조정하세요`}
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {guides.map((g) => (
            <div key={g.n} className="rounded-2xl border border-line bg-canvas/50 p-4">
              <div className="h-0.5 w-8 rounded-full bg-gold" />
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-sm font-bold text-gold">{g.n}</span>
                <span className="text-sm font-semibold text-ink">{g.label}</span>
              </p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{g.text}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* 지원 방법 */}
      <div className="rounded-3xl border border-sage/25 bg-sage-pale p-6 shadow-soft">
        <SectionTitle eyebrow="Action" title="이렇게 지원하세요" accent="sage" />
        <ul className="mt-4 space-y-2.5">
          {result.supportActions.map((action, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
              <span className="mt-px flex h-5 w-5 flex-none items-center justify-center rounded-full bg-sage font-display text-[11px] font-bold text-white">
                {i + 1}
              </span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 주의점 */}
      <div className="rounded-3xl border border-clay/25 bg-clay-pale p-6 shadow-soft">
        <SectionTitle eyebrow="Caution" title="이런 실수를 조심하세요" accent="clay" />
        <ul className="mt-4 space-y-2.5">
          {result.watchOuts.map((w, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-soft">
              <span className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-clay" />
              <span>{w}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 오프닝 멘트 */}
      <Card>
        <SectionTitle eyebrow="Opening" title="위임 대화를 이렇게 시작해 보세요" />
        <blockquote className="mt-4 border-l-2 border-gold pl-4 text-[15px] italic leading-relaxed text-ink">
          “{result.openingLine}”
        </blockquote>
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-6 shadow-soft">{children}</div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  note,
  accent = "gold",
}: {
  eyebrow: string;
  title: string;
  note?: string;
  accent?: "gold" | "sage" | "clay";
}) {
  const tone = accent === "sage" ? "text-sage" : accent === "clay" ? "text-clay" : "text-gold";
  return (
    <div>
      <p className={`eyebrow ${tone}`}>{eyebrow}</p>
      <h2 className="mt-1.5 text-lg font-bold tracking-tight text-ink">{title}</h2>
      {note && <p className="mt-1 text-xs text-ink-muted">{note}</p>}
    </div>
  );
}

function Stat({ label, value, reading }: { label: string; value: string; reading: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-soft">{label}</p>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
      <p className="mt-1 text-[12px] leading-relaxed text-white/55">{reading}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-canvas px-3 py-1 text-xs font-medium text-ink-soft">
      {children}
    </span>
  );
}
