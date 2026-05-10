<template>
  <div class="mod-recent-actions">
    <div class="panel-header">
      <span class="panel-tag">Your Recent Actions</span>
      <div class="header-right">
        <span class="live-dot" />
        <span class="panel-tag" style="opacity:0.45">Live</span>
      </div>
    </div>

    <div class="action-list">
      <div
        v-for="item in actions"
        :key="item.id"
        class="action-item"
        :class="'type-' + item.type"
      >
        <div class="action-icon" :class="'icon-' + item.type">
          <span v-html="typeIcon(item.type)" />
        </div>
        <div class="action-body">
          <span class="action-title">{{ item.title }}</span>
          <span class="action-meta">{{ item.actor }} · {{ item.time }}</span>
        </div>
        <span class="action-badge" :class="'badge-' + item.type">{{ typeLabel(item.type) }}</span>
      </div>

      <div v-if="!actions.length" class="action-empty">
        No actions recorded this session yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  actions: {
    id: number
    type: 'approve' | 'reject' | 'warn' | 'dismiss' | 'flag'
    title: string
    actor: string
    time: string
  }[]
}>()

function typeIcon(type: string) {
  const icons: Record<string, string> = {
    approve: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>`,
    reject:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    warn:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    dismiss: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    flag:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  }
  return icons[type] ?? icons.dismiss
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    approve: 'Approve', reject: 'Reject', warn: 'Warn',
    dismiss: 'Dismiss', flag: 'Escalate',
  }
  return labels[type] ?? type
}
</script>

<style scoped>
.mod-recent-actions {
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  min-width: 0;
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
.header-right { display: flex; align-items: center; gap: 6px; }
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,200,80,0.9);
  box-shadow: 0 0 6px rgba(255,200,80,0.5);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

.action-list { display: flex; flex-direction: column; }

.action-item {
  display: flex; align-items: center; gap: 12px;
  padding: 0.9rem 1.4rem;
  border-bottom: 1px solid var(--border);
  border-left: 2px solid transparent;
  transition: background 0.15s, border-left-color 0.15s;
}
.action-item:last-child { border-bottom: none; }
.action-item:hover { background: rgba(240,240,234,0.02); }
.action-item.type-approve:hover { border-left-color: rgba(120,230,120,0.5); }
.action-item.type-reject:hover  { border-left-color: rgba(255,100,100,0.5); }
.action-item.type-warn:hover    { border-left-color: rgba(255,200,80,0.5);  }
.action-item.type-dismiss:hover { border-left-color: rgba(240,240,234,0.2); }
.action-item.type-flag:hover    { border-left-color: rgba(255,200,80,0.5);  }

.action-icon {
  width: 28px; height: 28px; flex-shrink: 0;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
  color: var(--gray);
}
.icon-approve { border-color: rgba(120,230,120,0.3); color: rgba(120,230,120,0.8); }
.icon-reject  { border-color: rgba(255,100,100,0.3); color: rgba(255,100,100,0.8); }
.icon-warn    { border-color: rgba(255,200,80,0.3);  color: rgba(255,200,80,0.8);  }
.icon-dismiss { border-color: var(--border);          color: var(--gray); }
.icon-flag    { border-color: rgba(255,200,80,0.3);  color: rgba(255,200,80,0.8);  }

.action-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.action-title {
  font-size: 0.8rem; font-weight: 500; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.action-meta { font-size: 0.67rem; color: var(--gray); font-family: var(--font-mono); }

.action-badge {
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 2px 7px; border: 1px solid var(--border);
  flex-shrink: 0; color: var(--gray);
}
.badge-approve { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.25); }
.badge-reject  { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }
.badge-warn    { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25);  }
.badge-flag    { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25);  }

.action-empty {
  padding: 2rem 1.4rem; text-align: center;
  font-size: 0.78rem; color: var(--gray);
  font-family: var(--font-mono);
}

@media (max-width: 768px) {
  .action-item  { padding: 0.8rem 1rem; gap: 10px; }
  .action-badge { display: none; }
  .action-title { font-size: 0.76rem; }
  .action-meta  { font-size: 0.62rem; }
}
@media (max-width: 480px) {
  .action-icon  { width: 24px; height: 24px; }
  .panel-header { padding: 0.8rem 1rem; }
}
</style>
