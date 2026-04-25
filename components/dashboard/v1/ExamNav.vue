<template>
  <div class="exam-nav">
    <!-- Question grid -->
    <div class="nav-grid-wrap">
      <div class="nav-label">QUESTIONS</div>
      <div class="nav-grid">
        <button
          v-for="(_, i) in total"
          :key="i"
          class="nav-cell"
          :class="[statusClass(i), { current: i === currentIndex }]"
          @click="$emit('goto', i)"
          :title="`Q${i + 1}: ${statuses[i]}`"
        >
          {{ i + 1 }}
        </button>
      </div>
    </div>

    <!-- Legend -->
    <div class="nav-legend">
      <span class="legend-item unanswered"><span class="legend-dot" />Unanswered</span>
      <span class="legend-item answered"><span class="legend-dot" />Answered</span>
      <span class="legend-item marked"><span class="legend-dot" />Marked</span>
      <span class="legend-item skipped"><span class="legend-dot" />Skipped</span>
    </div>

    <!-- Prev / Next -->
    <div class="nav-controls">
      <button
        class="iso-btn--ghost nav-btn"
        :disabled="currentIndex === 0"
        @click="$emit('prev')"
      >
        ← PREV
      </button>

      <div class="nav-counter">
        <span class="counter-current">{{ currentIndex + 1 }}</span>
        <span class="counter-sep">/</span>
        <span class="counter-total">{{ total }}</span>
      </div>

      <button
        class="iso-btn--ghost nav-btn"
        :disabled="currentIndex === total - 1"
        @click="$emit('next')"
      >
        NEXT →
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { QuestionStatus } from '~/composables/useMockExam'

const props = defineProps<{
  total: number
  currentIndex: number
  statuses: QuestionStatus[]
}>()

defineEmits<{
  prev: []
  next: []
  goto: [index: number]
}>()

function statusClass(i: number) {
  return props.statuses[i] ?? 'unanswered'
}
</script>

<style scoped>
.exam-nav {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Grid */
.nav-grid-wrap {}

.nav-label {
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.2em;
  opacity: 0.4;
  margin-bottom: 0.75rem;
}

.nav-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.nav-cell {
  width: 28px;
  height: 28px;
  border: 1px solid currentColor;
  background: transparent;
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  font-weight: 700;
  cursor: pointer;
  color: inherit;
  opacity: 0.4;
  transition: all 0.1s;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.nav-cell:hover {
  opacity: 0.9;
}

.nav-cell.current {
  border-width: 2px;
  opacity: 1;
}

/* Status colours */
.nav-cell.answered {
  background: rgba(8, 8, 8, 0.85);
  color: #f0f0ea;
  opacity: 1;
  border-color: rgba(8, 8, 8, 0.85);
}

.nav-cell.marked {
  background: transparent;
  border-style: dashed;
  border-color: currentColor;
  opacity: 0.85;
}

.nav-cell.skipped {
  opacity: 0.25;
}

.nav-cell.unanswered {
  opacity: 0.4;
}

/* Legend */
.nav-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: 'Space Mono', monospace;
  font-size: 0.6rem;
  letter-spacing: 0.05em;
  opacity: 0.55;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border: 1px solid currentColor;
}

.legend-item.answered .legend-dot {
  background: rgba(8, 8, 8, 0.8);
}

.legend-item.marked .legend-dot {
  border-style: dashed;
}

.legend-item.skipped .legend-dot {
  opacity: 0.3;
}

/* Controls */
.nav-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid;
  border-color: currentColor;
  opacity: 1;
}

.nav-btn {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  padding: 0.5rem 0.875rem;
  cursor: pointer;
  border: 1px solid currentColor;
  background: transparent;
  color: inherit;
  transition: all 0.15s;
}

.nav-btn:hover:not(:disabled) {
  background: currentColor;
  color: var(--color-bg, #f0f0ea);
}

.nav-btn:disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

.nav-counter {
  font-family: 'Space Mono', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  display: flex;
  align-items: baseline;
  gap: 0.2rem;
}

.counter-current {
  font-size: 1.1rem;
  font-weight: 700;
}

.counter-sep {
  opacity: 0.3;
}

.counter-total {
  opacity: 0.5;
}
</style>
