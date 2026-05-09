<template>
  <header class="admin-topbar">
    <div class="atb-left">
      <!-- Mobile menu -->
      <button class="mobile-menu-btn" @click="$emit('openMobileMenu')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      <!-- Breadcrumb -->
      <div class="topbar-breadcrumb">
        <span class="bc-root">Admin</span>
        <span class="bc-sep">/</span>
        <span class="bc-current">{{ tabLabel }}</span>
      </div>
    </div>

    <div class="atb-right">
      <!-- System health pill -->
      <div class="health-pill" :class="systemStatus">
        <span class="h-dot" />
        <span class="h-label">{{ systemStatus === 'ok' ? 'All Systems OK' : systemStatus === 'warn' ? 'Degraded' : 'Incident' }}</span>
      </div>

      <!-- Notifications -->
      <button class="icon-btn" title="Admin alerts">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notif-dot" v-if="alertCount > 0" />
      </button>

      <!-- Quick actions -->
      <div class="topbar-actions">
        <button class="iso-btn iso-btn--ghost topbar-action-btn" @click="$emit('action', 'addQuestion')">
          + Question
        </button>
        <button class="iso-btn iso-btn--fill topbar-action-btn" @click="$emit('action', 'announcement')">
          Announce
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeTab: string
  systemStatus: 'ok' | 'warn' | 'error'
  alertCount: number
}>()

defineEmits(['openMobileMenu', 'action'])

const tabLabels: Record<string, string> = {
  overview:  'Overview',
  users:     'Users',
  questions: 'Questions',
  exams:     'Exam Results',
  content:   'Content',
  system:    'System',
}

const tabLabel = computed(() => tabLabels[props.activeTab] ?? props.activeTab)
</script>

<style scoped>
.admin-topbar {
  height: 62px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(9,9,9,0.98);
  position: sticky; top: 0; z-index: 150;
}

.atb-left { display: flex; align-items: center; gap: 16px; }

.mobile-menu-btn {
  display: none;
  background: none; border: none; cursor: pointer;
  color: var(--gray); padding: 4px;
}
.mobile-menu-btn svg { width: 20px; height: 20px; }

.topbar-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.72rem;
}
.bc-root    { color: var(--gray); }
.bc-sep     { color: rgba(240,240,234,0.2); }
.bc-current { color: var(--white); font-weight: 700; letter-spacing: 0.04em; }

.atb-right { display: flex; align-items: center; gap: 14px; }

/* Health pill */
.health-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em;
  padding: 5px 12px; border: 1px solid;
}
.health-pill.ok    { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.05); }
.health-pill.warn  { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.05);  }
.health-pill.error { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.05); }

.h-dot {
  width: 6px; height: 6px; border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
.ok   .h-dot { background: rgba(120,230,120,0.9); box-shadow: 0 0 6px rgba(120,230,120,0.5); }
.warn .h-dot { background: rgba(255,200,80,0.9);  box-shadow: 0 0 6px rgba(255,200,80,0.5);  }
.error.h-dot { background: rgba(255,100,100,0.9); box-shadow: 0 0 6px rgba(255,100,100,0.5); }
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.35} }
.h-label { text-transform: uppercase; letter-spacing: 0.12em; }

/* Icon btn */
.icon-btn {
  position: relative;
  width: 36px; height: 36px;
  border: 1px solid var(--border); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray);
  transition: color 0.2s, border-color 0.2s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.icon-btn:hover { color: var(--white); border-color: var(--border-bright); }
.icon-btn svg   { width: 16px; height: 16px; }
.notif-dot {
  position: absolute; top: 7px; right: 7px;
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,100,100,0.9);
  box-shadow: 0 0 4px rgba(255,100,100,0.6);
}

/* Actions */
.topbar-actions { display: flex; align-items: center; gap: 8px; }
.topbar-action-btn {
  font-family: var(--font-mono) !important;
  font-size: 0.65rem !important;
  letter-spacing: 0.08em !important;
  padding: 8px 14px !important;
}

@media (max-width: 768px) {
  .mobile-menu-btn { display: flex; }
  .health-pill { display: none; }
  .topbar-actions { display: none; }
  .topbar-breadcrumb { max-width: 180px; overflow: hidden; }
  .bc-current { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}

@media (max-width: 480px) {
  .admin-topbar { padding: 0 1rem; }
  .icon-btn { width: 32px; height: 32px; }
}
</style>
