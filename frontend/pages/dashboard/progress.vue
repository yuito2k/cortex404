<template>
  <div class="progress-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="page-chip"><span class="chip-dot" /> Progress</div>
        <h1 class="page-title">Your Analytics.<br><span class="text-outline">Track Everything.</span></h1>
        <p class="page-sub">Score trends, subject mastery, activity patterns, weak spots — all in one place.</p>
      </div>
      <div class="header-stats">
        <div v-for="s in headerStats" :key="s.label" class="hstat">
          <span class="hstat-value" :class="s.cls">{{ s.value }}</span>
          <span class="hstat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <!-- Period selector -->
    <div class="period-bar">
      <span class="period-label">Period</span>
      <div class="period-pills">
        <button
          v-for="p in periods"
          :key="p.val"
          class="filter-pill"
          :class="{ active: period === p.val }"
          @click="period = p.val"
        >{{ p.label }}</button>
      </div>
      <div class="period-right">
        <span class="updated-at">{{ loading ? 'Loading…' : 'Updated just now' }}</span>
      </div>
    </div>

    <!-- Main grid -->
    <div class="progress-grid">

      <!-- ── LEFT COLUMN ── -->
      <div class="col-main">

        <!-- Score trend chart -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-tag">Score Trend</span>
            <div class="chart-legend">
              <span class="leg-item"><span class="leg-line solid" />Score</span>
              <span class="leg-item"><span class="leg-line dashed" />Average</span>
            </div>
          </div>
          <div class="chart-wrap">
            <div class="chart-y-axis">
              <span v-for="tick in [100,75,50,25,0]" :key="tick" class="y-tick">{{ tick }}</span>
            </div>
            <div class="chart-area">
              <!-- Grid lines -->
              <div v-for="tick in [100,75,50,25,0]" :key="tick" class="grid-line" :style="{ bottom: tick + '%' }" />
              <!-- Average line -->
              <div class="avg-line" :style="{ bottom: avgScore + '%' }" />
              <!-- Bars -->
              <div class="bars-row">
                <div
                  v-for="(exam, i) in scoreTrend"
                  :key="i"
                  class="bar-col"
                  @mouseenter="hoveredBar = i"
                  @mouseleave="hoveredBar = null"
                >
                  <div class="bar-tooltip" v-if="hoveredBar === i">
                    <span class="tt-score">{{ exam.score }}%</span>
                    <span class="tt-label">{{ exam.subject }}</span>
                    <span class="tt-date">{{ exam.date }}</span>
                  </div>
                  <div
                    class="bar"
                    :class="scoreBarClass(exam.score)"
                    :style="{ height: exam.score + '%' }"
                  />
                  <span class="bar-label">{{ exam.shortDate }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Subject mastery grid -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-tag">Subject Mastery</span>
            <span class="panel-count">{{ subjectMastery.length }} subjects</span>
          </div>
          <div class="mastery-grid">
            <div
              v-for="sub in subjectMastery"
              :key="sub.name"
              class="mastery-card"
            >
              <div class="mc-top">
                <div class="mc-icon" v-html="sub.icon" />
                <div class="mc-info">
                  <span class="mc-name">{{ sub.name }}</span>
                  <span class="mc-stream">{{ sub.stream }}</span>
                </div>
                <span class="mc-pct" :class="masteryClass(sub.mastery)">{{ sub.mastery }}%</span>
              </div>
              <div class="mc-bar-wrap">
                <div class="mc-bar-fill" :class="masteryClass(sub.mastery)" :style="{ width: sub.mastery + '%' }" />
              </div>
              <div class="mc-bottom">
                <span class="mc-stat">{{ sub.exams }} exams</span>
                <span class="mc-stat">{{ sub.questions }} Qs</span>
                <span class="mc-trend" :class="sub.trend > 0 ? 'up' : 'down'">
                  {{ sub.trend > 0 ? '↑' : '↓' }} {{ Math.abs(sub.trend) }}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Weak topics drill-down -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-tag">Topic Mastery</span>
            <NuxtLink to="/dashboard/question-bank" class="panel-link">Practice →</NuxtLink>
          </div>
          <div class="weak-list">
            <div
              v-for="(topic, i) in weakTopics"
              :key="topic.name"
              class="weak-row"
              :style="{ animationDelay: i * 0.05 + 's' }"
            >
              <div class="wr-left">
                <span class="wr-rank">{{ String(i + 1).padStart(2, '0') }}</span>
                <div class="wr-info">
                  <span class="wr-name">{{ topic.name }}</span>
                  <span class="wr-sub">{{ topic.subject }}</span>
                </div>
              </div>
              <div class="wr-center">
                <div class="wr-bar-wrap">
                  <div class="wr-bar-fill" :class="masteryClass(topic.mastery)" :style="{ width: topic.mastery + '%' }" />
                </div>
              </div>
              <div class="wr-right">
                <span class="wr-pct" :class="masteryClass(topic.mastery)">{{ topic.mastery }}%</span>
                <NuxtLink
                  :to="`/dashboard/question-bank?topic=${encodeURIComponent(topic.name)}`"
                  class="wr-drill iso-btn iso-btn--ghost"
                >Drill</NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Exam history table -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-tag">Exam History</span>
            <div class="table-filters">
              <button
                v-for="f in ['All', 'Mock', 'Practice']"
                :key="f"
                class="filter-pill small-pill"
                :class="{ active: historyFilter === f }"
                @click="historyFilter = f"
              >{{ f }}</button>
            </div>
          </div>
          <div class="history-table">
            <div class="ht-header">
              <span>Exam</span>
              <span>Subject</span>
              <span>Score</span>
              <span>Qs</span>
              <span>Date</span>
              <span>Status</span>
            </div>
            <div
              v-for="exam in filteredHistory"
              :key="exam.id"
              class="ht-row"
            >
              <span class="ht-title">{{ exam.title }}</span>
              <span class="ht-subject">{{ exam.subject }}</span>
              <span class="ht-score" :class="scoreBarClass(exam.score)">{{ exam.score }}%</span>
              <span class="ht-qs">{{ exam.questions }}</span>
              <span class="ht-date">{{ exam.date }}</span>
              <span class="ht-status" :class="exam.status">{{ exam.status }}</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ── RIGHT SIDEBAR ── -->
      <aside class="col-side">

        <!-- Snapshot stats -->
        <div class="panel">
          <div class="panel-header"><span class="panel-tag">Snapshot</span></div>
          <div class="snap-stats">
            <div v-for="s in snapshotStats" :key="s.label" class="snap-stat">
              <span class="snap-icon" v-html="s.icon" />
              <div class="snap-text">
                <span class="snap-value">{{ s.value }}</span>
                <span class="snap-label">{{ s.label }}</span>
              </div>
              <span class="snap-delta" :class="s.up ? 'up' : 'down'">
                {{ s.up ? '↑' : '↓' }} {{ s.delta }}
              </span>
            </div>
          </div>
        </div>

        <!-- Activity heatmap (compact) -->
        <div class="panel">
          <div class="panel-header">
            <span class="panel-tag">Activity — 12 Weeks</span>
            <span class="panel-count">🔥 {{ currentStreak }} day streak</span>
          </div>
          <div class="heat-wrap">
            <div class="heatmap-grid">
              <div
                v-for="(day, i) in heatmapDays"
                :key="i"
                class="heat-cell"
                :class="heatLevel(day.count)"
                :title="`${day.date}: ${day.count} Qs`"
              />
            </div>
            <div class="heat-legend">
              <span class="leg-txt">Less</span>
              <div v-for="l in ['level-0','level-1','level-2','level-3','level-4']" :key="l" class="heat-cell sm" :class="l" />
              <span class="leg-txt">More</span>
            </div>
          </div>
          <div class="streak-row">
            <div class="sr-stat">
              <span class="sr-val">{{ currentStreak }}</span>
              <span class="sr-label">Current</span>
            </div>
            <div class="sr-divider" />
            <div class="sr-stat">
              <span class="sr-val">{{ longestStreak }}</span>
              <span class="sr-label">Best</span>
            </div>
            <div class="sr-divider" />
            <div class="sr-stat">
              <span class="sr-val">{{ totalActiveDays }}</span>
              <span class="sr-label">Total Days</span>
            </div>
          </div>
        </div>

        <!-- Difficulty breakdown -->
        <div class="panel">
          <div class="panel-header"><span class="panel-tag">By Difficulty</span></div>
          <div class="diff-breakdown">
            <div v-for="d in diffStats" :key="d.label" class="db-row">
              <div class="db-top">
                <span class="db-label" :class="d.cls">{{ d.label }}</span>
                <span class="db-frac">{{ d.correct }}/{{ d.total }}</span>
                <span class="db-pct" :class="d.cls">{{ d.total ? Math.round(d.correct/d.total*100) : 0 }}%</span>
              </div>
              <div class="db-bar"><div class="db-fill" :class="d.cls" :style="{ width: (d.total ? d.correct/d.total*100 : 0) + '%' }" /></div>
            </div>
          </div>
        </div>

        <!-- Top subjects -->
        <div class="panel">
          <div class="panel-header"><span class="panel-tag">Best Subjects</span></div>
          <div class="top-subjects">
            <div v-for="(sub, i) in topSubjects" :key="sub.name" class="ts-row">
              <span class="ts-rank">{{ i + 1 }}</span>
              <span class="ts-name">{{ sub.name }}</span>
              <div class="ts-bar-wrap"><div class="ts-bar-fill" :style="{ width: sub.mastery + '%' }" /></div>
              <span class="ts-pct high">{{ sub.mastery }}%</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="panel">
          <div class="panel-header"><span class="panel-tag">Next Steps</span></div>
          <div class="next-steps">
            <NuxtLink to="/dashboard/mock-exam" class="ns-item">
              <span class="ns-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </span>
              <div class="ns-text">
                <span class="ns-title">Start Mock Exam</span>
                <span class="ns-sub">Timed · 30 questions</span>
              </div>
              <span class="ns-arrow">→</span>
            </NuxtLink>
            <NuxtLink to="/dashboard/question-bank" class="ns-item">
              <span class="ns-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                  <path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/>
                </svg>
              </span>
              <div class="ns-text">
                <span class="ns-title">Drill Weak Topics</span>
                <span class="ns-sub">AI-selected gaps</span>
              </div>
              <span class="ns-arrow">→</span>
            </NuxtLink>
            <NuxtLink to="/dashboard/leaderboard" class="ns-item">
              <span class="ns-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                  <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/>
                </svg>
              </span>
              <div class="ns-text">
                <span class="ns-title">View Leaderboard</span>
                <span class="ns-sub">{{ userRank ? `You're ranked #${userRank}` : 'See how you rank' }}</span>
              </div>
              <span class="ns-arrow">→</span>
            </NuxtLink>
          </div>
        </div>

      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ── Setup ─────────────────────────────────────────────────────
const supabase = useSupabaseClient()
const user     = useSupabaseUser()

const loading       = ref(true)
const period        = ref('30d')
const historyFilter = ref('All')
const hoveredBar    = ref<number | null>(null)

const periods = [
  { val: '7d',  label: '7 Days'    },
  { val: '30d', label: '30 Days'   },
  { val: '3m',  label: '3 Months'  },
  { val: 'all', label: 'All Time'  },
]

// ── Raw state (populated from DB) ────────────────────────────
const allSessions      = ref<any[]>([])   // exam_sessions rows for trend + history
const allResults       = ref<any[]>([])   // exam_results rows (for history table)
const subjectMastery   = ref<any[]>([])   // subject_mastery rows
const weakTopics       = ref<any[]>([])   // topic_mastery rows (low mastery)
const activityMap      = ref<Record<string, number>>({})  // date → questions_answered
const currentStreak    = ref(0)
const longestStreak    = ref(0)
const totalActiveDays  = ref(0)
const userRank         = ref(0)

// ── Helpers ───────────────────────────────────────────────────
/** Read English value from a bilingual JSONB field safely. */
const eng = (field: any, fallback = ''): string => {
  if (!field) return fallback
  if (typeof field === 'string') return field
  return field?.english ?? fallback
}

const formatCount = (n: number) =>
  n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)

/** Returns the start-of-day UTC timestamp for `daysAgo` days before now. */
const daysAgoIso = (daysAgo: number) => {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

/** Format a date string as "Apr 23" */
const fmtDate = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/** Format a date string as "4/23" */
const fmtShortDate = (iso: string) => {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

// ── Period → date filter ──────────────────────────────────────
const periodCutoff = computed((): string | null => {
  if (period.value === '7d')  return daysAgoIso(7)
  if (period.value === '30d') return daysAgoIso(30)
  if (period.value === '3m')  return daysAgoIso(90)
  return null  // 'all'
})

// ── Data fetching ─────────────────────────────────────────────
const fetchAll = async () => {
  if (!user.value) return
  loading.value = true

  await Promise.all([
    fetchSessions(),
    fetchResults(),
    fetchSubjectMastery(),
    fetchWeakTopics(),
    fetchStreakAndActivity(),
    fetchUserRank(),
  ])

  loading.value = false
}

// exam_sessions — used for score trend chart (has completed_at + subject JSONB)
const fetchSessions = async () => {
  const { data } = await supabase
    .from('exam_sessions')
    .select('id, subject, stream, score, exam_type, questions_count, correct_count, wrong_count, skipped_count, completed_at')
    .eq('user_id', user.value!.id)
    .order('completed_at', { ascending: false })
    .limit(100)

  allSessions.value = data ?? []
}

// exam_results — used for the history table (has title + status)
const fetchResults = async () => {
  const { data } = await supabase
    .from('exam_results')
    .select('id, title, subject, score, questions_count, correct_count, wrong_count, skipped_count, exam_type, status, difficulty_breakdown, created_at')
    .eq('user_id', user.value!.id)
    .order('created_at', { ascending: false })
    .limit(200)

  allResults.value = data ?? []
}

// subject_mastery — one row per subject
const fetchSubjectMastery = async () => {
  const { data } = await supabase
    .from('subject_mastery')
    .select('subject, stream, mastery_percent, exams_count, question_count, correct_count, trend')
    .eq('user_id', user.value!.id)
    .order('mastery_percent', { ascending: false })

  subjectMastery.value = (data ?? []).map(s => ({
    name:      eng(s.subject, 'General'),
    stream:    s.stream,
    mastery:   s.mastery_percent,
    exams:     s.exams_count,
    questions: s.question_count,
    trend:     s.trend ?? 0,
    icon:      subjectIcon(eng(s.subject, '')),
  }))
}

// topic_mastery — weak = lowest mastery percent
const fetchWeakTopics = async () => {
  const { data } = await supabase
    .from('topic_mastery')
    .select('topic, subject, stream, mastery_percent, question_count')
    .eq('user_id', user.value!.id)
    .order('mastery_percent', { ascending: true })
    .limit(8)

  weakTopics.value = (data ?? []).map(t => ({
    name:    eng(t.topic, 'General'),
    subject: `${eng(t.subject)} · ${t.stream}`,
    mastery: t.mastery_percent,
  }))
}

// profiles (streak) + daily_activity (heatmap)
const fetchStreakAndActivity = async () => {
  const uid = user.value!.id

  const [{ data: profile }, { data: activity }] = await Promise.all([
    supabase
      .from('profiles')
      .select('streak, longest_streak')
      .eq('user_id', uid)
      .single(),
    supabase
      .from('daily_activity')
      .select('date, questions_answered')
      .eq('user_id', uid)
      .order('date', { ascending: false })
      .limit(365),
  ])

  currentStreak.value  = profile?.streak          ?? 0
  longestStreak.value  = profile?.longest_streak  ?? 0

  const map: Record<string, number> = {}
  let activeDays = 0
  ;(activity ?? []).forEach(a => {
    const key = typeof a.date === 'string' ? a.date : new Date(a.date).toISOString().slice(0, 10)
    map[key] = a.questions_answered
    if (a.questions_answered > 0) activeDays++
  })
  activityMap.value     = map
  totalActiveDays.value = activeDays
}

// leaderboard — user's own rank
const fetchUserRank = async () => {
  const { data } = await supabase
    .from('leaderboard')
    .select('rank')
    .eq('user_id', user.value!.id)
    .single()

  userRank.value = data?.rank ?? 0
}

// ── Re-fetch when period changes ──────────────────────────────
// (sessions are already fully loaded; computed filtering handles the rest)
watch(() => user.value, (u) => { if (u) fetchAll() }, { immediate: true })

// ── Score trend (filtered by period) ─────────────────────────
const scoreTrend = computed(() => {
  let rows = allSessions.value
  if (periodCutoff.value) {
    rows = rows.filter(r => new Date(r.completed_at) >= new Date(periodCutoff.value!))
  }
  // Oldest → newest for chart left-to-right
  return [...rows]
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
    .slice(-20)   // max 20 bars to avoid cramping
    .map(r => ({
      score:     r.score,
      subject:   eng(r.subject, r.stream),
      date:      fmtDate(r.completed_at),
      shortDate: fmtShortDate(r.completed_at),
    }))
})

const avgScore = computed(() => {
  if (!scoreTrend.value.length) return 0
  return Math.round(scoreTrend.value.reduce((s, e) => s + e.score, 0) / scoreTrend.value.length)
})

// ── Exam history table (filtered by period + type) ────────────
const periodFilteredResults = computed(() => {
  let rows = allResults.value
  if (periodCutoff.value) {
    rows = rows.filter(r => new Date(r.created_at) >= new Date(periodCutoff.value!))
  }
  return rows
})

const filteredHistory = computed(() => {
  let rows = periodFilteredResults.value
  if (historyFilter.value === 'Mock')     rows = rows.filter(r => r.exam_type === 'mock')
  if (historyFilter.value === 'Practice') rows = rows.filter(r => r.exam_type === 'practice')
  return rows.map(r => ({
    id:        r.id,
    title:     r.title ?? `${eng(r.subject)} ${examTypeLabel(r.exam_type)}`,
    subject:   eng(r.subject),
    score:     r.score,
    questions: r.questions_count,
    date:      fmtDate(r.created_at),
    type:      r.exam_type === 'practice' ? 'Practice' : 'Mock',
    status:    r.status ?? (r.score >= 50 ? 'passed' : 'failed'),
  }))
})

// ── Header stats ──────────────────────────────────────────────
const headerStats = computed(() => {
  const rows    = periodFilteredResults.value
  const avg     = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
    : 0
  const totalQs = rows.reduce((s, r) => s + (r.questions_count ?? 0), 0)

  return [
    { label: 'Avg Score',   value: avg + '%',             cls: 'high' },
    { label: 'Exams Taken', value: rows.length,           cls: ''     },
    { label: 'Questions',   value: formatCount(totalQs),  cls: ''     },
    { label: 'Rank',        value: userRank.value ? `#${userRank.value}` : '—', cls: '' },
  ]
})

// ── Snapshot stats (sidebar) ──────────────────────────────────
const snapshotStats = computed(() => {
  const rows     = allResults.value
  const weekAgo  = Date.now() - 7 * 86_400_000
  const thisWeek = rows.filter(r => new Date(r.created_at).getTime() > weekAgo)
  const prevWeek = rows.filter(r => {
    const t = new Date(r.created_at).getTime()
    return t > weekAgo - 7 * 86_400_000 && t <= weekAgo
  })

  const avg       = rows.length ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length) : 0
  const prevAvg   = prevWeek.length ? Math.round(prevWeek.reduce((s, r) => s + r.score, 0) / prevWeek.length) : avg
  const avgDelta  = Math.abs(avg - prevAvg)

  // Overall accuracy from correct / total questions
  const totalCorrect = rows.reduce((s, r) => s + (r.correct_count ?? 0), 0)
  const totalQs      = rows.reduce((s, r) => s + (r.questions_count ?? 0), 0)
  const accuracy     = totalQs ? Math.round(totalCorrect / totalQs * 100) : 0

  return [
    {
      label: 'Avg Score',
      value: avg + '%',
      delta: avgDelta + '%',
      up:    avg >= prevAvg,
      icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    },
    {
      label: 'Exams This Week',
      value: thisWeek.length.toString(),
      delta: thisWeek.length >= prevWeek.length
        ? `${thisWeek.length - prevWeek.length} more`
        : `${prevWeek.length - thisWeek.length} less`,
      up:   thisWeek.length >= prevWeek.length,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    },
    {
      label: 'Accuracy',
      value: accuracy + '%',
      delta: accuracy >= 70 ? 'Good' : accuracy >= 50 ? 'Fair' : 'Needs work',
      up:    accuracy >= 60,
      icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg>`,
    },
    {
      label: 'National Rank',
      value: userRank.value ? `#${userRank.value}` : '—',
      delta: 'Leaderboard',
      up:    true,
      icon:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>`,
    },
  ]
})

// ── Difficulty breakdown ──────────────────────────────────────
/**
 * Aggregates difficulty_breakdown JSONB across all exam_results in period.
 * Shape per row: { easy: { correct, total }, medium: {...}, hard: {...} }
 */
const diffStats = computed(() => {
  const totals = {
    easy:   { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard:   { correct: 0, total: 0 },
  }

  periodFilteredResults.value.forEach(r => {
    const bd = r.difficulty_breakdown
    if (!bd) return
    ;(['easy', 'medium', 'hard'] as const).forEach(level => {
      if (bd[level]) {
        totals[level].correct += bd[level].correct ?? 0
        totals[level].total   += bd[level].total   ?? 0
      }
    })
  })

  return [
    { label: 'Easy',   cls: 'easy',   ...totals.easy   },
    { label: 'Medium', cls: 'medium', ...totals.medium  },
    { label: 'Hard',   cls: 'hard',   ...totals.hard    },
  ]
})

// ── Top subjects (best mastery — sorted desc) ─────────────────
const topSubjects = computed(() =>
  [...subjectMastery.value]
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 4)
)

// ── Activity heatmap ──────────────────────────────────────────
const heatmapDays = computed(() => {
  const days: { date: string; count: number }[] = []
  const today = new Date()
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    days.push({ date: key, count: activityMap.value[key] ?? 0 })
  }
  return days
})

// ── Utility functions ─────────────────────────────────────────
function heatLevel(count: number) {
  if (count === 0) return 'level-0'
  if (count < 10)  return 'level-1'
  if (count < 25)  return 'level-2'
  if (count < 50)  return 'level-3'
  return 'level-4'
}

function scoreBarClass(score: number) {
  if (score >= 75) return 'high'
  if (score >= 50) return 'mid'
  return 'low'
}

function masteryClass(pct: number) {
  if (pct >= 70) return 'high'
  if (pct >= 45) return 'mid'
  return 'low'
}

function examTypeLabel(type: string) {
  const map: Record<string, string> = {
    mock: 'Mock', practice: 'Practice', admission: 'Admission',
    engineering: 'Engineering', hsc_ssc: 'Test',
  }
  return map[type] ?? 'Test'
}

/**
 * Returns a subject-appropriate SVG icon string.
 * Matches on common Bangladeshi exam subject names (English).
 */
function subjectIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('physics'))
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`
  if (n.includes('math') || n.includes('calculus') || n.includes('algebra'))
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`
  if (n.includes('chem'))
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v11l-5 7h16l-5-7V3"/></svg>`
  if (n.includes('english') || n.includes('bangla') || n.includes('language'))
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
  if (n.includes('bio') || n.includes('health'))
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`
  if (n.includes('bcs') || n.includes('general') || n.includes('affairs') || n.includes('bangladesh'))
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`
  // Default
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>`
}
</script>

<style scoped>
/* ── Page ────────────────────────────────────────────────── */
.progress-page { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; min-width: 0; overflow-x: hidden; }

/* ── Header ──────────────────────────────────────────────── */
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 2rem; padding: 2rem;
  border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.page-header::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.055) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}
.header-left { position: relative; }
.page-chip {
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
.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-weight: 700; letter-spacing: -1px;
  color: var(--white); line-height: 1.1; margin-bottom: 0.5rem;
}
.page-sub { font-size: 0.83rem; color: var(--gray); max-width: 400px; }

.header-stats {
  display: flex; border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  flex-shrink: 0; position: relative;
  flex-wrap: wrap;
}
.hstat {
  display: flex; flex-direction: column; gap: 3px;
  padding: 1.1rem 1.6rem; border-right: 1px solid var(--border);
  min-width: 90px; text-align: center;
}
.hstat:last-child { border-right: none; }
.hstat-value {
  font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700;
  color: var(--white); letter-spacing: -0.5px;
}
.hstat-value.high { color: rgba(120,230,120,0.9); }
.hstat-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray); }

/* ── Period bar ──────────────────────────────────────────── */
.period-bar {
  display: flex; align-items: center; gap: 1rem;
  padding: 0.8rem 1.4rem;
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.period-label {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
  flex-shrink: 0;
}
.period-pills { display: flex; gap: 6px; }
.period-right { margin-left: auto; }
.updated-at { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }

.filter-pill {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 5px 12px;
  background: transparent; color: var(--gray);
  border: 1px solid var(--border); cursor: pointer;
  transition: all 0.15s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.filter-pill:hover { color: var(--white); border-color: var(--border-bright); }
.filter-pill.active {
  background: var(--white); color: var(--black); border-color: var(--white);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.2), 3px 3px 0 0 rgba(200,200,190,0.15);
}
.small-pill { font-size: 0.58rem !important; padding: 3px 9px !important; }

/* ── Grid ────────────────────────────────────────────────── */
.progress-grid {
  display: grid; grid-template-columns: 1fr 300px;
  gap: 1.5rem; align-items: start;
}
.col-main { display: flex; flex-direction: column; gap: 1.5rem; }
.col-side  { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── Panel ───────────────────────────────────────────────── */
.panel {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.panel-header {
  padding: 0.9rem 1.4rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}
.panel-count { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); }
.panel-link {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--gray); transition: color 0.2s;
}
.panel-link:hover { color: var(--white); }

/* ── Score chart ─────────────────────────────────────────── */
.chart-wrap {
  display: flex; gap: 0;
  padding: 1.4rem 1.4rem 0.8rem;
  height: 240px;
}
.chart-y-axis {
  display: flex; flex-direction: column; justify-content: space-between;
  padding-bottom: 24px;
  width: 28px; flex-shrink: 0;
}
.y-tick {
  font-family: var(--font-mono); font-size: 0.55rem; color: var(--gray);
  text-align: right; line-height: 1;
}
.chart-area {
  flex: 1; position: relative;
  border-left: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.grid-line {
  position: absolute; left: 0; right: 0; height: 1px;
  background: rgba(240,240,234,0.05);
}
.avg-line {
  position: absolute; left: 0; right: 0; height: 1px;
  background: rgba(240,240,234,0.25);
  border-top: 1px dashed rgba(240,240,234,0.25);
  transition: bottom 0.4s ease;
}
.chart-legend {
  display: flex; gap: 14px; align-items: center;
}
.leg-item {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.58rem; color: var(--gray);
}
.leg-line { display: block; width: 18px; height: 1px; background: rgba(240,240,234,0.4); }
.leg-line.dashed { background: none; border-top: 1px dashed rgba(240,240,234,0.35); }

.bars-row {
  position: absolute; inset: 0;
  display: flex; align-items: flex-end;
  gap: 2px; padding: 0 8px;
}
.bar-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  height: 100%; position: relative;
  padding-bottom: 22px;
  cursor: pointer;
}
.bar {
  width: 100%; max-width: 32px;
  transition: height 0.6s cubic-bezier(.4,0,.2,1), opacity 0.2s;
  opacity: 0.75;
}
.bar:hover, .bar-col:hover .bar { opacity: 1; }
.bar.high { background: rgba(120,230,120,0.55); }
.bar.mid  { background: rgba(255,200,80,0.55); }
.bar.low  { background: rgba(255,100,100,0.5); }

.bar-label {
  position: absolute; bottom: 2px;
  font-family: var(--font-mono); font-size: 0.52rem; color: var(--gray);
}

.bar-tooltip {
  position: absolute; bottom: calc(100% - 14px);
  background: #111; border: 1px solid var(--border-bright);
  padding: 8px 10px; z-index: 10;
  display: flex; flex-direction: column; gap: 3px;
  white-space: nowrap; pointer-events: none;
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.08);
}
.tt-score {
  font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--white);
}
.tt-label { font-size: 0.68rem; color: var(--dim); }
.tt-date  { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }

/* ── Subject mastery grid ────────────────────────────────── */
.mastery-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 1px; background: var(--border);
}
.mastery-card {
  background: #0d0d0d; padding: 1.2rem;
  display: flex; flex-direction: column; gap: 10px;
  transition: background 0.15s;
}
.mastery-card:hover { background: #111; }
.mc-top { display: flex; align-items: center; gap: 10px; }
.mc-icon { color: var(--gray); flex-shrink: 0; }
.mc-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.mc-name { font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700; color: var(--white); }
.mc-stream { font-size: 0.65rem; color: var(--gray); }
.mc-pct { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; flex-shrink: 0; }
.mc-bar-wrap { height: 2px; background: var(--border); }
.mc-bar-fill { height: 100%; transition: width 0.6s ease; }
.mc-bottom { display: flex; align-items: center; gap: 10px; }
.mc-stat { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }
.mc-trend { margin-left: auto; font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; }
.mc-trend.up   { color: rgba(120,230,120,0.8); }
.mc-trend.down { color: rgba(255,100,100,0.8); }

/* Shared mastery/score color classes */
.high { color: rgba(120,230,120,0.9); }
.mid  { color: rgba(255,200,80,0.9); }
.low  { color: rgba(255,100,100,0.8); }
.mc-bar-fill.high { background: rgba(120,230,120,0.5); }
.mc-bar-fill.mid  { background: rgba(255,200,80,0.5); }
.mc-bar-fill.low  { background: rgba(255,100,100,0.5); }

/* ── Weak topics ─────────────────────────────────────────── */
.weak-list { display: flex; flex-direction: column; }
.weak-row {
  display: flex; align-items: center; gap: 14px;
  padding: 0.9rem 1.4rem; border-bottom: 1px solid var(--border);
  animation: fadeSlideUp 0.35s ease both;
}
.weak-row:last-child { border-bottom: none; }
@keyframes fadeSlideUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }

.wr-left { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.wr-rank {
  font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
  color: var(--gray); width: 20px;
}
.wr-info { display: flex; flex-direction: column; gap: 2px; min-width: 140px; }
.wr-name { font-size: 0.82rem; font-weight: 600; color: var(--white); }
.wr-sub  { font-size: 0.65rem; color: var(--gray); }

.wr-center { flex: 1; }
.wr-bar-wrap { height: 2px; background: var(--border); }
.wr-bar-fill { height: 100%; transition: width 0.5s ease; }
.wr-bar-fill.high { background: rgba(120,230,120,0.5); }
.wr-bar-fill.mid  { background: rgba(255,200,80,0.5); }
.wr-bar-fill.low  { background: rgba(255,100,100,0.5); }

.wr-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.wr-pct { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; width: 36px; text-align: right; }
.wr-drill {
  font-size: 0.58rem !important; padding: 5px 10px !important;
  letter-spacing: 0.08em;
}

/* ── History table ───────────────────────────────────────── */
.table-filters { display: flex; gap: 5px; }
.history-table { display: flex; flex-direction: column; }
.ht-header {
  display: grid; grid-template-columns: 2fr 1fr 60px 40px 80px 70px;
  gap: 0; padding: 0.6rem 1.4rem;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray);
}
.ht-row {
  display: grid; grid-template-columns: 2fr 1fr 60px 40px 80px 70px;
  gap: 0; padding: 0.8rem 1.4rem;
  border-bottom: 1px solid var(--border);
  align-items: center; transition: background 0.15s;
}
.ht-row:last-child { border-bottom: none; }
.ht-row:hover { background: rgba(240,240,234,0.02); }
.ht-title   { font-size: 0.82rem; color: var(--white); }
.ht-subject { font-size: 0.75rem; color: var(--gray); }
.ht-score   { font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; }
.ht-qs      { font-family: var(--font-mono); font-size: 0.75rem; color: var(--gray); }
.ht-date    { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.ht-status  {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 2px 8px; border: 1px solid;
  width: fit-content;
}
.ht-status.passed { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.25); }
.ht-status.failed { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }

/* ── Snapshot stats ──────────────────────────────────────── */
.snap-stats { display: flex; flex-direction: column; }
.snap-stat {
  display: flex; align-items: center; gap: 10px;
  padding: 0.85rem 1.2rem; border-bottom: 1px solid var(--border);
}
.snap-stat:last-child { border-bottom: none; }
.snap-icon { color: var(--gray); flex-shrink: 0; }
.snap-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.snap-value { font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700; color: var(--white); }
.snap-label { font-size: 0.65rem; color: var(--gray); }
.snap-delta { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; flex-shrink: 0; }
.snap-delta.up   { color: rgba(120,230,120,0.8); }
.snap-delta.down { color: rgba(255,100,100,0.8); }

/* ── Heatmap ─────────────────────────────────────────────── */
.heat-wrap { padding: 1.1rem 1.2rem 0.5rem; overflow-x: auto; }
.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 1fr);
  grid-auto-flow: column;
  gap: 3px; margin-bottom: 8px;
  min-width: min-content;
}
.heat-cell {
  width: 11px; height: 11px;
  border: 1px solid rgba(240,240,234,0.06);
  cursor: default; transition: transform 0.15s;
}
.heat-cell:hover { transform: scale(1.3); }
.heat-cell.sm { width: 9px; height: 9px; }
.level-0 { background: #111; }
.level-1 { background: rgba(240,240,234,0.12); }
.level-2 { background: rgba(240,240,234,0.28); }
.level-3 { background: rgba(240,240,234,0.55); }
.level-4 { background: rgba(240,240,234,0.9); }

.heat-legend {
  display: flex; align-items: center; gap: 4px;
  justify-content: flex-end; margin-top: 4px;
}
.leg-txt { font-family: var(--font-mono); font-size: 0.55rem; color: var(--gray); }

.streak-row {
  display: flex; align-items: center;
  border-top: 1px solid var(--border); padding: 0.9rem 1.2rem;
}
.sr-stat { flex: 1; display: flex; flex-direction: column; gap: 3px; align-items: center; }
.sr-val  { font-family: var(--font-mono); font-size: 1.2rem; font-weight: 700; color: var(--white); }
.sr-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }
.sr-divider { width: 1px; height: 32px; background: var(--border); }

/* ── Difficulty breakdown ────────────────────────────────── */
.diff-breakdown { padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem; }
.db-row { display: flex; flex-direction: column; gap: 6px; }
.db-top { display: flex; align-items: center; gap: 8px; }
.db-label {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em; flex: 1;
}
.db-label.easy   { color: rgba(120,230,120,0.8); }
.db-label.medium { color: rgba(255,200,80,0.8); }
.db-label.hard   { color: rgba(255,100,100,0.8); }
.db-frac { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); }
.db-pct  { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; width: 36px; text-align: right; }
.db-pct.easy   { color: rgba(120,230,120,0.8); }
.db-pct.medium { color: rgba(255,200,80,0.8); }
.db-pct.hard   { color: rgba(255,100,100,0.8); }
.db-bar  { height: 2px; background: var(--border); }
.db-fill { height: 100%; transition: width 0.6s ease; }
.db-fill.easy   { background: rgba(120,230,120,0.6); }
.db-fill.medium { background: rgba(255,200,80,0.6); }
.db-fill.hard   { background: rgba(255,100,100,0.6); }

/* ── Top subjects ────────────────────────────────────────── */
.top-subjects { display: flex; flex-direction: column; }
.ts-row {
  display: flex; align-items: center; gap: 10px;
  padding: 0.75rem 1.2rem; border-bottom: 1px solid var(--border);
}
.ts-row:last-child { border-bottom: none; }
.ts-rank { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); width: 14px; }
.ts-name { font-size: 0.78rem; color: var(--white); width: 90px; }
.ts-bar-wrap { flex: 1; height: 2px; background: var(--border); }
.ts-bar-fill { height: 100%; background: rgba(120,230,120,0.4); transition: width 0.6s ease; }
.ts-pct { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; width: 36px; text-align: right; }

/* ── Next steps ──────────────────────────────────────────── */
.next-steps { display: flex; flex-direction: column; }
.ns-item {
  display: flex; align-items: center; gap: 12px;
  padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border);
  text-decoration: none; cursor: pointer; background: transparent;
  transition: background 0.15s;
}
.ns-item:last-child { border-bottom: none; }
.ns-item:hover { background: rgba(240,240,234,0.03); }
.ns-icon {
  width: 30px; height: 30px; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray); flex-shrink: 0;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.ns-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.ns-title { font-size: 0.78rem; font-weight: 600; color: var(--white); }
.ns-sub   { font-size: 0.65rem; color: var(--gray); }
.ns-arrow { font-family: var(--font-mono); font-size: 0.72rem; color: var(--gray); }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1100px) {
  .progress-grid { grid-template-columns: 1fr; }
  .col-side { display: grid; grid-template-columns: repeat(2, 1fr); }
  .mastery-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-stats { width: 100%; flex-wrap: wrap; box-sizing: border-box; }
  .hstat { flex: 1; min-width: 80px; box-sizing: border-box; }
  .mastery-grid { grid-template-columns: repeat(2, 1fr); }
  .col-side { grid-template-columns: 1fr; }
  .ht-header, .ht-row { grid-template-columns: 2fr 60px 80px 70px; }
  .ht-header span:nth-child(2), .ht-row .ht-subject,
  .ht-header span:nth-child(4), .ht-row .ht-qs { display: none; }
  .period-bar { flex-wrap: wrap; }
}
@media (max-width: 480px) {
  .page-header { padding: 1.2rem; }
  .page-title { font-size: 1.4rem; }
  .header-stats { overflow-x: hidden; }
  .hstat { padding: 0.8rem 1rem; min-width: 70px; }
  .hstat-value { font-size: 1.1rem; }
  .mastery-grid { grid-template-columns: 1fr; }
  .mastery-card { padding: 1rem; }
  .weak-row { flex-wrap: wrap; gap: 8px; }
  .wr-center { width: 100%; order: 3; }
  .wr-info { min-width: 0; }
  .ht-header, .ht-row { grid-template-columns: 2fr 60px 70px; padding: 0.7rem 1rem; }
  .ht-header span:nth-child(5), .ht-row .ht-date { display: none; }
  .heatmap-grid { gap: 2px; }
  .heat-cell { width: 9px; height: 9px; }
  .chart-wrap { padding: 1rem 0.8rem 0.6rem; height: 200px; }
  .panel { overflow-x: hidden; }
}
</style>
