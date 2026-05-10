<template>
  <div class="mod-stats-row">
    <div
      v-for="(stat, i) in stats"
      :key="stat.label"
      class="stat-card"
      :style="{ animationDelay: i * 0.07 + 's' }"
    >
      <div class="stat-card-top">
        <span class="stat-icon" v-html="stat.icon" />
        <span class="stat-delta" :class="stat.up ? 'up' : 'dn'">
          {{ stat.up ? '↑' : '↓' }} {{ stat.delta }}
        </span>
      </div>
      <div class="stat-value">{{ stat.value }}</div>
      <div class="stat-label">{{ stat.label }}</div>
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
    up: boolean
    percent: number
    icon: string
  }[]
}>()
</script>

<style scoped>
.mod-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.stat-card {
  background: #0d0d0d;
  padding: 1.5rem 1.6rem;
  display: flex; flex-direction: column; gap: 5px;
  animation: fadeSlideUp 0.4s ease both;
  transition: background 0.2s, border-color 0.2s;
  border-left: 2px solid transparent;
}
.stat-card:hover {
  background: #111;
  border-left-color: rgba(255,200,80,0.45);
}

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

.stat-card-top {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 4px;
}

.stat-icon { color: var(--gray); }
.stat-icon :deep(svg) { width: 17px; height: 17px; }

.stat-delta {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.06em; padding: 2px 6px;
  border: 1px solid var(--border);
}
.stat-delta.up { color: rgba(120,230,120,0.85); border-color: rgba(120,230,120,0.2); background: rgba(120,230,120,0.05); }
.stat-delta.dn { color: rgba(255,100,100,0.85); border-color: rgba(255,100,100,0.2); background: rgba(255,100,100,0.05); }

.stat-value {
  font-family: var(--font-mono);
  font-size: 1.8rem; font-weight: 700;
  color: var(--white); letter-spacing: -1px; line-height: 1;
}
.stat-label {
  font-family: var(--font-mono);
  font-size: 0.7rem; color: var(--gray);
  text-transform: uppercase; letter-spacing: 0.1em;
}

/* Amber fill bar — distinguishes from admin's white fill */
.stat-bar-wrap { height: 1px; background: var(--border); margin-top: 12px; }
.stat-bar-fill { height: 100%; background: rgba(255,200,80,0.45); transition: width 1.2s ease; }

@media (max-width: 900px) { .mod-stats-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .mod-stats-row { grid-template-columns: 1fr; } }

@media (max-width: 768px) {
  .stat-card  { padding: 1.2rem; }
  .stat-value { font-size: 1.5rem; }
}
@media (max-width: 480px) {
  .stat-card  { padding: 1rem; }
  .stat-value { font-size: 1.3rem; }
  .stat-label { font-size: 0.65rem; }
}
</style>
