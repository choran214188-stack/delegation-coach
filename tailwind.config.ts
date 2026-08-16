import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#F5F3EE", // 웜 페이퍼 배경
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1B2537", // 딥 네이비 (본문·다크 요소)
          soft: "#3C4863",
          muted: "#79839A",
        },
        line: "#E7E2D6", // 웜 헤어라인
        gold: {
          DEFAULT: "#A9843C", // 브라스 골드 (절제된 포인트)
          soft: "#C9AE70",
          pale: "#F3EBD8",
        },
        sage: { DEFAULT: "#4F7A66", pale: "#EEF3F0" }, // 지원(긍정) 톤
        clay: { DEFAULT: "#AE5B3C", pale: "#F8EEE8" }, // 주의(경고) 톤
      },
      boxShadow: {
        soft: "0 1px 2px rgba(27,37,55,0.04), 0 10px 30px -18px rgba(27,37,55,0.16)",
        panel: "0 1px 2px rgba(27,37,55,0.05), 0 30px 60px -32px rgba(27,37,55,0.22)",
        gold: "0 10px 30px -14px rgba(169,132,60,0.45)",
      },
      keyframes: {
        rise: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        rise: "rise 0.5s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};
export default config;
