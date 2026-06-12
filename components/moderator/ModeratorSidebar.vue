<template>
  <aside class="mod-sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">

    <NuxtLink to="/" class="sidebar-logo">
      <span class="logo-full">CORTEX<span class="logo-gray">404</span><span class="logo-mod-badge">MOD</span></span>
      <span class="logo-short">CX<span class="logo-short-badge">M</span></span>
    </NuxtLink>

    <button class="collapse-btn" @click="$emit('toggle')" aria-label="Toggle sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path v-if="!collapsed" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
        <path v-else d="M13 5l7 7-7 7M6 5l7 7-7 7" />
      </svg>
    </button>

    <nav class="sidebar-nav">
      <div class="nav-section-label">Moderation</div>
      <button v-for="item in navItems" :key="item.id"
        class="nav-item" :class="{ active: activeTab === item.id }"
        @click="$emit('tab', item.id)">
        <span class="nav-icon" v-html="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge" :class="item.badgeType">{{ item.badge }}</span>
      </button>
      <div class="nav-divider" />
      <div class="nav-section-label">Navigate</div>
      <NuxtLink to="/dashboard" class="nav-item nav-item--link">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
        <span class="nav-label">Student Dashboard</span>
      </NuxtLink>
      <NuxtLink to="/dashboard/settings" class="nav-item nav-item--link">
        <span class="nav-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span>
        <span class="nav-label">Settings</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-lang">
        <span class="user-name">
          {{ isBn ? 'ভাষা' : 'LANG' }}
        </span>
        <LangToggle />
    </div>

    <div class="sidebar-user">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role-badge">MODERATOR</span>
      </div>
      <button class="signout-btn" @click="handleSignOut" title="Sign out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean; activeTab: string; mobileOpen?: boolean }>()
defineEmits(['toggle', 'tab'])

const { isBn } = useI18n()

const { user, signOut } = useAuth()
const userName = computed(() => user.value?.user_metadata?.full_name ?? 'Moderator')
const userInitials = computed(() => userName.value.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase())
async function handleSignOut() { await signOut() }
const navItems = [
  { id:'overview',    label:'Overview',      badge:null, badgeType:'',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id:'reports',     label:'Reports',       badge:'7',  badgeType:'badge--crit',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` },
  { id:'queue',       label:'Review Queue',  badge:'23', badgeType:'badge--warn',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
  { id:'users',       label:'User Warnings', badge:'4',  badgeType:'badge--warn',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id:'discussions', label:'Discussions',   badge:null, badgeType:'',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>` },
  { id:'activity',    label:'Mod Activity',  badge:null, badgeType:'',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
]
</script>

<style scoped>
.mod-sidebar {
  width: 240px; flex-shrink: 0;
  background: #090909; border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  transition: width 0.25s ease;
  position: sticky; top: 0; height: 100vh;
  overflow: hidden; z-index: 200;
}
.mod-sidebar.collapsed { width: 64px; }
.sidebar-logo {
  display: flex; align-items: center; padding: 0 18px; height: 62px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-weight: 700; font-size: 0.95rem;
  color: var(--white); flex-shrink: 0; white-space: nowrap; text-decoration: none;
}
.logo-gray { color: var(--gray); }
.logo-mod-badge {
  font-size: 0.5rem; letter-spacing: 0.16em; padding: 2px 6px; margin-left: 8px;
  border: 1px solid rgba(255,200,80,0.4); color: rgba(255,200,80,0.85); vertical-align: middle;
}
.logo-short { display: none; font-size: 0.95rem; }
.logo-short-badge {
  font-size: 0.5rem; margin-left: 2px; border: 1px solid rgba(255,200,80,0.3);
  color: rgba(255,200,80,0.8); padding: 1px 3px; vertical-align: middle;
}
.collapsed .logo-full  { display: none; }
.collapsed .logo-short { display: inline-flex; align-items: center; }
.collapse-btn {
  position: absolute; top: 16px; right: -12px; width: 24px; height: 24px;
  background: #090909; border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray); transition: color 0.2s, border-color 0.2s; z-index: 10;
}
.collapse-btn:hover { color: var(--white); border-color: var(--white); }
.collapse-btn svg { width: 12px; height: 12px; }
.sidebar-nav { flex: 1; padding: 16px 0; overflow-y: auto; overflow-x: hidden; }
.sidebar-nav::-webkit-scrollbar { width: 2px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: var(--border-bright); }
.nav-section-label {
  font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--gray); padding: 8px 20px 4px; opacity: 0.5; white-space: nowrap;
}
.collapsed .nav-section-label { display: none; }
.nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 20px;
  font-size: 0.81rem; font-weight: 500; color: var(--gray);
  transition: background 0.15s, color 0.15s; position: relative; white-space: nowrap;
  background: none; border: none; cursor: pointer; width: 100%; text-align: left; text-decoration: none;
}
.nav-item:hover { background: rgba(240,240,234,0.04); color: var(--white); }
.nav-item.active { color: var(--white); background: rgba(240,240,234,0.06); }
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: rgba(255,200,80,0.9);
}
.nav-icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; }
.nav-icon :deep(svg) { width: 16px; height: 16px; }
.nav-label { flex: 1; }
.collapsed .nav-label { display: none; }
.nav-badge {
  font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.06em;
  padding: 2px 6px; border: 1px solid var(--border); color: var(--gray);
}
.nav-badge.badge--warn { border-color: rgba(255,200,80,0.35);  color: rgba(255,200,80,0.8); }
.nav-badge.badge--crit { border-color: rgba(255,100,100,0.4);  color: rgba(255,100,100,0.85); }
.collapsed .nav-badge { display: none; }
.nav-divider { height: 1px; background: var(--border); margin: 12px 0; }
.sidebar-user {
  display: flex; align-items: center; gap: 10px; padding: 14px 16px;
  border-top: 1px solid var(--border); min-height: 64px; overflow: hidden; flex-shrink: 0;
}
.user-avatar {
  width: 32px; height: 32px; background: rgba(255,200,80,0.08);
  border: 1px solid rgba(255,200,80,0.35);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700;
  color: rgba(255,200,80,0.9); flex-shrink: 0;
}
.user-info { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; min-width: 0; }
.user-name { font-size: 0.78rem; font-weight: 600; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-role-badge {
  font-family: var(--font-mono); font-size: 0.5rem; letter-spacing: 0.16em;
  color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.08);
  border: 1px solid rgba(255,200,80,0.25); padding: 1px 6px; width: fit-content;
}
.signout-btn { background: none; border: none; cursor: pointer; color: var(--gray); flex-shrink: 0; padding: 4px; display: flex; align-items: center; transition: color 0.2s; }
.signout-btn:hover { color: var(--white); }
.signout-btn svg { width: 16px; height: 16px; }
.collapsed .user-info   { display: none; }
.collapsed .signout-btn { display: none; }
@media (max-width: 1024px) {
  .mod-sidebar.collapsed { width: 64px; }
  .mod-sidebar:not(.collapsed) { width: 240px; }
  .mod-sidebar:not(.collapsed) .logo-full        { display: inline; }
  .mod-sidebar:not(.collapsed) .logo-short       { display: none; }
  .mod-sidebar:not(.collapsed) .nav-label        { display: block; }
  .mod-sidebar:not(.collapsed) .nav-badge        { display: inline-block; }
  .mod-sidebar:not(.collapsed) .nav-section-label{ display: block; }
  .mod-sidebar:not(.collapsed) .user-info        { display: flex; }
  .mod-sidebar:not(.collapsed) .signout-btn      { display: flex; }
  .collapse-btn { display: flex; }
}
@media (max-width: 768px) {
  .mod-sidebar { position: fixed; top: 0; left: 0; bottom: 0; width: 260px !important; transform: translateX(-100%); transition: transform 0.28s ease; }
  .mod-sidebar.mobile-open { transform: translateX(0); box-shadow: 6px 0 32px rgba(0,0,0,0.7); }
  .mod-sidebar.mobile-open .logo-full        { display: inline !important; }
  .mod-sidebar.mobile-open .logo-short       { display: none !important; }
  .mod-sidebar.mobile-open .nav-label        { display: block !important; }
  .mod-sidebar.mobile-open .nav-badge        { display: inline-block !important; }
  .mod-sidebar.mobile-open .nav-section-label{ display: block !important; }
  .mod-sidebar.mobile-open .user-info        { display: flex !important; }
  .mod-sidebar.mobile-open .signout-btn      { display: flex !important; }
  .collapse-btn { display: none; }
}

.sidebar-lang {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: 20px;
  margin-right: 20px;
  margin-bottom: 10px;
}
</style>
