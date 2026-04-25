<template>
  <div class="exam-setup">
    <!-- Header -->
    <div class="setup-header">
      <div class="setup-label">[ CONFIGURE EXAM ]</div>
      <h1 class="setup-title">MOCK EXAM</h1>
      <p class="setup-subtitle">Select your stream, subject, and question count to begin.</p>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="setup-loading">
      <span class="loading-dot" />
      <span class="loading-dot" />
      <span class="loading-dot" />
      <span class="loading-text">LOADING QUESTION BANK...</span>
    </div>

    <div v-else-if="error" class="setup-error">
      <span class="mono-label">[ ERROR ]</span> {{ error }}
    </div>

    <template v-else>
      <!-- Grid -->
      <div class="setup-grid">

        <!-- Stream -->
        <div class="setup-card">
          <div class="card-label">01 — STREAM</div>
          <div class="option-list">
            <button
              v-for="s in streamOptions"
              :key="s.key"
              class="option-btn"
              :class="{ active: selectedStream === s.key }"
              @click="setStream(s.key)"
            >
              <span class="option-indicator" />
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Subject -->
        <div class="setup-card">
          <div class="card-label">02 — SUBJECT</div>
          <div class="option-list">
            <button
              v-for="sub in subjectOptions"
              :key="sub.key"
              class="option-btn"
              :class="{ active: selectedSubject === sub.key }"
              @click="setSubject(sub.key)"
            >
              <span class="option-indicator" />
              {{ sub.label }}
            </button>
          </div>
        </div>

        <!-- Count + Time -->
        <div class="setup-card">
          <div class="card-label">03 — QUESTIONS</div>
          <div class="count-options">
            <button
              v-for="n in availableQuestionCounts"
              :key="n"
              class="count-btn"
              :class="{ active: questionCount === n }"
              @click="setQuestionCount(n)"
            >
              <span class="count-number">{{ n }}</span>
              <span class="count-time">{{ n }} MIN</span>
            </button>
          </div>
          <div class="time-calc">
            <span class="mono-label">TOTAL TIME →</span>
            <span class="time-value">{{ questionCount }} MIN</span>
          </div>
        </div>

      </div>

      <!-- Summary + CTA -->
      <div class="setup-footer">
        <div class="setup-summary">
          <div class="summary-item">
            <span class="summary-label">STREAM</span>
            <span class="summary-value">{{ selectedStream || '—' }}</span>
          </div>
          <div class="summary-sep">×</div>
          <div class="summary-item">
            <span class="summary-label">SUBJECT</span>
            <span class="summary-value">{{ subjectLabel || '—' }}</span>
          </div>
          <div class="summary-sep">×</div>
          <div class="summary-item">
            <span class="summary-label">QUESTIONS</span>
            <span class="summary-value">{{ questionCount }}</span>
          </div>
        </div>

        <button
          class="iso-btn--fill start-btn"
          :disabled="!selectedStream || !selectedSubject"
          @click="$emit('start')"
        >
          <span>START EXAM</span>
          <span class="btn-arrow">→</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  streamOptions: { key: string; label: string }[]
  subjectOptions: { key: string; label: string }[]
  availableQuestionCounts: number[]
  selectedStream: string
  selectedSubject: string
  questionCount: number
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  start: []
}>()

const { setStream, setSubject, setQuestionCount } = useMockExam()

const subjectLabel = computed(
  () => props.subjectOptions.find((s) => s.key === props.selectedSubject)?.label ?? ''
)
</script>

<style scoped>
.exam-setup {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 0;
}

.setup-header { margin-bottom: 3rem; }

.setup-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: var(--gray);
  margin-bottom: 0.5rem;
}

.setup-title {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1;
  margin: 0 0 0.75rem;
  color: var(--white);
}

.setup-subtitle {
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--dim);
  margin: 0;
}

/* ── Loading ── */
.setup-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 3rem 0;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--white);
}

.loading-dot {
  display: block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--white);
  flex-shrink: 0;
  animation: dotPulse 1.2s ease-in-out infinite;
}
.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

.loading-text { margin-left: 4px; color: var(--dim); }

@keyframes dotPulse {
  0%, 100% { opacity: 0.25; transform: scale(0.75); }
  50%       { opacity: 1;    transform: scale(1.15); }
}

.setup-error {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  padding: 1.5rem;
  border: 1px solid var(--border-bright);
  color: var(--white);
  opacity: 0.8;
}

/* ── Grid ── */
.setup-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1px;
  background: var(--border-bright);
  border: 1px solid var(--border-bright);
  margin-bottom: 1px;
}

.setup-card {
  background: var(--black);
  padding: 2rem;
}

.card-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--gray);
  margin-bottom: 1.25rem;
}

/* ── Stream / Subject options ── */
.option-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  text-align: left;
  transition: all 0.15s ease;
  color: var(--dim);
}

.option-btn:hover {
  border-color: var(--border-bright);
  color: var(--white);
}

/* active = white bg, black text (like iso-btn--fill) */
.option-btn.active {
  border-color: var(--white);
  background: var(--white);
  color: var(--black);
}

.option-indicator {
  width: 8px;
  height: 8px;
  border: 1px solid currentColor;
  border-radius: 50%;
  flex-shrink: 0;
  transition: background 0.15s;
}

.option-btn.active .option-indicator {
  background: var(--black);
  border-color: var(--black);
}

/* ── Count buttons ── */
.count-options {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.count-btn {
  flex: 1;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--border-bright);
  background: transparent;
  cursor: pointer;
  color: var(--dim);
  transition: all 0.15s;
}

.count-btn:hover {
  border-color: var(--white);
  color: var(--white);
}

/* active = white bg, black text */
.count-btn.active {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}

.count-number {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}

.count-time {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  opacity: 0.7;
}

.time-calc {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
  color: var(--dim);
}

.mono-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
}

.time-value {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--white);
}

/* ── Footer ── */
.setup-footer {
  border: 1px solid var(--border-bright);
  border-top: none;
  padding: 1.75rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  background: var(--black);
}

.setup-summary {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.summary-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  color: var(--gray);
}

.summary-value {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--white);
}

.summary-sep {
  font-family: var(--font-mono);
  color: var(--gray);
  font-size: 1rem;
  margin-top: 0.5rem;
}

/* ── Start button (extends iso-btn--fill from global.css) ── */
.start-btn {
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  padding: 0.85rem 2rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  cursor: pointer;
  white-space: nowrap;
}

.btn-arrow { font-size: 1rem; }
</style>
