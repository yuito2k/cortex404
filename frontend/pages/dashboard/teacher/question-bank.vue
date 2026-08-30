<template>
  <div class="teacher-builder">

    <!-- ══ HEADER ══════════════════════════════════════════════ -->
    <div class="setup-header">
      <div class="header-left">
        <div class="page-chip"><span class="chip-dot" /> Teacher Tools</div>
        <h1 class="page-title">Question Bank &<br><span class="text-outline">Exam Builder.</span></h1>
        <p class="page-sub">Browse the full question bank, or switch to Build Mode to assemble a custom exam and share it with your students.</p>
      </div>
      <div class="header-right">
        <div class="mode-toggle">
          <button class="mode-btn" :class="{ active: mode === 'browse' }" @click="mode = 'browse'">Browse</button>
          <button class="mode-btn" :class="{ active: mode === 'build' }" @click="mode = 'build'">
            Build Exam
            <span v-if="cart.length" class="mode-badge">{{ cart.length }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══ SUCCESS PANEL (after create) ═════════════════════════ -->
    <div v-if="createdExam" class="created-panel">
      <span class="created-tag">{{ createdExam.exam.status === 'published' ? 'Published' : 'Saved as Draft' }}</span>
      <h2 class="created-title">{{ createdExam.exam.title }}</h2>
      <p class="created-sub">{{ cart.length }} MCQs{{ examConfig.hasWrittenSection ? ` · ${writtenQuestions.length} written` : '' }} · {{ examMeta.durationMins }} min</p>

      <div class="link-box">
        <span class="link-label">SHARE LINK</span>
        <code class="link-value">{{ fullShareUrl }}</code>
        <button class="iso-btn iso-btn--fill link-copy-btn" @click="copyText(fullShareUrl, 'link')">
          {{ copied === 'link' ? 'Copied ✓' : 'Copy' }}
        </button>
      </div>

      <div v-if="examMeta.accessType === 'private'" class="link-box">
        <span class="link-label">ACCESS CODE</span>
        <code class="link-value">{{ examMeta.accessCode }}</code>
        <button class="iso-btn iso-btn--ghost link-copy-btn" @click="copyText(examMeta.accessCode, 'code')">
          {{ copied === 'code' ? 'Copied ✓' : 'Copy' }}
        </button>
      </div>

      <div class="created-actions">
        <button class="iso-btn iso-btn--ghost" @click="resetBuilder">Create Another Exam</button>
        <NuxtLink class="iso-btn iso-btn--fill" to="/dashboard/teacher/exams">View All My Exams →</NuxtLink>
      </div>
    </div>

    <template v-else>

      <!-- ══ EXAM META (build mode only) ═════════════════════════ -->
      <div v-if="mode === 'build'" class="exam-meta-panel">
        <div class="config-section-header">
          <span class="csec-tag">01</span>
          <span class="csec-label">Exam Details</span>
        </div>
        <div class="meta-grid">
          <div class="meta-field meta-field--wide">
            <label class="form-label">Exam Title</label>
            <input v-model="examMeta.title" class="text-input" type="text" placeholder="e.g. HSC Physics — Chapter 3 Weekly Test" />
          </div>
          <div class="meta-field meta-field--wide">
            <label class="form-label">Description <span class="optional-tag">optional</span></label>
            <input v-model="examMeta.description" class="text-input" type="text" placeholder="Shown to students before they start" />
          </div>

          <div class="meta-field">
            <label class="form-label">Duration (min)</label>
            <input v-model.number="examMeta.durationMins" class="text-input num-input" type="number" min="5" max="240" />
          </div>
          <div class="meta-field">
            <label class="form-label">Max Attempts</label>
            <input v-model.number="examMeta.maxAttempts" class="text-input num-input" type="number" min="1" max="10" />
          </div>
          <div class="meta-field">
            <label class="form-label">Opens</label>
            <input v-model="examMeta.startsAt" class="text-input" type="datetime-local" />
          </div>
          <div class="meta-field">
            <label class="form-label">Closes</label>
            <input v-model="examMeta.endsAt" class="text-input" type="datetime-local" />
          </div>

          <div class="meta-field meta-field--wide">
            <label class="form-label">Link Visibility</label>
            <div class="filter-pills">
              <button class="filter-pill" :class="{ active: examMeta.accessType === 'public' }" @click="examMeta.accessType = 'public'">Public — anyone with the link</button>
              <button class="filter-pill" :class="{ active: examMeta.accessType === 'private' }" @click="setPrivate">Private — needs access code</button>
            </div>
            <div v-if="examMeta.accessType === 'private'" class="access-code-row">
              <input v-model="examMeta.accessCode" class="text-input code-input" type="text" maxlength="8" placeholder="ACCESS CODE" />
              <button class="iso-btn iso-btn--ghost code-regen-btn" @click="examMeta.accessCode = generateAccessCode()">Regenerate</button>
            </div>
          </div>

          <div class="meta-field meta-field--wide">
            <label class="toggle-row">
              <span class="toggle-label">Show result immediately after submission</span>
              <button class="toggle-btn" :class="{ on: examMeta.showResultImmediately }" @click="examMeta.showResultImmediately = !examMeta.showResultImmediately">
                <span class="toggle-knob" />
              </button>
            </label>
          </div>
        </div>
      </div>

      <!-- ══ BUILDER BODY ═════════════════════════════════════════ -->
      <div class="builder-body">

        <!-- LEFT: filters + question list -->
        <div class="question-panel">

          <div class="config-section-header">
            <span class="csec-tag">{{ mode === 'build' ? '02' : '' }}</span>
            <span class="csec-label">Filter Questions</span>
          </div>

          <div class="filter-bar">
            <div class="search-row">
              <input v-model="filters.search" class="text-input search-input" type="text" placeholder="Search question text…" />
              <button v-if="filters.search" class="clear-search-btn" @click="filters.search = ''">×</button>
            </div>

            <span class="form-label">Stream</span>
            <div class="filter-pills">
              <button v-for="s in streams" :key="s" class="filter-pill" :class="{ active: filters.stream === s }"
                @click="filters.stream = s; filters.subject = 'All'; filters.chapter = 'All'">{{ s }}</button>
            </div>

            <template v-if="availableSubjects.length > 1">
              <span class="form-label">Subject</span>
              <div class="filter-pills">
                <button v-for="sub in availableSubjects" :key="sub" class="filter-pill" :class="{ active: filters.subject === sub }"
                  @click="filters.subject = sub; filters.chapter = 'All'">{{ sub }}</button>
              </div>
            </template>

            <template v-if="availableChapters.length > 1">
              <span class="form-label">Chapter</span>
              <div class="filter-pills chapter-pills">
                <button v-for="ch in availableChapters" :key="ch" class="filter-pill" :class="{ active: filters.chapter === ch }"
                  @click="filters.chapter = ch">{{ ch }}</button>
              </div>
            </template>

            <span class="form-label">Difficulty</span>
            <div class="filter-pills">
              <button v-for="d in difficulties" :key="d.val" class="filter-pill diff-pill" :class="[d.cls, { active: filters.difficulty === d.val }]"
                @click="filters.difficulty = d.val">{{ d.label }}</button>
            </div>
          </div>

          <div class="filter-status">
            <span v-if="loading">Loading…</span>
            <span v-else-if="loadError" class="error-text">{{ loadError }}</span>
            <span v-else>{{ totalCount }} question{{ totalCount === 1 ? '' : 's' }} match your filters</span>
            <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearFilters">Clear filters</button>
          </div>

          <!-- Question list -->
          <div class="q-list">
            <div v-if="loading" class="q-list-skeleton">
              <div v-for="n in 4" :key="n" class="q-skeleton-card" />
            </div>

            <div v-else-if="!questions.length" class="empty-state">
              No questions found. Try a different stream, subject, or chapter.
            </div>

            <div v-for="q in questions" :key="q.id" class="q-card" :class="{ expanded: expandedIds.has(q.id), 'q-card--added': isAdded(q) }">
              <div class="q-card-header" @click="toggleExpand(q.id)">
                <div class="q-meta">
                  <span class="diff-badge" :class="diffClass(q.difficulty_level)">{{ q.difficulty_level }}</span>
                  <span class="tag-chip">{{ subjectText(q) }}</span>
                  <span class="tag-chip">{{ chapterText(q) }}</span>
                </div>
                <p class="q-text">{{ questionText(q) }}</p>
                <div class="q-actions">
                  <button v-if="mode === 'build'" class="iso-btn add-toggle-btn" :class="isAdded(q) ? 'iso-btn--fill' : 'iso-btn--ghost'"
                    @click.stop="toggleAdd(q)">{{ isAdded(q) ? '✓ Added' : '+ Add' }}</button>
                  <span class="expand-chevron">{{ expandedIds.has(q.id) ? '−' : '+' }}</span>
                </div>
              </div>

              <div v-if="expandedIds.has(q.id)" class="q-card-body">
                <div v-if="q.question_image" class="q-image-wrap"><img :src="q.question_image" alt="" /></div>
                <div class="q-options">
                  <div v-for="(opt, i) in optionsText(q)" :key="i" class="opt-row" :class="{ 'opt-correct': i === q.correct_index }">
                    <span class="opt-letter">{{ ['A','B','C','D'][i] }}</span>
                    <span class="opt-text">{{ opt }}</span>
                    <span v-if="i === q.correct_index" class="opt-correct-tag">✓ Correct</span>
                  </div>
                </div>
                <div v-if="explanationText(q)" class="explanation-block">
                  <span class="explanation-label">EXPLANATION</span>
                  <p>{{ explanationText(q) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination-row">
            <button class="iso-btn iso-btn--ghost page-btn" :disabled="page <= 1" @click="page--">← Prev</button>
            <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
            <button class="iso-btn iso-btn--ghost page-btn" :disabled="page >= totalPages" @click="page++">Next →</button>
          </div>
        </div>

        <!-- RIGHT: sidebar -->
        <aside class="builder-sidebar">

          <!-- Browse mode: stats -->
          <div v-if="mode === 'browse'" class="info-panel">
            <div class="panel-header"><span class="panel-tag">Bank Overview</span></div>
            <div class="stat-row"><span>Matching filters</span><strong>{{ totalCount }}</strong></div>
            <div class="stat-row"><span>On this page</span><strong>{{ questions.length }}</strong></div>
            <div class="page-diff-breakdown">
              <div v-for="d in pageDifficultyBreakdown" :key="d.label" class="pdb-row">
                <span class="pdb-label" :class="d.cls">{{ d.label }}</span>
                <div class="pdb-bar-track"><div class="pdb-bar-fill" :class="d.cls" :style="{ width: d.percent + '%' }" /></div>
                <span class="pdb-count">{{ d.count }}</span>
              </div>
            </div>
            <p class="panel-hint">Switch to <strong>Build Exam</strong> mode to start adding questions to a custom exam.</p>
          </div>

          <!-- Build mode: cart + config -->
          <template v-else>
            <div class="info-panel cart-panel">
              <div class="panel-header">
                <span class="panel-tag">Your Exam</span>
                <span class="cart-count">{{ cart.length }} question{{ cart.length === 1 ? '' : 's' }} · {{ totalMcqMarks }} marks</span>
              </div>

              <div v-if="!cart.length" class="cart-empty">No questions added yet. Click <strong>+ Add</strong> on any question to the left.</div>
              <div v-else class="cart-list">
                <div v-for="(item, i) in cart" :key="item.question_id + item.source_stream" class="cart-item">
                  <span class="cart-idx">{{ i + 1 }}</span>
                  <span class="cart-text">{{ questionText(item.snapshot) }}</span>
                  <input v-model.number="item.marks" class="cart-marks-input" type="number" min="0.25" step="0.25" />
                  <button class="cart-remove-btn" @click="removeFromCart(item)">×</button>
                </div>
              </div>
            </div>

            <div class="info-panel">
              <div class="panel-header"><span class="panel-tag">Configuration</span></div>

              <label class="toggle-row">
                <span class="toggle-label">Shuffle Questions</span>
                <button class="toggle-btn" :class="{ on: examConfig.shuffle }" @click="examConfig.shuffle = !examConfig.shuffle"><span class="toggle-knob" /></button>
              </label>

              <label class="toggle-row">
                <span class="toggle-label">Negative Marking</span>
                <button class="toggle-btn" :class="{ on: examConfig.negativeMarking }" @click="examConfig.negativeMarking = !examConfig.negativeMarking"><span class="toggle-knob" /></button>
              </label>
              <div v-if="examConfig.negativeMarking" class="nm-value-row">
                <span class="form-label">Deduction per wrong answer</span>
                <input v-model.number="examConfig.negativeMarkValue" class="text-input num-input" type="number" step="0.05" min="0" max="1" />
              </div>

              <label class="toggle-row">
                <span class="toggle-label">Has Written Section</span>
                <button class="toggle-btn" :class="{ on: examConfig.hasWrittenSection }" @click="examConfig.hasWrittenSection = !examConfig.hasWrittenSection"><span class="toggle-knob" /></button>
              </label>
            </div>

            <div class="info-panel">
              <p v-if="validationMessage" class="error-text validation-msg">{{ validationMessage }}</p>
              <button class="iso-btn iso-btn--ghost iso-btn--full" :disabled="creating" @click="createExam('draft')">
                {{ creating === 'draft' ? 'Saving…' : 'Save as Draft' }}
              </button>
              <button class="iso-btn iso-btn--fill iso-btn--full publish-btn" :disabled="creating" @click="createExam('published')">
                {{ creating === 'published' ? 'Publishing…' : 'Publish & Get Link →' }}
              </button>
            </div>
          </template>
        </aside>
      </div>

      <!-- ══ WRITTEN SECTION BUILDER ═══════════════════════════════ -->
      <div v-if="mode === 'build' && examConfig.hasWrittenSection" class="written-section-panel">
        <div class="config-section-header">
          <span class="csec-tag">03</span>
          <span class="csec-label">Written Section</span>
          <span class="csec-hint">{{ writtenQuestions.length }} question{{ writtenQuestions.length === 1 ? '' : 's' }} · {{ totalWrittenMarks }} marks</span>
        </div>

        <div class="written-list">
          <div v-for="(w, i) in writtenQuestions" :key="i" class="written-card">
            <div class="written-card-head">
              <span class="cart-idx">{{ i + 1 }}</span>
              <div class="filter-pills written-type-pills">
                <button v-for="t in writtenTypes" :key="t.val" class="filter-pill" :class="{ active: w.type === t.val }" @click="w.type = t.val">{{ t.label }}</button>
              </div>
              <div class="written-marks-field">
                <label class="form-label">Marks</label>
                <input v-model.number="w.marks" class="text-input num-input" type="number" min="1" max="50" />
              </div>
              <button class="cart-remove-btn written-remove-btn" @click="removeWrittenQuestion(i)">×</button>
            </div>

            <textarea v-model="w.question_text" class="text-input written-textarea" rows="3" placeholder="Write the question text…" />

            <div class="image-upload-zone" :class="{ 'has-image': w.question_image_url }">
              <img v-if="w.question_image_url" :src="w.question_image_url" alt="" class="upload-preview" />
              <div v-else class="upload-placeholder">
                <span v-if="w._uploading">Uploading…</span>
                <span v-else>Optional: attach a diagram or image</span>
              </div>
              <input type="file" accept="image/*" class="upload-input" @change="onImageSelect($event, i)" />
              <button v-if="w.question_image_url" class="cart-remove-btn upload-remove-btn" @click.stop="w.question_image_url = null">×</button>
            </div>
            <p v-if="w._uploadError" class="error-text">{{ w._uploadError }}</p>

            <textarea v-model="w.model_answer" class="text-input written-textarea written-model-answer" rows="2" placeholder="Model answer / grading notes (only you see this)" />
          </div>
        </div>

        <button class="iso-btn iso-btn--ghost add-written-btn" @click="addWrittenQuestion">+ Add Written Question</button>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'teacher'], layout: 'dashboard' })

const supabase = useSupabaseClient()
const userID = useSupabaseUser()

// ── Mode ───────────────────────────────────────────────────
const mode = ref<'browse' | 'build'>('browse')

// ── Streams / subjects / chapters ──────────────────────────
const streams = ['HSC Science', 'HSC Arts', 'HSC Commerce', 'SSC Science', 'SSC Arts', 'SSC Commerce', 'BUET', 'Medical', 'BCS']

const subjectMap: Record<string, string[]> = {
  'HSC Science': ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'English', 'ICT'],
  'HSC Arts': ['All', 'Bangla', 'English', 'History', 'Geography', 'ICT'],
  'HSC Commerce': ['All', 'Accounting', 'Finance', 'Business Studies', 'English', 'ICT'],
  'SSC Science': ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'English', 'ICT'],
  'SSC Arts': ['All', 'Bangla', 'English', 'History', 'Geography', 'ICT'],
  'SSC Commerce': ['All', 'Accounting', 'Finance', 'Business Studies', 'English', 'ICT'],
  BUET: ['All', 'Physics', 'Chemistry', 'Higher Math'],
  Medical: ['All', 'Biology', 'Chemistry', 'Physics'],
  BCS: ['All', 'Bangla', 'English', 'Math', 'Bangladesh Affairs', 'General Knowledge'],
}

const difficulties = [
  { val: 'All', label: 'All', cls: '' },
  { val: 'easy', label: 'Easy', cls: 'easy' },
  { val: 'medium', label: 'Medium', cls: 'medium' },
  { val: 'hard', label: 'Hard', cls: 'hard' },
]

const filters = reactive({ stream: streams[0], subject: 'All', chapter: 'All', difficulty: 'All', search: '' })

const availableSubjects = computed(() => subjectMap[filters.stream] ?? ['All'])
const availableChapters = ref<string[]>([])

watch([() => filters.stream, () => filters.subject], async ([stream, subject]) => {
  availableChapters.value = []
  try {
    const data = await $fetch<string[]>('/api/chapters', { query: { stream, ...(subject !== 'All' && { subject }) } })
    availableChapters.value = data?.length ? ['All', ...data] : []
  } catch {
    availableChapters.value = []
  }
}, { immediate: true })

const hasActiveFilters = computed(() =>
  filters.subject !== 'All' || filters.chapter !== 'All' || filters.difficulty !== 'All' || !!filters.search
)
function clearFilters() {
  filters.subject = 'All'; filters.chapter = 'All'; filters.difficulty = 'All'; filters.search = ''
}

// ── Question list / pagination ───────────────────────────────
const questions = ref<any[]>([])
const totalCount = ref(0)
const totalPages = ref(0)
const page = ref(1)
const pageSize = 15
const loading = ref(false)
const loadError = ref('')
const expandedIds = ref<Set<number>>(new Set())

function toggleExpand(id: number) {
  expandedIds.value.has(id) ? expandedIds.value.delete(id) : expandedIds.value.add(id)
}

async function fetchQuestions() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await $fetch<{ data: any[]; total: number; totalPages: number }>('/api/teacher/questions', {
      query: {
        stream: filters.stream,
        subject: filters.subject !== 'All' ? filters.subject : undefined,
        chapter: filters.chapter !== 'All' ? filters.chapter : undefined,
        difficulty: filters.difficulty !== 'All' ? filters.difficulty : undefined,
        search: filters.search || undefined,
        page: page.value,
        pageSize,
      },
    })
    questions.value = res.data
    totalCount.value = res.total
    totalPages.value = res.totalPages
  } catch (e) {
    loadError.value = 'Failed to load questions. Try again.'
    questions.value = []
  } finally {
    loading.value = false
  }
}

watch([() => filters.stream, () => filters.subject, () => filters.chapter, () => filters.difficulty], () => { page.value = 1; fetchQuestions() })
watch(page, fetchQuestions)

let searchDebounce: ReturnType<typeof setTimeout> | null = null
watch(() => filters.search, () => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => { page.value = 1; fetchQuestions() }, 300)
})

fetchQuestions()

const pageDifficultyBreakdown = computed(() => {
  const counts = { easy: 0, medium: 0, hard: 0 }
  questions.value.forEach(q => { if (q.difficulty_level in counts) counts[q.difficulty_level as keyof typeof counts]++ })
  const max = Math.max(1, questions.value.length)
  return [
    { label: 'Easy', cls: 'easy', count: counts.easy, percent: counts.easy / max * 100 },
    { label: 'Medium', cls: 'medium', count: counts.medium, percent: counts.medium / max * 100 },
    { label: 'Hard', cls: 'hard', count: counts.hard, percent: counts.hard / max * 100 },
  ]
})

// ── Bilingual text helpers ───────────────────────────────────
function questionText(q: any) { return typeof q.question === 'object' ? q.question?.english : q.question }
function subjectText(q: any) { return typeof q.subject === 'object' ? q.subject?.english : q.subject }
function chapterText(q: any) { return typeof q.chapter === 'object' ? q.chapter?.english : q.chapter }
function explanationText(q: any) { return typeof q.explanation === 'object' ? q.explanation?.english : q.explanation }
function optionsText(q: any) { return Array.isArray(q.options) ? q.options : q.options?.english ?? [] }
function diffClass(level: string) { return level }

// ── Exam cart (build mode) ───────────────────────────────────
interface CartItem { question_id: number; source_stream: string; marks: number; snapshot: any }
const cart = ref<CartItem[]>([])

function cartKey(stream: string, id: number) { return `${stream}__${id}` }
function isAdded(q: any) { return cart.value.some(c => c.question_id === q.id && c.source_stream === q.exam) }

function toggleAdd(q: any) {
  if (isAdded(q)) {
    cart.value = cart.value.filter(c => !(c.question_id === q.id && c.source_stream === q.exam))
  } else {
    cart.value.push({ question_id: q.id, source_stream: q.exam, marks: 1, snapshot: q })
  }
}
function removeFromCart(item: CartItem) {
  cart.value = cart.value.filter(c => c !== item)
}
const totalMcqMarks = computed(() => cart.value.reduce((sum, c) => sum + (c.marks || 0), 0))

// ── Exam meta + config ────────────────────────────────────────
function generateAccessCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

const examMeta = reactive({
  title: '',
  description: '',
  accessType: 'private' as 'public' | 'private',
  accessCode: generateAccessCode(),
  startsAt: '',
  endsAt: '',
  durationMins: 30,
  maxAttempts: 1,
  showResultImmediately: true,
})
function setPrivate() {
  examMeta.accessType = 'private'
  if (!examMeta.accessCode) examMeta.accessCode = generateAccessCode()
}

const examConfig = reactive({
  shuffle: true,
  negativeMarking: false,
  negativeMarkValue: 0.25,
  hasWrittenSection: false,
})

// ── Written section ────────────────────────────────────────
interface WrittenItem {
  type: 'saq' | 'creative' | 'long'
  marks: number
  question_text: string
  question_image_url: string | null
  model_answer: string
  _uploading?: boolean
  _uploadError?: string
}
const writtenTypes = [
  { val: 'saq', label: 'Short Answer' },
  { val: 'creative', label: 'Creative (CQ)' },
  { val: 'long', label: 'Long Answer' },
]
const writtenQuestions = ref<WrittenItem[]>([])
function addWrittenQuestion() {
  writtenQuestions.value.push({ type: 'saq', marks: 10, question_text: '', question_image_url: null, model_answer: '' })
}
function removeWrittenQuestion(i: number) { writtenQuestions.value.splice(i, 1) }
const totalWrittenMarks = computed(() => writtenQuestions.value.reduce((sum, w) => sum + (w.marks || 0), 0))

async function onImageSelect(e: Event, i: number) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const item = writtenQuestions.value[i]
  item._uploading = true
  item._uploadError = ''
  try {
    const path = `${userID.value?.id}/${Date.now()}_${file.name}`
    const { error: uploadErr } = await supabase.storage.from('exam-images').upload(path, file)
    if (uploadErr) throw uploadErr
    const { data } = supabase.storage.from('exam-images').getPublicUrl(path)
    item.question_image_url = data.publicUrl
  } catch (err: any) {
    item._uploadError = 'Image upload failed. Try a smaller file.'
  } finally {
    item._uploading = false
  }
}

// ── Validation + create ──────────────────────────────────────
const validationMessage = computed(() => {
  if (!examMeta.title.trim()) return 'Give your exam a title before publishing.'
  if (!cart.value.length) return 'Add at least one question to the exam.'
  if (examMeta.accessType === 'private' && !examMeta.accessCode.trim()) return 'Private exams need an access code.'
  if (examConfig.hasWrittenSection && !writtenQuestions.value.length) return 'Written section is on — add at least one written question, or turn it off.'
  if (examConfig.hasWrittenSection && writtenQuestions.value.some(w => !w.question_text.trim())) return 'Every written question needs question text.'
  return ''
})

const creating = ref<'draft' | 'published' | false>(false)
const createError = ref('')
const createdExam = ref<{ exam: any; share_url: string } | null>(null)

async function createExam(status: 'draft' | 'published') {
  if (validationMessage.value) { createError.value = validationMessage.value; return }
  creating.value = status
  createError.value = ''
  try {
    const res = await $fetch<{ exam: any; share_url: string }>('/api/teacher/exams', {
      method: 'POST',
      body: {
        title: examMeta.title,
        description: examMeta.description,
        access_type: examMeta.accessType,
        access_code: examMeta.accessType === 'private' ? examMeta.accessCode : null,
        starts_at: examMeta.startsAt || null,
        ends_at: examMeta.endsAt || null,
        duration_mins: examMeta.durationMins,
        max_attempts: examMeta.maxAttempts,
        show_result_immediately: examMeta.showResultImmediately,
        shuffle_questions: examConfig.shuffle,
        negative_marking: examConfig.negativeMarking,
        negative_mark_value: examConfig.negativeMarkValue,
        has_written_section: examConfig.hasWrittenSection,
        questions: cart.value.map(c => ({ question_id: c.question_id, source_stream: c.source_stream, marks: c.marks, snapshot: c.snapshot })),
        written_questions: examConfig.hasWrittenSection
          ? writtenQuestions.value.map(w => ({ type: w.type, marks: w.marks, question_text: w.question_text, question_image_url: w.question_image_url, model_answer: w.model_answer }))
          : [],
        status,
      },
    })
    createdExam.value = res
  } catch (e: any) {
    createError.value = e?.data?.message || 'Failed to create exam. Please try again.'
  } finally {
    creating.value = false
  }
}

const fullShareUrl = computed(() => createdExam.value ? `${window.location.origin}${createdExam.value.share_url}` : '')
const copied = ref<'link' | 'code' | false>(false)
function copyText(text: string, which: 'link' | 'code') {
  navigator.clipboard.writeText(text)
  copied.value = which
  setTimeout(() => copied.value = false, 1800)
}

function resetBuilder() {
  createdExam.value = null
  cart.value = []
  writtenQuestions.value = []
  examMeta.title = ''
  examMeta.description = ''
  examMeta.accessCode = generateAccessCode()
  examConfig.hasWrittenSection = false
  mode.value = 'browse'
}
</script>

<style scoped>
.teacher-builder { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── Header ─────────────────────────────────────────────── */
.setup-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 1.5rem; flex-wrap: wrap; }
.page-chip { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray); border: 1px solid var(--border); padding: 5px 10px; margin-bottom: 14px; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); animation: chipPulse 2s ease-in-out infinite; }
@keyframes chipPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
.page-title { font-family: var(--font-mono); font-size: 1.9rem; line-height: 1.15; color: var(--white); margin: 0; }
.text-outline { color: transparent; -webkit-text-stroke: 1px var(--white); }
.page-sub { color: var(--gray); font-size: 0.88rem; margin-top: 10px; max-width: 480px; }

.mode-toggle { display: inline-flex; border: 1px solid var(--border); }
.mode-btn { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); background: transparent; border: none; padding: 11px 20px; cursor: pointer; display: flex; align-items: center; gap: 8px; }
.mode-btn.active { background: var(--white); color: var(--black); }
.mode-badge { background: var(--black); color: var(--white); font-size: 0.62rem; padding: 1px 6px; border-radius: 8px; }

/* ── Created panel ──────────────────────────────────────── */
.created-panel { border: 1px solid var(--border-bright); padding: 2rem; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.created-tag { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: rgba(120,230,120,0.9); border: 1px solid rgba(120,230,120,0.3); padding: 4px 9px; }
.created-title { font-family: var(--font-mono); font-size: 1.4rem; color: var(--white); margin: 6px 0 0; }
.created-sub { color: var(--gray); font-size: 0.82rem; margin-bottom: 10px; }
.link-box { display: flex; align-items: center; gap: 12px; border: 1px solid var(--border); padding: 10px 14px; width: 100%; max-width: 520px; }
.link-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); }
.link-value { flex: 1; font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); overflow-x: auto; white-space: nowrap; }
.link-copy-btn { font-size: 0.68rem !important; padding: 8px 14px !important; }
.created-actions { display: flex; gap: 10px; margin-top: 14px; }

/* ── Exam meta panel ────────────────────────────────────── */
.exam-meta-panel, .question-panel, .info-panel, .written-section-panel { border: 1px solid var(--border); padding: 1.5rem; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); }
.config-section-header { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
.csec-tag { font-family: var(--font-mono); font-size: 0.7rem; color: var(--dim); }
.csec-label { font-family: var(--font-mono); font-size: 0.78rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--white); }
.csec-hint { font-size: 0.72rem; color: var(--gray); margin-left: auto; }

.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; }
.meta-field { display: flex; flex-direction: column; gap: 6px; }
.meta-field--wide { grid-column: 1 / -1; }
.form-label { font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); }
.optional-tag { color: var(--dim); text-transform: none; letter-spacing: 0; font-style: italic; }
.text-input { background: #0d0d0d; border: 1px solid var(--border); color: var(--white); font-family: var(--font-sans); font-size: 0.85rem; padding: 10px 12px; width: 100%; }
.text-input:focus { outline: none; border-color: var(--border-bright); }
.num-input { max-width: 100px; }
.access-code-row { display: flex; gap: 10px; margin-top: 10px; align-items: center; }
.code-input { font-family: var(--font-mono); letter-spacing: 0.12em; text-transform: uppercase; max-width: 160px; }
.code-regen-btn { font-size: 0.66rem !important; padding: 9px 14px !important; }

/* ── Filter bar (shared look with filter-pill system) ────── */
.filter-bar { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.search-row { display: flex; align-items: center; position: relative; }
.search-input { padding-right: 32px; }
.clear-search-btn { position: absolute; right: 8px; background: none; border: none; color: var(--gray); font-size: 1rem; cursor: pointer; }
.filter-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-pill { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.04em; color: var(--gray); background: transparent; border: 1px solid var(--border); padding: 7px 12px; cursor: pointer; }
.filter-pill:hover { color: var(--white); border-color: var(--border-bright); }
.filter-pill.active { background: var(--white); color: var(--black); border-color: var(--white); }
.diff-pill.easy.active { background: rgba(120,230,120,0.85); border-color: rgba(120,230,120,0.85); }
.diff-pill.medium.active { background: rgba(255,200,80,0.85); border-color: rgba(255,200,80,0.85); }
.diff-pill.hard.active { background: rgba(255,100,100,0.85); border-color: rgba(255,100,100,0.85); }

.filter-status { display: flex; align-items: center; gap: 14px; font-size: 0.78rem; color: var(--gray); margin-bottom: 14px; }
.clear-filters-btn { background: none; border: none; color: var(--dim); text-decoration: underline; font-size: 0.74rem; cursor: pointer; }
.error-text { color: rgba(255,100,100,0.9); font-size: 0.78rem; }

/* ── Question list / cards ──────────────────────────────── */
.q-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.q-card { background: var(--black); border-left: 2px solid transparent; }
.q-card--added { border-left-color: rgba(120,230,120,0.6); }
.q-card.expanded { border-left-color: var(--border-bright); }
.q-card-header { display: flex; align-items: flex-start; gap: 14px; padding: 14px 16px; cursor: pointer; }
.q-meta { display: flex; flex-direction: column; gap: 5px; min-width: 90px; }
.diff-badge { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 2px 7px; width: fit-content; }
.diff-badge.easy { background: rgba(120,230,120,0.12); color: rgba(120,230,120,0.9); }
.diff-badge.medium { background: rgba(255,200,80,0.12); color: rgba(255,200,80,0.9); }
.diff-badge.hard { background: rgba(255,100,100,0.12); color: rgba(255,100,100,0.85); }
.tag-chip { font-size: 0.62rem; color: var(--dim); }
.q-text { flex: 1; font-size: 0.86rem; color: var(--white); line-height: 1.5; margin: 0; }
.q-actions { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.add-toggle-btn { font-size: 0.66rem !important; padding: 8px 14px !important; white-space: nowrap; }
.expand-chevron { color: var(--gray); font-size: 1.1rem; width: 18px; text-align: center; }

.q-card-body { padding: 0 16px 18px 16px; display: flex; flex-direction: column; gap: 14px; }
.q-image-wrap img { max-width: 100%; border: 1px solid var(--border); }
.q-options { display: flex; flex-direction: column; gap: 8px; }
.opt-row { display: flex; align-items: center; gap: 10px; border: 1px solid var(--border); padding: 9px 12px; font-size: 0.82rem; color: var(--gray); }
.opt-row.opt-correct { border-color: rgba(120,230,120,0.5); background: rgba(120,230,120,0.06); color: var(--white); }
.opt-letter { font-family: var(--font-mono); width: 22px; height: 22px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; flex-shrink: 0; }
.opt-correct-tag { margin-left: auto; font-size: 0.66rem; color: rgba(120,230,120,0.9); font-family: var(--font-mono); }
.explanation-block { border-left: 2px solid var(--border-bright); padding-left: 12px; }
.explanation-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); }
.explanation-block p { font-size: 0.8rem; color: var(--gray); margin: 4px 0 0; line-height: 1.6; }

.empty-state { padding: 2.5rem; text-align: center; color: var(--gray); font-size: 0.85rem; border: 1px solid var(--border); }
.q-list-skeleton { display: flex; flex-direction: column; gap: 1px; }
.q-skeleton-card { height: 58px; background: #0c0c0c; }

.pagination-row { display: flex; justify-content: center; align-items: center; gap: 18px; margin-top: 18px; }
.page-btn { font-size: 0.68rem !important; padding: 9px 16px !important; }
.page-info { font-family: var(--font-mono); font-size: 0.72rem; color: var(--gray); }

/* ── Layout grid ─────────────────────────────────────────── */
.builder-body { display: grid; grid-template-columns: 1fr 360px; gap: 1.5rem; align-items: start; }
.builder-sidebar { display: flex; flex-direction: column; gap: 1.5rem; position: sticky; top: 1.5rem; }

.panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.panel-tag { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--white); }
.cart-count { font-size: 0.72rem; color: var(--gray); }
.stat-row { display: flex; justify-content: space-between; font-size: 0.82rem; color: var(--gray); padding: 7px 0; border-bottom: 1px solid var(--border); }
.stat-row strong { color: var(--white); font-family: var(--font-mono); }
.panel-hint { font-size: 0.76rem; color: var(--dim); margin-top: 14px; line-height: 1.5; }

.page-diff-breakdown { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.pdb-row { display: flex; align-items: center; gap: 10px; font-size: 0.72rem; }
.pdb-label { width: 56px; font-family: var(--font-mono); }
.pdb-label.easy { color: rgba(120,230,120,0.9); }
.pdb-label.medium { color: rgba(255,200,80,0.9); }
.pdb-label.hard { color: rgba(255,100,100,0.85); }
.pdb-bar-track { flex: 1; height: 5px; background: var(--border); }
.pdb-bar-fill { height: 100%; }
.pdb-bar-fill.easy { background: rgba(120,230,120,0.7); }
.pdb-bar-fill.medium { background: rgba(255,200,80,0.7); }
.pdb-bar-fill.hard { background: rgba(255,100,100,0.7); }
.pdb-count { width: 22px; text-align: right; color: var(--gray); }

.cart-empty { font-size: 0.8rem; color: var(--dim); line-height: 1.6; }
.cart-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); max-height: 420px; overflow-y: auto; }
.cart-item { background: var(--black); display: flex; align-items: center; gap: 10px; padding: 10px 12px; }
.cart-idx { font-family: var(--font-mono); font-size: 0.68rem; color: var(--dim); width: 16px; flex-shrink: 0; }
.cart-text { flex: 1; font-size: 0.76rem; color: var(--gray); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.cart-marks-input { width: 48px; background: #0d0d0d; border: 1px solid var(--border); color: var(--white); font-size: 0.72rem; padding: 4px; flex-shrink: 0; }
.cart-remove-btn { background: none; border: none; color: var(--gray); font-size: 1.1rem; cursor: pointer; flex-shrink: 0; line-height: 1; }
.cart-remove-btn:hover { color: rgba(255,100,100,0.9); }

/* ── Toggle switches ─────────────────────────────────────── */
.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--border); cursor: pointer; }
.toggle-row:last-of-type { border-bottom: none; }
.toggle-label { font-size: 0.82rem; color: var(--white); }
.toggle-btn { width: 38px; height: 20px; border: 1px solid var(--border); background: transparent; padding: 2px; cursor: pointer; flex-shrink: 0; }
.toggle-btn.on { background: rgba(240,240,234,0.15); border-color: var(--border-bright); }
.toggle-knob { display: block; width: 14px; height: 14px; background: var(--gray); transition: transform 0.15s ease, background 0.15s ease; }
.toggle-btn.on .toggle-knob { background: var(--white); transform: translateX(16px); }
.nm-value-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }

.validation-msg { margin-bottom: 12px; }
.publish-btn { margin-top: 10px; }

/* ── Written section ─────────────────────────────────────── */
.written-list { display: flex; flex-direction: column; gap: 1.2rem; }
.written-card { border: 1px solid var(--border); padding: 1.2rem; display: flex; flex-direction: column; gap: 12px; }
.written-card-head { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.written-type-pills { flex: 1; }
.written-marks-field { display: flex; align-items: center; gap: 8px; }
.written-remove-btn { font-size: 1.3rem; }
.written-textarea { font-family: var(--font-sans); resize: vertical; }
.written-model-answer { color: var(--dim); }

.image-upload-zone { position: relative; border: 1px dashed var(--border); min-height: 90px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.image-upload-zone.has-image { border-style: solid; border-color: var(--border-bright); }
.upload-placeholder { font-size: 0.76rem; color: var(--dim); }
.upload-preview { max-height: 160px; max-width: 100%; object-fit: contain; }
.upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.upload-remove-btn { position: absolute; top: 6px; right: 6px; background: var(--black); border: 1px solid var(--border); width: 22px; height: 22px; font-size: 1rem; }
.add-written-btn { margin-top: 1.2rem; font-size: 0.74rem !important; }

@media (max-width: 980px) {
  .builder-body { grid-template-columns: 1fr; }
  .builder-sidebar { position: static; }
  .meta-grid { grid-template-columns: 1fr; }
}
</style>
