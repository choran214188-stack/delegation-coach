import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "위임 나침반 · 블랜차드 SLII 진단",
  description:
    "위임할 업무와 구성원의 정보를 입력하면, 블랜차드 상황대응 리더십(SLII) 기준으로 발달수준과 리더십 스타일, 위임 실행 방법을 진단해 주는 리더십 교육용 도구입니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
