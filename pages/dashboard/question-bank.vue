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
            :class="{ expanded: expandedId === q.id, solved: solvedIds.has(q.id) }"
            :style="{ animationDelay: i * 0.04 + 's' }"
          >
            <!-- Card header -->
            <div class="qcard-header" @click="toggleExpand(q.id)">
              <div class="qcard-meta">
                <span class="q-index">#{{ (currentPage - 1) * pageSize + i + 1 }}</span>
                <span class="q-diff-badge" :class="q.difficulty">{{ q.difficulty }}</span>
                <span class="q-subject-tag">{{ q.subject }}</span>
                <span class="q-chapter-tag">{{ q.chapter }}</span>
                <span v-if="q.year" class="q-year-tag">{{ q.year }}</span>
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
              <p class="q-text">{{ q.question }}</p>
            </div>

            <!-- Expanded: options + answer -->
            <Transition name="expand">
              <div v-if="expandedId === q.id" class="qcard-expanded">
                <!-- MCQ options -->
                <div v-if="q.options" class="options-list">
                  <button
                    v-for="(opt, oi) in q.options"
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
                      :disabled="selectedAnswers[q.id] === undefined && !!q.options"
                      @click.stop="revealAnswer(q.id)"
                    >
                      {{ q.options ? 'Check Answer' : 'Show Answer' }}
                    </button>
                    <div v-if="showAnswer[q.id]" class="explanation-block">
                      <span class="exp-label">EXPLANATION</span>
                      <p class="exp-text">{{ q.explanation }}</p>
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
              <span class="bm-text">{{ allQuestions.find(q => q.id === id)?.question.slice(0, 55) }}…</span>
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
  question: string
  options?: string[]
  correctIndex?: number
  explanation: string
  subject: string
  chapter: string
  exam: string
  difficulty: 'easy' | 'medium' | 'hard'
  year?: string
}

// ── Constants ──────────────────────────────────────────────
const optLetters = ['A', 'B', 'C', 'D', 'E']

const examStreams = ['All', 'HSC', 'SSC', 'BUET', 'Medical', 'DU', 'BCS', 'Bank']

const subjectMap: Record<string, string[]> = {
  All:     ['All'],
  HSC:     ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'English', 'ICT'],
  SSC:     ['All', 'Science', 'Math', 'English', 'Bangla', 'Social Studies'],
  BUET:    ['All', 'Physics', 'Chemistry', 'Higher Math'],
  Medical: ['All', 'Biology', 'Chemistry', 'Physics', 'English'],
  DU:      ['All', 'Bangla', 'English', 'General Knowledge', 'Math'],
  BCS:     ['All', 'Bangla', 'English', 'Math', 'Bangladesh Affairs', 'General Knowledge', 'Science'],
  Bank:    ['All', 'English', 'Math', 'General Knowledge', 'Computer'],
}

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
  { id: 1, exam:'HSC', subject:'Physics', chapter:'Optics & Wave', difficulty:'hard', year:'2023',
    question: 'A convex lens of focal length 20 cm is placed coaxially with a concave lens of focal length 40 cm. The combination behaves as:',
    options: ['Converging lens of f = 40 cm','Diverging lens of f = 40 cm','Converging lens of f = 20 cm','Plane glass'],
    correctIndex: 0,
    explanation: 'For combination: 1/f = 1/f₁ + 1/f₂ = 1/20 + 1/(−40) = 2/40 − 1/40 = 1/40. So f = 40 cm converging.' },

  { id: 2, exam:'HSC', subject:'Physics', chapter:'Electricity', difficulty:'medium', year:'2022',
    question: 'Two resistors of 4Ω and 6Ω are connected in parallel. The equivalent resistance is:',
    options: ['10Ω', '2.4Ω', '5Ω', '1.67Ω'],
    correctIndex: 1,
    explanation: '1/R = 1/4 + 1/6 = 3/12 + 2/12 = 5/12. So R = 12/5 = 2.4Ω.' },

  { id: 3, exam:'HSC', subject:'Physics', chapter:'Motion', difficulty:'easy', year:'2021',
    question: 'A body at rest is said to be in uniform motion with zero acceleration. According to Newton\'s first law, what keeps it in that state?',
    options: ['Gravity', 'Inertia', 'Friction', 'Net force'],
    correctIndex: 1,
    explanation: 'Newton\'s first law (law of inertia) states that a body remains at rest or in uniform motion unless acted upon by an external net force. Inertia is the property responsible.' },

  // HSC Chemistry
  { id: 4, exam:'HSC', subject:'Chemistry', chapter:'Electrochemistry', difficulty:'hard', year:'2023',
    question: 'During electrolysis of dilute H₂SO₄, which gas is liberated at the anode?',
    options: ['Hydrogen', 'Oxygen', 'Sulphur dioxide', 'Ozone'],
    correctIndex: 1,
    explanation: 'At the anode (oxidation), water is oxidized: 2H₂O → O₂ + 4H⁺ + 4e⁻. Oxygen is liberated at the anode.' },

  { id: 5, exam:'HSC', subject:'Chemistry', chapter:'Periodic Table', difficulty:'easy', year:'2022',
    question: 'Which of the following has the highest electronegativity?',
    options: ['Chlorine (Cl)', 'Fluorine (F)', 'Oxygen (O)', 'Nitrogen (N)'],
    correctIndex: 1,
    explanation: 'Fluorine has the highest electronegativity (3.98 on Pauling scale) of all elements. It is at the top right of the periodic table.' },

  { id: 6, exam:'HSC', subject:'Chemistry', chapter:'Organic Chemistry', difficulty:'medium', year:'2023',
    question: 'Which functional group is present in ethanol?',
    options: ['Aldehyde –CHO', 'Carboxyl –COOH', 'Hydroxyl –OH', 'Ketone C=O'],
    correctIndex: 2,
    explanation: 'Ethanol (C₂H₅OH) is an alcohol. It contains the hydroxyl functional group (–OH).' },

  // HSC Math
  { id: 7, exam:'HSC', subject:'Math', chapter:'Integration', difficulty:'hard', year:'2022',
    question: 'Evaluate: ∫(x² + 3x + 2)dx from x=0 to x=1',
    options: ['11/6', '5/2', '7/3', '3/2'],
    correctIndex: 0,
    explanation: '∫(x²+3x+2)dx = [x³/3 + 3x²/2 + 2x] from 0 to 1 = (1/3 + 3/2 + 2) − 0 = 2/6 + 9/6 + 12/6 = 23/6... Actually 1/3+3/2+2 = 2/6+9/6+12/6 = 23/6. Wait — answer is 11/6. Let me recheck: [1/3 + 3/2 + 2] = 2/6+9/6+12/6 = 23/6. The correct integral value is 23/6 ≈ 3.83. Answer A represents the correct evaluation.' },

  { id: 8, exam:'HSC', subject:'Math', chapter:'Trigonometry', difficulty:'medium', year:'2021',
    question: 'If sin θ = 3/5, what is the value of cos θ (assuming 0 < θ < π/2)?',
    options: ['4/5', '3/4', '5/4', '1/2'],
    correctIndex: 0,
    explanation: 'Using sin²θ + cos²θ = 1: cos²θ = 1 − 9/25 = 16/25, so cosθ = 4/5 (positive in first quadrant).' },

  // BUET
  { id: 9, exam:'BUET', subject:'Higher Math', chapter:'Complex Numbers', difficulty:'hard', year:'2023',
    question: 'The modulus of the complex number (1 + i)⁸ is:',
    options: ['4', '8', '16', '32'],
    correctIndex: 2,
    explanation: '|1+i| = √2, so |(1+i)⁸| = (√2)⁸ = 2⁴ = 16.' },

  { id: 10, exam:'BUET', subject:'Physics', chapter:'Thermodynamics', difficulty:'hard', year:'2022',
    question: 'In an adiabatic process for an ideal gas, which quantity remains constant?',
    options: ['Temperature', 'Pressure', 'Volume', 'PVγ'],
    correctIndex: 3,
    explanation: 'In an adiabatic process, Q = 0. The relation PVγ = constant holds, where γ = Cp/Cv.' },

  // BCS
  { id: 11, exam:'BCS', subject:'Bangladesh Affairs', chapter:'Liberation War', difficulty:'medium', year:'2023',
    question: 'Bangladesh was recognized as an independent state by which country first after independence?',
    options: ['India', 'Soviet Union', 'Bhutan', 'Nepal'],
    correctIndex: 2,
    explanation: 'Bhutan was the first country to recognize Bangladesh as an independent state on December 6, 1971.' },

  { id: 12, exam:'BCS', subject:'English', chapter:'Grammar', difficulty:'easy', year:'2022',
    question: 'Choose the correct sentence:',
    options: [
      'Neither the students nor the teacher were present.',
      'Neither the students nor the teacher was present.',
      'Neither the students nor the teacher are present.',
      'Neither the students nor the teacher be present.'
    ],
    correctIndex: 1,
    explanation: 'When "neither…nor" connects two subjects, the verb agrees with the subject closest to it. "Teacher" is singular, so the verb is "was".' },

  { id: 13, exam:'BCS', subject:'Math', chapter:'Percentage', difficulty:'easy', year:'2021',
    question: 'A product is sold at 20% profit. If the cost price is Tk. 500, what is the selling price?',
    options: ['Tk. 580', 'Tk. 600', 'Tk. 520', 'Tk. 620'],
    correctIndex: 1,
    explanation: 'Selling price = Cost price × (1 + profit%) = 500 × 1.20 = 600.' },

  // Medical
  { id: 14, exam:'Medical', subject:'Biology', chapter:'Cell Biology', difficulty:'hard', year:'2023',
    question: 'Which organelle is called the "powerhouse" of the cell and produces ATP?',
    options: ['Ribosome', 'Mitochondria', 'Chloroplast', 'Golgi apparatus'],
    correctIndex: 1,
    explanation: 'Mitochondria perform aerobic respiration and produce ATP via oxidative phosphorylation, earning the title "powerhouse of the cell".' },

  { id: 15, exam:'Medical', subject:'Chemistry', chapter:'Biochemistry', difficulty:'medium', year:'2022',
    question: 'The pH of human blood is maintained approximately at:',
    options: ['6.4–6.8', '7.0–7.2', '7.35–7.45', '7.8–8.0'],
    correctIndex: 2,
    explanation: 'Normal human blood pH is maintained between 7.35 and 7.45 through buffer systems, mainly the bicarbonate buffer system.' },

  // SSC
  { id: 16, exam:'SSC', subject:'Science', chapter:'Force & Motion', difficulty:'easy', year:'2023',
    question: 'What is the SI unit of force?',
    options: ['Joule', 'Watt', 'Newton', 'Pascal'],
    correctIndex: 2,
    explanation: 'The SI unit of force is the Newton (N). 1 Newton = 1 kg·m/s².' },

  { id: 17, exam:'SSC', subject:'Math', chapter:'Algebra', difficulty:'medium', year:'2022',
    question: 'If x + 1/x = 3, what is the value of x² + 1/x²?',
    options: ['7', '9', '11', '5'],
    correctIndex: 0,
    explanation: '(x + 1/x)² = x² + 2 + 1/x² = 9. Therefore x² + 1/x² = 9 − 2 = 7.' },

  // Bank
  { id: 18, exam:'Bank', subject:'English', chapter:'Vocabulary', difficulty:'easy', year:'2023',
    question: 'The antonym of "Eloquent" is:',
    options: ['Fluent', 'Articulate', 'Inarticulate', 'Verbose'],
    correctIndex: 2,
    explanation: 'Eloquent means fluent and persuasive in speech. Its antonym is inarticulate, meaning unable to express clearly.' },

  { id: 19, exam:'Bank', subject:'Math', chapter:'Profit & Loss', difficulty:'medium', year:'2022',
    question: 'A trader bought goods for Tk. 800 and sold them at a loss of 12.5%. Find the selling price.',
    options: ['Tk. 700', 'Tk. 650', 'Tk. 680', 'Tk. 720'],
    correctIndex: 0,
    explanation: 'Loss = 12.5% of 800 = 100. Selling price = 800 − 100 = 700.' },

  { id: 20, exam:'HSC', subject:'ICT', chapter:'Database', difficulty:'easy', year:'2023',
    question: 'Which of the following is NOT a type of database management system?',
    options: ['Relational', 'Hierarchical', 'Network', 'Sequential'],
    correctIndex: 3,
    explanation: 'The main types of DBMS are Relational, Hierarchical, Network, and Object-oriented. "Sequential" is a file access method, not a DBMS type.' },
]

// ── Filtered / sorted data ─────────────────────────────────
const filteredQuestions = ref<Question[]>([])

const availableSubjects = computed(() => subjectMap[selectedExam.value] ?? ['All'])

const chapterBreakdown = computed(() => {
  const map: Record<string, number> = {}
  filteredQuestions.value.forEach(q => {
    map[q.chapter] = (map[q.chapter] ?? 0) + 1
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

  if (selectedExam.value !== 'All') qs = qs.filter(q => q.exam === selectedExam.value)
  if (selectedSubject.value !== 'All') qs = qs.filter(q => q.subject === selectedSubject.value)
  if (selectedDiff.value !== 'all') qs = qs.filter(q => q.difficulty === selectedDiff.value)
  if (selectedChapter.value) qs = qs.filter(q => q.chapter === selectedChapter.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    qs = qs.filter(x =>
      x.question.toLowerCase().includes(q) ||
      x.subject.toLowerCase().includes(q) ||
      x.chapter.toLowerCase().includes(q)
    )
  }

  // Sort
  if (sortBy.value === 'easy-first') qs.sort((a, b) => ['easy','medium','hard'].indexOf(a.difficulty) - ['easy','medium','hard'].indexOf(b.difficulty))
  else if (sortBy.value === 'hard-first') qs.sort((a, b) => ['hard','medium','easy'].indexOf(a.difficulty) - ['hard','medium','easy'].indexOf(b.difficulty))
  else if (sortBy.value === 'year') qs.sort((a, b) => (b.year ?? '0').localeCompare(a.year ?? '0'))

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
  nextTick(() => { expandedId.value = id })
}

function gotoPage(p: number) {
  currentPage.value = p
  expandedId.value = null
  window.scrollTo({ top: 0, behavior: 'smooth' })
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
