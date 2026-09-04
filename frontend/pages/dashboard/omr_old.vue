<script setup>
/**
 * pages/dashboard/omr.vue
 * -------------------------------------------------------------
 * Two-mode OMR workflow, both legs talk to the FastAPI backend:
 *   1. GENERATE — POST a sheet spec (exam, stream, question count,
 *      set, roll range) to the backend, which renders the actual
 *      OMR PDF (fiducial corner markers + QR + bubble grid, so its
 *      own OpenCV pipeline can read what it drew) and streams the
 *      PDF bytes back for download. The panel on the right is just
 *      a lightweight visual preview, not the real PDF renderer.
 *   2. SCAN     — upload a photo of a filled sheet, POST it to the
 *      backend, and render the graded result.
 * -------------------------------------------------------------
 */
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const config = useRuntimeConfig()
const supabase = useSupabaseClient()

/* ----------------------------- tabs ----------------------------- */
const activeTab = ref('generate') // 'generate' | 'scan'

/* ========================================================================
   1. GENERATE TAB
   ======================================================================== */
const sourceMode = ref('preset') // 'preset' | 'custom'

const streams = ['hsc', 'ssc', 'engineering', 'medical', 'varsity']
const streamLabels = { hsc: 'HSC', ssc: 'SSC', engineering: 'Engineering', medical: 'Medical', varsity: 'Varsity' }

const selectedStream = ref('hsc')
const presetExams = ref([])
const presetLoading = ref(false)
const selectedPresetId = ref(null)

const customSubject = ref('Physics')
const customQuestionCount = ref(30)
const customDuration = ref(30)
const customNegative = ref(0.25)

const questionCountPills = [20, 30, 50, 100]
const durationPills = [20, 30, 45, 60, 90]
const negativePills = [0, 0.25, 0.5]

const examSet = ref('A') // A / B / C — printed variants for anti-copying
const examSets = ['A', 'B', 'C']

const rollFrom = ref('100001')
const rollTo = ref('100001')
const copiesCount = computed(() => {
  const a = parseInt(rollFrom.value, 10)
  const b = parseInt(rollTo.value, 10)
  if (Number.isNaN(a) || Number.isNaN(b) || b < a) return 0
  return Math.min(b - a + 1, 500)
})

const selectedPreset = computed(() =>
  presetExams.value.find(p => p.id === selectedPresetId.value) || null
)

const effectiveQuestionCount = computed(() =>
  sourceMode.value === 'preset'
    ? (selectedPreset.value?.question_count ?? 30)
    : customQuestionCount.value
)

async function loadPresets() {
  presetLoading.value = true
  const { data, error } = await supabase
    .from('preset_exams')
    .select('id, title, subject, stream, question_count, duration_mins, negative_marking')
    .eq('status', 'published')
    .eq('stream', selectedStream.value)
    .order('attendees', { ascending: false })
    .limit(30)

  presetExams.value = error ? [] : (data || [])
  if (presetExams.value.length && !presetExams.value.find(p => p.id === selectedPresetId.value)) {
    selectedPresetId.value = presetExams.value[0].id
  }
  presetLoading.value = false
}

watch(selectedStream, loadPresets, { immediate: true })

const generating = ref(false)
const generatedCount = ref(0)
const generateError = ref('')

/** The PDF itself is rendered server-side by FastAPI (it owns the exact
 *  bubble geometry the OpenCV pipeline expects), so this just POSTs the
 *  sheet spec and streams the returned PDF blob down to the browser. */
async function generateOMRPdf() {
  generateError.value = ''
  if (sourceMode.value === 'preset' && !selectedPreset.value) {
    generateError.value = 'Pick a preset exam first.'
    return
  }
  if (copiesCount.value < 1) {
    generateError.value = 'Roll range is invalid.'
    return
  }

  generating.value = true
  generatedCount.value = 0

  const rollStart = parseInt(rollFrom.value, 10)
  const examId = sourceMode.value === 'preset' ? selectedPreset.value.id : null

  const payload = {
    source_mode: sourceMode.value,
    preset_exam_id: examId,
    title: sourceMode.value === 'preset' ? selectedPreset.value.title : `${customSubject.value} Practice Test`,
    subject: sourceMode.value === 'preset' ? selectedPreset.value.subject : customSubject.value,
    stream: selectedStream.value,
    question_count: effectiveQuestionCount.value,
    negative_marking: sourceMode.value === 'preset' ? selectedPreset.value.negative_marking : customNegative.value,
    set: examSet.value,
    roll_from: rollStart,
    roll_to: parseInt(rollTo.value, 10),
  }

  try {
    const base = config.public.omrApiBase || '' // FastAPI backend base URL
    const res = await fetch(`${base}/api/v1/omr/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) throw new Error(`Backend responded ${res.status}`)

    // Backend streams back a single multi-page PDF covering the whole roll range.
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `omr-${examId || 'custom'}-${examSet.value}-${rollStart}.pdf`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    generatedCount.value = copiesCount.value
  } catch (err) {
    generateError.value = 'Could not generate the PDF. Check the backend connection and try again.'
    console.error(err)
  } finally {
    generating.value = false
  }
}

/* ========================================================================
   2. SCAN TAB
   ======================================================================== */
const scanPhase = ref('idle') // idle | preview | uploading | processing | result | error
const uploadedFile = ref(null)
const uploadedPreviewUrl = ref('')
const scanError = ref('')
const scanResult = ref(null)
const resultFilter = ref('all') // all | correct | wrong | flagged

function onFilePicked(e) {
  const file = e.target.files?.[0]
  if (!file) return
  setFile(file)
}

function onDrop(e) {
  e.preventDefault()
  const file = e.dataTransfer?.files?.[0]
  if (file) setFile(file)
}

function setFile(file) {
  if (!file.type.startsWith('image/')) {
    scanError.value = 'Please upload a JPG or PNG photo of the sheet.'
    return
  }
  scanError.value = ''
  uploadedFile.value = file
  uploadedPreviewUrl.value = URL.createObjectURL(file)
  scanPhase.value = 'preview'
}

function resetScan() {
  scanPhase.value = 'idle'
  uploadedFile.value = null
  uploadedPreviewUrl.value = ''
  scanResult.value = null
  scanError.value = ''
}

async function submitScan() {
  if (!uploadedFile.value) return
  scanPhase.value = 'uploading'
  scanError.value = ''

  try {
    const formData = new FormData()
    formData.append('image', uploadedFile.value)

    scanPhase.value = 'processing'

    const base = config.public.omrApiBase || '' // FastAPI backend base URL
    const res = await fetch(`${base}/api/v1/omr/scan`, {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) throw new Error(`Backend responded ${res.status}`)
    const data = await res.json()

    scanResult.value = normalizeResult(data)
    scanPhase.value = 'result'
  } catch (err) {
    console.error(err)
    scanError.value = 'Could not grade this sheet. Check lighting/angle and try again.'
    scanPhase.value = 'error'
  }
}

/** Backend is expected to return something like:
 * {
 *   exam_id, roll_number, set, total, correct, wrong, blank, flagged,
 *   final_score, negative_applied,
 *   answers: [{ q, detected, correct, status }]  // status: correct|wrong|blank|flagged
 * }
 * normalizeResult() gives safe defaults so the UI never breaks on a
 * slightly different payload shape.
 */
function normalizeResult(data) {
  const answers = Array.isArray(data.answers) ? data.answers : []
  return {
    examId: data.exam_id ?? '—',
    roll: data.roll_number ?? '—',
    set: data.set ?? '—',
    total: data.total ?? answers.length,
    correct: data.correct ?? answers.filter(a => a.status === 'correct').length,
    wrong: data.wrong ?? answers.filter(a => a.status === 'wrong').length,
    blank: data.blank ?? answers.filter(a => a.status === 'blank').length,
    flagged: data.flagged ?? answers.filter(a => a.status === 'flagged').length,
    finalScore: data.final_score ?? 0,
    negativeApplied: !!data.negative_applied,
    answers,
  }
}

const filteredAnswers = computed(() => {
  if (!scanResult.value) return []
  if (resultFilter.value === 'all') return scanResult.value.answers
  return scanResult.value.answers.filter(a => a.status === resultFilter.value)
})

function scoreClass(pct) {
  if (pct >= 75) return 'high'
  if (pct >= 45) return 'mid'
  return 'low'
}

const scorePct = computed(() =>
  scanResult.value && scanResult.value.total
    ? Math.round((scanResult.value.correct / scanResult.value.total) * 100)
    : 0
)

const statusLabel = { correct: 'Correct', wrong: 'Wrong', blank: 'Blank', flagged: 'Flagged' }
</script>

<template>
  <div class="omr-page">
    <div class="page-head">
      <span class="page-chip"><span class="chip-dot"></span>OMR SYSTEM</span>
      <h1>Answer Sheet <span class="text-outline">Studio</span></h1>
      <p class="sub">Print a machine-readable bubble sheet, or scan a filled one for instant grading.</p>
    </div>

    <div class="omr-tabs">
      <button
        class="omr-tab"
        :class="{ active: activeTab === 'generate' }"
        @click="activeTab = 'generate'"
      >
        <span class="tab-index">01</span>Generate Sheet
      </button>
      <button
        class="omr-tab"
        :class="{ active: activeTab === 'scan' }"
        @click="activeTab = 'scan'"
      >
        <span class="tab-index">02</span>Scan &amp; Submit
      </button>
    </div>

    <!-- ================= GENERATE ================= -->
    <div v-if="activeTab === 'generate'" class="omr-grid">
      <section class="omr-panel form-panel">
        <div class="panel-label">SOURCE</div>
        <div class="pill-row">
          <button
            class="pill"
            :class="{ active: sourceMode === 'preset' }"
            @click="sourceMode = 'preset'"
          >Preset Exam</button>
          <button
            class="pill"
            :class="{ active: sourceMode === 'custom' }"
            @click="sourceMode = 'custom'"
          >Custom Sheet</button>
        </div>

        <template v-if="sourceMode === 'preset'">
          <div class="panel-label">STREAM</div>
          <div class="pill-row wrap">
            <button
              v-for="s in streams"
              :key="s"
              class="pill"
              :class="{ active: selectedStream === s }"
              @click="selectedStream = s"
            >{{ streamLabels[s] }}</button>
          </div>

          <div class="panel-label">EXAM</div>
          <div v-if="presetLoading" class="empty-note">Loading exams…</div>
          <div v-else-if="!presetExams.length" class="empty-note">No published exams for this stream yet.</div>
          <div v-else class="preset-list">
            <button
              v-for="p in presetExams"
              :key="p.id"
              class="preset-row"
              :class="{ active: selectedPresetId === p.id }"
              @click="selectedPresetId = p.id"
            >
              <span class="preset-title">{{ p.title }}</span>
              <span class="preset-meta">{{ p.subject }} · {{ p.question_count }}Q · {{ p.duration_mins }}m</span>
            </button>
          </div>
        </template>

        <template v-else>
          <div class="panel-label">SUBJECT</div>
          <input v-model="customSubject" type="text" class="text-input" placeholder="e.g. Physics" />

          <div class="panel-label">QUESTIONS</div>
          <div class="pill-row">
            <button
              v-for="n in questionCountPills"
              :key="n"
              class="pill"
              :class="{ active: customQuestionCount === n }"
              @click="customQuestionCount = n"
            >{{ n }}</button>
          </div>

          <div class="panel-label">DURATION (MIN)</div>
          <div class="pill-row wrap">
            <button
              v-for="d in durationPills"
              :key="d"
              class="pill"
              :class="{ active: customDuration === d }"
              @click="customDuration = d"
            >{{ d }}</button>
          </div>

          <div class="panel-label">NEGATIVE MARKING</div>
          <div class="pill-row">
            <button
              v-for="n in negativePills"
              :key="n"
              class="pill"
              :class="{ active: customNegative === n }"
              @click="customNegative = n"
            >{{ n === 0 ? 'None' : n }}</button>
          </div>
        </template>

        <div class="panel-label">SET</div>
        <div class="pill-row">
          <button
            v-for="s in examSets"
            :key="s"
            class="pill"
            :class="{ active: examSet === s }"
            @click="examSet = s"
          >Set {{ s }}</button>
        </div>

        <div class="panel-label">ROLL NUMBER RANGE</div>
        <div class="range-row">
          <input v-model="rollFrom" type="text" class="text-input small" placeholder="From" />
          <span class="range-sep">→</span>
          <input v-model="rollTo" type="text" class="text-input small" placeholder="To" />
        </div>
        <p class="hint">{{ copiesCount }} sheet{{ copiesCount === 1 ? '' : 's' }} will be generated, one per roll number.</p>

        <p v-if="generateError" class="error-note">{{ generateError }}</p>

        <button class="iso-btn iso-btn--fill iso-btn--full gen-btn" :disabled="generating" @click="generateOMRPdf">
          <span v-if="!generating">Generate PDF →</span>
          <span v-else>Generating {{ copiesCount }} sheet{{ copiesCount === 1 ? '' : 's' }}…</span>
        </button>
      </section>

      <section class="omr-panel preview-panel">
        <div class="panel-label">PREVIEW</div>
        <p class="hint" style="margin-top: -4px; margin-bottom: 14px;">
          Layout mock only — the actual PDF (with fiducial markers and QR code) is rendered by the backend.
        </p>
        <div class="sheet-preview">
          <div class="sheet-corner tl"></div>
          <div class="sheet-corner tr"></div>
          <div class="sheet-corner bl"></div>
          <div class="sheet-corner br"></div>

          <div class="sheet-header">
            <div>
              <div class="sheet-brand">CORTEX404</div>
              <div class="sheet-sub">{{ streamLabels[selectedStream] || '—' }} · SET {{ examSet }} · OMR SHEET</div>
            </div>
            <div class="sheet-qr"></div>
          </div>

          <div class="sheet-roll">
            <div class="panel-label small">ROLL NUMBER</div>
            <div class="roll-grid">
              <div v-for="i in 6" :key="i" class="roll-col">
                <div class="roll-digit-box"></div>
                <div v-for="r in 4" :key="r" class="roll-bubble"></div>
              </div>
            </div>
          </div>

          <div class="sheet-questions">
            <div v-for="q in Math.min(effectiveQuestionCount, 12)" :key="q" class="sheet-q-row">
              <span class="sheet-q-num">{{ String(q).padStart(2, '0') }}</span>
              <span v-for="opt in ['A','B','C','D']" :key="opt" class="sheet-opt">{{ opt }}</span>
            </div>
            <div v-if="effectiveQuestionCount > 12" class="sheet-more">+ {{ effectiveQuestionCount - 12 }} more questions</div>
          </div>
        </div>
      </section>
    </div>

    <!-- ================= SCAN ================= -->
    <div v-else class="omr-grid scan-grid">
      <section class="omr-panel">
        <div class="panel-label">UPLOAD SHEET</div>

        <div
          v-if="scanPhase === 'idle'"
          class="dropzone"
          @dragover.prevent
          @drop="onDrop"
          @click="$refs.fileInput.click()"
        >
          <div class="dz-icon">⤓</div>
          <p class="dz-text">Drag a photo here, or click to browse</p>
          <p class="dz-hint">JPG or PNG · flat, well-lit, all four corners visible</p>
          <input ref="fileInput" type="file" accept="image/*" class="hidden-input" @change="onFilePicked" />
        </div>

        <div v-else class="scan-preview-wrap">
          <div class="scan-img-frame" :class="{ scanning: scanPhase === 'processing' || scanPhase === 'uploading' }">
            <img :src="uploadedPreviewUrl" alt="Uploaded sheet" class="scan-img" />
            <div v-if="scanPhase === 'processing' || scanPhase === 'uploading'" class="scan-line"></div>
          </div>

          <div class="scan-status">
            <span v-if="scanPhase === 'preview'" class="status-text">Ready to submit.</span>
            <span v-else-if="scanPhase === 'uploading'" class="status-text">Uploading…</span>
            <span v-else-if="scanPhase === 'processing'" class="status-text">Detecting bubbles…</span>
            <span v-else-if="scanPhase === 'result'" class="status-text ok">Graded.</span>
            <span v-else-if="scanPhase === 'error'" class="status-text err">Failed.</span>
          </div>

          <p v-if="scanError" class="error-note">{{ scanError }}</p>

          <div class="scan-actions">
            <button
              v-if="scanPhase === 'preview' || scanPhase === 'error'"
              class="iso-btn iso-btn--fill"
              @click="submitScan"
            >Submit for Grading →</button>
            <button
              v-if="scanPhase !== 'uploading' && scanPhase !== 'processing'"
              class="iso-btn iso-btn--ghost"
              @click="resetScan"
            >Choose Another</button>
          </div>
        </div>
      </section>

      <section class="omr-panel">
        <div class="panel-label">RESULT</div>

        <div v-if="scanPhase !== 'result'" class="empty-note">
          Submit a scanned sheet to see the graded result here.
        </div>

        <template v-else>
          <div class="score-hero">
            <div class="score-num" :class="scoreClass(scorePct)">{{ scorePct }}%</div>
            <div class="score-meta">
              <div class="score-meta-row"><span>EXAM ID</span><span>{{ scanResult.examId }}</span></div>
              <div class="score-meta-row"><span>ROLL</span><span>{{ scanResult.roll }}</span></div>
              <div class="score-meta-row"><span>SET</span><span>{{ scanResult.set }}</span></div>
              <div class="score-meta-row"><span>FINAL SCORE</span><span>{{ scanResult.finalScore }}</span></div>
            </div>
          </div>

          <div class="stat-grid">
            <div class="stat-card"><span class="stat-num">{{ scanResult.correct }}</span><span class="stat-label">Correct</span></div>
            <div class="stat-card"><span class="stat-num">{{ scanResult.wrong }}</span><span class="stat-label">Wrong</span></div>
            <div class="stat-card"><span class="stat-num">{{ scanResult.blank }}</span><span class="stat-label">Blank</span></div>
            <div class="stat-card"><span class="stat-num">{{ scanResult.flagged }}</span><span class="stat-label">Flagged</span></div>
          </div>

          <div class="pill-row">
            <button class="pill" :class="{ active: resultFilter === 'all' }" @click="resultFilter = 'all'">All</button>
            <button class="pill" :class="{ active: resultFilter === 'correct' }" @click="resultFilter = 'correct'">Correct</button>
            <button class="pill" :class="{ active: resultFilter === 'wrong' }" @click="resultFilter = 'wrong'">Wrong</button>
            <button class="pill" :class="{ active: resultFilter === 'flagged' }" @click="resultFilter = 'flagged'">Flagged</button>
          </div>

          <div class="answer-list">
            <div
              v-for="a in filteredAnswers"
              :key="a.q"
              class="answer-row"
              :class="`row-${a.status}`"
            >
              <span class="ans-q">Q{{ a.q }}</span>
              <span class="ans-detected">Detected: {{ a.detected ?? '—' }}</span>
              <span class="ans-correct">Correct: {{ a.correct ?? '—' }}</span>
              <span class="ans-status">{{ statusLabel[a.status] || a.status }}</span>
            </div>
            <div v-if="!filteredAnswers.length" class="empty-note">Nothing in this filter.</div>
          </div>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.omr-page {
  padding: 32px;
  max-width: 1180px;
  margin: 0 auto;
}

.page-head { margin-bottom: 28px; }
.page-head h1 {
  font-family: var(--font-mono);
  font-size: 2rem;
  margin: 10px 0 6px;
}
.page-head .sub {
  font-family: var(--font-sans);
  color: var(--gray);
  font-size: 0.95rem;
}

.omr-tabs {
  display: flex;
  gap: 1px;
  background: var(--border);
  margin-bottom: 20px;
  border: 1px solid var(--border);
}
.omr-tab {
  flex: 1;
  background: var(--black);
  color: var(--dim);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  padding: 14px 18px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: color 0.15s, background 0.15s;
}
.omr-tab .tab-index {
  font-size: 0.7rem;
  color: var(--border-bright);
}
.omr-tab.active {
  color: var(--white);
  background: rgba(240, 240, 234, 0.03);
  box-shadow: inset 2px 0 0 0 var(--white);
}
.omr-tab:hover { color: var(--white); }

.omr-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--border);
}
.omr-panel {
  background: var(--black);
  padding: 24px;
  box-shadow: 4px 4px 0 0 rgba(240, 240, 234, 0.04);
}

.panel-label {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--dim);
  margin: 18px 0 8px;
}
.panel-label:first-child { margin-top: 0; }
.panel-label.small { margin: 0 0 6px; }

.pill-row { display: flex; gap: 8px; flex-wrap: nowrap; }
.pill-row.wrap { flex-wrap: wrap; }
.pill {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  background: transparent;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 7px 14px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
.pill:hover { border-color: var(--border-bright); color: var(--white); }
.pill.active {
  color: var(--black);
  background: var(--white);
  border-color: var(--white);
}

.text-input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--white);
  font-family: var(--font-sans);
  font-size: 0.9rem;
  padding: 10px 12px;
}
.text-input.small { width: 120px; }
.text-input:focus { outline: none; border-color: var(--border-bright); }

.range-row { display: flex; align-items: center; gap: 10px; }
.range-sep { color: var(--dim); font-family: var(--font-mono); }
.hint { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); margin-top: 8px; }

.preset-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.preset-row {
  background: var(--black);
  border: none;
  border-left: 2px solid transparent;
  text-align: left;
  padding: 12px 14px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.preset-row:hover { border-left-color: var(--border-bright); }
.preset-row.active { border-left-color: var(--white); background: rgba(240, 240, 234, 0.03); }
.preset-title { font-family: var(--font-sans); font-size: 0.88rem; color: var(--white); }
.preset-meta { font-family: var(--font-mono); font-size: 0.68rem; color: var(--dim); letter-spacing: 0.08em; }

.empty-note {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--dim);
  padding: 16px 0;
}
.error-note {
  font-family: var(--font-sans);
  font-size: 0.82rem;
  color: rgba(255, 100, 100, 0.9);
  margin-top: 10px;
}

.gen-btn { margin-top: 22px; }

/* ---- preview sheet mock ---- */
.sheet-preview {
  position: relative;
  background: rgba(240, 240, 234, 0.02);
  border: 1px solid var(--border);
  padding: 20px;
}
.sheet-corner {
  position: absolute;
  width: 10px;
  height: 10px;
  background: var(--white);
}
.sheet-corner.tl { top: 8px; left: 8px; }
.sheet-corner.tr { top: 8px; right: 8px; }
.sheet-corner.bl { bottom: 8px; left: 8px; }
.sheet-corner.br { bottom: 8px; right: 8px; }

.sheet-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.sheet-brand { font-family: var(--font-mono); font-weight: 700; letter-spacing: 0.08em; }
.sheet-sub { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); letter-spacing: 0.1em; margin-top: 2px; }
.sheet-qr {
  width: 44px; height: 44px;
  background: repeating-conic-gradient(var(--white) 0% 25%, transparent 0% 50%) 0 0/8px 8px;
  opacity: 0.7;
}

.sheet-roll { margin-bottom: 18px; }
.roll-grid { display: flex; gap: 6px; }
.roll-col { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.roll-digit-box { width: 16px; height: 16px; border: 1px solid var(--border-bright); margin-bottom: 4px; }
.roll-bubble { width: 9px; height: 9px; border-radius: 50%; border: 1px solid var(--border); }

.sheet-questions { display: flex; flex-direction: column; gap: 8px; }
.sheet-q-row { display: flex; align-items: center; gap: 10px; }
.sheet-q-num { font-family: var(--font-mono); font-size: 0.68rem; color: var(--dim); width: 18px; }
.sheet-opt {
  width: 14px; height: 14px; border-radius: 50%;
  border: 1px solid var(--border);
  font-size: 0; /* bubble only */
}
.sheet-more { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); margin-top: 4px; }

/* ---- scan tab ---- */
.dropzone {
  border: 1px dashed var(--border-bright);
  padding: 48px 20px;
  text-align: center;
  cursor: pointer;
  transition: background 0.15s;
}
.dropzone:hover { background: rgba(240, 240, 234, 0.03); }
.dz-icon { font-size: 1.6rem; color: var(--white); margin-bottom: 8px; }
.dz-text { font-family: var(--font-sans); color: var(--white); font-size: 0.9rem; }
.dz-hint { font-family: var(--font-mono); font-size: 0.68rem; color: var(--dim); margin-top: 6px; letter-spacing: 0.06em; }
.hidden-input { display: none; }

.scan-img-frame {
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);
}
.scan-img { display: block; width: 100%; height: auto; opacity: 0.92; }
.scan-line {
  position: absolute;
  left: 0; right: 0;
  height: 2px;
  background: rgba(120, 230, 120, 0.85);
  box-shadow: 0 0 12px 2px rgba(120, 230, 120, 0.6);
  animation: sweep 1.6s ease-in-out infinite;
}
@keyframes sweep {
  0% { top: 0%; }
  50% { top: 100%; }
  100% { top: 0%; }
}
@media (prefers-reduced-motion: reduce) {
  .scan-line { animation: none; top: 50%; }
}

.scan-status { margin-top: 12px; }
.status-text { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); }
.status-text.ok { color: rgba(120, 230, 120, 0.9); }
.status-text.err { color: rgba(255, 100, 100, 0.9); }

.scan-actions { display: flex; gap: 10px; margin-top: 14px; }

/* ---- result ---- */
.score-hero { display: flex; align-items: center; gap: 22px; margin-bottom: 18px; }
.score-num { font-family: var(--font-mono); font-size: 2.6rem; font-weight: 700; }
.score-num.high { color: rgba(120, 230, 120, 0.95); }
.score-num.mid { color: rgba(255, 200, 80, 0.95); }
.score-num.low { color: rgba(255, 100, 100, 0.95); }
.score-meta { display: flex; flex-direction: column; gap: 4px; }
.score-meta-row {
  display: flex; gap: 10px;
  font-family: var(--font-mono); font-size: 0.68rem;
  letter-spacing: 0.08em; color: var(--dim);
}
.score-meta-row span:last-child { color: var(--white); }

.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); margin-bottom: 18px; }
.stat-card { background: var(--black); padding: 14px; display: flex; flex-direction: column; gap: 4px; }
.stat-num { font-family: var(--font-mono); font-size: 1.3rem; }
.stat-label { font-family: var(--font-mono); font-size: 0.62rem; color: var(--dim); letter-spacing: 0.1em; text-transform: uppercase; }

.answer-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); margin-top: 14px; max-height: 340px; overflow-y: auto; }
.answer-row {
  background: var(--black);
  border-left: 2px solid transparent;
  display: grid;
  grid-template-columns: 40px 1fr 1fr 70px;
  gap: 8px;
  padding: 8px 12px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--gray);
}
.row-correct { border-left-color: rgba(120, 230, 120, 0.7); }
.row-wrong { border-left-color: rgba(255, 100, 100, 0.7); }
.row-flagged { border-left-color: rgba(255, 200, 80, 0.7); }
.row-blank { border-left-color: var(--border); }
.ans-q { color: var(--white); }

@media (max-width: 860px) {
  .omr-grid { grid-template-columns: 1fr; }
  .omr-page { padding: 20px; }
}
</style>
