// composables/useRoutine.ts
// ---------------------------------------------------------------------------
// Routine builder (manual + Gemini-assisted "auto") + target tracking +
// XP/level + achievement system.
//
// State lives at module scope so every component calling useRoutine() shares
// the same instance (same convention as useAuth/useDashboard).
//
// NOT YET PERSISTED — everything resets on reload. The intended wiring is a
// `routine_blocks` / `targets` table (mirrors exam_results / topic_mastery)
// or, for a fast path, a `routine_state` JSON column on `profiles` the same
// way `exam_prefs` already works in settings.vue. See ROUTINE-SETUP.md.
// ---------------------------------------------------------------------------

export interface RoutineBlock {
  id: string
  dayKey: string // 'mon'..'sun' for weekly plans, or an ISO date (YYYY-MM-DD) for countdown plans
  subject: string
  topic: string
  start: string // 'HH:MM'
  duration: number // minutes
  completed: boolean
}

export type TargetType = 'topic-completion' | 'score-threshold' | 'study-hours'

export interface Target {
  id: string
  title: string
  subject: string
  type: TargetType
  targetValue: number
  currentValue: number
  deadline: string | null // ISO date
  tier: 1 | 2 | 3 | 4
  completed: boolean
}

export interface Achievement {
  id: string
  name: string
  desc: string
  tier: 1 | 2 | 3 | 4
  unlocked: boolean
  unlockedAt: string | null
}

export const TIER_LABEL: Record<number, string> = { 1: 'Bronze', 2: 'Silver', 3: 'Gold', 4: 'Platinum' }
export const TIER_XP: Record<number, number> = { 1: 60, 2: 120, 3: 220, 4: 400 }

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}
function addDays(n: number) {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// ── module-scoped shared state ─────────────────────────────────────────
const mode = ref<'manual' | 'auto'>('manual')
const planType = ref<'weekly' | 'countdown'>('weekly')
const blocks = ref<RoutineBlock[]>([])
const examDate = ref<string>('')
const totalXp = ref<number>(180) // demo starting XP so the level/badge UI isn't empty on first load
const generating = ref(false)
const genSource = ref<'gemini' | 'demo' | 'demo-fallback' | null>(null)
const dailyTip = ref<string>('')
const tipSource = ref<'gemini' | 'demo' | 'demo-fallback' | null>(null)

const targets = ref<Target[]>([
  { id: uid(), title: 'Finish Algebra basics', subject: 'Math', type: 'topic-completion', targetValue: 20, currentValue: 12, deadline: addDays(7), tier: 2, completed: false },
  { id: uid(), title: 'Score 80%+ in a Physics mock', subject: 'Physics', type: 'score-threshold', targetValue: 80, currentValue: 64, deadline: addDays(14), tier: 3, completed: false },
  { id: uid(), title: 'Study 10 hours this week', subject: 'General', type: 'study-hours', targetValue: 10, currentValue: 10, deadline: addDays(0), tier: 1, completed: true },
])

const achievements = ref<Achievement[]>([
  { id: 'a1', name: 'Getting Started', desc: 'Generate your first AI routine', tier: 1, unlocked: false, unlockedAt: null },
  { id: 'a2', name: 'Disciplined', desc: 'Complete 10 routine blocks', tier: 1, unlocked: false, unlockedAt: null },
  { id: 'a3', name: 'Habit Formed', desc: 'Complete 50 routine blocks', tier: 2, unlocked: false, unlockedAt: null },
  { id: 'a4', name: 'Goal Setter', desc: 'Create your first target', tier: 1, unlocked: true, unlockedAt: addDays(-3) },
  { id: 'a5', name: 'Goal Crusher', desc: 'Complete 5 targets', tier: 3, unlocked: false, unlockedAt: null },
  { id: 'a6', name: 'Rising', desc: 'Reach Level 5', tier: 2, unlocked: false, unlockedAt: null },
  { id: 'a7', name: 'Veteran', desc: 'Reach Level 10', tier: 4, unlocked: false, unlockedAt: null },
])

export const useRoutine = () => {
  // ── Level / XP curve: level n needs 150 + (n-1)*100 xp ──
  function xpForLevel(lvl: number) {
    return 150 + (lvl - 1) * 100
  }
  function levelForXp(xp: number) {
    let lvl = 1
    let sum = 0
    while (sum + xpForLevel(lvl) <= xp) {
      sum += xpForLevel(lvl)
      lvl++
    }
    return lvl
  }
  function cumulativeXpForLevel(lvl: number) {
    let sum = 0
    for (let i = 1; i < lvl; i++) sum += xpForLevel(i)
    return sum
  }

  const level = computed(() => levelForXp(totalXp.value))
  const xpIntoLevel = computed(() => totalXp.value - cumulativeXpForLevel(level.value))
  const xpToNext = computed(() => xpForLevel(level.value))
  const xpProgress = computed(() => Math.min(100, Math.round((xpIntoLevel.value / xpToNext.value) * 100)))

  function addXp(amount: number) {
    const before = level.value
    totalXp.value += amount
    return { leveledUp: level.value > before, newLevel: level.value, amount }
  }

  // ── Manual block CRUD ──
  function addBlock(b: Omit<RoutineBlock, 'id' | 'completed'>) {
    blocks.value.push({ ...b, id: uid(), completed: false })
  }
  function removeBlock(id: string) {
    blocks.value = blocks.value.filter((b) => b.id !== id)
  }
  function toggleComplete(id: string) {
    const b = blocks.value.find((x) => x.id === id)
    if (!b) return { awarded: 0, leveledUp: false, unlocked: [] as Achievement[] }
    b.completed = !b.completed
    if (!b.completed) return { awarded: 0, leveledUp: false, unlocked: [] as Achievement[] }
    const xpRes = addXp(10)
    const unlocked = checkAchievements()
    return { awarded: 10, leveledUp: xpRes.leveledUp, newLevel: xpRes.newLevel, unlocked }
  }

  const groupedBlocks = computed(() => {
    const groups: Record<string, RoutineBlock[]> = {}
    for (const b of blocks.value) {
      if (!groups[b.dayKey]) groups[b.dayKey] = []
      groups[b.dayKey].push(b)
    }
    Object.values(groups).forEach((list) => list.sort((a, b) => a.start.localeCompare(b.start)))
    return groups
  })

  const blocksCompletedCount = computed(() => blocks.value.filter((b) => b.completed).length)

  function todayKey() {
    if (planType.value === 'countdown') return new Date().toISOString().slice(0, 10)
    const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    return map[new Date().getDay()]
  }
  const todayBlocks = computed(() => groupedBlocks.value[todayKey()] || [])

  // ── AI generation (Gemini server route, with demo fallback) ──
  async function generateRoutine(params: {
    stream: string
    subjects: string[]
    dailyHours: number
    weakTopics?: string[]
    intensity: 'relaxed' | 'balanced' | 'intense'
  }) {
    generating.value = true
    try {
      const res: any = await $fetch('/api/ai-routine', {
        method: 'POST',
        body: { task: 'generate-routine', payload: { ...params, planType: planType.value, examDate: examDate.value } },
      })
      genSource.value = res.source
      blocks.value = (res.blocks || []).map((b: any) => ({
        id: uid(),
        completed: false,
        dayKey: b.dayKey,
        subject: b.subject,
        topic: b.topic,
        start: b.start,
        duration: Number(b.duration) || 60,
      }))
      const unlocked = checkAchievements()
      return { source: res.source as string, unlocked }
    } finally {
      generating.value = false
    }
  }

  async function fetchTip(stream: string, streak: number, weakTopics: string[]) {
    const res: any = await $fetch('/api/ai-routine', {
      method: 'POST',
      body: { task: 'daily-tip', payload: { stream, streak, weakTopics } },
    })
    dailyTip.value = res.tip
    tipSource.value = res.source
    return res.source as string
  }

  async function suggestTarget(stream: string, weakTopics: string[]) {
    const res: any = await $fetch('/api/ai-routine', {
      method: 'POST',
      body: { task: 'target-suggestion', payload: { stream, weakTopics } },
    })
    return res.suggestion as { title: string; type: TargetType; targetValue: number; deadlineDays: number }
  }

  // ── Targets ──
  function addTarget(t: { title: string; subject: string; type: TargetType; targetValue: number; deadline: string | null; tier: 1 | 2 | 3 | 4 }) {
    targets.value.push({ ...t, id: uid(), currentValue: 0, completed: false })
    checkAchievements()
  }
  function markTargetProgress(id: string, delta: number) {
    const t = targets.value.find((x) => x.id === id)
    if (!t || t.completed) return { completedNow: false, unlocked: [] as Achievement[] }
    t.currentValue = Math.max(0, Math.min(t.targetValue, t.currentValue + delta))
    if (t.currentValue >= t.targetValue) {
      t.completed = true
      addXp(TIER_XP[t.tier])
      const unlocked = checkAchievements()
      return { completedNow: true, unlocked }
    }
    return { completedNow: false, unlocked: [] as Achievement[] }
  }
  function removeTarget(id: string) {
    targets.value = targets.value.filter((t) => t.id !== id)
  }

  // ── Achievements ──
  function checkAchievements() {
    const targetsCompleted = targets.value.filter((t) => t.completed).length
    const targetsCreated = targets.value.length
    const rules: Record<string, boolean> = {
      a1: !!genSource.value,
      a2: blocksCompletedCount.value >= 10,
      a3: blocksCompletedCount.value >= 50,
      a4: targetsCreated >= 1,
      a5: targetsCompleted >= 5,
      a6: level.value >= 5,
      a7: level.value >= 10,
    }
    const newlyUnlocked: Achievement[] = []
    for (const a of achievements.value) {
      if (!a.unlocked && rules[a.id]) {
        a.unlocked = true
        a.unlockedAt = new Date().toISOString()
        newlyUnlocked.push(a)
      }
    }
    return newlyUnlocked
  }

  return {
    mode,
    planType,
    examDate,
    blocks,
    groupedBlocks,
    todayBlocks,
    addBlock,
    removeBlock,
    toggleComplete,
    blocksCompletedCount,
    totalXp,
    level,
    xpIntoLevel,
    xpToNext,
    xpProgress,
    addXp,
    generating,
    genSource,
    generateRoutine,
    dailyTip,
    tipSource,
    fetchTip,
    targets,
    addTarget,
    markTargetProgress,
    removeTarget,
    suggestTarget,
    achievements,
    checkAchievements,
    TIER_LABEL,
    TIER_XP,
  }
}
