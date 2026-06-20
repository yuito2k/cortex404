<template>
  <div class="exam-take-page">

    <!-- ══ GATE PHASE ══════════════════════════════════════════ -->
    <div v-if="phase === 'gate'" class="gate-wrap">
      <div v-if="loading" class="gate-card">
        <p class="loading-text">Loading exam…</p>
      </div>

      <div v-else-if="loadError" class="gate-card">
        <span class="gate-tag error">Unavailable</span>
        <p class="gate-message">{{ loadError }}</p>
      </div>

      <div v-else-if="examMeta" class="gate-card">
        <span class="page-chip"><span class="chip-dot" /> Cortex404 Exam</span>
        <h1 class="gate-title">{{ examMeta.title }}</h1>
        <p v-if="examMeta.description" class="gate-desc">{{ examMeta.description }}</p>
        <p v-if="examMeta.teacher_name" class="gate-teacher">Created by {{ examMeta.teacher_name }}<span v-if="examMeta.teacher_org"> · {{ examMeta.teacher_org }}</span></p>

        <div class="gate-meta-row">
          <div class="gate-meta-item"><span class="gmi-val">{{ examMeta.duration_mins }}</span><span class="gmi-label">Minutes</span></div>
          <div class="gate-meta-item"><span class="gmi-val">{{ examMeta.mcq_count }}</span><span class="gmi-label">MCQs</span></div>
          <div v-if="examMeta.has_written_section" class="gate-meta-item"><span class="gmi-val">{{ examMeta.written_count }}</span><span class="gmi-label">Written</span></div>
          <div class="gate-meta-item"><span class="gmi-val">{{ examMeta.total_mcq_marks + (examMeta.has_written_section ? examMeta.total_written_marks : 0) }}</span><span class="gmi-label">Total Marks</span></div>
        </div>

        <!-- Closed states -->
        <div v-if="examMeta.schedule_status === 'not_open'" class="gate-status-msg">
          This exam opens at <strong>{{ formatDateTime(examMeta.starts_at) }}</strong>. Check back then.
        </div>
        <div v-else-if="examMeta.schedule_status === 'closed'" class="gate-status-msg">
          This exam closed at <strong>{{ formatDateTime(examMeta.ends_at) }}</strong> and is no longer accepting submissions.
        </div>
        <div v-else-if="attemptsExhausted" class="gate-status-msg">
          You've already used all {{ examMeta.max_attempts }} of your attempts on this exam.
        </div>

        <!-- Open: code gate or start -->
        <template v-else>
          <div v-if="examMeta.access_type === 'private' && !unlocked" class="code-gate">
            <label class="form-label">This exam is private — enter the access code your teacher shared</label>
            <div class="code-gate-row">
              <input v-model="accessCodeInput" class="text-input code-input" type="text" maxlength="8" placeholder="ACCESS CODE" @keyup.enter="submitCode" />
              <button class="iso-btn iso-btn--fill" :disabled="unlocking" @click="submitCode">{{ unlocking ? '…' : 'Unlock' }}</button>
            </div>
            <p v-if="wrongCode" class="error-text">Incorrect access code. Double-check with your teacher and try again.</p>
          </div>

          <template v-else>
            <div v-if="!userID" class="guest-fields">
              <div class="meta-field">
                <label class="form-label">Your Name</label>
                <input v-model="guestName" class="text-input" type="text" placeholder="Full name" />
              </div>
              <div class="meta-field">
                <label class="form-label">Contact <span class="optional-tag">optional</span></label>
                <input v-model="guestContact" class="text-input" type="text" placeholder="Phone or email" />
              </div>
            </div>
            <p v-if="examMeta.max_attempts > 1 && userID" class="attempts-note">{{ examMeta.attempts_used }} of {{ examMeta.max_attempts }} attempts used</p>
            <p v-if="startError" class="error-text">{{ startError }}</p>
            <button class="iso-btn iso-btn--fill iso-btn--full start-btn" @click="startExam">Start Exam →</button>
          </template>
        </template>
      </div>
    </div>

    <!-- ══ EXAM PHASE ══════════════════════════════════════════ -->
    <div v-else-if="phase === 'exam'" class="exam-phase">
      <div class="exam-topbar">
        <span class="topbar-title">{{ examMeta.title }}</span>
        <span class="topbar-progress-text">{{ answeredCount }} / {{ questions.length }} answered</span>
        <div class="topbar-progress-track"><div class="topbar-progress-fill" :style="{ width: (answeredCount / questions.length * 100) + '%' }" /></div>
        <span class="topbar-timer" :class="timerClass">{{ formatTime(timeLeft) }}</span>
        <button class="iso-btn iso-btn--ghost submit-topbar-btn" @click="confirmSubmit">Submit</button>
      </div>

      <div class="q-palette-wrap">
        <button v-for="(q, i) in questions" :key="q.id" class="palette-dot"
          :class="{ answered: answers[q.id] !== undefined, flagged: flagged.has(q.id), current: currentIdx === i }"
          @click="scrollToQuestion(q.id)">{{ i + 1 }}</button>
        <span v-if="writtenQuestions.length" class="palette-divider">|</span>
        <button v-for="(w, i) in writtenQuestions" :key="w.id" class="palette-dot written-dot"
          :class="{ answered: !!writtenAnswers[w.id]?.text?.trim() }"
          @click="scrollToQuestion(w.id)">W{{ i + 1 }}</button>
      </div>

      <div class="q-scroll-list">
        <div v-for="(q, i) in questions" :id="'q-' + q.id" :key="q.id" class="q-take-card"
          :class="{ 'card-answered': answers[q.id] !== undefined, 'card-flagged': flagged.has(q.id) }">
          <div class="q-take-head">
            <span class="q-take-idx">Q{{ i + 1 }} <span class="q-take-marks">· {{ q.marks }} mark{{ q.marks == 1 ? '' : 's' }}</span></span>
            <button class="flag-btn" :class="{ on: flagged.has(q.id) }" @click="toggleFlag(q.id)">{{ flagged.has(q.id) ? '🚩 Flagged' : 'Flag' }}</button>
          </div>
          <div v-if="q.stimulus" class="q-stimulus">{{ textOf(q.stimulus) }}</div>
          <img v-if="q.stimulus_image" :src="q.stimulus_image" class="q-take-image" alt="" />
          <p class="q-take-text">{{ textOf(q.question) }}</p>
          <img v-if="q.question_image" :src="q.question_image" class="q-take-image" alt="" />

          <div class="q-take-options">
            <button v-for="(opt, oi) in optionsOf(q)" :key="oi" class="take-opt-row" :class="{ selected: answers[q.id] === oi }" @click="answers[q.id] = oi">
              <span class="opt-letter">{{ ['A','B','C','D'][oi] }}</span>
              <span class="opt-text">{{ opt }}</span>
            </button>
          </div>
          <button v-if="answers[q.id] !== undefined" class="clear-sel-btn" @click="delete answers[q.id]">Clear Selection</button>
        </div>

        <template v-if="writtenQuestions.length">
          <div class="written-divider">
            <span class="csec-label">Written Section</span>
            <span class="csec-hint">Type your answer, and optionally attach a photo of handwritten work.</span>
          </div>

          <div v-for="(w, i) in writtenQuestions" :id="'q-' + w.id" :key="w.id" class="q-take-card written-take-card">
            <div class="q-take-head">
              <span class="q-take-idx">W{{ i + 1 }} <span class="q-take-marks">· {{ w.marks }} marks</span></span>
            </div>
            <p class="q-take-text">{{ w.question_text }}</p>
            <img v-if="w.question_image_url" :src="w.question_image_url" class="q-take-image" alt="" />

            <textarea v-model="writtenDraft(w.id).text" class="text-input written-answer-textarea" rows="5" placeholder="Type your answer here…" />

            <div class="image-upload-zone" :class="{ 'has-image': writtenDraft(w.id).image_url }">
              <img v-if="writtenDraft(w.id).image_url" :src="writtenDraft(w.id).image_url" alt="" class="upload-preview" />
              <div v-else class="upload-placeholder">
                <span v-if="writtenUploading[w.id]">Uploading…</span>
                <span v-else>Optional: attach a photo of your written work</span>
              </div>
              <input type="file" accept="image/*" class="upload-input" @change="onWrittenImage($event, w.id)" />
              <button v-if="writtenDraft(w.id).image_url" class="cart-remove-btn upload-remove-btn" @click.stop="writtenDraft(w.id).image_url = null">×</button>
            </div>
          </div>
        </template>

        <div class="submit-bar">
          <p>{{ answeredCount }} of {{ questions.length }} MCQs answered{{ flagged.size ? ` · ${flagged.size} flagged for review` : '' }}</p>
          <p v-if="submitError" class="error-text">{{ submitError }}</p>
          <button class="iso-btn iso-btn--fill iso-btn--full" :disabled="submitting" @click="confirmSubmit">{{ submitting ? 'Submitting…' : 'Submit Exam' }}</button>
        </div>
      </div>
    </div>

    <!-- ══ PENDING PHASE (results not shown immediately) ═════════ -->
    <div v-else-if="phase === 'pending'" class="gate-wrap">
      <div class="gate-card pending-card">
        <span class="gate-tag success">Submitted</span>
        <h2 class="gate-title">You're all done.</h2>
        <p class="gate-desc">Your answers have been recorded. Your teacher will share your results once everything's been graded.</p>
      </div>
    </div>

    <!-- ══ RESULTS PHASE ═══════════════════════════════════════ -->
    <div v-else-if="phase === 'results' && result" class="results-phase">
      <div class="score-hero">
        <span class="score-pct" :class="scoreClass">{{ scorePercent }}%</span>
        <span class="score-grade">{{ gradeLetter(scorePercent) }}</span>
        <p class="score-sub">{{ result.mcq_marks_earned }} / {{ result.total_mcq_marks_possible }} MCQ marks</p>
      </div>

      <div class="result-stats-row">
        <div class="result-stat"><span class="rs-val correct">{{ result.mcq_correct_count }}</span><span class="rs-label">Correct</span></div>
        <div class="result-stat"><span class="rs-val wrong">{{ result.mcq_wrong_count }}</span><span class="rs-label">Wrong</span></div>
        <div class="result-stat"><span class="rs-val skipped">{{ result.mcq_skipped_count }}</span><span class="rs-label">Skipped</span></div>
      </div>

      <div v-if="result.has_written_section" class="written-pending-panel">
        Written section worth <strong>{{ result.total_written_marks }} marks</strong> is pending grading by your teacher — it isn't included in the score above yet.
      </div>

      <div class="review-list">
        <div v-for="r in result.review" :key="r.id" class="q-take-card review-card">
          <p class="q-take-text">{{ textOf(r.question) }}</p>
          <div class="q-take-options">
            <div v-for="(opt, oi) in optionsOf(r)" :key="oi" class="take-opt-row review-opt"
              :class="{ 'rc-correct': oi === r.correct_index, 'rc-wrong': oi === r.selected && r.outcome === 'wrong' }">
              <span class="opt-letter">{{ ['A','B','C','D'][oi] }}</span>
              <span class="opt-text">{{ opt }}</span>
              <span v-if="oi === r.correct_index" class="opt-correct-tag">✓ Correct</span>
              <span v-else-if="oi === r.selected" class="opt-wrong-tag">✗ Your answer</span>
            </div>
          </div>
          <p v-if="r.outcome === 'skipped'" class="skipped-note">— Skipped</p>
          <div v-if="r.explanation && textOf(r.explanation)" class="explanation-block">
            <span class="explanation-label">EXPLANATION</span>
            <p>{{ textOf(r.explanation) }}</p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'auth' })

const route = useRoute()
const token = route.params.token as string
const supabase = useSupabaseClient()
const userID = useSupabaseUser()

const phase = ref<'gate' | 'exam' | 'pending' | 'results'>('gate')
const loading = ref(true)
const loadError = ref('')

const examMeta = ref<any>(null)
const unlocked = ref(false)
const wrongCode = ref(false)
const attemptsExhausted = ref(false)
const accessCodeInput = ref('')
const unlocking = ref(false)
const guestName = ref('')
const guestContact = ref('')
const startError = ref('')

const questions = ref<any[]>([])
const writtenQuestions = ref<any[]>([])

async function fetchGate(code?: string) {
  loading.value = true
  loadError.value = ''
  try {
    const res = await $fetch<any>(`/api/exam/${token}`, { query: code ? { code } : {} })
    examMeta.value = res.exam
    wrongCode.value = !!res.wrong_code
    attemptsExhausted.value = !!res.attempts_exhausted
    if (res.unlocked) {
      unlocked.value = true
      questions.value = res.questions
      writtenQuestions.value = res.written_questions ?? []
    }
  } catch (e: any) {
    console.log(e)
    loadError.value = e?.data?.message || 'Could not load this exam.'
  } finally {
    loading.value = false
    unlocking.value = false
  }
}
fetchGate()

function submitCode() {
  if (!accessCodeInput.value.trim()) return
  unlocking.value = true
  fetchGate(accessCodeInput.value.trim())
}

function textOf(v: any) { return typeof v === 'object' && v !== null ? (v.english ?? Object.values(v)[0]) : v }
function optionsOf(q: any) { return Array.isArray(q.options) ? q.options : (q.options?.english ?? Object.values(q.options ?? {})) }
function formatDateTime(v: string) { return v ? new Date(v).toLocaleString() : '' }

// ── Start exam ─────────────────────────────────────────────────
const answers = reactive<Record<string, number>>({})
const flagged = ref<Set<string>>(new Set())
const writtenAnswers = reactive<Record<string, { text: string; image_url: string | null }>>({})
const writtenUploading = reactive<Record<string, boolean>>({})

function writtenDraft(id: string) {
  if (!writtenAnswers[id]) writtenAnswers[id] = { text: '', image_url: null }
  return writtenAnswers[id]
}

const timeLeft = ref(0)
let timerHandle: ReturnType<typeof setInterval> | null = null

function startExam() {
  if (!userID.value && !guestName.value.trim()) {
    startError.value = 'Please enter your name to start.'
    return
  }
  startError.value = ''
  timeLeft.value = examMeta.value.duration_mins * 60
  phase.value = 'exam'
  nextTick(() => {
    setupObserver()
    timerHandle = setInterval(() => {
      timeLeft.value--
      if (timeLeft.value <= 0) { clearInterval(timerHandle!); submitExam() }
    }, 1000)
  })
}

function toggleFlag(id: string) { flagged.value.has(id) ? flagged.value.delete(id) : flagged.value.add(id) }

const answeredCount = computed(() => Object.keys(answers).length)
const timerClass = computed(() => timeLeft.value < 30 ? 'critical' : timeLeft.value < 120 ? 'warning' : '')
function formatTime(s: number) {
  const m = Math.max(0, Math.floor(s / 60)).toString().padStart(2, '0')
  const sec = Math.max(0, s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

// ── Palette / scroll tracking ──────────────────────────────────
const currentIdx = ref(0)
let observer: IntersectionObserver | null = null
function setupObserver() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = questions.value.findIndex(q => 'q-' + q.id === entry.target.id)
        if (idx !== -1) currentIdx.value = idx
      }
    })
  }, { threshold: 0.4 })
  document.querySelectorAll('.q-take-card').forEach(el => observer!.observe(el))
}
function scrollToQuestion(id: string) {
  document.getElementById('q-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// ── Written image upload (student side) ────────────────────────
async function onWrittenImage(e: Event, teqwId: string) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  writtenUploading[teqwId] = true
  try {
    const path = `${token}/${teqwId}_${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('exam-submissions').upload(path, file)
    if (error) throw error
    const { data } = supabase.storage.from('exam-submissions').getPublicUrl(path)
    writtenDraft(teqwId).image_url = data.publicUrl
  } catch {
    // soft-fail — image is optional, just leave it unattached
  } finally {
    writtenUploading[teqwId] = false
  }
}

// ── Submit ──────────────────────────────────────────────────────
const submitting = ref(false)
const submitError = ref('')
const result = ref<any>(null)

function confirmSubmit() {
  if (!confirm('Submit your exam? You won\'t be able to change your answers after this.')) return
  submitExam()
}

async function submitExam() {
  if (timerHandle) clearInterval(timerHandle)
  if (observer) observer.disconnect()
  submitting.value = true
  submitError.value = ''
  try {
    const res = await $fetch<any>(`/api/exam/${token}/submit`, {
      method: 'POST',
      body: {
        mcq_answers: { ...answers },
        written_answers: { ...writtenAnswers },
        guest_name: guestName.value || undefined,
        guest_contact: guestContact.value || undefined,
      },
    })
    result.value = res
    phase.value = res.show_result_immediately ? 'results' : 'pending'
  } catch (e: any) {
    submitError.value = e?.data?.message || 'Submission failed. Please try again.'
    phase.value = 'exam'
  } finally {
    submitting.value = false
  }
}

const scorePercent = computed(() => {
  if (!result.value || !result.value.total_mcq_marks_possible) return 0
  return Math.max(0, Math.round((result.value.mcq_marks_earned / result.value.total_mcq_marks_possible) * 100))
})
const scoreClass = computed(() => scorePercent.value >= 70 ? 'high' : scorePercent.value >= 45 ? 'mid' : 'low')
function gradeLetter(pct: number) {
  if (pct >= 90) return 'A+'; if (pct >= 80) return 'A'; if (pct >= 70) return 'A-'
  if (pct >= 60) return 'B'; if (pct >= 50) return 'C'; if (pct >= 40) return 'D'
  return 'F'
}

onBeforeUnmount(() => { if (timerHandle) clearInterval(timerHandle); if (observer) observer.disconnect() })
</script>

<style scoped>
.exam-take-page { min-height: 100vh; padding: 2rem 1.5rem; max-width: 760px; margin: 0 auto; }

.gate-wrap { display: flex; justify-content: center; padding-top: 3rem; }
.gate-card { border: 1px solid var(--border-bright); padding: 2.5rem; max-width: 540px; width: 100%; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); display: flex; flex-direction: column; gap: 12px; }
.loading-text { color: var(--gray); font-size: 0.85rem; text-align: center; }
.page-chip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray); border: 1px solid var(--border); padding: 5px 10px; width: fit-content; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); }
.gate-tag { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; padding: 4px 9px; width: fit-content; border: 1px solid var(--border); color: var(--gray); }
.gate-tag.error { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); }
.gate-tag.success { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); }
.gate-title { font-family: var(--font-mono); font-size: 1.4rem; color: var(--white); margin: 4px 0 0; }
.gate-desc { color: var(--gray); font-size: 0.85rem; line-height: 1.6; }
.gate-teacher { color: var(--dim); font-size: 0.76rem; }
.gate-message { color: var(--gray); font-size: 0.88rem; line-height: 1.6; }

.gate-meta-row { display: flex; gap: 1px; background: var(--border); margin: 10px 0; }
.gate-meta-item { flex: 1; background: var(--black); padding: 14px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.gmi-val { font-family: var(--font-mono); font-size: 1.2rem; color: var(--white); }
.gmi-label { font-size: 0.62rem; color: var(--dim); text-transform: uppercase; letter-spacing: 0.1em; }

.gate-status-msg { border-left: 2px solid var(--border-bright); padding-left: 12px; color: var(--gray); font-size: 0.84rem; line-height: 1.6; }
.code-gate { display: flex; flex-direction: column; gap: 10px; }
.form-label { font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray); }
.optional-tag { color: var(--dim); text-transform: none; letter-spacing: 0; font-style: italic; }
.code-gate-row { display: flex; gap: 10px; }
.text-input { background: #0d0d0d; border: 1px solid var(--border); color: var(--white); font-family: var(--font-sans); font-size: 0.85rem; padding: 10px 12px; width: 100%; }
.text-input:focus { outline: none; border-color: var(--border-bright); }
.code-input { font-family: var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; }
.error-text { color: rgba(255,100,100,0.9); font-size: 0.8rem; }
.guest-fields { display: flex; flex-direction: column; gap: 12px; }
.meta-field { display: flex; flex-direction: column; gap: 6px; }
.attempts-note { font-size: 0.76rem; color: var(--dim); }
.start-btn { margin-top: 6px; }
.pending-card { align-items: flex-start; }

/* ── Exam phase ─────────────────────────────────────────── */
.exam-take-page:has(.exam-phase) { max-width: 720px; }
.exam-topbar { position: sticky; top: 0; z-index: 50; background: var(--black); border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 14px; padding: 12px 4px; flex-wrap: wrap; }
.topbar-title { font-family: var(--font-mono); font-size: 0.78rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
.topbar-progress-text { font-size: 0.72rem; color: var(--gray); white-space: nowrap; }
.topbar-progress-track { flex: 1; min-width: 60px; height: 4px; background: var(--border); }
.topbar-progress-fill { height: 100%; background: var(--white); }
.topbar-timer { font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); }
.topbar-timer.warning { color: rgba(255,200,80,0.9); }
.topbar-timer.critical { color: rgba(255,100,100,0.9); animation: blink 1s step-start infinite; }
@keyframes blink { 50% { opacity: 0.4; } }
.submit-topbar-btn { font-size: 0.66rem !important; padding: 8px 14px !important; }

.q-palette-wrap { position: sticky; top: 47px; z-index: 40; background: var(--black); border-bottom: 1px solid var(--border); display: flex; gap: 6px; padding: 10px 4px; overflow-x: auto; }
.palette-dot { font-family: var(--font-mono); font-size: 0.62rem; width: 24px; height: 24px; flex-shrink: 0; border: 1px solid var(--border); background: transparent; color: var(--dim); cursor: pointer; }
.palette-dot.answered { background: rgba(240,240,234,0.12); color: var(--white); }
.palette-dot.flagged { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); }
.palette-dot.current { border-color: var(--white); color: var(--white); }
.palette-divider { color: var(--border); margin: 0 4px; }
.written-dot { width: 30px; }

.q-scroll-list { display: flex; flex-direction: column; gap: 14px; padding-top: 16px; }
.q-take-card { border: 1px solid var(--border); border-left: 3px solid transparent; padding: 1.2rem; scroll-margin-top: 100px; }
.q-take-card.card-answered { border-left-color: rgba(120,230,120,0.5); }
.q-take-card.card-flagged { border-left-color: rgba(255,200,80,0.6); }
.q-take-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.q-take-idx { font-family: var(--font-mono); font-size: 0.74rem; color: var(--white); }
.q-take-marks { color: var(--dim); }
.flag-btn { background: none; border: 1px solid var(--border); color: var(--gray); font-size: 0.68rem; padding: 5px 10px; cursor: pointer; }
.flag-btn.on { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); }
.q-stimulus { font-size: 0.8rem; color: var(--dim); border-left: 2px solid var(--border); padding-left: 10px; margin-bottom: 10px; font-style: italic; }
.q-take-text { font-size: 0.92rem; color: var(--white); line-height: 1.6; margin: 0 0 12px; }
.q-take-image { max-width: 100%; border: 1px solid var(--border); margin-bottom: 12px; }

.q-take-options { display: flex; flex-direction: column; gap: 8px; }
.take-opt-row { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); padding: 10px 12px; background: transparent; color: var(--gray); font-size: 0.85rem; text-align: left; cursor: pointer; width: 100%; }
.take-opt-row.selected { border-color: var(--border-bright); background: rgba(240,240,234,0.06); color: var(--white); }
.opt-letter { font-family: var(--font-mono); width: 22px; height: 22px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; }
.clear-sel-btn { background: none; border: none; color: var(--dim); text-decoration: underline; font-size: 0.72rem; margin-top: 8px; cursor: pointer; }

.written-divider { display: flex; justify-content: space-between; align-items: baseline; padding: 1.2rem 0 0.4rem; flex-wrap: wrap; gap: 6px; }
.csec-label { font-family: var(--font-mono); font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
.csec-hint { font-size: 0.72rem; color: var(--dim); }
.written-answer-textarea { resize: vertical; margin-bottom: 12px; }
.image-upload-zone { position: relative; border: 1px dashed var(--border); min-height: 80px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.image-upload-zone.has-image { border-style: solid; border-color: var(--border-bright); }
.upload-placeholder { font-size: 0.74rem; color: var(--dim); }
.upload-preview { max-height: 150px; max-width: 100%; object-fit: contain; }
.upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.upload-remove-btn { position: absolute; top: 6px; right: 6px; background: var(--black); border: 1px solid var(--border); width: 22px; height: 22px; font-size: 1rem; }
.cart-remove-btn { background: none; border: none; color: var(--gray); cursor: pointer; }

.submit-bar { border-top: 1px solid var(--border); padding-top: 1.2rem; margin-top: 0.6rem; display: flex; flex-direction: column; gap: 10px; }
.submit-bar p { font-size: 0.78rem; color: var(--gray); margin: 0; }

/* ── Results phase ──────────────────────────────────────── */
.results-phase { display: flex; flex-direction: column; gap: 1.5rem; padding-top: 1rem; }
.score-hero { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 2rem 0; border: 1px solid var(--border); }
.score-pct { font-family: var(--font-mono); font-size: 3rem; color: var(--white); }
.score-pct.high { color: rgba(120,230,120,0.9); }
.score-pct.mid { color: rgba(255,200,80,0.9); }
.score-pct.low { color: rgba(255,100,100,0.85); }
.score-grade { font-family: var(--font-mono); font-size: 1rem; color: var(--gray); }
.score-sub { color: var(--dim); font-size: 0.8rem; margin: 4px 0 0; }

.result-stats-row { display: flex; gap: 1px; background: var(--border); }
.result-stat { flex: 1; background: var(--black); padding: 16px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.rs-val { font-family: var(--font-mono); font-size: 1.3rem; }
.rs-val.correct { color: rgba(120,230,120,0.9); }
.rs-val.wrong { color: rgba(255,100,100,0.85); }
.rs-val.skipped { color: var(--gray); }
.rs-label { font-size: 0.62rem; color: var(--dim); text-transform: uppercase; letter-spacing: 0.1em; }

.written-pending-panel { border: 1px solid var(--border); border-left: 2px solid rgba(255,200,80,0.6); padding: 14px 16px; font-size: 0.82rem; color: var(--gray); line-height: 1.6; }
.written-pending-panel strong { color: var(--white); }

.review-list { display: flex; flex-direction: column; gap: 14px; }
.review-card { border-left: 3px solid var(--border); }
.review-opt.rc-correct { border-color: rgba(120,230,120,0.5); background: rgba(120,230,120,0.06); color: var(--white); }
.review-opt.rc-wrong { border-color: rgba(255,100,100,0.5); background: rgba(255,100,100,0.06); color: var(--white); }
.opt-correct-tag { margin-left: auto; font-size: 0.64rem; color: rgba(120,230,120,0.9); font-family: var(--font-mono); }
.opt-wrong-tag { margin-left: auto; font-size: 0.64rem; color: rgba(255,100,100,0.85); font-family: var(--font-mono); }
.skipped-note { color: var(--dim); font-size: 0.78rem; font-style: italic; margin: 6px 0 0; }
.explanation-block { border-left: 2px solid var(--border-bright); padding-left: 12px; margin-top: 10px; }
.explanation-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); }
.explanation-block p { font-size: 0.8rem; color: var(--gray); margin: 4px 0 0; line-height: 1.6; }
</style>
