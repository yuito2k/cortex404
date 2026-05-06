<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ─── Demo user state ────────────────────────────────────────────────
// In production: pull from useSupabaseUser() / profiles table
const isPaidMember = ref(false) // toggle for demo

// ─── Phase ──────────────────────────────────────────────────────────
const phase = ref('setup') // 'setup' | 'mcq' | 'written' | 'results'

// ─── Setup state ────────────────────────────────────────────────────
const selectedExam    = ref('HSC')   // 'HSC' | 'SSC'
const selectedGroup   = ref('')      // 'Science' | 'Arts' | 'Commerce'
const selectedSubject = ref('')
const selectedCount   = ref(30)
const selectedDuration = ref(30)
const shuffleEnabled  = ref(true)
const negativeEnabled = ref(false)
const timerEnabled    = ref(true)

const examGroups = ['Science', 'Arts', 'Commerce']

const subjectsByGroup = {
  Science: {
    HSC: ['Physics', 'Chemistry', 'Biology', 'Higher Math', 'ICT', 'Bangla', 'English'],
    SSC: ['Physics', 'Chemistry', 'Biology', 'Higher Math', 'General Science', 'ICT', 'Bangla', 'English'],
  },
  Arts: {
    HSC: ['Bangla', 'English', 'History', 'Islamic Studies', 'Geography', 'Civics', 'Economics'],
    SSC: ['Bangla', 'English', 'History', 'Islamic Studies', 'Geography', 'Social Science'],
  },
  Commerce: {
    HSC: ['Accounting', 'Business Organization', 'Finance & Banking', 'Economics', 'Bangla', 'English'],
    SSC: ['Accounting', 'Business Organization', 'Economics', 'Bangla', 'English'],
  },
}

const availableSubjects = computed(() => {
  if (!selectedGroup.value) return []
  return subjectsByGroup[selectedGroup.value]?.[selectedExam.value] ?? []
})

watch([selectedExam, selectedGroup], () => { selectedSubject.value = '' })

const questionCounts = [10, 20, 30, 50, 100]
const durationOptions = [15, 20, 30, 45, 60, 90]

function autoSetDuration() {
  const map = { 10: 10, 20: 20, 30: 30, 50: 45, 100: 90 }
  selectedDuration.value = map[selectedCount.value] ?? 30
}

const setupValid = computed(() => selectedGroup.value && selectedSubject.value)

// ─── Demo question bank ──────────────────────────────────────────────
function buildDemoQuestions(subject, count) {
  const templates = [
    { text: `In ${subject}, which of the following statements is correct?`, opts: ['Option A is correct', 'Option B is correct', 'Option C is correct', 'Option D is correct'], ans: 1, exp: 'Option B is the correct answer based on standard curriculum.', diff: 'Medium' },
    { text: `What is the primary principle underlying ${subject} theory?`, opts: ['Conservation of energy', 'Newton\'s third law', 'Ohm\'s law', 'Boyle\'s law'], ans: 0, exp: 'Conservation of energy is fundamental to this topic.', diff: 'Easy' },
    { text: `Which formula is used in ${subject} for this calculation?`, opts: ['F = ma', 'E = mc²', 'V = IR', 'PV = nRT'], ans: 2, exp: 'V = IR (Ohm\'s Law) applies here.', diff: 'Hard' },
    { text: `According to ${subject} curriculum, what does this term mean?`, opts: ['First definition', 'Second definition', 'Third definition', 'Fourth definition'], ans: 3, exp: 'The fourth definition matches the standard textbook definition.', diff: 'Easy' },
    { text: `In the context of ${subject}, which year was this principle established?`, opts: ['1905', '1925', '1945', '1965'], ans: 0, exp: '1905 is when this principle was first formally described.', diff: 'Medium' },
  ]
  return Array.from({ length: count }, (_, i) => {
    const t = templates[i % templates.length]
    return { id: i + 1, text: `Q${i + 1}: ${t.text}`, opts: t.opts, ans: t.ans, exp: t.exp, diff: t.diff, subject, marks: 1 }
  })
}

const writtenQuestions = [
  { id: 'w1', marks: 10, text: 'Describe the fundamental principles of this topic in detail. Include relevant examples from the curriculum and explain the practical applications.', parts: ['Part (a): Define the core concept (2 marks)', 'Part (b): Explain with examples (4 marks)', 'Part (c): Discuss practical applications (4 marks)'] },
  { id: 'w2', marks: 8, text: 'Solve the following problem and show all workings clearly. Provide a diagram where necessary.', parts: ['Part (a): State the formula used (2 marks)', 'Part (b): Show full working (4 marks)', 'Part (c): State the final answer with unit (2 marks)'] },
  { id: 'w3', marks: 7, text: 'Compare and contrast two major theories in this subject. Which do you think is more applicable in modern context and why?', parts: ['Part (a): Theory 1 explanation (2 marks)', 'Part (b): Theory 2 explanation (2 marks)', 'Part (c): Comparative analysis (3 marks)'] },
]

// ─── MCQ exam state ──────────────────────────────────────────────────
const mcqQuestions = ref([])
const mcqAnswers   = ref({})
const mcqFlagged   = ref(new Set())
const currentMcqIdx = ref(0)
let timerInterval  = null
const timeLeft     = ref(0)
const timerWarning = computed(() => timeLeft.value <= 120 && timeLeft.value > 30)
const timerCritical = computed(() => timeLeft.value <= 30)
const showEndModal = ref(false)

function formatTime(s) {
  const m = Math.floor(s / 60), sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

function startMcqTimer() {
  timeLeft.value = selectedDuration.value * 60
  timerInterval = setInterval(() => {
    timeLeft.value--
    if (timeLeft.value <= 0) { clearInterval(timerInterval); submitMcq() }
  }, 1000)
}

function stopTimer() { clearInterval(timerInterval) }

const mcqAnsweredCount = computed(() => Object.keys(mcqAnswers.value).length)
const mcqProgress = computed(() => Math.round((mcqAnsweredCount.value / mcqQuestions.value.length) * 100))

// IntersectionObserver for palette tracking
onMounted(() => {})
onUnmounted(() => stopTimer())

function scrollToMcq(i) {
  document.getElementById(`mcq-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  currentMcqIdx.value = i
}

function startExam() {
  if (!setupValid.value) return
  const raw = buildDemoQuestions(selectedSubject.value, selectedCount.value)
  mcqQuestions.value = shuffleEnabled.value ? raw.sort(() => Math.random() - 0.5) : raw
  mcqAnswers.value = {}
  mcqFlagged.value = new Set()
  currentMcqIdx.value = 0
  phase.value = 'mcq'
  nextTick(() => { if (timerEnabled.value) startMcqTimer() })
}

function toggleMcqFlag(id) {
  const f = new Set(mcqFlagged.value)
  f.has(id) ? f.delete(id) : f.add(id)
  mcqFlagged.value = f
}

function submitMcq() {
  stopTimer()
  if (isPaidMember.value) {
    phase.value = 'written'
    writtenAnswers.value = {}
    writtenImages.value = {}
  } else {
    computeResults()
    phase.value = 'results'
  }
}

// ─── Written exam state ──────────────────────────────────────────────
const writtenAnswers = ref({})
const writtenImages  = ref({})
const writtenTimer   = ref(0)
let writtenInterval  = null
const WRITTEN_DURATION = 60 * 60 // 60 min

function startWrittenTimer() {
  writtenTimer.value = WRITTEN_DURATION
  writtenInterval = setInterval(() => {
    writtenTimer.value--
    if (writtenTimer.value <= 0) { clearInterval(writtenInterval); submitWritten() }
  }, 1000)
}

onMounted(() => {
  watch(() => phase.value, (v) => {
    if (v === 'written') nextTick(() => startWrittenTimer())
  })
})

function handleImageUpload(qid, e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => { writtenImages.value = { ...writtenImages.value, [qid]: { name: file.name, src: reader.result } } }
  reader.readAsDataURL(file)
}

function removeImage(qid) {
  const w = { ...writtenImages.value }
  delete w[qid]
  writtenImages.value = w
}

function submitWritten() {
  clearInterval(writtenInterval)
  computeResults()
  phase.value = 'results'
}

// ─── Results ─────────────────────────────────────────────────────────
const results = reactive({ correct: 0, wrong: 0, skipped: 0, score: 0, grade: '', writtenSubmitted: false })
const resultsFilter = ref('all')

function computeResults() {
  let correct = 0, wrong = 0
  mcqQuestions.value.forEach(q => {
    const a = mcqAnswers.value[q.id]
    if (a === undefined) return
    a === q.ans ? correct++ : wrong++
  })
  const skipped = mcqQuestions.value.length - correct - wrong
  const penalty = negativeEnabled.value ? wrong * 0.25 : 0
  const rawScore = correct - penalty
  const pct = Math.round((rawScore / mcqQuestions.value.length) * 100)
  Object.assign(results, { correct, wrong, skipped, score: Math.max(0, pct) })
  results.writtenSubmitted = isPaidMember.value && Object.keys(writtenAnswers.value).length > 0
  const g = pct >= 90 ? 'A+' : pct >= 80 ? 'A' : pct >= 70 ? 'B' : pct >= 60 ? 'C' : pct >= 50 ? 'D' : 'F'
  results.grade = g
}

const filteredResultQs = computed(() => {
  if (resultsFilter.value === 'correct') return mcqQuestions.value.filter(q => mcqAnswers.value[q.id] === q.ans)
  if (resultsFilter.value === 'wrong') return mcqQuestions.value.filter(q => mcqAnswers.value[q.id] !== undefined && mcqAnswers.value[q.id] !== q.ans)
  if (resultsFilter.value === 'skipped') return mcqQuestions.value.filter(q => mcqAnswers.value[q.id] === undefined)
  return mcqQuestions.value
})

const scoreClass = computed(() => results.score >= 75 ? 'high' : results.score >= 50 ? 'mid' : 'low')
</script>

<template>
  <div class="exam-page">

    <!-- ═══════════════════════════════════════════
         SETUP PHASE
    ═══════════════════════════════════════════ -->
    <div v-if="phase === 'setup'" class="setup-phase">

      <!-- Page header -->
      <div class="page-header">
        <div class="page-header-left">
          <span class="page-chip">
            <span class="chip-dot"></span>BOARD EXAM
          </span>
          <h1 class="page-title">HSC / SSC <span class="text-outline">Exam</span></h1>
          <p class="page-desc">Full board exam simulation — MCQ + Written (paid). Choose your exam, group and subject below.</p>
        </div>
        <div class="page-header-right">
          <!-- Demo membership toggle -->
          <div class="membership-badge" :class="isPaidMember ? 'paid' : 'free'">
            <span class="membership-dot"></span>
            <span>{{ isPaidMember ? 'PRO MEMBER' : 'FREE MEMBER' }}</span>
            <button class="toggle-mem" @click="isPaidMember = !isPaidMember">switch (demo)</button>
          </div>
        </div>
      </div>

      <div class="setup-grid">

        <!-- Left: config -->
        <div class="setup-main">

          <!-- Step 1: Exam Type -->
          <div class="setup-section">
            <div class="setup-section-label">01 — SELECT EXAM</div>
            <div class="exam-type-pills">
              <button
                v-for="ex in ['HSC', 'SSC']" :key="ex"
                class="exam-type-pill"
                :class="{ active: selectedExam === ex }"
                @click="selectedExam = ex; selectedGroup = ''; selectedSubject = ''"
              >
                <span class="pill-exam-name">{{ ex }}</span>
                <span class="pill-exam-sub">{{ ex === 'HSC' ? 'Higher Secondary' : 'Secondary School' }}</span>
              </button>
            </div>
          </div>

          <!-- Step 2: Group -->
          <div class="setup-section">
            <div class="setup-section-label">02 — SELECT GROUP</div>
            <div class="group-cards">
              <button
                v-for="g in examGroups" :key="g"
                class="group-card"
                :class="{ active: selectedGroup === g }"
                @click="selectedGroup = g; selectedSubject = ''"
              >
                <div class="group-icon">
                  <svg v-if="g === 'Science'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>
                  <svg v-else-if="g === 'Arts'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"/></svg>
                </div>
                <span class="group-name">{{ g }}</span>
                <span class="group-sub">{{ { Science: 'Physics · Chem · Bio · Math', Arts: 'History · Civics · Geography', Commerce: 'Accounts · Finance · Eco' }[g] }}</span>
                <div class="group-check" v-if="selectedGroup === g">✓</div>
              </button>
            </div>
          </div>

          <!-- Step 3: Subject -->
          <div class="setup-section" v-if="selectedGroup">
            <div class="setup-section-label">03 — SELECT SUBJECT</div>
            <div class="subject-pills">
              <button
                v-for="s in availableSubjects" :key="s"
                class="subject-pill"
                :class="{ active: selectedSubject === s }"
                @click="selectedSubject = s"
              >{{ s }}</button>
            </div>
          </div>

          <!-- Step 4: Count + Duration -->
          <div class="setup-section" v-if="selectedSubject">
            <div class="setup-section-label">04 — QUESTION COUNT &amp; DURATION</div>
            <div class="count-duration-row">
              <div>
                <div class="sub-label">MCQ Count</div>
                <div class="count-pills">
                  <button v-for="n in questionCounts" :key="n"
                    class="count-pill" :class="{ active: selectedCount === n }"
                    @click="selectedCount = n; autoSetDuration()">{{ n }}</button>
                </div>
              </div>
              <div>
                <div class="sub-label">Duration (min)</div>
                <div class="count-pills">
                  <button v-for="d in durationOptions" :key="d"
                    class="count-pill" :class="{ active: selectedDuration === d }"
                    @click="selectedDuration = d">{{ d }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Options -->
          <div class="setup-section" v-if="selectedSubject">
            <div class="setup-section-label">05 — OPTIONS</div>
            <div class="options-row">
              <label class="toggle-item">
                <div class="toggle-label">
                  <span class="toggle-name">Shuffle Questions</span>
                  <span class="toggle-desc">Random order each attempt</span>
                </div>
                <div class="toggle-switch" :class="{ on: shuffleEnabled }" @click="shuffleEnabled = !shuffleEnabled">
                  <div class="toggle-knob"></div>
                </div>
              </label>
              <label class="toggle-item">
                <div class="toggle-label">
                  <span class="toggle-name">Negative Marking</span>
                  <span class="toggle-desc">–0.25 per wrong answer</span>
                </div>
                <div class="toggle-switch" :class="{ on: negativeEnabled }" @click="negativeEnabled = !negativeEnabled">
                  <div class="toggle-knob"></div>
                </div>
              </label>
              <label class="toggle-item">
                <div class="toggle-label">
                  <span class="toggle-name">Show Timer</span>
                  <span class="toggle-desc">Countdown during exam</span>
                </div>
                <div class="toggle-switch" :class="{ on: timerEnabled }" @click="timerEnabled = !timerEnabled">
                  <div class="toggle-knob"></div>
                </div>
              </label>
            </div>
          </div>

          <!-- Free member notice -->
          <div class="free-notice" v-if="!isPaidMember && selectedSubject">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25z"/></svg>
            <div>
              <strong>Free plan — MCQ only.</strong> You'll attempt {{ selectedCount }} MCQ questions. Written section is available for Pro members.
              <NuxtLink to="/pricing" class="upgrade-link">Upgrade to Pro →</NuxtLink>
            </div>
          </div>

          <!-- Paid member section preview -->
          <div class="paid-preview" v-if="isPaidMember && selectedSubject">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z"/></svg>
            <div>
              <strong>Pro — Full exam unlocked.</strong> After finishing the MCQ section, the written section ({{ writtenQuestions.length }} questions, 60 min) will begin automatically.
            </div>
          </div>

          <!-- CTA -->
          <div class="setup-cta" v-if="selectedSubject">
            <button class="iso-btn iso-btn--fill" :disabled="!setupValid" @click="startExam">
              Start {{ isPaidMember ? 'Full' : 'MCQ' }} Exam →
            </button>
            <div class="cta-meta">
              <span>{{ selectedExam }}</span><span class="meta-sep">·</span>
              <span>{{ selectedGroup }}</span><span class="meta-sep">·</span>
              <span>{{ selectedSubject }}</span><span class="meta-sep">·</span>
              <span>{{ selectedCount }} MCQ</span>
              <span v-if="isPaidMember"><span class="meta-sep">·</span>{{ writtenQuestions.length }} Written</span>
              <span class="meta-sep">·</span><span>{{ selectedDuration }} min</span>
            </div>
          </div>

        </div>

        <!-- Right: tips sidebar -->
        <div class="setup-sidebar">
          <div class="sidebar-panel">
            <div class="sidebar-panel-title">EXAM TIPS</div>
            <ul class="tips-list">
              <li>Read each question carefully before selecting</li>
              <li>For written, show all workings even for partial marks</li>
              <li>Flag uncertain MCQs and return later</li>
              <li>Manage time — don't spend too long on one question</li>
              <li v-if="negativeEnabled" class="tip-warn">⚠ Negative marking is ON — skip if unsure</li>
            </ul>
          </div>
          <div class="sidebar-panel">
            <div class="sidebar-panel-title">EXAM STRUCTURE</div>
            <div class="structure-row">
              <div class="str-item">
                <span class="str-label">MCQ Section</span>
                <span class="str-val">{{ selectedCount || '–' }} Qs × 1 mark</span>
              </div>
              <div class="str-item" v-if="isPaidMember">
                <span class="str-label">Written Section</span>
                <span class="str-val">{{ writtenQuestions.length }} Qs × up to 10 marks</span>
              </div>
              <div class="str-item">
                <span class="str-label">Pass Mark</span>
                <span class="str-val">50%</span>
              </div>
              <div class="str-item">
                <span class="str-label">Duration</span>
                <span class="str-val">{{ selectedDuration || '–' }} min MCQ{{ isPaidMember ? ' + 60 min Written' : '' }}</span>
              </div>
            </div>
          </div>
          <div class="sidebar-panel" v-if="!isPaidMember">
            <div class="sidebar-panel-title">UNLOCK PRO</div>
            <p class="unlock-desc">Get access to the full written section, answer image uploads, AI-powered feedback, and detailed analytics.</p>
            <NuxtLink to="/pricing" class="iso-btn iso-btn--fill iso-btn--full" style="margin-top:12px; display:inline-flex; justify-content:center; text-decoration:none">Upgrade to Pro →</NuxtLink>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         MCQ EXAM PHASE
    ═══════════════════════════════════════════ -->
    <div v-if="phase === 'mcq'" class="exam-phase">

      <!-- Sticky topbar -->
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ selectedExam }} · {{ selectedGroup }} · {{ selectedSubject }}</span>
          <span class="topbar-section">MCQ SECTION</span>
          <span class="topbar-count">{{ mcqAnsweredCount }}/{{ mcqQuestions.length }} answered</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-prog-bar"><div class="topbar-prog-fill" :style="{ width: mcqProgress + '%' }"></div></div>
        </div>
        <div class="topbar-right">
          <span class="topbar-timer" v-if="timerEnabled" :class="{ warning: timerWarning, critical: timerCritical }">
            ⏱ {{ formatTime(timeLeft) }}
          </span>
          <button class="iso-btn iso-btn--ghost end-btn" @click="showEndModal = true">End Exam</button>
        </div>
      </div>

      <!-- Sticky question palette -->
      <div class="q-palette-wrap">
        <div class="q-palette">
          <button
            v-for="(q, i) in mcqQuestions" :key="q.id"
            class="q-dot"
            :class="{
              answered: mcqAnswers[q.id] !== undefined,
              flagged: mcqFlagged.has(q.id),
              current: currentMcqIdx === i
            }"
            @click="scrollToMcq(i)"
          >{{ i + 1 }}</button>
        </div>
      </div>

      <!-- Question list -->
      <div class="mcq-list">
        <div
          v-for="(q, i) in mcqQuestions" :key="q.id"
          :id="`mcq-${i}`"
          class="mcq-card"
          :class="{
            'card-answered': mcqAnswers[q.id] !== undefined,
            'card-flagged': mcqFlagged.has(q.id),
            'card-current': currentMcqIdx === i
          }"
        >
          <div class="mcq-card-head">
            <div class="mcq-meta">
              <span class="mcq-idx">#{{ i + 1 }}</span>
              <span class="mcq-diff" :class="q.diff.toLowerCase()">{{ q.diff }}</span>
              <span class="mcq-marks">{{ q.marks }} mark</span>
            </div>
            <button class="flag-btn" :class="{ active: mcqFlagged.has(q.id) }" @click="toggleMcqFlag(q.id)">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 3a1 1 0 0 1 1-1h16a1 1 0 0 1 .707 1.707L17 8l3.707 3.293A1 1 0 0 1 20 13H4v8a1 1 0 1 1-2 0V3z"/></svg>
              {{ mcqFlagged.has(q.id) ? 'Flagged' : 'Flag' }}
            </button>
          </div>
          <p class="mcq-text">{{ q.text }}</p>
          <div class="mcq-opts">
            <button
              v-for="(opt, oi) in q.opts" :key="oi"
              class="mcq-opt"
              :class="{ selected: mcqAnswers[q.id] === oi }"
              @click="mcqAnswers = { ...mcqAnswers, [q.id]: oi }; currentMcqIdx = i"
            >
              <span class="opt-letter">{{ ['A','B','C','D'][oi] }}</span>
              <span>{{ opt }}</span>
            </button>
          </div>
          <div class="mcq-card-foot">
            <button class="clear-btn" v-if="mcqAnswers[q.id] !== undefined" @click="{ const a = {...mcqAnswers}; delete a[q.id]; mcqAnswers = a }">Clear</button>
            <span class="answered-badge" v-if="mcqAnswers[q.id] !== undefined">✓ Answered</span>
          </div>
        </div>

        <!-- Submit bar -->
        <div class="submit-bar">
          <div class="submit-info">
            <span>{{ mcqAnsweredCount }} answered</span>
            <span class="meta-sep">·</span>
            <span>{{ mcqQuestions.length - mcqAnsweredCount }} remaining</span>
            <span class="meta-sep" v-if="mcqFlagged.size">·</span>
            <span v-if="mcqFlagged.size" class="flagged-count">{{ mcqFlagged.size }} flagged</span>
          </div>
          <button class="iso-btn iso-btn--fill" @click="showEndModal = true">
            {{ isPaidMember ? 'Submit MCQ & Start Written →' : 'Submit Exam →' }}
          </button>
        </div>
      </div>

      <!-- End confirm modal -->
      <div class="modal-overlay" v-if="showEndModal" @click.self="showEndModal = false">
        <div class="modal-box">
          <div class="modal-title">{{ isPaidMember ? 'Submit MCQ Section?' : 'Submit Exam?' }}</div>
          <p class="modal-desc">
            You've answered <strong>{{ mcqAnsweredCount }}</strong> of <strong>{{ mcqQuestions.length }}</strong> questions.
            <span v-if="mcqFlagged.size"> {{ mcqFlagged.size }} question(s) are flagged.</span>
            <span v-if="isPaidMember"> After submitting, the written section will begin.</span>
          </p>
          <div class="modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showEndModal = false">Go back</button>
            <button class="iso-btn iso-btn--fill" @click="showEndModal = false; submitMcq()">
              {{ isPaidMember ? 'Submit & Continue' : 'Submit Exam' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         WRITTEN EXAM PHASE (Paid only)
    ═══════════════════════════════════════════ -->
    <div v-if="phase === 'written'" class="exam-phase">

      <!-- Sticky topbar -->
      <div class="exam-topbar written-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ selectedExam }} · {{ selectedGroup }} · {{ selectedSubject }}</span>
          <span class="topbar-section written-label">WRITTEN SECTION</span>
          <span class="topbar-count">{{ Object.keys(writtenAnswers).length }}/{{ writtenQuestions.length }} attempted</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-prog-bar written-prog">
            <div class="topbar-prog-fill written-fill" :style="{ width: (Object.keys(writtenAnswers).length / writtenQuestions.length * 100) + '%' }"></div>
          </div>
        </div>
        <div class="topbar-right">
          <span class="topbar-timer" :class="{ warning: writtenTimer <= 600 && writtenTimer > 120, critical: writtenTimer <= 120 }">
            ✍ {{ formatTime(writtenTimer) }}
          </span>
          <button class="iso-btn iso-btn--ghost end-btn" @click="submitWritten">Submit Written</button>
        </div>
      </div>

      <!-- Written intro banner -->
      <div class="written-banner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"/></svg>
        <div>
          <strong>Written Section — {{ writtenQuestions.length }} questions · 60 minutes</strong>
          <span>Write detailed answers. You may upload a photo of handwritten work for each question.</span>
        </div>
      </div>

      <!-- Written questions -->
      <div class="written-list">
        <div v-for="(q, i) in writtenQuestions" :key="q.id" class="written-card">
          <div class="written-head">
            <span class="written-qnum">Question {{ i + 1 }}</span>
            <span class="written-marks">{{ q.marks }} marks</span>
          </div>
          <p class="written-qtext">{{ q.text }}</p>
          <div class="written-parts">
            <div v-for="part in q.parts" :key="part" class="written-part">{{ part }}</div>
          </div>

          <!-- Text answer -->
          <div class="written-answer-block">
            <label class="written-field-label">YOUR ANSWER</label>
            <textarea
              class="written-textarea"
              :placeholder="`Write your answer for Question ${i + 1} here...`"
              :value="writtenAnswers[q.id] || ''"
              @input="writtenAnswers = { ...writtenAnswers, [q.id]: $event.target.value }"
              rows="6"
            ></textarea>
            <div class="char-count">{{ (writtenAnswers[q.id] || '').length }} characters</div>
          </div>

          <!-- Image upload -->
          <div class="image-upload-block">
            <label class="written-field-label">UPLOAD HANDWRITTEN ANSWER (OPTIONAL)</label>
            <div v-if="!writtenImages[q.id]" class="upload-zone" @click="$refs[`fileInput_${q.id}`][0].click()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"/></svg>
              <span>Click to upload image <em>(JPG, PNG, up to 10MB)</em></span>
              <input
                type="file"
                :ref="`fileInput_${q.id}`"
                accept="image/*"
                style="display:none"
                @change="handleImageUpload(q.id, $event)"
              />
            </div>
            <div v-else class="uploaded-preview">
              <img :src="writtenImages[q.id].src" class="preview-img" :alt="writtenImages[q.id].name" />
              <div class="preview-info">
                <span class="preview-name">{{ writtenImages[q.id].name }}</span>
                <button class="remove-img-btn" @click="removeImage(q.id)">✕ Remove</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Written submit bar -->
        <div class="submit-bar">
          <div class="submit-info">
            <span>{{ Object.keys(writtenAnswers).length }}/{{ writtenQuestions.length }} answered</span>
            <span class="meta-sep">·</span>
            <span>{{ Object.keys(writtenImages).length }} image(s) uploaded</span>
          </div>
          <button class="iso-btn iso-btn--fill" @click="submitWritten">
            Submit & View Results →
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════
         RESULTS PHASE
    ═══════════════════════════════════════════ -->
    <div v-if="phase === 'results'" class="results-phase">

      <div class="results-grid">
        <div class="results-main">

          <!-- Score hero -->
          <div class="score-hero">
            <div class="score-hero-left">
              <div class="score-hero-badge">{{ selectedExam }} · {{ selectedGroup }} · {{ selectedSubject }}</div>
              <div class="score-pct" :class="scoreClass">{{ results.score }}<span class="score-pct-sym">%</span></div>
              <div class="score-grade-row">
                <span class="grade-badge" :class="scoreClass">{{ results.grade }}</span>
                <span class="score-verdict">{{ results.score >= 50 ? 'PASSED' : 'FAILED' }}</span>
              </div>
            </div>
            <div class="score-hero-right">
              <div class="score-stat-grid">
                <div class="score-stat correct">
                  <span class="ss-val">{{ results.correct }}</span>
                  <span class="ss-label">Correct</span>
                  <div class="ss-bar"><div :style="{ height: (results.correct / mcqQuestions.length * 100) + '%' }" class="ss-fill correct-fill"></div></div>
                </div>
                <div class="score-stat wrong">
                  <span class="ss-val">{{ results.wrong }}</span>
                  <span class="ss-label">Wrong</span>
                  <div class="ss-bar"><div :style="{ height: (results.wrong / mcqQuestions.length * 100) + '%' }" class="ss-fill wrong-fill"></div></div>
                </div>
                <div class="score-stat skipped">
                  <span class="ss-val">{{ results.skipped }}</span>
                  <span class="ss-label">Skipped</span>
                  <div class="ss-bar"><div :style="{ height: (results.skipped / mcqQuestions.length * 100) + '%' }" class="ss-fill skip-fill"></div></div>
                </div>
                <div class="score-stat accuracy">
                  <span class="ss-val">{{ results.correct + results.wrong > 0 ? Math.round(results.correct / (results.correct + results.wrong) * 100) : 0 }}%</span>
                  <span class="ss-label">Accuracy</span>
                  <div class="ss-bar"><div :style="{ height: (results.correct + results.wrong > 0 ? results.correct / (results.correct + results.wrong) * 100 : 0) + '%' }" class="ss-fill acc-fill"></div></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Written submitted notice -->
          <div class="written-submitted" v-if="results.writtenSubmitted">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12z"/></svg>
            <div>
              <strong>Written section submitted.</strong> Your answers have been recorded. Results will be available after manual review by your teacher.
            </div>
          </div>

          <!-- MCQ Review -->
          <div class="review-section">
            <div class="review-header">
              <span class="review-title">MCQ REVIEW</span>
              <div class="review-filters">
                <button v-for="f in ['all','correct','wrong','skipped']" :key="f"
                  class="review-filter-btn" :class="{ active: resultsFilter === f }"
                  @click="resultsFilter = f">
                  {{ f.charAt(0).toUpperCase() + f.slice(1) }}
                  <span class="rf-count">
                    {{ f === 'all' ? mcqQuestions.length : f === 'correct' ? results.correct : f === 'wrong' ? results.wrong : results.skipped }}
                  </span>
                </button>
              </div>
            </div>

            <div class="review-list">
              <div v-for="(q, i) in filteredResultQs" :key="q.id" class="review-card">
                <div class="rc-head">
                  <span class="rc-idx">#{{ mcqQuestions.indexOf(q) + 1 }}</span>
                  <span class="rc-diff" :class="q.diff.toLowerCase()">{{ q.diff }}</span>
                  <span v-if="mcqAnswers[q.id] === q.ans" class="rc-status correct-tag">✓ Correct</span>
                  <span v-else-if="mcqAnswers[q.id] !== undefined" class="rc-status wrong-tag">✗ Wrong</span>
                  <span v-else class="rc-status skip-tag">— Skipped</span>
                </div>
                <p class="rc-qtext">{{ q.text }}</p>
                <div class="rc-opts">
                  <div v-for="(opt, oi) in q.opts" :key="oi" class="rc-opt"
                    :class="{
                      'rc-correct': oi === q.ans,
                      'rc-wrong': oi === mcqAnswers[q.id] && oi !== q.ans
                    }">
                    <span class="opt-letter">{{ ['A','B','C','D'][oi] }}</span>
                    <span>{{ opt }}</span>
                    <span class="rc-tag" v-if="oi === q.ans">✓ Correct</span>
                    <span class="rc-tag rc-your-tag" v-else-if="oi === mcqAnswers[q.id]">✗ Your answer</span>
                  </div>
                </div>
                <div class="rc-exp">
                  <span class="exp-label">EXPLANATION</span>
                  <p>{{ q.exp }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Results sidebar -->
        <div class="results-sidebar">
          <div class="sidebar-panel">
            <div class="sidebar-panel-title">NEXT STEPS</div>
            <div class="next-steps">
              <button class="iso-btn iso-btn--fill iso-btn--full" @click="phase = 'setup'; mcqAnswers = {}; mcqFlagged = new Set()">Retry This Exam</button>
              <NuxtLink to="/dashboard/question-bank" class="iso-btn iso-btn--ghost iso-btn--full" style="display:inline-flex; justify-content:center; text-decoration:none; margin-top:8px">Practice Weak Topics</NuxtLink>
              <NuxtLink to="/dashboard/progress" class="iso-btn iso-btn--ghost iso-btn--full" style="display:inline-flex; justify-content:center; text-decoration:none; margin-top:8px">View Progress →</NuxtLink>
            </div>
          </div>
          <div class="sidebar-panel">
            <div class="sidebar-panel-title">DIFFICULTY BREAKDOWN</div>
            <div class="diff-breakdown">
              <div v-for="d in ['Easy','Medium','Hard']" :key="d" class="db-row">
                <span class="db-label">{{ d }}</span>
                <div class="db-bar-wrap">
                  <div class="db-bar" :class="d.toLowerCase()"
                    :style="{ width: mcqQuestions.filter(q => q.diff === d).length / mcqQuestions.length * 100 + '%' }">
                  </div>
                </div>
                <span class="db-count">{{ mcqQuestions.filter(q => q.diff === d).length }}</span>
              </div>
            </div>
          </div>
          <div class="sidebar-panel" v-if="!isPaidMember">
            <div class="sidebar-panel-title">UNLOCK WRITTEN SECTION</div>
            <p class="unlock-desc">Pro members get written exam practice with image upload, teacher review, and detailed scoring.</p>
            <NuxtLink to="/pricing" class="iso-btn iso-btn--fill iso-btn--full" style="display:inline-flex; justify-content:center; text-decoration:none; margin-top:12px">Upgrade to Pro →</NuxtLink>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ── Base ───────────────────────────────────────────────── */
.exam-page {
  padding: 0;
  min-height: 100vh;
  background: var(--black);
  color: var(--white);
  font-family: var(--font-sans);
}

/* ── Page header ────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 36px 40px 0;
  gap: 24px;
  flex-wrap: wrap;
}
.page-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 4px 10px;
  margin-bottom: 12px;
}
.chip-dot {
  width: 5px; height: 5px;
  background: var(--white);
  border-radius: 50%;
  animation: pulse 2s infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
.page-title {
  font-family: var(--font-mono);
  font-size: 2rem;
  letter-spacing: -0.02em;
  margin: 0 0 8px;
  color: var(--white);
}
.text-outline {
  -webkit-text-stroke: 1px var(--white);
  color: transparent;
}
.page-desc {
  color: var(--gray);
  font-size: 0.9rem;
  margin: 0;
}
.membership-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
}
.membership-badge.paid { border-color: rgba(120,230,120,0.3); color: rgba(120,230,120,0.9); }
.membership-badge.free { border-color: var(--border-bright); color: var(--gray); }
.membership-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
.toggle-mem {
  background: none; border: 1px solid currentColor; color: currentColor;
  padding: 2px 8px; font-family: var(--font-mono); font-size: 0.6rem;
  cursor: pointer; opacity: 0.6;
}
.toggle-mem:hover { opacity: 1; }

/* ── Setup grid ─────────────────────────────────────────── */
.setup-phase { padding: 24px 40px 60px; }
.setup-grid { display: grid; grid-template-columns: 1fr 280px; gap: 1px; background: var(--border); margin-top: 28px; }
.setup-main { background: var(--black); padding: 32px 32px 40px; }
.setup-sidebar { background: var(--black); padding: 0; }

/* ── Setup sections ─────────────────────────────────────── */
.setup-section { margin-bottom: 36px; }
.setup-section-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: var(--dim);
  margin-bottom: 14px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}
.sub-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--gray); margin-bottom: 10px; }

/* Exam type pills */
.exam-type-pills { display: flex; gap: 1px; background: var(--border); width: fit-content; }
.exam-type-pill {
  background: var(--black); border: none; color: var(--gray);
  padding: 16px 40px; cursor: pointer; transition: all 0.15s;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.exam-type-pill:hover { background: rgba(240,240,234,0.03); color: var(--white); }
.exam-type-pill.active { background: rgba(240,240,234,0.06); color: var(--white); border-bottom: 2px solid var(--white); }
.pill-exam-name { font-family: var(--font-mono); font-size: 1.4rem; letter-spacing: 0.06em; }
.pill-exam-sub { font-size: 0.72rem; color: var(--gray); }

/* Group cards */
.group-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.group-card {
  background: var(--black); border: none; color: var(--gray);
  padding: 20px; cursor: pointer; transition: all 0.15s;
  text-align: left; position: relative; display: flex; flex-direction: column; gap: 6px;
}
.group-card:hover { background: rgba(240,240,234,0.03); color: var(--white); border-left: 2px solid var(--border-bright); }
.group-card.active { background: rgba(240,240,234,0.06); color: var(--white); border-left: 2px solid var(--white); }
.group-icon { width: 28px; height: 28px; color: var(--gray); margin-bottom: 4px; }
.group-icon svg { width: 100%; height: 100%; }
.group-card.active .group-icon { color: var(--white); }
.group-name { font-family: var(--font-mono); font-size: 0.9rem; letter-spacing: 0.08em; color: inherit; }
.group-sub { font-size: 0.72rem; color: var(--dim); }
.group-check {
  position: absolute; top: 10px; right: 10px;
  font-size: 0.7rem; color: var(--white);
  background: rgba(240,240,234,0.1); width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
}

/* Subject pills */
.subject-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.subject-pill {
  background: none; border: 1px solid var(--border); color: var(--gray);
  padding: 7px 16px; font-family: var(--font-mono); font-size: 0.72rem;
  letter-spacing: 0.08em; cursor: pointer; transition: all 0.15s;
}
.subject-pill:hover { border-color: var(--border-bright); color: var(--white); }
.subject-pill.active { background: rgba(240,240,234,0.08); border-color: var(--white); color: var(--white); }

/* Count + duration */
.count-duration-row { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
.count-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.count-pill {
  background: none; border: 1px solid var(--border); color: var(--gray);
  padding: 6px 16px; font-family: var(--font-mono); font-size: 0.78rem;
  cursor: pointer; transition: all 0.15s;
}
.count-pill:hover { border-color: var(--border-bright); color: var(--white); }
.count-pill.active { background: rgba(240,240,234,0.08); border-color: var(--white); color: var(--white); }

/* Options toggles */
.options-row { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.toggle-item {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--black); padding: 14px 16px; cursor: pointer;
}
.toggle-item:hover { background: rgba(240,240,234,0.02); }
.toggle-label { display: flex; flex-direction: column; gap: 2px; }
.toggle-name { font-family: var(--font-mono); font-size: 0.78rem; color: var(--white); letter-spacing: 0.06em; }
.toggle-desc { font-size: 0.72rem; color: var(--dim); }
.toggle-switch {
  width: 36px; height: 20px; background: rgba(240,240,234,0.1); border: 1px solid var(--border);
  position: relative; cursor: pointer; transition: background 0.2s;
}
.toggle-switch.on { background: rgba(240,240,234,0.25); border-color: var(--border-bright); }
.toggle-knob {
  position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
  background: var(--gray); transition: transform 0.2s, background 0.2s;
}
.toggle-switch.on .toggle-knob { transform: translateX(16px); background: var(--white); }

/* Notices */
.free-notice, .paid-preview, .written-banner {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 16px; border: 1px solid var(--border); margin-bottom: 24px; font-size: 0.84rem;
}
.free-notice { border-color: rgba(255,200,80,0.2); background: rgba(255,200,80,0.03); }
.paid-preview { border-color: rgba(120,230,120,0.2); background: rgba(120,230,120,0.03); }
.written-banner { border-color: rgba(120,230,120,0.2); background: rgba(120,230,120,0.03); margin: 0 40px 24px; }
.free-notice svg, .paid-preview svg, .written-banner svg { width: 18px; height: 18px; flex-shrink: 0; margin-top: 1px; }
.free-notice svg { color: rgba(255,200,80,0.8); }
.paid-preview svg, .written-banner svg { color: rgba(120,230,120,0.8); }
.upgrade-link { color: var(--white); margin-left: 8px; font-family: var(--font-mono); font-size: 0.72rem; }

/* CTA */
.setup-cta { display: flex; align-items: center; gap: 20px; padding-top: 8px; flex-wrap: wrap; }
.cta-meta { font-family: var(--font-mono); font-size: 0.72rem; color: var(--dim); letter-spacing: 0.08em; }
.meta-sep { margin: 0 6px; opacity: 0.3; }

/* Sidebar panels */
.sidebar-panel { padding: 20px; border-bottom: 1px solid var(--border); }
.sidebar-panel-title {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.16em; color: var(--dim); margin-bottom: 14px;
}
.tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.tips-list li { font-size: 0.8rem; color: var(--gray); padding-left: 16px; position: relative; }
.tips-list li::before { content: '→'; position: absolute; left: 0; color: var(--dim); }
.tip-warn { color: rgba(255,200,80,0.8) !important; }
.structure-row { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.str-item { background: var(--black); display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; }
.str-label { font-size: 0.78rem; color: var(--gray); }
.str-val { font-family: var(--font-mono); font-size: 0.72rem; color: var(--white); }
.unlock-desc { font-size: 0.8rem; color: var(--gray); line-height: 1.5; margin: 0; }

/* ── iso-btn (replicated core) ──────────────────────────── */
.iso-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 22px; font-family: var(--font-mono); font-size: 0.78rem;
  letter-spacing: 0.08em; cursor: pointer; border: none; transition: all 0.15s;
  text-decoration: none; white-space: nowrap;
}
.iso-btn--fill {
  background: var(--white); color: var(--black);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.15), 3px 3px 0 0 rgba(240,240,234,0.1), 4px 4px 0 0 rgba(240,240,234,0.05);
}
.iso-btn--fill:hover { transform: translate(-2px,-2px); box-shadow: 4px 4px 0 0 rgba(240,240,234,0.15), 5px 5px 0 0 rgba(240,240,234,0.1), 6px 6px 0 0 rgba(240,240,234,0.05); }
.iso-btn--ghost {
  background: transparent; color: var(--white); border: 1px solid var(--border);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04), 3px 3px 0 0 rgba(240,240,234,0.03);
}
.iso-btn--ghost:hover { border-color: var(--border-bright); transform: translate(-1px,-1px); box-shadow: 3px 3px 0 0 rgba(240,240,234,0.06), 4px 4px 0 0 rgba(240,240,234,0.04); }
.iso-btn--full { width: 100%; justify-content: center; }
.iso-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none !important; }

/* ── Exam phase shared ──────────────────────────────────── */
.exam-phase { position: relative; }

.exam-topbar {
  position: sticky; top: 0; z-index: 50;
  background: rgba(8,8,8,0.95); backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 24px; gap: 16px;
}
.written-topbar { border-bottom-color: rgba(120,230,120,0.2); }
.topbar-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.topbar-chip { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; color: var(--dim); border: 1px solid var(--border); padding: 3px 8px; }
.topbar-section { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.12em; color: var(--white); }
.written-label { color: rgba(120,230,120,0.9); }
.topbar-count { font-size: 0.8rem; color: var(--gray); }
.topbar-center { flex: 1; max-width: 300px; }
.topbar-prog-bar { height: 3px; background: rgba(240,240,234,0.08); }
.topbar-prog-fill { height: 100%; background: var(--white); transition: width 0.3s; }
.written-prog { }
.written-fill { background: rgba(120,230,120,0.7); }
.topbar-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.topbar-timer { font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); padding: 4px 10px; border: 1px solid var(--border); }
.topbar-timer.warning { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.3); }
.topbar-timer.critical { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); animation: blink 0.8s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.end-btn { padding: 6px 14px; font-size: 0.72rem; }

/* Question palette */
.q-palette-wrap {
  position: sticky; top: 57px; z-index: 40;
  background: rgba(8,8,8,0.92); backdrop-filter: blur(4px);
  border-bottom: 1px solid var(--border);
  padding: 8px 24px; overflow-x: auto;
}
.q-palette { display: flex; gap: 4px; flex-wrap: nowrap; min-width: max-content; }
.q-dot {
  width: 28px; height: 28px; border: 1px solid var(--border);
  background: none; color: var(--dim); cursor: pointer;
  font-family: var(--font-mono); font-size: 0.62rem;
  transition: all 0.1s; display: flex; align-items: center; justify-content: center;
}
.q-dot:hover { border-color: var(--border-bright); color: var(--white); }
.q-dot.answered { background: rgba(240,240,234,0.1); border-color: rgba(240,240,234,0.3); color: var(--white); }
.q-dot.flagged { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.8); }
.q-dot.current { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.12); }

/* MCQ list */
.mcq-list { padding: 24px 24px 60px; display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.mcq-card {
  background: var(--black); padding: 20px 24px;
  border-left: 3px solid transparent; transition: border-color 0.15s;
  scroll-margin-top: 120px;
}
.mcq-card:hover { border-left-color: var(--border-bright); }
.mcq-card.card-answered { border-left-color: rgba(240,240,234,0.3); }
.mcq-card.card-flagged { border-left-color: rgba(255,200,80,0.5); }
.mcq-card.card-current { border-left-color: var(--white); }
.mcq-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.mcq-meta { display: flex; align-items: center; gap: 10px; }
.mcq-idx { font-family: var(--font-mono); font-size: 0.7rem; color: var(--dim); }
.mcq-diff { font-family: var(--font-mono); font-size: 0.65rem; padding: 2px 8px; letter-spacing: 0.1em; }
.mcq-diff.easy { background: rgba(120,230,120,0.08); color: rgba(120,230,120,0.7); }
.mcq-diff.medium { background: rgba(255,200,80,0.08); color: rgba(255,200,80,0.7); }
.mcq-diff.hard { background: rgba(255,100,100,0.08); color: rgba(255,100,100,0.7); }
.mcq-marks { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); }
.flag-btn {
  display: flex; align-items: center; gap: 5px;
  background: none; border: 1px solid var(--border); color: var(--gray);
  padding: 4px 10px; font-family: var(--font-mono); font-size: 0.65rem;
  cursor: pointer; transition: all 0.15s;
}
.flag-btn svg { width: 12px; height: 12px; }
.flag-btn:hover { border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.8); }
.flag-btn.active { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.05); }
.mcq-text { color: var(--white); line-height: 1.6; margin: 0 0 16px; font-size: 0.9rem; }
.mcq-opts { display: flex; flex-direction: column; gap: 6px; }
.mcq-opt {
  display: flex; align-items: center; gap: 12px;
  background: none; border: 1px solid var(--border); color: var(--gray);
  padding: 10px 14px; cursor: pointer; transition: all 0.15s; text-align: left;
  font-size: 0.85rem; font-family: var(--font-sans);
}
.mcq-opt:hover { border-color: var(--border-bright); color: var(--white); background: rgba(240,240,234,0.02); }
.mcq-opt.selected { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.06); }
.opt-letter {
  width: 22px; height: 22px; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.65rem; flex-shrink: 0;
}
.mcq-opt.selected .opt-letter { border-color: var(--white); background: rgba(240,240,234,0.1); color: var(--white); }
.mcq-card-foot { display: flex; align-items: center; gap: 12px; margin-top: 12px; }
.clear-btn {
  background: none; border: 1px solid var(--border); color: var(--dim);
  padding: 4px 10px; font-family: var(--font-mono); font-size: 0.65rem;
  cursor: pointer; transition: all 0.15s;
}
.clear-btn:hover { border-color: var(--border-bright); color: var(--gray); }
.answered-badge { font-family: var(--font-mono); font-size: 0.65rem; color: rgba(120,230,120,0.7); letter-spacing: 0.1em; }
.flagged-count { color: rgba(255,200,80,0.8); }

/* Submit bar */
.submit-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: var(--black); padding: 20px 24px; border-top: 1px solid var(--border);
  flex-wrap: wrap; gap: 16px;
}
.submit-info { font-family: var(--font-mono); font-size: 0.75rem; color: var(--gray); }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(8,8,8,0.85);
  display: flex; align-items: center; justify-content: center; z-index: 100;
}
.modal-box { background: var(--black); border: 1px solid var(--border-bright); padding: 32px; max-width: 420px; width: 90%; box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04); }
.modal-title { font-family: var(--font-mono); font-size: 1rem; letter-spacing: 0.06em; margin-bottom: 12px; }
.modal-desc { font-size: 0.86rem; color: var(--gray); line-height: 1.6; margin-bottom: 24px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ── Written exam ───────────────────────────────────────── */
.written-list { padding: 24px 24px 60px; display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.written-card {
  background: var(--black); padding: 24px;
  border-left: 3px solid rgba(120,230,120,0.15);
}
.written-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.written-qnum { font-family: var(--font-mono); font-size: 0.8rem; color: var(--white); letter-spacing: 0.1em; }
.written-marks { font-family: var(--font-mono); font-size: 0.72rem; color: rgba(120,230,120,0.7); border: 1px solid rgba(120,230,120,0.2); padding: 2px 8px; }
.written-qtext { color: var(--white); font-size: 0.9rem; line-height: 1.6; margin: 0 0 14px; }
.written-parts { display: flex; flex-direction: column; gap: 4px; margin-bottom: 16px; padding: 12px 14px; border-left: 2px solid rgba(240,240,234,0.1); background: rgba(240,240,234,0.02); }
.written-part { font-size: 0.8rem; color: var(--gray); }
.written-answer-block { margin-bottom: 16px; }
.written-field-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); display: block; margin-bottom: 8px; }
.written-textarea {
  width: 100%; box-sizing: border-box; background: rgba(240,240,234,0.03);
  border: 1px solid var(--border); color: var(--white); padding: 12px 14px;
  font-family: var(--font-sans); font-size: 0.86rem; line-height: 1.6; resize: vertical;
  transition: border-color 0.15s;
}
.written-textarea:focus { outline: none; border-color: var(--border-bright); }
.written-textarea::placeholder { color: var(--dim); }
.char-count { font-family: var(--font-mono); font-size: 0.62rem; color: var(--dim); text-align: right; margin-top: 4px; }

/* Image upload */
.image-upload-block { }
.upload-zone {
  border: 1px dashed var(--border); padding: 20px; display: flex;
  flex-direction: column; align-items: center; gap: 8px; cursor: pointer;
  transition: all 0.15s; color: var(--gray); font-size: 0.8rem;
}
.upload-zone:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.02); color: var(--white); }
.upload-zone svg { width: 24px; height: 24px; color: var(--dim); }
.upload-zone em { font-style: normal; font-size: 0.72rem; color: var(--dim); }
.uploaded-preview { display: flex; align-items: flex-start; gap: 14px; border: 1px solid var(--border); padding: 12px; }
.preview-img { width: 80px; height: 60px; object-fit: cover; border: 1px solid var(--border); }
.preview-info { display: flex; flex-direction: column; gap: 6px; }
.preview-name { font-size: 0.8rem; color: var(--gray); word-break: break-all; }
.remove-img-btn { background: none; border: 1px solid var(--border); color: var(--dim); padding: 4px 8px; font-family: var(--font-mono); font-size: 0.62rem; cursor: pointer; width: fit-content; }
.remove-img-btn:hover { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.7); }

/* ── Results ────────────────────────────────────────────── */
.results-phase { padding: 32px 40px 60px; }
.results-grid { display: grid; grid-template-columns: 1fr 280px; gap: 1px; background: var(--border); }
.results-main { background: var(--black); padding: 0; }
.results-sidebar { background: var(--black); }

.score-hero { display: grid; grid-template-columns: auto 1fr; gap: 1px; background: var(--border); margin-bottom: 1px; }
.score-hero-left { background: var(--black); padding: 36px; display: flex; flex-direction: column; gap: 12px; }
.score-hero-badge { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.12em; color: var(--dim); border: 1px solid var(--border); padding: 4px 10px; width: fit-content; }
.score-pct { font-family: var(--font-mono); font-size: 4rem; line-height: 1; color: var(--white); }
.score-pct.high { color: rgba(120,230,120,0.9); }
.score-pct.mid { color: rgba(255,200,80,0.9); }
.score-pct.low { color: rgba(255,100,100,0.9); }
.score-pct-sym { font-size: 2rem; }
.score-grade-row { display: flex; align-items: center; gap: 10px; }
.grade-badge { font-family: var(--font-mono); font-size: 1rem; padding: 4px 12px; border: 1px solid; }
.grade-badge.high { border-color: rgba(120,230,120,0.4); color: rgba(120,230,120,0.9); }
.grade-badge.mid { border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.9); }
.grade-badge.low { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }
.score-verdict { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.14em; color: var(--gray); }

.score-hero-right { background: var(--black); padding: 24px; }
.score-stat-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); height: 100%; }
.score-stat {
  background: var(--black); display: flex; flex-direction: column; align-items: center;
  padding: 20px 12px; gap: 6px; position: relative;
}
.ss-val { font-family: var(--font-mono); font-size: 1.6rem; color: var(--white); }
.ss-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--dim); }
.ss-bar { width: 100%; height: 3px; background: rgba(240,240,234,0.06); margin-top: 8px; position: relative; overflow: hidden; }
.ss-fill { position: absolute; bottom: 0; left: 0; width: 100%; transition: height 0.5s; }
.correct-fill { background: rgba(120,230,120,0.5); }
.wrong-fill { background: rgba(255,100,100,0.5); }
.skip-fill { background: rgba(240,240,234,0.2); }
.acc-fill { background: rgba(255,200,80,0.5); }

.written-submitted {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 14px 24px; border-bottom: 1px solid rgba(120,230,120,0.15);
  background: rgba(120,230,120,0.03); font-size: 0.84rem;
}
.written-submitted svg { width: 18px; height: 18px; color: rgba(120,230,120,0.8); flex-shrink: 0; margin-top: 1px; }

/* Review */
.review-section { padding: 24px; }
.review-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 12px; }
.review-title { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.14em; color: var(--gray); }
.review-filters { display: flex; gap: 4px; }
.review-filter-btn {
  background: none; border: 1px solid var(--border); color: var(--gray);
  padding: 5px 12px; font-family: var(--font-mono); font-size: 0.65rem;
  letter-spacing: 0.08em; cursor: pointer; display: flex; align-items: center; gap: 6px;
}
.review-filter-btn:hover { border-color: var(--border-bright); color: var(--white); }
.review-filter-btn.active { background: rgba(240,240,234,0.06); border-color: var(--white); color: var(--white); }
.rf-count { opacity: 0.5; font-size: 0.6rem; }

.review-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.review-card { background: var(--black); padding: 20px 22px; }
.rc-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.rc-idx { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); }
.rc-diff { font-family: var(--font-mono); font-size: 0.62rem; padding: 2px 6px; }
.rc-diff.easy { background: rgba(120,230,120,0.08); color: rgba(120,230,120,0.6); }
.rc-diff.medium { background: rgba(255,200,80,0.08); color: rgba(255,200,80,0.6); }
.rc-diff.hard { background: rgba(255,100,100,0.08); color: rgba(255,100,100,0.6); }
.rc-status { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; padding: 2px 8px; }
.correct-tag { color: rgba(120,230,120,0.8); border: 1px solid rgba(120,230,120,0.2); }
.wrong-tag { color: rgba(255,100,100,0.8); border: 1px solid rgba(255,100,100,0.2); }
.skip-tag { color: var(--dim); border: 1px solid var(--border); }
.rc-qtext { color: var(--white); font-size: 0.87rem; line-height: 1.5; margin: 0 0 12px; }
.rc-opts { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.rc-opt {
  display: flex; align-items: center; gap: 10px; padding: 8px 12px;
  border: 1px solid var(--border); font-size: 0.82rem; color: var(--gray); position: relative;
}
.rc-opt.rc-correct { border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.04); color: rgba(120,230,120,0.9); }
.rc-opt.rc-wrong { border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.04); color: rgba(255,100,100,0.9); }
.rc-opt.rc-correct .opt-letter { border-color: rgba(120,230,120,0.4); color: rgba(120,230,120,0.9); }
.rc-opt.rc-wrong .opt-letter { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }
.rc-tag { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em; margin-left: auto; }
.rc-your-tag { color: rgba(255,100,100,0.7); }
.rc-exp { padding: 10px 12px; background: rgba(240,240,234,0.02); border-left: 2px solid rgba(240,240,234,0.08); }
.exp-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.16em; color: var(--dim); display: block; margin-bottom: 5px; }
.rc-exp p { font-size: 0.8rem; color: var(--gray); margin: 0; line-height: 1.5; }

/* Results sidebar */
.next-steps { display: flex; flex-direction: column; }
.diff-breakdown { display: flex; flex-direction: column; gap: 8px; }
.db-row { display: flex; align-items: center; gap: 8px; }
.db-label { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); width: 55px; }
.db-bar-wrap { flex: 1; height: 3px; background: rgba(240,240,234,0.06); }
.db-bar { height: 100%; transition: width 0.5s; }
.db-bar.easy { background: rgba(120,230,120,0.4); }
.db-bar.medium { background: rgba(255,200,80,0.4); }
.db-bar.hard { background: rgba(255,100,100,0.4); }
.db-count { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); width: 20px; text-align: right; }
</style>
