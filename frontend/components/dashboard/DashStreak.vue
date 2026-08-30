<template>
  <div class="streak-panel">
    <div class="panel-header">
      <span class="panel-tag">Study Streak</span>
      <div class="streak-count-badge">
        <span class="flame">🔥</span>
        <span class="streak-days">{{ currentStreak }} days</span>
      </div>
    </div>

    <div class="heatmap-wrap">
      <div class="heatmap-grid">
        <div
          v-for="(day, i) in calendarDays"
          :key="i"
          class="heatmap-cell"
          :class="cellClass(day.count)"
          :title="`${day.date}: ${day.count} questions`"
        />
      </div>
      <div class="heatmap-legend">
        <span class="legend-label">Less</span>
        <div class="legend-cell level-0" />
        <div class="legend-cell level-1" />
        <div class="legend-cell level-2" />
        <div class="legend-cell level-3" />
        <div class="legend-cell level-4" />
        <span class="legend-label">More</span>
      </div>
    </div>

    <div class="streak-stats">
      <div class="sstat">
        <span class="sstat-n">{{ currentStreak }}</span>
        <span class="sstat-l">Current</span>
      </div>
      <div class="sstat-divider" />
      <div class="sstat">
        <span class="sstat-n">{{ longestStreak }}</span>
        <span class="sstat-l">Best</span>
      </div>
      <div class="sstat-divider" />
      <div class="sstat">
        <span class="sstat-n">{{ totalDays }}</span>
        <span class="sstat-l">Total Days</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  currentStreak: number
  longestStreak: number
  totalDays: number
  activityData: Record<string, number> // { 'YYYY-MM-DD': questionCount }
}>()

// Build last 84 days (12 weeks × 7)
const calendarDays = computed(() => {
  const days = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: props.activityData[key] ?? 0 })
  }
  return days
})

function cellClass(count: number) {
  if (count === 0) return 'level-0'
  if (count < 10)  return 'level-1'
  if (count < 25)  return 'level-2'
  if (count < 50)  return 'level-3'
  return 'level-4'
}
</script>

<style scoped>
.streak-panel {
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.panel-header {
  padding: 1rem 1.4rem;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gray);
}
.streak-count-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 4px 12px; border: 1px solid var(--border-bright);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.06);
}
.flame { font-size: 0.85rem; }
.streak-days {
  font-family: var(--font-mono);
  font-size: 0.75rem; font-weight: 700; color: var(--white);
}

.heatmap-wrap { padding: 1.2rem 1.4rem; }

.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  gap: 3px;
  margin-bottom: 10px;
}

.heatmap-cell {
  width: 12px; height: 12px;
  border: 1px solid rgba(240,240,234,0.06);
  transition: transform 0.15s;
  cursor: default;
}
.heatmap-cell:hover { transform: scale(1.3); }

.level-0 { background: #111; }
.level-1 { background: rgba(240,240,234,0.12); }
.level-2 { background: rgba(240,240,234,0.28); }
.level-3 { background: rgba(240,240,234,0.55); }
.level-4 { background: rgba(240,240,234,0.9); }

.heatmap-legend {
  display: flex; align-items: center; gap: 4px;
  justify-content: flex-end;
}
.legend-label { font-size: 0.6rem; color: var(--gray); }
.legend-cell { width: 10px; height: 10px; border: 1px solid rgba(240,240,234,0.06); }

.streak-stats {
  display: flex; align-items: center;
  border-top: 1px solid var(--border);
  padding: 1rem 1.4rem;
  gap: 0;
}
.sstat {
  flex: 1; display: flex; flex-direction: column; gap: 3px; align-items: center;
}
.sstat-n {
  font-family: var(--font-mono);
  font-size: 1.3rem; font-weight: 700; color: var(--white);
}
.sstat-l {
  font-size: 0.62rem; color: var(--gray);
  text-transform: uppercase; letter-spacing: 0.1em;
}
.sstat-divider { width: 1px; height: 36px; background: var(--border); }
</style>
