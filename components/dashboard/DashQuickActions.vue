<template>
  <div class="quick-actions">
    <div class="panel-header">
      <span class="panel-tag">Quick Start</span>
    </div>
    <div class="actions-grid">
      <a
        v-for="action in actions"
        :key="action.label"
        :href="action.to"
        class="action-card"
      >
        <!-- Isometric 3D effect via box-shadow -->
        <div class="action-inner">
          <span class="action-icon" v-html="action.icon" />
          <div class="action-text">
            <span class="action-label">{{ action.label }}</span>
            <span class="action-desc">{{ action.desc }}</span>
          </div>
          <span class="action-arrow">→</span>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
const actions = [
  {
    to: '/dashboard/mock-exam',
    label: 'Start Mock Exam',
    desc: 'Timed · Customizable',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    to: '/dashboard/question-bank',
    label: 'Browse Questions',
    desc: '1M+ questions',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
  },
  {
    to: '/dashboard/progress',
    label: 'View Progress',
    desc: 'Analytics & weak spots',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    to: '/dashboard/leaderboard',
    label: 'Leaderboard',
    desc: 'Your national rank',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>`,
  },
]
</script>

<style scoped>
.quick-actions {
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.panel-header {
  padding: 1rem 1.4rem;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center;
}

.panel-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gray);
}

.actions-grid { display: flex; flex-direction: column; }

.action-card {
  text-decoration: none;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.action-card:last-child { border-bottom: none; }
.action-card:hover { background: rgba(240,240,234,0.03); }
.action-card:hover .action-arrow { transform: translateX(3px); }

.action-inner {
  display: flex; align-items: center; gap: 14px;
  padding: 1rem 1.4rem;
}

.action-icon {
  width: 38px; height: 38px;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  color: var(--white); flex-shrink: 0;
  /* isometric depth */
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.08);
}

.action-text {
  flex: 1; display: flex; flex-direction: column; gap: 2px;
}
.action-label {
  font-family: var(--font-mono);
  font-size: 0.78rem; font-weight: 700; color: var(--white);
}
.action-desc { font-size: 0.7rem; color: var(--gray); }

.action-arrow {
  font-family: var(--font-mono);
  color: var(--gray); font-size: 0.9rem;
  transition: transform 0.2s;
}
</style>
