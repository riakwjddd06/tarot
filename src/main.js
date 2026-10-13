

import './style.css'

import {
  getFirstReadingCards,
  getCardById,
  tarotCardBackImage,
} from './data/tarotCards.js'

// ==================================
// 1. 기본 설정
// ==================================

const app = document.querySelector('#app')



const pageNames = {
  home: '홈',
  reading: '타로 보기',
  cards: '카드 선택',
  result: 'AI 리딩 결과',
  deepCards: '심층 리딩 카드 선택',
  deepResult: 'AI 심층 리딩 결과',
  guide: '이용 안내',
}



const categories = [
  '연애',
  '진로·학업',
  '친구·가족·인간관계',
  '건강·심리',
  '금전',
  '전체 운세·오늘의 조언',
]

const STORAGE_KEY = 'tarot-question'
const CARDS_KEY = 'tarot-selected-cards'

let currentPage = 'home'

let questionData = {
  category: '',
  question: '',
}

// 선택 순서대로 카드 ID 저장
let selectedCards = []


/* 2차 심층 리딩 카드 및 추가 질문 */
let deepSelectedCards = []
let deepQuestion = ''


const DEEP_STORAGE_KEY = 'tarot-deep-reading'

function saveDeepReading() {
  sessionStorage.setItem(
    DEEP_STORAGE_KEY,
    JSON.stringify({
      cards: deepSelectedCards,
      question: deepQuestion
    })
  )
}

function loadDeepReading() {
  const saved = sessionStorage.getItem(DEEP_STORAGE_KEY)

  if (!saved) return

  try {
    const data = JSON.parse(saved)

    if (!data || !Array.isArray(data.cards)) {
      sessionStorage.removeItem(DEEP_STORAGE_KEY)
      return
    }

    const validIds = new Set(
      getFirstReadingCards().map(card => card.id)
    )

    const cardIds = data.cards.filter(id => id != null)

    const validCards =
      data.cards.length <= 3 &&
      new Set(cardIds).size === cardIds.length &&
      cardIds.every(id =>
        validIds.has(id) && !selectedCards.includes(id)
      )

    if (!validCards) {
      sessionStorage.removeItem(DEEP_STORAGE_KEY)
      return
    }

    deepSelectedCards = data.cards.map(id => id ?? null)

    deepQuestion =
      typeof data.question === 'string'
        ? data.question.slice(0, 500)
        : ''

  } catch {
    sessionStorage.removeItem(DEEP_STORAGE_KEY)
  }
}

function resetDeepReading() {
  deepSelectedCards = []
  deepQuestion = ''
  sessionStorage.removeItem(DEEP_STORAGE_KEY)
}


function getDeepSelectedCardCount() {
  return deepSelectedCards.filter(cardId => cardId != null).length
}

function getNextDeepEmptySlotIndex() {
  for (let i = 0; i < 3; i++) {
    if (deepSelectedCards[i] == null) {
      return i
    }
  }

  return -1
}



/**
 * 과거, 현재, 미래 중
 * 아직 카드가 없는 첫 번째 자리 찾기
 *
 * 반환값:
 * 0 = 과거
 * 1 = 현재
 * 2 = 미래
 * -1 = 빈자리 없음
 */
function getNextEmptySlotIndex() {
  for (let i = 0; i < 3; i++) {
    if (selectedCards[i] == null) {
      return i
    }
  }

  return -1
}

function getSelectedCardCount() {
  return selectedCards.filter(cardId => cardId != null).length
}


// ==================================
// 7-6. AI 리딩 요청 상태
// ==================================

// 서버에 연결하지 못했을 때 안내 문구
// 개발 중에는 Flask 서버 실행 여부를, 배포 환경에서는 네트워크 확인을 안내합니다.
const CONNECTION_ERROR_MESSAGE = import.meta.env.DEV
  ? 'AI 서버에 연결할 수 없습니다. Flask 서버가 실행 중인지 확인해 주세요.'
  : 'AI 서버에 연결할 수 없습니다. 인터넷 연결을 확인하고 잠시 후 다시 시도해 주세요.'

const AI_API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:5001/api/reading'
  : '/api/reading'


// idle: 대기 / loading: 요청 중
// success: 성공 / error: 실패
let aiReadingStatus = 'idle'

// AI 오류 메시지
let aiReadingError = ''

// AI가 반환한 다섯 항목의 해석
let aiReadingResult = null



 // ==========================================
 // 9-2-5-3-7. 2차 AI 심층 리딩 상태 및 저장
 // ==========================================

let deepAIStatus = 'idle'
let deepAIError = ''
let deepAIResult = null


const DEEP_AI_API_URL = import.meta.env.DEV
  ? 'http://127.0.0.1:5001/api/deep-reading'
  : '/api/deep-reading'

const DEEP_AI_RESULT_KEY = 'tarot-deep-ai-result'

// 심층 AI 결과 저장
function saveDeepAIResult() {
  if (deepAIStatus !== 'success' || !deepAIResult) return

  sessionStorage.setItem(
    DEEP_AI_RESULT_KEY,
    JSON.stringify({
      reading: deepAIResult,
      firstCards: [...selectedCards],
      firstReading: aiReadingResult,
      deepCards: [...deepSelectedCards],
      deepQuestion: deepQuestion,
      category: questionData.category,
      question: questionData.question
    })
  )
}

// 저장된 심층 AI 결과 불러오기
function loadDeepAIResult() {
  const saved = sessionStorage.getItem(DEEP_AI_RESULT_KEY)

  if (!saved) return

  try {
    const data = JSON.parse(saved)

    const validReading =
      data &&
      data.reading &&
      typeof data.reading.core === 'string' &&
      data.reading.core.trim().length > 0 &&
      typeof data.reading.summary === 'string' &&
      data.reading.summary.trim().length > 0 &&
      typeof data.reading.hidden === 'string' &&
      typeof data.reading.action === 'string'

    const validFirstCards =
      Array.isArray(data.firstCards) &&
      JSON.stringify(data.firstCards) === JSON.stringify(selectedCards)

    const validDeepCards =
      Array.isArray(data.deepCards) &&
      JSON.stringify(data.deepCards) === JSON.stringify(deepSelectedCards)

    const validQuestions =
      data.category === questionData.category &&
      data.question === questionData.question &&
      data.deepQuestion === deepQuestion

    const validFirstReading =
      aiReadingStatus === 'success' &&
      aiReadingResult &&
      JSON.stringify(data.firstReading) === JSON.stringify(aiReadingResult)

    const cardCount = getDeepSelectedCardCount()

    const validCardReading =
      cardCount >= 1 &&
      cardCount <= 3 &&
      Boolean(deepSelectedCards[0]) &&
      (cardCount < 2 || Boolean(data.reading.hidden.trim())) &&
      (cardCount < 3 || Boolean(data.reading.action.trim()))

    if (
      validReading &&
      validFirstCards &&
      validDeepCards &&
      validQuestions &&
      validFirstReading &&
      validCardReading
    ) {
      deepAIResult = data.reading
      deepAIStatus = 'success'
      deepAIError = ''
    } else {
      sessionStorage.removeItem(DEEP_AI_RESULT_KEY)
    }

  } catch {
    sessionStorage.removeItem(DEEP_AI_RESULT_KEY)
  }
}

// 심층 AI 결과 초기화
function resetDeepAIReading() {
  deepAIStatus = 'idle'
  deepAIError = ''
  deepAIResult = null

  sessionStorage.removeItem(DEEP_AI_RESULT_KEY)
}



// ==========================================
// 상단 메뉴로 새로 시작할 때 모든 리딩 초기화
// ==========================================

function resetAllTarotData() {
  // 고민 분야 및 상세 질문 초기화
  questionData = {
    category: '',
    question: ''
  }
  saveQuestion()

  // 1차 카드 선택 및 AI 리딩 결과 초기화
  resetSelectedCards()

  // 2차 카드 선택 및 추가 질문 초기화
  resetDeepReading()

  // 2차 AI 리딩 결과 초기화
  resetDeepAIReading()
}




const AI_RESULT_STORAGE_KEY = 'tarot-ai-reading-result'

// 1차 AI 리딩 결과 저장
function saveAIReadingResult() {
  if (aiReadingStatus !== 'success' || !aiReadingResult) {
    return
  }

  sessionStorage.setItem(
    AI_RESULT_STORAGE_KEY,
    JSON.stringify({
      reading: aiReadingResult,
      cards: [...selectedCards],
      category: questionData.category,
      question: questionData.question
    })
  )
}

// 저장된 1차 AI 리딩 결과 불러오기
function loadAIReadingResult() {
  const saved = sessionStorage.getItem(AI_RESULT_STORAGE_KEY)

  if (!saved) return

  try {
    const data = JSON.parse(saved)

    const keys = [
      'past',
      'present',
      'future',
      'summary',
      'advice'
    ]

    const validReading =
      data &&
      data.reading &&
      keys.every(key =>
        typeof data.reading[key] === 'string' &&
        data.reading[key].trim().length > 0
      )

    const validCards =
      Array.isArray(data.cards) &&
      data.cards.length === 3 &&
      selectedCards.length === 3 &&
      data.cards.every(
        (cardId, index) => cardId === selectedCards[index]
      )

    const validQuestion =
      data.category === questionData.category &&
      data.question === questionData.question

    if (validReading && validCards && validQuestion) {
      aiReadingResult = data.reading
      aiReadingStatus = 'success'
      aiReadingError = ''
    } else {
      sessionStorage.removeItem(AI_RESULT_STORAGE_KEY)
    }

  } catch {
    sessionStorage.removeItem(AI_RESULT_STORAGE_KEY)
  }
}


// 이전 AI 리딩 상태 초기화
function resetAIReading() {
  aiReadingStatus = 'idle'
  aiReadingError = ''
  aiReadingResult = null

  // 저장되어 있던 이전 AI 결과도 삭제
  sessionStorage.removeItem(AI_RESULT_STORAGE_KEY)
}



// ==================================
// 2. 데이터 저장 및 불러오기
// ==================================

function saveQuestion() {
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(questionData)
  )
}

function loadQuestion() {
  const saved = sessionStorage.getItem(STORAGE_KEY)

  if (!saved) return

  try {
    const data = JSON.parse(saved)

    if (
      data &&
      categories.includes(data.category) &&
      typeof data.question === 'string'
    ) {
      questionData = {
        category: data.category,
        question: data.question.slice(0, 500),
      }
    }
  } catch {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

function saveSelectedCards() {
  sessionStorage.setItem(
    CARDS_KEY,
    JSON.stringify(selectedCards)
  )
}


function loadSelectedCards() {
  const saved = sessionStorage.getItem(CARDS_KEY)

  if (!saved) return

  try {
    const data = JSON.parse(saved)

    if (!Array.isArray(data) || data.length > 3) {
      sessionStorage.removeItem(CARDS_KEY)
      return
    }

    const validIds = new Set(
      getFirstReadingCards().map(card => card.id)
    )

    const selectedIds = data.filter(id => id != null)

    const isValid =
      new Set(selectedIds).size === selectedIds.length &&
      selectedIds.every(id => validIds.has(id))

    if (isValid) {
      selectedCards = data.map(id => id ?? null)
    } else {
      sessionStorage.removeItem(CARDS_KEY)
    }

  } catch {
    sessionStorage.removeItem(CARDS_KEY)
  }
}



function resetSelectedCards() {
  selectedCards = []
  saveSelectedCards()
  resetAIReading()
}


// 사용자 입력을 HTML에 안전하게 표시
function escapeHTML(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function isQuestionValid() {
  return (
    categories.includes(questionData.category) &&
    questionData.question.trim().length > 0
  )
}

// ==================================
// 3. 공통 상단 메뉴
// ==================================

function createHeader() {
  return `
    <header class="site-header">
      <a href="#home" class="site-logo" data-page="home">
        ✦ 타로
      </a>

      <nav class="site-nav" aria-label="주 메뉴">
        <a href="#home" data-page="home">홈</a>
        <a href="#reading" data-page="reading">타로 보기</a>
        <a href="#guide" data-page="guide">이용 안내</a>
      </nav>
    </header>
  `
}

// ==================================
// 4. 메인 화면
// ==================================

function createHomePage() {
  return `
    <section class="hero">

      <p class="eyebrow">✦ THE TAROT READING ✦</p>

      <h1>타로</h1>

      <p class="hero-subtitle">
        TAROT — AI 타로 리딩 웹서비스
      </p>

      <div class="tarot-preview" aria-hidden="true">
        <div class="preview-card">
          <span>☽</span>
          <small>PAST</small>
        </div>

        <div class="preview-card">
          <span>✧</span>
          <small>PRESENT</small>
        </div>

        <div class="preview-card">
          <span>☼</span>
          <small>FUTURE</small>
        </div>
      </div>

      <h2>당신의 고민을 카드에 담아보세요.</h2>

      <p class="hero-description">
        마음속에 품고 있던 질문을 떠올려 보세요.<br>
        당신이 직접 선택한 타로 카드에<br>
        AI의 해석을 더해 새로운 관점을 제안합니다.
      </p>

      <button class="primary-button" data-page="reading">
        타로 보기 <span aria-hidden="true">→</span>
      </button>

      <p class="hero-note">
        타로는 미래를 확정하는 예언이 아닌,
        자신을 돌아보기 위한 하나의 방법입니다.
      </p>

    </section>
  `
}

// ==================================
// 5. 질문 입력 화면
// ==================================

function createReadingPage() {
  const categoryButtons = categories.map(category => {
    const isSelected = questionData.category === category

    return `
      <label class="category-option ${isSelected ? 'selected' : ''}">
        <input
          type="radio"
          name="category"
          value="${category}"
          ${isSelected ? 'checked' : ''}
        />
        <span>${category}</span>
      </label>
    `
  }).join('')

  return `
    <section class="content-page reading-page">

      <p class="eyebrow">✦ TAROT READING ✦</p>

      <h1>오늘은 무엇이 궁금한가요?</h1>

      <p class="page-description">
        마음속에 품고 있는 고민을 들려주세요.<br>
        질문을 구체적으로 작성하면 더 깊은 해석을 받을 수 있습니다.
      </p>

      <form id="question-form" class="question-form" novalidate>

        <fieldset class="form-fieldset">
          <legend class="field-label">
            고민 분야 <span class="required">*</span>
          </legend>

          <div class="category-grid">
            ${categoryButtons}
          </div>

          <p id="category-error"
             class="error-message"
             role="alert"></p>
        </fieldset>

        <div class="form-group">

          <label for="detail-question" class="field-label">
            상세 질문 <span class="required">*</span>
          </label>

          <textarea
            id="detail-question"
            name="question"
            maxlength="500"
            rows="6"
            placeholder="예: 앞으로 어떤 방향으로 진로를 준비하면 좋을까요?"
            aria-describedby="question-help question-error"
          >${escapeHTML(questionData.question)}</textarea>

          <div class="question-meta">
            <p id="question-help">
              구체적인 상황과 궁금한 내용을 자유롭게 작성해 보세요.
            </p>

            <span id="character-count">
              ${questionData.question.length} / 500자
            </span>
          </div>

          <p id="question-error"
             class="error-message"
             role="alert"></p>
        </div>

        <div class="form-actions">
          <button type="button"
                  class="secondary-button"
                  data-page="home">
            ← 홈으로
          </button>

          <button type="submit" class="primary-button">
            카드 선택하러 가기 →
          </button>
        </div>
      </form>

      <p class="guide-notice">
        질문 내용은 현재 브라우저 탭에 임시 저장됩니다.<br>
        민감한 개인정보는 입력하지 않는 것을 권장합니다.
      </p>

    </section>
  `
}

// ==================================
// 6. 카드 선택 슬롯 생성
// ==================================



function createSelectedSlots() {
  const positions = [
    { name: '과거', en: 'PAST' },
    { name: '현재', en: 'PRESENT' },
    { name: '미래', en: 'FUTURE' }
  ]

  return positions.map((position, index) => {
    const cardId = selectedCards[index]
    const card = cardId ? getCardById(cardId) : null

    if (card) {
      return `
        <div class="selected-slot">
          <button
            type="button"
            class="slot-face is-revealed selected-card-remove"
            style="width:100%;height:100%;aspect-ratio:971/1619;"
            data-remove-slot="${index}"
            aria-label="${position.name} 카드 선택 취소"
            title="클릭하면 이 카드만 취소됩니다"
          >
            <img
              src="${tarotCardBackImage}"
              alt="선택된 타로 카드 뒷면"
              draggable="false"
            />
          </button>

          <span class="slot-position">${position.name}</span>
          <span class="slot-position-en">${position.en}</span>
        </div>
      `
    }

    return `
      <div class="selected-slot">
        <div class="slot-face is-empty">
          <span class="slot-empty-icon">✧</span>
          <span class="slot-empty-text">선택 대기</span>
        </div>

        <span class="slot-position">${position.name}</span>
        <span class="slot-position-en">${position.en}</span>
      </div>
    `
  }).join('')
}



// ==================================
// 7. 선택 가능한 카드 22장 생성
// ==================================

function createCardDeck() {
  return getFirstReadingCards().map(card => {
    const selected = selectedCards.includes(card.id)
    const order = selectedCards.indexOf(card.id) + 1

    return `
      <button
        type="button"
        class="deck-card ${selected ? 'is-selected' : ''}"
        data-card-id="${card.id}"
        aria-label="${selected
          ? `${order}번째 선택 완료`
          : '타로 카드 선택'}"
        ${selected || getSelectedCardCount() >= 3 ? 'disabled' : ''}

      >
        <img
          src="${tarotCardBackImage}"
          alt=""
          draggable="false"
        />

        ${selected ? `
          <span class="deck-selected-mark">
            ✓ ${order}
          </span>
        ` : ''}
      </button>
    `
  }).join('')
}

// ==================================
// 8. 카드 선택 화면
// ==================================

function createCardsPage() {

  const count = getSelectedCardCount()
  const completed = count === 3


  const questionText = escapeHTML(questionData.question)
  const categoryText = escapeHTML(questionData.category)

  return `
    <section class="content-page cards-page">

      <p class="eyebrow">✦ CHOOSE YOUR CARDS ✦</p>

      <h1>당신의 카드를 선택하세요.</h1>

      <p class="page-description">
        메이저 아르카나 22장 중 3장을 선택해 주세요.<br>
        선택 순서대로 과거, 현재, 미래를 살펴봅니다.
      </p>

      <div class="cards-question-summary">
        <span class="summary-label">고민 분야</span>
        <strong>${categoryText}</strong>

        <span class="summary-label">나의 질문</span>
        <p>${questionText}</p>
      </div>

      <h2 class="cards-section-title">
        나의 과거 · 현재 · 미래
      </h2>

      <div class="selected-slots">
        ${createSelectedSlots()}
      </div>

      <p class="selection-progress" aria-live="polite">
        선택한 카드
        <strong>${count} / 3</strong>
      </p>

      <p class="selection-guide" aria-live="polite">
        ${completed
          ? '카드 3장을 모두 선택했어요!'
          : `${['과거', '현재', '미래'][getNextEmptySlotIndex()]}를 나타낼 카드를 선택해 주세요.`}
      </p>

      <div class="tarot-deck" aria-label="메이저 아르카나 카드 22장">
        ${createCardDeck()}
      </div>

      <div class="cards-actions">
        <button class="secondary-button"
                data-page="reading">
          ← 질문 수정하기
        </button>


        <button
          type="button"
          class="secondary-button"
          id="reset-cards"
          ${count === 0 ? 'disabled' : ''}
        >
          전체 카드 다시 뽑기
        </button>

      </div>


      <p class="card-reselect-help">
        ✦ 카드 한 장만 바꾸고 싶다면 위쪽에서
        선택한 카드를 클릭해 주세요.
      </p>


      ${completed ? `
        <div class="reading-ready-panel">
          <span class="ready-symbol">✦</span>
          <h2>세 장의 카드가 선택되었습니다.</h2>
          <p>
            과거, 현재, 미래 카드의 선택이 완료됐습니다.<br>
            다음 단계에서는 이 세 장을 AI가 종합해 해석합니다.
          </p>

          <button
            class="primary-button"
            id="start-ai-reading"
            ${aiReadingStatus === 'loading' ? 'disabled' : ''}
          >
            ${aiReadingStatus === 'loading'
              ? '✦ AI가 카드를 해석하고 있습니다...'
              : aiReadingStatus === 'error'
                ? '✦ AI 리딩 다시 시도하기 →'
                : '✦ 1차 AI 리딩 시작하기 →'}
          </button>

          <div id="ai-reading-feedback"
               role="status"
               aria-live="polite">

            ${aiReadingStatus === 'loading' ? `
              <p>
                AI가 선택한 세 장의 카드를 해석하고 있습니다.<br>
                잠시만 기다려 주세요.
              </p>
            ` : ''}

            ${aiReadingStatus === 'error' ? `
              <p style="color: #F2A3A3;">
                ${escapeHTML(aiReadingError)}
              </p>
            ` : ''}

            ${aiReadingStatus === 'success' ? `
              <p style="color: #D8BF87;">
                ✦ AI 리딩이 완료되었습니다!
              </p>
            ` : ''}

          </div>

          ${aiReadingStatus === 'success' && aiReadingResult ? `
            <div class="ai-reading-preview">
              <h3>✦ AI 리딩 결과 확인</h3>
              <p>과거·현재·미래·종합 리딩·조언을 모두 받았습니다.</p>
              <button
                class="secondary-button"
                id="check-ai-result"
              >
                ✦ 1차 AI 리딩 결과 확인하기 →
              </button>
            </div>
          ` : ''}

        </div>
      ` : ''}

    </section>
  `
}

// ==================================
// 9. 이용 안내
// ==================================


// ==================================
// 7-7. AI 타로 리딩 결과 페이지
// ==================================

function createResultPage() {

  // 아직 AI 결과가 없다면 안내 표시
  if (!aiReadingResult || aiReadingStatus !== 'success') {
    return `
      <section class="content-page result-page">
        <p class="eyebrow">✦ TAROT READING ✦</p>
        <h1>아직 완성된 리딩이 없습니다.</h1>
        <p class="page-description">
          먼저 질문을 작성하고 카드 3장을 선택해 주세요.
        </p>
        <button class="primary-button" data-page="cards">
          카드 선택 화면으로 돌아가기 →
        </button>
      </section>
    `
  }

  const cardPositions = [
    { name: '과거', en: 'PAST', key: 'past' },
    { name: '현재', en: 'PRESENT', key: 'present' },
    { name: '미래', en: 'FUTURE', key: 'future' }
  ]

  const readingSections = [
    { key: 'past', title: '과거 카드 해석', number: '01' },
    { key: 'present', title: '현재 카드 해석', number: '02' },
    { key: 'future', title: '미래 카드 해석', number: '03' },
    { key: 'summary', title: '세 장의 종합 리딩', number: '04' },
    { key: 'advice', title: '고민에 대한 조언', number: '05' }
  ]

  const selectedCardData = selectedCards.map(
    cardId => getCardById(cardId)
  )

  return `
    <section class="content-page result-page">

      <p class="eyebrow">✦ YOUR TAROT READING ✦</p>

      <h1>당신을 위한 타로 리딩</h1>

      <p class="page-description">
        선택한 세 장의 카드가 전하는 이야기를 살펴보세요.
      </p>

      <div class="result-question-box">

        <span class="summary-label">고민 분야</span>
        <strong>${escapeHTML(questionData.category)}</strong>

        <span class="summary-label">나의 질문</span>
        <p>${escapeHTML(questionData.question)}</p>

      </div>

      <h2 class="result-section-title">
        ✦ 나의 과거 · 현재 · 미래
      </h2>

      <div class="result-card-grid">

        ${selectedCardData.map((card, index) => {

          if (!card) return ''

          const position = cardPositions[index]

          return `
            <div class="result-tarot-card">

              ${createFlipCardPicture(card)}

              <p class="result-position">
                ${position.name}
              </p>

              <span class="result-position-en">
                ${position.en}
              </span>

              <h3>${escapeHTML(card.name)}</h3>

              <small>${escapeHTML(card.nameEn || '')}</small>

            </div>
          `
        }).join('')}

      </div>

      <div class="result-divider">
        ✦ ✦ ✦
      </div>

      <div class="result-readings">

        ${readingSections.map(section => `
          <article class="result-reading-section">

            <p class="result-reading-number">
              ✦ ${section.number}
            </p>

            <h2>${section.title}</h2>

            <p class="result-reading-text">${escapeHTML(
              aiReadingResult[section.key]
            )}</p>

          </article>
        `).join('')}

      </div>

      <p class="result-disclaimer">
        타로는 미래를 확정하는 예언이 아니라,
        자신의 상황을 돌아보기 위한 상징적 해석입니다.
      </p>




      <div class="result-actions">

        <button
          type="button"
          class="secondary-button"
          data-page="cards"
        >
          ← 카드 선택 화면
        </button>


        <button
          type="button"
          class="primary-button"
          data-page="deepCards"
        >
          ✦ 2차 심층 리딩 시작하기 →
        </button>


        <button
          type="button"
          class="secondary-button"
          id="restart-tarot"
        >
          새로운 타로 리딩 시작하기
        </button>

      </div>


    </section>
  `
}




function createDeepCardsPage() {
  // 1차 리딩에서 선택한 카드 제외
  const remainingCards = getFirstReadingCards().filter(
    card => !selectedCards.includes(card.id)
  )

  const count = getDeepSelectedCardCount()

  const deepPositions = [
    {
      number: '01',
      title: '심층 해답',
      type: '필수',
      description:
        '고민의 본질을 더 깊이 이해하고, 지금 필요한 조언과 해결 방향을 살펴봅니다.'
    },
    {
      number: '02',
      title: '숨겨진 변수',
      type: '선택',
      description:
        '미처 알아차리지 못한 감정, 장애물, 주변 상황 등 추가로 고려해야 할 요소를 살펴봅니다.'
    },
    {
      number: '03',
      title: '실천과 변화',
      type: '선택',
      description:
        '앞으로 시도할 수 있는 행동과 선택, 그로 인한 변화의 가능성을 구체적으로 살펴봅니다.'
    }
  ]

  return `
    <section class="content-page cards-page deep-reading-page">

      <p class="eyebrow">✦ DEEP TAROT READING ✦</p>

      <h1>고민을 조금 더 깊이 들여다볼까요?</h1>

      <p class="page-description">
        1차 리딩에서 선택한 카드를 제외한
        메이저 아르카나 ${remainingCards.length}장 중
        1~3장을 추가로 선택할 수 있습니다.
      </p>

      <h2 class="cards-section-title">
        심층 리딩 카드
      </h2>

      <div class="deep-card-slots">

        ${deepPositions.map((position, index) => {
          const cardId = deepSelectedCards[index]

          const card = cardId
            ? getCardById(cardId)
            : null

          return `
            <div class="deep-card-row">

              ${card ? `
                <button
                  type="button"
                  class="deep-card-placeholder deep-selected-remove"
                  data-deep-remove-slot="${index}"
                  aria-label="${position.title} 카드 선택 취소"
                  title="클릭하면 이 카드만 취소됩니다"
                >
                  <img
                    src="${tarotCardBackImage}"
                    alt="선택한 타로 카드 뒷면"
                    draggable="false"
                  />
                </button>
              ` : `
                <div class="deep-card-placeholder">
                  <span aria-hidden="true">✧</span>
                  <small>선택 대기</small>
                </div>
              `}

              <div class="deep-card-info">

                <span class="deep-card-number">
                  ${position.number} · ${position.type}
                </span>

                <h3>${position.title}</h3>

                <p>${position.description}</p>

              </div>

            </div>
          `
        }).join('')}

      </div>

      <h2 class="cards-section-title">
        심층 리딩 카드 선택
      </h2>

      <p class="page-description">
        아래에 남아 있는 19장의 카드 중
        원하는 카드를 선택해 주세요.
      </p>

      <div
        class="tarot-deck deep-tarot-deck"
        aria-label="심층 리딩에 사용할 메이저 아르카나 19장"
      >
        ${remainingCards.map(card => {
          const isSelected = deepSelectedCards.includes(card.id)
          const order = deepSelectedCards.indexOf(card.id) + 1

          return `
            <button
              type="button"
              class="deck-card ${isSelected ? 'is-selected' : ''}"
              data-deep-card-id="${card.id}"
              aria-label="${isSelected
                ? `${order}번째 심층 카드 선택 완료`
                : '심층 리딩 카드 선택'}"
              ${isSelected || count >= 3 ? 'disabled' : ''}
            >
              <img
                src="${tarotCardBackImage}"
                alt=""
                draggable="false"
              />

              ${isSelected ? `
                <span class="deck-selected-mark">
                  ✓ ${order}
                </span>
              ` : ''}
            </button>
          `
        }).join('')}
      </div>

      <div class="deep-question-section">

        <label for="deep-question">
          추가로 궁금한 점이 있나요? (선택)
        </label>

        <textarea
          id="deep-question"
          maxlength="500"
          rows="4"
          placeholder="예: 제가 이 선택을 망설이는 이유는 무엇일까요?"
        >${escapeHTML(deepQuestion)}</textarea>

        <p class="deep-question-help">
          질문을 작성하지 않아도 심층 리딩을 진행할 수 있습니다.
        </p>

      </div>

      <p class="selection-progress" aria-live="polite">
        선택한 카드 <strong>${count} / 3</strong>
      </p>

      <div class="cards-actions">

        <button
          type="button"
          class="secondary-button"
          data-page="result"
        >
          ← 1차 리딩 결과로 돌아가기
        </button>

        <button
          type="button"
          class="primary-button"
          id="start-deep-ai-reading"
          ${count === 0 || !deepSelectedCards[0] || deepAIStatus === 'loading'
            ? 'disabled'
            : ''}
          >
          ${deepAIStatus === 'loading'
            ? '✦ AI가 심층 리딩을 생성하고 있습니다...'
            : deepAIStatus === 'error'
              ? '✦ 심층 리딩 다시 시도하기 →'
              : '✦ 선택한 카드로 심층 리딩하기 →'}
        </button>

      </div>


      <div
        class="deep-ai-feedback"
        role="status"
        aria-live="polite"
      >
        ${deepAIStatus === 'loading' ? `
          <p>
            AI가 1차 리딩 결과와 추가 카드를 종합하고 있습니다.
            잠시만 기다려 주세요.
          </p>
        ` : ''}

        ${deepAIStatus === 'error' ? `
          <p style="color: #F2A3A3;">
            ${escapeHTML(deepAIError)}
          </p>
        ` : ''}

        ${deepAIStatus === 'success' ? `
          <p style="color: #D8BF87;">
            ✦ 2차 심층 AI 리딩이 완료되었습니다!
          </p>
        ` : ''}

        ${deepAIStatus === 'success' && deepAIResult ? `
          <button
            type="button"
            class="secondary-button"
            id="check-deep-result"
          >
            심층 리딩 결과 확인하기 →
          </button>
        ` : ''}
      </div>


    </section>
  `
}


/* ==========================================
   9-2-5-3-6. 2차 심층 리딩 결과 화면
   ========================================== */

function createDeepResultPage() {

  // 심층 AI 결과가 없으면 결과 화면 대신 안내 표시
  if (deepAIStatus !== 'success' || !deepAIResult) {
    return `
      <section class="content-page result-page">
        <h1>아직 심층 리딩 결과가 없습니다.</h1>

        <p class="page-description">
          심층 리딩 카드를 선택하고 AI 해석을 진행해 주세요.
        </p>

        <button
          type="button"
          class="primary-button"
          data-page="deepCards"
        >
          ← 심층 카드 선택 화면으로 돌아가기
        </button>
      </section>
    `
  }

  const positions = [
    { title: '심층 해답', en: 'DEEP ANSWER', key: 'core' },
    { title: '숨겨진 변수', en: 'HIDDEN FACTORS', key: 'hidden' },
    { title: '실천과 변화', en: 'ACTION & CHANGE', key: 'action' }
  ]

  const selectedDeepCards = deepSelectedCards
    .map((cardId, index) => ({
      card: cardId ? getCardById(cardId) : null,
      position: positions[index]
    }))
    .filter(item => item.card)

  const readingSections = [
    { key: 'core', title: '심층 해답', number: '01' },
    { key: 'hidden', title: '숨겨진 변수', number: '02' },
    { key: 'action', title: '실천과 변화', number: '03' },
    { key: 'summary', title: '심층 종합 리딩', number: '✦' }
  ]

  return `
    <section class="content-page result-page deep-result-page">

      <p class="eyebrow">✦ DEEP TAROT READING ✦</p>

      <h1>당신을 위한 심층 타로 리딩</h1>

      <p class="page-description">
        추가로 선택한 카드의 상징을 바탕으로
        고민을 더 깊이 들여다봅니다.
      </p>

      <div class="result-question-box">

        <span class="summary-label">기존 고민 분야</span>
        <strong>${escapeHTML(questionData.category)}</strong>

        <span class="summary-label">기존 상세 질문</span>
        <p>${escapeHTML(questionData.question)}</p>

        ${deepQuestion.trim() ? `
          <span class="summary-label deep-extra-label">
            추가 질문
          </span>
          <p>${escapeHTML(deepQuestion)}</p>
        ` : ''}

      </div>

      <h2 class="result-section-title">
        ✦ 추가로 선택한 타로 카드
      </h2>

      <div class="result-card-grid deep-result-card-grid">

        ${selectedDeepCards.map(({ card, position }) => `
          <div class="result-tarot-card">

            ${createFlipCardPicture(card)}

            <p class="result-position">
              ${position.title}
            </p>

            <span class="result-position-en">
              ${position.en}
            </span>

            <h3>${escapeHTML(card.name)}</h3>

            <small>${escapeHTML(card.nameEn || '')}</small>

          </div>
        `).join('')}

      </div>

      <div class="result-divider">
        ✦ ✦ ✦
      </div>

      <div class="result-readings">

        ${readingSections
          .filter(section => {
            if (section.key === 'summary') return true

            return (
              typeof deepAIResult[section.key] === 'string' &&
              deepAIResult[section.key].trim().length > 0
            )
          })
          .map(section => `
            <article class="result-reading-section">

              <p class="result-reading-number">
                ✦ ${section.number}
              </p>

              <h2>${section.title}</h2>

              <p class="result-reading-text">${escapeHTML(
                deepAIResult[section.key]
              )}</p>

            </article>
          `).join('')}

      </div>

      <p class="result-disclaimer">
        타로는 미래를 확정하는 예언이 아니라,
        자신의 상황을 돌아보기 위한 상징적 해석입니다.
      </p>

      <div class="result-actions">

        <button
          type="button"
          class="secondary-button"
          data-page="result"
        >
          ← 1차 리딩 결과 보기
        </button>

        <button
          type="button"
          class="primary-button"
          id="restart-tarot"
        >
          ✦ 새로운 타로 리딩 시작하기 →
        </button>

      </div>

    </section>
  `
}



function createGuidePage() {
  return `
    <section class="content-page">

      <p class="eyebrow">✦ HOW TO USE ✦</p>

      <h1>이용 안내</h1>

      <p class="page-description">
        타로 웹서비스의 이용 방법을 소개합니다.
      </p>

      <div class="guide-list">

        <article class="guide-item">
          <span class="guide-number">01</span>
          <div>
            <h2>고민 작성하기</h2>
            <p>
              고민 분야를 선택하고
              궁금한 내용을 자유롭게 작성합니다.
            </p>
          </div>
        </article>

        <article class="guide-item">
          <span class="guide-number">02</span>
          <div>
            <h2>첫 번째 카드 선택</h2>
            <p>
              메이저 아르카나 22장 중 3장을 선택해
              과거, 현재, 미래를 살펴봅니다.
            </p>
          </div>
        </article>

        <article class="guide-item">
          <span class="guide-number">03</span>
          <div>
            <h2>AI의 첫 번째 해석</h2>
            <p>
              고민과 선택한 카드를 종합해
              AI가 1차 리딩을 제공합니다.
            </p>
          </div>
        </article>

        <article class="guide-item">
          <span class="guide-number">04</span>
          <div>
            <h2>심층 리딩</h2>
            <p>
              원한다면 1차 리딩에서 선택한 3장을 제외한
              메이저 아르카나 19장 중 1~3장을 추가로 선택해
              고민에 대한 더 깊은 해석을 받습니다.
            </p>
          </div>
        </article>

      </div>

      <p class="guide-notice">
        모든 타로 해석은 자기 성찰과 참고를 위한
        콘텐츠이며 미래를 보장하지 않습니다.
      </p>


      <button
        class="primary-button"
        data-page="reading"
        data-new-reading
      >
        타로 시작하기 →
      </button>


    </section>
  `
}

// ==================================
// 10. 공통 하단 영역
// ==================================

function createFooter() {
  return `
    <footer class="site-footer">
      <p>TAROT · A MOMENT OF REFLECTION</p>
      <p>© 2026 TAROT</p>
    </footer>
  `
}

// ==================================
// 11. 화면 표시
// ==================================

function renderPage() {
  let content = ''


  if (currentPage === 'home') {
    content = createHomePage()
  } else if (currentPage === 'reading') {
    content = createReadingPage()
  } else if (currentPage === 'cards') {
    content = createCardsPage()
  } else if (currentPage === 'result') {
    content = createResultPage()
  } else if (currentPage === 'deepCards') {
    content = createDeepCardsPage()
  } else if (currentPage === 'deepResult') {
    content = createDeepResultPage()
  } else if (currentPage === 'guide') {
    content = createGuidePage()
  }



  app.innerHTML = `
    ${createHeader()}
    <main id="main-content">${content}</main>
    ${createFooter()}
  `

  document.querySelectorAll('.site-nav a').forEach(link => {
    const isActive = link.dataset.page === currentPage

    link.classList.toggle('active', isActive)

    if (isActive) {
      link.setAttribute('aria-current', 'page')
    }
  })

  document.title =
    `${pageNames[currentPage]} | 타로 — AI 타로 리딩 웹서비스`

  startCardFlips()
}

// ==================================
// 12. 페이지 이동
// ==================================

function updatePageFromHash() {
  const requestedPage = window.location.hash.slice(1)

  currentPage = pageNames[requestedPage]
    ? requestedPage
    : 'home'

  // 질문을 작성해야 카드 화면 진입 가능
  if (currentPage === 'cards' && !isQuestionValid()) {
    window.location.replace('#reading')
    return
  }


  // 완료된 AI 리딩이 없다면 결과 페이지 진입 제한
  if (
    currentPage === 'result' &&
    (aiReadingStatus !== 'success' || !aiReadingResult)
  ) {
    window.location.replace(
      isQuestionValid() ? '#cards' : '#reading'
    )
    return
  }


  // 1차 AI 리딩 완료 후에만 심층 리딩 진입 허용
  if (
    currentPage === 'deepCards' &&
    (aiReadingStatus !== 'success' || !aiReadingResult)
  ) {
    window.location.replace(
      isQuestionValid() ? '#cards' : '#reading'
    )
    return
  }


// 심층 AI 리딩 결과가 없으면 결과 페이지 진입 제한
if (
  currentPage === 'deepResult' &&
  (
    deepAIStatus !== 'success' ||
    !deepAIResult ||
    aiReadingStatus !== 'success' ||
    !aiReadingResult
  )
) {
  window.location.replace(
    aiReadingStatus === 'success' && aiReadingResult
      ? '#deepCards'
      : isQuestionValid() ? '#cards' : '#reading'
  )
  return
}




  renderPage()
  window.scrollTo(0, 0)
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-page]')

  if (!target) return


  const destination = target.dataset.page

  if (!pageNames[destination]) return

  event.preventDefault()

  // 상단 메뉴에서 홈 또는 타로 보기로 이동하면 새로 시작
  const isHeaderNavigation = Boolean(
    target.closest('.site-header')
  )


  if (
    (isHeaderNavigation &&
      (destination === 'home' || destination === 'reading')) ||
    target.hasAttribute('data-new-reading')
  ) {
    resetAllTarotData()
  }



  if (window.location.hash === `#${destination}`) {
    updatePageFromHash()
  } else {
    window.location.hash = destination
  }
})

// ==================================
// 13. 질문 입력 처리
// ==================================

document.addEventListener('change', event => {
  if (event.target.name !== 'category') return

  if (questionData.category !== event.target.value) {
    resetSelectedCards()
  }

  questionData.category = event.target.value
  saveQuestion()

  document.querySelectorAll('.category-option').forEach(label => {
    const radio = label.querySelector('input')
    label.classList.toggle('selected', radio.checked)
  })

  document.querySelector('#category-error').textContent = ''
})

document.addEventListener('input', event => {
  if (event.target.id !== 'detail-question') return

  if (questionData.question !== event.target.value) {
    resetSelectedCards()
  }

  questionData.question = event.target.value
  saveQuestion()

  document.querySelector('#character-count').textContent =
    `${questionData.question.length} / 500자`

  document.querySelector('#question-error').textContent = ''
})

document.addEventListener('submit', event => {
  if (event.target.id !== 'question-form') return

  event.preventDefault()

  const categoryError = document.querySelector('#category-error')
  const questionError = document.querySelector('#question-error')

  categoryError.textContent = ''
  questionError.textContent = ''

  let isValid = true

  if (!categories.includes(questionData.category)) {
    categoryError.textContent = '고민 분야를 선택해 주세요.'
    isValid = false
  }

  if (!questionData.question.trim()) {
    questionError.textContent = '상세 질문을 입력해 주세요.'
    isValid = false
  }

  if (!isValid) return

  saveQuestion()
  window.location.hash = 'cards'
})

// ==================================
// 14. 카드 선택 처리
// ==================================

document.addEventListener('click', event => {
  const cardButton = event.target.closest('[data-card-id]')

  if (!cardButton || currentPage !== 'cards') return

  const cardId = cardButton.dataset.cardId

  const validCard = getFirstReadingCards().some(
    card => card.id === cardId
  )


 if (!validCard) return
 if (selectedCards.includes(cardId)) return

 // 과거, 현재, 미래 중 비어 있는 자리 찾기
 const emptySlotIndex = getNextEmptySlotIndex()

 // 세 자리가 모두 채워져 있다면 선택 불가
 if (emptySlotIndex === -1) return

 // 기존 AI 리딩 결과 초기화
 resetAIReading()

 // 비어 있는 자리에 새로운 카드 저장
 selectedCards[emptySlotIndex] = cardId

 // 선택 상태 저장
 saveSelectedCards()

 // 카드 선택 후 화면 갱신
 renderPage()

})


// ==================================
// 8-2-4. 선택한 카드 개별 취소
// ==================================

document.addEventListener('click', event => {
  const removeButton = event.target.closest('[data-remove-slot]')

  if (!removeButton || currentPage !== 'cards') return

  const slotIndex = Number(removeButton.dataset.removeSlot)

  // 과거, 현재, 미래 위치인지 확인
  if (![0, 1, 2].includes(slotIndex)) return

  // 이미 빈자리라면 취소하지 않음
  if (!selectedCards[slotIndex]) return

  // 해당 카드 한 장만 취소
  selectedCards[slotIndex] = null

  // 기존 AI 리딩 결과 초기화
  resetAIReading()

  // 변경된 선택 상태 저장
  saveSelectedCards()

  // 카드 선택 화면 다시 표시
  renderPage()
})


// ==========================================
// 9-2-4-2. 심층 리딩 카드 선택
// ==========================================

document.addEventListener('click', event => {
  const cardButton = event.target.closest('[data-deep-card-id]')

  if (!cardButton || currentPage !== 'deepCards') return

  const cardId = cardButton.dataset.deepCardId

  const validCard = getFirstReadingCards().some(
    card => card.id === cardId
  )

  if (!validCard) return
  if (selectedCards.includes(cardId)) return
  if (deepSelectedCards.includes(cardId)) return

  const emptyIndex = getNextDeepEmptySlotIndex()

  if (emptyIndex === -1) return


  deepSelectedCards[emptyIndex] = cardId

  resetDeepAIReading()
  saveDeepReading()

  renderPage()

})


// ==========================================
// 9-2-4-2. 심층 리딩 카드 개별 취소
// ==========================================

document.addEventListener('click', event => {
  const removeButton = event.target.closest('[data-deep-remove-slot]')

  if (!removeButton || currentPage !== 'deepCards') return

  const slotIndex = Number(removeButton.dataset.deepRemoveSlot)

  if (![0, 1, 2].includes(slotIndex)) return
  if (!deepSelectedCards[slotIndex]) return

  // 선택한 위치의 카드만 취소
  deepSelectedCards[slotIndex] = null

  resetDeepAIReading()
  saveDeepReading()

  renderPage()

})


// ==========================================
// 9-2-4-2. 추가 질문 입력 내용 보관
// ==========================================

document.addEventListener('input', event => {
  if (event.target.id !== 'deep-question') return
  if (currentPage !== 'deepCards') return


  const newDeepQuestion = event.target.value.slice(0, 500)

  if (deepQuestion !== newDeepQuestion) {
    deepQuestion = newDeepQuestion

    resetDeepAIReading()
    saveDeepReading()
  }

})


// 카드 선택 초기화
document.addEventListener('click', event => {
  if (!event.target.closest('#reset-cards')) return

  if (!window.confirm('선택한 카드를 모두 다시 뽑을까요?')) {
    return
  }

  resetSelectedCards()
  renderPage()
})


// ==================================
// 7-6. 실제 AI 리딩 요청
// ==================================

async function startAIReading() {

  // 질문과 카드 선택 상태 확인
  if (!isQuestionValid() || selectedCards.length !== 3) {
    aiReadingStatus = 'error'
    aiReadingError = '질문과 카드 3장을 먼저 확인해 주세요.'
    renderPage()
    return
  }

  // 중복 요청 방지
  if (aiReadingStatus === 'loading') return

  // AI 요청 시작
  aiReadingStatus = 'loading'
  aiReadingError = ''
  aiReadingResult = null

  renderPage()

  try {

const controller = new AbortController()

// 60초가 지나면 AI 요청 취소
const timeoutId = setTimeout(() => {
  controller.abort()
}, 60000)


let response

try {
  response = await fetch(AI_API_URL, {
    method: 'POST',

    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify({
      category: questionData.category,
      question: questionData.question,
      cards: [...selectedCards]
    }),

    signal: controller.signal
  })
} finally {
  clearTimeout(timeoutId)
}


    // 서버에서 받은 JSON
    const data = await response.json()

    // 서버가 오류를 반환한 경우
    if (!response.ok || data.success !== true) {
      throw new Error(
        data.error || 'AI 리딩을 생성하지 못했습니다.'
      )
    }

    // 다섯 가지 해석이 모두 존재하는지 확인
    const keys = [
      'past',
      'present',
      'future',
      'summary',
      'advice'
    ]

    const validReading =
      data.reading &&
      keys.every(key =>
        typeof data.reading[key] === 'string' &&
        data.reading[key].trim().length > 0
      )

    if (!validReading) {
      throw new Error('AI 응답 데이터가 올바르지 않습니다.')
    }

    // AI 리딩 성공
    aiReadingResult = data.reading
    aiReadingStatus = 'success'

    // AI 리딩 결과를 브라우저에 저장
    saveAIReadingResult()

    console.log('AI 리딩 성공:', Object.keys(aiReadingResult))

  } catch (error) {

    console.error('AI 리딩 요청 오류:', error)

    aiReadingStatus = 'error'



    if (error.name === 'AbortError') {
       aiReadingError =
        'AI 응답 시간이 60초를 초과했습니다. 잠시 후 다시 시도해 주세요.'
    }  else if (error instanceof TypeError) {
       aiReadingError =
        CONNECTION_ERROR_MESSAGE
    }  else {
       aiReadingError =
        error.message || 'AI 요청 중 오류가 발생했습니다.'
    }



  } finally {
    // 현재 카드 선택 화면이라면 결과 갱신
    if (currentPage === 'cards') {
      renderPage()
    }
  }
}


// ==================================
// AI 리딩 버튼 클릭 처리
// ==================================

document.addEventListener('click', event => {

  const button = event.target.closest('#start-ai-reading')

  if (!button || currentPage !== 'cards') return

  startAIReading()

})



 // ==================================
 // 7-7. 정식 AI 결과 페이지 이동
 // ==================================

document.addEventListener('click', event => {

  if (!event.target.closest('#check-ai-result')) return

  if (!aiReadingResult || aiReadingStatus !== 'success') {
    return
  }

  window.location.hash = 'result'

})


// ==================================
// 7-7. 새로운 타로 리딩 시작하기
// ==================================

document.addEventListener('click', event => {

  if (!event.target.closest('#restart-tarot')) return

  // 기존 질문 초기화
  questionData = {
    category: '',
    question: ''
  }

  saveQuestion()

  // 카드 선택과 AI 결과 초기화
  resetSelectedCards()
  resetAIReading()
  resetDeepReading()
  resetDeepAIReading()


  // 질문 입력 화면으로 이동
  if (window.location.hash === '#reading') {
    updatePageFromHash()
  } else {
    window.location.hash = 'reading'
  }

})


 // ==========================================
 // 9-2-5-3-5. 실제 2차 심층 AI 리딩 요청
 // ==========================================

async function startDeepAIReading() {

  // 1차 리딩 완료 여부 확인
  if (aiReadingStatus !== 'success' || !aiReadingResult) {
    deepAIStatus = 'error'
    deepAIError = '먼저 1차 AI 리딩을 완료해 주세요.'
    renderPage()
    return
  }

  // 심층 카드 선택 상태 확인
  const deepCards = deepSelectedCards.filter(
    cardId => cardId != null
  )

  if (
    deepCards.length < 1 ||
    deepCards.length > 3 ||
    !deepSelectedCards[0]
  ) {
    deepAIStatus = 'error'
    deepAIError = '심층 리딩 카드를 1~3장 선택해 주세요.'
    renderPage()
    return
  }

  // 중복 요청 방지
  if (deepAIStatus === 'loading') return

  // 요청 상태 초기화
  deepAIStatus = 'loading'
  deepAIError = ''
  deepAIResult = null

  renderPage()

  const controller = new AbortController()

  // 최대 60초 대기
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, 60000)

  try {
    const response = await fetch(DEEP_AI_API_URL, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json'
      },

      body: JSON.stringify({
        category: questionData.category,
        question: questionData.question,
        first_cards: [...selectedCards],
        first_reading: aiReadingResult,
        deep_cards: deepCards,
        deep_question: deepQuestion
      }),

      signal: controller.signal
    })

    const data = await response.json()

    // 서버 오류 검사
    if (!response.ok || data.success !== true) {
      throw new Error(
        data.error || '심층 AI 리딩을 생성하지 못했습니다.'
      )
    }

    // AI 응답 구조 검사
    const reading = data.reading

    if (
      !reading ||
      typeof reading.core !== 'string' ||
      !reading.core.trim() ||
      typeof reading.summary !== 'string' ||
      !reading.summary.trim() ||
      typeof reading.hidden !== 'string' ||
      typeof reading.action !== 'string'
    ) {
      throw new Error('심층 AI 응답 형식이 올바르지 않습니다.')
    }

    if (
      (deepCards.length >= 2 && !reading.hidden.trim()) ||
      (deepCards.length >= 3 && !reading.action.trim())
    ) {
      throw new Error('선택한 카드에 대한 심층 해석이 누락되었습니다.')
    }


    // 심층 리딩 성공
    deepAIResult = reading
    deepAIStatus = 'success'

    // 성공한 심층 AI 결과 저장
    saveDeepAIResult()

    console.log('2차 심층 AI 리딩 성공:', Object.keys(reading))


  } catch (error) {
    console.error('2차 심층 AI 리딩 오류:', error)

    deepAIStatus = 'error'

    if (error.name === 'AbortError') {
      deepAIError =
        'AI 응답 시간이 60초를 초과했습니다. 잠시 후 다시 시도해 주세요.'
    }  else if (error instanceof TypeError) {
       aiReadingError =
        CONNECTION_ERROR_MESSAGE
    } else {
      deepAIError =
        error.message || '심층 AI 리딩 요청 중 문제가 발생했습니다.'
    }

  } finally {
    clearTimeout(timeoutId)

    if (currentPage === 'deepCards') {
      renderPage()
    }
  }
}


// ==========================================
// 9-2-5-3-5. 심층 AI 리딩 버튼 클릭 처리
// ==========================================

document.addEventListener('click', event => {
  const button = event.target.closest('#start-deep-ai-reading')

  if (!button || currentPage !== 'deepCards') return

  startDeepAIReading()
})



// ==========================================
// 심층 AI 리딩 결과 확인 버튼
// ==========================================

document.addEventListener('click', event => {
  const button = event.target.closest('#check-deep-result')

  if (!button || currentPage !== 'deepCards') return

  if (deepAIStatus !== 'success' || !deepAIResult) {
    return
  }

  window.location.hash = 'deepResult'
})


// ==================================
// 15. 최초 실행
// ==================================


loadQuestion()
loadSelectedCards()
loadDeepReading()
loadAIReadingResult()
loadDeepAIResult()



window.addEventListener('hashchange', updatePageFromHash)

updatePageFromHash()


// ==================================
// 결과 카드 뒤집기 (보너스: 마이크로 인터랙션)
// ==================================

// 결과 화면의 카드는 뒷면으로 시작해 순서대로 앞면으로 뒤집힙니다.
// 카드를 클릭(또는 Enter/Space)하면 다시 뒤집어 볼 수 있습니다.
function createFlipCardPicture(card) {
  const frontImage = escapeHTML(card.image || tarotCardBackImage)
  const name = escapeHTML(card.name)

  return `
    <div
      class="result-card-picture flip-card"
      role="button"
      tabindex="0"
      aria-label="${name} 카드 뒤집기"
    >
      <div class="flip-inner">
        <img
          class="flip-face flip-face-front"
          src="${frontImage}"
          alt="${name} 타로 카드"
          loading="lazy"
          onerror="this.onerror=null;this.src='/cards/back/tarot-back.jpg';"
        />
        <img
          class="flip-face flip-face-back"
          src="${tarotCardBackImage}"
          alt=""
          aria-hidden="true"
        />
      </div>
    </div>
  `
}

function startCardFlips() {
  const cards = document.querySelectorAll('.flip-inner')

  if (!cards.length) return

  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  cards.forEach((card, index) => {
    // 움직임을 줄이도록 설정한 사용자에게는 바로 앞면을 보여 줍니다.
    if (reduceMotion) {
      card.classList.add('is-revealed')
      return
    }

    window.setTimeout(() => {
      if (card.isConnected) {
        card.classList.add('is-revealed')
      }
    }, 400 + index * 400)
  })
}

function toggleFlipCard(picture) {
  picture
    .querySelector('.flip-inner')
    ?.classList.toggle('is-revealed')
}

document.addEventListener('click', event => {
  const picture = event.target.closest('.flip-card')

  if (picture) toggleFlipCard(picture)
})

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return

  const picture = event.target.closest?.('.flip-card')

  if (!picture) return

  event.preventDefault()
  toggleFlipCard(picture)
})