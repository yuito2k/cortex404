<template>
  <div class="dash-shell">
    <!-- Sidebar -->
    <DashboardDashSidebar
      :collapsed="sidebarCollapsed"
      :mobileOpen="mobileMenuOpen"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @close-mobile="mobileMenuOpen = false"
    />

    <!-- Mobile overlay -->
    <Transition name="overlay-fade">
      <div
        v-if="mobileMenuOpen"
        class="mobile-overlay"
        @click="mobileMenuOpen = false"
      />
    </Transition>

    <!-- Main content -->
    <div class="dash-main" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <DashboardDashTopBar
        :page-title="pageTitle"
        :streak="streak"
        @open-mobile-menu="mobileMenuOpen = true"
      />
      <div class="dash-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const sidebarCollapsed = ref(false)
const mobileMenuOpen = ref(false)

// Derive page title from route
const pageTitle = computed(() => {
  const map: Record<string, string> = {
    '/dashboard': 'Overview',
    '/dashboard/mock-exam': 'Mock Exam',
    '/dashboard/question-bank': 'Question Bank',
    '/dashboard/progress': 'Progress',
    '/dashboard/leaderboard': 'Leaderboard',
    '/dashboard/edverse': 'EdVerse',
    '/dashboard/settings': 'Settings',
  }
  return map[route.path] ?? 'Dashboard'
})

// Get streak from profile (simplified — real app uses useDashboard)
const streak = ref(14)
</script>

<style scoped>
.dash-shell {
  display: flex;
  min-height: 100vh;
  background: var(--black);
}

.dash-main {
  flex: 1;
  margin-left: 240px;
  transition: margin-left 0.25s ease;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.dash-main.sidebar-collapsed { margin-left: 64px; }

.dash-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
}

.mobile-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 150;
  backdrop-filter: blur(2px);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active { transition: opacity 0.28s ease; }
.overlay-fade-enter-from,
.overlay-fade-leave-to     { opacity: 0; }

@media (max-width: 768px) {
  .dash-main { margin-left: 0; }
  .dash-main.sidebar-collapsed { margin-left: 0; }
  .dash-content { padding: 1.2rem; }
}
</style>
