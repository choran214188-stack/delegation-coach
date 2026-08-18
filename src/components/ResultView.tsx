import { DEVELOPMENT_LEVELS, LEADERSHIP_STYLES } from "@/config/blanchard";
import type { DiagnosisResult, SupportiveApproach } from "@/types/diagnosis";
import { SliiGrid } from "./SliiGrid";

/** 지원적 행동 대화의 4가지 관점 (교육 자료 기준, 고정). */
const SUPPORTIVE_CATEGORIES: { key: keyof SupportiveApproach; label: string }[] = [
  { key: "listen", label: "의견 경청 및 질문" },
  { key: "decide", label: "참여적 의사결정" },
  { key: "recognize", label: "인정과 격려" },
  { key: "grow", label: "자율성 및 성장 지원" },
];

export function ResultView({
  result,
  memberName,
}: {
  result: DiagnosisResult;
  memberName?: string;
}) {
  const level = DEVELOPMENT_LEVELS[result.developmentLevel];
  const style = LEADERSHIP_STYLES[result.leadershipStyle];
  const who = memberName?.trim() || "이 구성원";
  const plan = result.delegationPlan;
  const signals = result.developmentSignals;

  const guides = [
    { n: "01", label: "기대결과", text: plan.expectedOutcome },
    { n: "02", label: "권한범위", text: plan.authorityScope },
    { n: "03", label: "점검방식", text: plan.checkInMethod },
    { n: "04", label: "지원요청 기준", text: plan.supportRequestCriteria },
  ];

  return (
    <div className="space-y-4">
      {/* 히어로: 발달수준 */}
      <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-panel sm:p-8">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl"
          style={{ backgroundColor: level.accent }}
          aria-hidden
        />
        <div className="flex items-start justify-between gap-3">
          <p className="eyebrow text-gold-soft">진단 결과 · {who}</p>
          <span className="flex-none rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white/80 ring-1 ring-white/15">
            확신도 · {result.confidence}
          </span>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span
            className="font-display text-6xl font-bold leading-none"
            style={{ color: level.accent }}
          >
            {level.id}
          </span>
          <span className="pb-1 text-2xl font-bold tracking-tight text-white">{level.name}</span>
        </div>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/70">{level.description}</p>

        {/* 권장 위임 방식 */}
        <div className="mt-4 rounded-2xl bg-white/5 px-4 py-3 ring-1 ring-white/10">
          <p className="eyebrow text-gold-soft">권장 위임 방식</p>
          <p className="mt-1 text-[15px] font-bold text-white">
            {level.delegationMode}
            <span className="ml-2 text-sm font-normal text-white/65">{level.oneLiner}</span>
          </p>
        </div>

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
        <div className="mt-4 rounded-xl bg-canvas/70 px-3.5 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
            확신도 · {result.confidence}
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{result.confidenceNote}</p>
        </div>
      </Card>

      {/* 위임 실행 가이드 */}
      <Card>
        <SectionTitle
          eyebrow="Directive"
          title="지시적 행동 가이드"
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

      {/* 지원적 행동 대화 */}
      <Card>
        <SectionTitle eyebrow="Supportive Dialogue" title="지원적 행동 대화" note={level.supportiveHeadline} />
        <div className="mt-5 space-y-3">
          {SUPPORTIVE_CATEGORIES.map((c) => {
            const item = result.supportiveApproach[c.key];
            return (
              <div key={c.key} className="rounded-2xl border border-line bg-canvas/50 p-4">
                <p className="text-sm font-semibold text-ink">{c.label}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-soft">{item.how}</p>
                <div className="mt-2.5 border-l-2 border-gold pl-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">
                    예시 대사
                  </p>
                  <p className="mt-0.5 text-sm italic leading-relaxed text-ink">“{item.example}”</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 발달 신호 */}
      <Card>
        <SectionTitle
          eyebrow="Growth"
          title="발달 신호"
          note="이 신호를 보고 위임 수준을 조정하세요"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <SignalBlock
            tone="sage"
            title="한 단계 올려도 될 신호"
            items={signals.levelUp}
            symbol="▲"
          />
          <SignalBlock
            tone="clay"
            title="지원을 늘려야 할 경고 신호"
            items={signals.warning}
            symbol="▼"
          />
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

function SignalBlock({
  tone,
  title,
  items,
  symbol,
}: {
  tone: "sage" | "clay";
  title: string;
  items: string[];
  symbol: string;
}) {
  const c =
    tone === "sage"
      ? { border: "border-sage/25", bg: "bg-sage-pale", label: "text-sage", dot: "text-sage" }
      : { border: "border-clay/25", bg: "bg-clay-pale", label: "text-clay", dot: "text-clay" };
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-4`}>
      <p className={`text-sm font-semibold ${c.label}`}>{title}</p>
      <ul className="mt-2.5 space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink-soft">
            <span className={`flex-none text-[10px] leading-5 ${c.dot}`}>{symbol}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
