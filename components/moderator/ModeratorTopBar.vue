<template>
  <header class="mod-topbar">
    <div class="tb-left">
      <button class="tb-menu-btn" @click="$emit('openMobileMenu')" aria-label="Open menu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="tb-breadcrumb">
        <span class="tb-root">Moderator</span>
        <span class="tb-sep">/</span>
        <span class="tb-current">{{ tabLabel }}</span>
      </div>
    </div>

    <div class="tb-right">
      <!-- Role pill with pulsing amber dot -->
      <div class="tb-role-pill">
        <span class="tb-role-dot" />
        Moderator Panel
      </div>

      <!-- Alert bell -->
      <button class="tb-icon-btn" title="Alerts">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="tb-notif-dot" v-if="alertCount > 0" />
      </button>

      <!-- Contextual quick actions -->
      <div class="tb-actions">
        <button class="iso-btn iso-btn--ghost tb-act-btn" @click="$emit('action', 'viewreports')">
          {{ openReports }} Open Reports
        </button>

      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps<{
  activeTab: string
  alertCount: number
  openReports: number
  pendingQueue?: number
}>()

defineEmits(['openMobileMenu', 'action'])

const tabLabels: Record<string, string> = {
  overview:    'Overview',
  reports:     'Reports',
  queue:       'Review Queue',
  queue:       'Review Queue',
  users:       'User Warnings',
  discussions: 'Discussions',
  activity:    'Mod Activity',
}

const tabLabel = computed(() => tabLabels[props.activeTab] ?? props.activeTab)
</script>

<style scoped>
.mod-topbar {
  height: 62px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(9,9,9,0.98);
  position: sticky; top: 0; z-index: 150;
}

.tb-left { display: flex; align-items: center; gap: 14px; }

.tb-menu-btn {
  display: none;
  background: none; border: none; cursor: pointer;
  color: var(--gray); padding: 4px;
}
.tb-menu-btn svg { width: 20px; height: 20px; }

.tb-breadcrumb {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.72rem;
}
.tb-root    { color: var(--gray); }
.tb-sep     { color: rgba(240,240,234,0.2); }
.tb-current { color: var(--white); font-weight: 700; letter-spacing: 0.04em; }

.tb-right { display: flex; align-items: center; gap: 12px; }

.tb-role-pill {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 5px 12px; border: 1px solid;
  color: rgba(255,200,80,0.9);
  border-color: rgba(255,200,80,0.3);
  background: rgba(255,200,80,0.05);
}
.tb-role-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,200,80,0.9);
  box-shadow: 0 0 6px rgba(255,200,80,0.5);
  animation: blink 2s infinite;
}
@keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0.25 } }

.tb-icon-btn {
  position: relative;
  width: 36px; height: 36px;
  border: 1px solid var(--border); background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray);
  transition: color 0.2s, border-color 0.2s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.tb-icon-btn:hover { color: var(--white); border-color: var(--border-bright); }
.tb-icon-btn svg   { width: 16px; height: 16px; }
.tb-notif-dot {
  position: absolute; top: 7px; right: 7px;
  width: 5px; height: 5px; border-radius: 50%;
  background: rgba(255,100,100,0.9);
  box-shadow: 0 0 4px rgba(255,100,100,0.6);
}

.tb-actions { display: flex; align-items: center; gap: 8px; }
.tb-act-btn {
  font-family: var(--font-mono) !important;
  font-size: 0.63rem !important;
  letter-spacing: 0.06em !important;
  padding: 7px 13px !important;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .tb-menu-btn  { display: flex; }
  .tb-role-pill { display: none; }
  .tb-actions   { display: none; }
  .tb-breadcrumb { max-width: 180px; overflow: hidden; }
  .tb-current   { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}

@media (max-width: 480px) {
  .mod-topbar  { padding: 0 1rem; }
  .tb-icon-btn { width: 32px; height: 32px; }
}
</style>
