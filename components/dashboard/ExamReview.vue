<template>
  <div class="exam-review">
    <div class="review-header">
      <div class="review-label">[ ANSWER REVIEW ]</div>
      <h2 class="review-title">{{ results.length }} QUESTIONS</h2>
      <div class="review-meta">
        <span class="meta-item correct-meta">{{ correctCount }} CORRECT</span>
        <span class="meta-sep">·</span>
        <span class="meta-item wrong-meta">{{ wrongCount }} WRONG</span>
        <span class="meta-sep">·</span>
        <span class="meta-item skip-meta">{{ skipCount }} SKIPPED</span>
      </div>
    </div>

    <div class="review-list">
      <div
        v-for="(result, i) in results"
        :key="result.question.id"
        class="review-item"
        :class="{
          'item-correct': result.isCorrect,
          'item-wrong': !result.isCorrect && result.selectedAnswer !== null,
          'item-skipped': result.selectedAnswer === null,
        }"
      >
        <!-- Item header -->
        <div class="item-header">
          <span class="item-num">Q{{ i + 1 }}</span>
          <span class="item-status">
            <span v-if="result.isCorrect" class="status-correct">✓ CORRECT</span>
            <span v-else-if="result.selectedAnswer === null" class="status-skipped">— SKIPPED</span>
            <span v-else class="status-wrong">✗ WRONG</span>
          </span>
        </div>

        <!-- Question text -->
        <p class="item-question">{{ result.question.text }}</p>

        <!-- Options summary -->
        <div class="item-options">
          <div
            v-for="(option, oi) in result.question.options"
            :key="oi"
            class="review-option"
            :class="{
              'opt-correct': oi === result.question.correct,
              'opt-selected-wrong': result.selectedAnswer === oi && oi !== result.question.correct,
            }"
          >
            <span class="opt-letter">{{ letters[oi] }}</span>
            <span class="opt-text">{{ option }}</span>
            <span v-if="oi === result.question.correct" class="opt-tag">CORRECT</span>
            <span v-else-if="result.selectedAnswer === oi && oi !== result.question.correct" class="opt-tag wrong-tag">YOUR ANSWER</span>
          </div>
        </div>

        <!-- Explanation -->
        <div v-if="result.question.explanation" class="item-explanation">
          <span class="exp-label">EXPLANATION —</span>
          {{ result.question.explanation }}
        </div>
      </div>
    </div>

    <!-- Back button -->
    <div class="review-footer">
      <button class="iso-btn--ghost back-btn" @click="$emit('back')">
        ← BACK TO RESULTS
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuestionResult } from '~/composables/useMockExam'

const props = defineProps<{
  results: QuestionResult[]
}>()

defineEmits<{ back: [] }>()

const letters = ['A', 'B', 'C', 'D']

const correctCount = computed(() => props.results.filter((r) => r.isCorrect).length)
const wrongCount = computed(() => props.results.filter((r) => !r.isCorrect && r.selectedAnswer !== null).length)
const skipCount = computed(() => props.results.filter((r) => r.selectedAnswer === null).length)
</script>

<style scoped>
.exam-review {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 0;
}

.review-header { margin-bottom: 2.5rem; }

.review-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.2em;
  color: var(--gray);
  margin-bottom: 0.4rem;
}

.review-title {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 0.75rem;
  letter-spacing: -0.02em;
}

.review-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.08em;
}

.correct-meta { color: rgba(34, 197, 94, 0.85); }
.wrong-meta   { color: rgba(239, 68, 68, 0.8); }
.skip-meta    { color: var(--gray); }
.meta-sep     { color: var(--gray); }

/* Review list */
.review-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--border-bright);
  border: 1px solid var(--border-bright);
  margin-bottom: 2rem;
}

.review-item {
  padding: 1.5rem 1.75rem;
  border-left: 3px solid transparent;
  background: var(--black);
  color: var(--white);
}

.item-correct  { border-left-color: rgba(34, 197, 94, 0.5); }
.item-wrong    { border-left-color: rgba(239, 68, 68, 0.45); }
.item-skipped  { border-left-color: transparent; opacity: 0.5; }

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.item-num {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  color: var(--gray);
}

.item-status {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  font-weight: 700;
}

.status-correct { color: rgba(34, 197, 94, 0.85); }
.status-wrong   { color: rgba(239, 68, 68, 0.8); }
.status-skipped { color: var(--gray); }

.item-question {
  font-family: var(--font-sans);
  font-size: 0.95rem;
  line-height: 1.55;
  font-weight: 500;
  color: var(--white);
  margin: 0 0 1rem;
}

/* Options in review */
.item-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 1rem;
}

.review-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--dim);
}

.review-option.opt-correct {
  border-color: rgba(34, 197, 94, 0.4);
  background: rgba(34, 197, 94, 0.07);
  color: var(--white);
}

.review-option.opt-selected-wrong {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.06);
  color: var(--dim);
  text-decoration: line-through;
  text-decoration-color: rgba(239, 68, 68, 0.5);
}

.opt-letter {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  font-weight: 700;
  width: 1.2rem;
  flex-shrink: 0;
}

.opt-text { flex: 1; }

.opt-tag {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.1em;
  padding: 0.2rem 0.4rem;
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: rgba(34, 197, 94, 0.85);
  white-space: nowrap;
}

.opt-tag.wrong-tag {
  border-color: rgba(239, 68, 68, 0.4);
  color: rgba(239, 68, 68, 0.75);
}

/* Explanation */
.item-explanation {
  font-family: var(--font-sans);
  font-size: 0.82rem;
  line-height: 1.6;
  color: var(--dim);
  padding-top: 0.75rem;
  border-top: 1px dashed var(--border-bright);
}

.exp-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--gray);
  margin-right: 0.5rem;
}

/* Footer */
.review-footer { padding-top: 1rem; }

.back-btn {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  border: 1px solid var(--border-bright);
  background: transparent;
  color: var(--white);
  transition: all 0.15s;
}

.back-btn:hover {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}
</style>


