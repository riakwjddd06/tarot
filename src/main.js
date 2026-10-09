
import './style.css'

// 화면을 표시할 공간
const app = document.querySelector('#app')

// 현재 표시 중인 화면
let currentPage = 'home'

// 화면별 이름
const pageNames = {
  home: '홈',
  reading: '타로 보기',
  guide: '이용 안내',
}

// 상단 메뉴 만들기
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

// 메인 화면
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

// 타로 보기 화면
// 다음 단계에서 실제 질문 입력 기능을 구현할 예정
function createReadingPage() {
  return `
    <section class="content-page">

      <p class="eyebrow">✦ TAROT READING ✦</p>

      <h1>오늘은 무엇이 궁금한가요?</h1>

      <p class="page-description">
        연애, 진로, 인간관계 등
        마음속에 품고 있는 고민을 떠올려 보세요.
      </p>

      <div class="content-panel">
        <div class="panel-symbol">☽</div>
        <h2>나만의 타로 리딩</h2>
        <p>
          다음 단계에서 고민 분야 선택과
          상세 질문 입력 기능을 구현할 예정입니다.
        </p>
      </div>

      <button class="secondary-button" data-page="home">
        ← 홈으로 돌아가기
      </button>

    </section>
  `
}

// 이용 안내 화면
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
        콘텐츠이며, 미래를 보장하지 않습니다.
      </p>

      <button class="primary-button" data-page="reading">
        타로 시작하기 →
      </button>

    </section>
  `
}

// 하단 영역
function createFooter() {
  return `
    <footer class="site-footer">
      <p>TAROT · A MOMENT OF REFLECTION</p>
      <p>© 2026 TAROT</p>
    </footer>
  `
}

// 실제 화면 그리기
function renderPage() {
  let content = ''

  if (currentPage === 'home') {
    content = createHomePage()
  } else if (currentPage === 'reading') {
    content = createReadingPage()
  } else if (currentPage === 'guide') {
    content = createGuidePage()
  }

  app.innerHTML = `
    ${createHeader()}
    <main id="main-content">${content}</main>
    ${createFooter()}
  `

  // 현재 메뉴 표시
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

// 주소의 #값에 맞춰 페이지 전환
function updatePageFromHash() {
  const requestedPage = window.location.hash.slice(1)

  currentPage = pageNames[requestedPage]
    ? requestedPage
    : 'home'

  renderPage()
  window.scrollTo(0, 0)
}

// 버튼 및 링크 클릭
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

// 뒤로 가기, 앞으로 가기 등 주소 변경 처리
window.addEventListener('hashchange', updatePageFromHash)

// 첫 화면 실행
updatePageFromHash()
