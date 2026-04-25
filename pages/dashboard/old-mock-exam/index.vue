<template>
  <div class="mock-exam-page">

    <!-- ── SETUP STATE ─────────────────────────────────────── -->
    <template v-if="examState === 'setup'">
      <DashboardExamSetup
        :stream-options="streamOptions"
        :subject-options="subjectOptions"
        :available-question-counts="availableQuestionCounts"
        :selected-stream="selectedStream"
        :selected-subject="selectedSubject"
        :question-count="questionCount"
        :loading="loading"
        :error="error"
        @start="startExam"
      />
    </template>

    <!-- ── IN-PROGRESS STATE ───────────────────────────────── -->
    <template v-else-if="examState === 'in-progress'">

      <!-- Sticky top bar: info + timer + submit -->
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-stream">{{ selectedStream }}</span>
          <span class="topbar-sep">/</span>
          <span class="topbar-subject">{{ subjectLabel }}</span>
        </div>

        <div class="topbar-center">
          <DashboardExamTimer
            :display="timerDisplay"
            :timer-warning="timerWarning"
            :timer-danger="timerDanger"
            :timer-progress="timerProgress"
          />
        </div>

        <div class="topbar-right">
          <div class="progress-pill">
            <span class="pill-answered">{{ answeredCount }}</span>
            <span class="pill-sep">/</span>
            <span class="pill-total">{{ questions.length }}</span>
            <span class="pill-label">ANS</span>
          </div>
          <button class="submit-btn" @click="showSubmitConfirm = true">
            SUBMIT
          </button>
        </div>
      </div>

      <!-- Main layout: scrollable questions + sticky sidebar -->
      <div class="exam-layout">

        <!-- All questions scrollable -->
        <div class="exam-main">
          <div
            v-for="(q, i) in questions"
            :key="q.id"
            :id="`q-${i}`"
            class="question-block"
          >
            <DashboardExamQuestion
              :question="q"
              :index="i"
              :total="questions.length"
              :selected-answer="answers[i] ?? null"
              @select="(opt) => selectAnswer(i, opt)"
            />
          </div>
        </div>

        <!-- Sticky sidebar: question status grid -->
        <aside class="exam-sidebar">
          <div class="sidebar-label">QUESTION MAP</div>
          <div class="nav-grid">
            <a
              v-for="(_, i) in questions"
              :key="i"
              class="nav-cell"
              :class="statusClass(i)"
              :href="`#q-${i}`"
            >
              {{ i + 1 }}
            </a>
          </div>

          <div class="nav-legend">
            <span class="legend-item answered"><span class="legend-dot" />Answered</span>
            <span class="legend-item unanswered"><span class="legend-dot" />Unanswered</span>
          </div>

          <div class="sidebar-progress">
            <div class="sp-bar-track">
              <div class="sp-bar-fill" :style="{ width: (answeredCount / questions.length * 100) + '%' }" />
            </div>
            <span class="sp-label">{{ answeredCount }} / {{ questions.length }} answered</span>
          </div>
        </aside>

      </div>

      <!-- 30-second warning overlay -->
      <Transition name="warning-fade">
        <div v-if="showWarning" class="warning-overlay">
          <div class="warning-card">
            <div class="warning-icon">⚠</div>
            <div class="warning-title">30 SECONDS REMAINING</div>
            <p class="warning-text">Your exam will auto-submit. Answer remaining questions now.</p>
            <button class="iso-btn--fill warning-dismiss" @click="dismissWarning">
              CONTINUE EXAM
            </button>
          </div>
        </div>
      </Transition>

      <!-- Submit confirm overlay -->
      <Transition name="warning-fade">
        <div v-if="showSubmitConfirm" class="warning-overlay">
          <div class="warning-card">
            <div class="warning-title">SUBMIT EXAM?</div>
            <div class="submit-summary">
              <span class="ss-item">{{ answeredCount }} answered</span>
              <span class="ss-sep">·</span>
              <span class="ss-item skip">{{ questions.length - answeredCount }} unanswered</span>
            </div>
            <div class="confirm-btns">
              <button class="iso-btn--fill confirm-btn" @click="confirmSubmit">
                SUBMIT NOW
              </button>
              <button class="iso-btn--ghost confirm-btn" @click="showSubmitConfirm = false">
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </Transition>

    </template>

    <!-- ── FINISHED STATE ──────────────────────────────────── -->
    <template v-else-if="examState === 'finished'">
      <template v-if="!showReview">
        <div class="finished-header">
          <div class="finished-label">[ EXAM COMPLETE ]</div>
          <h1 class="finished-title">RESULTS</h1>
        </div>
        <DashboardExamResults
          :score="score"
          :time-taken="timeTaken"
          :format-time="formatTime"
          @review="showReview = true"
          @retry="resetExam"
        />
      </template>

      <template v-else>
        <DashboardExamReview
          :results="results"
          @back="showReview = false"
        />
      </template>
    </template>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const {
  examState,
  selectedStream,
  selectedSubject,
  questionCount,
  questions,
  answers,
  statuses,
  showWarning,
  results,
  timeTaken,
  loading,
  error,
  streamOptions,
  subjectOptions,
  availableQuestionCounts,
  answeredCount,
  score,
  timerDisplay,
  timerWarning,
  timerDanger,
  timerProgress,
  loadQuestions,
  startExam,
  submitExam,
  resetExam,
  dismissWarning,
  formatTime,
} = useMockExam()

const { selectAnswer: _selectAnswer, goToQuestion } = useMockExam()

// Scroll layout: selectAnswer now takes (questionIndex, optionIndex)
function selectAnswer(questionIndex: number, optionIndex: number) {
  // Temporarily set currentIndex then answer — composable uses currentIndex internally
  goToQuestion(questionIndex)
  _selectAnswer(optionIndex)
}

function statusClass(i: number) {
  const s = statuses.value[i]
  return s === 'answered' ? 'answered' : 'unanswered'
}

const showSubmitConfirm = ref(false)
const showReview = ref(false)

const subjectLabel = computed(
  () => subjectOptions.value.find((s) => s.key === selectedSubject.value)?.label ?? ''
)

function confirmSubmit() {
  showSubmitConfirm.value = false
  submitExam()
}

onMounted(() => {
  loadQuestions()
})

// Cleanup timer if user navigates away
onUnmounted(() => {
  const { resetExam: cleanup } = useMockExam()
  // Only stop timer, keep state for back navigation
})
</script>

<style scoped>
.mock-exam-page {
  padding: 2rem;
  min-height: 100%;
  position: relative;
}

/* ── Top Bar ─────────────────────────────────────────────── */
.exam-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1.5rem;
  border: 1px solid var(--border-bright);
  margin-bottom: 1px;
  gap: 1rem;
  flex-wrap: wrap;
  background: var(--black);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
}

.topbar-stream { font-weight: 700; color: var(--white); }
.topbar-sep    { color: var(--gray); }
.topbar-subject{ color: var(--dim); }

.topbar-center { display: flex; justify-content: center; }

.topbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-pill {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--dim);
}

.pill-answered { font-size: 1rem; font-weight: 700; color: var(--white); }
.pill-sep      { color: var(--gray); }
.pill-total    { color: var(--gray); }
.pill-label    { font-size: 0.6rem; letter-spacing: 0.1em; color: var(--gray); margin-left: 0.2rem; }

.submit-btn {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  padding: 0.5rem 1.25rem;
  cursor: pointer;
  border: 1px solid var(--border-bright);
  background: transparent;
  color: var(--white);
  transition: all 0.15s;
}

.submit-btn:hover {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}

/* ── Exam Layout ─────────────────────────────────────────── */
.exam-layout {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 1px;
  background: var(--border-bright);
  border: 1px solid var(--border-bright);
  border-top: none;
  align-items: start;
}

.exam-main {
  background: var(--black);
  display: flex;
  flex-direction: column;
}

.question-block {
  padding: 2.5rem;
  border-bottom: 1px solid var(--border);
}

.question-block:last-child { border-bottom: none; }

.exam-sidebar {
  background: var(--black);
  padding: 1.5rem;
  position: sticky;
  top: 0;
}

.sidebar-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  color: var(--gray);
  margin-bottom: 1rem;
}

/* Question grid */
.nav-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 1.25rem;
}

.nav-cell {
  width: 26px;
  height: 26px;
  border: 1px solid var(--border-bright);
  font-family: var(--font-mono);
  font-size: 0.58rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: var(--dim);
  transition: all 0.1s;
}

.nav-cell:hover { border-color: var(--white); color: var(--white); }

/* answered = white fill, black text */
.nav-cell.answered {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}

/* Legend */
.nav-legend {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  color: var(--gray);
}

.legend-dot {
  width: 8px;
  height: 8px;
  border: 1px solid var(--border-bright);
  flex-shrink: 0;
}

.legend-item.answered .legend-dot {
  background: var(--white);
  border-color: var(--white);
}

/* Progress bar */
.sidebar-progress {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.sp-bar-track {
  height: 4px;
  border: 1px solid var(--border-bright);
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.sp-bar-fill {
  height: 100%;
  background: var(--white);
  transition: width 0.3s ease;
}

.sp-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: var(--gray);
}

/* ── Warning / Confirm Overlays ──────────────────────────── */
.warning-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 8, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.warning-card {
  background: var(--black);
  border: 1px solid var(--border-bright);
  padding: 3rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
}

.warning-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.warning-title {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--white);
  margin-bottom: 0.75rem;
}

.warning-text {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  color: var(--dim);
  margin-bottom: 2rem;
  line-height: 1.5;
}

.warning-dismiss {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 0.75rem 2rem;
  cursor: pointer;
  background: var(--white);
  color: var(--black);
  border: none;
}

/* Submit confirm */
.submit-summary {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--dim);
}

.ss-item.skip { color: var(--gray); }
.ss-sep       { color: var(--gray); }

.confirm-btns {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.confirm-btn {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 0.7rem 1.5rem;
  cursor: pointer;
  border: 1px solid var(--border-bright);
  background: transparent;
  color: var(--white);
  transition: all 0.15s;
}

.confirm-btn:hover {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}

/* ── Finished Header ─────────────────────────────────────── */
.finished-header { margin-bottom: 2rem; }

.finished-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--gray);
  margin-bottom: 0.4rem;
}

.finished-title {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--white);
  margin: 0;
}

/* ── Transitions ─────────────────────────────────────────── */
.warning-fade-enter-active,
.warning-fade-leave-active { transition: opacity 0.2s ease; }
.warning-fade-enter-from,
.warning-fade-leave-to     { opacity: 0; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .mock-exam-page { padding: 1rem; }

  .exam-layout { grid-template-columns: 1fr; }

  .exam-sidebar {
    position: static;
    border-top: 1px solid var(--border);
    order: -1;
  }

  .exam-topbar {
    padding: 0.75rem 1rem;
    position: sticky;
    top: 0;
    z-index: 50;
    background: var(--black);
  }

  .question-block { padding: 1.5rem; }
}
</style>
