<template>
  <div class="edtube-page" :class="{ 'focus-mode': focusMode }">

    <!-- Focus Mode Overlay Banner -->
    <div v-if="focusMode" class="focus-banner">
      <span class="focus-banner__dot"></span>
      <span class="focus-banner__label">FOCUS MODE ACTIVE</span>
      <span class="focus-banner__session">
        Session: <strong>{{ formatTime(sessionElapsed) }}</strong>
      </span>
      <button class="focus-banner__exit iso-btn iso-btn--ghost" @click="exitFocusMode">
        Exit Focus
      </button>
    </div>

    <!-- Page Header -->
    <div v-if="!focusMode" class="page-header">
      <div class="page-header__left">
        <div class="page-chip">
          <span class="chip-dot"></span>
          EDTUBE
        </div>
        <h1 class="page-title">
          Curated <span class="text-outline">Lectures</span>
        </h1>
        <p class="page-subtitle">
          Handpicked academic video lessons — no shorts, no rabbit holes, no distractions.
        </p>
      </div>
      <div class="page-header__right">
        <div class="session-card">
          <div class="session-card__stat">
            <span class="session-card__val">{{ formatTime(totalWatchTime) }}</span>
            <span class="session-card__label">WATCHED TODAY</span>
          </div>
          <div class="session-divider"></div>
          <div class="session-card__stat">
            <span class="session-card__val">{{ completedVideos.size }}</span>
            <span class="session-card__label">COMPLETED</span>
          </div>
          <div class="session-divider"></div>
          <div class="session-card__stat">
            <span class="session-card__val">{{ currentStreak }}</span>
            <span class="session-card__label">DAY STREAK</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Stream → Subject → Chapter Nav -->
    <div v-if="!focusMode" class="filter-bar">
      <div class="filter-row">
        <span class="filter-label">STREAM</span>
        <div class="pill-group">
          <button
            v-for="stream in streams"
            :key="stream.id"
            class="pill"
            :class="{ active: selectedStream === stream.id }"
            @click="selectStream(stream.id)"
          >
            {{ stream.label }}
          </button>
        </div>
      </div>

      <div class="filter-row" v-if="currentSubjects.length">
        <span class="filter-label">SUBJECT</span>
        <div class="pill-group">
          <button
            v-for="sub in currentSubjects"
            :key="sub.id"
            class="pill"
            :class="{ active: selectedSubject === sub.id }"
            @click="selectSubject(sub.id)"
          >
            {{ sub.label }}
          </button>
        </div>
      </div>

      <div class="filter-row" v-if="currentChapters.length">
        <span class="filter-label">CHAPTER</span>
        <div class="pill-group">
          <button
            class="pill"
            :class="{ active: selectedChapter === '' }"
            @click="selectedChapter = ''"
          >All</button>
          <button
            v-for="ch in currentChapters"
            :key="ch.id"
            class="pill"
            :class="{ active: selectedChapter === ch.id }"
            @click="selectedChapter = ch.id"
          >
            {{ ch.label }}
            <span class="pill-count">{{ ch.count }}</span>
          </button>
        </div>
      </div>

      <!-- Search -->
      <div class="filter-row filter-row--search">
        <div class="search-wrap">
          <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            v-model="searchQuery"
            class="search-input"
            placeholder="Search lectures..."
            type="text"
          />
          <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''">×</button>
        </div>
        <div class="result-count">
          <span class="filter-label">{{ filteredVideos.length }} LECTURES</span>
        </div>
      </div>
    </div>

    <!-- Main Theater Layout -->
    <div class="theater-layout" :class="{ 'theater-layout--focus': focusMode }">

      <!-- Video Player Column -->
      <div class="player-col">
        <div class="player-wrap" v-if="activeVideo">

          <!-- Corner brackets -->
          <div class="corner-tl"></div>
          <div class="corner-br"></div>

          <!-- YouTube Embed -->
          <div class="video-frame-wrap">
            <iframe
              :key="activeVideo.ytId"
              class="video-frame"
              :src="`https://www.youtube.com/embed/${activeVideo.ytId}?rel=0&modestbranding=1&disablekb=0&color=white&iv_load_policy=3&autoplay=1`"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          <!-- Video Meta -->
          <div class="video-meta">
            <div class="video-meta__top">
              <div class="video-meta__tags">
                <span class="vtag">{{ activeVideo.stream }}</span>
                <span class="vtag">{{ activeVideo.subject }}</span>
                <span class="vtag vtag--chapter">{{ activeVideo.chapter }}</span>
              </div>
              <div class="video-meta__actions">
                <button
                  class="vmeta-btn"
                  :class="{ active: completedVideos.has(activeVideo.id) }"
                  @click="toggleComplete(activeVideo.id)"
                  title="Mark complete"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {{ completedVideos.has(activeVideo.id) ? 'COMPLETED' : 'MARK DONE' }}
                </button>
                <button
                  class="vmeta-btn"
                  :class="{ active: bookmarkedVideos.has(activeVideo.id) }"
                  @click="toggleBookmark(activeVideo.id)"
                  title="Bookmark"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                  {{ bookmarkedVideos.has(activeVideo.id) ? 'SAVED' : 'SAVE' }}
                </button>
                <button
                  class="vmeta-btn vmeta-btn--focus"
                  @click="enterFocusMode"
                  title="Focus mode"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                  </svg>
                  FOCUS MODE
                </button>
              </div>
            </div>

            <h2 class="video-title">{{ activeVideo.title }}</h2>
            <p class="video-desc">{{ activeVideo.description }}</p>

            <!-- Progress: prev / next in chapter -->
            <div class="video-nav">
              <button
                class="iso-btn iso-btn--ghost video-nav__btn"
                :disabled="!prevVideo"
                @click="playVideo(prevVideo)"
              >
                ← Prev
              </button>
              <div class="video-nav__pos">
                <span class="filter-label">{{ chapterVideoIndex + 1 }} / {{ chapterVideos.length }} in chapter</span>
              </div>
              <button
                class="iso-btn iso-btn--fill video-nav__btn"
                :disabled="!nextVideo"
                @click="playVideo(nextVideo)"
              >
                Next →
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div class="player-empty" v-else>
          <div class="corner-tl"></div>
          <div class="corner-br"></div>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <p>Select a lecture from the playlist to begin.</p>
        </div>

        <!-- Session Timer Panel (below player, visible always) -->
        <div class="session-timer-panel" v-if="activeVideo">
          <div class="stp-inner">
            <div class="stp-label">STUDY SESSION</div>
            <div class="stp-time" :class="{ 'stp-time--warn': sessionElapsed > 3600 }">
              {{ formatTime(sessionElapsed) }}
            </div>
            <div class="stp-bar-wrap">
              <div class="stp-bar" :style="{ width: sessionProgressPct + '%' }"></div>
            </div>
            <div class="stp-goal">Goal: {{ formatTime(sessionGoalSec) }}</div>
          </div>
          <div class="stp-actions">
            <button class="iso-btn iso-btn--ghost stp-btn" @click="resetSession">Reset</button>
            <div class="stp-goal-pills">
              <button
                v-for="g in goalOptions"
                :key="g.val"
                class="pill pill--sm"
                :class="{ active: sessionGoalSec === g.val }"
                @click="sessionGoalSec = g.val"
              >{{ g.label }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Playlist Column -->
      <div class="playlist-col">

        <!-- Playlist header -->
        <div class="playlist-header">
          <span class="filter-label">PLAYLIST</span>
          <span class="filter-label" style="opacity:0.4;">{{ filteredVideos.length }} videos</span>
        </div>

        <!-- Grouped by chapter -->
        <div class="playlist-scroll">
          <div
            v-for="group in groupedPlaylist"
            :key="group.chapterId"
            class="playlist-chapter"
          >
            <div class="chapter-heading" @click="toggleChapterCollapse(group.chapterId)">
              <span class="chapter-heading__name">{{ group.chapterLabel }}</span>
              <span class="chapter-heading__meta">
                <span class="pill-count">{{ group.videos.length }}</span>
                <svg
                  class="chapter-heading__chevron"
                  :class="{ 'rotated': !collapsedChapters.has(group.chapterId) }"
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </span>
            </div>

            <div class="chapter-videos" v-if="!collapsedChapters.has(group.chapterId)">
              <div
                v-for="(vid, idx) in group.videos"
                :key="vid.id"
                class="plist-card"
                :class="{
                  'plist-card--active': activeVideo?.id === vid.id,
                  'plist-card--done': completedVideos.has(vid.id),
                  'plist-card--bookmarked': bookmarkedVideos.has(vid.id)
                }"
                @click="playVideo(vid)"
              >
                <div class="plist-card__index">
                  <span v-if="completedVideos.has(vid.id)" class="done-check">✓</span>
                  <span v-else>{{ idx + 1 }}</span>
                </div>
                <div class="plist-card__body">
                  <div class="plist-card__title">{{ vid.title }}</div>
                  <div class="plist-card__meta">
                    <span class="plist-meta-tag">{{ vid.duration }}</span>
                    <span class="plist-meta-tag plist-meta-tag--diff" :class="vid.difficulty">{{ vid.difficulty }}</span>
                  </div>
                </div>
                <div class="plist-card__status">
                  <div class="play-dot" :class="{ active: activeVideo?.id === vid.id }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty playlist -->
          <div class="playlist-empty" v-if="filteredVideos.length === 0">
            <p>No lectures match your filters.</p>
          </div>
        </div>

        <!-- Bookmarks quick panel -->
        <div class="bookmarks-panel" v-if="bookmarkedList.length">
          <div class="playlist-header" style="border-top: 1px solid var(--border); padding-top: 16px;">
            <span class="filter-label">BOOKMARKED</span>
            <span class="filter-label" style="opacity:0.4;">{{ bookmarkedList.length }}</span>
          </div>
          <div
            v-for="vid in bookmarkedList"
            :key="'bm-' + vid.id"
            class="plist-card plist-card--bm"
            @click="playVideo(vid)"
          >
            <div class="plist-card__index">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            </div>
            <div class="plist-card__body">
              <div class="plist-card__title">{{ vid.title }}</div>
              <div class="plist-meta-tag">{{ vid.subject }} · {{ vid.chapter }}</div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// ─── Video Database ────────────────────────────────────────────────────────────
// Admin: add videos here. Structure: stream → subject → chapter → video list
const videoBank = [
  // HSC — Physics
  {
    id: 'hsc-phy-mec-01', ytId: 'ZM8ECpBuQYE', stream: 'HSC', subject: 'Physics',
    chapter: 'Mechanics', title: "Newton's Laws of Motion — Full Concept", duration: '28:14',
    difficulty: 'medium', description: 'Complete walkthrough of all three laws with exam-focused problems.',
  },
  {
    id: 'hsc-phy-mec-02', ytId: 'oRKezs9e7EM', stream: 'HSC', subject: 'Physics',
    chapter: 'Mechanics', title: 'Projectile Motion Masterclass', duration: '34:52',
    difficulty: 'hard', description: 'Projectile motion from scratch — angles, range, max height derivations.',
  },
  {
    id: 'hsc-phy-wav-01', ytId: 'GkB7B9-MKAQ', stream: 'HSC', subject: 'Physics',
    chapter: 'Waves & Optics', title: 'Simple Harmonic Motion Explained', duration: '22:05',
    difficulty: 'medium', description: 'SHM, period, frequency, energy — everything for HSC.',
  },
  {
    id: 'hsc-phy-wav-02', ytId: '8p6e3f4x4pI', stream: 'HSC', subject: 'Physics',
    chapter: 'Waves & Optics', title: 'Light Reflection & Refraction', duration: '18:30',
    difficulty: 'easy', description: 'Snell\'s law, critical angle, total internal reflection with diagrams.',
  },
  // HSC — Chemistry
  {
    id: 'hsc-che-org-01', ytId: 'vela6Do1M9I', stream: 'HSC', subject: 'Chemistry',
    chapter: 'Organic Chemistry', title: 'Alkanes, Alkenes, Alkynes — Naming & Reactions', duration: '41:10',
    difficulty: 'hard', description: 'IUPAC naming and all key reactions for HSC board exam.',
  },
  {
    id: 'hsc-che-org-02', ytId: 'oDFIBCHDSbg', stream: 'HSC', subject: 'Chemistry',
    chapter: 'Organic Chemistry', title: 'Functional Groups Overview', duration: '19:45',
    difficulty: 'medium', description: 'Alcohols, aldehydes, ketones, carboxylic acids at a glance.',
  },
  {
    id: 'hsc-che-sto-01', ytId: 'UL1jmJaUkaE', stream: 'HSC', subject: 'Chemistry',
    chapter: 'Stoichiometry', title: 'Mole Concept from Scratch', duration: '26:00',
    difficulty: 'easy', description: 'Avogadro\'s number, molar mass, mole ratio — zero to hero.',
  },
  // HSC — Math
  {
    id: 'hsc-mat-cal-01', ytId: 'WUvTyaaNkzM', stream: 'HSC', subject: 'Math',
    chapter: 'Calculus', title: 'Differentiation — Chain Rule & Product Rule', duration: '31:20',
    difficulty: 'medium', description: 'All differentiation rules with 15 worked examples.',
  },
  {
    id: 'hsc-mat-cal-02', ytId: 'rfG8ce4nNh0', stream: 'HSC', subject: 'Math',
    chapter: 'Calculus', title: 'Integration Techniques', duration: '38:15',
    difficulty: 'hard', description: 'Substitution, by parts, partial fractions — HSC scope only.',
  },
  {
    id: 'hsc-mat-vec-01', ytId: 'ml4NSzCQobk', stream: 'HSC', subject: 'Math',
    chapter: 'Vectors', title: 'Vector Algebra Complete', duration: '24:00',
    difficulty: 'medium', description: 'Dot product, cross product, vector projection — all in one.',
  },
  // SSC — Math
  {
    id: 'ssc-mat-alg-01', ytId: 'NybHckSEQBI', stream: 'SSC', subject: 'Math',
    chapter: 'Algebra', title: 'Quadratic Equations — Solving Methods', duration: '20:10',
    difficulty: 'medium', description: 'Factoring, quadratic formula, discriminant — with MCQ practice.',
  },
  {
    id: 'ssc-mat-geo-01', ytId: 'bOXjS0XkuuA', stream: 'SSC', subject: 'Math',
    chapter: 'Geometry', title: 'Circle Theorems Masterclass', duration: '17:30',
    difficulty: 'medium', description: 'All circle theorems with proof and exam questions.',
  },
  // BUET — Physics
  {
    id: 'buet-phy-em-01', ytId: 'mc979OhitAg', stream: 'BUET', subject: 'Physics',
    chapter: 'Electromagnetism', title: "Gauss's Law & Electric Flux", duration: '29:00',
    difficulty: 'hard', description: 'Gauss law derivations, applications, BUET-level problem solving.',
  },
  {
    id: 'buet-phy-em-02', ytId: 'CiHN0ZWE5bk', stream: 'BUET', subject: 'Physics',
    chapter: 'Electromagnetism', title: "Faraday's Law & Inductance", duration: '33:45',
    difficulty: 'hard', description: 'EMF, Lenz\'s law, self and mutual inductance.',
  },
  // Medical — Biology
  {
    id: 'med-bio-gen-01', ytId: 'KFpBGbVFwCg', stream: 'Medical', subject: 'Biology',
    chapter: 'Genetics', title: 'DNA Replication & Transcription', duration: '35:20',
    difficulty: 'hard', description: 'Molecular biology for medical admission — central dogma explained.',
  },
  {
    id: 'med-bio-gen-02', ytId: 'JQByjprj9Wg', stream: 'Medical', subject: 'Biology',
    chapter: 'Genetics', title: 'Mendelian Genetics — All Laws', duration: '23:50',
    difficulty: 'medium', description: 'Punnett squares, dihybrid crosses, linked genes.',
  },
  // BCS — General Knowledge
  {
    id: 'bcs-gk-ban-01', ytId: 'uyJ0WFDRDTw', stream: 'BCS', subject: 'Bangladesh Affairs',
    chapter: 'History & Culture', title: 'Liberation War 1971 — Complete Timeline', duration: '45:00',
    difficulty: 'medium', description: 'Key events, dates, personalities — BCS Preliminary scope.',
  },
]

// ─── Taxonomy ──────────────────────────────────────────────────────────────────
const streams = [
  { id: 'HSC', label: 'HSC' },
  { id: 'SSC', label: 'SSC' },
  { id: 'BUET', label: 'BUET' },
  { id: 'Medical', label: 'Medical' },
  { id: 'BCS', label: 'BCS' },
]

// ─── State ─────────────────────────────────────────────────────────────────────
const selectedStream = ref('HSC')
const selectedSubject = ref('')
const selectedChapter = ref('')
const searchQuery = ref('')
const activeVideo = ref(null)
const completedVideos = ref(new Set())
const bookmarkedVideos = ref(new Set())
const collapsedChapters = ref(new Set())

// Focus & Session
const focusMode = ref(false)
const sessionElapsed = ref(0)
const sessionGoalSec = ref(3600)
const totalWatchTime = ref(0)
const currentStreak = ref(3)
let sessionInterval = null
let watchInterval = null

const goalOptions = [
  { label: '30m', val: 1800 },
  { label: '1h', val: 3600 },
  { label: '2h', val: 7200 },
  { label: '3h', val: 10800 },
]

// ─── Computed ──────────────────────────────────────────────────────────────────
const currentSubjects = computed(() => {
  const subs = [...new Set(videoBank.filter(v => v.stream === selectedStream.value).map(v => v.subject))]
  return subs.map(s => ({ id: s, label: s }))
})

const currentChapters = computed(() => {
  const videos = videoBank.filter(v =>
    v.stream === selectedStream.value &&
    (selectedSubject.value === '' || v.subject === selectedSubject.value)
  )
  const chapMap = {}
  videos.forEach(v => {
    chapMap[v.chapter] = (chapMap[v.chapter] || 0) + 1
  })
  return Object.entries(chapMap).map(([ch, count]) => ({ id: ch, label: ch, count }))
})

const filteredVideos = computed(() => {
  return videoBank.filter(v => {
    if (v.stream !== selectedStream.value) return false
    if (selectedSubject.value && v.subject !== selectedSubject.value) return false
    if (selectedChapter.value && v.chapter !== selectedChapter.value) return false
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      return v.title.toLowerCase().includes(q) || v.subject.toLowerCase().includes(q) || v.chapter.toLowerCase().includes(q)
    }
    return true
  })
})

const groupedPlaylist = computed(() => {
  const groups = {}
  filteredVideos.value.forEach(v => {
    if (!groups[v.chapter]) groups[v.chapter] = []
    groups[v.chapter].push(v)
  })
  return Object.entries(groups).map(([chapter, videos]) => ({
    chapterId: chapter,
    chapterLabel: chapter,
    videos,
  }))
})

const bookmarkedList = computed(() =>
  videoBank.filter(v => bookmarkedVideos.value.has(v.id))
)

const chapterVideos = computed(() => {
  if (!activeVideo.value) return []
  return filteredVideos.value.filter(v => v.chapter === activeVideo.value.chapter)
})

const chapterVideoIndex = computed(() => {
  if (!activeVideo.value) return 0
  return chapterVideos.value.findIndex(v => v.id === activeVideo.value.id)
})

const prevVideo = computed(() => {
  const idx = chapterVideoIndex.value
  return idx > 0 ? chapterVideos.value[idx - 1] : null
})

const nextVideo = computed(() => {
  const idx = chapterVideoIndex.value
  return idx < chapterVideos.value.length - 1 ? chapterVideos.value[idx + 1] : null
})

const sessionProgressPct = computed(() => {
  return Math.min(100, (sessionElapsed.value / sessionGoalSec.value) * 100)
})

// ─── Methods ───────────────────────────────────────────────────────────────────
function selectStream(id) {
  selectedStream.value = id
  selectedSubject.value = ''
  selectedChapter.value = ''
}

function selectSubject(id) {
  selectedSubject.value = selectedSubject.value === id ? '' : id
  selectedChapter.value = ''
}

function playVideo(vid) {
  if (!vid) return
  activeVideo.value = vid
  startWatchTimer()
}

function toggleComplete(id) {
  const s = new Set(completedVideos.value)
  s.has(id) ? s.delete(id) : s.add(id)
  completedVideos.value = s
}

function toggleBookmark(id) {
  const s = new Set(bookmarkedVideos.value)
  s.has(id) ? s.delete(id) : s.add(id)
  bookmarkedVideos.value = s
}

function toggleChapterCollapse(id) {
  const s = new Set(collapsedChapters.value)
  s.has(id) ? s.delete(id) : s.add(id)
  collapsedChapters.value = s
}

function enterFocusMode() {
  focusMode.value = true
  startSessionTimer()
}

function exitFocusMode() {
  focusMode.value = false
}

function startSessionTimer() {
  if (sessionInterval) return
  sessionInterval = setInterval(() => {
    sessionElapsed.value++
  }, 1000)
}

function startWatchTimer() {
  if (watchInterval) return
  watchInterval = setInterval(() => {
    totalWatchTime.value++
  }, 1000)
}

function resetSession() {
  sessionElapsed.value = 0
}

function formatTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// Auto-play first video on load
onMounted(() => {
  if (filteredVideos.value.length) {
    playVideo(filteredVideos.value[0])
  }
  startSessionTimer()
})

onUnmounted(() => {
  clearInterval(sessionInterval)
  clearInterval(watchInterval)
})

// Reset subject when stream changes
watch(selectedStream, () => {
  selectedSubject.value = ''
  selectedChapter.value = ''
})
</script>

<style scoped>
/* ── Page Shell ── */
.edtube-page {
  padding: 32px;
  min-height: 100vh;
  position: relative;
}

.edtube-page.focus-mode {
  padding-top: 12px;
  background: var(--black);
}

/* ── Focus Banner ── */
.focus-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 20px;
  background: rgba(240,240,234,0.03);
  border: 1px solid var(--border);
  border-radius: 0;
  margin-bottom: 16px;
}

.focus-banner__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(120,230,120,0.8);
  box-shadow: 0 0 6px rgba(120,230,120,0.5);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.focus-banner__label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.18em;
  color: var(--white);
}

.focus-banner__session {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--gray);
  margin-left: auto;
}

.focus-banner__session strong {
  color: var(--white);
}

.focus-banner__exit {
  font-size: 0.65rem;
  padding: 6px 14px;
}

/* ── Page Header ── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.page-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 4px 10px;
  margin-bottom: 12px;
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--white);
  opacity: 0.4;
  animation: pulse 2s infinite;
}

.page-title {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 8px;
  line-height: 1.1;
}

.text-outline {
  -webkit-text-stroke: 1px var(--white);
  color: transparent;
}

.page-subtitle {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--gray);
  margin: 0;
  max-width: 420px;
}

/* Session Card */
.session-card {
  display: flex;
  align-items: center;
  gap: 0;
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.session-card__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 24px;
}

.session-card__val {
  font-family: var(--font-mono);
  font-size: 1.4rem;
  color: var(--white);
  font-weight: 700;
}

.session-card__label {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.14em;
  color: var(--dim);
}

.session-divider {
  width: 1px;
  height: 48px;
  background: var(--border);
}

/* ── Filter Bar ── */
.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  background: rgba(240,240,234,0.01);
  margin-bottom: 24px;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-row--search {
  justify-content: space-between;
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-top: 4px;
}

.filter-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  color: var(--dim);
  white-space: nowrap;
  min-width: 56px;
}

.pill-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.pill {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  padding: 5px 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.pill:hover {
  border-color: var(--border-bright);
  color: var(--white);
}

.pill.active {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}

.pill--sm {
  font-size: 0.6rem;
  padding: 3px 8px;
}

.pill-count {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  background: rgba(240,240,234,0.1);
  padding: 1px 5px;
  border-radius: 0;
}

.pill.active .pill-count {
  background: rgba(8,8,8,0.15);
}

/* Search */
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 320px;
}

.search-icon {
  position: absolute;
  left: 10px;
  color: var(--dim);
}

.search-input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--white);
  font-family: var(--font-sans);
  font-size: 0.8rem;
  padding: 7px 32px 7px 32px;
  outline: none;
  transition: border-color 0.15s;
}

.search-input:focus {
  border-color: var(--border-bright);
}

.search-input::placeholder {
  color: var(--dim);
}

.search-clear {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  color: var(--gray);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.result-count {
  margin-left: auto;
}

/* ── Theater Layout ── */
.theater-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 1px;
  background: var(--border);
  min-height: 600px;
}

.theater-layout--focus {
  grid-template-columns: 1fr 280px;
}

/* ── Player Column ── */
.player-col {
  background: var(--black);
  display: flex;
  flex-direction: column;
}

.player-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* Corner decorations */
.corner-tl,
.corner-br {
  position: absolute;
  width: 16px;
  height: 16px;
  z-index: 2;
  pointer-events: none;
}

.corner-tl {
  top: 0; left: 0;
  border-top: 2px solid var(--border-bright);
  border-left: 2px solid var(--border-bright);
}

.corner-br {
  bottom: 0; right: 0;
  border-bottom: 2px solid var(--border-bright);
  border-right: 2px solid var(--border-bright);
}

.video-frame-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.video-frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.player-empty {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--border);
}

.player-empty p {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--dim);
}

/* Video Meta */
.video-meta {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-top: 1px solid var(--border);
}

.video-meta__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.video-meta__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.vtag {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  padding: 3px 8px;
  border: 1px solid var(--border);
  color: var(--gray);
}

.vtag--chapter {
  border-color: var(--border-bright);
  color: var(--white);
}

.video-meta__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.vmeta-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.1em;
  padding: 5px 10px;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--gray);
  cursor: pointer;
  transition: all 0.15s;
}

.vmeta-btn:hover {
  border-color: var(--border-bright);
  color: var(--white);
}

.vmeta-btn.active {
  background: rgba(240,240,234,0.06);
  border-color: var(--border-bright);
  color: var(--white);
}

.vmeta-btn--focus {
  border-color: rgba(120,230,120,0.3);
  color: rgba(120,230,120,0.7);
}

.vmeta-btn--focus:hover {
  border-color: rgba(120,230,120,0.6);
  color: rgba(120,230,120,1);
  background: rgba(120,230,120,0.05);
}

.video-title {
  font-family: var(--font-mono);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--white);
  margin: 0;
  line-height: 1.35;
}

.video-desc {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--gray);
  margin: 0;
  line-height: 1.6;
}

/* Prev / Next nav */
.video-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.video-nav__btn {
  font-size: 0.7rem;
  padding: 7px 16px;
}

.video-nav__btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.video-nav__pos {
  flex: 1;
  text-align: center;
}

/* ── Session Timer Panel ── */
.session-timer-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 20px;
  border-top: 1px solid var(--border);
  background: rgba(240,240,234,0.01);
}

.stp-inner {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.stp-label {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.14em;
  color: var(--dim);
  white-space: nowrap;
}

.stp-time {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--white);
  font-weight: 700;
  min-width: 60px;
}

.stp-time--warn {
  color: rgba(255,200,80,0.9);
}

.stp-bar-wrap {
  flex: 1;
  height: 3px;
  background: rgba(240,240,234,0.08);
  position: relative;
}

.stp-bar {
  height: 100%;
  background: rgba(120,230,120,0.6);
  transition: width 1s linear;
}

.stp-goal {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  color: var(--dim);
  white-space: nowrap;
}

.stp-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stp-btn {
  font-size: 0.6rem;
  padding: 5px 12px;
}

.stp-goal-pills {
  display: flex;
  gap: 4px;
}

/* ── Playlist Column ── */
.playlist-col {
  background: var(--black);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.playlist-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 10px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.playlist-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

/* Chapter group */
.playlist-chapter {
  border-bottom: 1px solid var(--border);
}

.chapter-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s;
  background: rgba(240,240,234,0.02);
}

.chapter-heading:hover {
  background: rgba(240,240,234,0.04);
}

.chapter-heading__name {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: var(--white);
  opacity: 0.7;
}

.chapter-heading__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-heading__chevron {
  transition: transform 0.2s;
  color: var(--gray);
}

.chapter-heading__chevron.rotated {
  transform: rotate(180deg);
}

/* Playlist card */
.plist-card {
  display: grid;
  grid-template-columns: 28px 1fr 16px;
  gap: 10px;
  align-items: center;
  padding: 10px 16px;
  cursor: pointer;
  border-left: 2px solid transparent;
  transition: all 0.15s;
}

.plist-card:hover {
  background: rgba(240,240,234,0.03);
  border-left-color: var(--border-bright);
}

.plist-card--active {
  background: rgba(240,240,234,0.05);
  border-left-color: var(--white) !important;
}

.plist-card--done {
  opacity: 0.6;
}

.plist-card--bm {
  background: rgba(240,240,234,0.01);
}

.plist-card__index {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  color: var(--dim);
  text-align: center;
}

.done-check {
  color: rgba(120,230,120,0.7);
}

.plist-card__title {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--white);
  line-height: 1.35;
  margin-bottom: 4px;
}

.plist-card--done .plist-card__title {
  text-decoration: line-through;
  color: var(--gray);
}

.plist-card__meta {
  display: flex;
  align-items: center;
  gap: 6px;
}

.plist-meta-tag {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  color: var(--dim);
}

.plist-meta-tag--diff.easy  { color: rgba(120,230,120,0.6); }
.plist-meta-tag--diff.medium { color: rgba(255,200,80,0.6); }
.plist-meta-tag--diff.hard  { color: rgba(255,100,100,0.6); }

.play-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid var(--border);
  transition: all 0.15s;
}

.play-dot.active {
  background: var(--white);
  border-color: var(--white);
  box-shadow: 0 0 6px rgba(240,240,234,0.4);
}

.bookmarks-panel {
  border-top: 1px solid var(--border);
  flex-shrink: 0;
  max-height: 240px;
  overflow-y: auto;
}

.playlist-empty {
  padding: 32px 16px;
  text-align: center;
}

.playlist-empty p {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--dim);
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .theater-layout {
    grid-template-columns: 1fr;
  }
  .playlist-col {
    max-height: 400px;
  }
  .page-header {
    flex-direction: column;
  }
  .edtube-page {
    padding: 16px;
  }
}
</style>
