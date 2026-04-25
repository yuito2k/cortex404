<template>
  <div class="exam-results">
    <!-- Grade hero -->
    <div class="results-hero">
      <div class="grade-display">
        <span class="grade-label">GRADE</span>
        <span class="grade-value" :class="gradeClass">{{ score.grade }}</span>
      </div>
      <div class="percentage-display">
        <span class="percentage-value">{{ score.percentage }}</span>
        <span class="percentage-sym">%</span>
      </div>
    </div>

    <!-- Stats row -->
    <div class="results-stats">
      <div class="stat-block correct">
        <span class="stat-num">{{ score.correct }}</span>
        <span class="stat-label">CORRECT</span>
      </div>
      <div class="stat-sep">|</div>
      <div class="stat-block wrong">
        <span class="stat-num">{{ score.wrong }}</span>
        <span class="stat-label">WRONG</span>
      </div>
      <div class="stat-sep">|</div>
      <div class="stat-block skipped">
        <span class="stat-num">{{ score.skipped }}</span>
        <span class="stat-label">SKIPPED</span>
      </div>
      <div class="stat-sep">|</div>
      <div class="stat-block time">
        <span class="stat-num">{{ formattedTime }}</span>
        <span class="stat-label">TIME TAKEN</span>
      </div>
    </div>

    <!-- Score bar -->
    <div class="score-bar-wrap">
      <div class="score-bar-track">
        <div
          class="score-bar-fill"
          :class="gradeClass"
          :style="{ width: score.percentage + '%' }"
        />
      </div>
      <div class="score-bar-labels">
        <span class="mono-label">0%</span>
        <span class="mono-label" :class="gradeClass">{{ score.percentage }}%</span>
        <span class="mono-label">100%</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="results-actions">
      <button class="iso-btn--fill action-btn" @click="$emit('review')">
        REVIEW ANSWERS
      </button>
      <button class="iso-btn--ghost action-btn" @click="$emit('retry')">
        TRY AGAIN
      </button>
      <NuxtLink to="/dashboard" class="iso-btn--ghost action-btn link-btn">
        ← DASHBOARD
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ review: []; retry: [] }>()

const props = defineProps<{
  score: { correct: number; wrong: number; skipped: number; percentage: number; grade: string }
  timeTaken: number
  formatTime: (s: number) => string
}>()

const formattedTime = computed(() => props.formatTime(props.timeTaken))

const gradeClass = computed(() => {
  const p = props.score.percentage
  if (p >= 80) return 'grade-a-plus'
  if (p >= 60) return 'grade-b'
  return 'grade-f'
})
</script>

<style scoped>
.exam-results {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 0;
}

/* Hero */
.results-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 2rem;
  border-bottom: 1px solid;
  margin-bottom: 2rem;
}

.grade-display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.grade-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  opacity: 0.4;
}

.grade-value {
  font-family: 'Space Mono', monospace;
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.03em;
}

.percentage-display {
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.percentage-value {
  font-family: 'Space Mono', monospace;
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.04em;
}

.percentage-sym {
  font-family: 'Space Mono', monospace;
  font-size: 1.5rem;
  opacity: 0.5;
}

/* Grade colours (low opacity per brand rules) */
.grade-a-plus { color: rgba(34, 197, 94, 0.9); }
.grade-b { color: rgba(234, 179, 8, 0.9); }
.grade-f { color: rgba(239, 68, 68, 0.85); }

/* Stats */
.results-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.stat-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  flex: 1;
  min-width: 80px;
}

.stat-num {
  font-family: 'Space Mono', monospace;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
}

.stat-block.correct .stat-num { color: rgba(34, 197, 94, 0.85); }
.stat-block.wrong .stat-num { color: rgba(239, 68, 68, 0.8); }
.stat-block.skipped .stat-num { opacity: 0.45; }

.stat-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.15em;
  opacity: 0.45;
}

.stat-sep {
  font-family: 'Space Mono', monospace;
  opacity: 0.2;
  font-size: 1.5rem;
}

/* Score bar */
.score-bar-wrap {
  margin-bottom: 2.5rem;
}

.score-bar-track {
  height: 8px;
  border: 1px solid;
  margin-bottom: 0.5rem;
  position: relative;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  background: currentColor;
  transition: width 1s ease-out;
}

.score-bar-fill.grade-a-plus { background: rgba(34, 197, 94, 0.7); }
.score-bar-fill.grade-b { background: rgba(234, 179, 8, 0.7); }
.score-bar-fill.grade-f { background: rgba(239, 68, 68, 0.65); }

.score-bar-labels {
  display: flex;
  justify-content: space-between;
}

.mono-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  opacity: 0.45;
}

/* Actions */
.results-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  font-family: 'Space Mono', monospace;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  transition: all 0.15s;
}

.link-btn {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
</style>
