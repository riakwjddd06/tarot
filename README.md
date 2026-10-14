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

자세한 과정은 [AI 코딩 도구 사용 기록](docs/AI_코딩도구_사용기록.md)에 정리합니다.

## 12. 요구사항 체크리스트

| 항목 | 상태 |
|---|---|
| 서비스 기획 (목적, 대상, 페이지, AI 기능, 실패 처리) | ✅ |
| 순수 HTML/CSS/JS 프론트엔드, 3개 이상 화면과 메뉴 이동 | ✅ |
| Python Serverless Function 3개 (`reading`, `deep-reading`, `health`) | ✅ |
| AI API 연동과 JSON 응답 | ✅ |
| 입력 검증과 AI 실패 처리 (400/413/502/503/504) | ✅ |
| 환경 변수로 키 관리, `.env` 미업로드 | ✅ |
| GitHub 저장소와 커밋 이력 | ✅ |
| Vercel 배포와 공개 URL | ✅ |
| 데스크톱·태블릿·모바일 반응형 | ✅ |
| 카드 뒤집기 마이크로 인터랙션(보너스) | ✅ |
| README (소개, 기술 스택, 실행·배포 방법, 배포 URL, 환경 변수) | ✅ |
| 서비스 기획서 | ✅ `docs/서비스_기획서.md` |
| AI 대화 로그 (ChatGPT, Claude) | ✅ 상단 |
| 데스크톱·태블릿·모바일·AI 동작 스크린샷 | ✅ `docs/screenshots/` |

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