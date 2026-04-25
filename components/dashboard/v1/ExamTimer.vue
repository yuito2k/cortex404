<template>
  <div class="exam-timer" :class="{ warning: timerWarning, danger: timerDanger }">
    <!-- Progress ring -->
    <div class="timer-ring-wrap">
      <svg class="timer-ring" viewBox="0 0 56 56" fill="none">
        <circle class="ring-track" cx="28" cy="28" r="24" stroke-width="2" />
        <circle
          class="ring-progress"
          cx="28" cy="28" r="24"
          stroke-width="2"
          stroke-linecap="square"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <div class="timer-inner">
        <span class="timer-display">{{ display }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  display: string
  timerWarning: boolean
  timerDanger: boolean
  timerProgress: number // 0–100
}>()

const circumference = 2 * Math.PI * 24 // ≈ 150.8
const dashOffset = computed(() => circumference * (1 - props.timerProgress / 100))
</script>

<style scoped>
.exam-timer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timer-ring-wrap {
  position: relative;
  width: 56px;
  height: 56px;
}

.timer-ring {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-track {
  stroke: currentColor;
  opacity: 0.15;
}

.ring-progress {
  stroke: currentColor;
  stroke-dasharray: 150.8;
  transition: stroke-dashoffset 1s linear;
}

.timer-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-display {
  font-family: 'Space Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
}

/* Warning state */
.exam-timer.warning .ring-progress {
  animation: blink-stroke 1s ease-in-out infinite;
}

.exam-timer.danger .ring-progress {
  animation: blink-stroke 0.4s ease-in-out infinite;
}

@keyframes blink-stroke {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
