<template>
  <aside class="admin-sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">

    <!-- Logo -->
    <NuxtLink to="/" class="sidebar-logo">
      <span class="logo-full">CORTEX<span class="logo-gray">404</span><span class="logo-admin-badge">ADMIN</span></span>
      <span class="logo-short">CX<span class="logo-short-badge">A</span></span>
    </NuxtLink>

    <!-- Desktop collapse toggle -->
    <button class="collapse-btn" @click="$emit('toggle')" aria-label="Toggle sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path v-if="!collapsed" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
        <path v-else d="M13 5l7 7-7 7M6 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Nav -->
    <nav class="sidebar-nav">
      <div class="nav-section-label">Control</div>

      <NuxtLink
        v-for="item in navItems"
        :key="item.id"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path === item.to }"
        @click="$emit('closeMobile')"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge" :class="item.badgeType">{{ item.badge }}</span>
      </NuxtLink>

      <div class="nav-divider" />
      <div class="nav-section-label">Navigate</div>

      <NuxtLink to="/dashboard" class="nav-item nav-item--link">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        </span>
        <span class="nav-label">Student Dashboard</span>
      </NuxtLink>

      <NuxtLink to="/dashboard/settings" class="nav-item nav-item--link">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </span>
        <span class="nav-label">Settings</span>
      </NuxtLink>
    </nav>

    <div class="sidebar-lang">
        <span class="user-name">
          {{ isBn ? 'ভাষা' : 'LANG' }}
        </span>
        <LangToggle />
    </div>

    <!-- User -->
    <div class="sidebar-user">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-info">
        <span class="user-name">{{ userName }}</span>
        <span class="user-role-badge">ADMIN</span>
      </div>
      <button class="signout-btn" @click="handleSignOut" title="Sign out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
      </button>
    </div>

  </aside>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean; activeTab?: string; mobileOpen?: boolean }>()
defineEmits(['toggle', 'closeMobile'])

const route = useRoute()
const { isBn } = useI18n()

const { user, signOut } = useAuth()
const userName = computed(() => user.value?.user_metadata?.full_name ?? 'Admin')
const userInitials = computed(() =>
  userName.value.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
)
async function handleSignOut() { await signOut() }

const navItems = [
  { id:'overview',  label:'Overview',     to:'/dashboard/admin',           badge:null,    badgeType:'',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>` },
  { id:'users',     label:'Users',        to:'/dashboard/admin/users',     badge:'14.8k', badgeType:'',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>` },
  { id:'questions', label:'Questions',    to:'/dashboard/admin/questions', badge:'3',     badgeType:'badge--warn',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>` },
  { id:'examsLibrary', label:'Exams Library',    to:'/dashboard/admin/exams', badge:'3',     badgeType:'badge--warn',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-3"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="9" y1="15" x2="15" y2="15"/></svg>` },
  { id:'createExam', label:'Create Exam',    to:'/dashboard/admin/exams/create', badge:'3',     badgeType:'badge--warn',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>` },
  { id:'results',     label:'Exam Results', to:'/dashboard/admin/results',     badge:null,    badgeType:'',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  { id:'queue',     label:'Review Queue', to:'/dashboard/admin/queue',     badge:'23',    badgeType:'badge--warn',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>` },
  { id:'content',   label:'Content',      to:'/dashboard/admin/content',   badge:'1',     badgeType:'badge--info',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>` },
  { id:'system',    label:'System',       to:'/dashboard/admin/system',    badge:null,    badgeType:'',
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` },
]
</script>

<style scoped>
/* ── Base sidebar — desktop ─────────────────────────────────── */
.admin-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #090909;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  /* sticky so it scrolls with page but stays visible */
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  z-index: 200;
}
.admin-sidebar.collapsed { width: 64px; }

/* Logo */
.sidebar-logo {
  display: flex; align-items: center;
  padding: 0 18px; height: 62px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-weight: 700; font-size: 0.95rem;
  color: var(--white); flex-shrink: 0; white-space: nowrap; text-decoration: none;
}
.logo-gray { color: var(--gray); }
.logo-admin-badge {
  font-size: 0.5rem; letter-spacing: 0.16em;
  padding: 2px 6px; margin-left: 8px;
  border: 1px solid rgba(240,240,234,0.25); color: var(--gray);
  vertical-align: middle;
}
.logo-short { display: none; font-size: 0.95rem; }
.logo-short-badge {
  font-size: 0.5rem; margin-left: 2px;
  border: 1px solid rgba(240,240,234,0.2);
  padding: 1px 3px; color: var(--gray); vertical-align: middle;
}
.collapsed .logo-full  { display: none; }
.collapsed .logo-short { display: inline-flex; align-items: center; }

/* Toggle */
.collapse-btn {
  position: absolute; top: 16px; right: -12px;
  width: 24px; height: 24px; background: #090909;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray);
  transition: color 0.2s, border-color 0.2s; z-index: 10;
}
.collapse-btn:hover { color: var(--white); border-color: var(--white); }
.collapse-btn svg { width: 12px; height: 12px; }

/* Nav */
.sidebar-nav { flex: 1; padding: 16px 0; overflow-y: auto; overflow-x: hidden; }
.sidebar-nav::-webkit-scrollbar { width: 2px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: var(--border-bright); }

.nav-section-label {
  font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.22em;
  text-transform: uppercase; color: var(--gray);
  padding: 8px 20px 4px; opacity: 0.5; white-space: nowrap;
}
.collapsed .nav-section-label { display: none; }

.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 20px; font-size: 0.81rem; font-weight: 500; color: var(--gray);
  transition: background 0.15s, color 0.15s;
  position: relative; white-space: nowrap;
  background: none; border: none; cursor: pointer;
  width: 100%; text-align: left; text-decoration: none;
}
.nav-item:hover { background: rgba(240,240,234,0.04); color: var(--white); }
.nav-item.active { color: var(--white); background: rgba(240,240,234,0.06); }
.nav-item.active::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 2px; background: var(--white);
}
.nav-icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; }
.nav-icon :deep(svg) { width: 16px; height: 16px; }
.nav-label { flex: 1; }
.collapsed .nav-label { display: none; }

.nav-badge {
  font-family: var(--font-mono); font-size: 0.52rem;
  letter-spacing: 0.06em; padding: 2px 6px;
  border: 1px solid var(--border); color: var(--gray);
}
.nav-badge.badge--warn { border-color: rgba(255,100,100,0.35); color: rgba(255,100,100,0.8); }
.nav-badge.badge--info { border-color: rgba(255,200,80,0.35);  color: rgba(255,200,80,0.8);  }
.collapsed .nav-badge { display: none; }

.nav-divider { height: 1px; background: var(--border); margin: 12px 0; }

/* User */
.sidebar-user {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px; border-top: 1px solid var(--border);
  min-height: 64px; overflow: hidden; flex-shrink: 0;
}
.user-avatar {
  width: 32px; height: 32px; background: rgba(240,240,234,0.07);
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700;
  color: var(--white); flex-shrink: 0;
}
.user-info { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; min-width: 0; }
.user-name {
  font-size: 0.78rem; font-weight: 600; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-role-badge {
  font-family: var(--font-mono); font-size: 0.5rem; letter-spacing: 0.16em;
  color: var(--white); background: rgba(240,240,234,0.1);
  border: 1px solid rgba(240,240,234,0.2); padding: 1px 6px; width: fit-content;
}
.signout-btn {
  background: none; border: none; cursor: pointer; color: var(--gray);
  flex-shrink: 0; padding: 4px; display: flex; align-items: center; transition: color 0.2s;
}
.signout-btn:hover { color: var(--white); }
.signout-btn svg { width: 16px; height: 16px; }
.collapsed .user-info   { display: none; }
.collapsed .signout-btn { display: none; }

/* ── Tablet ≤ 1024px: collapsed=icon-only, not-collapsed=full ── */
@media (max-width: 1024px) {
  /* collapsed state — icon only, identical to desktop collapsed */
  .admin-sidebar.collapsed { width: 64px; }

  /* NOT collapsed — full sidebar, restore everything */
  .admin-sidebar:not(.collapsed) {
    width: 240px;
  }
  .admin-sidebar:not(.collapsed) .logo-full      { display: inline; }
  .admin-sidebar:not(.collapsed) .logo-short     { display: none; }
  .admin-sidebar:not(.collapsed) .nav-label      { display: block; }
  .admin-sidebar:not(.collapsed) .nav-badge      { display: inline-block; }
  .admin-sidebar:not(.collapsed) .nav-section-label { display: block; }
  .admin-sidebar:not(.collapsed) .user-info      { display: flex; }
  .admin-sidebar:not(.collapsed) .signout-btn    { display: flex; }

  /* collapse-btn always visible on tablet */
  .collapse-btn { display: flex; }
}

/* ── Mobile ≤ 768px: slide-in overlay drawer ────────────────── */
@media (max-width: 768px) {
  .admin-sidebar {
    position: fixed;
    top: 0; left: 0; bottom: 0;
    width: 260px !important;
    transform: translateX(-100%);
    transition: transform 0.28s ease;
    box-shadow: none;
  }
  /* Drawer open — controlled by .mobile-open class */
  .admin-sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 6px 0 32px rgba(0,0,0,0.7);
  }
  /* Restore all text in open drawer */
  .admin-sidebar.mobile-open .logo-full     { display: inline !important; }
  .admin-sidebar.mobile-open .logo-short    { display: none !important; }
  .admin-sidebar.mobile-open .nav-label     { display: block !important; }
  .admin-sidebar.mobile-open .nav-badge     { display: inline-block !important; }
  .admin-sidebar.mobile-open .nav-section-label { display: block !important; }
  .admin-sidebar.mobile-open .user-info     { display: flex !important; }
  .admin-sidebar.mobile-open .signout-btn   { display: flex !important; }
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
