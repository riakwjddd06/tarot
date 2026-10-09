

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

    if (!Array.isArray(data)) return

    const validIds = new Set(
      getFirstReadingCards().map(card => card.id)
    )

    if (
      data.length <= 3 &&
      new Set(data).size === data.length &&
      data.every(id => validIds.has(id))
    ) {
      selectedCards = data
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
    { name: '미래', en: 'FUTURE' },
  ]

  return positions.map((position, index) => {
    const cardId = selectedCards[index]
    const card = cardId ? getCardById(cardId) : null

    if (card) {
      return `
        <div class="selected-slot">
          <div class="slot-face is-revealed">
            <span class="slot-card-number">
              ${String(card.number).padStart(2, '0')}
            </span>

            <span class="slot-card-symbol">✦</span>

            <strong>${escapeHTML(card.name)}</strong>
            <small>${escapeHTML(card.nameEn)}</small>
          </div>

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
        ${selected || selectedCards.length >= 3 ? 'disabled' : ''}
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
  const count = selectedCards.length
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
          : `${['과거', '현재', '미래'][count]}를 나타낼 카드를 선택해 주세요.`}
      </p>

      <div class="tarot-deck" aria-label="메이저 아르카나 카드 22장">
        ${createCardDeck()}
      </div>

      <div class="cards-actions">
        <button class="secondary-button"
                data-page="reading">
          ← 질문 수정하기
        </button>

        <button class="secondary-button"
                id="reset-cards"
                ${count === 0 ? 'disabled' : ''}>
          카드 다시 뽑기
        </button>
      </div>

      ${completed ? `
        <div class="reading-ready-panel">
          <span class="ready-symbol">✦</span>
          <h2>세 장의 카드가 선택되었습니다.</h2>
          <p>
            과거, 현재, 미래 카드의 선택이 완료됐습니다.<br>
            다음 단계에서는 이 세 장을 AI가 종합해 해석합니다.
          </p>
          <button class="primary-button" disabled>
            1차 AI 리딩 — 7단계에서 연결 예정
          </button>
        </div>
      ` : ''}

    </section>
  `
}

// ==================================
// 9. 이용 안내
// ==================================

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
              원한다면 남은 75장 중 1~3장을
              추가로 선택해 더 깊은 해석을 받습니다.
            </p>
          </div>
        </article>

      </div>

      <p class="guide-notice">
        모든 타로 해석은 자기 성찰과 참고를 위한
        콘텐츠이며 미래를 보장하지 않습니다.
      </p>

      <button class="primary-button" data-page="reading">
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

  renderPage()
  window.scrollTo(0, 0)
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-page]')

  if (!target) return

  const destination = target.dataset.page

  if (!pageNames[destination]) return

  event.preventDefault()

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
  if (selectedCards.length >= 3) return

  selectedCards.push(cardId)
  saveSelectedCards()

  // 카드 선택 후 화면 갱신
  renderPage()
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
// 15. 최초 실행
// ==================================

loadQuestion()
loadSelectedCards()

window.addEventListener('hashchange', updatePageFromHash)

updatePageFromHash()
