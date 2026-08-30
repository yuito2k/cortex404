<template>
  <div class="routine">

    <!-- ── Header banner ─────────────────────────────────────────── -->
    <div class="routine-banner">
      <div class="corner-tl" />
      <div class="corner-br" />
      <div class="banner-left">
        <div class="welcome-chip"><span class="chip-dot" /> AI Study Routine</div>
        <h1 class="banner-title">Plan it. Hit the target. <span class="name-highlight">Level up.</span></h1>
        <div class="tip-line">
          <span class="tip-icon">✦</span>
          <span class="tip-text">{{ dailyTip || 'Loading a tip for you…' }}</span>
          <button class="tip-refresh" title="Get another tip" @click="loadTip">↻</button>
          <span v-if="tipSource" class="tip-source">{{ tipSource === 'gemini' ? 'AI' : 'DEMO' }}</span>
        </div>
      </div>
      <div class="banner-right">
        <div class="level-badge">
          <span class="level-num">{{ level }}</span>
          <span class="level-label">LVL</span>
        </div>
        <div class="xp-block">
          <div class="xp-row">
            <span>{{ xpIntoLevel }} / {{ xpToNext }} XP</span>
            <span class="xp-total">{{ totalXp }} total</span>
          </div>
          <div class="xp-bar"><div class="xp-fill" :style="{ width: xpProgress + '%' }" /></div>
        </div>
      </div>
    </div>

    <!-- ── Mode + plan switches ─────────────────────────────────── -->
    <div class="switch-row">
      <div class="pill-group">
        <span class="pill-group-label">Mode</span>
        <button class="pill" :class="{ active: mode === 'manual' }" @click="mode = 'manual'">Manual</button>
        <button class="pill" :class="{ active: mode === 'auto' }" @click="mode = 'auto'">Auto (AI)</button>
      </div>
      <div class="pill-group">
        <span class="pill-group-label">Plan</span>
        <button class="pill" :class="{ active: planType === 'weekly' }" @click="planType = 'weekly'">Weekly</button>
        <button class="pill" :class="{ active: planType === 'countdown' }" @click="planType = 'countdown'">Countdown</button>
      </div>
    </div>

    <!-- ── Stats row ─────────────────────────────────────────────── -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Level</span>
        <span class="stat-value">{{ level }}</span>
        <span class="stat-sub">{{ xpProgress }}% to next</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Blocks Done</span>
        <span class="stat-value">{{ blocksCompletedCount }}</span>
        <span class="stat-sub">of {{ blocks.length }} scheduled</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Active Targets</span>
        <span class="stat-value">{{ activeTargetsCount }}</span>
        <span class="stat-sub">{{ completedTargetsCount }} completed</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Achievements</span>
        <span class="stat-value">{{ unlockedAchievementsCount }}</span>
        <span class="stat-sub">of {{ achievements.length }} unlocked</span>
      </div>
    </div>

    <!-- ── Main grid ─────────────────────────────────────────────── -->
    <div class="main-grid">

      <div class="col-left">

        <!-- Auto-generate panel -->
        <div v-if="mode === 'auto'" class="panel gen-panel">
          <div class="panel-head">
            <span class="panel-title">Generate with AI</span>
            <span class="panel-sub">Gemini drafts a plan — edit any block after</span>
          </div>

          <div class="form-group">
            <span class="form-label">Exam Stream</span>
            <div class="pill-row">
              <button v-for="s in streams" :key="s" class="pill" :class="{ active: formStream === s }" @click="formStream = s">{{ s }}</button>
            </div>
          </div>

          <div class="form-group">
            <span class="form-label">Subjects</span>
            <div class="pill-row">
              <button
                v-for="sub in subjectsByStream[formStream]"
                :key="sub"
                class="pill"
                :class="{ active: formSubjects.includes(sub) }"
                @click="toggleFormSubject(sub)"
              >{{ sub }}</button>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <span class="form-label">Daily Hours</span>
              <div class="pill-row">
                <button v-for="h in hoursOptions" :key="h" class="pill pill-sm" :class="{ active: formHours === h }" @click="formHours = h">{{ h }}h</button>
              </div>
            </div>
            <div class="form-group">
              <span class="form-label">Intensity</span>
              <div class="pill-row">
                <button v-for="i in intensities" :key="i.key" class="pill pill-sm" :class="{ active: formIntensity === i.key }" @click="formIntensity = i.key">{{ i.label }}</button>
              </div>
            </div>
          </div>

          <div v-if="planType === 'countdown'" class="form-group">
            <span class="form-label">Exam Date</span>
            <input v-model="examDate" type="date" class="text-input" />
          </div>

          <div class="form-group">
            <span class="form-label">Weak Topics <span class="form-label-dim">(pulled from Progress in production)</span></span>
            <div class="pill-row">
              <button
                v-for="t in demoWeakTopics"
                :key="t"
                class="pill pill-sm"
                :class="{ active: formWeakTopics.includes(t) }"
                @click="toggleWeakTopic(t)"
              >{{ t }}</button>
            </div>
          </div>

          <div class="gen-cta-row">
            <button class="iso-btn iso-btn--fill" :disabled="generating || !formSubjects.length" @click="onGenerate">
              {{ generating ? 'Generating…' : 'Generate Routine →' }}
            </button>
            <span v-if="genSource" class="gen-source-tag">source: {{ genSource === 'gemini' ? 'Gemini' : genSource === 'demo-fallback' ? 'demo (Gemini call failed)' : 'demo' }}</span>
          </div>

          <div v-if="generating" class="gen-skeleton">
            <div v-for="i in 4" :key="i" class="skel-line" />
          </div>
        </div>

        <!-- Today's focus -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">Today's Focus</span>
            <span class="panel-sub">{{ todayBlocks.length }} block{{ todayBlocks.length === 1 ? '' : 's' }}</span>
          </div>
          <div v-if="!todayBlocks.length" class="empty-state">Nothing scheduled for today yet — add a block or generate a routine.</div>
          <div v-else class="block-list">
            <div v-for="b in todayBlocks" :key="b.id" class="block-card" :class="{ done: b.completed }">
              <button class="check-box" :class="{ checked: b.completed }" @click="onToggle(b.id)">
                <span v-if="b.completed">✓</span>
              </button>
              <div class="block-info">
                <span class="block-subject">{{ b.subject }}</span>
                <span class="block-topic">{{ b.topic }}</span>
              </div>
              <div class="block-meta">
                <span class="block-time">{{ b.start }}</span>
                <span class="block-dur">{{ b.duration }}m</span>
              </div>
              <button class="block-del" title="Remove" @click="removeBlock(b.id)">×</button>
            </div>
          </div>
        </div>

        <!-- Routine board -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">{{ planType === 'weekly' ? 'Weekly Schedule' : 'Countdown Plan' }}</span>
            <span v-if="planType === 'countdown' && examDate" class="panel-sub">{{ daysToExam }} days to exam · {{ examDate }}</span>
            <button class="iso-btn iso-btn--ghost panel-add-btn" @click="openAddBlock()">+ Add Block</button>
          </div>

          <!-- Weekly grid -->
          <div v-if="planType === 'weekly'" class="week-grid">
            <div v-for="d in weekdays" :key="d.key" class="day-col">
              <div class="day-head">{{ d.label }}</div>
              <div class="day-body">
                <div v-for="b in (groupedBlocks[d.key] || [])" :key="b.id" class="day-block" :class="{ done: b.completed }">
                  <button class="check-box small" :class="{ checked: b.completed }" @click="onToggle(b.id)">
                    <span v-if="b.completed">✓</span>
                  </button>
                  <div class="day-block-info">
                    <span class="block-subject">{{ b.subject }}</span>
                    <span class="block-topic">{{ b.topic }}</span>
                    <span class="block-time">{{ b.start }} · {{ b.duration }}m</span>
                  </div>
                  <button class="block-del" @click="removeBlock(b.id)">×</button>
                </div>
                <button class="day-add" @click="openAddBlock(d.key)">+</button>
              </div>
            </div>
          </div>

          <!-- Countdown list -->
          <div v-else class="countdown-list">
            <div v-if="!countdownDates.length" class="empty-state">No dates yet — generate a plan or add a block to start the countdown.</div>
            <div v-for="(date, i) in countdownDates" :key="date" class="day-card">
              <div class="day-card-head">
                <span class="day-card-title">Day {{ i + 1 }} · {{ formatDateLabel(date) }}</span>
                <button class="day-add ghost" @click="openAddBlock(date)">+</button>
              </div>
              <div class="block-list">
                <div v-for="b in (groupedBlocks[date] || [])" :key="b.id" class="block-card" :class="{ done: b.completed }">
                  <button class="check-box" :class="{ checked: b.completed }" @click="onToggle(b.id)">
                    <span v-if="b.completed">✓</span>
                  </button>
                  <div class="block-info">
                    <span class="block-subject">{{ b.subject }}</span>
                    <span class="block-topic">{{ b.topic }}</span>
                  </div>
                  <div class="block-meta">
                    <span class="block-time">{{ b.start }}</span>
                    <span class="block-dur">{{ b.duration }}m</span>
                  </div>
                  <button class="block-del" @click="removeBlock(b.id)">×</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="col-right">

        <!-- Targets -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">Targets</span>
            <div class="head-actions">
              <button class="mini-btn" @click="onAiSuggest">✦ AI Suggest</button>
              <button class="mini-btn" @click="openAddTarget()">+ Add</button>
            </div>
          </div>
          <div v-if="!targets.length" class="empty-state">No targets yet — set one to start tracking real goals.</div>
          <div v-else class="target-list">
            <div v-for="t in targets" :key="t.id" class="target-card" :class="{ done: t.completed }">
              <div class="target-top">
                <span class="target-title">{{ t.title }}</span>
                <span class="tier-tag" :class="'tier-' + t.tier">{{ TIER_LABEL[t.tier] }}</span>
              </div>
              <div class="target-meta-row">
                <span class="target-subject">{{ t.subject }}</span>
                <span class="target-deadline">{{ t.deadline ? deadlineLabel(t.deadline) : 'No deadline' }}</span>
              </div>
              <div class="target-bar"><div class="target-fill" :class="{ done: t.completed }" :style="{ width: Math.min(100, Math.round((t.currentValue / t.targetValue) * 100)) + '%' }" /></div>
              <div class="target-bottom">
                <span class="target-progress">{{ t.currentValue }} / {{ t.targetValue }} {{ targetUnitLabel(t.type) }}</span>
                <div class="target-actions">
                  <template v-if="!t.completed">
                    <button class="mini-step" @click="markProgress(t.id, -1)">−</button>
                    <button class="mini-step" @click="markProgress(t.id, 1)">+</button>
                  </template>
                  <span v-else class="target-done-tag">✓ Done</span>
                  <button class="block-del" @click="removeTarget(t.id)">×</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Achievements -->
        <div class="panel">
          <div class="panel-head">
            <span class="panel-title">Achievements</span>
            <span class="panel-sub">{{ unlockedAchievementsCount }}/{{ achievements.length }}</span>
          </div>
          <div class="ach-grid">
            <div v-for="a in achievements" :key="a.id" class="ach-tile" :class="{ unlocked: a.unlocked }">
              <span class="ach-tier" :class="'tier-' + a.tier">{{ TIER_LABEL[a.tier] }}</span>
              <span class="ach-name">{{ a.name }}</span>
              <span class="ach-desc">{{ a.desc }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Add Block modal ───────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showBlockModal" class="modal-overlay" @click.self="showBlockModal = false">
        <div class="modal-card">
          <div class="modal-head">
            <span>Add Routine Block</span>
            <button class="modal-close" @click="showBlockModal = false">×</button>
          </div>

          <div class="form-group">
            <span class="form-label">{{ planType === 'weekly' ? 'Day' : 'Date' }}</span>
            <select v-if="planType === 'weekly'" v-model="blockForm.dayKey" class="text-input">
              <option v-for="d in weekdays" :key="d.key" :value="d.key">{{ d.label }}</option>
            </select>
            <input v-else v-model="blockForm.dayKey" type="date" class="text-input" />
          </div>

          <div class="form-group">
            <span class="form-label">Subject</span>
            <select v-model="blockForm.subject" class="text-input">
              <option v-for="sub in allSubjects" :key="sub" :value="sub">{{ sub }}</option>
            </select>
          </div>

          <div class="form-group">
            <span class="form-label">Topic</span>
            <input v-model="blockForm.topic" type="text" class="text-input" placeholder="e.g. Trigonometric Identities" />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <span class="form-label">Start Time</span>
              <input v-model="blockForm.start" type="time" class="text-input" />
            </div>
            <div class="form-group">
              <span class="form-label">Duration (min)</span>
              <input v-model.number="blockForm.duration" type="number" min="15" step="15" class="text-input" />
            </div>
          </div>

          <button class="iso-btn iso-btn--fill iso-btn--full" :disabled="!blockForm.topic" @click="saveBlock">Add Block</button>
        </div>
      </div>
    </Teleport>

    <!-- ── Add Target modal ──────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showTargetModal" class="modal-overlay" @click.self="showTargetModal = false">
        <div class="modal-card">
          <div class="modal-head">
            <span>Add Target</span>
            <button class="modal-close" @click="showTargetModal = false">×</button>
          </div>

          <div class="form-group">
            <span class="form-label">Title</span>
            <input v-model="targetForm.title" type="text" class="text-input" placeholder="e.g. Finish Organic Chemistry" />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <span class="form-label">Subject</span>
              <select v-model="targetForm.subject" class="text-input">
                <option v-for="sub in allSubjects" :key="sub" :value="sub">{{ sub }}</option>
              </select>
            </div>
            <div class="form-group">
              <span class="form-label">Type</span>
              <select v-model="targetForm.type" class="text-input">
                <option value="topic-completion">Topics completed</option>
                <option value="score-threshold">Score %</option>
                <option value="study-hours">Study hours</option>
              </select>
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <span class="form-label">Target Value</span>
              <input v-model.number="targetForm.targetValue" type="number" min="1" class="text-input" />
            </div>
            <div class="form-group">
              <span class="form-label">Deadline</span>
              <input v-model="targetForm.deadline" type="date" class="text-input" />
            </div>
          </div>

          <div class="form-group">
            <span class="form-label">Tier <span class="form-label-dim">(sets XP reward on completion)</span></span>
            <div class="pill-row">
              <button v-for="n in [1,2,3,4]" :key="n" class="pill pill-sm" :class="{ active: targetForm.tier === n }" @click="targetForm.tier = n">{{ TIER_LABEL[n] }}</button>
            </div>
          </div>

          <button class="iso-btn iso-btn--fill iso-btn--full" :disabled="!targetForm.title" @click="saveTarget">Add Target</button>
        </div>
      </div>
    </Teleport>

    <!-- ── Toasts ─────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div class="toast-stack">
        <transition-group name="toast-slide">
          <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.msg }}</div>
        </transition-group>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

import { useRoutine, TIER_LABEL } from '~/composables/useRoutine'

const {
  mode, planType, examDate,
  blocks, groupedBlocks, todayBlocks, addBlock, removeBlock, toggleComplete, blocksCompletedCount,
  totalXp, level, xpIntoLevel, xpToNext, xpProgress,
  generating, genSource, generateRoutine,
  dailyTip, tipSource, fetchTip,
  targets, addTarget, markTargetProgress, removeTarget, suggestTarget,
  achievements,
} = useRoutine()

// ── Static reference data ──────────────────────────────────────────
const streams = ['HSC', 'SSC', 'BUET', 'Medical', 'DU', 'BCS', 'Bank']
const subjectsByStream: Record<string, string[]> = {
  HSC: ['Physics', 'Chemistry', 'Higher Math', 'Biology', 'ICT', 'English', 'Bangla'],
  SSC: ['Physics', 'Chemistry', 'Math', 'Biology', 'English', 'Bangla'],
  BUET: ['Physics', 'Chemistry', 'Higher Math', 'English'],
  Medical: ['Biology', 'Chemistry', 'Physics', 'English'],
  DU: ['Bangla', 'English', 'General Knowledge', 'Math'],
  BCS: ['Bangla', 'English', 'Math', 'General Knowledge', 'Bangladesh Affairs', 'International Affairs'],
  Bank: ['Math', 'English', 'Bangla', 'General Knowledge', 'Computer'],
}
const allSubjects = computed(() => [...new Set(Object.values(subjectsByStream).flat())])
const hoursOptions = [1, 2, 3, 4, 5]
const intensities = [
  { key: 'relaxed', label: 'Relaxed' },
  { key: 'balanced', label: 'Balanced' },
  { key: 'intense', label: 'Intense' },
]
const weekdays = [
  { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' }, { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' }, { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' }, { key: 'sun', label: 'Sun' },
]
// TODO: in production, pull this from the Progress page's weak-topics data via useDashboard()
const demoWeakTopics = ['Trigonometric Identities', 'Organic Chemistry', 'Human Genetics', 'Essay Writing', 'Thermodynamics']

// ── Auto-gen form state ────────────────────────────────────────────
const formStream = ref('HSC')
const formSubjects = ref<string[]>(['Physics', 'Chemistry'])
const formHours = ref(3)
const formIntensity = ref<'relaxed' | 'balanced' | 'intense'>('balanced')
const formWeakTopics = ref<string[]>([])

watch(formStream, (s) => {
  formSubjects.value = (subjectsByStream[s] || []).slice(0, 2)
})

function toggleFormSubject(sub: string) {
  formSubjects.value = formSubjects.value.includes(sub)
    ? formSubjects.value.filter((s) => s !== sub)
    : [...formSubjects.value, sub]
}
function toggleWeakTopic(t: string) {
  formWeakTopics.value = formWeakTopics.value.includes(t)
    ? formWeakTopics.value.filter((x) => x !== t)
    : [...formWeakTopics.value, t]
}

// ── Stats ───────────────────────────────────────────────────────────
const activeTargetsCount = computed(() => targets.value.filter((t) => !t.completed).length)
const completedTargetsCount = computed(() => targets.value.filter((t) => t.completed).length)
const unlockedAchievementsCount = computed(() => achievements.value.filter((a) => a.unlocked).length)
const countdownDates = computed(() => Object.keys(groupedBlocks.value).filter((k) => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort())
const daysToExam = computed(() => {
  if (!examDate.value) return 0
  const diff = new Date(examDate.value).getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.max(0, Math.ceil(diff / 86400000))
})

function formatDateLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}
function deadlineLabel(iso: string) {
  const diff = Math.ceil((new Date(iso).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
  if (diff < 0) return 'Overdue'
  if (diff === 0) return 'Due today'
  return `in ${diff}d`
}
function targetUnitLabel(type: string) {
  if (type === 'score-threshold') return '%'
  if (type === 'study-hours') return 'hrs'
  return 'topics'
}

// ── Toasts ──────────────────────────────────────────────────────────
const toasts = ref<{ id: number; msg: string; type: string }[]>([])
let toastId = 0
function showToast(msg: string, type: 'success' | 'info' = 'success') {
  const id = ++toastId
  toasts.value.push({ id, msg, type })
  setTimeout(() => { toasts.value = toasts.value.filter((t) => t.id !== id) }, 3500)
}

// ── AI tip ──────────────────────────────────────────────────────────
async function loadTip() {
  await fetchTip(formStream.value, 4, demoWeakTopics.slice(0, 2))
}
onMounted(loadTip)

// ── Generate ────────────────────────────────────────────────────────
async function onGenerate() {
  const { source, unlocked } = await generateRoutine({
    stream: formStream.value,
    subjects: formSubjects.value,
    dailyHours: formHours.value,
    weakTopics: formWeakTopics.value,
    intensity: formIntensity.value,
  })
  showToast(source === 'gemini' ? 'Routine generated by Gemini' : 'Routine generated (demo plan)', 'success')
  unlocked.forEach((a) => showToast(`Achievement unlocked: ${a.name}`, 'success'))
}

// ── Block toggle / modal ───────────────────────────────────────────
function onToggle(id: string) {
  const r = toggleComplete(id)
  if (r.awarded) showToast(`+${r.awarded} XP`, 'success')
  if (r.leveledUp) showToast(`Level up! Now level ${r.newLevel}`, 'success')
  r.unlocked?.forEach((a) => showToast(`Achievement unlocked: ${a.name}`, 'success'))
}

const showBlockModal = ref(false)
const blockForm = reactive({ dayKey: 'mon', subject: 'Physics', topic: '', start: '18:00', duration: 60 })
function openAddBlock(dayKey?: string) {
  blockForm.dayKey = dayKey || (planType.value === 'weekly' ? 'mon' : new Date().toISOString().slice(0, 10))
  blockForm.subject = formSubjects.value[0] || allSubjects.value[0]
  blockForm.topic = ''
  showBlockModal.value = true
}
function saveBlock() {
  addBlock({ ...blockForm })
  showBlockModal.value = false
  showToast('Block added to routine', 'success')
}

// ── Targets ─────────────────────────────────────────────────────────
const showTargetModal = ref(false)
const targetForm = reactive({ title: '', subject: 'Physics', type: 'topic-completion' as const, targetValue: 10, deadline: '', tier: 1 as 1 | 2 | 3 | 4 })
function openAddTarget() {
  Object.assign(targetForm, { title: '', subject: formSubjects.value[0] || allSubjects.value[0], type: 'topic-completion', targetValue: 10, deadline: '', tier: 1 })
  showTargetModal.value = true
}
function saveTarget() {
  addTarget({ ...targetForm, deadline: targetForm.deadline || null })
  showTargetModal.value = false
  showToast('Target added', 'success')
}
function markProgress(id: string, delta: number) {
  const r = markTargetProgress(id, delta)
  if (r.completedNow) showToast('Target complete! XP awarded', 'success')
  r.unlocked?.forEach((a) => showToast(`Achievement unlocked: ${a.name}`, 'success'))
}
async function onAiSuggest() {
  const s = await suggestTarget(formStream.value, demoWeakTopics.slice(0, 2))
  openAddTarget()
  Object.assign(targetForm, {
    title: s.title,
    type: s.type,
    targetValue: s.targetValue,
    deadline: new Date(Date.now() + s.deadlineDays * 86400000).toISOString().slice(0, 10),
  })
}
</script>

<style scoped>
.routine { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; min-width: 0; overflow-x: hidden; }

/* ── Banner ─────────────────────────────────────────────────── */
.routine-banner {
  display: flex; align-items: center; justify-content: space-between; gap: 2rem;
  padding: 2rem; border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  background-image: radial-gradient(circle, rgba(240,240,234,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
}
.corner-tl, .corner-br { position: absolute; width: 16px; height: 16px; pointer-events: none; }
.corner-tl { top: 8px; left: 8px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.corner-br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }

.welcome-chip { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray); border: 1px solid var(--border-bright); padding: 5px 12px; margin-bottom: 0.9rem; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); animation: blink 2s infinite; }
@keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.25; } }

.banner-title { font-family: var(--font-mono); font-size: clamp(1.3rem, 2.3vw, 1.9rem); font-weight: 700; letter-spacing: -0.6px; color: var(--white); margin-bottom: 0.7rem; line-height: 1.15; max-width: 560px; }
.name-highlight { color: transparent; -webkit-text-stroke: 1.5px rgba(240,240,234,0.7); }

.tip-line { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--gray); max-width: 480px; }
.tip-icon { color: var(--white); }
.tip-text { flex: 1; }
.tip-refresh { background: none; border: 1px solid var(--border-bright); color: var(--white); width: 22px; height: 22px; border-radius: 50%; cursor: pointer; font-size: 0.75rem; line-height: 1; flex-shrink: 0; }
.tip-source { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.12em; color: var(--dim); border: 1px solid var(--border); padding: 2px 6px; flex-shrink: 0; }

.banner-right { display: flex; align-items: center; gap: 1.2rem; flex-shrink: 0; }
.level-badge { display: flex; flex-direction: column; align-items: center; justify-content: center; width: 64px; height: 64px; border: 1px solid var(--border-bright); box-shadow: 3px 3px 0 0 rgba(240,240,234,0.06); flex-shrink: 0; }
.level-num { font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--white); line-height: 1; }
.level-label { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.14em; color: var(--gray); margin-top: 2px; }
.xp-block { width: 160px; }
.xp-row { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); margin-bottom: 6px; }
.xp-total { color: var(--dim); }
.xp-bar { height: 5px; background: var(--border); }
.xp-fill { height: 100%; background: var(--white); transition: width 0.3s ease; }

/* ── Mode/plan switch ──────────────────────────────────────────── */
.switch-row { display: flex; gap: 1.5rem; flex-wrap: wrap; }
.pill-group { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pill-group-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); margin-right: 2px; }
.pill { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.04em; color: var(--gray); background: transparent; border: 1px solid var(--border); padding: 7px 14px; cursor: pointer; transition: all 0.15s ease; }
.pill:hover { border-color: var(--border-bright); color: var(--white); }
.pill.active { background: var(--white); color: var(--black); border-color: var(--white); }
.pill-sm { padding: 5px 11px; font-size: 0.65rem; }
.pill-row { display: flex; gap: 6px; flex-wrap: wrap; }

/* ── Stats row ──────────────────────────────────────────────────── */
.stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
.stat-card { background: #0d0d0d; padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: 4px; }
.stat-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); }
.stat-value { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--white); }
.stat-sub { font-size: 0.7rem; color: var(--gray); }

/* ── Main grid ──────────────────────────────────────────────────── */
.main-grid { display: grid; grid-template-columns: 1fr 380px; gap: 1.5rem; align-items: start; min-width: 0; }
.col-left, .col-right { display: flex; flex-direction: column; gap: 1.5rem; min-width: 0; }

/* ── Panels ─────────────────────────────────────────────────────── */
.panel { border: 1px solid var(--border); background: #0d0d0d; padding: 1.4rem; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); }
.panel-head { display: flex; align-items: center; gap: 10px; margin-bottom: 1.1rem; flex-wrap: wrap; }
.panel-title { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; letter-spacing: 0.02em; color: var(--white); }
.panel-sub { font-size: 0.72rem; color: var(--gray); }
.panel-add-btn { margin-left: auto; font-size: 0.65rem; padding: 6px 14px; }
.head-actions { margin-left: auto; display: flex; gap: 8px; }
.mini-btn { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.04em; color: var(--gray); background: transparent; border: 1px solid var(--border); padding: 6px 12px; cursor: pointer; }
.mini-btn:hover { border-color: var(--border-bright); color: var(--white); }

.empty-state { font-size: 0.78rem; color: var(--dim); padding: 1.2rem 0; text-align: center; border: 1px dashed var(--border); }

/* ── Generate panel ─────────────────────────────────────────────── */
.form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 1rem; }
.form-label { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); }
.form-label-dim { color: var(--dim); text-transform: none; letter-spacing: 0; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.text-input { background: var(--black); border: 1px solid var(--border); color: var(--white); font-family: var(--font-sans); font-size: 0.8rem; padding: 9px 12px; width: 100%; box-sizing: border-box; }
.text-input:focus { outline: none; border-color: var(--border-bright); }
.gen-cta-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 0.5rem; }
.gen-source-tag { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); }
.gen-skeleton { display: flex; flex-direction: column; gap: 8px; margin-top: 1rem; }
.skel-line { height: 38px; background: rgba(240,240,234,0.04); animation: shimmer 1.4s ease infinite; }
@keyframes shimmer { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }

/* ── Block cards (list) ─────────────────────────────────────────── */
.block-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); }
.block-card { background: #0d0d0d; display: flex; align-items: center; gap: 12px; padding: 0.8rem 1rem; border-left: 2px solid transparent; transition: border-color 0.15s ease; }
.block-card.done { border-left-color: rgba(120,230,120,0.5); }
.block-info { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.block-subject { font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--white); }
.block-topic { font-size: 0.78rem; color: var(--gray); }
.block-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
.block-time { font-family: var(--font-mono); font-size: 0.68rem; color: var(--gray); }
.block-dur { font-family: var(--font-mono); font-size: 0.62rem; color: var(--dim); }
.block-del { background: none; border: none; color: var(--dim); font-size: 1rem; cursor: pointer; flex-shrink: 0; line-height: 1; padding: 2px 4px; }
.block-del:hover { color: rgba(255,100,100,0.8); }

.check-box { width: 22px; height: 22px; border: 1px solid var(--border-bright); background: transparent; color: rgba(120,230,120,0.9); cursor: pointer; flex-shrink: 0; font-size: 0.7rem; line-height: 1; display: flex; align-items: center; justify-content: center; }
.check-box.checked { background: rgba(120,230,120,0.08); border-color: rgba(120,230,120,0.5); }
.check-box.small { width: 18px; height: 18px; }

/* ── Weekly grid ────────────────────────────────────────────────── */
.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
.day-col { background: #0d0d0d; display: flex; flex-direction: column; min-width: 0; }
.day-head { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); text-align: center; padding: 0.6rem 0; border-bottom: 1px solid var(--border); }
.day-body { display: flex; flex-direction: column; gap: 6px; padding: 0.5rem; flex: 1; }
.day-block { display: flex; align-items: flex-start; gap: 6px; border: 1px solid var(--border); border-left: 2px solid transparent; padding: 6px; }
.day-block.done { border-left-color: rgba(120,230,120,0.5); }
.day-block-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; flex: 1; }
.day-block-info .block-subject { font-size: 0.6rem; }
.day-block-info .block-topic { font-size: 0.68rem; }
.day-block-info .block-time { font-size: 0.58rem; }
.day-add { margin-top: auto; background: none; border: 1px dashed var(--border); color: var(--dim); cursor: pointer; padding: 6px 0; font-family: var(--font-mono); font-size: 0.8rem; }
.day-add:hover { border-color: var(--border-bright); color: var(--white); }
.day-add.ghost { width: 24px; height: 24px; border: 1px solid var(--border); padding: 0; }

/* ── Countdown list ─────────────────────────────────────────────── */
.countdown-list { display: flex; flex-direction: column; gap: 1rem; }
.day-card { border: 1px solid var(--border); }
.day-card-head { display: flex; align-items: center; justify-content: space-between; padding: 0.7rem 1rem; border-bottom: 1px solid var(--border); }
.day-card-title { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.04em; color: var(--white); }

/* ── Targets ────────────────────────────────────────────────────── */
.target-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); }
.target-card { background: #0d0d0d; padding: 0.9rem 1rem; border-left: 2px solid transparent; display: flex; flex-direction: column; gap: 8px; }
.target-card.done { border-left-color: rgba(120,230,120,0.5); }
.target-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.target-title { font-size: 0.82rem; color: var(--white); font-weight: 500; }
.tier-tag { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 7px; border: 1px solid var(--border-bright); flex-shrink: 0; }
.tier-1 { color: var(--dim); opacity: 0.7; }
.tier-2 { color: var(--gray); opacity: 0.85; }
.tier-3 { color: var(--white); }
.tier-4 { color: var(--white); border-color: var(--white); }
.target-meta-row { display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); }
.target-bar { height: 5px; background: var(--border); }
.target-fill { height: 100%; background: var(--white); transition: width 0.3s ease; }
.target-fill.done { background: rgba(120,230,120,0.7); }
.target-bottom { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.target-progress { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); }
.target-actions { display: flex; align-items: center; gap: 6px; }
.mini-step { width: 22px; height: 22px; border: 1px solid var(--border-bright); background: transparent; color: var(--white); cursor: pointer; line-height: 1; }
.target-done-tag { font-family: var(--font-mono); font-size: 0.62rem; color: rgba(120,230,120,0.85); }

/* ── Achievements ───────────────────────────────────────────────── */
.ach-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); }
.ach-tile { background: #0d0d0d; padding: 0.85rem 0.9rem; display: flex; flex-direction: column; gap: 4px; opacity: 0.35; filter: grayscale(1); transition: opacity 0.2s ease, filter 0.2s ease; }
.ach-tile.unlocked { opacity: 1; filter: none; }
.ach-tier { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--dim); }
.ach-name { font-size: 0.78rem; color: var(--white); font-weight: 500; }
.ach-desc { font-size: 0.66rem; color: var(--gray); }

/* ── Modals ─────────────────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
.modal-card { background: #0d0d0d; border: 1px solid var(--border-bright); padding: 1.6rem; width: 100%; max-width: 420px; box-shadow: 6px 6px 0 0 rgba(240,240,234,0.06); }
.modal-head { display: flex; align-items: center; justify-content: space-between; font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); margin-bottom: 1.2rem; }
.modal-close { background: none; border: none; color: var(--gray); font-size: 1.2rem; cursor: pointer; line-height: 1; }

/* ── Toasts ─────────────────────────────────────────────────────── */
.toast-stack { position: fixed; bottom: 1.5rem; right: 1.5rem; display: flex; flex-direction: column; gap: 8px; z-index: 300; }
.toast { font-family: var(--font-mono); font-size: 0.72rem; color: var(--white); background: #0d0d0d; border: 1px solid rgba(120,230,120,0.4); border-left: 2px solid rgba(120,230,120,0.7); padding: 10px 16px; box-shadow: 3px 3px 0 0 rgba(0,0,0,0.4); }
.toast.info { border-color: var(--border-bright); border-left-color: var(--border-bright); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.25s ease; }
.toast-slide-enter-from { opacity: 0; transform: translateX(20px); }
.toast-slide-leave-to { opacity: 0; transform: translateX(20px); }

@media (max-width: 1100px) {
  .main-grid { grid-template-columns: 1fr; }
  .col-right { order: -1; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .week-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .routine-banner { flex-direction: column; align-items: flex-start; padding: 1.4rem; }
  .banner-right { width: 100%; justify-content: space-between; }
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .form-row-2 { grid-template-columns: 1fr; }
  .ach-grid { grid-template-columns: 1fr; }
}
</style>
