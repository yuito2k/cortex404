<template>
  <div class="exam-question">
    <!-- Question header -->
    <div class="question-header">
      <span class="question-num">Q{{ index + 1 }}<span v-if="total"> / {{ total }}</span></span>
      <span class="question-id">{{ question.id }}</span>
    </div>

    <!-- Question text -->
    <div class="question-text">{{ question.text }}</div>

    <!-- Options -->
    <div class="options-list">
      <button
        v-for="(option, i) in question.options"
        :key="i"
        class="option-item"
        :class="{
          selected: selectedAnswer === i,
          correct: showResult && i === question.correct,
          wrong: showResult && selectedAnswer === i && i !== question.correct,
        }"
        :disabled="showResult"
        @click="$emit('select', i)"
      >
        <span class="option-letter">{{ letters[i] }}</span>
        <span class="option-text">{{ option }}</span>
        <span v-if="showResult && i === question.correct" class="result-icon correct-icon">✓</span>
        <span v-else-if="showResult && selectedAnswer === i && i !== question.correct" class="result-icon wrong-icon">✗</span>
      </button>
    </div>

    <!-- Explanation (shown in review mode) -->
    <div v-if="showResult && question.explanation" class="question-explanation">
      <span class="explanation-label">[ EXPLANATION ]</span>
      <p class="explanation-text">{{ question.explanation }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '~/composables/useMockExam'

defineProps<{
  question: Question
  index: number
  total?: number
  selectedAnswer: number | null
  showResult?: boolean
}>()

defineEmits<{ select: [index: number] }>()

const letters = ['A', 'B', 'C', 'D']
</script>

<style scoped>
.exam-question { padding: 0; }

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
}

.question-num {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.15em;
  color: var(--gray);
}

.question-id {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--gray);
  opacity: 0.5;
}

.question-text {
  font-family: var(--font-sans);
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  line-height: 1.6;
  font-weight: 500;
  color: var(--white);
  margin-bottom: 2rem;
  letter-spacing: -0.01em;
}

/* ── Options ── */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1.25rem;
  border: 1px solid var(--border-bright);
  background: transparent;
  cursor: pointer;
  color: var(--dim);
  text-align: left;
  transition: all 0.12s ease;
  position: relative;
}

.option-item:not(:disabled):hover {
  border-color: var(--white);
  color: var(--white);
}

/* selected = white fill, black text — matches iso-btn--fill */
.option-item.selected {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}

/* result states (review mode) */
.option-item.correct {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.5);
  color: var(--white);
}

.option-item.wrong {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.45);
  color: var(--white);
}

.option-letter {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  width: 1.5rem;
  flex-shrink: 0;
}

.option-item.selected .option-letter { color: var(--black); }

.option-text {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 1.4;
  flex: 1;
}

.result-icon {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  margin-left: auto;
  flex-shrink: 0;
}

.correct-icon { color: rgba(34, 197, 94, 0.9); }
.wrong-icon   { color: rgba(239, 68, 68, 0.85); }

/* ── Explanation ── */
.question-explanation {
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid var(--border);
  border-style: dashed;
}

.explanation-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--gray);
  display: block;
  margin-bottom: 0.6rem;
}

.explanation-text {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--dim);
  margin: 0;
}
</style>
