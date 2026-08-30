<template>
  <div class="activity-panel">
    <div class="panel-header">
      <span class="panel-tag">Recent Activity</span>
      <a href="/dashboard/progress" class="panel-link">View all →</a>
    </div>

    <div class="activity-list">
      <div v-for="item in activities" :key="item.id" class="activity-item">
        <div class="activity-icon" :class="item.type">
          <span v-html="icons[item.type]" />
        </div>
        <div class="activity-body">
          <span class="activity-title">{{ item.title }}</span>
          <span class="activity-meta">{{ item.subject }} · {{ item.time }}</span>
        </div>
        <div class="activity-score" :class="scoreClass(item.score)">
          {{ item.score }}%
        </div>
      </div>

      <div v-if="!activities.length" class="activity-empty">
        No activity yet. Start your first exam!
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  activities: {
    id: number
    type: 'exam' | 'practice' | 'ai'
    title: string
    subject: string
    time: string
    score: number
  }[]
}>()

const icons: Record<string, string> = {
  exam:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  practice: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
  ai:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M2 12h2M20 12h2M12 2v2M12 20v2"/></svg>`,
}

function scoreClass(score: number) {
  if (score >= 80) return 'high'
  if (score >= 55) return 'mid'
  return 'low'
}
</script>

<style scoped>
.activity-panel {
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
.panel-link {
  font-family: var(--font-mono);
  font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--gray);
  transition: color 0.2s;
}
.panel-link:hover { color: var(--white); }

.activity-list { display: flex; flex-direction: column; }

.activity-item {
  display: flex; align-items: center; gap: 12px;
  padding: 1rem 1.4rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.activity-item:last-child { border-bottom: none; }
.activity-item:hover { background: rgba(240,240,234,0.02); }

.activity-icon {
  width: 30px; height: 30px; flex-shrink: 0;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.activity-icon.exam     { border-color: rgba(240,240,234,0.18); color: var(--white); }
.activity-icon.practice { border-color: var(--border); }
.activity-icon.ai       { border-color: var(--border); }

.activity-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.activity-title {
  font-size: 0.8rem; font-weight: 500; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.activity-meta { font-size: 0.68rem; color: var(--gray); }

.activity-score {
  font-family: var(--font-mono);
  font-size: 0.8rem; font-weight: 700;
  flex-shrink: 0;
}
.activity-score.high { color: rgba(120,230,120,0.9); }
.activity-score.mid  { color: rgba(255,200,80,0.9); }
.activity-score.low  { color: rgba(255,100,100,0.8); }

.activity-empty {
  padding: 2rem 1.4rem;
  text-align: center;
  font-size: 0.8rem; color: var(--gray);
  font-family: var(--font-mono);
}
</style>
