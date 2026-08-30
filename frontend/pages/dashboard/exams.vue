<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

// ─── LOADING STATE ────────────────────────────────────────────────────────────
const catalogueLoading = ref(true)
const catalogueError   = ref(null)

// ─── STUDENT STREAM (from profiles.primary_stream) ───────────────────────────
const studentStream = ref('hsc')

async function loadStudentStream() {
  if (!user.value?.id) return
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('primary_stream')
      .eq('id', user.value.id)
      .single()
    if (error) throw error
    if (data?.primary_stream) studentStream.value = data.primary_stream
  } catch (e) {
    console.warn('Could not load student stream:', e.message)
  }
}

// ─── DB ROW → LOCAL SHAPE MAPPER ─────────────────────────────────────────────
// Normalises preset_exams columns to the shape every computed + template expects.
function mapExam(row) {
  return {
    id:            row.id,
    title:         row.title,
    description:   row.description || '',
    subject:       row.subject      || 'All Subjects',
    chapter:       row.chapter      || null,
    stream:        row.stream,
    group:         row.group_key,
    type:          row.stream,        // examTypeToRoute uses exam.type
    source:        row.source         || 'mixed',
    questionCount: row.question_count,
    duration:      row.duration_mins,
    difficulty:    row.difficulty     || 'medium',
    attendees:     row.attendees      || 0,
    rating:        parseFloat(row.rating) || 0,
    tags:          Array.isArray(row.tags) ? row.tags : [],
    isHot:         row.is_hot         || false,
    isFeatured:    row.is_featured    || false,
    negativeMarking: row.negative_marking ?? 0,
    isDynamic:     row.is_dynamic     ?? true,
  }
}

// ─── PRESET EXAM CATALOGUE (Supabase) ────────────────────────────────────────
const allExams = ref([])

async function loadCatalogue() {
  catalogueLoading.value = true
  catalogueError.value   = null
  try {
    const { data, error } = await supabase
      .from('preset_exams')
      .select('id,title,description,subject,chapter,stream,group_key,source,difficulty,question_count,duration_mins,negative_marking,attendees,rating,tags,is_hot,is_featured,is_dynamic,status')
      .eq('status', 'published')
      .order('attendees', { ascending: false })
    if (error) throw error
    allExams.value = (data || []).map(mapExam)
  } catch (e) {
    catalogueError.value = e.message || 'Failed to load exams'
  } finally {
    catalogueLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadStudentStream(), loadCatalogue()])
})


// ─── STREAM MAP: which exam page to launch ───────────────────────────────────
const examTypeToRoute = {
  hsc:          '/dashboard/hsc-ssc-exam',
  ssc:          '/dashboard/hsc-ssc-exam',
  engineering:  '/dashboard/engineering-exam',
  medical:      '/dashboard/admission-exam',
  varsity:      '/dashboard/admission-exam',
}

// ─── FILTER STATE ────────────────────────────────────────────────────────────
const filterStream   = ref('all')
const filterSubject  = ref('All')
const filterChapter  = ref('All')
const filterDiff     = ref('All')
const searchQuery    = ref('')
let searchDebounce   = null

// ─── STREAM OPTIONS ──────────────────────────────────────────────────────────
const streamOptions = [
  { id: 'all',         label: 'All Exams',   icon: '📋' },
  { id: 'hsc',         label: 'HSC',         icon: '🎓' },
  { id: 'ssc',         label: 'SSC',         icon: '📝' },
  { id: 'engineering', label: 'Engineering', icon: '⚙️' },
  { id: 'medical',     label: 'Medical',     icon: '🩺' },
  { id: 'varsity',     label: 'Varsity',     icon: '🏛️' },
]

// ─── DYNAMIC SUBJECTS (based on selected stream) ──────────────────────────────
const subjectsByStream = {
  all:         ['All', 'Physics', 'Chemistry', 'Biology', 'Math', 'Bangla', 'English', 'Accounting', 'History', 'ICT', 'General Knowledge'],
  hsc:         ['All', 'Physics', 'Chemistry', 'Biology', 'Math', 'Bangla', 'English', 'Accounting', 'History', 'ICT'],
  ssc:         ['All', 'Physics', 'Chemistry', 'Biology', 'Math', 'Bangla', 'English', 'History', 'Civics', 'ICT'],
  engineering: ['All', 'Physics', 'Chemistry', 'Math', 'English'],
  medical:     ['All', 'Biology', 'Chemistry', 'Physics', 'English'],
  varsity:     ['All', 'Bangla', 'English', 'General Knowledge', 'Math'],
}

const availableSubjects = computed(() => subjectsByStream[filterStream.value] || ['All'])

// ─── CHAPTER MAP (simplified — expands when subject is selected) ──────────────
const chaptersBySubject = {
  Physics:    ['All', 'Kinematics', 'Dynamics', 'Electricity', 'Optics', 'Waves', 'Thermodynamics', 'Modern Physics'],
  Chemistry:  ['All', 'Atomic Structure', 'Organic Chemistry', 'Acids & Bases', 'Periodic Table', 'Chemical Bonding', 'Thermochemistry'],
  Biology:    ['All', 'Cell Biology', 'Genetics', 'Human Physiology', 'Plant Biology', 'Ecology', 'Reproduction'],
  Math:       ['All', 'Algebra', 'Calculus', 'Trigonometry', 'Matrices', 'Vectors', 'Series', 'Combinatorics'],
  Bangla:     ['All', 'কাব্যসাহিত্য', 'উপন্যাস', 'ব্যাকরণ', 'বাংলা সাহিত্য'],
  English:    ['All', 'Grammar', 'Vocabulary', 'Literature', 'Business Writing'],
  Accounting: ['All', 'Double Entry', 'Trial Balance', 'Depreciation', 'Financial Statements'],
}

const availableChapters = computed(() =>
  filterSubject.value !== 'All' ? (chaptersBySubject[filterSubject.value] || ['All']) : []
)

// ─── COMPUTED: HOT EXAMS (top attended, filtered to student stream) ───────────
const hotExams = computed(() => {
  let pool = allExams.value.filter(e => e.isHot)
  // Prioritise student's own stream at top, but include all hot exams
  return pool.sort((a, b) => {
    const aMatch = a.stream === studentStream.value ? 1 : 0
    const bMatch = b.stream === studentStream.value ? 1 : 0
    if (bMatch !== aMatch) return bMatch - aMatch
    return b.attendees - a.attendees
  }).slice(0, 4)
})

// ─── COMPUTED: FILTERED EXAMS ─────────────────────────────────────────────────
const filteredExams = computed(() => {
  let pool = [...allExams.value]
  if (filterStream.value !== 'all') pool = pool.filter(e => e.stream === filterStream.value)
  if (filterSubject.value !== 'All') pool = pool.filter(e =>
    e.subject === filterSubject.value || e.subject === 'All Subjects' ||
    e.tags.some(t => t === filterSubject.value)
  )
  if (filterChapter.value !== 'All') pool = pool.filter(e =>
    e.chapter && e.chapter.includes(filterChapter.value)
  )
  if (filterDiff.value !== 'All') pool = pool.filter(e => e.difficulty === filterDiff.value.toLowerCase())
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    pool = pool.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  return pool.sort((a, b) => b.attendees - a.attendees)
})

const hasActiveFilters = computed(() =>
  filterStream.value !== 'all' ||
  filterSubject.value !== 'All' ||
  filterChapter.value !== 'All' ||
  filterDiff.value !== 'All' ||
  searchQuery.value.trim() !== ''
)

function clearAllFilters() {
  filterStream.value  = 'all'
  filterSubject.value = 'All'
  filterChapter.value = 'All'
  filterDiff.value    = 'All'
  searchQuery.value   = ''
}

function onSearch(e) {
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => { searchQuery.value = e.target.value }, 250)
}

function clearSearch() {
  searchQuery.value = ''
  document.getElementById('exam-search').value = ''
}

function setStream(id) {
  filterStream.value  = id
  filterSubject.value = 'All'
  filterChapter.value = 'All'
}

function setSubject(s) {
  filterSubject.value = s
  filterChapter.value = 'All'
}

// ─── CUSTOMIZE MODAL ─────────────────────────────────────────────────────────
// Lets the student tweak subject, question count, duration, negative marking,
// and (for admission exams) institution before launching.
const customizeOpen   = ref(false)
const customizeExam   = ref(null)
const customSubject   = ref('All')
const customCount     = ref(20)
const customDuration  = ref(20)
const customNegMark   = ref(0.25)
const customInstitution = ref('')

// Institutions available per exam type — used for the institution dropdown
const institutionsByType = {
  engineering: [
    { key: 'buet', label: 'BUET — Bangladesh University of Engineering & Technology' },
    { key: 'ruet', label: 'RUET — Rajshahi University of Engineering & Technology' },
    { key: 'kuet', label: 'KUET — Khulna University of Engineering & Technology' },
    { key: 'cuet', label: 'CUET — Chittagong University of Engineering & Technology' },
  ],
  medical: [
    { key: 'mbbs', label: 'MBBS — Medical Colleges (DGHS)' },
    { key: 'bds',  label: 'BDS — Dental Colleges' },
    { key: 'afmc', label: 'AFMC — Armed Forces Medical College' },
  ],
  varsity: [
    { key: 'du',   label: 'DU — University of Dhaka' },
    { key: 'cu',   label: 'CU — University of Chittagong' },
    { key: 'ju',   label: 'JU — Jahangirnagar University' },
    { key: 'ru',   label: 'RU — University of Rajshahi' },
    { key: 'ku',   label: 'KU — Khulna University' },
    { key: 'sust', label: 'SUST — Shahjalal Uni. of Sci. & Tech.' },
  ],
}

const availableInstitutions = computed(() => {
  if (!customizeExam.value) return []
  return institutionsByType[customizeExam.value.type] || []
})

// Subjects available for the customize panel — uses the exam's own tags
// (fallback to global subject list filtered by stream)
const customizeSubjectOptions = computed(() => {
  if (!customizeExam.value) return ['All']
  return ['All', ...customizeExam.value.tags]
})

const hasNegativeMarking = computed(() =>
  customizeExam.value && (customizeExam.value.type === 'medical' || customizeExam.value.type === 'varsity')
)

function openCustomize(exam) {
  customizeExam.value      = exam
  customSubject.value      = exam.subject === 'All Subjects' ? 'All' : exam.subject
  customCount.value        = exam.questionCount
  customDuration.value     = exam.duration
  customNegMark.value      = 0.25
  customInstitution.value  = exam.group
  customizeOpen.value      = true
}

function closeCustomize() {
  customizeOpen.value = false
  customizeExam.value = null
}

function confirmCustomizedLaunch() {
  if (!customizeExam.value) return
  launchExam(customizeExam.value, {
    subject:    customSubject.value,
    count:      customCount.value,
    duration:   customDuration.value,
    negMark:    customNegMark.value,
    group:      customInstitution.value,
  })
  closeCustomize()
}

// ─── LAUNCH EXAM ─────────────────────────────────────────────────────────────
// `overrides` (optional) comes from the Customize modal. If omitted, the
// exam's own preset defaults are used as-is (one-tap hot exam launch).
function launchExam(exam, overrides = null) {
  const route = examTypeToRoute[exam.type]
  if (!route) return

  const subject  = overrides?.subject  ?? (exam.subject === 'All Subjects' ? 'All' : exam.subject)
  const count    = overrides?.count    ?? exam.questionCount
  const duration = overrides?.duration ?? exam.duration
  const group    = overrides?.group    ?? exam.group

  const query = {
    examId:   exam.id,
    title:    exam.title,
    stream:   exam.stream,
    group,
    subject,
    chapter:  exam.chapter || 'All',
    count,
    duration,
    diff:     exam.difficulty,
    autostart: '1',
  }

  // Negative marking only applies to medical/varsity (admission-exam.vue)
  if (overrides?.negMark !== undefined && (exam.type === 'medical' || exam.type === 'varsity')) {
    query.negMark = overrides.negMark
  }

  navigateTo({ path: route, query })
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function sourceLabel(src) {
  if (src === 'ai')      return { text: 'AI',      cls: 'src-ai'      }
  if (src === 'teacher') return { text: 'Teacher', cls: 'src-teacher' }
  return                        { text: 'Mixed',   cls: 'src-mixed'   }
}

function diffLabel(d) {
  if (d === 'easy')   return { text: 'Easy',   cls: 'diff-easy'   }
  if (d === 'hard')   return { text: 'Hard',   cls: 'diff-hard'   }
  return                     { text: 'Medium', cls: 'diff-medium' }
}

function streamLabel(s) {
  return streamOptions.find(o => o.id === s)?.label || s
}

function fmtAttendees(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n.toString()
}
</script>

<template>
  <div class="exams-page">

    <!-- ══ PAGE HEADER ═══════════════════════════════════════════════════════ -->
    <div class="setup-header">
      <div class="header-left">
        <div class="page-chip"><span class="chip-dot" /> Exams</div>
        <h1 class="page-title">Find Your<br><span class="text-outline">Exam.</span></h1>
        <p class="page-sub">Preset exams crafted by teachers, AI, or both — auto-filtered for your stream.</p>
      </div>
      <div class="header-stats">
        <div class="hstat">
          <span class="hstat-val">{{ allExams.length }}</span>
          <span class="hstat-lbl">Total Exams</span>
        </div>
        <div class="hstat-div" />
        <div class="hstat">
          <span class="hstat-val">{{ allExams.filter(e => e.stream === studentStream).length }}</span>
          <span class="hstat-lbl">For Your Stream</span>
        </div>
        <div class="hstat-div" />
        <div class="hstat">
          <span class="hstat-val">{{ allExams.filter(e => e.isHot).length }}</span>
          <span class="hstat-lbl">Hot Now</span>
        </div>
      </div>
    </div>


    <!-- ══ LOADING STATE ══════════════════════════════════════════════════════ -->
    <div v-if="catalogueLoading" class="catalogue-loading">
      <div class="catalogue-spinner" />
      <span>Loading exams…</span>
    </div>

    <!-- ══ ERROR STATE ════════════════════════════════════════════════════════ -->
    <div v-else-if="catalogueError" class="catalogue-error">
      <span class="catalogue-error-icon">⚠</span>
      <p class="catalogue-error-msg">{{ catalogueError }}</p>
      <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem" @click="loadCatalogue">Retry</button>
    </div>

    <template v-else>
    <!-- ══ HOT EXAMS ════════════════════════════════════════════════════════ -->
    <section class="hot-section">
      <div class="section-head">
        <span class="section-label">🔥 Hot Right Now</span>
        <span class="section-sub">Most attended exams · Sorted for your stream</span>
      </div>
      <div class="hot-grid">
        <div
          v-for="exam in hotExams"
          :key="exam.id"
          class="hot-card"
          :class="{ 'hot-card--own-stream': exam.stream === studentStream }"
        >
          <div class="hot-card-top">
            <div class="hot-card-badges">
              <span class="stream-pill">{{ streamLabel(exam.stream) }}</span>
              <span class="hot-pill">🔥 {{ fmtAttendees(exam.attendees) }}</span>
              <span v-if="exam.stream === studentStream" class="your-stream-badge">Your Stream</span>
            </div>
            <div class="hot-card-rating">
              <span class="star">★</span>
              <span class="rating-val">{{ exam.rating }}</span>
            </div>
          </div>
          <h3 class="hot-card-title">{{ exam.title }}</h3>
          <p class="hot-card-desc">{{ exam.description }}</p>
          <div class="hot-card-meta">
            <span class="meta-pill">{{ exam.questionCount }}Q</span>
            <span class="meta-pill">{{ exam.duration }}min</span>
            <span class="meta-pill" :class="diffLabel(exam.difficulty).cls">{{ diffLabel(exam.difficulty).text }}</span>
            <span class="meta-pill" :class="sourceLabel(exam.source).cls">{{ sourceLabel(exam.source).text }}</span>
          </div>
          <div class="hot-card-cta">
            <button class="iso-btn iso-btn--ghost hot-custom-btn" @click="openCustomize(exam)">Customize</button>
            <button class="iso-btn iso-btn--fill hot-start-btn" @click="launchExam(exam)">Quick Start →</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ FILTER BAR (same pattern as mock-exam.vue) ════════════════════ -->
    <section class="filter-section">
      <div class="section-head">
        <span class="section-label">Browse All Exams</span>
        <span class="section-sub">Filter by stream, subject, chapter, or difficulty</span>
      </div>

      <!-- Search row -->
      <div class="filter-search-row">
        <div class="search-wrap">
          <svg class="search-icon" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <input
            id="exam-search"
            class="search-input"
            type="text"
            placeholder="Search exams, subjects, topics…"
            @input="onSearch"
          />
          <button v-if="searchQuery" class="search-clear" @click="clearSearch">✕</button>
        </div>
        <button v-if="hasActiveFilters" class="iso-btn iso-btn--ghost clear-all-btn" @click="clearAllFilters">
          Clear Filters ✕
        </button>
      </div>

      <!-- Stream pills -->
      <div class="filter-group">
        <span class="filter-group-label">Stream</span>
        <div class="filter-pills">
          <button
            v-for="s in streamOptions"
            :key="s.id"
            class="filter-pill"
            :class="{ active: filterStream === s.id }"
            @click="setStream(s.id)"
          >{{ s.icon }} {{ s.label }}</button>
        </div>
      </div>

      <!-- Subject pills -->
      <div class="filter-group">
        <span class="filter-group-label">Subject</span>
        <div class="filter-pills">
          <button
            v-for="sub in availableSubjects"
            :key="sub"
            class="filter-pill"
            :class="{ active: filterSubject === sub }"
            @click="setSubject(sub)"
          >{{ sub }}</button>
        </div>
      </div>

      <!-- Chapter pills — only when a subject is selected -->
      <div v-if="availableChapters.length" class="filter-group">
        <span class="filter-group-label">Chapter</span>
        <div class="filter-pills">
          <button
            v-for="ch in availableChapters"
            :key="ch"
            class="filter-pill"
            :class="{ active: filterChapter === ch }"
            @click="filterChapter = ch"
          >{{ ch }}</button>
        </div>
      </div>

      <!-- Difficulty pills -->
      <div class="filter-group">
        <span class="filter-group-label">Difficulty</span>
        <div class="filter-pills">
          <button
            v-for="d in ['All', 'Easy', 'Medium', 'Hard']"
            :key="d"
            class="filter-pill"
            :class="{ active: filterDiff === d, 'diff-easy': d === 'Easy', 'diff-medium': d === 'Medium', 'diff-hard': d === 'Hard' }"
            @click="filterDiff = d"
          >{{ d }}</button>
        </div>
      </div>

      <!-- Active filter status -->
      <div v-if="hasActiveFilters" class="filter-status">
        <span class="filter-count">{{ filteredExams.length }} exam{{ filteredExams.length !== 1 ? 's' : '' }} found</span>
        <div class="active-tags">
          <span v-if="filterStream !== 'all'" class="active-tag">{{ streamLabel(filterStream) }} <button @click="filterStream = 'all'; filterSubject = 'All'; filterChapter = 'All'">✕</button></span>
          <span v-if="filterSubject !== 'All'" class="active-tag">{{ filterSubject }} <button @click="filterSubject = 'All'; filterChapter = 'All'">✕</button></span>
          <span v-if="filterChapter !== 'All'" class="active-tag">{{ filterChapter }} <button @click="filterChapter = 'All'">✕</button></span>
          <span v-if="filterDiff !== 'All'" class="active-tag">{{ filterDiff }} <button @click="filterDiff = 'All'">✕</button></span>
          <span v-if="searchQuery" class="active-tag">"{{ searchQuery }}" <button @click="clearSearch">✕</button></span>
        </div>
      </div>
    </section>

    <!-- ══ EXAM GRID ════════════════════════════════════════════════════════ -->
    <section class="exams-grid-section">
      <div v-if="filteredExams.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <p class="empty-title">No exams match your filters</p>
        <p class="empty-sub">Try adjusting the stream, subject, or difficulty.</p>
        <button class="iso-btn iso-btn--ghost" @click="clearAllFilters">Clear All Filters</button>
      </div>

      <div v-else class="exams-grid">
        <div
          v-for="exam in filteredExams"
          :key="exam.id"
          class="exam-card"
          :class="{ 'exam-card--hot': exam.isHot }"
          @click="openCustomize(exam)"
        >
          <!-- Card header -->
          <div class="ec-header">
            <div class="ec-badges">
              <span class="ec-stream">{{ streamLabel(exam.stream) }}</span>
              <span v-if="exam.isHot" class="ec-hot">🔥 Hot</span>
              <span v-if="exam.stream === studentStream" class="ec-yours">Yours</span>
            </div>
            <div class="ec-rating">★ {{ exam.rating }}</div>
          </div>

          <!-- Title + desc -->
          <h3 class="ec-title">{{ exam.title }}</h3>
          <p class="ec-desc">{{ exam.description }}</p>

          <!-- Tags -->
          <div class="ec-tags">
            <span v-for="tag in exam.tags.slice(0, 3)" :key="tag" class="ec-tag">{{ tag }}</span>
            <span v-if="exam.tags.length > 3" class="ec-tag ec-tag--more">+{{ exam.tags.length - 3 }}</span>
          </div>

          <!-- Meta row -->
          <div class="ec-meta">
            <span class="ec-meta-item">
              <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v5H7V4zm0 6h2v2H7v-2z"/></svg>
              {{ exam.questionCount }} questions
            </span>
            <span class="ec-meta-item">
              <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M8 1a7 7 0 100 14A7 7 0 008 1zm1 7.5V4H7v5.5l3.5 2.1 1-1.7L9 8.5z"/></svg>
              {{ exam.duration }} min
            </span>
            <span class="ec-meta-item">
              <svg viewBox="0 0 16 16" width="11" height="11" fill="currentColor"><path d="M8 1l1.8 3.6L14 5.3l-3 2.9.7 4.1L8 10.4 4.3 12.3l.7-4.1-3-2.9 4.2-.7z"/></svg>
              {{ fmtAttendees(exam.attendees) }} attended
            </span>
          </div>

          <!-- Footer -->
          <div class="ec-footer">
            <div class="ec-footer-pills">
              <span class="ec-diff" :class="diffLabel(exam.difficulty).cls">{{ diffLabel(exam.difficulty).text }}</span>
              <span class="ec-source" :class="sourceLabel(exam.source).cls">{{ sourceLabel(exam.source).text }}</span>
            </div>
            <div class="ec-btn-group">
              <button class="iso-btn iso-btn--ghost ec-btn" @click.stop="openCustomize(exam)">⚙</button>
              <button class="iso-btn iso-btn--fill ec-btn" @click.stop="launchExam(exam)">Start →</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ══ CUSTOMIZE MODAL ══════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="customizeOpen" class="cz-backdrop" @click.self="closeCustomize">
        <div class="cz-modal">

          <!-- Modal header -->
          <div class="cz-header">
            <div class="cz-header-left">
              <span class="cz-eyebrow">Customize Exam</span>
              <h2 class="cz-title">{{ customizeExam?.title }}</h2>
              <div class="cz-meta-pills">
                <span class="stream-pill">{{ streamLabel(customizeExam?.stream) }}</span>
                <span class="meta-pill" :class="sourceLabel(customizeExam?.source).cls">{{ sourceLabel(customizeExam?.source).text }}</span>
                <span class="meta-pill" :class="diffLabel(customizeExam?.difficulty).cls">{{ diffLabel(customizeExam?.difficulty).text }}</span>
              </div>
            </div>
            <button class="cz-close" @click="closeCustomize">✕</button>
          </div>

          <div class="cz-body">

            <!-- Institution (engineering / medical / varsity only) -->
            <div v-if="availableInstitutions.length" class="cz-field">
              <label class="cz-label">Institution</label>
              <div class="cz-pills">
                <button
                  v-for="inst in availableInstitutions"
                  :key="inst.key"
                  class="cz-pill"
                  :class="{ active: customInstitution === inst.key }"
                  @click="customInstitution = inst.key"
                >{{ inst.label }}</button>
              </div>
            </div>

            <!-- Subject filter -->
            <div class="cz-field">
              <label class="cz-label">Subject <span class="cz-hint">— filter to one or keep All</span></label>
              <div class="cz-pills">
                <button
                  v-for="subj in customizeSubjectOptions"
                  :key="subj"
                  class="cz-pill"
                  :class="{ active: customSubject === subj }"
                  @click="customSubject = subj"
                >{{ subj }}</button>
              </div>
            </div>

            <!-- Question count -->
            <div class="cz-field">
              <label class="cz-label">
                Question Count
                <span class="cz-val">{{ customCount }}</span>
              </label>
              <div class="cz-pills">
                <button
                  v-for="n in [10, 15, 20, 25, 30, 40, 50, 60, 80, 100]"
                  :key="n"
                  class="cz-pill cz-pill--sm"
                  :class="{ active: customCount === n }"
                  @click="customCount = n"
                >{{ n }}</button>
              </div>
              <input
                type="range"
                class="cz-slider"
                :min="5" :max="100" :step="5"
                v-model.number="customCount"
              />
            </div>

            <!-- Duration -->
            <div class="cz-field">
              <label class="cz-label">
                Duration
                <span class="cz-val">{{ customDuration }} min</span>
              </label>
              <div class="cz-pills">
                <button
                  v-for="d in [10, 15, 20, 25, 30, 45, 60, 90]"
                  :key="d"
                  class="cz-pill cz-pill--sm"
                  :class="{ active: customDuration === d }"
                  @click="customDuration = d"
                >{{ d }}m</button>
              </div>
              <input
                type="range"
                class="cz-slider"
                :min="5" :max="120" :step="5"
                v-model.number="customDuration"
              />
            </div>

            <!-- Negative marking (medical / varsity only) -->
            <div v-if="hasNegativeMarking" class="cz-field">
              <label class="cz-label">Negative Marking <span class="cz-hint">— per wrong answer</span></label>
              <div class="cz-pills">
                <button
                  v-for="nm in [{ label: 'None (0)', val: 0 }, { label: '−0.25', val: 0.25 }, { label: '−0.50', val: 0.5 }]"
                  :key="nm.val"
                  class="cz-pill"
                  :class="{ active: customNegMark === nm.val, 'cz-pill--red': nm.val > 0 && customNegMark === nm.val }"
                  @click="customNegMark = nm.val"
                >{{ nm.label }}</button>
              </div>
            </div>

            <!-- Summary bar -->
            <div class="cz-summary">
              <div class="cz-summary-item">
                <span class="cz-summary-lbl">Questions</span>
                <span class="cz-summary-val">{{ customCount }}</span>
              </div>
              <div class="cz-summary-div" />
              <div class="cz-summary-item">
                <span class="cz-summary-lbl">Duration</span>
                <span class="cz-summary-val">{{ customDuration }}m</span>
              </div>
              <div class="cz-summary-div" />
              <div class="cz-summary-item">
                <span class="cz-summary-lbl">Subject</span>
                <span class="cz-summary-val">{{ customSubject }}</span>
              </div>
              <div v-if="hasNegativeMarking" class="cz-summary-div" />
              <div v-if="hasNegativeMarking" class="cz-summary-item">
                <span class="cz-summary-lbl">Neg. Marking</span>
                <span class="cz-summary-val" :class="{ 'val-warn': customNegMark > 0 }">
                  {{ customNegMark === 0 ? 'Off' : `−${customNegMark}` }}
                </span>
              </div>
            </div>
          </div>

          <!-- Modal footer -->
          <div class="cz-footer">
            <button class="iso-btn iso-btn--ghost" @click="closeCustomize">Cancel</button>
            <button class="iso-btn iso-btn--fill" @click="confirmCustomizedLaunch">
              Start Customized Exam →
            </button>
          </div>

        </div>
      </div>
    </Teleport>

    </template>

  </div>
</template>

<style scoped>
/* ─── PAGE LAYOUT ─────────────────────────────────────────────────────────── */
.exams-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 36px 28px 80px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* ─── PAGE HEADER ─────────────────────────────────────────────────────────── */
.setup-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 2rem; padding: 2rem;
  border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.setup-header::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.header-left { display: flex; flex-direction: column; gap: 10px; }
.page-chip {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  border: 1px solid var(--border); padding: 5px 10px;
  color: var(--gray); width: fit-content;
}
.chip-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--white); animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.3 } }
.page-title {
  font-family: var(--font-mono); font-size: 2rem;
  font-weight: 700; color: var(--white); line-height: 1.1;
  letter-spacing: -0.02em; margin: 0;
}
.text-outline {
  -webkit-text-stroke: 1px var(--white); color: transparent;
}
.page-sub {
  font-family: var(--font-sans); font-size: 0.85rem;
  color: var(--gray); max-width: 400px; margin: 0; line-height: 1.5;
}

/* Header stats */
.header-stats {
  display: flex; align-items: center; gap: 0;
  border: 1px solid var(--border); padding: 0;
  background: rgba(240,240,234,0.02);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.hstat {
  display: flex; flex-direction: column; align-items: center;
  padding: 16px 24px; gap: 4px;
}
.hstat-val {
  font-family: var(--font-mono); font-size: 1.5rem;
  font-weight: 700; color: var(--white);
}
.hstat-lbl {
  font-family: var(--font-mono); font-size: 0.5rem;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--gray);
}
.hstat-div { width: 1px; background: var(--border); align-self: stretch; }

/* ─── SECTION HEAD ────────────────────────────────────────────────────────── */
.section-head {
  display: flex; align-items: baseline; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;
}
.section-label {
  font-family: var(--font-mono); font-size: 0.65rem;
  text-transform: uppercase; letter-spacing: 0.16em;
  color: var(--white);
}
.section-sub {
  font-family: var(--font-sans); font-size: 0.75rem; color: var(--gray);
}

/* ─── HOT GRID ────────────────────────────────────────────────────────────── */
.hot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04);
}
.hot-card {
  background: var(--black);
  padding: 20px;
  display: flex; flex-direction: column; gap: 10px;
  cursor: pointer; transition: background 0.15s;
  border-left: 2px solid transparent;
}
.hot-card:hover {
  background: rgba(240,240,234,0.03);
  border-left-color: var(--border-bright);
}
.hot-card--own-stream {
  border-left: 2px solid rgba(240,240,234,0.25) !important;
}
.hot-card-top {
  display: flex; justify-content: space-between; align-items: center;
}
.hot-card-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.stream-pill {
  font-family: var(--font-mono); font-size: 0.5rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  border: 1px solid var(--border); padding: 2px 7px; color: var(--gray);
}
.hot-pill {
  font-family: var(--font-mono); font-size: 0.5rem;
  padding: 2px 7px; color: var(--white);
  background: rgba(255,200,80,0.08); border: 1px solid rgba(255,200,80,0.2);
}
.your-stream-badge {
  font-family: var(--font-mono); font-size: 0.48rem;
  padding: 2px 7px; color: var(--white);
  background: rgba(240,240,234,0.08); border: 1px solid rgba(240,240,234,0.2);
  letter-spacing: 0.1em; text-transform: uppercase;
}
.hot-card-rating {
  display: flex; align-items: center; gap: 3px;
  font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,200,80,0.9);
}
.star { font-size: 0.65rem; }
.rating-val { color: var(--white); }
.hot-card-title {
  font-family: var(--font-mono); font-size: 0.82rem;
  font-weight: 600; color: var(--white); margin: 0;
  line-height: 1.3;
}
.hot-card-desc {
  font-family: var(--font-sans); font-size: 0.75rem;
  color: var(--dim); margin: 0; line-height: 1.5; flex: 1;
}
.hot-card-meta {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.meta-pill {
  font-family: var(--font-mono); font-size: 0.5rem;
  letter-spacing: 0.1em; padding: 3px 8px;
  border: 1px solid var(--border); color: var(--gray);
}
.hot-card-cta {
  display: flex; justify-content: flex-end; margin-top: 4px;
}
.hot-start-btn {
  font-size: 0.62rem; padding: 8px 16px;
}

/* ─── FILTER SECTION ──────────────────────────────────────────────────────── */
.filter-section {
  border: 1px solid var(--border);
  padding: 24px;
  background: rgba(240,240,234,0.01);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
  display: flex; flex-direction: column; gap: 16px;
}

/* Search */
.filter-search-row {
  display: flex; gap: 10px; align-items: center;
}
.search-wrap {
  position: relative; flex: 1;
}
.search-icon {
  position: absolute; left: 12px; top: 50%; transform: translateY(-50%);
  width: 13px; height: 13px; color: var(--gray); pointer-events: none;
}
.search-input {
  width: 100%; padding: 10px 36px 10px 34px;
  background: rgba(240,240,234,0.03); border: 1px solid var(--border);
  color: var(--white); font-family: var(--font-sans); font-size: 0.8rem;
  outline: none; transition: border-color 0.15s;
  box-sizing: border-box;
}
.search-input:focus { border-color: var(--border-bright); }
.search-input::placeholder { color: var(--dim); }
.search-clear {
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--gray); cursor: pointer;
  font-size: 0.7rem; padding: 4px;
}
.clear-all-btn { font-size: 0.58rem; padding: 9px 14px; white-space: nowrap; }

/* Filter groups */
.filter-group {
  display: flex; flex-direction: column; gap: 8px;
}
.filter-group-label {
  font-family: var(--font-mono); font-size: 0.52rem;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray);
}
.filter-pills {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.filter-pill {
  font-family: var(--font-mono); font-size: 0.56rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 6px 12px; border: 1px solid var(--border);
  background: transparent; color: var(--gray);
  cursor: pointer; transition: all 0.15s;
}
.filter-pill:hover { border-color: var(--border-bright); color: var(--white); }
.filter-pill.active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.07); }
.filter-pill.diff-easy.active { background: rgba(120,230,120,0.08); border-color: rgba(120,230,120,0.4); color: rgba(120,230,120,0.9); }
.filter-pill.diff-medium.active { background: rgba(255,200,80,0.08); border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.9); }
.filter-pill.diff-hard.active { background: rgba(255,100,100,0.08); border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }

/* Active filter status */
.filter-status {
  display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  padding-top: 8px; border-top: 1px solid var(--border);
}
.filter-count {
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.12em; color: var(--gray); text-transform: uppercase;
}
.active-tags { display: flex; gap: 6px; flex-wrap: wrap; }
.active-tag {
  display: inline-flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.1em;
  padding: 3px 8px; border: 1px solid var(--border-bright);
  color: var(--white); text-transform: uppercase;
}
.active-tag button {
  background: none; border: none; color: var(--gray); cursor: pointer;
  padding: 0; font-size: 0.55rem; line-height: 1;
}
.active-tag button:hover { color: var(--white); }

/* ─── EXAMS GRID ──────────────────────────────────────────────────────────── */
.exams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04);
}
.exam-card {
  background: var(--black);
  padding: 20px;
  display: flex; flex-direction: column; gap: 10px;
  cursor: pointer; transition: background 0.15s;
  border-left: 2px solid transparent;
}
.exam-card:hover {
  background: rgba(240,240,234,0.03);
  border-left-color: var(--border-bright);
}
.exam-card--hot .ec-header { /* slight highlight */
}

/* Card header */
.ec-header {
  display: flex; justify-content: space-between; align-items: center;
}
.ec-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.ec-stream {
  font-family: var(--font-mono); font-size: 0.48rem; letter-spacing: 0.12em;
  text-transform: uppercase; border: 1px solid var(--border); padding: 2px 6px; color: var(--gray);
}
.ec-hot {
  font-family: var(--font-mono); font-size: 0.46rem; padding: 2px 6px;
  background: rgba(255,200,80,0.07); border: 1px solid rgba(255,200,80,0.18);
  color: rgba(255,200,80,0.85);
}
.ec-yours {
  font-family: var(--font-mono); font-size: 0.46rem; padding: 2px 6px;
  background: rgba(240,240,234,0.06); border: 1px solid rgba(240,240,234,0.18);
  color: rgba(240,240,234,0.8); letter-spacing: 0.08em;
}
.ec-rating {
  font-family: var(--font-mono); font-size: 0.56rem;
  color: rgba(255,200,80,0.8);
}
.ec-title {
  font-family: var(--font-mono); font-size: 0.78rem;
  font-weight: 600; color: var(--white); margin: 0; line-height: 1.3;
}
.ec-desc {
  font-family: var(--font-sans); font-size: 0.73rem;
  color: var(--dim); margin: 0; line-height: 1.5; flex: 1;
}
.ec-tags {
  display: flex; gap: 5px; flex-wrap: wrap;
}
.ec-tag {
  font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.08em;
  padding: 2px 6px; background: rgba(240,240,234,0.04);
  border: 1px solid var(--border); color: var(--dim);
}
.ec-tag--more { color: var(--gray); }

/* Card meta */
.ec-meta {
  display: flex; gap: 10px; flex-wrap: wrap;
}
.ec-meta-item {
  display: flex; align-items: center; gap: 4px;
  font-family: var(--font-mono); font-size: 0.5rem;
  letter-spacing: 0.08em; color: var(--gray);
}

/* Card footer */
.ec-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 10px; border-top: 1px solid var(--border); margin-top: 2px;
}
.ec-footer-pills { display: flex; gap: 6px; }
.ec-diff, .ec-source {
  font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 3px 8px; border: 1px solid var(--border);
  color: var(--gray);
}
.ec-diff.diff-easy   { background: rgba(120,230,120,0.07); border-color: rgba(120,230,120,0.25); color: rgba(120,230,120,0.8); }
.ec-diff.diff-medium { background: rgba(255,200,80,0.07);  border-color: rgba(255,200,80,0.25);  color: rgba(255,200,80,0.8); }
.ec-diff.diff-hard   { background: rgba(255,100,100,0.07); border-color: rgba(255,100,100,0.25); color: rgba(255,100,100,0.8); }
.ec-source.src-ai      { color: rgba(140,180,255,0.8); border-color: rgba(140,180,255,0.2); background: rgba(140,180,255,0.06); }
.ec-source.src-teacher { color: rgba(200,160,255,0.8); border-color: rgba(200,160,255,0.2); background: rgba(200,160,255,0.06); }
.ec-source.src-mixed   { color: var(--gray); }
.ec-btn { font-size: 0.56rem; padding: 7px 14px; }

/* ─── EMPTY STATE ─────────────────────────────────────────────────────────── */
.empty-state {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 60px 20px; text-align: center;
}
.empty-icon { font-size: 2.5rem; }
.empty-title {
  font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); margin: 0;
}
.empty-sub {
  font-family: var(--font-sans); font-size: 0.78rem; color: var(--gray); margin: 0;
}

/* ─── DIFF / SOURCE CLASSES reused in meta pills ─────────────────────────── */
.meta-pill.diff-easy   { background: rgba(120,230,120,0.07); border-color: rgba(120,230,120,0.25); color: rgba(120,230,120,0.8); }
.meta-pill.diff-medium { background: rgba(255,200,80,0.07);  border-color: rgba(255,200,80,0.25);  color: rgba(255,200,80,0.8); }
.meta-pill.diff-hard   { background: rgba(255,100,100,0.07); border-color: rgba(255,100,100,0.25); color: rgba(255,100,100,0.8); }
.meta-pill.src-ai      { color: rgba(140,180,255,0.8); border-color: rgba(140,180,255,0.2); background: rgba(140,180,255,0.06); }
.meta-pill.src-teacher { color: rgba(200,160,255,0.8); border-color: rgba(200,160,255,0.2); background: rgba(200,160,255,0.06); }

/* ─── CATALOGUE LOADING / ERROR ──────────────────────────────────────────── */
.catalogue-loading {
  display: flex; align-items: center; justify-content: center;
  gap: 12px; padding: 80px 20px;
  font-family: var(--font-mono); font-size: 0.65rem;
  letter-spacing: 0.1em; color: var(--gray);
}
.catalogue-spinner {
  width: 18px; height: 18px; border: 2px solid var(--border);
  border-top-color: var(--white); border-radius: 50%;
  animation: catalogue-spin 0.8s linear infinite; flex-shrink: 0;
}
@keyframes catalogue-spin { to { transform: rotate(360deg); } }

.catalogue-error {
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; padding: 80px 20px; text-align: center;
}
.catalogue-error-icon { font-size: 2rem; color: rgba(255,200,80,0.7); }
.catalogue-error-msg {
  font-family: var(--font-sans); font-size: 0.78rem;
  color: var(--gray); margin: 0;
}

/* ─── HOT CARD CTA ROW (two buttons) ──────────────────────────────────────── */
.hot-card-cta { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }
.hot-custom-btn { font-size: 0.58rem; padding: 7px 12px; }
.hot-start-btn  { font-size: 0.62rem; padding: 8px 16px; }

/* ─── EXAM GRID CARD BTN GROUP ────────────────────────────────────────────── */
.ec-btn-group { display: flex; gap: 6px; }
.ec-btn { font-size: 0.56rem; padding: 7px 12px; }

/* ─── CUSTOMIZE MODAL ─────────────────────────────────────────────────────── */
.cz-backdrop {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(8,8,8,0.85);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.cz-modal {
  background: var(--black);
  border: 1px solid var(--border-bright);
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.06);
  width: 100%; max-width: 600px;
  max-height: 90vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* Modal header */
.cz-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.cz-header-left { display: flex; flex-direction: column; gap: 8px; }
.cz-eyebrow {
  font-family: var(--font-mono); font-size: 0.5rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}
.cz-title {
  font-family: var(--font-mono); font-size: 0.9rem;
  font-weight: 600; color: var(--white); margin: 0; line-height: 1.3;
}
.cz-meta-pills { display: flex; gap: 6px; flex-wrap: wrap; }
.cz-close {
  background: none; border: 1px solid var(--border); color: var(--gray);
  width: 28px; height: 28px; cursor: pointer; font-size: 0.7rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: border-color 0.15s, color 0.15s;
}
.cz-close:hover { border-color: var(--border-bright); color: var(--white); }

/* Modal body — scrollable */
.cz-body {
  flex: 1; overflow-y: auto; padding: 20px 24px;
  display: flex; flex-direction: column; gap: 22px;
}

/* Field groups */
.cz-field { display: flex; flex-direction: column; gap: 10px; }
.cz-label {
  font-family: var(--font-mono); font-size: 0.56rem;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--white);
  display: flex; align-items: center; gap: 8px;
}
.cz-hint {
  font-family: var(--font-sans); font-size: 0.68rem;
  text-transform: none; letter-spacing: 0; color: var(--gray); font-weight: 400;
}
.cz-val {
  font-family: var(--font-mono); font-size: 0.7rem;
  color: var(--white); margin-left: auto;
}

/* Customize pills */
.cz-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.cz-pill {
  font-family: var(--font-mono); font-size: 0.54rem; letter-spacing: 0.08em;
  padding: 6px 12px; border: 1px solid var(--border);
  background: transparent; color: var(--gray);
  cursor: pointer; transition: all 0.12s;
}
.cz-pill:hover { border-color: var(--border-bright); color: var(--white); }
.cz-pill.active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.07); }
.cz-pill--sm { padding: 5px 9px; font-size: 0.5rem; }
.cz-pill--red.active { border-color: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); background: rgba(255,100,100,0.07); }

/* Slider */
.cz-slider {
  width: 100%; appearance: none; height: 2px;
  background: var(--border); outline: none; border-radius: 0;
  accent-color: var(--white);
}
.cz-slider::-webkit-slider-thumb {
  appearance: none; width: 12px; height: 12px;
  background: var(--white); cursor: pointer;
}

/* Summary bar */
.cz-summary {
  display: flex; align-items: stretch;
  border: 1px solid var(--border);
  background: rgba(240,240,234,0.02);
  margin-top: 4px;
}
.cz-summary-item {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 4px; padding: 14px 12px;
}
.cz-summary-lbl {
  font-family: var(--font-mono); font-size: 0.46rem;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--gray);
}
.cz-summary-val {
  font-family: var(--font-mono); font-size: 0.82rem;
  font-weight: 600; color: var(--white);
}
.cz-summary-val.val-warn { color: rgba(255,100,100,0.9); }
.cz-summary-div { width: 1px; background: var(--border); }

/* Modal footer */
.cz-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 16px 24px; border-top: 1px solid var(--border);
  background: rgba(240,240,234,0.01);
}
.cz-footer .iso-btn { font-size: 0.62rem; padding: 10px 20px; }

/* ─── RESPONSIVE ──────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .exams-page { padding: 24px 16px 80px; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-stats { align-self: stretch; }
  .hstat { padding: 14px 16px; flex: 1; }
  .hot-grid { grid-template-columns: 1fr 1fr; }
  .exams-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 600px) {
  .exams-page { padding: 16px 12px 80px; }
  .hot-grid { grid-template-columns: 1fr; }
  .exams-grid { grid-template-columns: 1fr; }
  .filter-search-row { flex-direction: column; align-items: stretch; }
  .page-title { font-size: 1.6rem; }
  .hstat { padding: 12px 12px; }
  .hstat-val { font-size: 1.2rem; }
  .cz-modal { max-height: 95vh; }
  .cz-summary { flex-wrap: wrap; }
  .cz-summary-item { min-width: 50%; }
  .hot-card-cta { flex-direction: column; }
}
</style>
