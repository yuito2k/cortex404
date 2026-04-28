<template>
  <!-- DashSidebar.vue — i18n updated -->
  <aside class="dash-sidebar">
    <!-- Logo -->
    <NuxtLink to="/" class="sidebar-logo mono-keep">
      Cortex<span class="logo-accent">404</span>
    </NuxtLink>

    <!-- Nav items -->
    <nav class="sidebar-nav">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="dash-nav-item"
        active-class="is-active"
      >
        <span class="nav-icon" v-html="item.icon" />
        <span class="sidebar-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Bottom: lang toggle + user -->
    <div class="sidebar-bottom">
      <!-- Language toggle in sidebar -->
      <div class="sidebar-lang">
        <span class="sidebar-lang-label mono-keep">
          {{ locale === 'en' ? 'LANG' : 'ভাষা' }}
        </span>
        <LangToggle />
      </div>

      <!-- User row -->
      <div class="sidebar-user">
        <div class="user-avatar mono-keep">
          {{ userInitials }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ userName }}</span>
          <span class="user-exam mono-keep">{{ userExam }}</span>
        </div>
        <NuxtLink to="/dashboard/settings" class="settings-icon" :aria-label="t('dashboard.settings')">
          ⚙
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const user = useSupabaseUser()

const navItems = computed(() => [
  {
    to: '/dashboard',
    label: t('dashboard.overview'),
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="6" height="6" stroke="currentColor"/><rect x="9" y="1" width="6" height="6" stroke="currentColor"/><rect x="1" y="9" width="6" height="6" stroke="currentColor"/><rect x="9" y="9" width="6" height="6" stroke="currentColor"/></svg>',
  },
  {
    to: '/dashboard/question-bank',
    label: t('dashboard.questionBank'),
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" stroke="currentColor"/><line x1="5" y1="6" x2="11" y2="6" stroke="currentColor"/><line x1="5" y1="9" x2="9" y2="9" stroke="currentColor"/></svg>',
  },
  {
    to: '/dashboard/mock-exam',
    label: t('dashboard.mockExam'),
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor"/><polyline points="8,5 8,8 10,10" stroke="currentColor"/></svg>',
  },
  {
    to: '/dashboard/progress',
    label: t('dashboard.progress'),
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="2,12 6,7 9,10 14,4" stroke="currentColor"/></svg>',
  },
  {
    to: '/dashboard/leaderboard',
    label: t('dashboard.leaderboard'),
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="1" y="9" width="4" height="5" stroke="currentColor"/><rect x="6" y="6" width="4" height="8" stroke="currentColor"/><rect x="11" y="3" width="4" height="11" stroke="currentColor"/></svg>',
  },
  {
    to: '/dashboard/settings',
    label: t('dashboard.settings'),
    icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2" stroke="currentColor"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" stroke="currentColor"/></svg>',
  },
])

const userInitials = computed(() => {
  const name = user.value?.user_metadata?.full_name ?? user.value?.email ?? 'U'
  return name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
})

const userName = computed(() =>
  user.value?.user_metadata?.full_name ?? user.value?.email?.split('@')[0] ?? 'Student'
)

const userExam = computed(() =>
  user.value?.user_metadata?.primary_exam ?? 'HSC'
)
</script>

<style scoped>
.dash-sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--black);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 24px 0;
  flex-shrink: 0;
}

.sidebar-logo {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--white);
  text-decoration: none;
  padding: 0 20px 24px;
  border-bottom: 1px solid var(--border);
  letter-spacing: 0.05em;
}
.logo-accent { opacity: 0.4; }

.sidebar-nav {
  flex: 1;
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dash-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: var(--dim);
  text-decoration: none;
  border-left: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.dash-nav-item:hover {
  color: var(--white);
  background: rgba(240, 240, 234, 0.03);
}
.dash-nav-item.is-active {
  color: var(--white);
  border-left-color: var(--white);
  background: rgba(240, 240, 234, 0.04);
}

.nav-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.7;
}
.dash-nav-item.is-active .nav-icon { opacity: 1; }

.sidebar-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.sidebar-bottom {
  border-top: 1px solid var(--border);
  padding: 16px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Lang toggle row in sidebar */
.sidebar-lang {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.sidebar-lang-label {
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  color: var(--dim);
  text-transform: uppercase;
}

.sidebar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-bottom: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: rgba(240, 240, 234, 0.08);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--white);
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 0.78rem;
  color: var(--white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-exam {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--dim);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.settings-icon {
  color: var(--dim);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.15s;
  flex-shrink: 0;
}
.settings-icon:hover { color: var(--white); }

/* Bangla sidebar labels */
:global(body.lang-bn) .sidebar-label {
  font-family: var(--font-bangla);
  letter-spacing: 0;
  text-transform: none;
  font-size: 0.85rem;
}
:global(body.lang-bn) .user-name {
  font-family: var(--font-bangla);
}
</style>
