/**
 * useDashboard
 *
 * Fetches and derives all data required for the dashboard overview.
 * In production these hit real Supabase tables; fallback demo data
 * is used automatically when tables don't exist yet.
 *
 * Tables expected (see README for schema):
 *   - exam_results  (user_id, score, subject, created_at, questions_count)
 *   - daily_activity (user_id, date, questions_answered)
 *   - profiles      (user_id, streak, longest_streak)
 */
export const useDashboard = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const loading = ref(true)
  const error = ref<string | null>(null)

  // ── State ─────────────────────────────────────────────
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

  // ── Fetch ──────────────────────────────────────────────
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

  // ── Stats cards ────────────────────────────────────────
  const fetchStats = async () => {
    const { data, error: err } = await supabase
      .from('exam_results')
      .select('score, questions_count, created_at')
      .eq('user_id', user.value!.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (err || !data?.length) {
      // Demo fallback
      stats.value = getDemoStats()
      return
    }

    const avgScore = Math.round(data.reduce((s, r) => s + r.score, 0) / data.length)
    const totalQs  = data.reduce((s, r) => s + (r.questions_count ?? 0), 0)
    const thisWeek = data.filter(r => {
      const d = new Date(r.created_at)
      return (Date.now() - d.getTime()) < 7 * 86400 * 1000
    })

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
        value: data.length.toString(),
        delta: thisWeek.length + ' this week',
        trend: 'up',
        percent: Math.min(data.length * 2, 100),
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
      },
      {
        label: 'Questions Done',
        value: totalQs >= 1000 ? (totalQs / 1000).toFixed(1) + 'K' : totalQs.toString(),
        delta: '+' + (thisWeek.reduce((s, r) => s + (r.questions_count ?? 0), 0)),
        trend: 'up',
        percent: Math.min(totalQs / 10, 100),
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
      },
      {
        label: 'National Rank',
        value: '#' + (userRank.value || '—'),
        delta: 'Top 10%',
        trend: 'up',
        percent: 70,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>`,
      },
    ]
  }

  // ── Recent activity ────────────────────────────────────
  const fetchRecentActivity = async () => {
    const { data, error: err } = await supabase
      .from('exam_results')
      .select('id, subject, score, created_at, exam_type')
      .eq('user_id', user.value!.id)
      .order('created_at', { ascending: false })
      .limit(7)

    if (err || !data?.length) {
      recentActivity.value = getDemoActivity()
      return
    }

    recentActivity.value = data.map(r => ({
      id: r.id,
      type: r.exam_type ?? 'exam',
      title: `${r.subject} Test`,
      subject: r.subject,
      time: timeAgo(r.created_at),
      score: r.score,
    }))
  }

  // ── Streak ─────────────────────────────────────────────
  const fetchStreakData = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak, longest_streak')
      .eq('user_id', user.value!.id)
      .single()

    const { data: activity } = await supabase
      .from('daily_activity')
      .select('date, questions_answered')
      .eq('user_id', user.value!.id)

    const actMap: Record<string, number> = {}
    let totalDays = 0
    if (activity) {
      activity.forEach(a => {
        actMap[a.date] = a.questions_answered
        if (a.questions_answered > 0) totalDays++
      })
    }

    streakData.value = {
      currentStreak: profile?.streak ?? getDemoStreak().currentStreak,
      longestStreak: profile?.longest_streak ?? getDemoStreak().longestStreak,
      totalDays: totalDays || getDemoStreak().totalDays,
      activityData: Object.keys(actMap).length ? actMap : getDemoStreak().activityData,
    }
  }

  // ── Leaderboard ────────────────────────────────────────
  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('leaderboard')
      .select('rank, user_id, display_name, total_score')
      .order('rank', { ascending: true })
      .limit(7)

    if (!data?.length) {
      leaderboardEntries.value = getDemoLeaderboard()
      userRank.value = 142
      return
    }

    leaderboardEntries.value = data.map(r => ({
      rank: r.rank,
      name: r.display_name,
      initials: r.display_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
      score: r.total_score,
      isYou: r.user_id === user.value!.id,
    }))

    const myEntry = data.find(r => r.user_id === user.value!.id)
    if (myEntry) userRank.value = myEntry.rank
  }

  // ── Recommended topics ────────────────────────────────
  const fetchRecommended = async () => {
    const { data } = await supabase
      .from('topic_mastery')
      .select('topic, subject, mastery_percent, question_count')
      .eq('user_id', user.value!.id)
      .order('mastery_percent', { ascending: true })
      .limit(5)

    if (!data?.length) {
      recommendedTopics.value = getDemoTopics()
      return
    }

    recommendedTopics.value = data.map(t => ({
      name: t.topic,
      subject: t.subject,
      mastery: t.mastery_percent,
      questions: t.question_count,
      to: `/dashboard/question-bank?topic=${encodeURIComponent(t.topic)}`,
    }))
  }

  // ── Demo fallbacks ─────────────────────────────────────
  const getDemoStats = () => [
    { label: 'Avg Score',      value: '74%',   delta: '2.4%',      trend: 'up',   percent: 74, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
    { label: 'Exams Taken',    value: '38',    delta: '5 this week', trend: 'up',  percent: 38, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
    { label: 'Questions Done', value: '2.4K',  delta: '+180 today',  trend: 'up',  percent: 62, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>` },
    { label: 'National Rank',  value: '#142',  delta: 'Top 10%',     trend: 'up',  percent: 80, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>` },
  ]

  const getDemoActivity = () => [
    { id: 1, type: 'exam',     title: 'HSC Physics Mock',     subject: 'Physics',    time: '2h ago',       score: 88 },
    { id: 2, type: 'practice', title: 'BCS General Practice', subject: 'BCS',        time: 'Yesterday',    score: 72 },
    { id: 3, type: 'exam',     title: 'Chemistry Full Test',  subject: 'Chemistry',  time: '2 days ago',   score: 65 },
    { id: 4, type: 'ai',       title: 'AI Doubt Session',     subject: 'Math',       time: '3 days ago',   score: 91 },
    { id: 5, type: 'practice', title: 'English Practice',     subject: 'English',    time: '4 days ago',   score: 79 },
    { id: 6, type: 'exam',     title: 'SSC Science Mock',     subject: 'Science',    time: '5 days ago',   score: 55 },
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
    { rank: 1,   name: 'Farhan Rahman',   initials: 'FR', score: 18420, isYou: false },
    { rank: 2,   name: 'Nusrat Jahan',    initials: 'NJ', score: 17850, isYou: false },
    { rank: 3,   name: 'Sabbir Ahmed',    initials: 'SA', score: 17200, isYou: false },
    { rank: 4,   name: 'Mim Akter',       initials: 'MA', score: 16780, isYou: false },
    { rank: 5,   name: 'Riyadh Islam',    initials: 'RI', score: 16100, isYou: false },
    { rank: 142, name: 'You',             initials: 'ME', score: 9240,  isYou: true  },
  ]

  const getDemoTopics = () => [
    { name: 'Electrochemistry',    subject: 'Chemistry · HSC', mastery: 28, questions: 120, to: '/dashboard/question-bank' },
    { name: 'Optics & Wave',       subject: 'Physics · HSC',   mastery: 35, questions: 98,  to: '/dashboard/question-bank' },
    { name: 'Bangladesh Affairs',  subject: 'BCS General',     mastery: 42, questions: 200, to: '/dashboard/question-bank' },
    { name: 'Integration',         subject: 'Math · HSC',      mastery: 58, questions: 85,  to: '/dashboard/question-bank' },
    { name: 'English Grammar',     subject: 'English · BCS',   mastery: 71, questions: 150, to: '/dashboard/question-bank' },
  ]

  // ── Utils ──────────────────────────────────────────────
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1)  return 'Just now'
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d === 1) return 'Yesterday'
    return `${d} days ago`
  }

  return {
    loading, error,
    stats, recentActivity, leaderboardEntries,
    recommendedTopics, streakData, userRank, totalStudents,
    fetchDashboard,
  }
}
