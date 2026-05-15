/**
 * useDashboard
 *
 * Fetches and derives all data required for the dashboard overview.
 * Mapped to the actual Supabase schema (supabase-schema__Test_V1_.sql).
 *
 * Tables used:
 *   - profiles         (user_id, streak, longest_streak)
 *   - exam_sessions    (user_id, score, subject, stream, exam_type, questions_count, completed_at, correct_count, wrong_count)
 *   - exam_results     (user_id, score, subject, exam_type, questions_count, created_at, title)
 *   - daily_activity   (user_id, date, questions_answered)
 *   - leaderboard      (rank, user_id, display_name, initials, total_score)
 *   - topic_mastery    (user_id, topic, subject, mastery_percent, question_count)
 *
 * JSONB bilingual fields (e.g. subject, chapter) are read as
 * { english: string, bangla: string }. The helpers below extract
 * the English value with a safe fallback.
 */

// ── Helpers ────────────────────────────────────────────────────
/** Safely read the English text from a bilingual JSONB field. */
const eng = (field: any, fallback = ''): string => {
  if (!field) return fallback
  if (typeof field === 'string') return field
  return field?.english ?? fallback
}

/** Format a number as "1.4K" when ≥ 1000. */
const formatCount = (n: number): string =>
  n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n)

/** Human-readable relative time. */
const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  if (h < 1) return 'Just now'
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'Yesterday'
  return `${d} days ago`
}

// ── Composable ─────────────────────────────────────────────────
export const useDashboard = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const loading = ref(true)
  const error = ref<string | null>(null)

  // ── State ────────────────────────────────────────────────────
  const stats = ref<any[]>([])
  const recentActivity = ref<any[]>([])
  const leaderboardEntries = ref<any[]>([])
  const recommendedTopics = ref<any[]>([])
  const streakData = ref({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    activityData: {} as Record<string, number>,
  })
  const userRank = ref(0)
  const totalStudents = ref('500K+')

  // ── Orchestrator ─────────────────────────────────────────────
  const fetchDashboard = async () => {
    if (!user.value) return
    loading.value = true
    error.value = null

    try {
      await Promise.all([
        fetchStats(),
        fetchRecentActivity(),
        fetchStreakData(),
        fetchLeaderboard(),
        fetchRecommended(),
      ])
    } catch (e: any) {
      error.value = e?.message ?? 'Failed to load dashboard data.'
    } finally {
      loading.value = false
    }
  }

  // ── Stats cards ───────────────────────────────────────────────
  /**
   * Primary source: exam_sessions (the canonical result table).
   * Falls back to exam_results for backward-compat, then demo data.
   *
   * Columns used:
   *   score, questions_count, correct_count, completed_at
   */
  const fetchStats = async () => {
    const uid = user.value!.id

    const { data, error: err } = await supabase
      .from('exam_sessions')
      .select('score, questions_count, correct_count, completed_at')
      .eq('user_id', uid)
      .order('completed_at', { ascending: false })
      .limit(50)

    // Graceful fallback to exam_results if exam_sessions has no rows yet
    if (err || !data?.length) {
      const { data: legacyData } = await supabase
        .from('exam_results')
        .select('score, questions_count, created_at')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!legacyData?.length) {
        stats.value = getDemoStats()
        return
      }

      buildStats(
        legacyData.map(r => ({ ...r, completed_at: r.created_at }))
      )
      return
    }

    buildStats(data)
  }

  const buildStats = (
    rows: { score: number; questions_count?: number | null; completed_at: string }[]
  ) => {
    const weekAgo = Date.now() - 7 * 86_400_000
    const thisWeek = rows.filter(r => new Date(r.completed_at).getTime() > weekAgo)
    const avgScore = Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
    const totalQs = rows.reduce((s, r) => s + (r.questions_count ?? 0), 0)
    const weekQs = thisWeek.reduce((s, r) => s + (r.questions_count ?? 0), 0)

    stats.value = [
      {
        label: 'Avg Score',
        value: avgScore + '%',
        delta: '2.4%',
        trend: 'up',
        percent: avgScore,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
      },
      {
        label: 'Exams Taken',
        value: rows.length.toString(),
        delta: thisWeek.length + ' this week',
        trend: 'up',
        percent: Math.min(rows.length * 2, 100),
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      },
      {
        label: 'Questions Done',
        value: formatCount(totalQs),
        delta: '+' + weekQs + ' this week',
        trend: 'up',
        percent: Math.min(totalQs / 10, 100),
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
      },
      {
        label: 'National Rank',
        value: userRank.value ? '#' + userRank.value : '#—',
        delta: 'Top 10%',
        trend: 'up',
        percent: 70,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>`,
      },
    ]
  }

  // ── Recent activity ───────────────────────────────────────────
  /**
   * Source: exam_results (has a human-readable `title` column).
   * Falls back to exam_sessions if exam_results is empty.
   *
   * Columns used:
   *   id, title, subject (JSONB), score, exam_type, created_at
   */
  const fetchRecentActivity = async () => {
    const uid = user.value!.id

    const { data, error: err } = await supabase
      .from('exam_results')
      .select('id, title, subject, score, exam_type, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(7)

    if (err || !data?.length) {
      // Try exam_sessions as fallback
      const { data: sessions } = await supabase
        .from('exam_sessions')
        .select('id, subject, stream, score, exam_type, completed_at')
        .eq('user_id', uid)
        .order('completed_at', { ascending: false })
        .limit(7)

      if (!sessions?.length) {
        recentActivity.value = getDemoActivity()
        return
      }

      recentActivity.value = sessions.map(s => ({
        id: s.id,
        type: normalizeExamType(s.exam_type),
        title: `${eng(s.subject, s.stream)} ${formatExamTypeLabel(s.exam_type)}`,
        subject: eng(s.subject, s.stream),
        time: timeAgo(s.completed_at),
        score: s.score,
      }))
      return
    }

    recentActivity.value = data.map(r => ({
      id: r.id,
      type: normalizeExamType(r.exam_type),
      title: r.title ?? `${eng(r.subject)} ${formatExamTypeLabel(r.exam_type)}`,
      subject: eng(r.subject),
      time: timeAgo(r.created_at),
      score: r.score,
    }))
  }

  // ── Streak ────────────────────────────────────────────────────
  /**
   * Sources:
   *   profiles      → streak, longest_streak
   *   daily_activity → date, questions_answered (for the heatmap)
   */
  const fetchStreakData = async () => {
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

    const actMap: Record<string, number> = {}
    let totalDays = 0

    if (activity?.length) {
      activity.forEach(a => {
        // `date` is a Postgres date type — comes back as 'YYYY-MM-DD'
        const key = typeof a.date === 'string' ? a.date : new Date(a.date).toISOString().slice(0, 10)
        actMap[key] = a.questions_answered
        if (a.questions_answered > 0) totalDays++
      })
    }

    const demo = getDemoStreak()

    streakData.value = {
      currentStreak: profile?.streak ?? demo.currentStreak,
      longestStreak: profile?.longest_streak ?? demo.longestStreak,
      totalDays: totalDays || demo.totalDays,
      activityData: Object.keys(actMap).length ? actMap : demo.activityData,
    }
  }

  // ── Leaderboard ───────────────────────────────────────────────
  /**
   * Source: leaderboard table
   * Columns: rank, user_id, display_name, initials, total_score
   *
   * Shows top 5 + the current user's row (may be outside top 5).
   */
  const fetchLeaderboard = async () => {
    const uid = user.value!.id

    // Fetch top 5
    const { data: top } = await supabase
      .from('leaderboard')
      .select('rank, user_id, display_name, initials, total_score')
      .order('rank', { ascending: true })
      .limit(5)

    // Fetch the current user's own entry separately (they may be rank 500+)
    const { data: myEntry } = await supabase
      .from('leaderboard')
      .select('rank, user_id, display_name, initials, total_score')
      .eq('user_id', uid)
      .single()

    if (!top?.length && !myEntry) {
      leaderboardEntries.value = getDemoLeaderboard()
      userRank.value = 142
      return
    }

    const rows = top ?? []

    // Append user row if not already in top 5
    if (myEntry && !rows.find(r => r.user_id === uid)) {
      rows.push(myEntry)
    }

    leaderboardEntries.value = rows.map(r => ({
      rank: r.rank ?? 0,
      name: r.user_id === uid ? 'You' : r.display_name,
      initials: r.initials ?? r.display_name.slice(0, 2).toUpperCase(),
      score: r.total_score,
      isYou: r.user_id === uid,
    }))

    if (myEntry) userRank.value = myEntry.rank ?? 0
  }

  // ── Recommended topics ────────────────────────────────────────
  /**
   * Source: topic_mastery table (lowest mastery = biggest opportunity)
   *
   * Columns: topic (JSONB), subject (JSONB), stream, mastery_percent,
   *          question_count
   *
   * Falls back to subject_mastery if topic_mastery is empty.
   */
  const fetchRecommended = async () => {
    const uid = user.value!.id

    const { data, error: err } = await supabase
      .from('topic_mastery')
      .select('topic, subject, stream, mastery_percent, question_count')
      .eq('user_id', uid)
      .order('mastery_percent', { ascending: true })
      .limit(5)

    if (err || !data?.length) {
      // Fallback: use subject_mastery
      const { data: subjectData } = await supabase
        .from('subject_mastery')
        .select('subject, stream, mastery_percent, question_count')
        .eq('user_id', uid)
        .order('mastery_percent', { ascending: true })
        .limit(5)

      if (!subjectData?.length) {
        recommendedTopics.value = getDemoTopics()
        return
      }

      recommendedTopics.value = subjectData.map(s => ({
        name: eng(s.subject, 'General'),
        subject: `${eng(s.subject)} · ${s.stream}`,
        mastery: s.mastery_percent,
        questions: s.question_count,
        to: `/dashboard/question-bank?subject=${encodeURIComponent(eng(s.subject))}`,
      }))
      return
    }

    recommendedTopics.value = data.map(t => ({
      name: eng(t.topic, 'General'),
      subject: `${eng(t.subject)} · ${t.stream}`,
      mastery: t.mastery_percent,
      questions: t.question_count,
      to: `/dashboard/question-bank?topic=${encodeURIComponent(eng(t.topic))}`,
    }))
  }

  // ── Utility: exam type normalisation ─────────────────────────
  /** Maps DB exam_type values to the icon keys used in DashActivity.vue */
  const normalizeExamType = (type: string): 'exam' | 'practice' | 'ai' => {
    if (type === 'practice') return 'practice'
    if (type === 'ai') return 'ai'
    return 'exam'
  }

  /** Human-readable exam type label for auto-generated titles */
  const formatExamTypeLabel = (type: string): string => {
    const map: Record<string, string> = {
      mock: 'Mock',
      practice: 'Practice',
      admission: 'Admission Test',
      engineering: 'Engineering Test',
      hsc_ssc: 'Test',
    }
    return map[type] ?? 'Test'
  }

  // ── Demo fallbacks ─────────────────────────────────────────────
  // Shown when the user has no data yet (new account) or tables are empty.

  const getDemoStats = () => [
    { label: 'Avg Score', value: '74%', delta: '2.4%', trend: 'up', percent: 74, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
    { label: 'Exams Taken', value: '38', delta: '5 this week', trend: 'up', percent: 38, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
    { label: 'Questions Done', value: '2.4K', delta: '+180 this week', trend: 'up', percent: 62, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>` },
    { label: 'National Rank', value: '#—', delta: 'Not ranked yet', trend: 'flat', percent: 0, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>` },
  ]

  const getDemoActivity = () => [
    { id: 1, type: 'exam', title: 'HSC Physics Mock', subject: 'Physics', time: '2h ago', score: 88 },
    { id: 2, type: 'practice', title: 'BCS General Practice', subject: 'BCS', time: 'Yesterday', score: 72 },
    { id: 3, type: 'exam', title: 'Chemistry Full Test', subject: 'Chemistry', time: '2 days ago', score: 65 },
    { id: 4, type: 'ai', title: 'AI Doubt Session', subject: 'Math', time: '3 days ago', score: 91 },
    { id: 5, type: 'practice', title: 'English Practice', subject: 'English', time: '4 days ago', score: 79 },
    { id: 6, type: 'exam', title: 'SSC Science Mock', subject: 'Science', time: '5 days ago', score: 55 },
  ]

  const getDemoStreak = () => {
    const data: Record<string, number> = {}
    const today = new Date()
    for (let i = 0; i < 84; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      data[key] = i < 14
        ? Math.floor(Math.random() * 60) + 5
        : Math.random() > 0.35
          ? Math.floor(Math.random() * 40)
          : 0
    }
    return { currentStreak: 14, longestStreak: 22, totalDays: 51, activityData: data }
  }

  const getDemoLeaderboard = () => [
    { rank: 1, name: 'Farhan Rahman', initials: 'FR', score: 18420, isYou: false },
    { rank: 2, name: 'Nusrat Jahan', initials: 'NJ', score: 17850, isYou: false },
    { rank: 3, name: 'Sabbir Ahmed', initials: 'SA', score: 17200, isYou: false },
    { rank: 4, name: 'Mim Akter', initials: 'MA', score: 16780, isYou: false },
    { rank: 5, name: 'Riyadh Islam', initials: 'RI', score: 16100, isYou: false },
    { rank: 142, name: 'You', initials: 'ME', score: 9240, isYou: true },
  ]

  const getDemoTopics = () => [
    { name: 'Electrochemistry', subject: 'Chemistry · HSC', mastery: 28, questions: 120, to: '/dashboard/question-bank' },
    { name: 'Optics & Wave', subject: 'Physics · HSC', mastery: 35, questions: 98, to: '/dashboard/question-bank' },
    { name: 'Bangladesh Affairs', subject: 'BCS General', mastery: 42, questions: 200, to: '/dashboard/question-bank' },
    { name: 'Integration', subject: 'Math · HSC', mastery: 58, questions: 85, to: '/dashboard/question-bank' },
    { name: 'English Grammar', subject: 'English · BCS', mastery: 71, questions: 150, to: '/dashboard/question-bank' },
  ]

  // ── Public API ─────────────────────────────────────────────────
  return {
    loading, error,
    stats, recentActivity, leaderboardEntries,
    recommendedTopics, streakData, userRank, totalStudents,
    fetchDashboard,
  }
}
