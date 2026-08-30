<template>
  <div class="mod-quick-actions">
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
    emit: 'viewreports',
    label: 'Open Reports',
    desc: 'Resolve & dismiss reports',
    color: 'red',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  },
  {
    emit: 'viewqueue',
    label: 'Review Queue',
    desc: 'Approve submitted questions',
    color: 'amber',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  },
  {
    emit: 'viewusers',
    label: 'User Warnings',
    desc: 'Warn & watch users',
    color: 'amber',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>`,
  },
  {
    emit: 'viewdiscussions',
    label: 'Discussions',
    desc: 'Lock & clear flagged threads',
    color: 'neutral',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  },
  {
    emit: 'viewactivity',
    label: 'Mod Activity',
    desc: 'Your full audit trail',
    color: 'neutral',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    emit: 'escalate',
    label: 'Escalate to Admin',
    desc: 'Flag an issue for admin',
    color: 'neutral',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  },
  {
    emit: 'submitquestion',
    label: 'Submit Question',
    desc: 'Add to review queue',
    color: 'amber',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`,
  },
]
</script>

<style scoped>
.mod-quick-actions {
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

.actions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1px; background: var(--border); }

.action-card {
  background: var(--black); border: none; cursor: pointer;
  transition: background 0.15s; text-align: left;
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
.icon-red    { border-color: rgba(255,100,100,0.3); color: rgba(255,100,100,0.8); }
.icon-amber  { border-color: rgba(255,200,80,0.3);  color: rgba(255,200,80,0.8); }
.icon-neutral{ border-color: var(--border-bright);  color: var(--white); }

.action-text { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.action-label {
  font-family: var(--font-mono);
  font-size: 0.72rem; font-weight: 700; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.action-desc { font-size: 0.67rem; color: var(--gray); }

.action-arrow {
  font-family: var(--font-mono); color: var(--gray);
  font-size: 0.85rem; transition: transform 0.2s; flex-shrink: 0;
}

@media (max-width: 900px) {
  .action-inner { padding: 0.8rem 1rem; gap: 10px; }
}
@media (max-width: 600px) {
  .action-icon  { width: 30px; height: 30px; }
  .action-label { font-size: 0.7rem; }
  .action-desc  { font-size: 0.63rem; }
}
@media (max-width: 400px) {
  .action-arrow { display: none; }
  .action-inner { padding: 0.75rem; }
}
</style>
