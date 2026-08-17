# 위임 코치 · 블랜차드 SLII 진단

위임하려는 **업무**와 그 일을 맡길 **팀원의 상황·성향**을 자유롭게 입력하면, 켄 블랜차드의 상황대응 리더십 II(Situational Leadership® II, SLII) 모델을 기준으로

- 그 팀원이 **이 업무에 대해** 어느 발달수준(D1~D4)에 있는지
- 리더가 지금 어떤 스타일(S1~S4)로 지원해야 하는지
- 구체적인 지원 방법·주의점·대화 시작 멘트

를 AI가 분석해서 보여주는 리더십 교육용 웹 애플리케이션입니다.

> 이 결과는 인사평가나 심리진단이 아니라, 위임·코칭을 돕기 위한 **교육용 참고 도구**입니다. 점수나 등급은 매기지 않습니다.

## 모델 개요

| 발달수준 (팀원) | 역량 × 의욕 | 권장 스타일 (리더) |
| --- | --- | --- |
| D1 열정적 초심자 | 역량 낮음 · 의욕 높음 | **S1 지시형** (지시↑ 지원↓) |
| D2 좌절한 학습자 | 역량 중간 · 의욕 낮음 | **S2 코칭형** (지시↑ 지원↑) |
| D3 유능하나 신중한 실행자 | 역량 높음 · 의욕 변동 | **S3 지원형** (지시↓ 지원↑) |
| D4 자기주도적 성취자 | 역량 높음 · 의욕 높음 | **S4 위임형** (지시↓ 지원↓) |

## 1. 설치

```bash
npm install
```

Node.js 18.17 이상이 필요합니다. (개발·검증은 Node 20에서 진행)

## 2. 환경변수 설정

`.env.example` 을 복사해 `.env.local` 을 만듭니다.

```bash
cp .env.example .env.local
```

| 변수 | 설명 | 기본값 |
| --- | --- | --- |
| `LLM_PROVIDER` | 사용할 Provider (`openai` \| `anthropic` \| `mock`) | 자동 판별 |
| `OPENAI_API_KEY` | OpenAI API Key. 비어 있으면 자동으로 예시(Mock) 모드 | (없음) |
| `OPENAI_MODEL` | 사용할 OpenAI 모델 | `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | (선택) Anthropic API Key | (없음) |
| `ANTHROPIC_MODEL` | (선택) Anthropic 모델 | `claude-sonnet-5` |

Provider 미지정 시 OpenAI 키 → Anthropic 키 → Mock 순으로 자동 선택됩니다.
API Key는 서버 라우트(`src/app/api/**`)에서만 사용하며 클라이언트 번들에 포함되지 않습니다.

## 3. 개발 서버 실행

```bash
npm run dev
# http://localhost:3000
```

키 없이도 예시(Mock) 모드로 화면 흐름을 확인할 수 있습니다.

## 4. 프로덕션 빌드

```bash
npm run build
npm start
```

## 5. Railway 배포

이 저장소는 `Dockerfile` + `railway.json` 으로 배포하도록 설정되어 있습니다.

1. [Railway](https://railway.app) → **New Project → Deploy from GitHub repo** 로 이 저장소를 연결합니다.
2. 서비스가 이 하위 폴더에 있으므로, 서비스 **Settings → Root Directory** 를 `delegation-coach` 로 지정합니다.
3. **Variables** 에 `ANTHROPIC_API_KEY` (및 필요 시 `ANTHROPIC_MODEL`)를 추가합니다.
4. **Networking → Generate Domain** 으로 공개 URL을 만듭니다.

Railway가 `PORT` 를 주입하며 `next start` 가 자동으로 그 포트에 바인딩됩니다.

## 구조

```
src/
  app/
    page.tsx              # 입력 폼 + 결과 화면 (클라이언트)
    layout.tsx
    globals.css
    api/diagnose/route.ts # 진단 API (서버 전용, 키 사용)
  components/
    ResultView.tsx        # 진단 결과 카드
    SliiGrid.tsx          # SLII 2x2 지도
  config/
    blanchard.ts          # D1~D4 / S1~S4 정의
  lib/
    llm/                  # Provider 추상화 (anthropic / mock)
    diagnose/             # 프롬프트 + 응답 검증(zod)
  types/
    diagnosis.ts
```
