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
            :class="{ expanded: expandedId === q.id, solved: solvedIds.has(q.id), wrong: wrongIds.has(q.id) }"
            :style="{ animationDelay: i * 0.04 + 's' }"
          >
            <!-- Card header -->
            <div class="qcard-header" @click="toggleExpand(q.id)">
              <div class="qcard-meta">
                <span class="q-index">#{{ (currentPage - 1) * pageSize + i + 1 }}</span>
                <span class="q-diff-badge" :class="q.difficulty_level">{{ q.difficulty[selectedLang] }}</span>
                <span class="q-subject-tag">{{ q.subject[selectedLang] }}</span>
                <span class="q-chapter-tag">{{ q.chapter[selectedLang] }}</span>
                <span v-if="q.years?.length" class="q-year-tag">
                  {{ q.years[0][selectedLang] }}
                </span>
              </div>
              <div class="qcard-actions">
                <span v-if="solvedIds.has(q.id) && !wrongIds.has(q.id)" class="solved-badge">✓ Solved</span>
                <span v-if="wrongIds.has(q.id)" class="wrong-badge">✗ Wrong</span>
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
                      correct: showAnswer[q.id] && oi === q.correct_index,
                      wrong: showAnswer[q.id] && selectedAnswers[q.id] === oi && oi !== q.correct_index,
                    }"
                    :disabled="showAnswer[q.id]"
                    @click.stop="selectAnswer(q.id, oi)"
                  >
                    <span class="opt-letter">{{ optLetters[oi] }}</span>
                    <span class="opt-text">{{ opt }}</span>
                    <span v-if="showAnswer[q.id] && oi === q.correct_index" class="opt-check">✓</span>
                    <span v-else-if="showAnswer[q.id] && selectedAnswers[q.id] === oi && oi !== q.correct_index" class="opt-x">✗</span>
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
        <!--<div class="side-panel">
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
        </div>-->

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
              v-for="(bq, i) in bookmarkedQuestions.slice(0, 5)"
              :key="bq.id"
              class="bookmark-row"
              @click="jumpToQuestion(bq.id)"
            >
              <span class="bm-hash">#{{ i + 1 }}</span>
              <span class="bm-text">{{ bq.question[selectedLang]?.slice(0, 55) }}…</span>
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
import { createClient } from '@supabase/supabase-js'

const supabase = useSupabaseClient()
const session = useSupabaseSession()

const config = useRuntimeConfig()

const { data: profile } = await supabase.from('profiles').select('primary_stream').single()
const bookmarkedQuestions = ref<{ id: number; question: any }[]>([])

//async function fetchBookmarks() {
//  if (!session.value) return
//  const { data } = await supabase
//    .from('bookmarks')
//    .select('question_id')
//    .eq('user_id', session.value.user.id)
//
//  bookmarkedIds.value = new Set((data ?? []).map(r => r.question_id))
//  bookmarkedQuestions.value = (data ?? []).map(r => r.questions).filter(Boolean)
//}

async function fetchBookmarks() {
  if (!session.value) return

  const { data: bms } = await supabase
    .from('bookmarks')
    .select('question_id')
    .eq('user_id', session.value.user.id)
    .order('created_at', { ascending: false })

  if (!bms?.length) {
    bookmarkedIds.value = new Set()
    bookmarkedQuestions.value = []
    return
  }

  const ids = bms.map(r => r.question_id)
  bookmarkedIds.value = new Set(ids)

  const supabaseStream = createClient(
        selectedExam.value.startsWith('HSC') ? config.public.supabaseCortexHSC_URL : config.public.supabaseCortexMedical_URL,
        selectedExam.value.startsWith('HSC') ? config.public.supabaseCortexHSC_KEY : config.public.supabaseCortexMedical_KEY
  )

  const { data: qs } = await supabaseStream
    .from('questions')        // ← replace with your actual table name if different
    .select('id, question')
    .in('id', ids)

  const qMap = Object.fromEntries((qs ?? []).map(q => [String(q.id), q]))
  bookmarkedQuestions.value = ids.map(id => qMap[String(id)]).filter(Boolean)
}

onMounted(fetchBookmarks)

// ── Types ──────────────────────────────────────────────────
interface Question {
  id: number
  question: string | { english: string; bangla: string }
  question_image?: string | null        // ADD
  stimulus?: { english: string; bangla: string } | null   // ADD
  stimulus_image?: string | null        // ADD
  stimulus_hash?: string | null   // ADD — links questions sharing same stimulus
  options?: string[] | { english: string[]; bangla: string[] }
  correct_index?: number  // unchanged — index is language-agnostic
  explanation: string | { english: string; bangla: string }
  subject: string | { english: string; bangla: string }
  chapter: string | { english: string; bangla: string }
  exam: string
  difficulty: string | { english: string; bangla: string }
  difficulty_level: 'easy' | 'medium' | 'hard'
  years?: { english: string; bangla: string }[]
  yearEN?: number
}

const { tm, isBn } = useI18n()
let selectedLang = computed(() => isBn.value ? 'bangla' : 'english')

// ── Constants ──────────────────────────────────────────────
const optLetters = ['A', 'B', 'C', 'D', 'E']

//const examStreams = ['All', 'HSC Science', 'HSC Arts', 'HSC Commerce', 'SSC', 'BUET', 'Medical', 'DU', 'BCS', 'Bank']
let stream_sets = []

if (profile?.primary_stream.startsWith('HSC')) {
  stream_sets = ['HSC Science', 'HSC Arts', 'HSC Commerce', 'BUET', 'Medical', 'DU']
} else if (profile?.primary_stream.startsWith('SSC')) {
  stream_sets = ['SSC Science', 'SSC Arts', 'SSC Commerce']
} else if (profile?.primary_stream.startsWith('Engineering')) {
  stream_sets = ['BUET', 'KUET', 'RUET', 'CUET']
} else if (profile?.primary_stream.startsWith('Varsity')) {
  stream_sets = ['DU', 'Jnu', 'Ru', 'Cu', 'JU', 'KU']
} else if (profile?.primary_stream.startsWith('Medical')) {
  stream_sets = ['Medical', 'Dental', 'AFMC']
} else if (profile?.primary_stream == 'Jobs') {
  stream_sets = ['BCS', 'Bank']
} else {
  stream_sets = ['HSC Science', 'HSC Arts', 'HSC Commerce', 'SSC Science', 'SSC Arts', 'SSC Commerce', 'BUET', 'Medical', 'DU', 'BCS', 'Bank']
}

const examStreams = stream_sets

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
let streamConfig = ''

if (profile?.primary_stream.startsWith('HSC')) {
  streamConfig = 'HSC Science'
} else if (profile?.primary_stream.startsWith('SSC')) {
  streamConfig = 'SSC Science'
} else if (profile?.primary_stream.startsWith('Engineering')) {
  streamConfig = 'BUET'
} else if (profile?.primary_stream.startsWith('Varsity')) {
  streamConfig = 'DU'
} else if (profile?.primary_stream.startsWith('Medical')) {
  streamConfig = 'Medical'
} else if (profile?.primary_stream == 'Jobs') {
  streamConfig = 'BCS'
} else {
  streamConfig = 'HSC Science'
}

const loading = ref(true)
const searchQuery = ref('')
const selectedExam = ref(streamConfig)
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
const wrongIds = ref<Set<number>>(new Set())
const sessionStats = ref({ attempted: 0, correct: 0, wrong: 0 })

// ── Demo question bank ─────────────────────────────────────
const allQuestions = ref<Question[]>([])

// ── Filtered / sorted data ─────────────────────────────────
const filteredQuestions = ref<Question[]>([])

const availableSubjects = computed(() => subjectMap.value[selectedExam.value] ?? ['All'])

//const chapterBreakdown = computed(() => {
//  const map: Record<string, number> = {}
//  filteredQuestions.value.forEach(q => {
//    map[q.chapter[selectedLang.value]] = (map[q.chapter[selectedLang.value]] ?? 0) + 1
//  })
//  return Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
//})

const chapterBreakdown = ref<{ name: string; count: number }[]>([])

watch([selectedExam, selectedSubject], async ([exam, subject]) => {
  if (subject === 'All') { chapterBreakdown.value = []; return }
  try {
    const data = await $fetch<string[]>('/api/chapters', {
      query: {
        stream: exam !== 'All' ? exam : undefined,
        subject,
      }
    })
    // If your /api/chapters returns counts, map them; otherwise no count
    //chapterBreakdown.value = (data ?? []).map(({ name, count }) => ({ name, count }))
    chapterBreakdown.value = data ?? []
  } catch (e) {
    chapterBreakdown.value = []
  }
}, { immediate: false })

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

async function fetchSessionStats() {
  if (!session.value) return

  const today = new Date().toISOString().slice(0, 10) // "2026-06-06"

  const { data } = await supabase
    .from('question_attempts')
    .select('is_correct')
    .eq('user_id', session.value.user.id)
    //.eq('source_type', 'qbank')
    //.gte('created_at', today)

  const attempted = data?.length ?? 0
  const correct = data?.filter(r => r.is_correct === true).length ?? 0
  const wrong = data?.filter(r => r.is_correct === false).length ?? 0

  sessionStats.value = { attempted, correct, wrong }
}

onMounted(() => {
  fetchBookmarks()
  fetchSessionStats()
  fetchSolvedIds()
})

// ── Filter logic ───────────────────────────────────────────
function applyFilters() {
  let qs = [...allQuestions.value]
  let selectedLang = computed(() => isBn.value ? 'bangla' : 'english')

  if (selectedExam.value !== 'All') qs = qs.filter(q => q.exam === selectedExam.value)
  if (selectedSubject.value !== 'All') qs = qs.filter(q => q.subject[selectedLang.value] === selectedSubject.value)
  if (selectedDiff.value !== 'all') qs = qs.filter(q => q.difficulty_level === selectedDiff.value)
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
  if (sortBy.value === 'easy-first') qs.sort((a, b) => ['easy','medium','hard'].indexOf(a.difficulty_level) - ['easy','medium','hard'].indexOf(b.difficulty_level))
  else if (sortBy.value === 'hard-first') qs.sort((a, b) => ['hard','medium','easy'].indexOf(a.difficulty_level) - ['hard','medium','easy'].indexOf(b.difficulty_level))
  else if (sortBy.value === 'year') qs.sort((a, b) => (b.years?.[0]?.english ?? '0').localeCompare(a.years?.[0]?.english ?? '0'))

  filteredQuestions.value = qs
  currentPage.value = 1
  expandedId.value = null
}

//function selectExam(exam: string) {
//  selectedExam.value = exam
//  selectedSubject.value = 'All'
//  selectedChapter.value = ''
//  applyFilters()
//}
//
//function selectSubject(sub: string) {
//  selectedSubject.value = sub
//  selectedChapter.value = ''
//  applyFilters()
//}

watch([selectedExam, selectedSubject], async ([exam, subject]) => {
  loading.value = true
  try {
    const data = await $fetch<Question[]>('/api/qBank', {
      query: {
        stream: exam !== 'All' ? exam : undefined,
        subject: subject !== 'All' ? subject : undefined,
        //limit: 100,
      }
    })
    allQuestions.value = data ?? []
  } catch (e) {
    console.error('Failed to reload questions:', e)
  } finally {
    loading.value = false
  }
  selectedChapter.value = ''
  applyFilters()
}, { immediate: false })

function selectExam(exam: string) {
  selectedExam.value = exam
  selectedSubject.value = 'All'
}
function selectSubject(sub: string) {
  selectedSubject.value = sub
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

//function revealAnswer(qId: number) {
//  const q = allQuestions.value.find(x => x.id === qId)
//  if (!q) return
//  showAnswer.value = { ...showAnswer.value, [qId]: true }
//  solvedIds.value.add(qId)
//  if (selectedAnswers.value[qId] !== q.correct_index) {
//    wrongIds.value.add(qId)
//  }
//
//  const chosen = selectedAnswers.value[qId]
//  if (chosen !== undefined) {
//    sessionStats.value.attempted++
//    if (chosen === q.correct_index) sessionStats.value.correct++
//    else sessionStats.value.wrong++
//  } else {
//    // Revealed without selecting (non-MCQ)
//    sessionStats.value.attempted++
//    sessionStats.value.correct++
//  }
//}

async function fetchSolvedIds() {
  if (!session.value) return
  const { data: correct_data } = await supabase
    .from('question_attempts')
    .select('question_id, is_correct, selected_index')
    .eq('user_id', session.value.user.id)
    //.eq('source_type', 'qbank')
    //.eq('is_correct', true)

    //solvedIds.value = new Set(correct_data.map(r => r.question_id))
    solvedIds.value = new Set(
      (correct_data ?? []).filter(r => r.is_correct === true).map(r => r.question_id)
    )
    wrongIds.value = new Set(
      (correct_data ?? []).filter(r => r.is_correct === false).map(r => r.question_id)
    )

    // Restore which option the user selected + reveal answers
    const answers: Record<number, number> = {}
    const revealed: Record<number, boolean> = {}
    ;(correct_data ?? []).forEach(r => {
      if (r.selected_index !== null) {
        answers[r.question_id] = r.selected_index
        revealed[r.question_id] = true      // so the answer panel opens
      }
    })
    selectedAnswers.value = answers
    showAnswer.value = revealed
}

async function revealAnswer(qId: number) {
  const q = allQuestions.value.find(x => x.id === qId)
  if (!q) return
  showAnswer.value = { ...showAnswer.value, [qId]: true }
  solvedIds.value.add(qId)

  const chosen = selectedAnswers.value[qId]
  const isCorrect = chosen !== undefined ? chosen === q.correctIndex : null

  if (chosen !== undefined) {
    sessionStats.value.attempted++
    if (isCorrect) sessionStats.value.correct++
    else {
      sessionStats.value.wrong++
      wrongIds.value.add(qId)
    }
  } else {
    sessionStats.value.attempted++
    sessionStats.value.correct++
  }

  // Persist to DB
  if (session.value) {
    await supabase.from('question_attempts').insert({
      user_id:        session.value.user.id,
      question_id:    qId,
      selected_index: chosen ?? null,
      is_correct:     isCorrect,
      correct_index:  q.correct_index,
      source_type:    'qbank',
    })
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

//function toggleBookmark(id: number) {
//  const s = new Set(bookmarkedIds.value)
//  s.has(id) ? s.delete(id) : s.add(id)
//  bookmarkedIds.value = s
//}

async function toggleBookmark(id: number) {
  if (!session.value) return
  const isBookmarked = bookmarkedIds.value.has(id)

  const s = new Set(bookmarkedIds.value)
  isBookmarked ? s.delete(id) : s.add(id)
  bookmarkedIds.value = s

  if (isBookmarked) {
    bookmarkedQuestions.value = bookmarkedQuestions.value.filter(q => q.id !== id)
    await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', session.value.user.id)
      .eq('question_id', id)
  } else {
    // Add the full question object so the sidebar can render it immediately
    const q = allQuestions.value.find(x => x.id === id)
    if (q) bookmarkedQuestions.value.unshift(q)
    await supabase
      .from('bookmarks')
      .insert({ user_id: session.value.user.id, question_id: id })
  }
}

//async function toggleBookmark(id: number) {
//  if (!session.value) return
//  const isBookmarked = bookmarkedIds.value.has(id)
//
//  // Optimistic update
//  const s = new Set(bookmarkedIds.value)
//  isBookmarked ? s.delete(id) : s.add(id)
//  bookmarkedIds.value = s
//
//  if (isBookmarked) {
//    await supabase
//      .from('bookmarks')
//      .delete()
//      .eq('user_id', session.value.user.id)
//      .eq('question_id', id)
//  } else {
//    await supabase
//      .from('bookmarks')
//      .insert({ user_id: session.value.user.id, question_id: id })
//  }
//}

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
  wrongIds.value = new Set()
}

function startMockWithFilters() { navigateTo('/dashboard/mock-exam') }
function startPracticeMode() { /* future */ }
function reviewWeakOnly() { selectedDiff.value = 'hard'; applyFilters() }

// ── Init ───────────────────────────────────────────────────
//onMounted(async () => {
//  // Simulate network fetch
//  await new Promise(r => setTimeout(r, 600))
//  allQuestions.value = demoQuestions
//  applyFilters()
//  loading.value = false
//
//  // Handle URL query param ?topic=
//  const route = useRoute()
//  if (route.query.topic) {
//    searchQuery.value = route.query.topic as string
//    applyFilters()
//  }
//})

onMounted(async () => {
  loading.value = true
  try {
    const data = await $fetch<Question[]>('/api/qBank', {
      query: {
        stream: selectedExam.value !== 'All' ? selectedExam.value : undefined,
        subject: selectedSubject.value !== 'All' ? selectedSubject.value : undefined,
        //limit: 100,  // initial page load — tune as needed
      }
    })
    allQuestions.value = data ?? []
  } catch (e) {
    console.error('Failed to load questions:', e)
  } finally {
    loading.value = false
  }
  applyFilters()

  const route = useRoute()
  if (route.query.topic) {
    searchQuery.value = route.query.topic as string
    applyFilters()
  }
})
</script>

<style scoped>
/* ── Page layout ─────────────────────────────────────────── */
.qbank { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; min-width: 0; overflow-x: hidden; }

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
  flex-wrap: wrap;
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
  min-width: 0; overflow-x: hidden;
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
  min-width: 0; overflow-x: hidden;
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
.question-card.wrong { border-left-color: rgba(230,120,120,0.4) !important; }

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
.wrong-badge {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: rgba(230,120,120,0.8); border: 1px solid rgba(230,120,120,0.2);
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
  .header-stats { width: 100%; box-sizing: border-box; }
  .hstat { flex: 1; min-width: 80px; box-sizing: border-box; }
  .filters-row { flex-direction: column; }
  .filter-group { border-right: none; border-bottom: 1px solid var(--border); width: 100%; box-sizing: border-box; }
  .filter-group:last-child { border-bottom: none; }
  .qbank-sidebar { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .qbank-header { padding: 1.2rem; }
  .page-title { font-size: 1.4rem; }
  .header-stats { flex-wrap: wrap; overflow-x: hidden; }
  .hstat { padding: 0.8rem 1rem; min-width: 70px; }
  .hstat-value { font-size: 1.1rem; }
  .filter-pills { flex-wrap: wrap; }
  .filter-pill { font-size: 0.6rem; padding: 4px 9px; }
  .qcard-header { flex-wrap: wrap; padding: 10px 1rem 0; gap: 6px; }
  .qcard-meta { flex-wrap: wrap; gap: 5px; }
  .qcard-body { padding: 8px 1rem 12px; }
  .qcard-expanded { padding: 1rem; }
  .option-btn { padding: 9px 12px; }
  .q-subject-tag, .q-chapter-tag { display: none; }
  .search-input { font-size: 0.82rem !important; }
  .filter-status { padding: 0.6rem 1rem; }
  .side-panel { overflow-x: hidden; }
  .qbank-sidebar { grid-template-columns: 1fr; }
  .pagination { gap: 5px; padding: 1rem; }
  .page-btn { font-size: 0.6rem !important; padding: 7px 10px !important; }
}
</style>
