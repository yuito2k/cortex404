<template>
  <div class="admin-quick-actions">
    <div class="panel-header">
      <span class="panel-tag">Quick Actions</span>
    </div>
    <div class="actions-grid">
      <button
        v-for="action in actions"
        :key="action.label"
        class="action-card"
        @click="$emit('action', action.emit)"
      >
        <div class="action-inner">
          <span class="action-icon" :class="'icon-' + action.color" v-html="action.icon" />
          <div class="action-text">
            <span class="action-label">{{ action.label }}</span>
            <span class="action-desc">{{ action.desc }}</span>
          </div>
          <span class="action-arrow">→</span>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ (e: 'action', type: string): void }>()

const actions = [
  {
    emit: 'addQuestion',
    label: 'Add Question',
    desc: 'Publish to question bank',
    color: 'green',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  },
  {
    emit: 'announcement',
    label: 'New Announcement',
    desc: 'Broadcast to all users',
    color: 'yellow',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  },
  {
    emit: 'purgecache',
    label: 'Purge Cache',
    desc: 'Clear CDN & API cache',
    color: 'neutral',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>`,
  },
  {
    emit: 'recalcleaderboard',
    label: 'Recalc Leaderboard',
    desc: 'Run aggregate function',
    color: 'neutral',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
  },
  {
    emit: 'viewusers',
    label: 'Manage Users',
    desc: 'Ban, promote, inspect',
    color: 'neutral',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    emit: 'viewsystem',
    label: 'System Logs',
    desc: 'Errors, warns, info',
    color: 'neutral',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  },
]
</script>

<style scoped>
.admin-quick-actions {
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.panel-header {
  padding: 1rem 1.4rem;
  border-bottom: 1px solid var(--border);
}
.panel-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gray);
}

.actions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }

.action-card {
  text-decoration: none; background: var(--black);
  border: none; cursor: pointer;
  border-bottom: none;
  transition: background 0.15s;
  text-align: left;
}
.action-card:hover { background: rgba(240,240,234,0.03); }
.action-card:hover .action-arrow { transform: translateX(3px); }

.action-inner {
  display: flex; align-items: center; gap: 12px;
  padding: 1rem 1.2rem;
}

.action-icon {
  width: 36px; height: 36px; flex-shrink: 0;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.05);
}
.icon-green  { border-color: rgba(120,230,120,0.3); color: rgba(120,230,120,0.8); }
.icon-yellow { border-color: rgba(255,200,80,0.3);  color: rgba(255,200,80,0.8);  }
.icon-neutral{ border-color: var(--border-bright);  color: var(--white); }

.action-text { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.action-label {
  font-family: var(--font-mono);
  font-size: 0.72rem; font-weight: 700; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.action-desc { font-size: 0.67rem; color: var(--gray); }

.action-arrow {
  font-family: var(--font-mono);
  color: var(--gray); font-size: 0.85rem;
  transition: transform 0.2s; flex-shrink: 0;
}

@media (max-width: 900px) {
  /* 2-col keeps on tablet but tighter */
  .action-inner { padding: 0.8rem 1rem; gap: 10px; }
}

@media (max-width: 600px) {
  /* stack to 1-col */
  .actions-grid { grid-template-columns: 1fr; }
  .action-icon  { width: 30px; height: 30px; }
  .action-label { font-size: 0.7rem; }
  .action-desc  { font-size: 0.63rem; }
}

@media (max-width: 400px) {
  .action-arrow { display: none; }
  .action-inner { padding: 0.75rem; }
}
</style>