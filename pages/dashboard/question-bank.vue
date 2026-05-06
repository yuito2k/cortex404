<template>
  <div class="qbank">

    <!-- Page header -->
    <div class="qbank-header">
      <div class="header-left">
        <div class="page-chip">
          <span class="chip-dot" />
          Question Bank
        </div>
        <h1 class="page-title">1M+ Questions.<br><span class="text-outline">Find Yours.</span></h1>
        <p class="page-sub">Filter by exam, subject, chapter and difficulty. Drill exactly where you're weakest.</p>
      </div>
      <div class="header-stats">
        <div v-for="s in bankStats" :key="s.label" class="hstat">
          <span class="hstat-value">{{ s.value }}</span>
          <span class="hstat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <!-- Search -->
      <div class="filter-search">
        <span class="search-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <input
          v-model="searchQuery"
          class="form-input search-input"
          placeholder="Search questions, topics, keywords..."
          @input="onSearch"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; onSearch()">×</button>
      </div>

      <!-- Filters row -->
      <div class="filters-row">
        <!-- Exam stream -->
        <div class="filter-group">
          <label class="form-label">Exam</label>
          <div class="filter-pills">
            <button
              v-for="exam in examStreams"
              :key="exam"
              class="filter-pill"
              :class="{ active: selectedExam === exam }"
              @click="selectExam(exam)"
            >{{ exam }}</button>
          </div>
        </div>

        <!-- Subject -->
        <div class="filter-group" v-if="availableSubjects.length">
          <label class="form-label">Subject</label>
          <div class="filter-pills">
            <button
              v-for="sub in availableSubjects"
              :key="sub"
              class="filter-pill"
              :class="{ active: selectedSubject === sub }"
              @click="selectSubject(sub)"
            >{{ sub }}</button>
          </div>
        </div>

        <!-- Chapter -->
        <div class="filter-group" v-if="chapterBreakdown.length">
          <label class="form-label">Chapter</label>
          <div class="filter-pills">
            <button
              class="filter-pill"
              :class="{ active: selectedChapter === '' }"
              @click="filterByChapter('')"
            >All</button>
            <button
              v-for="ch in chapterBreakdown"
              :key="ch.name"
              class="filter-pill"
              :class="{ active: selectedChapter === ch.name }"
              @click="filterByChapter(ch.name)"
            >{{ ch.name }} <span class="pill-count">{{ ch.count }}</span></button>
          </div>
        </div>

        <!-- Difficulty -->
        <div class="filter-group">
          <label class="form-label">Difficulty</label>
          <div class="filter-pills">
            <button
              v-for="d in difficulties"
              :key="d.val"
              class="filter-pill diff-pill"
              :class="{ active: selectedDiff === d.val, [d.cls]: true }"
              @click="selectDiff(d.val)"
            >{{ d.label }}</button>
          </div>
        </div>

        <!-- Sort + Reset -->
        <div class="filter-group filter-actions">
          <label class="form-label">Sort</label>
          <div class="filter-pills">
            <button
              v-for="s in sortOptions"
              :key="s.val"
              class="filter-pill"
              :class="{ active: sortBy === s.val }"
              @click="sortBy = s.val; applyFilters()"
            >{{ s.label }}</button>
          </div>
          <button class="iso-btn iso-btn--ghost reset-btn" @click="resetFilters">
            Reset
          </button>
        </div>
      </div>

      <!-- Active filter tags + count -->
      <div class="filter-status">
        <span class="result-count">
          <span class="count-num">{{ filteredQuestions.length }}</span>
          <span class="count-label">questions found</span>
        </span>
        <div class="active-tags">
          <span v-if="selectedExam !== 'All'" class="active-tag">
            {{ selectedExam }}
            <button @click="selectedExam = 'All'; applyFilters()">×</button>
          </span>
          <span v-if="selectedSubject !== 'All'" class="active-tag">
            {{ selectedSubject }}
            <button @click="selectedSubject = 'All'; applyFilters()">×</button>
          </span>
          <span v-if="selectedChapter" class="active-tag">
            {{ selectedChapter }}
            <button @click="selectedChapter = ''; applyFilters()">×</button>
          </span>
          <span v-if="selectedDiff !== 'all'" class="active-tag">
            {{ selectedDiff }}
            <button @click="selectedDiff = 'all'; applyFilters()">×</button>
          </span>
          <span v-if="searchQuery" class="active-tag">
            "{{ searchQuery }}"
            <button @click="searchQuery = ''; applyFilters()">×</button>
          </span>
        </div>
      </div>
    </div>

    <!-- Main layout: question list + sidebar -->
    <div class="qbank-body">

      <!-- Question list -->
      <div class="question-list">

        <!-- Loading skeleton -->
        <template v-if="loading">
          <div v-for="i in 6" :key="i" class="question-skeleton" :style="{ animationDelay: i * 0.07 + 's' }" />
        </template>

        <template v-else>
          <!-- Empty state -->
          <div v-if="!paginatedQuestions.length" class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="36" height="36">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                <path d="M11 8v3M11 14h.01"/>
              </svg>
            </div>
            <span class="empty-title">No questions match your filters.</span>
            <span class="empty-sub">Try broadening your search or resetting filters.</span>
            <button class="iso-btn iso-btn--ghost" @click="resetFilters">Reset Filters</button>
          </div>

          <!-- Question cards -->
          <div
            v-for="(q, i) in paginatedQuestions"
            :key="q.id"
            class="question-card"
            :id="`q-${q.id}`"
            :class="{ expanded: expandedId === q.id, solved: solvedIds.has(q.id) }"
            :style="{ animationDelay: i * 0.04 + 's' }"
          >
            <!-- Card header -->
            <div class="qcard-header" @click="toggleExpand(q.id)">
              <div class="qcard-meta">
                <span class="q-index">#{{ (currentPage - 1) * pageSize + i + 1 }}</span>
                <span class="q-diff-badge" :class="q.difficultyLevel">{{ q.difficulty[selectedLang] }}</span>
                <span class="q-subject-tag">{{ q.subject[selectedLang] }}</span>
                <span class="q-chapter-tag">{{ q.chapter[selectedLang] }}</span>
                <span v-if="q.year" class="q-year-tag">{{ q.year[selectedLang] }}</span>
              </div>
              <div class="qcard-actions">
                <span v-if="solvedIds.has(q.id)" class="solved-badge">✓ Solved</span>
                <span v-if="bookmarkedIds.has(q.id)" class="bookmark-active">
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="14" height="14">
                    <path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3.5L6 21V4a1 1 0 0 1 1-1z"/>
                  </svg>
                </span>
                <button class="expand-toggle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                    <polyline :points="expandedId === q.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Question text -->
            <div class="qcard-body" @click="toggleExpand(q.id)">
              <p class="q-text">{{ q.question[selectedLang] }}</p>
            </div>

            <!-- Expanded: options + answer -->
            <Transition name="expand">
              <div v-if="expandedId === q.id" class="qcard-expanded">
                <!-- MCQ options -->
                <div v-if="q.options[selectedLang]" class="options-list">
                  <button
                    v-for="(opt, oi) in q.options[selectedLang]"
                    :key="oi"
                    class="option-btn"
                    :class="{
                      selected: selectedAnswers[q.id] === oi,
                      correct: showAnswer[q.id] && oi === q.correctIndex,
                      wrong: showAnswer[q.id] && selectedAnswers[q.id] === oi && oi !== q.correctIndex,
                    }"
                    :disabled="showAnswer[q.id]"
                    @click.stop="selectAnswer(q.id, oi)"
                  >
                    <span class="opt-letter">{{ optLetters[oi] }}</span>
                    <span class="opt-text">{{ opt }}</span>
                    <span v-if="showAnswer[q.id] && oi === q.correctIndex" class="opt-check">✓</span>
                    <span v-else-if="showAnswer[q.id] && selectedAnswers[q.id] === oi && oi !== q.correctIndex" class="opt-x">✗</span>
                  </button>
                </div>

                <!-- Reveal / Explanation -->
                <div class="qcard-footer">
                  <div class="footer-left">
                    <button
                      v-if="!showAnswer[q.id]"
                      class="iso-btn iso-btn--fill reveal-btn"
                      :disabled="selectedAnswers[q.id] === undefined && !!q.options[selectedLang]"
                      @click.stop="revealAnswer(q.id)"
                    >
                      {{ q.options[selectedLang] ? 'Check Answer' : 'Show Answer' }}
                    </button>
                    <div v-if="showAnswer[q.id]" class="explanation-block">
                      <span class="exp-label">EXPLANATION</span>
                      <p class="exp-text">{{ q.explanation[selectedLang] }}</p>
                    </div>
                  </div>
                  <div class="footer-right">
                    <button
                      class="action-icon-btn"
                      :class="{ active: bookmarkedIds.has(q.id) }"
                      title="Bookmark"
                      @click.stop="toggleBookmark(q.id)"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                        <path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3.5L6 21V4a1 1 0 0 1 1-1z"/>
                      </svg>
                    </button>
                    <button
                      class="action-icon-btn"
                      title="Report issue"
                      @click.stop
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </button>
                    <button
                      v-if="showAnswer[q.id]"
                      class="iso-btn iso-btn--ghost next-btn"
                      @click.stop="nextQuestion(i)"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button
              class="iso-btn iso-btn--ghost page-btn"
              :disabled="currentPage === 1"
              @click="gotoPage(currentPage - 1)"
            >← Prev</button>

            <div class="page-numbers">
              <button
                v-for="p in visiblePages"
                :key="p"
                class="page-num"
                :class="{ active: p === currentPage, ellipsis: p === '…' }"
                :disabled="p === '…'"
                @click="typeof p === 'number' && gotoPage(p)"
              >{{ p }}</button>
            </div>

            <button
              class="iso-btn iso-btn--ghost page-btn"
              :disabled="currentPage === totalPages"
              @click="gotoPage(currentPage + 1)"
            >Next →</button>
          </div>
        </template>
      </div>

      <!-- Right sidebar -->
      <aside class="qbank-sidebar">

        <!-- Session stats -->
        <div class="side-panel">
          <div class="panel-header">
            <span class="panel-tag">Session</span>
            <button class="iso-btn iso-btn--ghost mini-btn" @click="resetSession">Reset</button>
          </div>
          <div class="session-stats">
            <div class="sess-stat">
              <span class="sess-val">{{ sessionStats.attempted }}</span>
              <span class="sess-label">Attempted</span>
            </div>
            <div class="sess-stat">
              <span class="sess-val correct-val">{{ sessionStats.correct }}</span>
              <span class="sess-label">Correct</span>
            </div>
            <div class="sess-stat">
              <span class="sess-val wrong-val">{{ sessionStats.wrong }}</span>
              <span class="sess-label">Wrong</span>
            </div>
            <div class="sess-stat">
              <span class="sess-val">{{ sessionAccuracy }}%</span>
              <span class="sess-label">Accuracy</span>
            </div>
          </div>
          <!-- Accuracy bar -->
          <div class="accuracy-bar-wrap">
            <div class="accuracy-bar-fill" :style="{ width: sessionAccuracy + '%' }" />
          </div>
        </div>

        <!-- Bookmarks -->
        <div class="side-panel">
          <div class="panel-header">
            <span class="panel-tag">Bookmarked</span>
            <span class="panel-count">{{ bookmarkedIds.size }}</span>
          </div>
          <div v-if="!bookmarkedIds.size" class="side-empty">
            Bookmark questions to review later.
          </div>
          <div v-else class="bookmark-list">
            <div
              v-for="id in [...bookmarkedIds].slice(0, 5)"
              :key="id"
              class="bookmark-row"
              @click="jumpToQuestion(id)"
            >
              <span class="bm-hash">#{{ allQuestions.findIndex(q => q.id === id) + 1 }}</span>
              <span class="bm-text">{{ allQuestions.find(q => q.id === id)?.question[selectedLang].slice(0, 55) }}…</span>
            </div>
            <span v-if="bookmarkedIds.size > 5" class="bm-more">+{{ bookmarkedIds.size - 5 }} more</span>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="side-panel quick-actions">
          <div class="panel-header">
            <span class="panel-tag">Quick Start</span>
          </div>
          <div class="qa-list">
            <button class="qa-item" @click="startMockWithFilters">
              <span class="qa-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </span>
              <div class="qa-text">
                <span class="qa-title">Mock Exam</span>
                <span class="qa-sub">30 questions · timed</span>
              </div>
              <span class="qa-arrow">→</span>
            </button>
            <button class="qa-item" @click="startPracticeMode">
              <span class="qa-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </span>
              <div class="qa-text">
                <span class="qa-title">Practice Mode</span>
                <span class="qa-sub">Unlimited · no timer</span>
              </div>
              <span class="qa-arrow">→</span>
            </button>
            <button class="qa-item" @click="reviewWeakOnly">
              <span class="qa-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
              </span>
              <div class="qa-text">
                <span class="qa-title">Weak Topics</span>
                <span class="qa-sub">AI-selected gaps</span>
              </div>
              <span class="qa-arrow">→</span>
            </button>
          </div>
        </div>

      </aside>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────
interface Question {
  id: number
  question: string | { english: string; bangla: string }
  options?: string[] | { english: string[]; bangla: string[] }
  correctIndex?: number  // unchanged — index is language-agnostic
  explanation: string | { english: string; bangla: string }
  subject: string | { english: string; bangla: string }
  chapter: string | { english: string; bangla: string }
  exam: string
  difficulty: string | { english: string; bangla: string }
  difficultyLevel: 'easy' | 'medium' | 'hard'
  year?: string | { english: string; bangla: string }
  yearEn?: number
}

const { tm, isBn } = useI18n()
let selectedLang = computed(() => isBn.value ? 'bangla' : 'english')

// ── Constants ──────────────────────────────────────────────
const optLetters = ['A', 'B', 'C', 'D', 'E']

const examStreams = ['All', 'HSC', 'SSC', 'BUET', 'Medical', 'DU', 'BCS', 'Bank']

const subjectMap = computed<Record<string, string[]>>(
  () => tm('qBank.subjectMap') as Record<string, string[]>
)

const difficulties = [
  { val: 'all',   label: 'All',    cls: '' },
  { val: 'easy',  label: 'Easy',   cls: 'easy-pill' },
  { val: 'medium',label: 'Medium', cls: 'med-pill' },
  { val: 'hard',  label: 'Hard',   cls: 'hard-pill' },
]

const sortOptions = [
  { val: 'default', label: 'Default' },
  { val: 'easy-first', label: 'Easy First' },
  { val: 'hard-first', label: 'Hard First' },
  { val: 'year', label: 'By Year' },
]

const bankStats = [
  { value: '1M+',  label: 'Questions' },
  { value: '8',    label: 'Exam Streams' },
  { value: '200+', label: 'Chapters' },
  { value: '20yr', label: 'Past Papers' },
]

// ── State ──────────────────────────────────────────────────
const loading = ref(true)
const searchQuery = ref('')
const selectedExam = ref('All')
const selectedSubject = ref('All')
const selectedDiff = ref('all')
const selectedChapter = ref('')
const sortBy = ref('default')
const currentPage = ref(1)
const pageSize = 10

const expandedId = ref<number | null>(null)
const selectedAnswers = ref<Record<number, number>>({})
const showAnswer = ref<Record<number, boolean>>({})
const bookmarkedIds = ref<Set<number>>(new Set())
const solvedIds = ref<Set<number>>(new Set())
const sessionStats = ref({ attempted: 0, correct: 0, wrong: 0 })

// ── Demo question bank ─────────────────────────────────────
const allQuestions = ref<Question[]>([])

const demoQuestions: Question[] = [
  // HSC Physics
  {
    id: 1, exam: 'HSC', 
    subject: { english: 'Physics', bangla: 'পদার্থবিজ্ঞান' }, 
    chapter: { english: 'Optics & Wave', bangla: 'আলোকবিজ্ঞান ও তরঙ্গ' }, 
    difficulty: { english: 'hard', bangla: 'কঠিন' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'hard',
    yearEn: 2023,
    question: {
      english: 'A convex lens of focal length 20 cm is placed coaxially with a concave lens of focal length 40 cm. The combination behaves as:',
      bangla: '২০ সেমি ফোকাস দূরত্বের একটি উত্তল লেন্স ৪০ সেমি ফোকাস দূরত্বের একটি অবতল লেন্সের সাথে সমাক্ষীয়ভাবে স্থাপিত। সমন্বয়টি কাজ করে:'
    },
    options: {
      english: ['Converging lens of f = 40 cm', 'Diverging lens of f = 40 cm', 'Converging lens of f = 20 cm', 'Plane glass'],
      bangla: ['f = ৪০ সেমি অভিসারী লেন্স', 'f = ৪০ সেমি অপসারী লেন্স', 'f = ২০ সেমি অভিসারী লেন্স', 'সমতল কাচ']
    },
    correctIndex: 0,
    explanation: {
      english: 'For combination: 1/f = 1/f₁ + 1/f₂ = 1/20 + 1/(−40) = 1/40. So f = 40 cm converging.',
      bangla: 'সমন্বয়ের ক্ষেত্রে: ১/f = ১/f₁ + ১/f₂ = ১/২০ + ১/(−৪০) = ১/৪০। সুতরাং f = ৪০ সেমি অভিসারী।'
    }
  },

  {
    id: 2, exam: 'HSC', 
    subject: { english: 'Physics', bangla: 'পদার্থবিজ্ঞান' }, 
    chapter: { english: 'Electricity', bangla: 'তড়িৎ' }, 
    difficulty: { english: 'medium', bangla: 'মধ্যম' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'medium',
    yearEn: 2022,
    question: {
      english: 'Two resistors of 4Ω and 6Ω are connected in parallel. The equivalent resistance is:',
      bangla: '৪Ω এবং ৬Ω এর দুটি রোধ সমান্তরালে সংযুক্ত। তুল্য রোধ কত?'
    },
    options: {
      english: ['10Ω', '2.4Ω', '5Ω', '1.67Ω'],
      bangla: ['১০Ω', '২.৪Ω', '৫Ω', '১.৬৭Ω']
    },
    correctIndex: 1,
    explanation: {
      english: '1/R = 1/4 + 1/6 = 5/12. So R = 12/5 = 2.4Ω.',
      bangla: '১/R = ১/৪ + ১/৬ = ৫/১২। সুতরাং R = ১২/৫ = ২.৪Ω।'
    }
  },

  {
    id: 3, exam: 'HSC', 
    subject: { english: 'Physics', bangla: 'পদার্থবিজ্ঞান' }, 
    chapter: { english: 'Motion', bangla: 'গতি' }, 
    difficulty: { english: 'easy', bangla: 'সহজ' }, 
    year: { english: '2021', bangla: '২০২১' },
    difficultyLevel: 'easy',
    yearEn: 2021,
    question: {
      english: "A body at rest is said to be in uniform motion with zero acceleration. According to Newton's first law, what keeps it in that state?",
      bangla: "স্থির বস্তু শূন্য ত্বরণে সুষম গতিতে আছে বলা হয়। নিউটনের প্রথম সূত্র অনুসারে, কোন ধর্ম বস্তুটিকে এই অবস্থায় রাখে?"
    },
    options: {
      english: ['Gravity', 'Inertia', 'Friction', 'Net force'],
      bangla: ['মহাকর্ষ', 'জড়তা', 'ঘর্ষণ', 'নিট বল']
    },
    correctIndex: 1,
    explanation: {
      english: "Newton's first law states that a body remains at rest or in uniform motion unless acted upon by an external net force. Inertia is the property responsible.",
      bangla: "নিউটনের প্রথম সূত্র অনুযায়ী, বাহ্যিক বল প্রয়োগ না করলে বস্তু যে অবস্থায় আছে সে অবস্থাতেই থাকতে চায়। জড়তা হলো সেই ধর্ম।"
    }
  },

  // HSC Chemistry
  {
    id: 4, exam: 'HSC', 
    subject: { english: 'Chemistry', bangla: 'রসায়ন' }, 
    chapter: { english: 'Electrochemistry', bangla: 'তড়িৎ রসায়ন' }, 
    difficulty: { english: 'hard', bangla: 'কঠিন' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'hard',
    yearEn: 2023,
    question: {
      english: 'During electrolysis of dilute H₂SO₄, which gas is liberated at the anode?',
      bangla: 'লঘু H₂SO₄ এর তড়িৎ বিশ্লেষণের সময় অ্যানোডে কোন গ্যাসটি মুক্ত হয়?'
    },
    options: {
      english: ['Hydrogen', 'Oxygen', 'Sulphur dioxide', 'Ozone'],
      bangla: ['হাইড্রোজেন', 'অক্সিজেন', 'সালফার ডাই অক্সাইড', 'ওজোন']
    },
    correctIndex: 1,
    explanation: {
      english: 'At the anode (oxidation), water is oxidized: 2H₂O → O₂ + 4H⁺ + 4e⁻. Oxygen is liberated.',
      bangla: 'অ্যানোডে (জারণ) পানি জারিত হয়: 2H₂O → O₂ + 4H⁺ + 4e⁻। ফলে অক্সিজেন মুক্ত হয়।'
    }
  },

  {
    id: 5, exam: 'HSC', 
    subject: { english: 'Chemistry', bangla: 'রসায়ন' }, 
    chapter: { english: 'Periodic Table', bangla: 'পর্যায় সারণি' }, 
    difficulty: { english: 'easy', bangla: 'সহজ' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'easy',
    yearEn: 2022,
    question: {
      english: 'Which of the following has the highest electronegativity?',
      bangla: 'নিচের কোনটির তড়িৎ ঋণাত্মকতা সবচেয়ে বেশি?'
    },
    options: {
      english: ['Chlorine (Cl)', 'Fluorine (F)', 'Oxygen (O)', 'Nitrogen (N)'],
      bangla: ['ক্লোরিন (Cl)', 'ফ্লোরিন (F)', 'অক্সিজেন (O)', 'নাইট্রোজেন (N)']
    },
    correctIndex: 1,
    explanation: {
      english: 'Fluorine has the highest electronegativity (3.98 on Pauling scale) of all elements.',
      bangla: 'ফ্লোরিন এর তড়িৎ ঋণাত্মকতা সবচেয়ে বেশি (পাউলিং স্কেলে ৩.৯৮)।'
    }
  },

  {
    id: 6, exam: 'HSC', 
    subject: { english: 'Chemistry', bangla: 'রসায়ন' }, 
    chapter: { english: 'Organic Chemistry', bangla: 'জৈব রসায়ন' }, 
    difficulty: { english: 'medium', bangla: 'মধ্যম' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'medium',
    yearEn: 2023,
    question: {
      english: 'Which functional group is present in ethanol?',
      bangla: 'ইথানলে কোন কার্যকরী মূলক উপস্থিত থাকে?'
    },
    options: {
      english: ['Aldehyde –CHO', 'Carboxyl –COOH', 'Hydroxyl –OH', 'Ketone C=O'],
      bangla: ['অ্যালডিহাইড –CHO', 'কার্বক্সিল –COOH', 'হাইড্রোক্সিল –OH', 'কিটোন C=O']
    },
    correctIndex: 2,
    explanation: {
      english: 'Ethanol (C₂H₅OH) is an alcohol. It contains the hydroxyl functional group (–OH).',
      bangla: 'ইথানল (C₂H₅OH) একটি অ্যালকোহল। এতে হাইড্রোক্সিল (–OH) কার্যকরী মূলক থাকে।'
    }
  },

  // HSC Math
  {
    id: 7, exam: 'HSC', 
    subject: { english: 'Math', bangla: 'গণিত' }, 
    chapter: { english: 'Integration', bangla: 'যোগজীকরণ' }, 
    difficulty: { english: 'hard', bangla: 'কঠিন' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'hard',
    yearEn: 2022,
    question: {
      english: 'Evaluate: ∫(x² + 3x + 2)dx from x=0 to x=1',
      bangla: 'মান নির্ণয় করো: ∫(x² + 3x + 2)dx (সীমা x=০ থেকে x=১)'
    },
    options: {
      english: ['23/6', '5/2', '7/3', '3/2'],
      bangla: ['২৩/৬', '৫/২', '৭/৩', '৩/২']
    },
    correctIndex: 0,
    explanation: {
      english: '∫(x²+3x+2)dx = [x³/3 + 3x²/2 + 2x] from 0 to 1 = 1/3 + 3/2 + 2 = 23/6.',
      bangla: '∫(x²+3x+2)dx = [x³/৩ + ৩x²/২ + ২x] (০ থেকে ১ সীমা) = ১/৩ + ৩/২ + ২ = ২৩/৬।'
    }
  },

  {
    id: 8, exam: 'HSC', 
    subject: { english: 'Math', bangla: 'গণিত' }, 
    chapter: { english: 'Trigonometry', bangla: 'ত্রিকোণমিতি' }, 
    difficulty: { english: 'medium', bangla: 'মধ্যম' }, 
    year: { english: '2021', bangla: '২০২১' },
    difficultyLevel: 'medium',
    yearEn: 2021,
    question: {
      english: 'If sin θ = 3/5, what is the value of cos θ (assuming 0 < θ < π/2)?',
      bangla: 'যদি sin θ = ৩/৫ হয়, তবে cos θ এর মান কত? (ধরি ০ < θ < π/২)'
    },
    options: {
      english: ['4/5', '3/4', '5/4', '1/2'],
      bangla: ['৪/৫', '৩/৪', '৫/৪', '১/২']
    },
    correctIndex: 0,
    explanation: {
      english: 'cos²θ = 1 − 9/25 = 16/25, so cosθ = 4/5.',
      bangla: 'cos²θ = ১ − ৯/২৫ = ১৬/২৫, সুতরাং cosθ = ৪/৫।'
    }
  },

  // BUET
  {
    id: 9, exam: 'BUET', 
    subject: { english: 'Higher Math', bangla: 'উচ্চতর গণিত' }, 
    chapter: { english: 'Complex Numbers', bangla: 'জটিল সংখ্যা' }, 
    difficulty: { english: 'hard', bangla: 'কঠিন' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'hard',
    yearEn: 2023,
    question: {
      english: 'The modulus of the complex number (1 + i)⁸ is:',
      bangla: '(1 + i)⁸ জটিল সংখ্যাটির পরম মান (modulus) কত?'
    },
    options: {
      english: ['4', '8', '16', '32'],
      bangla: ['৪', '৮', '১৬', '৩২']
    },
    correctIndex: 2,
    explanation: {
      english: '|1+i| = √2, so |(1+i)⁸| = (√2)⁸ = 2⁴ = 16.',
      bangla: '|১+i| = √২, সুতরাং |(১+i)⁸| = (√২)⁸ = ২⁴ = ১৬।'
    }
  },

  {
    id: 10, exam: 'BUET', 
    subject: { english: 'Physics', bangla: 'পদার্থবিজ্ঞান' }, 
    chapter: { english: 'Thermodynamics', bangla: 'তাপগতিবিদ্যা' }, 
    difficulty: { english: 'hard', bangla: 'কঠিন' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'hard',
    yearEn: 2022,
    question: {
      english: 'In an adiabatic process for an ideal gas, which quantity remains constant?',
      bangla: 'আদর্শ গ্যাসের রুদ্ধতাপীয় প্রক্রিয়ায় কোন রাশিটি স্থির থাকে?'
    },
    options: {
      english: ['Temperature', 'Pressure', 'Volume', 'PVγ'],
      bangla: ['তাপমাত্রা', 'চাপ', 'আয়তন', 'PVγ']
    },
    correctIndex: 3,
    explanation: {
      english: 'In an adiabatic process, Q = 0. The relation PVγ = constant holds.',
      bangla: 'রুদ্ধতাপীয় প্রক্রিয়ায় তাপের আদান-প্রদান হয় না (Q = ০)। এখানে PVγ = ধ্রুবক।'
    }
  },

  // BCS
  {
    id: 11, exam: 'BCS', 
    subject: { english: 'Bangladesh Affairs', bangla: 'বাংলাদেশ বিষয়াবলী' }, 
    chapter: { english: 'Liberation War', bangla: 'মুক্তিযুদ্ধ' }, 
    difficulty: { english: 'medium', bangla: 'মধ্যম' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'medium',
    yearEn: 2023,
    question: {
      english: 'Bangladesh was recognized as an independent state by which country first after independence?',
      bangla: 'স্বাধীনতার পর কোন দেশ প্রথম বাংলাদেশকে স্বাধীন রাষ্ট্র হিসেবে স্বীকৃতি দেয়?'
    },
    options: {
      english: ['India', 'Soviet Union', 'Bhutan', 'Nepal'],
      bangla: ['ভারত', 'সোভিয়েত ইউনিয়ন', 'ভুটান', 'নেপাল']
    },
    correctIndex: 2,
    explanation: {
      english: 'Bhutan was the first country to recognize Bangladesh on December 6, 1971.',
      bangla: '৬ ডিসেম্বর, ১৯৭১ সালে ভুটান প্রথম দেশ হিসেবে বাংলাদেশকে স্বীকৃতি দেয়।'
    }
  },

  {
    id: 12, exam: 'BCS', 
    subject: { english: 'English', bangla: 'ইংরেজি' }, 
    chapter: { english: 'Grammar', bangla: 'ব্যাকরণ' }, 
    difficulty: { english: 'easy', bangla: 'সহজ' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'easy',
    yearEn: 2022,
    question: {
      english: 'Choose the correct sentence:',
      bangla: 'সঠিক বাক্যটি নির্বাচন করুন:'
    },
    options: {
      english: [
        'Neither the students nor the teacher were present.',
        'Neither the students nor the teacher was present.',
        'Neither the students nor the teacher are present.',
        'Neither the students nor the teacher be present.'
      ],
      bangla: [
        'Neither the students nor the teacher were present.',
        'Neither the students nor the teacher was present.',
        'Neither the students nor the teacher are present.',
        'Neither the students nor the teacher be present.'
      ]
    },
    correctIndex: 1,
    explanation: {
      english: 'When "neither…nor" connects two subjects, the verb agrees with the subject closest to it.',
      bangla: '"Neither…nor" দ্বারা দুটি subject যুক্ত হলে verb নিকটবর্তী subject অনুযায়ী হয়।'
    }
  },

  {
    id: 13, exam: 'BCS', 
    subject: { english: 'Math', bangla: 'গণিত' }, 
    chapter: { english: 'Percentage', bangla: 'শতকরা' }, 
    difficulty: { english: 'easy', bangla: 'সহজ' }, 
    year: { english: '2021', bangla: '২০২১' },
    difficultyLevel: 'easy',
    yearEn: 2021,
    question: {
      english: 'A product is sold at 20% profit. If the cost price is Tk. 500, what is the selling price?',
      bangla: 'একটি পণ্য ২০% লাভে বিক্রি করা হয়। ক্রয়মূল্য ৫০০ টাকা হলে বিক্রয়মূল্য কত?'
    },
    options: {
      english: ['Tk. 580', 'Tk. 600', 'Tk. 520', 'Tk. 620'],
      bangla: ['৫৮০ টাকা', '৬০০ টাকা', '৫২০ টাকা', '৬২০ টাকা']
    },
    correctIndex: 1,
    explanation: {
      english: 'Selling price = 500 × 1.20 = 600.',
      bangla: 'বিক্রয়মূল্য = ৫০০ এর ১২০% = ৬০০ টাকা।'
    }
  },

  // Medical
  {
    id: 14, exam: 'Medical', 
    subject: { english: 'Biology', bangla: 'জীববিজ্ঞান' }, 
    chapter: { english: 'Cell Biology', bangla: 'কোষ জীববিজ্ঞান' }, 
    difficulty: { english: 'hard', bangla: 'কঠিন' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'hard',
    yearEn: 2023,
    question: {
      english: 'Which organelle is called the "powerhouse" of the cell and produces ATP?',
      bangla: 'কোষের কোন অঙ্গাণুকে "পাওয়ার হাউস" বলা হয় এবং যা ATP তৈরি করে?'
    },
    options: {
      english: ['Ribosome', 'Mitochondria', 'Chloroplast', 'Golgi apparatus'],
      bangla: ['রাইবোসোম', 'মাইটোকন্ড্রিয়া', 'ক্লোরোপ্লাস্ট', 'গলজি বডি']
    },
    correctIndex: 1,
    explanation: {
      english: 'Mitochondria produce ATP via oxidative phosphorylation.',
      bangla: 'মাইটোকন্ড্রিয়া অক্সিডেটিভ ফসফোরিলেশনের মাধ্যমে ATP তৈরি করে।'
    }
  },

  {
    id: 15, exam: 'Medical', 
    subject: { english: 'Chemistry', bangla: 'রসায়ন' }, 
    chapter: { english: 'Biochemistry', bangla: 'প্রাণরসায়ন' }, 
    difficulty: { english: 'medium', bangla: 'মধ্যম' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'medium',
    yearEn: 2022,
    question: {
      english: 'The pH of human blood is maintained approximately at:',
      bangla: 'মানুষের রক্তের pH সাধারণত কত থাকে?'
    },
    options: {
      english: ['6.4–6.8', '7.0–7.2', '7.35–7.45', '7.8–8.0'],
      bangla: ['৬.৪–৬.৮', '৭.০–৭.২', '৭.৩৫–৭.৪৫', '৭.৮–৮.০']
    },
    correctIndex: 2,
    explanation: {
      english: 'Normal human blood pH is maintained between 7.35 and 7.45.',
      bangla: 'মানুষের রক্তের স্বাভাবিক pH ৭.৩৫ থেকে ৭.৪৫ এর মধ্যে থাকে।'
    }
  },

  // SSC
  {
    id: 16, exam: 'SSC', 
    subject: { english: 'Physics', bangla: 'পদার্থবিজ্ঞান' }, 
    chapter: { english: 'Force & Motion', bangla: 'বল ও গতি' }, 
    difficulty: { english: 'easy', bangla: 'সহজ' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'easy',
    yearEn: 2023,
    question: {
      english: 'What is the SI unit of force?',
      bangla: 'বলের SI একক কী?'
    },
    options: {
      english: ['Joule', 'Watt', 'Newton', 'Pascal'],
      bangla: ['জুল', 'ওয়াট', 'নিউটন', 'প্যাসকেল']
    },
    correctIndex: 2,
    explanation: {
      english: 'The SI unit of force is the Newton (N).',
      bangla: 'বলের আন্তর্জাতিক বা SI একক হলো নিউটন (N)।'
    }
  },

  {
    id: 17, exam: 'SSC', 
    subject: { english: 'Math', bangla: 'গণিত' }, 
    chapter: { english: 'Algebra', bangla: 'বীজগণিত' }, 
    difficulty: { english: 'medium', bangla: 'মধ্যম' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'medium',
    yearEn: 2022,
    question: {
      english: 'If x + 1/x = 3, what is the value of x² + 1/x²?',
      bangla: 'যদি x + ১/x = ৩ হয়, তবে x² + ১/x² এর মান কত?'
    },
    options: {
      english: ['7', '9', '11', '5'],
      bangla: ['৭', '৯', '১১', '৫']
    },
    correctIndex: 0,
    explanation: {
      english: '(x + 1/x)² − 2 = 3² − 2 = 7.',
      bangla: '(x + ১/x)² − ২ = ৩² − ২ = ৭।'
    }
  },

  // Bank
  {
    id: 18, exam: 'Bank', 
    subject: { english: 'English', bangla: 'ইংরেজি' }, 
    chapter: { english: 'Vocabulary', bangla: 'শব্দভাণ্ডার' }, 
    difficulty: { english: 'easy', bangla: 'সহজ' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'easy',
    yearEn: 2023,
    question: {
      english: 'The antonym of "Eloquent" is:',
      bangla: '"Eloquent" শব্দটির বিপরীত শব্দ কোনটি?'
    },
    options: {
      english: ['Fluent', 'Articulate', 'Inarticulate', 'Verbose'],
      bangla: ['Fluent', 'Articulate', 'Inarticulate', 'Verbose']
    },
    correctIndex: 2,
    explanation: {
      english: 'Eloquent means fluent; inarticulate means unable to express clearly.',
      bangla: 'Eloquent অর্থ সুবক্তা; Inarticulate অর্থ যে গুছিয়ে কথা বলতে পারে না।'
    }
  },

  {
    id: 19, exam: 'Bank', 
    subject: { english: 'Math', bangla: 'গণিত' }, 
    chapter: { english: 'Profit & Loss', bangla: 'লাভ-ক্ষতি' }, 
    difficulty: { english: 'medium', bangla: 'মধ্যম' }, 
    year: { english: '2022', bangla: '২০২২' },
    difficultyLevel: 'medium',
    yearEn: 2022,
    question: {
      english: 'A trader bought goods for Tk. 800 and sold them at a loss of 12.5%. Find the selling price.',
      bangla: 'একজন বিক্রেতা ৮০০ টাকায় পণ্য কিনে ১২.৫% ক্ষতিতে বিক্রি করলেন। বিক্রয়মূল্য কত?'
    },
    options: {
      english: ['Tk. 700', 'Tk. 650', 'Tk. 680', 'Tk. 720'],
      bangla: ['৭০০ টাকা', '৬৫০ টাকা', '৬৮০ টাকা', '৭২০ টাকা']
    },
    correctIndex: 0,
    explanation: {
      english: 'Selling price = 800 − (800 × 0.125) = 700.',
      bangla: 'বিক্রয়মূল্য = ৮০০ − (৮০০ এর ১২.৫%) = ৭০০ টাকা।'
    }
  },

  {
    id: 20, exam: 'HSC', 
    subject: { english: 'ICT', bangla: 'আইসিটি' }, 
    chapter: { english: 'Database', bangla: 'ডেটাবেজ' }, 
    difficulty: { english: 'easy', bangla: 'সহজ' }, 
    year: { english: '2023', bangla: '২০২৩' },
    difficultyLevel: 'easy',
    yearEn: 2023,
    question: {
      english: 'Which of the following is NOT a type of database management system?',
      bangla: 'নিচের কোনটি ডেটাবেজ ম্যানেজমেন্ট সিস্টেমের (DBMS) প্রকারভেদ নয়?'
    },
    options: {
      english: ['Relational', 'Hierarchical', 'Network', 'Sequential'],
      bangla: ['Relational', 'Hierarchical', 'Network', 'Sequential']
    },
    correctIndex: 3,
    explanation: {
      english: 'The main types of DBMS include Relational, Hierarchical, and Network.',
      bangla: 'DBMS-এর প্রধান প্রকারভেদগুলো হলো রিলেশনাল, হায়ারার্কিকাল এবং নেটওয়ার্ক।'
    }
  },
]

// ── Filtered / sorted data ─────────────────────────────────
const filteredQuestions = ref<Question[]>([])

const availableSubjects = computed(() => subjectMap.value[selectedExam.value] ?? ['All'])

const chapterBreakdown = computed(() => {
  const map: Record<string, number> = {}
  filteredQuestions.value.forEach(q => {
    map[q.chapter[selectedLang.value]] = (map[q.chapter[selectedLang.value]] ?? 0) + 1
  })
  return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
})

const totalPages = computed(() => Math.ceil(filteredQuestions.value.length / pageSize))

const paginatedQuestions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredQuestions.value.slice(start, start + pageSize)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const curr = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (curr > 3) pages.push('…')
  for (let p = Math.max(2, curr - 1); p <= Math.min(total - 1, curr + 1); p++) pages.push(p)
  if (curr < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

const sessionAccuracy = computed(() => {
  if (!sessionStats.value.attempted) return 0
  return Math.round((sessionStats.value.correct / sessionStats.value.attempted) * 100)
})

// ── Filter logic ───────────────────────────────────────────
function applyFilters() {
  let qs = [...allQuestions.value]
  let selectedLang = computed(() => isBn.value ? 'bangla' : 'english')

  if (selectedExam.value !== 'All') qs = qs.filter(q => q.exam === selectedExam.value)
  if (selectedSubject.value !== 'All') qs = qs.filter(q => q.subject[selectedLang.value] === selectedSubject.value)
  if (selectedDiff.value !== 'all') qs = qs.filter(q => q.difficultyLevel === selectedDiff.value)
  if (selectedChapter.value) qs = qs.filter(q => q.chapter[selectedLang.value] === selectedChapter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    qs = qs.filter(x =>
      x.question[selectedLang.value].toLowerCase().includes(q) ||
      x.subject[selectedLang.value].toLowerCase().includes(q) ||
      x.chapter[selectedLang.value].toLowerCase().includes(q)
    )
  }

  // Sort
  if (sortBy.value === 'easy-first') qs.sort((a, b) => ['easy','medium','hard'].indexOf(a.difficultyLevel) - ['easy','medium','hard'].indexOf(b.difficultyLevel))
  else if (sortBy.value === 'hard-first') qs.sort((a, b) => ['hard','medium','easy'].indexOf(a.difficultyLevel) - ['hard','medium','easy'].indexOf(b.difficultyLevel))
  else if (sortBy.value === 'year') qs.sort((a, b) => (b.yearEn ?? '0').localeCompare(a.yearEn ?? '0'))

  filteredQuestions.value = qs
  currentPage.value = 1
  expandedId.value = null
}

function selectExam(exam: string) {
  selectedExam.value = exam
  selectedSubject.value = 'All'
  selectedChapter.value = ''
  applyFilters()
}

function selectSubject(sub: string) {
  selectedSubject.value = sub
  selectedChapter.value = ''
  applyFilters()
}

function selectDiff(d: string) {
  selectedDiff.value = d
  applyFilters()
}

function filterByChapter(ch: string) {
  selectedChapter.value = selectedChapter.value === ch ? '' : ch
  applyFilters()
}

function resetFilters() {
  searchQuery.value = ''
  selectedExam.value = 'All'
  selectedSubject.value = 'All'
  selectedDiff.value = 'all'
  selectedChapter.value = ''
  sortBy.value = 'default'
  applyFilters()
}

let searchTimer: ReturnType<typeof setTimeout>
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(applyFilters, 250)
}

// ── Interaction ────────────────────────────────────────────
function toggleExpand(id: number) {
  expandedId.value = expandedId.value === id ? null : id
}

function selectAnswer(qId: number, optIdx: number) {
  if (showAnswer.value[qId]) return
  selectedAnswers.value = { ...selectedAnswers.value, [qId]: optIdx }
}

function revealAnswer(qId: number) {
  const q = allQuestions.value.find(x => x.id === qId)
  if (!q) return
  showAnswer.value = { ...showAnswer.value, [qId]: true }
  solvedIds.value.add(qId)

  const chosen = selectedAnswers.value[qId]
  if (chosen !== undefined) {
    sessionStats.value.attempted++
    if (chosen === q.correctIndex) sessionStats.value.correct++
    else sessionStats.value.wrong++
  } else {
    // Revealed without selecting (non-MCQ)
    sessionStats.value.attempted++
    sessionStats.value.correct++
  }
}

function nextQuestion(currentIdx: number) {
  const nextIdx = currentIdx + 1
  if (nextIdx < paginatedQuestions.value.length) {
    expandedId.value = paginatedQuestions.value[nextIdx].id
  } else if (currentPage.value < totalPages.value) {
    gotoPage(currentPage.value + 1)
  }
}

function toggleBookmark(id: number) {
  const s = new Set(bookmarkedIds.value)
  s.has(id) ? s.delete(id) : s.add(id)
  bookmarkedIds.value = s
}

function jumpToQuestion(id: number) {
  const idx = filteredQuestions.value.findIndex(q => q.id === id)
  if (idx === -1) { resetFilters(); return }
  const page = Math.floor(idx / pageSize) + 1
  gotoPage(page)
  nextTick(() => { 
    expandedId.value = id 
    nextTick(() => {
      const el = document.getElementById(`q-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    });
  })
}

function gotoPage(p: number) {
  currentPage.value = p
  expandedId.value = null
  //window.scrollTo({ top: 0, behavior: 'smooth' })
  window.scrollTo({ behavior: 'smooth' })
}

function resetSession() {
  sessionStats.value = { attempted: 0, correct: 0, wrong: 0 }
  selectedAnswers.value = {}
  showAnswer.value = {}
  solvedIds.value = new Set()
}

function startMockWithFilters() { navigateTo('/dashboard/mock-exam') }
function startPracticeMode() { /* future */ }
function reviewWeakOnly() { selectedDiff.value = 'hard'; applyFilters() }

// ── Init ───────────────────────────────────────────────────
onMounted(async () => {
  // Simulate network fetch
  await new Promise(r => setTimeout(r, 600))
  allQuestions.value = demoQuestions
  applyFilters()
  loading.value = false

  // Handle URL query param ?topic=
  const route = useRoute()
  if (route.query.topic) {
    searchQuery.value = route.query.topic as string
    applyFilters()
  }
})
</script>

<style scoped>
/* ── Page layout ─────────────────────────────────────────── */
.qbank { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── Header ──────────────────────────────────────────────── */
.qbank-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem;
  border: 1px solid var(--border);
  background: #0d0d0d;
  position: relative;
  overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

/* Dot-grid background */
.qbank-header::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.page-chip {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border-bright);
  padding: 5px 12px; margin-bottom: 0.9rem;
  position: relative;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--white); animation: blink 2s infinite;
}

.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-weight: 700; letter-spacing: -1px;
  color: var(--white); line-height: 1.1;
  margin-bottom: 0.5rem;
  position: relative;
}

.page-sub {
  font-size: 0.83rem; color: var(--gray);
  font-weight: 300; max-width: 400px;
  position: relative;
}

.header-stats {
  display: flex; gap: 0;
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  flex-shrink: 0;
  position: relative;
}

.hstat {
  display: flex; flex-direction: column; gap: 3px;
  padding: 1.1rem 1.6rem;
  border-right: 1px solid var(--border);
  min-width: 90px; text-align: center;
}
.hstat:last-child { border-right: none; }

.hstat-value {
  font-family: var(--font-mono);
  font-size: 1.4rem; font-weight: 700;
  color: var(--white); letter-spacing: -0.5px;
}
.hstat-label {
  font-size: 0.62rem; text-transform: uppercase;
  letter-spacing: 0.12em; color: var(--gray);
}

/* ── Filter bar ──────────────────────────────────────────── */
.filter-bar {
  border: 1px solid var(--border);
  background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.filter-search {
  position: relative;
  border-bottom: 1px solid var(--border);
}

.search-icon {
  position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
  color: var(--gray); display: flex; align-items: center;
  pointer-events: none;
}

.search-input {
  border: none !important;
  background: transparent !important;
  padding: 14px 40px 14px 42px !important;
  font-size: 0.88rem !important;
  box-shadow: none !important;
}
.search-input:focus { box-shadow: none !important; }

.search-clear {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--gray);
  cursor: pointer; font-size: 1rem; line-height: 1;
  transition: color 0.2s;
}
.search-clear:hover { color: var(--white); }

.filters-row {
  display: flex; flex-wrap: wrap; gap: 0;
  border-bottom: 1px solid var(--border);
}

.filter-group {
  padding: 1rem 1.4rem;
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 8px;
  min-width: 0;
}
.filter-group:last-child { border-right: none; margin-left: auto; }

.filter-actions {
  flex-direction: row;
  align-items: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-actions .form-label { width: 100%; }

.filter-pills {
  display: flex; flex-wrap: wrap; gap: 6px;
}

.filter-pill {
  font-family: var(--font-mono);
  font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 5px 12px;
  background: transparent; color: var(--gray);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.filter-pill:hover { color: var(--white); border-color: var(--border-bright); }
.filter-pill.active {
  background: var(--white); color: var(--black);
  border-color: var(--white);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.2), 3px 3px 0 0 rgba(200,200,190,0.15);
}

.pill-count {
  font-size: 0.55rem;
  opacity: 0.6;
  margin-left: 2px;
}

/* Difficulty pill colors (subtle, low opacity per brand rules) */
.diff-pill.easy-pill { color: rgba(120,230,120,0.7); border-color: rgba(120,230,120,0.2); }
.diff-pill.easy-pill:hover { border-color: rgba(120,230,120,0.5); }
.diff-pill.easy-pill.active { background: rgba(120,230,120,0.15); color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.4); box-shadow: 2px 2px 0 0 rgba(120,230,120,0.1); }

.diff-pill.med-pill { color: rgba(255,200,80,0.7); border-color: rgba(255,200,80,0.2); }
.diff-pill.med-pill:hover { border-color: rgba(255,200,80,0.5); }
.diff-pill.med-pill.active { background: rgba(255,200,80,0.1); color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); box-shadow: 2px 2px 0 0 rgba(255,200,80,0.1); }

.diff-pill.hard-pill { color: rgba(255,100,100,0.7); border-color: rgba(255,100,100,0.2); }
.diff-pill.hard-pill:hover { border-color: rgba(255,100,100,0.5); }
.diff-pill.hard-pill.active { background: rgba(255,100,100,0.1); color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.4); box-shadow: 2px 2px 0 0 rgba(255,100,100,0.1); }

.reset-btn {
  font-size: 0.65rem !important;
  padding: 5px 14px !important;
  white-space: nowrap;
}

.filter-status {
  padding: 0.7rem 1.4rem;
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
}

.result-count {
  display: flex; align-items: center; gap: 6px;
}
.count-num {
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700;
  color: var(--white);
}
.count-label {
  font-size: 0.72rem; color: var(--gray);
}

.active-tags {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.active-tag {
  font-family: var(--font-mono);
  font-size: 0.6rem; letter-spacing: 0.06em;
  padding: 3px 8px;
  border: 1px solid var(--border-bright);
  color: var(--white);
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(240,240,234,0.05);
}
.active-tag button {
  background: none; border: none; color: var(--gray);
  cursor: pointer; font-size: 0.85rem; line-height: 1;
  padding: 0; transition: color 0.15s;
}
.active-tag button:hover { color: var(--white); }

/* ── Body: list + sidebar ────────────────────────────────── */
.qbank-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 1.5rem;
  align-items: start;
}

/* ── Question list ───────────────────────────────────────── */
.question-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }

.question-skeleton {
  height: 80px;
  background: #0d0d0d;
  animation: shimmer 1.4s ease infinite;
}
@keyframes shimmer { 0%,100%{opacity:0.4} 50%{opacity:0.7} }

.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 4rem 2rem; text-align: center;
  background: #0d0d0d;
  border: 1px solid var(--border);
}
.empty-icon { color: var(--gray); margin-bottom: 4px; }
.empty-title {
  font-family: var(--font-mono); font-size: 0.85rem; color: var(--white);
}
.empty-sub { font-size: 0.78rem; color: var(--gray); }

/* ── Question card ───────────────────────────────────────── */
.question-card {
  background: #0d0d0d;
  border-left: 2px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  animation: cardIn 0.3s ease both;
}
@keyframes cardIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

.question-card:hover { background: #0f0f0f; border-left-color: var(--border-bright); }
.question-card.expanded { background: #111; border-left-color: var(--white); }
.question-card.solved { border-left-color: rgba(120,230,120,0.4); }

.qcard-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 1.4rem 0;
  cursor: pointer;
  gap: 1rem;
}

.qcard-meta {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}

.q-index {
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray);
}

.q-diff-badge {
  font-family: var(--font-mono);
  font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 2px 7px;
  border: 1px solid;
}
.q-diff-badge.easy   { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.25); }
.q-diff-badge.medium { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25); }
.q-diff-badge.hard   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }

.q-subject-tag, .q-chapter-tag, .q-year-tag {
  font-family: var(--font-mono);
  font-size: 0.58rem; letter-spacing: 0.08em;
  color: var(--gray);
  padding: 2px 7px;
  border: 1px solid var(--border);
}

.qcard-actions {
  display: flex; align-items: center; gap: 10px; flex-shrink: 0;
}

.solved-badge {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: rgba(120,230,120,0.8); border: 1px solid rgba(120,230,120,0.2);
  padding: 2px 7px;
}
.bookmark-active { color: var(--white); display: flex; align-items: center; }

.expand-toggle {
  background: none; border: none; cursor: pointer;
  color: var(--gray); display: flex; align-items: center;
  transition: color 0.2s; padding: 4px;
}
.expand-toggle:hover { color: var(--white); }

.qcard-body {
  padding: 10px 1.4rem 14px;
  cursor: pointer;
}
.q-text {
  font-size: 0.9rem; color: var(--white);
  line-height: 1.65; font-weight: 400;
}

/* ── Expanded section ────────────────────────────────────── */
.expand-enter-active, .expand-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-6px); }

.qcard-expanded {
  border-top: 1px solid var(--border);
  padding: 1.2rem 1.4rem;
  display: flex; flex-direction: column; gap: 1.2rem;
}

.options-list { display: flex; flex-direction: column; gap: 8px; }

.option-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 11px 16px;
  background: transparent;
  border: 1px solid var(--border);
  cursor: pointer; text-align: left;
  transition: background 0.15s, border-color 0.15s;
  width: 100%;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.option-btn:hover:not(:disabled) {
  background: rgba(240,240,234,0.04);
  border-color: var(--border-bright);
}
.option-btn:disabled { cursor: default; }

.option-btn.selected {
  border-color: var(--border-bright);
  background: rgba(240,240,234,0.06);
}
.option-btn.correct {
  border-color: rgba(120,230,120,0.5);
  background: rgba(120,230,120,0.07);
}
.option-btn.wrong {
  border-color: rgba(255,100,100,0.5);
  background: rgba(255,100,100,0.07);
}

.opt-letter {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  width: 20px; height: 20px;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; color: var(--gray);
}
.option-btn.selected .opt-letter { border-color: var(--white); color: var(--white); }
.option-btn.correct .opt-letter   { border-color: rgba(120,230,120,0.6); color: rgba(120,230,120,0.9); }
.option-btn.wrong .opt-letter     { border-color: rgba(255,100,100,0.6); color: rgba(255,100,100,0.9); }

.opt-text { flex: 1; font-size: 0.85rem; color: var(--white); }
.opt-check { font-size: 0.85rem; color: rgba(120,230,120,0.9); flex-shrink: 0; }
.opt-x     { font-size: 0.85rem; color: rgba(255,100,100,0.8); flex-shrink: 0; }

/* Card footer */
.qcard-footer {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
}
.footer-left { flex: 1; }
.footer-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.reveal-btn {
  font-size: 0.68rem !important;
  padding: 9px 18px !important;
}

.explanation-block {
  display: flex; flex-direction: column; gap: 6px;
}
.exp-label {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.18em;
  color: var(--gray);
}
.exp-text {
  font-size: 0.83rem; color: var(--dim); line-height: 1.7;
}

.action-icon-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--border);
  background: transparent; cursor: pointer;
  color: var(--gray);
  display: flex; align-items: center; justify-content: center;
  transition: color 0.2s, border-color 0.2s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.action-icon-btn:hover { color: var(--white); border-color: var(--border-bright); }
.action-icon-btn.active { color: var(--white); border-color: var(--border-bright); }

.next-btn {
  font-size: 0.65rem !important;
  padding: 8px 14px !important;
}

/* ── Pagination ──────────────────────────────────────────── */
.pagination {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 1.2rem;
  background: #0d0d0d;
  border-top: 1px solid var(--border);
}

.page-btn { font-size: 0.65rem !important; padding: 8px 14px !important; }

.page-numbers { display: flex; align-items: center; gap: 4px; }
.page-num {
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700;
  width: 32px; height: 32px;
  border: 1px solid var(--border);
  background: transparent; cursor: pointer; color: var(--gray);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.page-num:hover:not(:disabled) { color: var(--white); border-color: var(--border-bright); }
.page-num.active {
  background: var(--white); color: var(--black);
  border-color: var(--white);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.2);
}
.page-num.ellipsis { cursor: default; border-color: transparent; box-shadow: none; }

/* ── Right sidebar ───────────────────────────────────────── */
.qbank-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

.side-panel {
  border: 1px solid var(--border);
  background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.panel-header {
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag {
  font-family: var(--font-mono);
  font-size: 0.6rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gray);
}
.panel-count {
  font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
  color: var(--white);
}

.mini-btn { font-size: 0.6rem !important; padding: 4px 10px !important; }

/* Session stats */
.session-stats {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 1px; background: var(--border);
  margin: 0;
}
.sess-stat {
  display: flex; flex-direction: column; gap: 3px;
  padding: 0.9rem 1rem; background: #0a0a0a;
}
.sess-val {
  font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700;
  color: var(--white); letter-spacing: -0.5px;
}
.correct-val { color: rgba(120,230,120,0.9); }
.wrong-val   { color: rgba(255,100,100,0.8); }
.sess-label  { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }

.accuracy-bar-wrap { height: 2px; background: var(--border); }
.accuracy-bar-fill { height: 100%; background: rgba(240,240,234,0.4); transition: width 0.5s ease; }

/* Bookmarks */
.side-empty {
  padding: 1.2rem;
  font-size: 0.75rem; color: var(--gray);
  font-family: var(--font-mono); text-align: center;
}

.bookmark-list { display: flex; flex-direction: column; }
.bookmark-row {
  display: flex; align-items: center; gap: 8px;
  padding: 0.7rem 1.2rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.15s;
}
.bookmark-row:last-child { border-bottom: none; }
.bookmark-row:hover { background: rgba(240,240,234,0.03); }
.bm-hash {
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); flex-shrink: 0;
}
.bm-text {
  font-size: 0.72rem; color: var(--white);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.bm-more {
  padding: 0.5rem 1.2rem;
  font-size: 0.65rem; color: var(--gray);
  font-family: var(--font-mono);
}

/* Quick actions */
.qa-list { display: flex; flex-direction: column; }
.qa-item {
  display: flex; align-items: center; gap: 12px;
  padding: 0.9rem 1.2rem;
  border-bottom: 1px solid var(--border);
  background: transparent; cursor: pointer;
  text-align: left; width: 100%;
  transition: background 0.15s;
}
.qa-item:last-child { border-bottom: none; }
.qa-item:hover { background: rgba(240,240,234,0.03); }

.qa-icon {
  width: 32px; height: 32px;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray); flex-shrink: 0;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.qa-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.qa-title { font-size: 0.8rem; font-weight: 600; color: var(--white); }
.qa-sub   { font-size: 0.65rem; color: var(--gray); }
.qa-arrow { font-family: var(--font-mono); font-size: 0.75rem; color: var(--gray); flex-shrink: 0; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1100px) {
  .qbank-body { grid-template-columns: 1fr; }
  .qbank-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .qbank-header { flex-direction: column; align-items: flex-start; }
  .header-stats { width: 100%; }
  .hstat { flex: 1; }
  .filters-row { flex-direction: column; }
  .filter-group { border-right: none; border-bottom: 1px solid var(--border); }
  .filter-group:last-child { border-bottom: none; }
  .qbank-sidebar { grid-template-columns: 1fr; }
}
</style>
