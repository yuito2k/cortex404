<template>
  <header class="topbar">
    <div class="topbar-left">
      <!-- Mobile menu toggle -->
      <button class="mobile-menu-btn" @click="$emit('openMobileMenu')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>
      <div class="topbar-breadcrumb">
        <span class="breadcrumb-root">Cortex404</span>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">{{ pageTitle }}</span>
      </div>
    </div>

    <div class="topbar-right">
      <!-- Streak indicator -->
      <div class="streak-pill">
        <span class="streak-flame">🔥</span>
        <span class="streak-count">{{ streak }}</span>
        <span class="streak-label">day streak</span>
      </div>

      <!-- Notifications -->
      <button class="icon-btn" title="Notifications">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="notif-dot" />
      </button>

      <!-- Quick exam start -->
      <a href="/dashboard/mock-exam" class="iso-btn iso-btn--fill topbar-cta">
        Start Exam →
      </a>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{ pageTitle: string; streak: number }>()
defineEmits(['openMobileMenu'])
</script>

<style scoped>
.topbar {
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  border-bottom: 1px solid var(--border);
  background: rgba(8,8,8,0.95);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0; z-index: 100;
}

.topbar-left { display: flex; align-items: center; gap: 16px; }

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
.breadcrumb-root { color: var(--gray); }
.breadcrumb-sep { color: rgba(240,240,234,0.2); }
.breadcrumb-current { color: var(--white); font-weight: 700; }

.topbar-right { display: flex; align-items: center; gap: 16px; }

.streak-pill {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 14px;
  border: 1px solid var(--border-bright);
  background: rgba(240,240,234,0.03);
  /* iso depth */
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.06);
}
.streak-flame { font-size: 0.9rem; }
.streak-count {
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700; color: var(--white);
}
.streak-label { font-size: 0.65rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.1em; }

.icon-btn {
  position: relative;
  width: 36px; height: 36px;
  border: 1px solid var(--border);
  background: transparent;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray);
  transition: color 0.2s, border-color 0.2s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.icon-btn:hover { color: var(--white); border-color: var(--border-bright); }
.icon-btn svg { width: 16px; height: 16px; }

.notif-dot {
  position: absolute; top: 7px; right: 7px;
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--white);
  box-shadow: 0 0 4px rgba(255,255,255,0.6);
}

.topbar-cta {
  font-family: var(--font-mono);
  font-size: 0.68rem; font-weight: 700;
  letter-spacing: 0.07em; text-transform: uppercase;
  padding: 9px 18px;
  background: var(--white); color: var(--black);
  border: none; cursor: pointer; text-decoration: none;
  transition: background 0.15s, transform 0.1s;
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.2), 2px 2px 0 0 rgba(200,200,190,0.15);
  display: inline-block;
}
.topbar-cta:hover { background: #ddddd7; transform: translate(-1px,-1px); }
.topbar-cta:active { transform: translate(2px,2px); box-shadow: 1px 1px 0 0 rgba(240,240,234,0.1); }

@media (max-width: 768px) {
  .mobile-menu-btn { display: flex; margin-left: -18px; }
  .topbar-breadcrumb { gap: 4px; margin-left: -15px; }
  .streak-pill { padding: 6px 4px; margin-left: 40px; }
  .streak-pill .streak-label { display: none; }
  .topbar-cta { display: none; }
}
</style>
