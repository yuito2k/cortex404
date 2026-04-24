<template>
  <aside class="sidebar" :class="{ collapsed: collapsed }">
    <!-- Logo -->
    <NuxtLink to="/" class="sidebar-logo">
      <span class="logo-full">CORTEX<span class="gray">404</span></span>
      <span class="logo-short">CX</span>
    </NuxtLink>

    <!-- Toggle -->
    <button class="collapse-btn" @click="$emit('toggle')" aria-label="Toggle sidebar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path v-if="!collapsed" d="M11 19l-7-7 7-7M18 19l-7-7 7-7" />
        <path v-else d="M13 5l7 7-7 7M6 5l7 7-7 7" />
      </svg>
    </button>

    <!-- Nav items -->
    <nav class="sidebar-nav">
      <div class="nav-section-label" v-if="!collapsed">Main</div>
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: route.path === item.to }"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span class="nav-label">{{ item.label }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
      </NuxtLink>

      <div class="nav-divider" />
      <div class="nav-section-label" v-if="!collapsed">Account</div>

      <NuxtLink to="/dashboard/settings" class="nav-item" :class="{ active: route.path === '/dashboard/settings' }">
        <span class="nav-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </span>
        <span class="nav-label">Settings</span>
      </NuxtLink>
    </nav>

    <!-- User profile -->
    <div class="sidebar-user">
      <div class="user-avatar">{{ userInitials }}</div>
      <div class="user-info" v-if="!collapsed">
        <span class="user-name">{{ userName }}</span>
        <span class="user-email">{{ userEmail }}</span>
      </div>
      <button class="signout-btn" @click="handleSignOut" title="Sign out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
        </svg>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ collapsed: boolean }>()
defineEmits(['toggle'])

const route = useRoute()
const { user, signOut } = useAuth()

const userName = computed(() => user.value?.user_metadata?.full_name ?? 'Student')
const userEmail = computed(() => user.value?.email ?? '')
const userInitials = computed(() =>
  userName.value.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
)

const navItems = [
  {
    to: '/dashboard',
    label: 'Overview',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  },
  {
    to: '/dashboard/mock-exam',
    label: 'Mock Exam',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    to: '/dashboard/question-bank',
    label: 'Question Bank',
    badge: '1M+',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
  },
  {
    to: '/dashboard/progress',
    label: 'Progress',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    to: '/dashboard/leaderboard',
    label: 'Leaderboard',
    badge: null,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>`,
  },
]

async function handleSignOut() {
  await signOut()
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #0a0a0a;
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.25s ease;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 200;
  overflow: hidden;
}
.sidebar.collapsed { width: 64px; }

.sidebar-logo {
  display: flex;
  align-items: center;
  padding: 0 20px;
  height: 62px;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1rem;
  color: var(--white);
  flex-shrink: 0;
  white-space: nowrap;
}
.gray { color: var(--gray); }
.logo-short { display: none; }
.collapsed .logo-full { display: none; }
.collapsed .logo-short { display: block; }

.collapse-btn {
  position: absolute;
  top: 16px; right: -12px;
  width: 24px; height: 24px;
  background: #0a0a0a;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: var(--gray);
  transition: color 0.2s, border-color 0.2s;
  z-index: 10;
}
.collapse-btn:hover { color: var(--white); border-color: var(--white); }
.collapse-btn svg { width: 12px; height: 12px; }

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.nav-section-label {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--gray);
  padding: 8px 20px 4px;
  opacity: 0.6;
  white-space: nowrap;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--gray);
  transition: background 0.15s, color 0.15s;
  position: relative;
  white-space: nowrap;
  text-decoration: none;
}
.nav-item:hover { background: rgba(240,240,234,0.04); color: var(--white); }
.nav-item.active {
  color: var(--white);
  background: rgba(240,240,234,0.06);
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 2px;
  background: var(--white);
}

.nav-icon { width: 20px; height: 20px; flex-shrink: 0; display: flex; align-items: center; }
.nav-icon :deep(svg) { width: 18px; height: 18px; }
.nav-label { flex: 1; }

.nav-badge {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.06em;
  padding: 2px 6px;
  border: 1px solid var(--border-bright);
  color: var(--gray);
}
.collapsed .nav-label,
.collapsed .nav-badge,
.collapsed .nav-section-label { display: none; }

.nav-divider {
  height: 1px;
  background: var(--border);
  margin: 12px 0;
}

/* User area */
.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid var(--border);
  min-height: 64px;
  overflow: hidden;
}

.user-avatar {
  width: 32px; height: 32px;
  background: #1e1e1e;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.65rem; font-weight: 700;
  color: var(--white);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  display: flex; flex-direction: column; gap: 2px;
  overflow: hidden;
  min-width: 0;
}
.user-name {
  font-size: 0.78rem; font-weight: 600;
  color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.user-email {
  font-size: 0.65rem; color: var(--gray);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.signout-btn {
  background: none; border: none; cursor: pointer;
  color: var(--gray); flex-shrink: 0;
  padding: 4px; display: flex; align-items: center;
  transition: color 0.2s;
}
.signout-btn:hover { color: var(--white); }
.signout-btn svg { width: 16px; height: 16px; }

.collapsed .user-info { display: none; }
.collapsed .signout-btn { display: none; }
</style>
