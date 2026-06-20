<template>
  <div class="my-exams-page">

    <div class="setup-header">
      <div class="header-left">
        <div class="page-chip"><span class="chip-dot" /> Teacher Tools</div>
        <h1 class="page-title">My <span class="text-outline">Exams.</span></h1>
        <p class="page-sub">Track attempts, copy share links, and grade written answers.</p>
      </div>
      <NuxtLink class="iso-btn iso-btn--fill" to="/dashboard/teacher/question-bank?mode=build">+ New Exam</NuxtLink>
    </div>

    <div class="filter-row">
      <div class="filter-pills">
        <button v-for="f in statusFilters" :key="f.val" class="filter-pill" :class="{ active: statusFilter === f.val }" @click="statusFilter = f.val">
          {{ f.label }} <span v-if="f.val !== 'all'" class="pill-count">{{ countByStatus(f.val) }}</span>
        </button>
      </div>
      <input v-model="search" class="text-input search-input" type="text" placeholder="Search by title…" />
    </div>

    <div v-if="loading" class="empty-state">Loading your exams…</div>
    <div v-else-if="loadError" class="empty-state error-text">{{ loadError }}</div>
    <div v-else-if="!filteredExams.length" class="empty-state">
      {{ exams.length ? 'No exams match that filter.' : "You haven't created an exam yet." }}
    </div>

    <div v-else class="exam-list">
      <div v-for="exam in filteredExams" :key="exam.id" class="exam-row">
        <div class="exam-row-main">
          <div class="exam-row-title-line">
            <span class="status-badge" :class="exam.status">{{ exam.status }}</span>
            <span class="access-badge" :class="exam.access_type">{{ exam.access_type }}</span>
            <h3 class="exam-row-title">{{ exam.title }}</h3>
          </div>
          <div class="exam-row-meta">
            <span>{{ exam.mcq_count }} MCQs{{ exam.has_written_section ? ` + ${exam.written_count} written` : '' }}</span>
            <span>· {{ exam.duration_mins }}m</span>
            <span>· {{ formatDate(exam.created_at) }}</span>
            <span v-if="attemptCounts[exam.id]">· {{ attemptCounts[exam.id].total }} attempt{{ attemptCounts[exam.id].total === 1 ? '' : 's' }}</span>
            <span v-if="attemptCounts[exam.id]?.needsGrading" class="needs-grading-tag">{{ attemptCounts[exam.id].needsGrading }} need grading</span>
          </div>
        </div>

        <div class="exam-row-actions">
          <button v-if="exam.status === 'published'" class="iso-btn iso-btn--ghost row-btn" @click="copyLink(exam)">{{ copiedId === exam.id ? 'Copied ✓' : 'Copy Link' }}</button>
          <button v-if="exam.status === 'draft'" class="iso-btn iso-btn--ghost row-btn" @click="setStatus(exam, 'published')">Publish</button>
          <button v-if="exam.status === 'published'" class="iso-btn iso-btn--ghost row-btn" @click="setStatus(exam, 'closed')">Close</button>
          <button v-if="exam.status === 'closed'" class="iso-btn iso-btn--ghost row-btn" @click="setStatus(exam, 'published')">Reopen</button>
          <NuxtLink class="iso-btn iso-btn--fill row-btn" :to="`/dashboard/teacher/exams/${exam.id}`">View & Grade →</NuxtLink>
          <button class="delete-btn" @click="deleteExam(exam)">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'teacher'], layout: 'dashboard' })

const supabase = useSupabaseClient()
const userID = useSupabaseUser()

const exams = ref<any[]>([])
const attemptCounts = ref<Record<string, { total: number; needsGrading: number }>>({})
const loading = ref(true)
const loadError = ref('')

const statusFilters = [
  { val: 'all', label: 'All' },
  { val: 'draft', label: 'Draft' },
  { val: 'published', label: 'Published' },
  { val: 'closed', label: 'Closed' },
]
const statusFilter = ref('all')
const search = ref('')

function countByStatus(status: string) { return exams.value.filter(e => e.status === status).length }

const filteredExams = computed(() => exams.value.filter(e =>
  (statusFilter.value === 'all' || e.status === statusFilter.value) &&
  (!search.value.trim() || e.title.toLowerCase().includes(search.value.trim().toLowerCase()))
))

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const { data, error } = await supabase
      .from('teacher_exams')
      .select('*')
      .eq('teacher_id', userID.value!.id)
      .order('created_at', { ascending: false })
    if (error) throw error
    exams.value = data ?? []

    if (exams.value.length) {
      const ids = exams.value.map(e => e.id)
      const { data: attempts } = await supabase
        .from('teacher_exam_attempts')
        .select('exam_id, status')
        .in('exam_id', ids)

      const counts: Record<string, { total: number; needsGrading: number }> = {}
      ;(attempts ?? []).forEach(a => {
        if (!counts[a.exam_id]) counts[a.exam_id] = { total: 0, needsGrading: 0 }
        counts[a.exam_id].total++
        if (a.status === 'submitted') counts[a.exam_id].needsGrading++
      })
      attemptCounts.value = counts
    }
  } catch (e: any) {
    loadError.value = 'Failed to load your exams.'
  } finally {
    loading.value = false
  }
}
load()

function formatDate(v: string) { return new Date(v).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }

const copiedId = ref<string | null>(null)
function copyLink(exam: any) {
  navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.share_token}`)
  copiedId.value = exam.id
  setTimeout(() => copiedId.value = null, 1800)
}

async function setStatus(exam: any, status: string) {
  const { error } = await supabase.from('teacher_exams').update({ status }).eq('id', exam.id)
  if (!error) exam.status = status
}

async function deleteExam(exam: any) {
  if (!confirm(`Delete "${exam.title}"? This also deletes all student attempts. This can't be undone.`)) return
  const { error } = await supabase.from('teacher_exams').delete().eq('id', exam.id)
  if (!error) exams.value = exams.value.filter(e => e.id !== exam.id)
}
</script>

<style scoped>
.my-exams-page { display: flex; flex-direction: column; gap: 1.5rem; }
.setup-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
.page-chip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray); border: 1px solid var(--border); padding: 5px 10px; margin-bottom: 14px; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); }
.page-title { font-family: var(--font-mono); font-size: 1.9rem; color: var(--white); margin: 0; }
.text-outline { color: transparent; -webkit-text-stroke: 1px var(--white); }
.page-sub { color: var(--gray); font-size: 0.85rem; margin-top: 8px; }

.filter-row { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.filter-pills { display: flex; gap: 6px; }
.filter-pill { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); background: transparent; border: 1px solid var(--border); padding: 7px 12px; cursor: pointer; display: flex; gap: 6px; align-items: center; }
.filter-pill.active { background: var(--white); color: var(--black); border-color: var(--white); }
.pill-count { font-size: 0.62rem; opacity: 0.7; }
.text-input { background: #0d0d0d; border: 1px solid var(--border); color: var(--white); font-size: 0.82rem; padding: 9px 12px; }
.search-input { width: 220px; }

.empty-state { padding: 3rem; text-align: center; color: var(--gray); border: 1px solid var(--border); font-size: 0.85rem; }
.error-text { color: rgba(255,100,100,0.9); }

.exam-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.exam-row { background: var(--black); padding: 1.1rem 1.3rem; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; border-left: 2px solid transparent; }
.exam-row:hover { border-left-color: var(--border-bright); }
.exam-row-main { flex: 1; min-width: 240px; }
.exam-row-title-line { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.status-badge, .access-badge { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 7px; border: 1px solid var(--border); color: var(--gray); }
.status-badge.published { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); }
.status-badge.draft { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.3); }
.status-badge.closed { color: rgba(255,100,100,0.85); border-color: rgba(255,100,100,0.3); }
.exam-row-title { font-family: var(--font-mono); font-size: 0.95rem; color: var(--white); margin: 0; }
.exam-row-meta { display: flex; gap: 6px; flex-wrap: wrap; font-size: 0.74rem; color: var(--gray); margin-top: 6px; }
.needs-grading-tag { color: rgba(255,200,80,0.9); }

.exam-row-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.row-btn { font-size: 0.66rem !important; padding: 8px 13px !important; white-space: nowrap; }
.delete-btn { background: none; border: none; color: var(--dim); font-size: 0.7rem; text-decoration: underline; cursor: pointer; }
.delete-btn:hover { color: rgba(255,100,100,0.85); }

@media (max-width: 720px) {
  .exam-row { flex-direction: column; align-items: flex-start; }
}
</style>
