<template>
  <div class="exam-detail-page">

    <div v-if="loading" class="empty-state">Loading…</div>
    <div v-else-if="loadError" class="empty-state error-text">{{ loadError }}</div>

    <template v-else-if="exam">
      <div class="setup-header">
        <div class="header-left">
          <NuxtLink class="back-link" to="/dashboard/teacher/exams">← My Exams</NuxtLink>
          <h1 class="page-title">{{ exam.title }}</h1>
          <div class="header-meta">
            <span class="status-badge" :class="exam.status">{{ exam.status }}</span>
            <span>{{ exam.mcq_count }} MCQs{{ exam.has_written_section ? ` + ${exam.written_count} written` : '' }} · {{ exam.duration_mins }}m</span>
          </div>
        </div>
        <button v-if="exam.status === 'published'" class="iso-btn iso-btn--ghost" @click="copyLink">{{ copied ? 'Copied ✓' : 'Copy Share Link' }}</button>
      </div>

      <div class="summary-row">
        <div class="summary-stat"><span class="ss-val">{{ attempts.length }}</span><span class="ss-label">Attempts</span></div>
        <div class="summary-stat"><span class="ss-val">{{ avgScore }}%</span><span class="ss-label">Avg MCQ Score</span></div>
        <div class="summary-stat" :class="{ highlight: needsGradingCount > 0 }"><span class="ss-val">{{ needsGradingCount }}</span><span class="ss-label">Need Grading</span></div>
      </div>

      <div class="filter-pills">
        <button v-for="f in tabs" :key="f.val" class="filter-pill" :class="{ active: tab === f.val }" @click="tab = f.val">{{ f.label }}</button>
      </div>

      <div v-if="!filteredAttempts.length" class="empty-state">No attempts in this view yet.</div>

      <div v-else class="attempt-list">
        <div v-for="att in filteredAttempts" :key="att.id" class="attempt-row">
          <div class="attempt-row-head" @click="toggleExpand(att.id)">
            <span class="attempt-name">{{ att.student_name || att.guest_name || 'Guest' }}</span>
            <span class="attempt-meta">MCQ: {{ att.mcq_marks_earned }}/{{ totalMcqPossible }} · {{ att.mcq_correct_count }}✓ {{ att.mcq_wrong_count }}✗ {{ att.mcq_skipped_count }}—</span>
            <span class="grading-tag" :class="att.status">{{ att.status === 'submitted' ? 'Needs grading' : att.status === 'graded' ? 'Graded' : 'In progress' }}</span>
            <span v-if="att.status !== 'in_progress'" class="total-score">{{ att.total_marks_earned }} / {{ att.total_marks_possible }}</span>
            <span class="expand-chevron">{{ expandedId === att.id ? '−' : '+' }}</span>
          </div>

          <div v-if="expandedId === att.id" class="attempt-body">
            <p class="attempt-submitted-at">Submitted {{ formatDateTime(att.submitted_at) }}{{ att.guest_contact ? ` · ${att.guest_contact}` : '' }}</p>

            <template v-if="exam.has_written_section">
              <div v-for="wq in writtenQuestions" :key="wq.id" class="grading-card">
                <p class="wq-text">{{ wq.question_text }}<span class="wq-marks">/ {{ wq.marks }} marks</span></p>
                <img v-if="wq.question_image_url" :src="wq.question_image_url" class="wq-image" alt="" />
                <div v-if="wq.model_answer" class="model-answer-block"><span class="explanation-label">MODEL ANSWER (teacher reference)</span><p>{{ wq.model_answer }}</p></div>

                <div class="student-answer-block">
                  <span class="explanation-label">STUDENT'S ANSWER</span>
                  <p class="student-answer-text">{{ att.written_answers?.[wq.id]?.text || '— No answer submitted —' }}</p>
                  <img v-if="att.written_answers?.[wq.id]?.image_url" :src="att.written_answers[wq.id].image_url" class="wq-image" alt="" />
                </div>

                <div class="award-row">
                  <label class="form-label">Marks Awarded</label>
                  <input v-model.number="gradeDrafts[att.id][wq.id]" class="text-input marks-input" type="number" min="0" :max="wq.marks" step="0.5" />
                  <span class="award-max">/ {{ wq.marks }}</span>
                </div>
              </div>

              <button class="iso-btn iso-btn--fill save-grade-btn" :disabled="savingId === att.id" @click="saveGrade(att)">
                {{ savingId === att.id ? 'Saving…' : 'Save Grades' }}
              </button>
            </template>
            <p v-else class="no-written-note">This exam has no written section — MCQs are graded automatically.</p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'teacher'], layout: 'dashboard' })

const route = useRoute()
const examId = route.params.id as string
const supabase = useSupabaseClient()
const userID = useSupabaseUser()

const exam = ref<any>(null)
const writtenQuestions = ref<any[]>([])
const attempts = ref<any[]>([])
const loading = ref(true)
const loadError = ref('')

const tab = ref<'all' | 'needs_grading' | 'graded'>('all')
const tabs = [
  { val: 'all', label: 'All' },
  { val: 'needs_grading', label: 'Needs Grading' },
  { val: 'graded', label: 'Graded' },
]
const filteredAttempts = computed(() => {
  if (tab.value === 'needs_grading') return attempts.value.filter(a => a.status === 'submitted')
  if (tab.value === 'graded') return attempts.value.filter(a => a.status === 'graded')
  return attempts.value
})

const expandedId = ref<string | null>(null)
const gradeDrafts = reactive<Record<string, Record<string, number>>>({})

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
  if (expandedId.value && !gradeDrafts[id]) {
    const att = attempts.value.find(a => a.id === id)
    gradeDrafts[id] = {}
    writtenQuestions.value.forEach(wq => {
      gradeDrafts[id][wq.id] = att?.written_answers?.[wq.id]?.marks_awarded ?? 0
    })
  }
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const { data: examRow, error: examErr } = await supabase.from('teacher_exams').select('*').eq('id', examId).eq('teacher_id', userID.value!.id).single()
    if (examErr || !examRow) throw examErr || new Error('Exam not found')
    exam.value = examRow

    if (examRow.has_written_section) {
      const { data: wq } = await supabase.from('teacher_exam_written_questions').select('*').eq('exam_id', examId).order('order_index')
      writtenQuestions.value = wq ?? []
    }

    const { data: mcq } = await supabase.from('teacher_exam_questions').select('marks').eq('exam_id', examId)
    totalMcqPossible.value = (mcq ?? []).reduce((s, r) => s + Number(r.marks), 0)

    const { data: att, error: attErr } = await supabase
      .from('teacher_exam_attempts')
      .select('*')
      .eq('exam_id', examId)
      .order('submitted_at', { ascending: false })
    if (attErr) throw attErr
    attempts.value = att ?? []
  } catch (e: any) {
    loadError.value = e?.message || 'Failed to load this exam.'
  } finally {
    loading.value = false
  }
}
load()

const totalMcqPossible = ref(0)
const needsGradingCount = computed(() => attempts.value.filter(a => a.status === 'submitted').length)
const avgScore = computed(() => {
  if (!attempts.value.length || !totalMcqPossible.value) return 0
  const sum = attempts.value.reduce((s, a) => s + Number(a.mcq_marks_earned), 0)
  return Math.round((sum / (attempts.value.length * totalMcqPossible.value)) * 100)
})

function formatDateTime(v: string) { return v ? new Date(v).toLocaleString() : '' }

const copied = ref(false)
function copyLink() {
  navigator.clipboard.writeText(`${window.location.origin}/exam/${exam.value.share_token}`)
  copied.value = true
  setTimeout(() => copied.value = false, 1800)
}

const savingId = ref<string | null>(null)
async function saveGrade(att: any) {
  savingId.value = att.id
  try {
    const drafts = gradeDrafts[att.id]
    const updatedWrittenAnswers = { ...(att.written_answers || {}) }
    let writtenTotal = 0
    writtenQuestions.value.forEach(wq => {
      const awarded = Math.max(0, Math.min(wq.marks, Number(drafts[wq.id]) || 0))
      updatedWrittenAnswers[wq.id] = { ...(updatedWrittenAnswers[wq.id] || {}), marks_awarded: awarded }
      writtenTotal += awarded
    })

    const totalEarned = Number(att.mcq_marks_earned) + writtenTotal

    const { error } = await supabase
      .from('teacher_exam_attempts')
      .update({
        written_answers: updatedWrittenAnswers,
        written_marks_awarded: writtenTotal,
        written_graded: true,
        total_marks_earned: totalEarned,
        status: 'graded',
      })
      .eq('id', att.id)

    if (!error) {
      att.written_answers = updatedWrittenAnswers
      att.written_marks_awarded = writtenTotal
      att.total_marks_earned = totalEarned
      att.status = 'graded'
    }
  } finally {
    savingId.value = null
  }
}
</script>

<style scoped>
.exam-detail-page { display: flex; flex-direction: column; gap: 1.5rem; }
.empty-state { padding: 3rem; text-align: center; color: var(--gray); border: 1px solid var(--border); font-size: 0.85rem; }
.error-text { color: rgba(255,100,100,0.9); }

.setup-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
.back-link { font-size: 0.78rem; color: var(--gray); text-decoration: none; }
.back-link:hover { color: var(--white); }
.page-title { font-family: var(--font-mono); font-size: 1.6rem; color: var(--white); margin: 8px 0 6px; }
.header-meta { display: flex; align-items: center; gap: 8px; font-size: 0.78rem; color: var(--gray); }
.status-badge { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 2px 7px; border: 1px solid var(--border); color: var(--gray); }
.status-badge.published { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); }
.status-badge.draft { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.3); }
.status-badge.closed { color: rgba(255,100,100,0.85); border-color: rgba(255,100,100,0.3); }

.summary-row { display: flex; gap: 1px; background: var(--border); }
.summary-stat { flex: 1; background: var(--black); padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; border: 1px solid transparent; }
.summary-stat.highlight { border-color: rgba(255,200,80,0.4); }
.ss-val { font-family: var(--font-mono); font-size: 1.4rem; color: var(--white); }
.summary-stat.highlight .ss-val { color: rgba(255,200,80,0.9); }
.ss-label { font-size: 0.62rem; color: var(--dim); text-transform: uppercase; letter-spacing: 0.1em; }

.filter-pills { display: flex; gap: 6px; }
.filter-pill { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); background: transparent; border: 1px solid var(--border); padding: 7px 12px; cursor: pointer; }
.filter-pill.active { background: var(--white); color: var(--black); border-color: var(--white); }

.attempt-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.attempt-row { background: var(--black); }
.attempt-row-head { display: flex; align-items: center; gap: 14px; padding: 14px 16px; cursor: pointer; flex-wrap: wrap; }
.attempt-name { font-family: var(--font-mono); font-size: 0.84rem; color: var(--white); min-width: 120px; }
.attempt-meta { font-size: 0.76rem; color: var(--gray); flex: 1; }
.grading-tag { font-size: 0.62rem; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 8px; border: 1px solid var(--border); color: var(--gray); }
.grading-tag.submitted { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.3); }
.grading-tag.graded { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); }
.total-score { font-family: var(--font-mono); font-size: 0.84rem; color: var(--white); }
.expand-chevron { color: var(--gray); font-size: 1.1rem; width: 18px; text-align: center; }

.attempt-body { padding: 0 16px 20px; display: flex; flex-direction: column; gap: 16px; }
.attempt-submitted-at { font-size: 0.72rem; color: var(--dim); margin: 0; }
.no-written-note { font-size: 0.8rem; color: var(--dim); }

.grading-card { border: 1px solid var(--border); padding: 1rem; display: flex; flex-direction: column; gap: 10px; }
.wq-text { font-size: 0.86rem; color: var(--white); margin: 0; }
.wq-marks { color: var(--dim); font-size: 0.74rem; margin-left: 8px; }
.wq-image { max-width: 100%; max-height: 220px; border: 1px solid var(--border); }
.model-answer-block, .student-answer-block { border-left: 2px solid var(--border-bright); padding-left: 12px; }
.explanation-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); }
.model-answer-block p, .student-answer-text { font-size: 0.8rem; color: var(--gray); margin: 4px 0 0; line-height: 1.6; }
.student-answer-text { white-space: pre-wrap; }

.award-row { display: flex; align-items: center; gap: 10px; }
.form-label { font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray); }
.text-input { background: #0d0d0d; border: 1px solid var(--border); color: var(--white); font-size: 0.84rem; padding: 8px 10px; }
.marks-input { width: 70px; }
.award-max { color: var(--dim); font-size: 0.8rem; }
.save-grade-btn { align-self: flex-start; font-size: 0.72rem !important; padding: 10px 18px !important; }
</style>
