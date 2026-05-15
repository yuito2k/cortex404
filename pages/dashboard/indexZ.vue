<template>
  <div class="overview">

    <!-- Welcome banner -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <div class="welcome-chip"><span class="chip-dot" /> Dashboard</div>
        <h1 class="welcome-title">
          Good {{ timeOfDay }}, <span class="name-highlight">{{ firstName }}</span>.
        </h1>
        <p class="welcome-sub">
          {{ motivationLine }}
        </p>
      </div>
      <div class="welcome-right">
        <a href="/dashboard/mock-exam" class="iso-btn iso-btn--fill">
          Start Today's Exam →
        </a>
        <a href="/dashboard/question-bank" class="iso-btn iso-btn--ghost">
          Browse Questions
        </a>
      </div>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="skeleton-row">
        <div v-for="i in 4" :key="i" class="skeleton-card" />
      </div>
      <div class="skeleton-grid">
        <div class="skeleton-tall" />
        <div class="skeleton-tall" />
      </div>
    </template>

    <template v-else>
      <!-- Stats row -->
      <DashboardDashStats :stats="stats" />

      <!-- Main grid: 3 col layout -->
      <div class="dash-grid">

        <!-- Left column: Activity + Recommended -->
        <div class="col-left">
          <DashboardDashActivity :activities="recentActivity" />
          <DashboardDashRecommended :topics="recommendedTopics" />
        </div>

        <!-- Right column: Quick Actions + Leaderboard + Streak -->
        <div class="col-right">
          <DashboardDashQuickActions />
          <DashboardDashLeaderboard
            :user-rank="userRank"
            :total-students="totalStudents"
            :entries="leaderboardEntries"
          />
          <DashboardDashStreak
            :current-streak="streakData.currentStreak"
            :longest-streak="streakData.longestStreak"
            :total-days="streakData.totalDays"
            :activity-data="streakData.activityData"
          />
        </div>

      </div>
    </template>

    <!-- Error -->
    <div v-if="error" class="dash-error">
      <span>⚠ {{ error }}</span>
      <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem;padding:6px 14px" @click="fetchDashboard">
        Retry
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { user } = useAuth()
const {
  loading, error,
  stats, recentActivity, leaderboardEntries,
  recommendedTopics, streakData, userRank, totalStudents,
  fetchDashboard,
} = useDashboard()

// ── Greeting ──────────────────────────────────────────────
const firstName = computed(() => {
  const name = user.value?.user_metadata?.full_name ?? user.value?.email ?? 'Student'
  return name.split(' ')[0]
})

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const motivationLines = [
  'Keep the streak alive. Every question counts.',
  'Your national rank improved since yesterday.',
  'You\'re in the top 10% — push for top 5%.',
  'Consistency beats talent. Show up today.',
  'Your weak spots are your biggest opportunity.',
]
const motivationLine = motivationLines[new Date().getDay() % motivationLines.length]

// ── Load data ─────────────────────────────────────────────
onMounted(fetchDashboard)
</script>

<style scoped>
.overview { display: flex; flex-direction: column; gap: 1.5rem; }

/* Welcome banner */
.welcome-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 2rem;
  border: 1px solid var(--border);
  background: #0d0d0d;
  position: relative;
  overflow: hidden;
  /* Iso depth */
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

/* Faint CORTEX404 watermark */
.welcome-banner::before {
  content: 'CORTEX404';
  position: absolute; right: -20px; top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono); font-weight: 700;
  font-size: 5rem; color: rgba(240,240,234,0.025);
  pointer-events: none; white-space: nowrap;
  letter-spacing: -2px;
}

.welcome-chip {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border-bright);
  padding: 5px 12px; margin-bottom: 0.9rem;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--white); animation: blink 2s infinite;
}

.welcome-title {
  font-family: var(--font-mono);
  font-size: clamp(1.4rem, 2.5vw, 2rem);
  font-weight: 700; letter-spacing: -0.8px;
  color: var(--white); margin-bottom: 0.5rem;
  line-height: 1.1;
}
.name-highlight {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(240,240,234,0.6);
}

.welcome-sub {
  font-size: 0.83rem; color: var(--gray);
  font-weight: 300; max-width: 420px;
}

.welcome-right {
  display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap;
}

/* Main grid */
.dash-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
}

.col-left,
.col-right {
  display: flex; flex-direction: column; gap: 1.5rem;
}

/* Skeleton loaders */
.skeleton-row {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
  background: var(--border); border: 1px solid var(--border);
}
.skeleton-card {
  height: 120px; background: #0d0d0d;
  animation: shimmer 1.4s ease infinite;
}
.skeleton-grid {
  display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem;
}
.skeleton-tall {
  height: 300px; background: #0d0d0d;
  border: 1px solid var(--border);
  animation: shimmer 1.4s ease infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.7; }
}

/* Error */
.dash-error {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px;
  border: 1px solid rgba(255,80,80,0.3);
  background: rgba(255,80,80,0.05);
  font-family: var(--font-mono); font-size: 0.75rem;
  color: rgba(255,100,100,0.9);
  gap: 1rem;
}

@media (max-width: 1100px) {
  .dash-grid { grid-template-columns: 1fr; }
  .col-right { order: -1; }
}
@media (max-width: 700px) {
  .welcome-banner { flex-direction: column; align-items: flex-start; }
  .welcome-right { width: 100%; }
  .welcome-right .iso-btn { flex: 1; text-align: center; }
  .skeleton-row { grid-template-columns: repeat(2, 1fr); }
  .skeleton-grid { grid-template-columns: 1fr; }
}
</style>
