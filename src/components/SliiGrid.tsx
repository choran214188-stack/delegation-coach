import {
  LEADERSHIP_STYLES,
  type LeadershipStyle,
  type DevelopmentLevel,
} from "@/config/blanchard";

/**
 * SLII 2x2 그리드.
 * x축 = 지시적 행동(Directive), y축 = 지원적 행동(Supportive).
 *   S3(위 왼쪽)  S2(위 오른쪽)
 *   S4(아래 왼쪽) S1(아래 오른쪽)
 * 진단된 스타일 칸을 강조한다.
 */
const CELL_ORDER: LeadershipStyle[] = ["S3", "S2", "S4", "S1"]; // grid row-major, top row then bottom

const STYLE_TO_LEVEL: Record<LeadershipStyle, DevelopmentLevel> = {
  S1: "D1",
  S2: "D2",
  S3: "D3",
  S4: "D4",
};

export function SliiGrid({ active }: { active: LeadershipStyle }) {
  return (
    <div className="w-full">
      <div className="flex">
        {/* y축 라벨 */}
        <div className="flex w-6 items-center justify-center">
          <span className="whitespace-nowrap text-xs font-medium tracking-wide text-slate-500 [writing-mode:vertical-rl] rotate-180">
            지원적 행동 (높음 →)
          </span>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-2 gap-2">
            {CELL_ORDER.map((id) => {
              const s = LEADERSHIP_STYLES[id];
              const isActive = id === active;
              return (
                <div
                  key={id}
                  className={[
                    "rounded-xl border p-3 transition",
                    isActive
                      ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-400"
                      : "border-slate-200 bg-white",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={[
                        "text-sm font-bold",
                        isActive ? "text-indigo-700" : "text-slate-400",
                      ].join(" ")}
                    >
                      {s.id} · {s.name}
                    </span>
                    <span
                      className={[
                        "rounded-full px-2 py-0.5 text-[11px] font-medium",
                        isActive ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400",
                      ].join(" ")}
                    >
                      {STYLE_TO_LEVEL[id]}
                    </span>
                  </div>
                  <p
                    className={[
                      "mt-1 text-[11px] leading-snug",
                      isActive ? "text-indigo-600" : "text-slate-400",
                    ].join(" ")}
                  >
                    지시 {s.directive} · 지원 {s.supportive}
                  </p>
                </div>
              );
            })}
          </div>

          {/* x축 라벨 */}
          <div className="mt-2 text-center text-xs font-medium tracking-wide text-slate-500">
            지시적 행동 (← 낮음 &nbsp;·&nbsp; 높음 →)
          </div>
        </div>
      </div>
    </div>
  );
}
