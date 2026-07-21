<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const supabase        = useSupabaseClient()
const supabaseHSC     = useSupabaseHSC()
const supabaseMedical = useSupabaseMedical()

const { isBn } = useI18n()
let selectedLang = computed(() => isBn.value ? 'bangla' : 'english')

// ─── MOCK USER TIER ──────────────────────────────────────────────────────────
// In production: const user = useSupabaseUser(); const isPaid = user.value?.user_metadata?.plan === 'pro'
const isPaid = ref(false) // toggle for demo — wire to Supabase user metadata

// ─── QUESTION BANK ───────────────────────────────────────────────────────────

const { hscSscQuestionBank } = useQuestionBank('hsc_science')
let questionBank = hscSscQuestionBank

// ─── WRITTEN QUESTIONS (paid only) ───────────────────────────────────────────
const writtenQuestions = {
  hsc_science: [
    { id: 'w-hs-1', type: 'short', marks: 4, text: 'State Newton\'s three laws of motion with one example each. How do these laws apply to everyday life situations?', subject: 'Physics', chapter: 'Dynamics', year: '2023' },
    { id: 'w-hs-2', type: 'creative', marks: 10, text: 'পাদটীকা: হাইড্রোকার্বনের রাসায়নিক বৈশিষ্ট্য\n\n(ক) অ্যালকেনের সাধারণ সূত্র লিখ। (খ) মিথেনের গঠন ব্যাখ্যা কর। (গ) ইথিলিন ও অ্যাসিটিলিনের মধ্যে পার্থক্য দেখাও। (ঘ) পেট্রোলিয়াম পরিশোধনের পদ্ধতি বিশ্লেষণ কর।', subject: 'Chemistry', chapter: 'Organic Chemistry', year: '2023' },
    { id: 'w-hs-3', type: 'creative', marks: 10, text: 'একটি বাস্তুসংস্থানে শক্তি প্রবাহ ও পদার্থের চক্রের গুরুত্ব বিশ্লেষণ কর। বায়োজিওকেমিক্যাল চক্রের উদাহরণ দিয়ে ব্যাখ্যা কর কীভাবে কার্বন এবং নাইট্রোজেন পরিবেশে চক্রাকারে আবর্তিত হয়।', subject: 'Biology', chapter: 'Ecology', year: '2022' },
  ],
  hsc_arts: [
    { id: 'w-ha-1', type: 'short', marks: 4, text: '"বিদ্রোহী" কবিতায় কবির স্বদেশপ্রেম ও মানবতাবাদী চেতনার বিশ্লেষণ করো।', subject: 'বাংলা', chapter: 'কাব্যসাহিত্য', year: '2023' },
    { id: 'w-ha-2', type: 'creative', marks: 10, text: 'পাদটীকা: ভাষা আন্দোলন ও বাংলাদেশের জাতীয় পরিচয়\n\n(ক) ভাষা আন্দোলনের পটভূমি বর্ণনা কর। (খ) ২১ ফেব্রুয়ারির ঘটনাবলী ব্যাখ্যা কর। (গ) ভাষা আন্দোলনের ফলাফল বিশ্লেষণ কর। (ঘ) বাঙালি জাতীয়তাবাদে ভাষা আন্দোলনের প্রভাব মূল্যায়ন কর।', subject: 'ইতিহাস', chapter: 'ভাষা আন্দোলন', year: '2022' },
    { id: 'w-ha-3', type: 'creative', marks: 10, text: 'বাংলাদেশের গণতান্ত্রিক ব্যবস্থা এবং নাগরিকের অধিকার ও কর্তব্য সম্পর্কে একটি বিশ্লেষণমূলক প্রবন্ধ লিখ। নাগরিক সমাজের ভূমিকা এবং সুশাসনের জন্য করণীয় বিষয়সমূহও আলোচনা কর।', subject: 'পৌরনীতি', chapter: 'গণতন্ত্র', year: '2023' },
  ],
  hsc_commerce: [
    { id: 'w-hc-1', type: 'short', marks: 4, text: 'Explain the double-entry system of bookkeeping with an example transaction. Why is it considered the most reliable accounting system?', subject: 'Accounting', chapter: 'Double Entry', year: '2023' },
    { id: 'w-hc-2', type: 'creative', marks: 10, text: 'Creative Question: Business Environment Analysis\n\n(a) Define internal and external business environment. (b) Explain PESTEL factors with examples from Bangladesh context. (c) Analyze how global trade affects local businesses. (d) Evaluate strategies a small business can use to compete in a globalized market.', subject: 'Business Studies', chapter: 'Business Environment', year: '2022' },
  ],
  ssc_science: [
    { id: 'w-ss-1', type: 'short', marks: 4, text: 'Explain photosynthesis with a diagram. What are the products and raw materials? How does light affect the rate of photosynthesis?', subject: 'Biology', chapter: 'Plant Biology', year: '2023' },
    { id: 'w-ss-2', type: 'creative', marks: 10, text: 'Creative Question: Electricity in Daily Life\n\n(a) State Ohm\'s law. (b) Draw a simple circuit diagram. (c) Calculate the resistance if V = 12V and I = 3A. (d) Discuss the safety measures we should take while using electricity at home.', subject: 'Physics', chapter: 'Electricity', year: '2022' },
  ],
  ssc_arts: [
    { id: 'w-sa-1', type: 'short', marks: 4, text: 'বাংলাদেশের মুক্তিযুদ্ধে সাধারণ মানুষের ভূমিকা বর্ণনা কর। তাদের আত্মত্যাগ কীভাবে স্বাধীনতা অর্জনে সহায়ক হয়েছিল?', subject: 'ইতিহাস', chapter: 'মুক্তিযুদ্ধ', year: '2023' },
    { id: 'w-sa-2', type: 'creative', marks: 10, text: 'সৃজনশীল প্রশ্ন: বাংলা সাহিত্য\n\nউদ্দীপক: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি..."\n\n(ক) কবিতাটির রচয়িতার নাম লিখ। (খ) কবিতায় দেশপ্রেমের প্রকাশ ব্যাখ্যা কর। (গ) স্বদেশের প্রতি ভালোবাসার যে চিত্র তুলে ধরা হয়েছে তা বিশ্লেষণ কর। (ঘ) বর্তমান সময়ে দেশপ্রেম চর্চার গুরুত্ব মূল্যায়ন কর।', subject: 'বাংলা', chapter: 'কবিতা', year: '2022' },
  ],
  ssc_commerce: [
    { id: 'w-sc-1', type: 'short', marks: 4, text: 'Describe the importance of bookkeeping for a small business. What problems can arise if proper books of accounts are not maintained?', subject: 'Accounting', chapter: 'Bookkeeping', year: '2023' },
    { id: 'w-sc-2', type: 'creative', marks: 10, text: 'Creative Question: Entrepreneurship in Bangladesh\n\n(a) Define an entrepreneur. (b) List 4 qualities of a successful entrepreneur. (c) Explain the challenges faced by young entrepreneurs in Bangladesh. (d) Suggest how government and NGOs can support small business development.', subject: 'Business Studies', chapter: 'Entrepreneurship', year: '2022' },
  ],
}

// ─── EXAM CONFIGURATIONS ────────────────────────────────────────────────────
const examTypes = {
  hsc: {
    label: 'HSC', fullLabel: 'Higher Secondary Certificate',
    icon: '🎓', authority: 'Bangladesh Education Board',
    totalMcq: 25, mcqDuration: 25,
    writtenQuestions: 3, writtenDuration: 120,
    passScore: 33,
    groups: [
      { key: 'hsc_science', label: 'Science', icon: '⚗️', subjects: { physics: 5, chemistry: 5, zoology: 4, math: 4, ict: 2, english: 3 } },
      { key: 'hsc_arts', label: 'Arts / Humanities', icon: '📚', subjects: { bangla: 5, english: 4, history: 3, civics: 3, ict: 2, economics: 4 } },
      { key: 'hsc_commerce', label: 'Commerce', icon: '📊', subjects: { accounting: 4, business_studies: 5, finance: 3, bangla: 3, english: 3, ict: 2 } },
    ]
  },
  ssc: {
    label: 'SSC', fullLabel: 'Secondary School Certificate',
    icon: '📝', authority: 'Bangladesh Education Board',
    totalMcq: 20, mcqDuration: 20,
    writtenQuestions: 2, writtenDuration: 100,
    passScore: 33,
    groups: [
      { key: 'ssc_science', label: 'Science', icon: '🔬', subjects: { physics: 4, chemistry: 4, zoology: 4, math: 3, ict: 2, english: 3 } },
      { key: 'ssc_arts', label: 'Arts / Humanities', icon: '🖊️', subjects: { bangla: 5, english: 3, history: 3, civics: 2, ict: 2, economics: 2 } },
      { key: 'ssc_commerce', label: 'Commerce', icon: '💼', subjects: { accounting: 4, business_studies: 4, bangla: 3, english: 2, ict: 2, math: 3 } },
    ]
  }
}

const subjectLabels = {
  physics: 'Physics', chemistry: 'Chemistry', zoology: 'Zoology', math: 'Math',
  ict: 'ICT', english: 'English', bangla: 'Bangla', history: 'History',
  civics: 'Civics', economics: 'Economics', accounting: 'Accounting',
  business_studies: 'Bus. Studies', finance: 'Finance',
}

// ─── STATE ────────────────────────────────────────────────────────────────────
const phase = ref('setup')             // 'setup' | 'mcq' | 'written_intro' | 'written' | 'results'
const selectedExamType = ref(null)     // 'hsc' | 'ssc'
const selectedGroupKey = ref(null)

const route = useRoute()

// Holds top-level overrides like { mcqDuration: 15 }
const configOverrides = ref(null)
// Holds a subject->count map override, e.g. { physics: 5, chemistry: 5 }
const subjectOverrides = ref(null)

// Maps exams.vue query.stream → examTypes key
const _streamToType = { hsc: 'hsc', ssc: 'ssc' }

onMounted(async () => {
  const q = route.query
  if (q.autostart !== '1') return

  const examTypeKey = _streamToType[q.stream]
  const groupKey     = q.group

  if (!examTypeKey || !examTypes[examTypeKey]) return
  const typeConfig  = examTypes[examTypeKey]
  const groupExists = typeConfig.groups.find(g => g.key === groupKey)
  if (!groupExists) return

  selectedExamType.value = examTypeKey
  selectedGroupKey.value = groupKey

  // ── Apply duration override ──────────────────────────────────────────────
  // exams.vue passes `duration` (in minutes) for the MCQ phase
  if (q.duration) {
    const dur = parseInt(q.duration)
    if (!isNaN(dur) && dur > 0) {
      configOverrides.value = { ...configOverrides.value, mcqDuration: dur }
    }
  }

  // ── Apply question count override ────────────────────────────────────────
  // exams.vue passes `count` (total questions). We scale the group's existing
  // subject ratio proportionally so the mix stays balanced, then round.
  if (q.count) {
    const targetTotal = parseInt(q.count)
    if (!isNaN(targetTotal) && targetTotal > 0) {
      const baseSubjects = groupExists.subjects
      const baseTotal = Object.values(baseSubjects).reduce((a, b) => a + b, 0)
      const scale = targetTotal / baseTotal
      const scaled = {}
      let runningTotal = 0
      const keys = Object.keys(baseSubjects)
      keys.forEach((subj, i) => {
        if (i === keys.length - 1) {
          // Last subject takes the remainder so totals add up exactly
          scaled[subj] = Math.max(1, targetTotal - runningTotal)
        } else {
          const val = Math.max(1, Math.round(baseSubjects[subj] * scale))
          scaled[subj] = val
          runningTotal += val
        }
      })
      subjectOverrides.value = scaled
      configOverrides.value = { ...configOverrides.value, totalMcq: targetTotal }
    }
  }

  // ── Apply single-subject filter ──────────────────────────────────────────
  // If exams.vue passed a specific subject (not 'All'), restrict to only that
  // subject, putting all requested questions into it.
  if (q.subject && q.subject !== 'All') {
    const subjKey = Object.keys(subjectLabels).find(
      k => subjectLabels[k].toLowerCase() === String(q.subject).toLowerCase()
    )
    if (subjKey && groupExists.subjects[subjKey] !== undefined) {
      const total = subjectOverrides.value
        ? Object.values(subjectOverrides.value).reduce((a, b) => a + b, 0)
        : (q.count ? parseInt(q.count) : groupExists.subjects[subjKey])
      subjectOverrides.value = { [subjKey]: total }
      configOverrides.value = { ...configOverrides.value, totalMcq: total }
    }
  }

  // 1. Load the preset exam config to know is_dynamic and question_ids
  let ordered = null
  let db_fetch = null

  const { data: exam, error: examErr } = await supabase
    .from('preset_exams')
    .select('*')
    .eq('id', q.examId)
    .single()

  if (examErr || !exam) {
    console.warn('Could not load preset exam:', examErr?.message)
    return []
  }

  // ── CURATED: fetch fixed question_ids ──────────────────────────────────
  if (exam.question_ids?.length) {
    const sup = q.stream === 'hsc' ? supabaseHSC : supabaseMedical
    const { data: rows, error: rowsErr } = await sup.from('questions')
      .select('*')
      .in('id', exam.question_ids)
      .eq('status', 'published')

    if (rowsErr || !rows?.length) {
      console.warn('Curated fetch failed or empty:', rowsErr?.message)
      return []
    }

    // Preserve the curated order defined in question_ids
    ordered = exam.question_ids
      .map((id: number) => rows.find((r: any) => r.id === id))
      .filter(Boolean)

    //return ordered.map((row: any) => mapRow(row))
    //return ordered
    db_fetch = rows
  }

  interface Question {
    id: number
    question: string | { english: string; bangla: string }
    question_image?: string | null
    stimulus?: { english: string; bangla: string } | null
    stimulus_image?: string | null
    stimulus_hash?: string | null
    options: string[] | { english: string[]; bangla: string[] }
    correct_index: number
    explanation: string | { english: string; bangla: string }
    subject: string | { english: string; bangla: string }
    chapter: string | { english: string; bangla: string }
    exam: string
    difficulty: string | { english: string; bangla: string }
    difficulty_level: 'easy' | 'medium' | 'hard'
    years?: { english: string; bangla: string }[]
  }
  
  // Get the english label whether subject is a plain string or bilingual object
  function getEnglishSubject(subject: Question['subject']): string {
    return typeof subject === 'string' ? subject : subject['english'].toLowerCase()
  }
  
  function groupByExamAndSubject(
    questions: Question[]
  ): Record<string, Record<string, Question[]>> {
    const result: Record<string, Record<string, Question[]>> = {}
  
    for (const q of questions) {
      const examKey = groupKey                          // "exam" is already a plain string
      const subjectKey = getEnglishSubject(q.subject)  // unwrap bilingual subject if needed
    
      if (!result[examKey]) {
        result[examKey] = {}
      }
      if (!result[examKey][subjectKey]) {
        result[examKey][subjectKey] = []
      }
    
      result[examKey][subjectKey].push(q)
    }
  
    return result
  }

  questionBank = groupByExamAndSubject(ordered)

  // ── Show start modal after reactivity flushes ────────────────────────────
  nextTick(() => {
    nextTick(() => {
      showStartModal.value = true
    })
  })
})

const presetExamTitle = computed(() => route.query.title || null)

const questions = ref([])
const answers = ref({})
const flagged = ref(new Set())
const currentIdx = ref(0)
const timeLeft = ref(0)
const timerInterval = ref(null)
const showEndModal = ref(false)
const showStartModal = ref(false)
const filterTab = ref('all')
const subjectFilter = ref('all')     // 'all' | subject key — filters the review list

// Written section state
const writtenAnswers = ref({})
const writtenTimeLeft = ref(0)
const writtenTimerInterval = ref(null)
const writtenQuestionsList = ref([])

// ─── COMPUTED ─────────────────────────────────────────────────────────────────
//const examConfig = computed(() => selectedExamType.value ? examTypes[selectedExamType.value] : null)
const examConfig = computed(() => {
  if (!selectedExamType.value) return null
  const base = examTypes[selectedExamType.value]
  if (!configOverrides.value) return base
  // Shallow-merge top-level keys (mcqDuration, totalMcq, etc.)
  return { ...base, ...configOverrides.value }
})

//const selectedGroup = computed(() => {
//  if (!examConfig.value || !selectedGroupKey.value) return null
//  return examConfig.value.groups.find(g => g.key === selectedGroupKey.value)
//})

const selectedGroup = computed(() => {
  if (!examConfig.value || !selectedGroupKey.value) return null
  const base = examConfig.value.groups.find(g => g.key === selectedGroupKey.value)
  if (!base) return null
  if (subjectOverrides.value) {
    // Replace the subjects map entirely with the override (counts per subject)
    return { ...base, subjects: subjectOverrides.value }
  }
  return base
})

const canStart = computed(() => selectedExamType.value && selectedGroupKey.value)

const timerClass = computed(() => {
  const t = phase.value === 'written' ? writtenTimeLeft.value : timeLeft.value
  if (t <= 30) return 'critical'
  if (t <= 120) return 'warning'
  return ''
})

const timerDisplay = computed(() => {
  const t = phase.value === 'written' ? writtenTimeLeft.value : timeLeft.value
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const answeredCount = computed(() => Object.keys(answers.value).length)
const flaggedCount = computed(() => flagged.value.size)
const progressPct = computed(() => questions.value.length ? (answeredCount.value / questions.value.length) * 100 : 0)

const scoreData = computed(() => {
  if (!examConfig.value) return {}
  let correct = 0, wrong = 0, skipped = 0
  questions.value.forEach(q => {
    if (answers.value[q.id] === undefined) skipped++
    else if (answers.value[q.id] === q.correct_index) correct++
    else wrong++
  })
  const total = questions.value.length
  const pct = total ? (correct / total) * 100 : 0
  return { correct, wrong, skipped, total, pct: pct.toFixed(1) }
})

const gradeInfo = computed(() => {
  const p = parseFloat(scoreData.value.pct || 0)
  if (p >= 80) return { letter: 'A+', label: 'Excellent', cls: 'grade-high' }
  if (p >= 70) return { letter: 'A', label: 'Very Good', cls: 'grade-high' }
  if (p >= 60) return { letter: 'B', label: 'Good', cls: 'grade-mid' }
  if (p >= 50) return { letter: 'C', label: 'Average', cls: 'grade-mid' }
  if (p >= 40) return { letter: 'D', label: 'Pass', cls: 'grade-low' }
  return { letter: 'F', label: 'Fail', cls: 'grade-fail' }
})

const filteredReview = computed(() => {
  let pool = questions.value
  if (subjectFilter.value !== 'all') pool = pool.filter(q => q.subject['english'].toLowerCase() === subjectFilter.value)
  if (filterTab.value === 'correct') return pool.filter(q => answers.value[q.id] === q.correct_index)
  if (filterTab.value === 'wrong')   return pool.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.correct_index)
  if (filterTab.value === 'skipped') return pool.filter(q => answers.value[q.id] === undefined)
  return pool
})

// Counts scoped to current subjectFilter — used by review tab badges
const filteredCounts = computed(() => {
  let pool = questions.value
  if (subjectFilter.value !== 'all') pool = pool.filter(q => q.subject['english'].toLowerCase() === subjectFilter.value)
  return {
    all:     pool.length,
    correct: pool.filter(q => answers.value[q.id] === q.correct_index).length,
    wrong:   pool.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.correct_index).length,
    skipped: pool.filter(q => answers.value[q.id] === undefined).length,
  }
})

const subjectBreakdown = computed(() => {
  if (!selectedGroup.value) return []
  return Object.keys(selectedGroup.value.subjects).map(subj => {
    const qs = questions.value.filter(q => q.subject['english'].toLowerCase() === subj)
    const correct = qs.filter(q => answers.value[q.id] === q.correct_index).length
    const wrong = qs.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.correct_index).length
    const skipped = qs.filter(q => answers.value[q.id] === undefined).length
    const total = qs.length
    const pct = total ? (correct / total * 100).toFixed(1) : '0.0'
    const tabCount = filterTab.value === 'correct' ? correct
      : filterTab.value === 'wrong' ? wrong
      : filterTab.value === 'skipped' ? skipped
      : total
    return { subj, label: subjectLabels[subj] || subj, correct, wrong, skipped, total, pct, tabCount }
  }).filter(s => s.total > 0)
})

const writtenTotalMarks = computed(() => writtenQuestionsList.value.reduce((sum, q) => sum + q.marks, 0))

// ─── EXAM LOGIC ───────────────────────────────────────────────────────────────
function buildMcqQuestions() {
  const bank = questionBank[selectedGroupKey.value] || {}
  //console.log(bank, '--------------------')
  //const pool = []
  //const subjects = selectedGroup.value.subjects
  //console.log(subjects)
  //console.log(selectedGroup.value)
  //Object.keys(subjects).forEach(subj => {
  //  console.log(subj)
  //  const needed = subjects[subj]
  //  console.log(needed)
  //  const available = bank[subj] || []
  //  console.log(available)
  //  //const tagged = available.map(q => ({ ...q, subject: subj }))
  //  //const shuffled = [...tagged].sort(() => Math.random() - 0.5)
  //  //pool.push(...shuffled.slice(0, needed))
  //  pool.push(...available)
  //})
  //questions.value = pool.sort(() => Math.random() - 0.5)
  questions.value = Object.values(bank).flat()

  for (let i = questions.value.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [questions.value[i], questions.value[j]] = [questions.value[j], questions.value[i]];
  }
}

function buildWrittenQuestions() {
  const wqs = writtenQuestions[selectedGroupKey.value] || []
  writtenQuestionsList.value = [...wqs].sort(() => Math.random() - 0.5).slice(0, examConfig.value.writtenQuestions)
  writtenAnswers.value = {}
  writtenQuestionsList.value.forEach(q => {
    writtenAnswers.value[q.id] = { text: '', imageBase64: '', imageUrl: '' }
  })
}

function startExam() {
  showStartModal.value = false
  buildMcqQuestions()
  answers.value = {}
  flagged.value = new Set()
  currentIdx.value = 0
  timeLeft.value = examConfig.value.mcqDuration * 60
  phase.value = 'mcq'
  nextTick(() => setupObserver())
  startMcqTimer()
}

function startMcqTimer() {
  clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    if (timeLeft.value <= 0) { submitMcq(); return }
    timeLeft.value--
  }, 1000)
}

function submitMcq() {
  clearInterval(timerInterval.value)
  showEndModal.value = false
  if (isPaid.value) {
    phase.value = 'written_intro'
    buildWrittenQuestions()
  } else {
    phase.value = 'results'
    filterTab.value = 'all'
    subjectFilter.value = 'all'
  }
}

function startWritten() {
  writtenTimeLeft.value = examConfig.value.writtenDuration * 60
  phase.value = 'written'
  startWrittenTimer()
}

function startWrittenTimer() {
  clearInterval(writtenTimerInterval.value)
  writtenTimerInterval.value = setInterval(() => {
    if (writtenTimeLeft.value <= 0) { submitWritten(); return }
    writtenTimeLeft.value--
  }, 1000)
}

function submitWritten() {
  clearInterval(writtenTimerInterval.value)
  phase.value = 'results'
  filterTab.value = 'all'
  subjectFilter.value = 'all'
}

function toggleFlag(id) {
  const f = new Set(flagged.value)
  f.has(id) ? f.delete(id) : f.add(id)
  flagged.value = f
}

function scrollToQuestion(i) {
  const el = document.getElementById(`question-${i}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function triggerImageUpload(questionId) {
  const el = document.getElementById(`img-input-${questionId}`)
  if (el) el.click()
}

function handleImageUpload(questionId, event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { alert('File too large — max 5MB'); return }
  const reader = new FileReader()
  reader.onload = (e) => {
    writtenAnswers.value[questionId] = {
      ...writtenAnswers.value[questionId],
      imageBase64: e.target.result,
      imageUrl: e.target.result,
    }
  }
  reader.readAsDataURL(file)
  // Reset input so same file can be re-selected
  event.target.value = ''
}

function removeImage(questionId) {
  writtenAnswers.value[questionId].imageBase64 = ''
  writtenAnswers.value[questionId].imageUrl = ''
}

function resetToSetup() {
  clearInterval(timerInterval.value)
  clearInterval(writtenTimerInterval.value)
  phase.value = 'setup'
  selectedExamType.value = null
  selectedGroupKey.value = null
  questions.value = []
  answers.value = {}
  flagged.value = new Set()
  writtenAnswers.value = {}
  writtenQuestionsList.value = []
  filterTab.value = 'all'
  subjectFilter.value = 'all'
}

let observer = null
function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = parseInt(e.target.dataset.idx)
        if (!isNaN(idx)) currentIdx.value = idx
      }
    })
  }, { threshold: 0.4 })
  questions.value.forEach((_, i) => {
    const el = document.getElementById(`question-${i}`)
    if (el) observer.observe(el)
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function diffClass(d) {
  if (d === 'easy') return 'diff-easy'
  if (d === 'hard') return 'diff-hard'
  return 'diff-med'
}

function reviewOptClass(q, idx) {
  if (idx === q.correct_index) return 'rc-correct'
  if (answers.value[q.id] === idx && idx !== q.correct_index) return 'rc-wrong'
  return ''
}
</script>

<template>
  <div class="exam-page">

    <!-- ══════════════════ SETUP PHASE ══════════════════ -->
    <div v-if="phase === 'setup'" class="setup-phase">
      <div class="page-header">
        <div>
          <span class="page-chip"><span class="chip-dot"></span>HSC · SSC EXAM</span>
          <h1 class="page-title">Board <span class="text-outline">Exam Prep</span></h1>
          <p class="page-desc">Full mock exams for HSC & SSC across Science, Arts and Commerce groups. Free members get MCQ. Pro members get MCQ + Written.</p>
        </div>
        <div class="tier-badge" :class="isPaid ? 'tier-pro' : 'tier-free'">
          <div class="tier-icon">{{ isPaid ? '⭐' : '🔓' }}</div>
          <div>
            <div class="tier-label">{{ isPaid ? 'PRO MEMBER' : 'FREE MEMBER' }}</div>
            <div class="tier-sub">{{ isPaid ? 'MCQ + Written sections' : 'MCQ only · Upgrade for Written' }}</div>
          </div>
          <!-- Demo toggle -->
          <button class="tier-toggle iso-btn iso-btn--ghost" @click="isPaid = !isPaid" style="font-size:0.55rem;padding:5px 10px;">
            {{ isPaid ? 'Demo: Switch to Free' : 'Demo: Switch to Pro' }}
          </button>
        </div>
      </div>

      <!-- Exam Type Selection -->
      <div class="type-section">
        <div class="section-label-row">
          <span class="section-pill">SELECT EXAM TYPE</span>
          <div class="section-line"></div>
        </div>
        <div class="type-grid">
          <div
            v-for="(config, key) in examTypes"
            :key="key"
            class="type-card"
            :class="{ 'type-card--active': selectedExamType === key }"
            @click="selectedExamType = key; selectedGroupKey = null"
          >
            <div class="type-card-corner tl"></div>
            <div class="type-card-corner br"></div>
            <div class="type-card-top">
              <span class="type-icon">{{ config.icon }}</span>
              <span class="type-label">{{ config.label }}</span>
            </div>
            <div class="type-full">{{ config.fullLabel }}</div>
            <div class="type-authority">{{ config.authority }}</div>
            <div class="type-meta-row">
              <span class="meta-pill">{{ config.totalMcq }}Q MCQ</span>
              <span class="meta-pill">{{ config.mcqDuration }} min</span>
              <span v-if="isPaid" class="meta-pill meta-pill--written">+Written {{ config.writtenDuration }}min</span>
              <span class="meta-pill">Pass: {{ config.passScore }}%</span>
            </div>
            <div class="type-sections-row">
              <span class="section-tag-item">{{ config.groups.length }} Groups</span>
              <span v-if="isPaid" class="section-tag-item section-tag-written">MCQ + Written</span>
              <span v-else class="section-tag-item section-tag-free">MCQ Only</span>
            </div>
            <div class="type-select-label">
              <span v-if="selectedExamType === key">✓ SELECTED</span>
              <span v-else>SELECT →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Group Selection -->
      <transition name="slide-down">
        <div v-if="selectedExamType" class="group-section">
          <div class="section-label-row">
            <span class="section-pill">SELECT GROUP</span>
            <div class="section-line"></div>
          </div>
          <div class="group-grid">
            <div
              v-for="group in examConfig.groups"
              :key="group.key"
              class="group-card"
              :class="{ 'group-card--active': selectedGroupKey === group.key }"
              @click="selectedGroupKey = group.key"
            >
              <div class="group-card-corner tl"></div>
              <div class="group-card-corner br"></div>
              <div class="group-header">
                <span class="group-icon">{{ group.icon }}</span>
                <span class="group-label">{{ group.label }}</span>
                <span v-if="selectedGroupKey === group.key" class="group-check">✓</span>
              </div>
              <div class="group-subjects">
                <div v-for="(count, subj) in group.subjects" :key="subj" class="group-subj-row">
                  <span class="group-subj-name">{{ subjectLabels[subj] || subj }}</span>
                  <div class="group-subj-bar-track">
                    <div class="group-subj-bar" :style="{ width: (count / Object.values(group.subjects).reduce((a,b)=>a+b,0) * 100) + '%' }"></div>
                  </div>
                  <span class="group-subj-count">{{ count }}Q</span>
                </div>
              </div>
              <div class="group-sections">
                <span class="group-section-tag">MCQ</span>
                <span v-if="isPaid" class="group-section-tag group-section-written">Written</span>
                <span v-else class="group-section-tag group-section-locked">Written 🔒</span>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- What to Expect -->
      <div v-if="selectedGroupKey" class="expect-panel">
        <div class="expect-header">EXAM STRUCTURE</div>
        <div class="expect-grid">
          <div class="expect-item">
            <div class="expect-label">SECTION 1 — MCQ</div>
            <div class="expect-val">{{ examConfig.totalMcq }} Questions</div>
            <div class="expect-sub">{{ examConfig.mcqDuration }} min · No negative marking</div>
          </div>
          <div class="expect-item" :class="{ 'expect-item--locked': !isPaid }">
            <div class="expect-label">SECTION 2 — WRITTEN {{ !isPaid ? '🔒 PRO' : '' }}</div>
            <div class="expect-val">{{ examConfig.writtenQuestions }} Questions</div>
            <div class="expect-sub">{{ examConfig.writtenDuration }} min · Mix of short & creative · Image upload allowed</div>
          </div>
        </div>
      </div>

      <!-- CTA Bar -->
      <div v-if="canStart" class="cta-bar">
        <div class="cta-left">
          <div class="cta-name">{{ examConfig.label }} — {{ selectedGroup?.label }}</div>
          <div class="cta-meta">
            <span>{{ examConfig.totalMcq }} MCQ Questions</span>
            <span>·</span>
            <span>{{ examConfig.mcqDuration }} min</span>
            <template v-if="isPaid">
              <span>·</span>
              <span class="written-note">+Written {{ examConfig.writtenDuration }} min after MCQ</span>
            </template>
            <template v-else>
              <span>·</span>
              <span class="free-note">MCQ only (free tier)</span>
            </template>
          </div>
        </div>
        <div class="cta-right">
          <button class="iso-btn iso-btn--ghost" @click="selectedExamType = null; selectedGroupKey = null">Cancel</button>
          <button class="iso-btn iso-btn--fill" @click="showStartModal = true">Start Exam →</button>
        </div>
      </div>
    </div><!-- /setup -->

    <!-- ══════════════════ START EXAM MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showStartModal" class="modal-backdrop" @click.self="showStartModal = false">
        <div class="modal start-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="start-modal-icon">📋</div>
          <div class="start-modal-title">READY TO START?</div>
          <div class="start-modal-exam">{{ examConfig?.label }} — {{ selectedGroup?.label }}</div>
          <div class="start-modal-grid">
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.totalMcq }}</span><span>MCQ Questions</span></div>
            <div class="sm-stat"><span class="sm-val">{{ examConfig?.mcqDuration }}</span><span>Minutes (MCQ)</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenQuestions }}</span><span>Written Qs</span></div>
            <div v-if="isPaid" class="sm-stat"><span class="sm-val">{{ examConfig?.writtenDuration }}</span><span>Minutes (Written)</span></div>
          </div>
          <div class="start-modal-rules">
            <div class="sm-rule">✓ Each correct MCQ answer = 1 mark</div>
            <div class="sm-rule">✓ Wrong or skipped answers = 0 marks (no penalty)</div>
            <div v-if="isPaid" class="sm-rule sm-rule--written">✏ Written section starts automatically after MCQ</div>
            <div v-else class="sm-rule sm-rule--free">🔓 Written section available for Pro members</div>
          </div>
          <div class="start-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showStartModal = false">Go Back</button>
            <button class="iso-btn iso-btn--fill" @click="startExam">Begin Exam →</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ MCQ PHASE ══════════════════ -->
    <div v-if="phase === 'mcq'" class="exam-phase">

      <!-- Sticky Topbar -->
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ examConfig.label }} · {{ selectedGroup?.label }}</span>
          <span class="topbar-section-badge">MCQ</span>
          <span class="topbar-prog">{{ answeredCount }}/{{ questions.length }}</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track"><div class="topbar-bar-fill" :style="{ width: progressPct + '%' }"></div></div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">⏱ {{ timerDisplay }}</div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="showEndModal = true">End MCQ</button>
        </div>
      </div>

      <!-- Sticky Question Palette -->
      <div class="q-palette-wrap">
        <div class="q-palette">
          <button
            v-for="(q, i) in questions"
            :key="q.id"
            class="q-dot"
            :class="{ answered: answers[q.id] !== undefined, flagged: flagged.has(q.id), current: currentIdx === i }"
            @click="scrollToQuestion(i)"
            :title="`Q${i+1}`"
          >{{ i+1 }}</button>
        </div>
        <div class="palette-legend">
          <span class="legend-item"><span class="legend-dot answered"></span>Answered</span>
          <span class="legend-item"><span class="legend-dot flagged"></span>Flagged</span>
          <span class="legend-item"><span class="legend-dot"></span>Unanswered</span>
          <span v-if="isPaid" class="palette-next-hint">Written section follows after MCQ →</span>
        </div>
      </div>

      <!-- Questions List -->
      <div class="questions-list">
        <div
          v-for="(q, i) in questions"
          :key="q.id"
          :id="`question-${i}`"
          :data-idx="i"
          class="q-card"
          :class="{ 'card-answered': answers[q.id] !== undefined, 'card-flagged': flagged.has(q.id), 'card-current': currentIdx === i }"
        >
          <div class="q-card-header">
            <div class="q-meta">
              <span class="q-num">Q{{ i+1 }}</span>
              <span class="q-subject">{{ q.subject[selectedLang] }}</span>
              <span class="q-chapter">{{ q.chapter[selectedLang] }}</span>
              <span :class="['q-diff', diffClass(q.difficulty_level)]">{{ q.difficulty[selectedLang] }}</span>
              <template v-for="(year, index) in q.years" :key="index">
                <span class="q-year">{{ year[selectedLang] }}</span>
              </template>
            </div>
            <button class="flag-btn" :class="{ 'flag-active': flagged.has(q.id) }" @click="toggleFlag(q.id)">
              {{ flagged.has(q.id) ? '🚩 Flagged' : '⚑ Flag' }}
            </button>
          </div>
          <div class="q-text">{{ q.question[selectedLang] }}</div>
          <div class="q-options">
            <button
              v-for="(opt, idx) in q.options[selectedLang]"
              :key="idx"
              class="q-opt"
              :class="{ 'opt-selected': answers[q.id] === idx }"
              @click="answers[q.id] = idx"
            >
              <span class="opt-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="opt-text">{{ opt }}</span>
            </button>
          </div>
          <div class="q-card-footer">
            <span class="q-answered-note" v-if="answers[q.id] !== undefined">✓ Answer selected</span>
            <span class="q-unanswered-note" v-else>Not yet answered</span>
            <button v-if="answers[q.id] !== undefined" class="clear-btn" @click="delete answers[q.id]">✕ Clear</button>
          </div>
        </div>

        <!-- Submit Bar -->
        <div class="submit-bar">
          <div class="submit-stats">
            <span>Answered: <strong>{{ answeredCount }}</strong></span>
            <span>Flagged: <strong>{{ flaggedCount }}</strong></span>
            <span>Skipped: <strong>{{ questions.length - answeredCount }}</strong></span>
          </div>
          <div class="submit-actions">
            <span v-if="isPaid" class="submit-written-note">Written section will follow</span>
            <button class="iso-btn iso-btn--fill" @click="showEndModal = true">
              {{ isPaid ? 'Submit MCQ & Start Written →' : 'Submit Exam →' }}
            </button>
          </div>
        </div>
      </div>
    </div><!-- /mcq -->

    <!-- ══════════════════ END MCQ MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showEndModal && phase === 'mcq'" class="modal-backdrop" @click.self="showEndModal = false">
        <div class="modal end-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="end-title">{{ isPaid ? 'SUBMIT MCQ?' : 'SUBMIT EXAM?' }}</div>
          <div class="end-sub">{{ examConfig?.label }} — {{ selectedGroup?.label }}</div>
          <div class="end-stats-grid">
            <div class="end-stat"><span class="end-val answered-color">{{ answeredCount }}</span><span>Answered</span></div>
            <div class="end-stat"><span class="end-val flagged-color">{{ flaggedCount }}</span><span>Flagged</span></div>
            <div class="end-stat"><span class="end-val skipped-color">{{ questions.length - answeredCount }}</span><span>Skipped</span></div>
          </div>
          <div v-if="flaggedCount > 0" class="end-warn">⚠ {{ flaggedCount }} flagged question(s) still unanswered.</div>
          <div v-if="isPaid" class="end-written-note">After submitting MCQ, the Written section will begin immediately.</div>
          <div class="end-neg-note">No negative marking — every attempt is risk-free.</div>
          <div class="end-actions">
            <button class="iso-btn iso-btn--ghost" @click="showEndModal = false">Keep Going</button>
            <button class="iso-btn iso-btn--fill" @click="submitMcq">{{ isPaid ? 'Submit & Start Written' : 'Submit Now' }}</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ WRITTEN INTRO ══════════════════ -->
    <div v-if="phase === 'written_intro'" class="written-intro-phase">
      <div class="wi-container">
        <div class="wi-icon">✏</div>
        <div class="wi-title">MCQ COMPLETE</div>
        <div class="wi-subtitle">Now starting the Written Section</div>
        <div class="wi-meta-grid">
          <div class="wi-meta-item">
            <div class="wi-meta-val">{{ writtenQuestionsList.length }}</div>
            <div class="wi-meta-lbl">Questions</div>
          </div>
          <div class="wi-meta-item">
            <div class="wi-meta-val">{{ examConfig.writtenDuration }}</div>
            <div class="wi-meta-lbl">Minutes</div>
          </div>
          <div class="wi-meta-item">
            <div class="wi-meta-val">{{ writtenTotalMarks }}</div>
            <div class="wi-meta-lbl">Total Marks</div>
          </div>
        </div>
        <div class="wi-rules">
          <div class="wi-rule">✓ Mix of short answer and creative questions</div>
          <div class="wi-rule">✓ You may upload an image/diagram for any question</div>
          <div class="wi-rule">✓ No negative marking in the written section</div>
          <div class="wi-rule">✓ Answers will be saved automatically</div>
        </div>
        <div class="wi-question-preview">
          <div class="wi-preview-label">QUESTION PREVIEW</div>
          <div v-for="(q, i) in writtenQuestionsList" :key="q.id" class="wi-preview-item">
            <span class="wi-preview-num">Q{{ i+1 }}</span>
            <span class="wi-preview-subj">{{ q.subject }}</span>
            <span class="wi-preview-type" :class="q.type === 'creative' ? 'type-creative' : 'type-short'">{{ q.type === 'creative' ? 'Creative' : 'Short' }}</span>
            <span class="wi-preview-marks">{{ q.marks }} marks</span>
          </div>
        </div>
        <div class="wi-actions">
          <button class="iso-btn iso-btn--ghost" @click="phase = 'results'; filterTab = 'all'">Skip Written & See Results</button>
          <button class="iso-btn iso-btn--fill" @click="startWritten">Begin Written Section →</button>
        </div>
      </div>
    </div>

    <!-- ══════════════════ WRITTEN PHASE ══════════════════ -->
    <div v-if="phase === 'written'" class="written-phase">

      <!-- Sticky Written Topbar -->
      <div class="exam-topbar written-topbar">
        <div class="topbar-left">
          <span class="topbar-chip">{{ examConfig.label }} · {{ selectedGroup?.label }}</span>
          <span class="topbar-section-badge topbar-written-badge">WRITTEN</span>
          <span class="topbar-prog">{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.text?.length > 5).length }}/{{ writtenQuestionsList.length }} answered</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track">
            <div class="topbar-bar-fill written-fill" :style="{ width: (writtenQuestionsList.filter(q => writtenAnswers[q.id]?.text?.length > 5).length / writtenQuestionsList.length * 100) + '%' }"></div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">⏱ {{ timerDisplay }}</div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="submitWritten">Submit Written</button>
        </div>
      </div>

      <!-- Scrollable written questions list -->
      <div class="written-scroll-list">
        <div
          v-for="(q, i) in writtenQuestionsList"
          :key="q.id"
          class="wq-card"
          :class="{ 'wq-card--answered': writtenAnswers[q.id]?.text?.length > 5 }"
        >
          <div class="wq-card-corner tl"></div>
          <div class="wq-card-corner br"></div>

          <div class="wq-header">
            <div class="wq-meta">
              <span class="wq-num">Q{{ i+1 }}</span>
              <span class="wq-subject">{{ q.subject }}</span>
              <span class="wq-chapter">{{ q.chapter }}</span>
              <span :class="['wq-type', q.type === 'creative' ? 'type-creative' : 'type-short']">
                {{ q.type === 'creative' ? 'Creative' : 'Short Answer' }}
              </span>
              <span class="wq-year">{{ q.year }}</span>
            </div>
            <span class="wq-marks-badge">{{ q.marks }} marks</span>
          </div>

          <div class="wq-text">{{ q.text }}</div>

          <!-- Answer textarea -->
          <div class="wq-answer-section">
            <label class="wq-answer-label">YOUR ANSWER</label>
            <textarea
              class="wq-textarea"
              :placeholder="q.type === 'creative'
                ? 'Write your creative answer here. Address each part (ক/খ/গ/ঘ or a/b/c/d) clearly...'
                : 'Write your answer here. Be clear and concise...'"
              v-model="writtenAnswers[q.id].text"
              rows="8"
            ></textarea>
            <div class="wq-char-count">
              {{ writtenAnswers[q.id]?.text?.length || 0 }} characters
            </div>
          </div>

          <!-- Image upload — one input per question, identified by unique id -->
          <div class="wq-image-section">
            <div class="wq-image-label">
              <span>ATTACH DIAGRAM / IMAGE</span>
              <span class="wq-image-hint">Optional — upload a handwritten diagram or figure</span>
            </div>

            <div v-if="!writtenAnswers[q.id]?.imageUrl" class="wq-image-dropzone" @click="triggerImageUpload(q.id)">
              <div class="wq-dropzone-icon">📎</div>
              <div class="wq-dropzone-text">Click to upload image</div>
              <div class="wq-dropzone-hint">JPG, PNG — max 5MB</div>
            </div>

            <div v-else class="wq-image-preview">
              <img :src="writtenAnswers[q.id].imageUrl" alt="Uploaded diagram" class="wq-preview-img" />
              <button class="wq-remove-image" @click="removeImage(q.id)">✕ Remove</button>
            </div>

            <!-- Hidden file inputs — one per question, keyed by question id -->
            <input
              :id="`img-input-${q.id}`"
              type="file"
              accept="image/*"
              style="display:none"
              @change="handleImageUpload(q.id, $event)"
            />
          </div>
        </div>

        <!-- Submit bar at bottom -->
        <div class="submit-bar written-submit-bar">
          <div class="submit-stats">
            <span>Answered: <strong>{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.text?.length > 5).length }}</strong></span>
            <span>With image: <strong>{{ writtenQuestionsList.filter(q => writtenAnswers[q.id]?.imageUrl).length }}</strong></span>
            <span>Total marks: <strong>{{ writtenTotalMarks }}</strong></span>
          </div>
          <div class="submit-actions">
            <button class="iso-btn iso-btn--fill" @click="submitWritten">Submit Written →</button>
          </div>
        </div>
      </div>
    </div><!-- /written -->

    <!-- ══════════════════ RESULTS PHASE ══════════════════ -->
    <div v-if="phase === 'results'" class="results-phase">

      <!-- Score Hero -->
      <div class="score-hero">
        <div class="score-hero-corner tl"></div>
        <div class="score-hero-corner br"></div>
        <div class="score-hero-left">
          <div class="score-exam-label">{{ examConfig?.label }} — {{ selectedGroup?.label }}</div>
          <div class="score-badge-row">
            <span class="score-section-tag">MCQ</span>
            <span v-if="isPaid && writtenQuestionsList.length > 0" class="score-section-tag score-section-written">+ Written</span>
          </div>
          <div class="score-pct" :class="gradeInfo.cls">
            {{ scoreData.pct }}<span class="score-pct-sym">%</span>
          </div>
          <div class="score-raw">Score: <strong>{{ scoreData.correct }} / {{ scoreData.total }}</strong></div>
          <div class="score-status" :class="parseFloat(scoreData.pct) >= examConfig.passScore ? 'status-pass' : 'status-fail'">
            {{ parseFloat(scoreData.pct) >= examConfig.passScore ? '✓ PASSED' : '✗ FAILED' }} · Pass: {{ examConfig.passScore }}%
          </div>
        </div>
        <div class="score-hero-right">
          <div class="grade-badge" :class="gradeInfo.cls">{{ gradeInfo.letter }}</div>
          <div class="grade-label">{{ gradeInfo.label }}</div>
          <div class="score-cards-grid">
            <div class="smc correct-card"><div class="smc-val">{{ scoreData.correct }}</div><div class="smc-lbl">Correct</div><div class="smc-mark correct-mark">+{{ scoreData.correct }}</div></div>
            <div class="smc wrong-card"><div class="smc-val">{{ scoreData.wrong }}</div><div class="smc-lbl">Wrong</div><div class="smc-mark">0</div></div>
            <div class="smc skipped-card"><div class="smc-val">{{ scoreData.skipped }}</div><div class="smc-lbl">Skipped</div><div class="smc-mark">0</div></div>
          </div>
        </div>
      </div>

      <!-- Subject Breakdown — filterable, matches admission-exam.vue -->
      <div class="sb-section-header">
        <div class="section-title-label">SUBJECT-WISE PERFORMANCE</div>
        <div class="sb-filter-hint">
          <span v-if="subjectFilter === 'all'">↓ Click a subject to filter the review below</span>
          <span v-else class="sb-filter-active-hint">Showing questions for <strong>{{ subjectLabels[subjectFilter] || subjectFilter }}</strong> only</span>
        </div>
      </div>
      <div class="subject-breakdown-grid">
        <div
          v-for="sb in subjectBreakdown"
          :key="sb.subj"
          class="sb-card"
          :class="{
            'sb-card--active': subjectFilter === sb.subj,
            'sb-card--dim':    subjectFilter !== 'all' && subjectFilter !== sb.subj
          }"
          @click="subjectFilter = subjectFilter === sb.subj ? 'all' : sb.subj"
        >
          <div class="sb-card-top">
            <div class="sb-name">{{ sb.label }}</div>
            <div class="sb-tab-count" :class="{
              'sb-tab-correct': filterTab === 'correct',
              'sb-tab-wrong':   filterTab === 'wrong',
              'sb-tab-skipped': filterTab === 'skipped',
            }">
              {{ sb.tabCount }}
              <span class="sb-tab-label">{{ filterTab === 'all' ? 'total' : filterTab }}</span>
            </div>
          </div>
          <div class="sb-stats-row">
            <span class="sb-stat correct">✓ {{ sb.correct }}</span>
            <span class="sb-stat wrong">✗ {{ sb.wrong }}</span>
            <span class="sb-stat skip">— {{ sb.skipped }}</span>
          </div>
          <div class="sb-bar-track">
            <div
              class="sb-bar-fill"
              :class="parseFloat(sb.pct) >= 60 ? 'sb-high-fill' : parseFloat(sb.pct) >= 40 ? 'sb-mid-fill' : 'sb-low-fill'"
              :style="{ width: Math.max(0, parseFloat(sb.pct)) + '%' }"
            ></div>
          </div>
          <div class="sb-card-footer">
            <div class="sb-pct" :class="parseFloat(sb.pct) >= 60 ? 'sb-high' : parseFloat(sb.pct) >= 40 ? 'sb-mid' : 'sb-low'">{{ sb.pct }}%</div>
            <div class="sb-filter-cta">{{ subjectFilter === sb.subj ? '✕ clear' : 'filter →' }}</div>
          </div>
        </div>
      </div>

      <!-- Written answers summary (if attempted) -->
      <div v-if="isPaid && writtenQuestionsList.length > 0" class="written-summary">
        <div class="section-title-label" style="margin-bottom:12px;">WRITTEN SECTION — SUBMITTED</div>
        <div class="ws-grid">
          <div v-for="(q, i) in writtenQuestionsList" :key="q.id" class="ws-card">
            <div class="ws-header">
              <span class="ws-qnum">Q{{ i+1 }}</span>
              <span class="ws-subj">{{ q.subject }}</span>
              <span :class="['ws-type', q.type === 'creative' ? 'type-creative' : 'type-short']">{{ q.type }}</span>
              <span class="ws-marks">{{ q.marks }} marks</span>
            </div>
            <div class="ws-answer-preview">
              {{ writtenAnswers[q.id]?.text?.slice(0, 120) || 'No answer written.' }}{{ writtenAnswers[q.id]?.text?.length > 120 ? '...' : '' }}
            </div>
            <div v-if="writtenAnswers[q.id]?.imageUrl" class="ws-has-image">📎 Image attached</div>
            <div v-else class="ws-no-image">No image attached</div>
          </div>
        </div>
      </div>

      <!-- MCQ Question Review -->
      <div class="review-header">
        <div class="review-header-left">
          <span class="section-title-label">MCQ QUESTION REVIEW
            <span v-if="subjectFilter !== 'all'" class="review-subject-chip">
              {{ subjectLabels[subjectFilter] || subjectFilter }}
              <button class="review-clear-subj" @click="subjectFilter = 'all'">×</button>
            </span>
          </span>
        </div>
        <div class="review-tabs">
          <button
            v-for="t in ['all','correct','wrong','skipped']"
            :key="t"
            class="rev-tab"
            :class="{ active: filterTab === t }"
            @click="filterTab = t"
          >
            {{ t.toUpperCase() }}
            <span class="rev-count">{{ filteredCounts[t] }}</span>
          </button>
        </div>
      </div>

      <div v-if="filteredReview.length === 0" class="review-empty">
        <span class="review-empty-icon">—</span>
        <span>No questions match this filter.  </span>
        <button class="iso-btn iso-btn--ghost" style="font-size:0.68rem;padding:6px 14px;" @click="filterTab = 'all'; subjectFilter = 'all'">Clear filters</button>
      </div>

      <div class="review-list">
        <div
          v-for="q in filteredReview"
          :key="q.id"
          class="rc-card"
          :class="{
            'rc-correct': answers[q.id] === q.correct_index,
            'rc-wrong':   answers[q.id] !== undefined && answers[q.id] !== q.correct_index,
            'rc-skipped': answers[q.id] === undefined
          }"
        >
          <div class="rc-header">
            <div class="rc-meta">
              <span class="rc-qnum">Q{{ questions.indexOf(q)+1 }}</span>
              <span class="rc-subj">{{ q.subject[selectedLang] }}</span>
              <span class="rc-chapter">{{ q.chapter[selectedLang] }}</span>
              <span :class="['rc-diff', diffClass(q.difficulty_level)]">{{ q.difficulty[selectedLang] }}</span>
            </div>
            <div class="rc-result-badge">
              <span v-if="answers[q.id] === q.correct_index" class="rc-badge rc-badge-correct">✓ Correct</span>
              <span v-else-if="answers[q.id] !== undefined" class="rc-badge rc-badge-wrong">✗ Wrong</span>
              <span v-else class="rc-badge rc-badge-skip">— Skipped</span>
            </div>
          </div>
          <div class="rc-question">{{ q.question[selectedLang] }}</div>
          <div class="rc-options">
            <div v-for="(opt, idx) in q.options[selectedLang]" :key="idx" class="rc-opt" :class="reviewOptClass(q, idx)">
              <span class="rc-opt-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="rc-opt-text">{{ opt }}</span>
              <span v-if="idx === q.correct_index" class="rc-tag-correct">✓ Correct</span>
              <span v-else-if="answers[q.id] === idx && idx !== q.correct_index" class="rc-tag-wrong">✗ Your answer</span>
            </div>
          </div>
          <div v-if="answers[q.id] === undefined" class="rc-skipped-note">— Skipped · No marks deducted</div>
          <!-- Explanation — always visible -->
          <div v-if="q.explanation" class="rc-explanation">
            <span class="exp-label">EXPLANATION</span>
            <p class="exp-text">{{ q.explanation[selectedLang] }}</p>
          </div>
        </div>
      </div>

      <!-- Results Actions -->
      <div class="results-actions">
        <NuxtLink to="/pricing" v-if="!isPaid" class="iso-btn iso-btn--ghost">Upgrade for Written →</NuxtLink>
        <button class="iso-btn iso-btn--ghost" @click="resetToSetup">← New Exam</button>
        <button class="iso-btn iso-btn--fill" @click="resetToSetup">Retake</button>
      </div>

    </div><!-- /results -->

  </div>
</template>

<style scoped>
/* ─── PAGE SHELL ─────────────────────────────────────────────────────────── */
.exam-page {
  min-height: 100vh;
  padding: 32px 28px 80px;
  max-width: 1200px;
  margin: 0 auto;
}

/* ─── PAGE HEADER ────────────────────────────────────────────────────────── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 40px;
}
.page-chip {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.18em;
  color: var(--gray); border: 1px solid var(--border); padding: 4px 10px; margin-bottom: 14px;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--border-bright);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
.page-title {
  font-family: var(--font-mono); font-size: 2rem; font-weight: 700;
  color: var(--white); margin: 0 0 10px; line-height: 1.2;
}
.text-outline { -webkit-text-stroke: 1px var(--white); color: transparent; }
.page-desc { font-family: var(--font-sans); color: var(--gray); font-size: 0.88rem; max-width: 480px; line-height: 1.6; }

/* ─── TIER BADGE ─────────────────────────────────────────────────────────── */
.tier-badge {
  display: flex; align-items: center; gap: 12px;
  border: 1px solid var(--border); padding: 14px 18px;
  max-width: 280px; flex-shrink: 0;
}
.tier-pro  { border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.04); }
.tier-free { border-color: var(--border); background: rgba(240,240,234,0.02); }
.tier-icon { font-size: 1.4rem; }
.tier-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--white); margin-bottom: 3px; }
.tier-sub { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.tier-toggle { font-size: 0.52rem !important; padding: 4px 8px !important; margin-left: auto; white-space: nowrap; }

/* ─── SECTION LABEL ROW ──────────────────────────────────────────────────── */
.section-label-row { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
.section-pill {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em;
  color: var(--dim); border: 1px solid var(--border); padding: 4px 12px; white-space: nowrap;
}
.section-line { flex: 1; height: 1px; background: var(--border); }

/* ─── TYPE SECTION ───────────────────────────────────────────────────────── */
.type-section { margin-bottom: 32px; }
.type-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: var(--border); }

.type-card {
  position: relative; background: var(--black); padding: 24px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.2s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.type-card:hover { border-color: var(--border-bright); border-left: 2px solid var(--border-bright); transform: translate(-1px,-1px); }
.type-card--active { border-color: var(--white) !important; border-left: 3px solid var(--white) !important; }
.type-card-corner { position: absolute; width: 10px; height: 10px; }
.type-card-corner.tl { top:6px;left:6px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.type-card-corner.br { bottom:6px;right:6px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.type-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.type-icon { font-size: 1.8rem; }
.type-label { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.type-full { font-family: var(--font-mono); font-size: 0.78rem; color: var(--white); margin-bottom: 4px; }
.type-authority { font-family: var(--font-sans); font-size: 0.72rem; color: var(--dim); margin-bottom: 14px; }
.type-meta-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.meta-pill {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.06em;
  color: var(--dim); border: 1px solid var(--border); padding: 2px 8px;
}
.meta-pill--written { color: rgba(255,200,80,0.7); border-color: rgba(255,200,80,0.25); }
.type-sections-row { display: flex; gap: 8px; margin-bottom: 14px; }
.section-tag-item { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.08em; color: var(--dim); border: 1px solid var(--border); padding: 2px 7px; }
.section-tag-written { color: rgba(255,200,80,0.7); border-color: rgba(255,200,80,0.25); }
.section-tag-free { color: rgba(120,220,120,0.6); border-color: rgba(120,220,120,0.2); }
.type-select-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; color: var(--dim); text-align: right; }
.type-card--active .type-select-label { color: var(--white); }

/* ─── GROUP SECTION ──────────────────────────────────────────────────────── */
.group-section { margin-bottom: 28px; }
.group-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.group-card {
  position: relative; background: var(--black); padding: 20px; cursor: pointer;
  border: 1px solid transparent; transition: all 0.2s;
}
.group-card:hover { border-color: var(--border-bright); border-left: 2px solid var(--border-bright); transform: translate(-1px,-1px); }
.group-card--active { border-color: var(--white) !important; border-left: 3px solid var(--white) !important; }
.group-card-corner { position: absolute; width: 8px; height: 8px; }
.group-card-corner.tl { top:5px;left:5px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.group-card-corner.br { bottom:5px;right:5px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.group-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.group-icon { font-size: 1.2rem; }
.group-label { font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700; color: var(--white); flex: 1; }
.group-check { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); }
.group-subjects { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.group-subj-row { display: flex; align-items: center; gap: 8px; }
.group-subj-name { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); width: 68px; text-align: right; }
.group-subj-bar-track { flex: 1; height: 3px; background: rgba(240,240,234,0.06); }
.group-subj-bar { height: 100%; background: rgba(240,240,234,0.25); transition: width 0.4s; }
.group-card--active .group-subj-bar { background: rgba(240,240,234,0.5); }
.group-subj-count { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); width: 24px; }
.group-sections { display: flex; gap: 6px; }
.group-section-tag { font-family: var(--font-mono); font-size: 0.54rem; letter-spacing: 0.08em; padding: 2px 7px; border: 1px solid var(--border); color: var(--dim); }
.group-section-written { color: rgba(255,200,80,0.7); border-color: rgba(255,200,80,0.25); }
.group-section-locked { color: rgba(240,240,234,0.2); border-color: rgba(240,240,234,0.1); }

/* ─── EXPECT PANEL ───────────────────────────────────────────────────────── */
.expect-panel { border: 1px solid var(--border); padding: 20px; margin-bottom: 24px; background: rgba(240,240,234,0.01); }
.expect-header { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); margin-bottom: 14px; }
.expect-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }
.expect-item { background: var(--black); padding: 14px 16px; }
.expect-item--locked { opacity: 0.5; }
.expect-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; color: var(--dim); margin-bottom: 6px; }
.expect-val { font-family: var(--font-mono); font-size: 0.9rem; color: var(--white); margin-bottom: 4px; }
.expect-sub { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }

/* ─── CTA BAR ────────────────────────────────────────────────────────────── */
.cta-bar {
  position: sticky; bottom: 20px; z-index: 30;
  display: flex; align-items: center; justify-content: space-between; gap: 20px;
  background: var(--black); border: 1px solid var(--border-bright);
  padding: 18px 24px; box-shadow: 6px 6px 0 0 rgba(240,240,234,0.05);
  animation: slideUp 0.3s ease;
}
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.cta-name { font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); margin-bottom: 4px; }
.cta-meta { font-family: var(--font-sans); font-size: 0.78rem; color: var(--gray); display: flex; gap: 8px; flex-wrap: wrap; }
.written-note { color: rgba(255,200,80,0.8); font-family: var(--font-mono); font-size: 0.68rem; }
.free-note { color: rgba(120,220,120,0.6); font-family: var(--font-mono); font-size: 0.68rem; }
.cta-right { display: flex; gap: 10px; flex-shrink: 0; }

/* slide-down transition */
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
.fade-expand-enter-active, .fade-expand-leave-active { transition: all 0.3s ease; }
.fade-expand-enter-from, .fade-expand-leave-to { opacity: 0; transform: scaleY(0.95); transform-origin: top; }

/* ─── MODAL BASE ─────────────────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(8,8,8,0.88);
  z-index: 200; display: flex; align-items: center; justify-content: center;
}
.modal {
  position: relative; background: var(--black); border: 1px solid var(--border-bright);
  padding: 36px; max-width: 480px; width: 90%;
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04);
  animation: modalPop 0.25s ease;
}
@keyframes modalPop { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
.modal-corner { position: absolute; width: 12px; height: 12px; }
.modal-corner.tl { top:8px;left:8px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.modal-corner.br { bottom:8px;right:8px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }

/* ─── START MODAL ────────────────────────────────────────────────────────── */
.start-modal-icon { font-size: 2rem; margin-bottom: 10px; }
.start-modal-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.18em; color: var(--white); margin-bottom: 6px; }
.start-modal-exam { font-family: var(--font-mono); font-size: 1rem; color: var(--white); margin-bottom: 22px; }
.start-modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); margin-bottom: 20px; }
.sm-stat { background: var(--black); padding: 14px; text-align: center; }
.sm-val { display: block; font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--white); margin-bottom: 3px; }
.sm-stat span:last-child { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.start-modal-rules { display: flex; flex-direction: column; gap: 8px; margin-bottom: 22px; }
.sm-rule { font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray); padding-left: 2px; }
.sm-rule--written { color: rgba(255,200,80,0.8); font-family: var(--font-mono); font-size: 0.72rem; }
.sm-rule--free { color: rgba(120,220,120,0.7); font-family: var(--font-mono); font-size: 0.72rem; }
.start-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── EXPLANATION BLOCK ──────────────────────────────────────────────────── */
.rc-explanation {
  margin-top: 14px;
  border-top: 1px solid var(--border);
  padding-top: 12px;
}
.rc-explanation-label {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.14em;
  color: rgba(255,200,80,0.7); display: block; margin-bottom: 6px;
  border-left: 2px solid rgba(255,200,80,0.4); padding-left: 8px;
}
.rc-explanation-text {
  font-family: var(--font-sans); font-size: 0.83rem; color: var(--gray);
  line-height: 1.65; margin: 0;
  padding-left: 10px;
  border-left: 2px solid rgba(255,200,80,0.2);
}

/* ─── SCROLLABLE WRITTEN LIST ────────────────────────────────────────────── */
.written-scroll-list {
  padding: 20px 0 80px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.wq-card {
  position: relative; background: var(--black); border: 1px solid var(--border);
  border-left: 3px solid rgba(255,200,80,0.3); padding: 28px;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
  transition: border-left-color 0.2s;
}
.wq-card--answered { border-left-color: rgba(120,220,120,0.5); }
.written-submit-bar { margin-top: 8px; }

/* ─── Q-CARD FOOTER ──────────────────────────────────────────────────────── */
.q-answered-note { font-family: var(--font-mono); font-size: 0.57rem; color: rgba(120,220,120,0.7); }
.q-unanswered-note { font-family: var(--font-mono); font-size: 0.57rem; color: var(--dim); }

/* ─── EXAM TOPBAR ────────────────────────────────────────────────────────── */
.exam-topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 16px;
  background: var(--black); border-bottom: 1px solid var(--border);
  padding: 10px 16px;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.topbar-chip { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.1em; color: var(--white); border: 1px solid var(--border-bright); padding: 3px 10px; }
.topbar-section-badge { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; padding: 2px 8px; border: 1px solid; }
.topbar-section-badge { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.3); }
.topbar-written-badge { color: rgba(255,200,80,0.8) !important; border-color: rgba(255,200,80,0.3) !important; }
.topbar-prog { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.topbar-center { flex: 1; }
.topbar-bar-track { height: 3px; background: rgba(240,240,234,0.08); }
.topbar-bar-fill { height: 100%; background: var(--white); transition: width 0.3s; max-width: 100%; }
.written-fill { background: rgba(255,200,80,0.7); }
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-timer {
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700;
  color: var(--white); padding: 4px 10px; border: 1px solid var(--border);
  display: flex; align-items: center; gap: 6px;
}
.topbar-timer.warning { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); }
.topbar-timer.critical { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.4); animation: blink 0.6s infinite; }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }
.topbar-end-btn { font-size: 0.68rem; padding: 5px 12px; }

/* ─── Q PALETTE ──────────────────────────────────────────────────────────── */
.q-palette-wrap {
  position: sticky; top: 45px; z-index: 40;
  background: var(--black); border-bottom: 1px solid var(--border); padding: 8px 16px;
}
.q-palette { display: flex; flex-wrap: wrap; gap: 4px; max-height: 80px; overflow-y: auto; margin-bottom: 6px; }
.q-dot {
  width: 26px; height: 22px; font-family: var(--font-mono); font-size: 0.55rem;
  border: 1px solid var(--border); background: transparent; color: var(--dim);
  cursor: pointer; transition: all 0.15s; display: flex; align-items: center; justify-content: center;
}
.q-dot:hover { border-color: var(--border-bright); color: var(--white); }
.q-dot.answered { background: rgba(240,240,234,0.08); color: var(--white); border-color: rgba(240,240,234,0.3); }
.q-dot.flagged  { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); }
.q-dot.current  { border-color: var(--white); color: var(--white); font-weight: 700; }
.palette-legend { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); }
.legend-dot { width: 10px; height: 8px; border: 1px solid var(--border); }
.legend-dot.answered { background: rgba(240,240,234,0.1); border-color: rgba(240,240,234,0.3); }
.legend-dot.flagged  { border-color: rgba(255,200,80,0.5); }
.palette-next-hint { font-family: var(--font-mono); font-size: 0.55rem; color: rgba(255,200,80,0.6); margin-left: auto; letter-spacing: 0.06em; }

/* ─── QUESTIONS LIST ─────────────────────────────────────────────────────── */
.questions-list { padding: 16px 0; }
.q-card {
  background: var(--black); border: 1px solid var(--border);
  border-left: 3px solid transparent; margin-bottom: 10px; padding: 20px;
  scroll-margin-top: 140px; transition: border-color 0.2s;
}
.card-answered { border-left-color: rgba(240,240,234,0.4); }
.card-flagged  { border-left-color: rgba(255,200,80,0.6); }
.card-current  { border-left-color: var(--white); }
.q-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.q-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-num { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.06); padding: 2px 8px; border: 1px solid var(--border); }
.q-subject, .q-chapter, .q-year { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 6px; }
.q-diff { font-family: var(--font-mono); font-size: 0.54rem; letter-spacing: 0.08em; padding: 2px 6px; border: 1px solid; }
.diff-easy { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.25); background: rgba(120,220,120,0.04); }
.diff-med  { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25);  background: rgba(255,200,80,0.04); }
.diff-hard { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); background: rgba(255,100,100,0.04); }
.flag-btn { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.06em; border: 1px solid var(--border); background: transparent; color: var(--dim); padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
.flag-btn:hover { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.8); }
.flag-btn.flag-active { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.06); }
.q-text { font-family: var(--font-sans); font-size: 0.95rem; color: var(--white); line-height: 1.65; margin-bottom: 16px; }
.q-options { display: flex; flex-direction: column; gap: 7px; margin-bottom: 12px; }
.q-opt { display: flex; align-items: center; gap: 12px; border: 1px solid var(--border); background: transparent; padding: 10px 14px; cursor: pointer; text-align: left; transition: all 0.15s; width: 100%; }
.q-opt:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.q-opt.opt-selected { border-color: var(--white); background: rgba(240,240,234,0.04); }
.opt-letter { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; width: 22px; height: 22px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--white); flex-shrink: 0; }
.opt-selected .opt-letter { background: var(--white); color: var(--black); border-color: var(--white); }
.opt-text { font-family: var(--font-sans); font-size: 0.85rem; color: var(--white); }
.q-card-footer { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border); padding-top: 10px; }
.neg-reminder { font-family: var(--font-mono); font-size: 0.57rem; color: var(--dim); }
.skip-note { color: rgba(120,220,120,0.6); }
.clear-btn { font-family: var(--font-mono); font-size: 0.6rem; border: 1px solid var(--border); background: transparent; color: var(--dim); padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
.clear-btn:hover { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.7); }

/* ─── SUBMIT BAR ─────────────────────────────────────────────────────────── */
.submit-bar { display: flex; align-items: center; justify-content: space-between; border: 1px solid var(--border-bright); background: rgba(240,240,234,0.02); padding: 18px 22px; margin-top: 16px; box-shadow: 5px 5px 0 0 rgba(240,240,234,0.04); gap: 16px; }
.submit-stats { display: flex; gap: 20px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.submit-stats strong { color: var(--white); }
.submit-actions { display: flex; align-items: center; gap: 14px; }
.submit-written-note { font-family: var(--font-mono); font-size: 0.58rem; color: rgba(255,200,80,0.6); letter-spacing: 0.06em; }

/* ─── END MODAL ──────────────────────────────────────────────────────────── */
.end-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.16em; color: var(--white); margin-bottom: 6px; }
.end-sub   { font-family: var(--font-sans); font-size: 0.9rem; color: var(--gray); margin-bottom: 20px; }
.end-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 16px; }
.end-stat { background: var(--black); padding: 12px; text-align: center; }
.end-val { display: block; font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; margin-bottom: 3px; }
.end-stat span:last-child { font-family: var(--font-sans); font-size: 0.7rem; color: var(--gray); }
.answered-color { color: rgba(120,220,120,0.9); }
.flagged-color  { color: rgba(255,200,80,0.9); }
.skipped-color  { color: var(--gray); }
.end-warn { font-family: var(--font-sans); font-size: 0.78rem; color: rgba(255,200,80,0.8); background: rgba(255,200,80,0.05); border: 1px solid rgba(255,200,80,0.2); padding: 8px 12px; margin-bottom: 10px; }
.end-written-note { font-family: var(--font-sans); font-size: 0.78rem; color: rgba(255,200,80,0.8); padding: 8px 12px; margin-bottom: 10px; border: 1px solid rgba(255,200,80,0.2); background: rgba(255,200,80,0.04); }
.end-neg-note { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); letter-spacing: 0.06em; margin-bottom: 20px; }
.end-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── WRITTEN INTRO ──────────────────────────────────────────────────────── */
.written-intro-phase { display: flex; align-items: center; justify-content: center; min-height: 80vh; padding: 32px; }
.wi-container { max-width: 560px; width: 100%; border: 1px solid var(--border-bright); padding: 40px; box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04); position: relative; }
.wi-icon { font-size: 2.5rem; margin-bottom: 12px; }
.wi-title { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.18em; color: rgba(255,200,80,0.9); margin-bottom: 6px; }
.wi-subtitle { font-family: var(--font-mono); font-size: 1.2rem; color: var(--white); margin-bottom: 28px; }
.wi-meta-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 24px; }
.wi-meta-item { background: var(--black); padding: 14px; text-align: center; }
.wi-meta-val { font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700; color: var(--white); }
.wi-meta-lbl { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.1em; color: var(--dim); margin-top: 4px; }
.wi-rules { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.wi-rule { font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray); padding-left: 4px; }
.wi-question-preview { border: 1px solid var(--border); margin-bottom: 28px; }
.wi-preview-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.12em; color: var(--dim); padding: 8px 12px; border-bottom: 1px solid var(--border); }
.wi-preview-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-bottom: 1px solid var(--border); }
.wi-preview-item:last-child { border-bottom: none; }
.wi-preview-num { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); border: 1px solid var(--border); padding: 2px 8px; background: rgba(240,240,234,0.05); }
.wi-preview-subj { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); border: 1px solid var(--border); padding: 2px 7px; }
.wi-preview-type { font-family: var(--font-mono); font-size: 0.56rem; padding: 2px 7px; border: 1px solid; }
.type-creative { color: rgba(255,200,80,0.8); border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.04); }
.type-short    { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.3); background: rgba(120,220,120,0.04); }
.wi-preview-marks { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); margin-left: auto; }
.wi-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── WRITTEN PHASE ──────────────────────────────────────────────────────── */
.written-phase { }
.wq-card-corner { position: absolute; width: 10px; height: 10px; }
.wq-card-corner.tl { top:6px;left:6px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.wq-card-corner.br { bottom:6px;right:6px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.wq-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.wq-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.wq-num { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.06); padding: 2px 8px; border: 1px solid var(--border); }
.wq-subject, .wq-chapter, .wq-year { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 6px; }
.wq-marks-badge { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700; color: rgba(255,200,80,0.9); border: 1px solid rgba(255,200,80,0.3); padding: 3px 10px; background: rgba(255,200,80,0.05); flex-shrink: 0; }
.wq-text { font-family: var(--font-sans); font-size: 0.95rem; color: var(--white); line-height: 1.7; margin-bottom: 22px; white-space: pre-line; }

.wq-answer-section { margin-bottom: 22px; }
.wq-answer-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); display: block; margin-bottom: 8px; }
.wq-textarea {
  width: 100%; font-family: var(--font-sans); font-size: 0.9rem; color: var(--white);
  background: rgba(240,240,234,0.02); border: 1px solid var(--border);
  padding: 14px 16px; resize: vertical; outline: none;
  transition: border-color 0.2s; line-height: 1.6; min-height: 180px;
}
.wq-textarea:focus { border-color: rgba(255,200,80,0.4); background: rgba(240,240,234,0.03); }
.wq-char-count { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); text-align: right; margin-top: 4px; }

.wq-image-section { margin-bottom: 24px; }
.wq-image-label { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; }
.wq-image-label span:first-child { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; color: var(--dim); }
.wq-image-hint { font-family: var(--font-sans); font-size: 0.7rem; color: var(--dim); }
.wq-image-dropzone {
  border: 1px dashed rgba(240,240,234,0.15); padding: 28px; text-align: center;
  cursor: pointer; transition: all 0.2s; background: rgba(240,240,234,0.01);
}
.wq-image-dropzone:hover { border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.02); }
.wq-dropzone-icon { font-size: 1.5rem; margin-bottom: 8px; }
.wq-dropzone-text { font-family: var(--font-mono); font-size: 0.68rem; color: var(--white); margin-bottom: 4px; }
.wq-dropzone-hint { font-family: var(--font-sans); font-size: 0.7rem; color: var(--dim); }
.wq-image-preview { position: relative; }
.wq-preview-img { max-width: 100%; max-height: 300px; display: block; border: 1px solid var(--border); }
.wq-remove-image { position: absolute; top: 8px; right: 8px; font-family: var(--font-mono); font-size: 0.6rem; background: rgba(8,8,8,0.9); border: 1px solid var(--border-bright); color: var(--white); padding: 4px 10px; cursor: pointer; transition: all 0.15s; }
.wq-remove-image:hover { background: rgba(255,100,100,0.15); border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }

/* ─── RESULTS PHASE ──────────────────────────────────────────────────────── */
.score-hero {
  position: relative; display: flex; gap: 32px; align-items: flex-start;
  border: 1px solid var(--border-bright); background: rgba(240,240,234,0.02);
  padding: 32px; margin-bottom: 28px; box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04);
}
.score-hero-corner { position: absolute; width: 14px; height: 14px; }
.score-hero-corner.tl { top:8px;left:8px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.score-hero-corner.br { bottom:8px;right:8px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.score-hero-left { flex: 1; }
.score-exam-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); margin-bottom: 8px; }
.score-badge-row { display: flex; gap: 6px; margin-bottom: 10px; }
.score-section-tag { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.1em; padding: 2px 8px; border: 1px solid rgba(120,220,120,0.3); color: rgba(120,220,120,0.8); background: rgba(120,220,120,0.04); }
.score-section-written { color: rgba(255,200,80,0.8); border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.04); }
.score-pct { font-family: var(--font-mono); font-size: 4rem; font-weight: 700; line-height: 1; margin-bottom: 10px; }
.score-pct-sym { font-size: 2rem; }
.grade-high { color: rgba(120,220,120,0.95); }
.grade-mid  { color: rgba(255,200,80,0.95); }
.grade-low  { color: rgba(255,150,80,0.95); }
.grade-fail { color: rgba(255,100,100,0.95); }
.score-raw { font-family: var(--font-mono); font-size: 0.78rem; color: var(--gray); margin-bottom: 6px; }
.score-raw strong { color: var(--white); }
.score-calc { margin-bottom: 14px; }
.score-calc-text { font-family: var(--font-mono); font-size: 0.64rem; color: var(--dim); border: 1px solid var(--border); padding: 4px 10px; display: inline-block; }
.score-status { font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.1em; padding: 6px 14px; display: inline-block; }
.status-pass { color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3); background: rgba(120,220,120,0.06); }
.status-fail { color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.06); }
.score-hero-right { text-align: center; min-width: 200px; }
.grade-badge { font-family: var(--font-mono); font-size: 4rem; font-weight: 700; line-height: 1; margin-bottom: 4px; }
.grade-label { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); margin-bottom: 18px; }
.score-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); }
.smc { background: var(--black); padding: 12px 8px; }
.smc-val { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.smc-lbl { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); letter-spacing: 0.08em; margin-bottom: 3px; }
.smc-mark { font-family: var(--font-mono); font-size: 0.62rem; }
.correct-card .smc-val { color: rgba(120,220,120,0.9); }
.correct-mark { color: rgba(120,220,120,0.7); }
.wrong-card .smc-val { color: rgba(255,100,100,0.9); }
.wrong-mark { color: rgba(255,100,100,0.7); }
.skipped-card .smc-val { color: var(--gray); }

/* ─── SUBJECT BREAKDOWN ──────────────────────────────────────────────────── */
.section-title-label {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.14em; color: var(--dim);
}
.sb-section-header {
  display: flex; align-items: baseline; justify-content: space-between;
  flex-wrap: wrap; gap: 8px; margin-bottom: 16px;
}
.sb-filter-hint {
  font-family: var(--font-mono); font-size: 0.57rem;
  letter-spacing: 0.05em; color: var(--dim);
}
.sb-filter-active-hint { color: rgba(255,200,80,0.8); }
.sb-filter-active-hint strong { color: rgba(255,200,80,0.95); }

.subject-breakdown-grid {
  display: grid; grid-template-columns: repeat(auto-fill,minmax(180px,1fr));
  gap: 1px; background: var(--border); margin-bottom: 24px;
}
.sb-card {
  background: var(--black); padding: 14px 16px;
  cursor: pointer;
  border: 1px solid transparent; border-left: 2px solid transparent;
  transition: all 0.15s;
}
.sb-card:hover { border-left-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.sb-card--active { border-left-color: rgba(255,200,80,0.8) !important; background: rgba(255,200,80,0.04) !important; }
.sb-card--dim { opacity: 0.38; }

.sb-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; margin-bottom: 8px; }
.sb-name { font-family: var(--font-mono); font-size: 0.65rem; color: var(--white); }
.sb-card--active .sb-name { color: rgba(255,200,80,0.95); }

.sb-tab-count {
  font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700;
  color: var(--white); text-align: right; line-height: 1;
}
.sb-tab-label {
  display: block; font-size: 0.48rem; color: var(--dim);
  font-weight: 400; letter-spacing: 0.08em; text-align: right; margin-top: 2px;
}
.sb-tab-correct .sb-tab-count { color: rgba(120,220,120,0.9); }
.sb-tab-wrong   .sb-tab-count { color: rgba(255,100,100,0.9); }
.sb-tab-skipped .sb-tab-count { color: var(--gray); }

.sb-stats-row { display: flex; gap: 8px; margin-bottom: 8px; align-items: center; }
.sb-stat { font-family: var(--font-mono); font-size: 0.58rem; }
.sb-stat.correct { color: rgba(120,220,120,0.8); }
.sb-stat.wrong   { color: rgba(255,100,100,0.8); }
.sb-stat.skip    { color: var(--dim); }

.sb-bar-track { height: 3px; background: rgba(240,240,234,0.06); margin-bottom: 8px; }
.sb-bar-fill { height: 100%; transition: width 0.5s; }
.sb-high-fill { background: rgba(120,220,120,0.5); }
.sb-mid-fill  { background: rgba(255,200,80,0.5); }
.sb-low-fill  { background: rgba(255,100,100,0.5); }
.sb-high { color: rgba(120,220,120,0.9); }
.sb-mid  { color: rgba(255,200,80,0.9); }
.sb-low  { color: rgba(255,100,100,0.9); }

.sb-card-footer { display: flex; align-items: center; justify-content: space-between; }
.sb-pct { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }
.sb-filter-cta {
  font-family: var(--font-mono); font-size: 0.52rem;
  letter-spacing: 0.08em; color: var(--dim); transition: color 0.15s;
}
.sb-card:hover .sb-filter-cta { color: var(--border-bright); }
.sb-card--active .sb-filter-cta { color: rgba(255,200,80,0.7); }

/* ─── WRITTEN SUMMARY ────────────────────────────────────────────────────── */
.written-summary { border: 1px solid rgba(255,200,80,0.2); padding: 20px; margin-bottom: 28px; background: rgba(255,200,80,0.02); }
.ws-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(280px,1fr)); gap: 1px; background: rgba(255,200,80,0.1); }
.ws-card { background: var(--black); padding: 16px; }
.ws-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; flex-wrap: wrap; }
.ws-qnum { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.06); padding: 2px 7px; border: 1px solid var(--border); }
.ws-subj { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 6px; }
.ws-marks { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,200,80,0.8); border: 1px solid rgba(255,200,80,0.25); padding: 2px 6px; margin-left: auto; }
.ws-answer-preview { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); line-height: 1.5; margin-bottom: 8px; }
.ws-has-image { font-family: var(--font-mono); font-size: 0.56rem; color: rgba(120,220,120,0.7); }
.ws-no-image  { font-family: var(--font-mono); font-size: 0.56rem; color: var(--dim); }

/* ─── MCQ REVIEW ─────────────────────────────────────────────────────────── */
.review-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; margin-top: 28px; }
.review-header-left { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.review-subject-chip {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.57rem; letter-spacing: 0.08em;
  color: rgba(255,200,80,0.9);
  border: 1px solid rgba(255,200,80,0.35); background: rgba(255,200,80,0.06);
  padding: 2px 8px; margin-left: 8px; vertical-align: middle;
}
.review-clear-subj {
  background: none; border: none;
  color: rgba(255,200,80,0.7); cursor: pointer;
  font-size: 0.78rem; padding: 0; line-height: 1; transition: color 0.15s;
}
.review-clear-subj:hover { color: rgba(255,100,100,0.8); }
.review-tabs { display: flex; gap: 1px; background: var(--border); }
.rev-tab { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; padding: 6px 14px; background: var(--black); border: none; color: var(--dim); cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; }
.rev-tab:hover { color: var(--white); }
.rev-tab.active { color: var(--white); background: rgba(240,240,234,0.05); }
.rev-count { font-size: 0.55rem; background: rgba(240,240,234,0.08); padding: 1px 5px; }
.review-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
.rc-card { border: 1px solid var(--border); border-left: 3px solid var(--border); padding: 18px; background: var(--black); }
.rc-correct { border-left-color: rgba(120,220,120,0.5); }
.rc-wrong   { border-left-color: rgba(255,100,100,0.5); }
.rc-skipped { border-left-color: var(--border); }
.rc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 10px; }
.rc-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.rc-qnum { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); background: rgba(240,240,234,0.05); padding: 2px 7px; border: 1px solid var(--border); }
.rc-subj, .rc-chapter { font-family: var(--font-mono); font-size: 0.54rem; color: var(--dim); border: 1px solid var(--border); padding: 2px 5px; }
.rc-diff { font-family: var(--font-mono); font-size: 0.52rem; padding: 2px 5px; border: 1px solid; }
.rc-result-badge {}
.rc-badge { font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700; padding: 3px 8px; border: 1px solid; }
.rc-badge-correct { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); background: rgba(120,220,120,0.05); }
.rc-badge-wrong   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.05); }
.rc-badge-skip    { color: var(--dim); border-color: var(--border); }
.rc-question { font-family: var(--font-sans); font-size: 0.88rem; color: var(--white); line-height: 1.6; margin-bottom: 12px; }
.rc-options { display: flex; flex-direction: column; gap: 5px; margin-bottom: 4px; }
.rc-opt { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); }
.rc-opt.rc-correct { border-color: rgba(120,220,120,0.4); background: rgba(120,220,120,0.04); }
.rc-opt.rc-wrong   { border-color: rgba(255,100,100,0.4); background: rgba(255,100,100,0.04); }
.rc-opt-letter { font-family: var(--font-mono); font-size: 0.6rem; width: 20px; height: 20px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--white); flex-shrink: 0; }
.rc-opt.rc-correct .rc-opt-letter { background: rgba(120,220,120,0.25); border-color: rgba(120,220,120,0.5); }
.rc-opt.rc-wrong   .rc-opt-letter { background: rgba(255,100,100,0.25); border-color: rgba(255,100,100,0.5); }
.rc-opt-text { font-family: var(--font-sans); font-size: 0.82rem; color: var(--white); flex: 1; }
.rc-tag-correct, .rc-tag-wrong { font-family: var(--font-mono); font-size: 0.54rem; padding: 2px 5px; border: 1px solid; flex-shrink: 0; }
.rc-tag-correct { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.rc-tag-wrong   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); }
.rc-skipped-note { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); border-top: 1px solid var(--border); padding-top: 8px; margin-top: 8px; }

/* Explanation — always visible, admission-exam style */
.rc-explanation {
  display: flex; flex-direction: column; gap: 5px;
  margin-top: 4px; padding-top: 12px; border-top: 1px solid var(--border);
}
.exp-label {
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.18em; color: var(--gray);
}
.exp-text {
  font-family: var(--font-sans); font-size: 0.8rem;
  color: var(--dim); line-height: 1.65;
}

/* ─── RESULTS ACTIONS ────────────────────────────────────────────────────── */
.results-actions { display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid var(--border); padding-top: 24px; flex-wrap: wrap; }

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .exam-page { padding: 24px 16px 80px; }
  .page-header { flex-direction: column; gap: 16px; }
  .tier-badge { max-width: 100%; width: 100%; }
  .type-grid { grid-template-columns: 1fr; }
  .group-grid { grid-template-columns: 1fr; }
  .cta-bar { flex-direction: column; align-items: stretch; gap: 12px; bottom: 0; left: 0; right: 0; border-left: none; border-right: none; border-bottom: none; padding: 16px; }
  .cta-right { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .score-hero { flex-direction: column; gap: 24px; padding: 22px; }
  .score-hero-right { min-width: unset; width: 100%; }
  .expect-grid { grid-template-columns: 1fr; }
  .wi-meta-grid { grid-template-columns: repeat(3,1fr); }
}

@media (max-width: 600px) {
  .exam-page { padding: 12px 10px 90px; }
  .page-title { font-size: 1.5rem; }
  .tier-badge { flex-wrap: wrap; gap: 8px; }
  .type-grid, .group-grid { grid-template-columns: 1fr; }
  .exam-topbar { flex-wrap: wrap; gap: 8px; padding: 8px 10px; }
  .topbar-center { order: 3; width: 100%; flex: unset; }
  .topbar-left { gap: 6px; flex-wrap: wrap; }
  .q-palette-wrap { padding: 6px 10px; }
  .q-palette { gap: 3px; max-height: 64px; }
  .q-dot { width: 22px; height: 18px; font-size: 0.5rem; }
  .q-card { padding: 14px 12px; scroll-margin-top: 160px; }
  .q-card-header { flex-direction: column; gap: 8px; align-items: flex-start; }
  .q-opt { padding: 8px 10px; }
  .submit-bar { flex-direction: column; align-items: stretch; gap: 12px; padding: 14px; }
  .submit-stats { flex-wrap: wrap; gap: 10px; }
  .submit-actions { flex-direction: column; }
  .submit-actions .iso-btn { width: 100%; justify-content: center; }
  .score-hero { padding: 16px; }
  .score-pct { font-size: 2.8rem; }
  .review-header { flex-direction: column; align-items: flex-start; }
  .review-tabs { width: 100%; display: grid; grid-template-columns: repeat(4,1fr); }
  .rev-tab { justify-content: center; font-size: 0.52rem; padding: 6px 2px; }
  .results-actions { flex-direction: column; gap: 8px; }
  .results-actions .iso-btn { width: 100%; justify-content: center; }
  .cta-right { grid-template-columns: 1fr 1fr; gap: 6px; }
  .wi-container { padding: 24px 18px; }
  .subject-breakdown-grid { grid-template-columns: repeat(2,1fr); }
  .wq-card { padding: 18px 14px; }
  .end-modal .end-actions { flex-direction: column; }
  .end-modal .end-actions .iso-btn { width: 100%; justify-content: center; }
  .start-modal-actions { flex-direction: column; gap: 8px; }
  .start-modal-actions .iso-btn { width: 100%; justify-content: center; }
}
</style>
