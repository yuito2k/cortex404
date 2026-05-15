<template>
  <div class="leaderboard-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="page-chip"><span class="chip-dot" /> Leaderboard</div>
        <h1 class="page-title">National Rankings.<br><span class="text-outline">Where Do You Stand?</span></h1>
        <p class="page-sub">Compete with students across Bangladesh. Rankings update every 24 hours.</p>
      </div>
      <div class="header-right">
        <div class="your-rank-card">
          <span class="yr-label">Your Rank</span>
          <span class="yr-rank">#{{ userRank }}</span>
          <span class="yr-meta">Top {{ topPercent }}% · {{ totalStudents }} students</span>
          <div class="yr-bar-wrap">
            <div class="yr-bar-fill" :style="{ width: (100 - rankPercent) + '%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar">
      <div class="filter-group">
        <span class="filter-label">Stream</span>
        <div class="filter-pills">
          <button
            v-for="s in streams"
            :key="s"
            class="filter-pill"
            :class="{ active: selectedStream === s }"
            @click="selectedStream = s"
          >{{ s }}</button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-label">Period</span>
        <div class="filter-pills">
          <button
            v-for="p in periods"
            :key="p.val"
            class="filter-pill"
            :class="{ active: selectedPeriod === p.val }"
            @click="selectedPeriod = p.val"
          >{{ p.label }}</button>
        </div>
      </div>
      <div class="filter-group">
        <span class="filter-label">Sort by</span>
        <div class="filter-pills">
          <button
            v-for="s in sortOptions"
            :key="s.val"
            class="filter-pill"
            :class="{ active: sortBy === s.val }"
            @click="sortBy = s.val"
          >{{ s.label }}</button>
        </div>
      </div>
      <div class="filter-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input v-model="searchQuery" class="form-input search-input" placeholder="Search student…" />
      </div>
    </div>

    <!-- Main layout -->
    <div class="lb-body">

      <!-- ── LEFT: Main table ── -->
      <div class="lb-main">

        <!-- Podium top 3 -->
        <div class="podium">
          <div class="podium-card second" @click="expandEntry(filteredEntries[1])">
            <div class="pod-avatar">{{ filteredEntries[1]?.initials }}</div>
            <div class="pod-position">2</div>
            <span class="pod-name">{{ filteredEntries[1]?.name }}</span>
            <span class="pod-score">{{ filteredEntries[1]?.score?.toLocaleString() }}</span>
            <span class="pod-stream">{{ filteredEntries[1]?.stream }}</span>
          </div>
          <div class="podium-card first" @click="expandEntry(filteredEntries[0])">
            <div class="pod-crown">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M2 19l2-9 5 5 3-10 3 10 5-5 2 9H2z"/>
              </svg>
            </div>
            <div class="pod-avatar gold">{{ filteredEntries[0]?.initials }}</div>
            <div class="pod-position gold">1</div>
            <span class="pod-name">{{ filteredEntries[0]?.name }}</span>
            <span class="pod-score">{{ filteredEntries[0]?.score?.toLocaleString() }}</span>
            <span class="pod-stream">{{ filteredEntries[0]?.stream }}</span>
          </div>
          <div class="podium-card third" @click="expandEntry(filteredEntries[2])">
            <div class="pod-avatar">{{ filteredEntries[2]?.initials }}</div>
            <div class="pod-position">3</div>
            <span class="pod-name">{{ filteredEntries[2]?.name }}</span>
            <span class="pod-score">{{ filteredEntries[2]?.score?.toLocaleString() }}</span>
            <span class="pod-stream">{{ filteredEntries[2]?.stream }}</span>
          </div>
        </div>

        <!-- Table -->
        <div class="lb-table">
          <div class="lb-table-header">
            <span class="lth-rank">Rank</span>
            <span class="lth-student">Student</span>
            <span class="lth-stream">Stream</span>
            <span class="lth-score">Score</span>
            <span class="lth-exams">Exams</span>
            <span class="lth-accuracy">Accuracy</span>
            <span class="lth-streak">Streak</span>
            <span class="lth-change">Change</span>
          </div>

          <!-- Top 3 separator -->
          <div class="table-section-label">Top 3 — Podium</div>

          <div
            v-for="(entry, i) in filteredEntries.slice(0, 3)"
            :key="entry.id"
            class="lb-row podium-row"
            :class="{ 'is-you': entry.isYou, expanded: expandedId === entry.id }"
            @click="expandEntry(entry)"
          >
            <span class="lr-rank">
              <span class="rank-num top" :class="`rank-${entry.rank}`">{{ entry.rank }}</span>
            </span>
            <span class="lr-student">
              <span class="lr-avatar">{{ entry.initials }}</span>
              <span class="lr-name">{{ entry.name }}<span v-if="entry.isYou" class="you-tag">YOU</span></span>
            </span>
            <span class="lr-stream">{{ entry.stream }}</span>
            <span class="lr-score">{{ entry.score.toLocaleString() }}</span>
            <span class="lr-exams">{{ entry.exams }}</span>
            <span class="lr-accuracy">{{ entry.accuracy }}%</span>
            <span class="lr-streak">🔥 {{ entry.streak }}</span>
            <span class="lr-change" :class="entry.change > 0 ? 'up' : entry.change < 0 ? 'down' : 'same'">
              {{ entry.change > 0 ? '↑' + entry.change : entry.change < 0 ? '↓' + Math.abs(entry.change) : '—' }}
            </span>
          </div>

          <div class="table-section-label">Ranks 4–{{ filteredEntries.slice(3, showAllRows ? undefined : 3 + pageSize).length + 3 }}</div>

          <div
            v-for="entry in filteredEntries.slice(3, showAllRows ? undefined : 3 + pageSize)"
            :key="entry.id"
            class="lb-row"
            :class="{ 'is-you': entry.isYou, expanded: expandedId === entry.id }"
            @click="expandEntry(entry)"
          >
            <span class="lr-rank">
              <span class="rank-num">{{ entry.rank }}</span>
            </span>
            <span class="lr-student">
              <span class="lr-avatar" :class="{ 'you-avatar': entry.isYou }">{{ entry.initials }}</span>
              <span class="lr-name">{{ entry.name }}<span v-if="entry.isYou" class="you-tag">YOU</span></span>
            </span>
            <span class="lr-stream">{{ entry.stream }}</span>
            <span class="lr-score">{{ entry.score.toLocaleString() }}</span>
            <span class="lr-exams">{{ entry.exams }}</span>
            <span class="lr-accuracy">{{ entry.accuracy }}%</span>
            <span class="lr-streak">🔥 {{ entry.streak }}</span>
            <span class="lr-change" :class="entry.change > 0 ? 'up' : entry.change < 0 ? 'down' : 'same'">
              {{ entry.change > 0 ? '↑' + entry.change : entry.change < 0 ? '↓' + Math.abs(entry.change) : '—' }}
            </span>
          </div>

          <!-- Your rank row if not visible -->
          <template v-if="!yourEntryVisible">
            <div class="ellipsis-row">
              <span>···</span>
            </div>
            <div
              class="lb-row is-you highlight-you"
              @click="expandEntry(yourEntry)"
            >
              <span class="lr-rank"><span class="rank-num">{{ yourEntry.rank }}</span></span>
              <span class="lr-student">
                <span class="lr-avatar you-avatar">{{ yourEntry.initials }}</span>
                <span class="lr-name">{{ yourEntry.name }}<span class="you-tag">YOU</span></span>
              </span>
              <span class="lr-stream">{{ yourEntry.stream }}</span>
              <span class="lr-score">{{ yourEntry.score.toLocaleString() }}</span>
              <span class="lr-exams">{{ yourEntry.exams }}</span>
              <span class="lr-accuracy">{{ yourEntry.accuracy }}%</span>
              <span class="lr-streak">🔥 {{ yourEntry.streak }}</span>
              <span class="lr-change" :class="yourEntry.change > 0 ? 'up' : 'down'">
                {{ yourEntry.change > 0 ? '↑' + yourEntry.change : '↓' + Math.abs(yourEntry.change) }}
              </span>
            </div>
          </template>

          <!-- Show more -->
          <div v-if="!showAllRows && filteredEntries.length > 3 + pageSize" class="show-more-row">
            <button class="iso-btn iso-btn--ghost show-more-btn" @click="showAllRows = true">
              Show All {{ filteredEntries.length }} Students →
            </button>
          </div>
        </div>
      </div>

      <!-- ── RIGHT SIDEBAR ── -->
      <aside class="lb-sidebar">

        <!-- Score to climb -->
        <div class="side-panel">
          <div class="panel-header"><span class="panel-tag">Climb the Ranks</span></div>
          <div class="climb-list">
            <div v-for="target in climbTargets" :key="target.rank" class="climb-row">
              <div class="cr-left">
                <span class="cr-rank">#{{ target.rank }}</span>
                <span class="cr-name">{{ target.name }}</span>
              </div>
              <div class="cr-right">
                <span class="cr-gap">+{{ (target.score - yourEntry.score).toLocaleString() }} pts</span>
                <div class="cr-bar-wrap">
                  <div class="cr-bar-fill" :style="{ width: (yourEntry.score / target.score * 100) + '%' }" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stream distribution -->
        <div class="side-panel">
          <div class="panel-header"><span class="panel-tag">By Stream</span></div>
          <div class="stream-dist">
            <div v-for="s in streamDist" :key="s.name" class="sd-row">
              <div class="sd-top">
                <span class="sd-name">{{ s.name }}</span>
                <span class="sd-count">{{ s.count }} students</span>
                <span class="sd-pct">{{ s.pct }}%</span>
              </div>
              <div class="sd-bar-wrap">
                <div class="sd-bar-fill" :style="{ width: s.pct + '%' }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Score distribution -->
        <div class="side-panel">
          <div class="panel-header"><span class="panel-tag">Score Distribution</span></div>
          <div class="score-dist">
            <div v-for="b in scoreBuckets" :key="b.label" class="sdb-row">
              <span class="sdb-label">{{ b.label }}</span>
              <div class="sdb-bar-wrap">
                <div
                  class="sdb-bar-fill"
                  :class="{ 'you-bucket': b.isYou }"
                  :style="{ width: (b.count / maxBucketCount * 100) + '%' }"
                />
              </div>
              <span class="sdb-count">{{ b.count }}</span>
              <span v-if="b.isYou" class="sdb-you">← You</span>
            </div>
          </div>
        </div>

        <!-- How to improve -->
        <div class="side-panel">
          <div class="panel-header"><span class="panel-tag">How to Climb</span></div>
          <div class="tips-list">
            <div v-for="tip in climbTips" :key="tip.label" class="tip-row">
              <span class="tip-icon" v-html="tip.icon" />
              <div class="tip-text">
                <span class="tip-label">{{ tip.label }}</span>
                <span class="tip-desc">{{ tip.desc }}</span>
              </div>
            </div>
          </div>
        </div>

      </aside>
    </div>

    <!-- Expanded student modal -->
    <Transition name="modal-fade">
      <div v-if="expandedEntry" class="modal-overlay" @click.self="expandedEntry = null">
        <div class="modal-box">
          <div class="modal-header">
            <div class="modal-avatar" :class="{ 'you-avatar': expandedEntry.isYou }">{{ expandedEntry.initials }}</div>
            <div class="modal-title-col">
              <span class="modal-name">{{ expandedEntry.name }} <span v-if="expandedEntry.isYou" class="you-tag">YOU</span></span>
              <span class="modal-stream">{{ expandedEntry.stream }}</span>
            </div>
            <span class="modal-rank-badge">#{{ expandedEntry.rank }}</span>
            <button class="modal-close" @click="expandedEntry = null">×</button>
          </div>
          <div class="modal-stats">
            <div v-for="s in entryStats(expandedEntry)" :key="s.label" class="ms-stat">
              <span class="ms-value">{{ s.value }}</span>
              <span class="ms-label">{{ s.label }}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="iso-btn iso-btn--ghost" @click="expandedEntry = null">Close</button>
            <NuxtLink to="/dashboard/mock-exam" class="iso-btn iso-btn--fill">Challenge Yourself →</NuxtLink>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────
interface Entry {
  id: number
  rank: number
  name: string
  initials: string
  stream: string
  score: number
  exams: number
  accuracy: number
  streak: number
  change: number
  isYou?: boolean
}

// ── State ──────────────────────────────────────────────────
const selectedStream = ref('All')
const selectedPeriod = ref('all')
const sortBy = ref('score')
const searchQuery = ref('')
const showAllRows = ref(false)
const expandedId = ref<number | null>(null)
const expandedEntry = ref<Entry | null>(null)
const pageSize = 17

// ── Constants ──────────────────────────────────────────────
const streams  = ['All', 'HSC', 'SSC', 'BUET', 'Medical', 'BCS', 'Bank']
const periods  = [
  { val: 'week',  label: 'This Week' },
  { val: 'month', label: 'This Month' },
  { val: 'all',   label: 'All Time' },
]
const sortOptions = [
  { val: 'score',    label: 'Score' },
  { val: 'accuracy', label: 'Accuracy' },
  { val: 'exams',    label: 'Exams' },
  { val: 'streak',   label: 'Streak' },
]

// ── Demo data ──────────────────────────────────────────────
const allEntries: Entry[] = [
  { id: 1,  rank: 1,   name: 'Farhan Rahman',      initials: 'FR', stream: 'BUET',    score: 18420, exams: 94,  accuracy: 91, streak: 42, change: 0   },
  { id: 2,  rank: 2,   name: 'Nusrat Jahan',        initials: 'NJ', stream: 'Medical', score: 17850, exams: 88,  accuracy: 89, streak: 38, change: +1  },
  { id: 3,  rank: 3,   name: 'Sabbir Ahmed',        initials: 'SA', stream: 'HSC',     score: 17200, exams: 76,  accuracy: 87, streak: 31, change: -1  },
  { id: 4,  rank: 4,   name: 'Mim Akter',           initials: 'MA', stream: 'BCS',     score: 16780, exams: 82,  accuracy: 85, streak: 28, change: +2  },
  { id: 5,  rank: 5,   name: 'Riyadh Islam',        initials: 'RI', stream: 'BUET',    score: 16100, exams: 71,  accuracy: 88, streak: 25, change: -1  },
  { id: 6,  rank: 6,   name: 'Tasnuva Hoque',       initials: 'TH', stream: 'Medical', score: 15840, exams: 68,  accuracy: 86, streak: 22, change: +3  },
  { id: 7,  rank: 7,   name: 'Mahfuz Alam',         initials: 'MA', stream: 'HSC',     score: 15490, exams: 65,  accuracy: 84, streak: 20, change: 0   },
  { id: 8,  rank: 8,   name: 'Riya Sultana',        initials: 'RS', stream: 'BCS',     score: 15100, exams: 72,  accuracy: 82, streak: 18, change: +1  },
  { id: 9,  rank: 9,   name: 'Asif Hossain',        initials: 'AH', stream: 'BUET',    score: 14800, exams: 60,  accuracy: 83, streak: 17, change: -2  },
  { id: 10, rank: 10,  name: 'Lamia Chowdhury',     initials: 'LC', stream: 'HSC',     score: 14520, exams: 58,  accuracy: 81, streak: 15, change: +4  },
  { id: 11, rank: 11,  name: 'Imran Hasan',         initials: 'IH', stream: 'Medical', score: 14200, exams: 55,  accuracy: 80, streak: 14, change: +2  },
  { id: 12, rank: 12,  name: 'Sharmin Nahar',       initials: 'SN', stream: 'BCS',     score: 13950, exams: 62,  accuracy: 79, streak: 13, change: -1  },
  { id: 13, rank: 13,  name: 'Rakibul Islam',       initials: 'RI', stream: 'HSC',     score: 13700, exams: 50,  accuracy: 78, streak: 12, change: 0   },
  { id: 14, rank: 14,  name: 'Farzana Begum',       initials: 'FB', stream: 'SSC',     score: 13400, exams: 48,  accuracy: 77, streak: 11, change: +1  },
  { id: 15, rank: 15,  name: 'Nahid Hasan',         initials: 'NH', stream: 'Bank',    score: 13100, exams: 54,  accuracy: 76, streak: 10, change: -3  },
  { id: 16, rank: 16,  name: 'Sadia Islam',         initials: 'SI', stream: 'Medical', score: 12800, exams: 46,  accuracy: 75, streak: 9,  change: +5  },
  { id: 17, rank: 17,  name: 'Maruf Ahmed',         initials: 'MA', stream: 'BUET',    score: 12500, exams: 44,  accuracy: 74, streak: 8,  change: 0   },
  { id: 18, rank: 18,  name: 'Jesmin Akter',        initials: 'JA', stream: 'BCS',     score: 12200, exams: 52,  accuracy: 73, streak: 8,  change: +2  },
  { id: 19, rank: 19,  name: 'Tanvir Rahman',       initials: 'TR', stream: 'HSC',     score: 11900, exams: 42,  accuracy: 72, streak: 7,  change: -2  },
  { id: 20, rank: 20,  name: 'Popy Khatun',         initials: 'PK', stream: 'SSC',     score: 11600, exams: 40,  accuracy: 71, streak: 7,  change: 0   },
  { id: 142,rank: 142, name: 'You',                 initials: 'ME', stream: 'HSC',     score: 9240,  exams: 38,  accuracy: 74, streak: 14, change: +8, isYou: true },
]

const yourEntry = allEntries.find(e => e.isYou)! as Entry
const userRank = ref(yourEntry.rank)
const totalStudents = ref('82,400')
const rankPercent = computed(() => Math.round(yourEntry.rank / 82400 * 100))
const topPercent = computed(() => rankPercent.value < 1 ? '<1' : rankPercent.value)

// ── Filtered / sorted ──────────────────────────────────────
const filteredEntries = computed(() => {
  let list = [...allEntries]
  if (selectedStream.value !== 'All') list = list.filter(e => e.stream === selectedStream.value)
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(e => e.name.toLowerCase().includes(q))
  }
  list.sort((a, b) => {
    if (sortBy.value === 'accuracy') return b.accuracy - a.accuracy
    if (sortBy.value === 'exams')    return b.exams - a.exams
    if (sortBy.value === 'streak')   return b.streak - a.streak
    return b.score - a.score
  })
  // Reassign display ranks after filter
  return list.map((e, i) => ({ ...e, rank: i + 1 }))
})

const yourEntryVisible = computed(() => {
  const slice = filteredEntries.value.slice(0, showAllRows.value ? undefined : 3 + pageSize)
  return slice.some(e => e.isYou)
})

// ── Sidebar data ───────────────────────────────────────────
const climbTargets = computed(() => {
  return filteredEntries.value
    .filter(e => !e.isYou && e.score > yourEntry.score)
    .slice(-4)
    .reverse()
    .slice(0, 4)
})

const streamDist = [
  { name: 'HSC',     count: 28400, pct: 34 },
  { name: 'BCS',     count: 18200, pct: 22 },
  { name: 'SSC',     count: 14800, pct: 18 },
  { name: 'Medical', count: 9900,  pct: 12 },
  { name: 'BUET',    count: 6600,  pct: 8  },
  { name: 'Bank',    count: 4500,  pct: 6  },
]

const scoreBuckets = [
  { label: '15K+',      count: 142,   isYou: false },
  { label: '12–15K',    count: 890,   isYou: false },
  { label: '9–12K',     count: 4200,  isYou: true  },
  { label: '6–9K',      count: 12400, isYou: false },
  { label: '3–6K',      count: 31000, isYou: false },
  { label: '0–3K',      count: 33768, isYou: false },
]
const maxBucketCount = Math.max(...scoreBuckets.map(b => b.count))

const climbTips = [
  { label: 'Daily Mock Exams',    desc: 'Take one timed exam every day — scores compound fast.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  { label: 'Drill Weak Topics',   desc: 'Your bottom 3 subjects are pulling your rank down.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>` },
  { label: 'Maintain Streak',     desc: 'Top 10 all have 30+ day streaks. Consistency wins.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  { label: 'Hard Questions',      desc: 'Only 15% of students attempt hard-mode. Be one of them.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>` },
]

// ── Methods ────────────────────────────────────────────────
function expandEntry(entry: Entry | undefined) {
  if (!entry) return
  expandedEntry.value = expandedEntry.value?.id === entry.id ? null : entry
}

function entryStats(entry: Entry) {
  return [
    { label: 'Score',    value: entry.score.toLocaleString() },
    { label: 'Rank',     value: '#' + entry.rank             },
    { label: 'Exams',    value: entry.exams                  },
    { label: 'Accuracy', value: entry.accuracy + '%'         },
    { label: 'Streak',   value: '🔥 ' + entry.streak         },
    { label: 'Change',   value: (entry.change >= 0 ? '↑' : '↓') + Math.abs(entry.change) },
  ]
}
</script>

<style scoped>
/* ── Page ────────────────────────────────────────────────── */
.leaderboard-page { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; min-width: 0; overflow-x: hidden; }

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
  background-size: 24px 24px; pointer-events: none;
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
.page-sub { font-size: 0.83rem; color: var(--gray); max-width: 420px; }

.your-rank-card {
  display: flex; flex-direction: column; gap: 5px;
  padding: 1.4rem 1.8rem;
  border: 1px solid var(--border-bright); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06);
  flex-shrink: 0; min-width: 180px; position: relative;
}
.yr-label {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}
.yr-rank {
  font-family: var(--font-mono); font-size: 2.6rem; font-weight: 700;
  color: var(--white); letter-spacing: -2px; line-height: 1;
}
.yr-meta { font-size: 0.7rem; color: var(--gray); }
.yr-bar-wrap { height: 2px; background: var(--border); margin-top: 6px; }
.yr-bar-fill { height: 100%; background: rgba(240,240,234,0.4); transition: width 0.6s ease; }

/* ── Filter bar ──────────────────────────────────────────── */
.filter-bar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 0;
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  min-width: 0; overflow-x: hidden;
}
.filter-group {
  display: flex; align-items: center; gap: 10px;
  padding: 0.8rem 1.2rem; border-right: 1px solid var(--border);
  min-width: 0;
}
.filter-label {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray);
  flex-shrink: 0;
}
.filter-pills { display: flex; gap: 5px; flex-wrap: wrap; }
.filter-pill {
  font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 4px 11px;
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
.filter-search {
  display: flex; align-items: center; gap: 8px;
  padding: 0.8rem 1.2rem; flex: 1; min-width: 160px;
  color: var(--gray);
}
.search-input {
  border: none !important; background: transparent !important;
  padding: 0 !important; font-size: 0.82rem !important;
  box-shadow: none !important; flex: 1;
}
.search-input:focus { box-shadow: none !important; }

/* ── Body layout ─────────────────────────────────────────── */
.lb-body {
  display: grid; grid-template-columns: 1fr 280px;
  gap: 1.5rem; align-items: start;
}

/* ── Podium ──────────────────────────────────────────────── */
.podium {
  display: flex; align-items: flex-end; justify-content: center;
  gap: 1px; background: var(--border);
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  margin-bottom: 1.5rem;
}
.podium-card {
  flex: 1; display: flex; flex-direction: column; align-items: center;
  gap: 6px; padding: 1.4rem 1rem;
  background: #0d0d0d; cursor: pointer;
  transition: background 0.15s; position: relative;
  border-top: 3px solid transparent;
}
.podium-card:hover { background: #111; }
.podium-card.first { padding-top: 2rem; border-top-color: rgba(240,240,234,0.4); }
.podium-card.second { border-top-color: rgba(240,240,234,0.15); }
.podium-card.third  { border-top-color: rgba(240,240,234,0.08); }

.pod-crown {
  color: rgba(240,240,234,0.5);
  position: absolute; top: 10px;
}
.pod-avatar {
  width: 44px; height: 44px;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700;
  color: var(--white); background: #111;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.08);
}
.pod-avatar.gold {
  border-color: rgba(240,240,234,0.5);
  background: rgba(240,240,234,0.06);
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.15);
}
.pod-position {
  font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700;
  color: var(--gray); line-height: 1;
}
.pod-position.gold { color: rgba(240,240,234,0.7); }
.pod-name  { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); text-align: center; }
.pod-score { font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); font-weight: 700; }
.pod-stream { font-size: 0.62rem; color: var(--gray); font-family: var(--font-mono); letter-spacing: 0.08em; }

/* ── Table ───────────────────────────────────────────────── */
.lb-table {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  display: flex; flex-direction: column;
}

.lb-table-header {
  display: grid;
  grid-template-columns: 52px 1fr 80px 90px 60px 80px 65px 65px;
  padding: 0.65rem 1.2rem;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray);
  gap: 8px;
}

.table-section-label {
  padding: 0.45rem 1.2rem;
  background: rgba(240,240,234,0.025);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--gray);
}

.lb-row {
  display: grid;
  grid-template-columns: 52px 1fr 80px 90px 60px 80px 65px 65px;
  padding: 0.75rem 1.2rem;
  border-bottom: 1px solid var(--border);
  align-items: center; gap: 8px;
  cursor: pointer; transition: background 0.12s;
}
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: rgba(240,240,234,0.025); }
.lb-row.is-you { background: rgba(240,240,234,0.04); }
.lb-row.is-you:hover { background: rgba(240,240,234,0.06); }
.lb-row.highlight-you { border-left: 3px solid rgba(240,240,234,0.4); }

.lr-rank { display: flex; align-items: center; }
.rank-num {
  font-family: var(--font-mono); font-size: 0.78rem; font-weight: 700;
  color: var(--gray);
}
.rank-num.top { color: var(--white); }
.rank-num.rank-1 { color: rgba(240,240,234,0.9); font-size: 0.88rem; }
.rank-num.rank-2 { color: rgba(240,240,234,0.7); }
.rank-num.rank-3 { color: rgba(240,240,234,0.55); }

.lr-student { display: flex; align-items: center; gap: 10px; min-width: 0; }
.lr-avatar {
  width: 28px; height: 28px; flex-shrink: 0;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.58rem; font-weight: 700;
  color: var(--gray); background: #111;
  box-shadow: 1px 1px 0 0 rgba(240,240,234,0.04);
}
.you-avatar { border-color: rgba(240,240,234,0.5); color: var(--white); background: rgba(240,240,234,0.07); }
.lr-name {
  font-size: 0.82rem; font-weight: 500; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: flex; align-items: center; gap: 7px;
}
.you-tag {
  font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.1em;
  color: var(--black); background: var(--white); padding: 1px 5px;
  flex-shrink: 0;
}

.lr-stream   { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); }
.lr-score    { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white); }
.lr-exams    { font-family: var(--font-mono); font-size: 0.72rem; color: var(--gray); }
.lr-accuracy { font-family: var(--font-mono); font-size: 0.72rem; color: var(--dim); }
.lr-streak   { font-family: var(--font-mono); font-size: 0.68rem; color: var(--dim); }
.lr-change   { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; }
.lr-change.up   { color: rgba(120,230,120,0.8); }
.lr-change.down { color: rgba(255,100,100,0.8); }
.lr-change.same { color: var(--gray); }

.podium-row { background: rgba(240,240,234,0.02); }

.ellipsis-row {
  padding: 0.6rem 1.2rem;
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.7rem;
  color: var(--gray); text-align: center;
  letter-spacing: 0.2em;
}

.show-more-row {
  padding: 1.2rem; border-top: 1px solid var(--border);
  display: flex; justify-content: center;
}
.show-more-btn { font-size: 0.65rem !important; padding: 9px 18px !important; }

/* ── Sidebar ─────────────────────────────────────────────── */
.lb-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
.side-panel {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.panel-header {
  padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}

/* Climb list */
.climb-list { display: flex; flex-direction: column; }
.climb-row {
  display: flex; flex-direction: column; gap: 7px;
  padding: 0.85rem 1.2rem; border-bottom: 1px solid var(--border);
}
.climb-row:last-child { border-bottom: none; }
.cr-left { display: flex; align-items: center; gap: 8px; }
.cr-rank { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); width: 30px; }
.cr-name { font-size: 0.78rem; color: var(--dim); flex: 1;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cr-right { display: flex; flex-direction: column; gap: 5px; }
.cr-gap { font-family: var(--font-mono); font-size: 0.62rem; color: rgba(255,200,80,0.8); text-align: right; }
.cr-bar-wrap { height: 2px; background: var(--border); }
.cr-bar-fill { height: 100%; background: rgba(240,240,234,0.3); transition: width 0.5s ease; }

/* Stream dist */
.stream-dist { display: flex; flex-direction: column; gap: 10px; padding: 1.1rem 1.2rem; }
.sd-row { display: flex; flex-direction: column; gap: 5px; }
.sd-top { display: flex; align-items: center; gap: 6px; }
.sd-name { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); flex: 1; }
.sd-count { font-size: 0.62rem; color: var(--gray); }
.sd-pct { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); width: 30px; text-align: right; }
.sd-bar-wrap { height: 2px; background: var(--border); }
.sd-bar-fill { height: 100%; background: rgba(240,240,234,0.25); transition: width 0.6s ease; }

/* Score dist */
.score-dist { display: flex; flex-direction: column; padding: 0.6rem 0; }
.sdb-row {
  display: flex; align-items: center; gap: 8px;
  padding: 0.55rem 1.2rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.12s;
}
.sdb-row:last-child { border-bottom: none; }
.sdb-label { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); width: 44px; flex-shrink: 0; }
.sdb-bar-wrap { flex: 1; height: 6px; background: var(--border); }
.sdb-bar-fill { height: 100%; background: rgba(240,240,234,0.2); transition: width 0.6s ease; }
.sdb-bar-fill.you-bucket { background: rgba(240,240,234,0.6); }
.sdb-count { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); width: 42px; text-align: right; flex-shrink: 0; }
.sdb-you { font-family: var(--font-mono); font-size: 0.58rem; color: var(--white); flex-shrink: 0; letter-spacing: 0.06em; }

/* Tips */
.tips-list { display: flex; flex-direction: column; }
.tip-row {
  display: flex; gap: 10px; padding: 0.8rem 1.2rem;
  border-bottom: 1px solid var(--border); align-items: flex-start;
}
.tip-row:last-child { border-bottom: none; }
.tip-icon { color: var(--gray); flex-shrink: 0; margin-top: 2px; }
.tip-text  { display: flex; flex-direction: column; gap: 3px; }
.tip-label { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--white); }
.tip-desc  { font-size: 0.72rem; color: var(--gray); line-height: 1.4; }

/* ── Modal ───────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(8,8,8,0.85); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-box {
  background: #0f0f0f;
  border: 1px solid var(--border-bright);
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.06), 6px 6px 0 0 rgba(240,240,234,0.04);
  width: 100%; max-width: 480px;
}
.modal-header {
  display: flex; align-items: center; gap: 14px;
  padding: 1.4rem 1.6rem; border-bottom: 1px solid var(--border);
}
.modal-avatar {
  width: 44px; height: 44px;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700;
  color: var(--white); background: #111; flex-shrink: 0;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.08);
}
.modal-title-col { flex: 1; display: flex; flex-direction: column; gap: 3px; }
.modal-name { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--white); display: flex; align-items: center; gap: 8px; }
.modal-stream { font-size: 0.72rem; color: var(--gray); }
.modal-rank-badge {
  font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700;
  color: var(--white); flex-shrink: 0;
}
.modal-close {
  width: 30px; height: 30px; border: 1px solid var(--border-bright);
  background: transparent; color: var(--gray); cursor: pointer; font-size: 1.1rem;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  transition: color 0.2s, border-color 0.2s;
}
.modal-close:hover { color: var(--white); border-color: var(--white); }
.modal-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px; background: var(--border);
}
.ms-stat {
  background: #0f0f0f; padding: 1.1rem 1.2rem;
  display: flex; flex-direction: column; gap: 4px;
}
.ms-value { font-family: var(--font-mono); font-size: 1.2rem; font-weight: 700; color: var(--white); }
.ms-label { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }
.modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 1.2rem 1.6rem; border-top: 1px solid var(--border);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1100px) {
  .lb-body { grid-template-columns: 1fr; }
  .lb-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) {
  .lb-table-header,
  .lb-row {
    grid-template-columns: 44px 1fr 70px 80px 60px 65px;
  }
  .lb-table-header span:nth-child(6),
  .lb-table-header span:nth-child(7),
  .lr-streak, .lr-accuracy { display: none; }
}
@media (max-width: 768px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .your-rank-card { width: 100%; box-sizing: border-box; }
  .filter-bar { flex-direction: column; align-items: flex-start; }
  .filter-group { border-right: none; border-bottom: 1px solid var(--border); width: 100%; box-sizing: border-box; }
  .filter-search { flex: 1; min-width: 0; width: 100%; box-sizing: border-box; }
  .lb-sidebar { grid-template-columns: 1fr; }
  .podium { flex-direction: row; }
  .lb-table-header,
  .lb-row { grid-template-columns: 40px 1fr 80px 65px; }
  .lb-table-header span:nth-child(3),
  .lb-table-header span:nth-child(5),
  .lr-stream, .lr-exams { display: none; }
  .modal-stats { grid-template-columns: repeat(2, 1fr); }
  .modal-box { max-width: 100%; box-sizing: border-box; }
}
@media (max-width: 480px) {
  .leaderboard-page { overflow-x: hidden; }
  .page-header { padding: 1.2rem; }
  .page-title { font-size: 1.4rem; }
  .filter-pills { flex-wrap: wrap; }
  .podium-card { padding: 1rem 0.5rem; }
  .pod-name { font-size: 0.62rem; }
  .lb-table-header,
  .lb-row { grid-template-columns: 36px 1fr 72px 58px; padding: 0.6rem 0.75rem; gap: 4px; }
  .lb-table-header { font-size: 0.5rem; }
  .lr-score { font-size: 0.72rem; }
  .lr-change { font-size: 0.65rem; }
  .your-rank-card { padding: 1rem 1.2rem; }
  .yr-rank { font-size: 2rem; }
  .side-panel { overflow-x: hidden; }
  .climb-row { overflow-x: hidden; }
  .cr-name { max-width: 100px; }
  .modal-header { padding: 1rem; gap: 10px; }
  .modal-rank-badge { font-size: 1rem; }
  .modal-footer { padding: 1rem; flex-wrap: wrap; }
}
</style>
