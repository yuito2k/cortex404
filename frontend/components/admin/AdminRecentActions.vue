<template>
  <div class="recent-actions-panel">
    <div class="panel-header">
      <span class="panel-tag">Recent Admin Actions</span>
      <div class="header-right">
        <span class="live-dot" />
        <span class="panel-tag" style="opacity:0.5">Live</span>
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
        No admin actions recorded yet.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  actions: {
    id: number
    type: 'ban' | 'publish' | 'delete' | 'promote' | 'announce' | 'system'
    title: string
    actor: string
    time: string
  }[]
}>()

function typeIcon(type: string) {
  const icons: Record<string, string> = {
    ban:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`,
    publish:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><polyline points="20 6 9 17 4 12"/></svg>`,
    delete:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>`,
    promote:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><polyline points="18 15 12 9 6 15"/></svg>`,
    announce: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
    system:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
  }
  return icons[type] ?? icons.system
}

function typeLabel(type: string) {
  const labels: Record<string, string> = {
    ban: 'Ban', publish: 'Publish', delete: 'Delete',
    promote: 'Promote', announce: 'Announce', system: 'System',
  }
  return labels[type] ?? type
}
</script>

<style scoped>
.recent-actions-panel {
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
.header-right { display: flex; align-items: center; gap: 6px; }
.live-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(120,230,120,0.9);
  box-shadow: 0 0 6px rgba(120,230,120,0.5);
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
.action-item.type-ban:hover     { border-left-color: rgba(255,100,100,0.5); }
.action-item.type-delete:hover  { border-left-color: rgba(255,100,100,0.5); }
.action-item.type-publish:hover { border-left-color: rgba(120,230,120,0.5); }
.action-item.type-promote:hover { border-left-color: rgba(240,240,234,0.4); }
.action-item.type-announce:hover{ border-left-color: rgba(255,200,80,0.5);  }
.action-item.type-system:hover  { border-left-color: rgba(240,240,234,0.2); }

.action-icon {
  width: 28px; height: 28px; flex-shrink: 0;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
  color: var(--gray);
}
.icon-ban     { border-color: rgba(255,100,100,0.3); color: rgba(255,100,100,0.7); }
.icon-delete  { border-color: rgba(255,100,100,0.3); color: rgba(255,100,100,0.7); }
.icon-publish { border-color: rgba(120,230,120,0.3); color: rgba(120,230,120,0.7); }
.icon-promote { border-color: rgba(240,240,234,0.2); color: var(--white); }
.icon-announce{ border-color: rgba(255,200,80,0.3);  color: rgba(255,200,80,0.7);  }
.icon-system  { border-color: var(--border); }

.action-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.action-title {
  font-size: 0.8rem; font-weight: 500; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.action-meta  { font-size: 0.67rem; color: var(--gray); font-family: var(--font-mono); }

.action-badge {
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 2px 7px; border: 1px solid var(--border);
  flex-shrink: 0; color: var(--gray);
}
.badge-ban     { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }
.badge-delete  { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }
.badge-publish { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.25); }
.badge-promote { color: var(--white); border-color: rgba(240,240,234,0.2); }
.badge-announce{ color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25);  }

.action-empty {
  padding: 2rem 1.4rem; text-align: center;
  font-size: 0.78rem; color: var(--gray);
  font-family: var(--font-mono);
}

@media (max-width: 768px) {
  .action-item { padding: 0.8rem 1rem; gap: 10px; }
  /* Hide badge on small screens — type shown by icon color */
  .action-badge { display: none; }
  .action-title { font-size: 0.76rem; }
  .action-meta  { font-size: 0.62rem; }
}

@media (max-width: 480px) {
  .action-icon  { width: 24px; height: 24px; }
  .panel-header { padding: 0.8rem 1rem; }
}
</style>
