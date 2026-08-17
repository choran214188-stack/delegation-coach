import {
  LEADERSHIP_STYLES,
  type LeadershipStyle,
  type DevelopmentLevel,
} from "@/config/blanchard";

/**
 * SLII 2x2 지도.
 * x축 = 지시적 행동(Directive), y축 = 지원적 행동(Supportive).
 *   S3(위 왼쪽)  S2(위 오른쪽)
 *   S4(아래 왼쪽) S1(아래 오른쪽)
 * 진단된 스타일 칸을 딥 네이비로 강조한다.
 */
const CELL_ORDER: LeadershipStyle[] = ["S3", "S2", "S4", "S1"];

const STYLE_TO_LEVEL: Record<LeadershipStyle, DevelopmentLevel> = {
  S1: "D1",
  S2: "D2",
  S3: "D3",
  S4: "D4",
};

export function SliiGrid({ active }: { active: LeadershipStyle }) {
  return (
    <div className="flex">
      {/* y축 라벨 (아래→위로 읽힘, 위로 갈수록 지원 높음) */}
      <div className="flex w-6 items-center justify-center">
        <span className="-rotate-90 whitespace-nowrap text-[11px] font-semibold tracking-[0.1em] text-ink-soft">
          지원적 행동 <span className="text-gold">→</span>
        </span>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-2 gap-2.5">
          {CELL_ORDER.map((id) => {
            const s = LEADERSHIP_STYLES[id];
            const isActive = id === active;
            return (
              <div
                key={id}
                className={[
                  "relative overflow-hidden rounded-2xl border p-4 transition",
                  isActive
                    ? "border-ink bg-ink text-white shadow-soft"
                    : "border-line bg-surface",
                ].join(" ")}
              >
                {isActive && (
                  <span className="absolute right-0 top-0 h-full w-1 bg-gold" aria-hidden />
                )}
                <div className="flex items-center justify-between">
                  <span
                    className={[
                      "font-display text-base font-semibold",
                      isActive ? "text-white" : "text-ink-muted",
                    ].join(" ")}
                  >
                    {s.id}
                  </span>
                  <span
                    className={[
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      isActive ? "bg-gold text-white" : "bg-canvas text-ink-muted",
                    ].join(" ")}
                  >
                    {STYLE_TO_LEVEL[id]}
                  </span>
                </div>
                <p
                  className={[
                    "mt-1.5 text-sm font-semibold",
                    isActive ? "text-white" : "text-ink-soft",
                  ].join(" ")}
                >
                  {s.name}
                </p>
                <p
                  className={[
                    "mt-0.5 text-[11px] leading-snug",
                    isActive ? "text-white/70" : "text-ink-muted",
                  ].join(" ")}
                >
                  지시 {s.directive} · 지원 {s.supportive}
                </p>
              </div>
            );
          })}
        </div>

        {/* x축 라벨 */}
        <div className="mt-2.5 text-center text-[10px] font-medium uppercase tracking-[0.15em] text-ink-muted">
          ← 지시적 행동 →
        </div>
      </div>
    </div>
  );
}
