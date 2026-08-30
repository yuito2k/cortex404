<template>
  <div class="stats-row">
    <div v-for="(stat, i) in stats" :key="stat.label" class="stat-card" :style="{ animationDelay: i * 0.08 + 's' }">
      <div class="stat-card-top">
        <span class="stat-icon" v-html="stat.icon" />
        <span class="stat-delta" :class="stat.trend">
          {{ stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '–' }}
          {{ stat.delta }}
        </span>
      </div>
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-label">{{ stat.label }}</div>
      <!-- Mini bar -->
      <div class="stat-bar-wrap">
        <div class="stat-bar-fill" :style="{ width: stat.percent + '%' }" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    label: string
    value: string
    delta: string
    trend: 'up' | 'down' | 'flat'
    percent: number
    icon: string
  }[]
}>()
</script>

<style scoped>
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  /* iso card shadow */
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.stat-card {
  background: #0d0d0d;
  padding: 1.6rem 1.8rem;
  display: flex; flex-direction: column; gap: 6px;
  animation: fadeSlideUp 0.4s ease both;
  transition: background 0.2s;
}
.stat-card:hover { background: #111; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-card-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 6px;
}

.stat-icon { color: var(--gray); }
.stat-icon :deep(svg) { width: 18px; height: 18px; }

.stat-delta {
  font-family: var(--font-mono);
  font-size: 0.6rem; letter-spacing: 0.06em;
  padding: 2px 6px;
  border: 1px solid var(--border);
}
.stat-delta.up   { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.2); }
.stat-delta.down { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.2); }
.stat-delta.flat { color: var(--gray); }

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.9rem; font-weight: 700;
  color: var(--white); letter-spacing: -1px;
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem; color: var(--gray);
  text-transform: uppercase; letter-spacing: 0.1em;
}

.stat-bar-wrap {
  height: 1px; background: var(--border);
  margin-top: 10px;
}
.stat-bar-fill {
  height: 100%; background: rgba(240,240,234,0.4);
  transition: width 1s ease;
}

@media (max-width: 900px) { .stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .stats-row { grid-template-columns: 1fr; } }
</style>
