# 타로 (TAROT) — AI 타로 리딩 웹서비스

고민을 적고 카드를 직접 뽑으면, AI가 카드의 상징과 질문을 연결해 해석해 주는 웹서비스입니다.
타로를 미래를 맞히는 점괘가 아니라 **자기 성찰과 새로운 관점을 얻는 도구**로 다룹니다.

- **배포 URL:** https://taro-cody.vercel.app
- **GitHub:** https://github.com/riakwjddd06/tarot

## AI 대화 로그

이 프로젝트는 ChatGPT와 Claude, 두 AI 도구와 대화하며 개발했습니다.
개발하면서 두 도구와 나눈 대화 기록은 아래 링크에서 확인할 수 있습니다.

* **ChatGPT 개발 대화 로그** (서비스 기획, 프론트엔드·Flask 백엔드 구현, AI 답변 품질 문제 발견과 개선 방향 결정)
  * [ChatGPT 개발 대화 로그 보기](https://chatgpt.com/share/6acde122-30d8-83ee-802c-b67946a56578)

* **Claude 개발 대화 로그** (프로젝트 점검, Vercel 서버리스 함수 전환, 프롬프트 개선, 오류 진단·수정, 배포, 문서화)
  * [Claude 개발 대화 로그 보기](https://claude.ai/share/b9c14e9b-119c-4e86-a70d-1430aaffd3a9)

개발 중 겪은 오류와 해결 과정은 [11장](#11-개발-중-해결한-주요-오류)과 [AI 코딩 도구 사용 기록](docs/AI_코딩도구_사용기록.md)에 정리했습니다.

## 1. 서비스 개요

사용자가 고민 분야와 상세 질문을 입력하고 메이저 아르카나 카드 3장을 고르면,
Vercel Serverless Function(Python)이 OpenAI 호환 LLM API를 호출해 **과거·현재·미래·종합·조언** 리딩을 만들어 줍니다.
원하면 남은 카드 중 1~3장을 더 고르고 추가 질문을 해서 **2차 심층 리딩**(심층 해답·숨겨진 변수·실천과 변화·종합)을 받을 수 있습니다.

| 화면 | 설명 |
|---|---|
| 홈 | 서비스 소개와 시작 버튼 |
| 타로 보기 (질문 입력) | 고민 분야 선택, 상세 질문(최대 500자) 입력 |
| 카드 선택 | 메이저 아르카나 22장 중 서로 다른 3장을 과거·현재·미래에 배치 |
| AI 리딩 결과 | 과거·현재·미래·종합·조언 5개 항목 해석 |
| 심층 카드 선택 | 1차에서 쓴 3장을 뺀 19장 중 1~3장 추가 선택, 추가 질문 입력 |
| AI 심층 리딩 결과 | 심층 해답·숨겨진 변수·실천과 변화·종합 해석 |
| 이용 안내 | 사용 방법과 리딩 구성 설명 |

고민 분야: 전체 운세·오늘의 조언 / 연애 / 진로·학업 / 친구·가족·인간관계 / 건강·심리 / 금전

카드는 결과 화면에서 뒷면으로 시작해 순서대로 뒤집힙니다(클릭하면 다시 뒤집어 볼 수 있음).

## 2. 사용법

### 웹에서 사용하기

1. https://taro-cody.vercel.app 에 접속해 **타로 보기**를 누릅니다.
2. 고민 분야를 고르고 상세 질문을 입력합니다.
3. 카드 3장을 뽑아 과거·현재·미래에 놓고 **1차 AI 리딩 결과 확인하기**를 누릅니다.
4. (선택) 심층 카드 선택으로 이동해 추가 질문과 카드를 고르고 2차 심층 리딩을 받습니다.

AI 응답에는 수십 초가 걸릴 수 있습니다(로컬 측정에서 1차 리딩 약 40초). 요청 중에는 버튼이 비활성화됩니다.

### 로컬에서 실행하기

```bash
# 터미널 A: 백엔드 (http://127.0.0.1:5001)
source backend/.venv/bin/activate
python backend/app.py

# 터미널 B: 프론트엔드 (http://localhost:5173)
npm run dev
```

처음 설치할 때는 아래를 먼저 실행합니다.

```bash
npm install
python3 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
cp backend/.env.example backend/.env   # 열어서 값 입력
```

개발 중에는 프론트가 `http://127.0.0.1:5001/api/...`를, 배포 환경에서는 같은 도메인의 `/api/...`를 호출합니다.

## 3. 기술 스택

| 구분 | 기술 | 용도 |
|---|---|---|
| 프론트엔드 | HTML, CSS, JavaScript (프레임워크 없음) | 화면 구성, 스타일·반응형, 화면 전환과 `fetch` 호출 |
| 개발·빌드 도구 | Vite | 로컬 개발 서버와 배포용 빌드 (화면 코드에는 관여하지 않음) |
| 백엔드 | Python, Vercel Serverless Functions | `api/` 폴더의 엔드포인트에서 입력 검증과 AI 호출 |
| AI | OpenAI 호환 Chat Completions API (`openai` SDK), 모델 `claude-opus-4-8` | 1차·2차 타로 리딩 생성 |
| 배포 | GitHub, Vercel | main 브랜치에 push하면 자동 배포 |
| 로컬 개발 서버 | Flask | 로컬에서 `api/_core.py`를 재사용해 실행 (배포에는 사용하지 않음) |

### 의존성

| 구분 | 패키지 | 용도 |
|---|---|---|
| 프론트엔드 | `vite` | 개발 서버·빌드 도구 (화면 코드는 순수 HTML/CSS/JS) |
| 배포용 Python | `openai` | OpenAI 호환 API 호출 (`requirements.txt`) |
| 로컬 개발용 Python | `flask`, `flask-cors`, `python-dotenv` | 로컬 개발 서버 (`backend/requirements.txt`, 배포에는 사용하지 않음) |

필요한 것: Node.js 18 이상, Python 3.10 이상

## 4. API 키 설정

API 키는 코드에 넣지 않고 **환경 변수**로만 읽습니다.

| 이름 | 설명 | 예시 |
|---|---|---|
| `CODYSSEY_API_KEY` | AI API 키 | (비공개) |
| `CODYSSEY_BASE_URL` | OpenAI 호환 API 주소 | (제공받은 주소) |
| `CODYSSEY_MODEL` | 사용할 모델 ID | `claude-opus-4-8` |

- **로컬:** `backend/.env`에 위 세 값을 적습니다. `.env`는 `.gitignore`에 포함되어 git에 올라가지 않으며, 형식만 보여 주는 `backend/.env.example`만 저장소에 있습니다.
- **배포:** Vercel 프로젝트의 *Settings → Environment Variables*에 같은 이름으로 등록하고, 등록·변경 후 **재배포**해야 적용됩니다.

> API 키는 코드, README, 스크린샷, 커밋에 절대 넣지 않습니다.

## 5. 처리 흐름

```
질문 입력 → 입력 검증(프론트) → 카드 3장 선택 → POST /api/reading
  → 입력 검증(서버) → 프롬프트 구성 → AI 호출 → JSON 파싱·형식 검증 → 결과 화면 표시
  → (선택) 심층 카드·추가 질문 → POST /api/deep-reading → 같은 과정으로 2차 결과 표시
```

1. **프론트 검증:** 분야·질문 누락, 500자 제한, 카드 개수를 확인합니다.
2. **서버 검증:** 분야, 질문 길이, 카드 3장·중복 여부, 요청 크기(64KB)를 다시 확인합니다.
3. **프롬프트 구성:** 카드별 상징·빛의 면·그림자 면, 분야별 관점, 품질·안전 규칙을 합칩니다.
4. **AI 호출:** 서버에서만 키를 사용하며, 55초 안에 응답이 없으면 타임아웃으로 처리합니다.
5. **응답 검증:** JSON만 허용하고, 정해진 키(1차 5개, 2차 4개)와 내용이 있는지 확인한 뒤 화면에 표시합니다. 답변은 `escapeHTML`로 안전하게 출력합니다.

## 6. AI 답변이 평범해지지 않도록 한 설계

- 카드마다 **빛의 면 / 그림자 면**을 함께 제공해, 질문에 맞는 면을 AI가 고르고 이유를 밝히게 합니다.
- 고민 분야마다 **읽는 관점과 단정하면 안 되는 것**을 따로 지정합니다.
- 세 카드를 따로 설명하지 않고 **카드 사이의 관계(이어짐·충돌·반전)** 를 읽게 합니다.
- "자신을 믿으세요" 같은 **어떤 질문에도 붙는 문장을 금지**하고, 질문의 구체적인 표현을 직접 다루게 합니다.
- **2차 리딩은 1차의 종합·조언만** 참고 자료로 받아 반복을 피하고 새 관점을 더합니다. 선택한 카드 수(1·2·3장)에 따라 채워야 할 항목도 프롬프트에서 명확히 지정합니다.
- 상대의 속마음, 합격 여부, 투자 수익처럼 알 수 없는 것은 확정하지 않고, 건강·심리는 진단하지 않습니다.
- 사용자 입력은 `<user_question>` 태그로 감싸 "해석 대상일 뿐 지시가 아님"을 명시합니다.

## 7. 폴더 구조

```
tarot/
├─ index.html              # 프론트엔드 진입점
├─ src/
│  ├─ main.js              # 화면 전환, 입력 검증, fetch 호출
│  ├─ style.css            # 스타일, 반응형, 카드 뒤집기
│  └─ data/tarotCards.js   # 카드 데이터
├─ public/                 # 카드 이미지 등 정적 파일
├─ api/                    # 백엔드 (Vercel Serverless Functions, Python)
│  ├─ _core.py             # 검증 · 프롬프트 · AI 호출 공용 로직 (엔드포인트 아님)
│  ├─ reading.py           # POST /api/reading       1차 리딩
│  ├─ deep-reading.py      # POST /api/deep-reading  2차 심층 리딩
│  └─ health.py            # GET  /api/health        상태 확인
├─ backend/                # 로컬 개발용 Flask 서버 (api/_core.py 를 재사용)
│  ├─ app.py
│  └─ test_*.py            # 프롬프트·API 점검용 스크립트
├─ docs/                   # 서비스 기획서, AI 코딩 도구 사용 기록
├─ requirements.txt        # 배포용 Python 패키지
├─ vercel.json             # Vercel 설정
├─ vite.config.js          # 개발 서버 포트 고정(5173)
└─ package.json
```

## 8. 사용한 API

### `POST /api/reading` — 1차 리딩

요청:

```json
{
  "category": "전체 운세·오늘의 조언",
  "question": "내년(2027년)의 전반적인 운세가 궁금해요. 특히 재물운이 궁금해요.",
  "cards": ["major-07", "major-13", "major-18"]
}
```

응답: `{ "success": true, "cards": [...], "reading": { "past", "present", "future", "summary", "advice" } }`

### `POST /api/deep-reading` — 2차 심층 리딩

요청: 분야, 1차 질문, 1차 카드, 1차 리딩(종합·조언), 심층 카드 1~3장, 추가 질문

응답: `{ "success": true, "cards": [...], "reading": { "core", "hidden", "action", "summary" } }`
(선택하지 않은 카드의 `hidden` / `action`은 빈 문자열)

### `GET /api/health` — 상태 확인

`{ "status": "ok", "api_configured": true }` 형태로 서버 함수와 환경 변수 설정 여부를 알려 줍니다(키 값은 노출하지 않음).

### 외부 API

Codyssey가 제공하는 OpenAI 호환 Chat Completions 엔드포인트를 `openai` SDK로 호출하며, 모델은 `claude-opus-4-8`입니다.

## 9. 오류 처리

| 상황 | 상태 코드 | 사용자 안내 |
|---|---|---|
| 분야·질문·카드 입력 오류 | 400 | 항목별 안내 문구 (예: "상세 질문을 입력해 주세요.") |
| 요청 본문이 너무 큼 | 413 | "요청 내용이 너무 큽니다." |
| AI 환경 변수 미설정 | 503 | "AI API 설정을 확인해 주세요." |
| AI 응답 시간 초과 | 504 | "응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요." |
| AI 연결 실패 / 응답 형식 오류 / 길이 초과 | 502 | "다시 시도해 주세요." 안내 + 재시도 버튼 |
| 그 외 서버 오류 | 500 | "처리 중 문제가 발생했습니다." |
| 브라우저에서 서버에 연결 불가 | - | 배포: "인터넷 연결을 확인하고 잠시 후 다시 시도해 주세요." |

프론트에서도 60초 타임아웃과 요청 중 버튼 비활성화(중복 요청 방지)를 처리합니다.
서버 로그에는 오류 종류만 남기고 키나 사용자 입력은 기록하지 않습니다.

## 10. 배포 방법 (GitHub + Vercel)

1. 변경 사항을 커밋하고 GitHub에 push합니다.
2. [vercel.com](https://vercel.com)에서 **Add New → Project**로 GitHub 저장소 `tarot`를 가져옵니다.
3. Framework Preset이 **Vite**인지 확인합니다 (`vercel.json`에 지정되어 있습니다).
4. **Environment Variables**에 `CODYSSEY_API_KEY`, `CODYSSEY_BASE_URL`, `CODYSSEY_MODEL`을 등록하고 **Deploy**합니다.
5. 배포가 끝나면 `/api/health`를 열어 `"api_configured": true`인지 확인합니다.
6. 사이트에서 1차·2차 리딩을 직접 실행해 봅니다.

main 브랜치에 push하면 자동으로 재배포됩니다. 환경 변수만 바꿨다면 Vercel에서 **Redeploy**를 눌러야 합니다.

## 11. 개발 중 해결한 주요 오류

Claude와 대화하며 진단하고 해결한 오류입니다.

| 증상 | 원인 | 해결 |
|---|---|---|
| "AI 서버에 연결할 수 없습니다" + 사이트 주소가 5173에서 5174로 바뀜 | 이전 Vite 프로세스가 5173을 점유해 5174에서 열렸고, Flask CORS는 5173만 허용 | 남은 프로세스 종료, `vite.config.js`로 포트 고정 |
| 2차 심층 리딩이 502 "답변 형식이 올바르지 않습니다" | 카드 3장을 골랐는데 AI가 `hidden` 항목을 빈 문자열로 둠 | 선택한 카드 수에 따라 채워야 할 항목을 프롬프트에 명시 |
| 배포 시 `api/`가 Flask 앱을 import하는 구조 | 로컬용 구조를 그대로 사용 | 공용 로직을 `api/_core.py`로 분리하고 엔드포인트를 `handler` 클래스로 작성 |
| 카드가 매번 같은 순서로 깔려 위치를 외울 수 있음 | 카드 배열을 섞지 않고 데이터 순서 그대로 사용 | 피셔-예이츠 셔플로 리딩마다 순서를 섞고, 섞은 순서를 변수에 저장해 화면을 다시 그려도 유지되게 함 |

자세한 과정은 [AI 코딩 도구 사용 기록](docs/AI_코딩도구_사용기록.md)에 정리합니다.

## 12. 요구사항 체크리스트

미션 필수 요구사항 64개 항목을 실제 코드, 배포 URL, 문서 기준으로 점검한 결과입니다.

**판정 기준**
- ✅ 완료: 구현 및 정상 작동 확인
- ⚠️ 부분 충족: 구현 일부 완료, 추가 검증 또는 수정 필요
- ⬜ 미완료: 미구현, 미검증 또는 진행 전

### 전체 진행 현황

| 구분 | 전체 | 완료 | 부분 충족 | 미완료 |
|---|:---:|:---:|:---:|:---:|
| 1. 서비스 기획 | 7 | 7 | 0 | 0 |
| 2. 프로젝트 및 GitHub | 7 | 7 | 0 | 0 |
| 3. 프론트엔드 화면 구현 | 8 | 8 | 0 | 0 |
| 4. 반응형 적용 및 확인 | 6 | 6 | 0 | 0 |
| 5. AI 기능 UX 및 실패 처리 | 7 | 7 | 0 | 0 |
| 6. AI API 및 Python 백엔드 | 9 | 9 | 0 | 0 |
| 7. Vercel 배포 및 검증 | 7 | 7 | 0 | 0 |
| 8. 문서화 및 제출 패키지 | 12 | 12 | 0 | 0 |
| 9. 보너스 과제 — UX 고도화 | 1 | 1 | 0 | 0 |
| **합계** | **64** | **64** | **0** | **0** |

**완료: 64 / 64개 (100%)**

<details>
<summary><b>1. 서비스 기획 (7개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| 웹 서비스 아이디어 정의 | AI 타로 리딩 서비스 '타로' 기획 완료 | ✅ |
| 서비스 목적 정의 | 질문과 카드 해석을 통한 자기 성찰 및 고민에 대한 새로운 관점 제공 | ✅ |
| 타겟 사용자 정의 | 타로 관심자 및 고민에 대한 조언을 찾는 사용자 | ✅ |
| 3개 이상 페이지/섹션 설계 | 홈·질문 입력·1차 카드 선택·1차 결과·2차 카드 선택·2차 결과·이용 안내, 총 7개 화면 설계 | ✅ |
| 메뉴 이동 방식 설계 | 상단 홈·타로 보기·이용 안내 메뉴, 단계별 이전/다음, 결과 확인 및 새 리딩 시작 설계 | ✅ |
| AI 기능 1개 이상 설계 | 1차 기본 리딩과 2차 심층 리딩, 두 가지 맞춤형 AI 해석 기능 설계 | ✅ |
| AI 실패 처리 기준 설계 | 필수 입력 누락, 카드 선택 오류, API 실패, 응답 지연, 재시도 기준을 `docs/서비스_기획서.md` 7장에 정리 | ✅ |

</details>

<details>
<summary><b>2. 프로젝트 및 GitHub (7개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| 프로젝트 폴더 생성 | MacBook에서 tarot 프로젝트 폴더 생성, VS Code로 개발 | ✅ |
| 기본 파일 구조 구성 | `index.html`, `src/`(main.js·style.css·카드 데이터), `public/`(카드 이미지), `api/`, 루트 `requirements.txt`, `vercel.json` 구성 | ✅ |
| 프론트/백엔드 분리 | 프론트엔드(`index.html`, `src/`)와 배포용 백엔드(`api/`) 분리, 로컬 개발용 Flask는 `backend/`에 두고 `api/_core.py`를 함께 사용 | ✅ |
| GitHub 저장소 생성 | 전용 저장소 `riakwjddd06/tarot` 생성 | ✅ |
| GitHub 코드 업로드 | 프론트엔드·백엔드·카드 이미지·설정 파일·문서·스크린샷 업로드 | ✅ |
| 커밋 이력 관리 | 2026-10-09 ~ 10-14 기능별 커밋 20개 기록 | ✅ |
| 비밀 파일 업로드 방지 | `.gitignore`로 `.env`·`.venv`·`__pycache__`·`node_modules` 제외, `backend/.env.example`만 업로드, 커밋 이력 전체에서 키 미노출 확인 | ✅ |

</details>

<details>
<summary><b>3. 프론트엔드 화면 구현 (8개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| 순수 HTML/CSS/JS 사용 | React/Vue 없이 HTML·CSS·JavaScript로 구현, Vite는 개발·빌드 도구로만 사용 | ✅ |
| 메인 화면 구현 | 서비스명 '타로', 영문 부제, 과거·현재·미래 카드 요소, 소개 문구 및 시작 버튼 구현 | ✅ |
| 질문 입력 화면 구현 | 고민 분야 6개 선택, 상세 질문 입력, 500자 제한과 글자 수 표시 구현 | ✅ |
| 기본 카드 선택 화면 구현 | 메이저 아르카나 22장 중 서로 다른 3장 선택, 과거·현재·미래 슬롯 배치, 리딩마다 카드 순서 무작위 셔플 | ✅ |
| 심층 카드 선택 화면 구현 | 1차 카드 3장을 제외한 19장 중 1~3장 추가 선택(별도 셔플), 추가 질문 입력 구현 | ✅ |
| AI 결과 화면 구현 | 1차 결과와 2차 심층 결과 화면 분리, 카드 앞면·이름·AI 해석 표시 | ✅ |
| 이용 안내 화면 구현 | 서비스 사용 방법, 카드 선택 및 리딩 구성 설명 화면 구현 | ✅ |
| 메뉴와 단계 이동 구현 | 상단 메뉴, 이전/다음 버튼, 카드 개별 취소·전체 다시 뽑기, 결과 확인, 새 리딩 시작 및 초기화 구현 | ✅ |

</details>

<details>
<summary><b>4. 반응형 적용 및 확인 (6개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| 데스크톱 레이아웃 구현 | MacBook 화면 기준 카드·텍스트·버튼 배치 구현 | ✅ |
| 태블릿 레이아웃 구현 | 900px 미디어 쿼리 적용, 배포 URL을 iPad Air 크기(820×1180)로 확인 후 스크린샷 첨부 | ✅ |
| 모바일 레이아웃 구현 | 600px·480px 미디어 쿼리로 메뉴·카드·버튼 배치 조정 | ✅ |
| PC 화면 테스트 | 배포 URL에서 홈부터 2차 심층 결과까지 전체 화면 확인, 스크린샷 12장 첨부 | ✅ |
| 모바일 화면 테스트 | 배포 URL을 iPhone 크기(393×852)로 홈·질문 입력·AI 결과 확인, 스크린샷 첨부 | ✅ |
| 레이아웃 오류 수정 | 버튼 정렬·카드 배치 수정, 태블릿·모바일 크기에서 가로 넘침·겹침·잘림 없음 확인 | ✅ |

</details>

<details>
<summary><b>5. AI 기능 UX 및 실패 처리 (7개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| 사용자 입력 UI 제공 | 고민 분야, 필수 상세 질문, 심층 리딩 추가 질문 입력 기능 구현 | ✅ |
| AI 결과 화면 표시 | 1차 과거·현재·미래·종합·조언, 2차 심층 해답·숨겨진 변수·실천과 변화·종합 해석 표시 | ✅ |
| 고민 분야 누락 처리 | 미선택 시 진행 차단 및 "고민 분야를 선택해 주세요." 안내 | ✅ |
| 상세 질문 누락 처리 | 비어 있으면 진행 차단 및 "상세 질문을 입력해 주세요." 안내 | ✅ |
| 카드 선택 개수 검증 | 1차 3장 필수, 2차 1~3장, 중복 카드 및 1차·2차 카드 중복 선택 방지 | ✅ |
| API 오류 처리 | 서버 연결 실패·오류 응답·응답 형식 오류 시 안내 메시지와 다시 시도 버튼 제공 | ✅ |
| 응답 지연·중복 요청 처리 | 로딩 상태 표시, 60초 타임아웃 안내, 요청 중 버튼 비활성화 | ✅ |

</details>

<details>
<summary><b>6. AI API 및 Python 백엔드 (9개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| Python API 엔드포인트 구현 | Vercel 서버리스 함수 `api/reading.py`, `api/deep-reading.py`, `api/health.py` 구현 | ✅ |
| POST 요청 처리 | 분야·질문·선택 카드·1차 리딩 결과·추가 질문을 JSON으로 수신 | ✅ |
| 서버 입력 검증 | 필수값, 질문 500자, 요청 64KB, 카드 ID·개수·중복, 1차·2차 카드 중복 검증 | ✅ |
| AI API 연동 | Codyssey OpenAI 호환 API(`openai` SDK)로 배포 환경에서 1차·2차 AI 리딩 성공 확인 | ✅ |
| AI 프롬프트 구성 | 카드별 빛·그림자 면, 분야별 관점, 카드 간 관계, 뻔한 문장 금지, 입력 태그 분리 등 지시 구현 | ✅ |
| JSON 응답 반환 | 1차 5개 항목, 2차 4개 항목의 구조화된 결과 반환 및 서버에서 형식 검증 | ✅ |
| 프론트 fetch 연결 | 개발 중에는 로컬 Flask, 배포 환경에서는 상대 주소 `fetch('/api/...')` 사용 | ✅ |
| requirements.txt 관리 | 루트 `requirements.txt`에 배포용 `openai` 정의, 로컬 개발용 패키지는 `backend/requirements.txt`로 분리 | ✅ |
| 환경 변수 및 키 보안 | 키는 환경 변수로만 사용, Git 제외, Vercel 환경 변수 등록, 입력 크기·출력 토큰 제한과 중복 요청 방지로 호출 관리 | ✅ |

</details>

<details>
<summary><b>7. Vercel 배포 및 검증 (7개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| Vercel 프로젝트 연결 | GitHub 저장소를 Vercel에 연결, main 브랜치 push 시 자동 배포 | ✅ |
| Python 서버리스 함수 배포 | Flask 구조를 Vercel Python 서버리스 함수 형식으로 전환해 배포 | ✅ |
| 배포 환경 변수 등록 | `CODYSSEY_API_KEY`, `CODYSSEY_BASE_URL`, `CODYSSEY_MODEL` 등록, `/api/health`에서 `"api_configured": true` 확인 | ✅ |
| 공개 URL 확보 | https://taro-cody.vercel.app | ✅ |
| 페이지 이동 검증 | 배포 URL에서 홈·질문·1차/2차 카드·결과·이용 안내 이동 확인 | ✅ |
| 배포 환경 AI 기능 테스트 | 배포 URL에서 1차·2차 AI 리딩, 실패 처리, 모바일·태블릿 표시 확인 | ✅ |
| 오류 수정 및 재배포 | 배포 구조 문제·프롬프트 오류·카드 순서 고정 문제 수정 후 push로 재배포 (README 11장) | ✅ |

</details>

<details>
<summary><b>8. 문서화 및 제출 패키지 (12개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| README 서비스 소개 | 서비스 목적·화면 구성·주요 기능 작성 (1장) | ✅ |
| README 기술 스택 | HTML·CSS·JavaScript·Vite·Python·Vercel Serverless Functions·AI API·Flask 정리 (3장) | ✅ |
| README 실행 방법 | 로컬 프론트엔드·백엔드 설치 및 실행 명령어 작성 (2장) | ✅ |
| README 배포 방법 | GitHub·Vercel 연결, 환경 변수 등록, 재배포 절차 작성 (10장) | ✅ |
| README 배포 URL | https://taro-cody.vercel.app 기재 (상단) | ✅ |
| README 환경 변수 안내 | 환경 변수 3개의 이름과 로컬·배포 설정 방법 작성, 실제 키 미포함 (4장) | ✅ |
| 서비스 기획서 작성 | 목적·타겟·7개 화면·메뉴 이동·1차/2차 AI 기능·실패 처리·테스트 케이스 정리 (`docs/서비스_기획서.md`) | ✅ |
| AI 입출력·실패 기준 명시 | 1차/2차 요청 JSON, 응답 구조, 상태 코드별 오류·타임아웃 기준 문서화 (README 8·9장, 기획서 6·7장) | ✅ |
| 데스크톱 스크린샷 | 홈부터 2차 심층 결과까지 12장 (`docs/screenshots/`) | ✅ |
| 모바일 스크린샷 | 홈·질문 입력·1차 결과 등 모바일 크기 화면 첨부, 태블릿 화면도 추가 | ✅ |
| AI 동작 증빙 | 질문 입력 → 카드 선택 → 1차·2차 AI 결과까지 스크린샷으로 증빙 | ✅ |
| AI 코딩 도구 활용 증빙 | ChatGPT·Claude 대화 로그 링크(상단), `docs/AI_코딩도구_사용기록.md`, 오류 해결 과정(11장) | ✅ |

</details>

<details>
<summary><b>9. 보너스 과제 — UX 고도화 (1개)</b></summary>

| 요구사항 | 현재 상태 | 판정 |
|---|---|:---:|
| 카드 뒤집기 마이크로 인터랙션 구현 | CSS `rotateY` 카드 뒤집기 애니메이션 구현, 결과 화면에서 순서대로 공개·클릭 시 다시 뒤집기, `prefers-reduced-motion` 대응 | ✅ |

</details>

> 이 판정은 GitHub 저장소의 코드·커밋 이력·문서, 배포 URL(`/api/health` 포함)과 스크린샷을 기준으로 점검한 결과입니다.

## 13. 보안 체크리스트

- [x] API 키는 환경 변수로만 사용하고 코드에 직접 적지 않았다.
- [x] `.env`는 `.gitignore`에 포함되어 있고, 저장소에는 `backend/.env.example`만 있다.
- [x] 커밋 전에 코드와 모든 파일에서 실제 키 값이 없는지 검사했다.
- [x] 키는 서버(Vercel 함수)에서만 사용하며 브라우저로 전달되지 않는다.
- [x] 사용자 입력은 `<user_question>` 태그로 감싸 지시로 해석되지 않게 했다.
- [x] 질문 500자, 요청 본문 64KB로 입력 크기를 제한했다.
- [x] AI 답변은 `escapeHTML`로 이스케이프해 출력한다.
- [x] 스크린샷과 대화 로그에 API 키·`.env` 내용이 보이지 않는지 제출 전 확인한다.

## 14. 샘플 실행

| 단계 | 내용 |
|---|---|
| 고민 분야 | 전체 운세·오늘의 조언 |
| 1차 질문 | 내년(2027년)의 전반적인 운세가 궁금해요. 특히 재물운이 궁금해요. |
| 카드 | 3장을 직접 선택 (결과 화면에서 순서대로 뒤집힘) |
| 1차 결과 | 과거·현재·미래·종합·조언 5개 항목 |
| 2차 추가 질문 | 2027년 상반기 연애운은 어떤가요? |
| 2차 결과 | 심층 해답·숨겨진 변수·실천과 변화·심층 종합 리딩 |

### 화면 스크린샷

https://taro-cody.vercel.app 에서 촬영한 화면입니다.

#### 데스크톱

**1. 홈**

<img src="docs/screenshots/01_desktop_home.png" width="720" alt="데스크톱 홈 화면">

**2. 질문 입력**

<img src="docs/screenshots/02_desktop_question.png" width="720" alt="데스크톱 질문 입력 화면">

**3. 카드 선택**

<img src="docs/screenshots/03_desktop_cards1.png" width="360" alt="데스크톱 카드 선택 1"> <img src="docs/screenshots/03_desktop_cards2.png" width="360" alt="데스크톱 카드 선택 2">

**4. 1차 AI 리딩 결과**

<img src="docs/screenshots/04_desktop_result1.png" width="240" alt="1차 AI 리딩 결과 1"> <img src="docs/screenshots/04_desktop_result2.png" width="240" alt="1차 AI 리딩 결과 2"> <img src="docs/screenshots/04_desktop_result3.png" width="240" alt="1차 AI 리딩 결과 3">

**5. 2차 심층 카드 선택**

<img src="docs/screenshots/05_desktop_deep_cards1.png" width="360" alt="2차 카드 선택 1"> <img src="docs/screenshots/05_desktop_deep_cards2.png" width="360" alt="2차 카드 선택 2">

**6. 2차 심층 리딩 결과**

<img src="docs/screenshots/06_desktop_deep_result1.png" width="240" alt="2차 심층 리딩 결과 1"> <img src="docs/screenshots/06_desktop_deep_result2.png" width="240" alt="2차 심층 리딩 결과 2"> <img src="docs/screenshots/06_desktop_deep_result3.png" width="240" alt="2차 심층 리딩 결과 3">

#### 모바일

**7. 홈**

<img src="docs/screenshots/07_mobile_home.png" width="360" alt="모바일 홈 화면">

**8. 질문 입력**

<img src="docs/screenshots/08_mobile_question.png" width="360" alt="모바일 질문 입력 화면">

**9. 1차 AI 리딩 결과**

<img src="docs/screenshots/09_mobile_result1.png" width="240" alt="모바일 1차 결과 1"> <img src="docs/screenshots/09_mobile_result2.png" width="240" alt="모바일 1차 결과 2"> <img src="docs/screenshots/09_mobile_result3.png" width="240" alt="모바일 1차 결과 3">

#### 태블릿

Safari 반응형 디자인 모드에서 iPad Air 크기(820×1180)로 확인한 화면입니다.

**10. 홈**

<img src="docs/screenshots/10_tablet_home.png" width="300" alt="태블릿 홈 화면">

**11. 질문 입력**

<img src="docs/screenshots/11_tablet_question.png" width="300" alt="태블릿 질문 입력 화면">

**12. 1차 AI 리딩 결과**

<img src="docs/screenshots/12_tablet_result1.png" width="300" alt="태블릿 1차 결과 화면 1"> <img src="docs/screenshots/12_tablet_result2.png" width="300" alt="태블릿 1차 결과 화면 2"> 

## 15. 한계

- 메이저 아르카나 22장만 사용합니다.
- 리딩 결과를 저장하지 않으며, 새로고침하면 처음부터 다시 시작합니다.
- 성능이 높은 모델을 사용해 응답에 수십 초가 걸릴 수 있습니다.
- AI 답변은 매번 달라질 수 있습니다.

## 면책

타로는 미래를 확정하는 예언이 아니라 자신의 상황을 돌아보기 위한 상징적 해석입니다.
건강·심리·금전 관련 내용은 전문가의 조언을 대체하지 않습니다.