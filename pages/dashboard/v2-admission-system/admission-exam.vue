<script setup>
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
const questionBank = {
  medical: {
    biology: [
      { id: 'm-bio-1', text: 'Which of the following is NOT a function of the liver?', options: ['Bile secretion', 'Insulin production', 'Glycogen storage', 'Detoxification'], answer: 1, chapter: 'Digestive System', year: '2023', difficulty: 'medium' },
      { id: 'm-bio-2', text: 'The site of fertilization in the human female reproductive system is:', options: ['Uterus', 'Ovary', 'Fallopian tube', 'Cervix'], answer: 2, chapter: 'Reproduction', year: '2022', difficulty: 'easy' },
      { id: 'm-bio-3', text: 'Which blood group is known as the "universal donor"?', options: ['A+', 'B+', 'O−', 'AB+'], answer: 2, chapter: 'Circulatory System', year: '2023', difficulty: 'easy' },
      { id: 'm-bio-4', text: 'The functional unit of the kidney is:', options: ['Glomerulus', 'Nephron', 'Bowman\'s capsule', 'Loop of Henle'], answer: 1, chapter: 'Excretion', year: '2022', difficulty: 'easy' },
      { id: 'm-bio-5', text: 'Myelin sheath is produced by which cells in the peripheral nervous system?', options: ['Astrocytes', 'Schwann cells', 'Oligodendrocytes', 'Microglia'], answer: 1, chapter: 'Nervous System', year: '2021', difficulty: 'hard' },
      { id: 'm-bio-6', text: 'During aerobic respiration, the net gain of ATP from one molecule of glucose is:', options: ['2 ATP', '4 ATP', '36-38 ATP', '24 ATP'], answer: 2, chapter: 'Cell Biology', year: '2023', difficulty: 'medium' },
      { id: 'm-bio-7', text: 'Which hormone is responsible for the "fight or flight" response?', options: ['Cortisol', 'Adrenaline (Epinephrine)', 'Thyroxine', 'Insulin'], answer: 1, chapter: 'Endocrine System', year: '2022', difficulty: 'easy' },
      { id: 'm-bio-8', text: 'The process by which plants make their own food is called:', options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Fermentation'], answer: 2, chapter: 'Plant Biology', year: '2023', difficulty: 'easy' },
    ],
    chemistry: [
      { id: 'm-chem-1', text: 'The pH of blood is maintained at approximately:', options: ['6.4–6.8', '7.35–7.45', '7.8–8.0', '6.0–7.0'], answer: 1, chapter: 'Acids & Bases', year: '2023', difficulty: 'medium' },
      { id: 'm-chem-2', text: 'Which of the following is an example of a noble gas?', options: ['Fluorine', 'Nitrogen', 'Argon', 'Chlorine'], answer: 2, chapter: 'Periodic Table', year: '2022', difficulty: 'easy' },
      { id: 'm-chem-3', text: 'Haemoglobin contains which metal ion?', options: ['Zinc (Zn²⁺)', 'Copper (Cu²⁺)', 'Iron (Fe²⁺)', 'Magnesium (Mg²⁺)'], answer: 2, chapter: 'Coordination Chemistry', year: '2023', difficulty: 'easy' },
      { id: 'm-chem-4', text: 'The hybridization of carbon in methane (CH₄) is:', options: ['sp', 'sp²', 'sp³', 'sp³d'], answer: 2, chapter: 'Organic Chemistry', year: '2021', difficulty: 'medium' },
    ],
    physics: [
      { id: 'm-phy-1', text: 'Which principle explains why blood pressure is measured in mmHg?', options: ['Archimedes\' Principle', 'Pascal\'s Law', 'Bernoulli\'s Principle', 'Boyle\'s Law'], answer: 1, chapter: 'Fluid Mechanics', year: '2023', difficulty: 'hard' },
      { id: 'm-phy-2', text: 'The unit of electric potential difference is:', options: ['Ampere', 'Ohm', 'Volt', 'Watt'], answer: 2, chapter: 'Electricity', year: '2022', difficulty: 'easy' },
      { id: 'm-phy-3', text: 'X-rays are part of which spectrum?', options: ['Sound waves', 'Electromagnetic spectrum', 'Mechanical waves', 'Matter waves'], answer: 1, chapter: 'Modern Physics', year: '2023', difficulty: 'easy' },
    ],
  },
  varsity: {
    bangla: [
      { id: 'v-ban-1', text: '"আমার সোনার বাংলা" কবিতাটি কে রচনা করেছেন?', options: ['কাজী নজরুল ইসলাম', 'রবীন্দ্রনাথ ঠাকুর', 'জীবনানন্দ দাশ', 'মাইকেল মধুসূদন দত্ত'], answer: 1, chapter: 'বাংলা সাহিত্য', year: '2023', difficulty: 'easy' },
      { id: 'v-ban-2', text: '"বিদ্রোহী" কবিতাটি কোন কবির রচনা?', options: ['রবীন্দ্রনাথ ঠাকুর', 'শামসুর রাহমান', 'কাজী নজরুল ইসলাম', 'সুফিয়া কামাল'], answer: 2, chapter: 'বাংলা কবিতা', year: '2022', difficulty: 'easy' },
      { id: 'v-ban-3', text: 'বাংলা ব্যাকরণ অনুযায়ী "সন্ধি" কত প্রকার?', options: ['২ প্রকার', '৩ প্রকার', '৪ প্রকার', '৫ প্রকার'], answer: 1, chapter: 'বাংলা ব্যাকরণ', year: '2023', difficulty: 'medium' },
      { id: 'v-ban-4', text: '"পদ্মা নদীর মাঝি" উপন্যাসটির রচয়িতা কে?', options: ['শরৎচন্দ্র চট্টোপাধ্যায়', 'রবীন্দ্রনাথ ঠাকুর', 'মানিক বন্দ্যোপাধ্যায়', 'বঙ্কিমচন্দ্র চট্টোপাধ্যায়'], answer: 2, chapter: 'বাংলা উপন্যাস', year: '2022', difficulty: 'easy' },
    ],
    english: [
      { id: 'v-eng-1', text: 'Choose the correct passive form of: "The teacher teaches the students."', options: ['The students are taught by the teacher.', 'The students were taught by the teacher.', 'The students have been taught by the teacher.', 'The students is taught by the teacher.'], answer: 0, chapter: 'Grammar', year: '2023', difficulty: 'medium' },
      { id: 'v-eng-2', text: 'What is the synonym of "Eloquent"?', options: ['Silent', 'Fluent', 'Dull', 'Harsh'], answer: 1, chapter: 'Vocabulary', year: '2022', difficulty: 'medium' },
      { id: 'v-eng-3', text: 'Which of the following is a correct sentence?', options: ['She don\'t know the answer.', 'She doesn\'t knows the answer.', 'She doesn\'t know the answer.', 'She not know the answer.'], answer: 2, chapter: 'Grammar', year: '2023', difficulty: 'easy' },
    ],
    math: [
      { id: 'v-math-1', text: 'If log₂8 = x, what is the value of x?', options: ['2', '3', '4', '6'], answer: 1, chapter: 'Logarithm', year: '2023', difficulty: 'easy' },
      { id: 'v-math-2', text: 'The roots of the equation x² − 5x + 6 = 0 are:', options: ['2 and 3', '1 and 6', '−2 and −3', '2 and −3'], answer: 0, chapter: 'Algebra', year: '2022', difficulty: 'easy' },
      { id: 'v-math-3', text: 'The value of sin²θ + cos²θ is always equal to:', options: ['0', '2', '1', 'Depends on θ'], answer: 2, chapter: 'Trigonometry', year: '2023', difficulty: 'easy' },
      { id: 'v-math-4', text: 'What is the derivative of f(x) = x³ + 2x² − 5?', options: ['3x² + 4x', '3x² + 4x − 5', 'x² + 4x', '3x + 4'], answer: 0, chapter: 'Calculus', year: '2022', difficulty: 'medium' },
    ],
    ict: [
      { id: 'v-ict-1', text: 'Which of the following is NOT a programming language?', options: ['Python', 'HTML', 'Java', 'C++'], answer: 1, chapter: 'Programming', year: '2023', difficulty: 'easy' },
      { id: 'v-ict-2', text: 'The binary equivalent of decimal number 10 is:', options: ['1010', '1100', '1001', '0110'], answer: 0, chapter: 'Number System', year: '2022', difficulty: 'medium' },
    ],
    general_knowledge: [
      { id: 'v-gk-1', text: 'Bangladesh gained independence in which year?', options: ['1947', '1952', '1971', '1975'], answer: 2, chapter: 'Bangladesh Affairs', year: '2023', difficulty: 'easy' },
      { id: 'v-gk-2', text: 'The capital of Australia is:', options: ['Sydney', 'Melbourne', 'Canberra', 'Brisbane'], answer: 2, chapter: 'World Geography', year: '2022', difficulty: 'medium' },
    ],
  }
}

// ─── EXAM CONFIGURATIONS ────────────────────────────────────────────────────
const examConfigs = {
  mbbs: {
    label: 'MBBS', fullLabel: 'MBBS Admission', icon: '🩺',
    authority: 'DGHS Bangladesh', color: 'rgba(120,220,120,0.12)',
    totalQuestions: 100, duration: 60,
    subjects: { biology: 30, chemistry: 25, physics: 20, english: 15, general_knowledge: 10 },
    subjectLabels: { biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', english: 'English', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Medical & Dental Colleges under DGHS'
  },
  bds: {
    label: 'BDS', fullLabel: 'BDS Admission', icon: '🦷',
    authority: 'DGHS Bangladesh', color: 'rgba(120,220,120,0.12)',
    totalQuestions: 100, duration: 60,
    subjects: { biology: 30, chemistry: 25, physics: 20, english: 15, general_knowledge: 10 },
    subjectLabels: { biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', english: 'English', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Bachelor of Dental Surgery Admissions'
  },
  afmc: {
    label: 'AFMC', fullLabel: 'Armed Forces Medical', icon: '⭐',
    authority: 'Bangladesh Army', color: 'rgba(120,220,120,0.12)',
    totalQuestions: 100, duration: 90,
    subjects: { biology: 25, chemistry: 25, physics: 25, english: 15, general_knowledge: 10 },
    subjectLabels: { biology: 'Biology', chemistry: 'Chemistry', physics: 'Physics', english: 'English', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 50, description: 'Armed Forces Medical College, Dhaka'
  },
  du: {
    label: 'DU', fullLabel: 'Dhaka University', icon: '🏛️',
    authority: 'University of Dhaka', color: 'rgba(255,200,80,0.10)',
    duration: 60, negativeMarking: 0.25, passScore: 40,
    requiresUnit: true,
    description: 'University of Dhaka – Select your unit below',
    units: [
      {
        key: 'ka', label: 'Ka Unit', sublabel: 'Science',
        totalQuestions: 100,
        subjects: { physics: 30, chemistry: 25, math: 25, biology: 10, english: 10 },
        subjectLabels: { physics: 'Physics', chemistry: 'Chemistry', math: 'Math', biology: 'Biology', english: 'English' },
      },
      {
        key: 'kha', label: 'Kha Unit', sublabel: 'Humanities',
        totalQuestions: 100,
        subjects: { bangla: 35, english: 35, general_knowledge: 30 },
        subjectLabels: { bangla: 'বাংলা', english: 'English', general_knowledge: 'GK' },
      },
      {
        key: 'ga', label: 'Ga Unit', sublabel: 'Commerce',
        totalQuestions: 100,
        subjects: { bangla: 20, english: 20, math: 30, general_knowledge: 30 },
        subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', general_knowledge: 'GK' },
      },
      {
        key: 'gha', label: 'Gha Unit', sublabel: 'Fine Arts',
        totalQuestions: 100,
        subjects: { bangla: 30, english: 30, general_knowledge: 40 },
        subjectLabels: { bangla: 'বাংলা', english: 'English', general_knowledge: 'GK' },
      },
    ],
    // fallback for display before unit is chosen
    subjects: { bangla: 25, english: 25, math: 25, general_knowledge: 25 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', general_knowledge: 'GK' },
    totalQuestions: 100,
  },
  cu: {
    label: 'CU', fullLabel: 'Chittagong University', icon: '🏔️',
    authority: 'University of Chittagong', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'University of Chittagong'
  },
  ju: {
    label: 'JU', fullLabel: 'Jahangirnagar University', icon: '🌿',
    authority: 'Jahangirnagar University', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Jahangirnagar University, Savar'
  },
  ru: {
    label: 'RU', fullLabel: 'Rajshahi University', icon: '🏫',
    authority: 'University of Rajshahi', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'University of Rajshahi'
  },
  ku: {
    label: 'KU', fullLabel: 'Khulna University', icon: '🌊',
    authority: 'Khulna University', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 20, english: 20, math: 20, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Khulna University'
  },
  sust: {
    label: 'SUST', fullLabel: 'Shahjalal Uni. of Sci. & Tech.', icon: '🔬',
    authority: 'SUST Sylhet', color: 'rgba(255,200,80,0.10)',
    totalQuestions: 80, duration: 60,
    subjects: { bangla: 15, english: 20, math: 25, ict: 10, general_knowledge: 10 },
    subjectLabels: { bangla: 'বাংলা', english: 'English', math: 'Math', ict: 'ICT', general_knowledge: 'GK' },
    negativeMarking: 0.25, passScore: 40, description: 'Shahjalal University of Science & Technology'
  },
}

// ─── STATE ───────────────────────────────────────────────────────────────────
const phase = ref('setup')           // 'setup' | 'exam' | 'results'
const selectedExam = ref(null)       // key of examConfigs
const selectedUnit = ref('')
const questions = ref([])
const answers = ref({})              // { questionId: optionIndex }
const flagged = ref(new Set())
const currentIdx = ref(0)
const timeLeft = ref(0)
const timerInterval = ref(null)
const showEndModal = ref(false)
const showNegativeWarning = ref(false)
const filterTab = ref('all')         // results filter

// ─── COMPUTED ────────────────────────────────────────────────────────────────
const config = computed(() => selectedExam.value ? examConfigs[selectedExam.value] : null)

// For DU: the currently selected unit object (or null)
const activeUnitConfig = computed(() => {
  if (!config.value?.requiresUnit || !selectedUnit.value) return null
  return config.value.units.find(u => u.key === selectedUnit.value) || null
})

// Subjects/labels/total to actually use — reactive to unit selection
const activeSubjects = computed(() => {
  if (activeUnitConfig.value) return activeUnitConfig.value.subjects
  return config.value?.subjects || {}
})
const activeSubjectLabels = computed(() => {
  if (activeUnitConfig.value) return activeUnitConfig.value.subjectLabels
  return config.value?.subjectLabels || {}
})
const activeTotalQuestions = computed(() => {
  if (activeUnitConfig.value) return activeUnitConfig.value.totalQuestions
  return config.value?.totalQuestions || 0
})

// Can the user start? DU requires a unit to be picked first
const canStart = computed(() => {
  if (!selectedExam.value) return false
  if (config.value?.requiresUnit && !selectedUnit.value) return false
  return true
})

const timerClass = computed(() => {
  if (!timeLeft.value) return ''
  if (timeLeft.value <= 30) return 'critical'
  if (timeLeft.value <= 120) return 'warning'
  return ''
})

const timerDisplay = computed(() => {
  const t = timeLeft.value
  const m = Math.floor(t / 60).toString().padStart(2, '0')
  const s = (t % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const answeredCount = computed(() => Object.keys(answers.value).length)
const flaggedCount = computed(() => flagged.value.size)
const progressPct = computed(() => questions.value.length ? (answeredCount.value / questions.value.length) * 100 : 0)

// Score calculation with negative marking
const scoreData = computed(() => {
  if (!config.value) return {}
  let correct = 0, wrong = 0, skipped = 0
  questions.value.forEach(q => {
    if (answers.value[q.id] === undefined) { skipped++ }
    else if (answers.value[q.id] === q.answer) { correct++ }
    else { wrong++ }
  })
  const raw = correct - (wrong * config.value.negativeMarking)
  const total = questions.value.length
  const pct = total ? Math.max(0, (raw / total) * 100) : 0
  return { correct, wrong, skipped, raw: Math.max(0, raw).toFixed(2), total, pct: pct.toFixed(1) }
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
  if (filterTab.value === 'correct') return questions.value.filter(q => answers.value[q.id] === q.answer)
  if (filterTab.value === 'wrong') return questions.value.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer)
  if (filterTab.value === 'skipped') return questions.value.filter(q => answers.value[q.id] === undefined)
  return questions.value
})

// Subject breakdown for results
const subjectBreakdown = computed(() => {
  if (!config.value) return []
  const labels = activeSubjectLabels.value
  return Object.keys(activeSubjects.value).map(subj => {
    const qs = questions.value.filter(q => q.subject === subj)
    const correct = qs.filter(q => answers.value[q.id] === q.answer).length
    const wrong = qs.filter(q => answers.value[q.id] !== undefined && answers.value[q.id] !== q.answer).length
    const total = qs.length
    const pct = total ? ((correct - wrong * 0.25) / total * 100).toFixed(1) : 0
    return { subj, label: labels[subj] || subj, correct, wrong, skipped: total - correct - wrong, total, pct }
  })
})

// ─── EXAM LOGIC ─────────────────────────────────────────────────────────────
function selectExam(key) {
  selectedExam.value = key
  selectedUnit.value = ''
}

function buildQuestions() {
  const bank = selectedExam.value.startsWith('m') || selectedExam.value === 'afmc' ? questionBank.medical : questionBank.varsity
  // Use activeSubjects — for DU this is already the unit-specific map
  const subjectsToUse = activeSubjects.value
  const pool = []
  Object.keys(subjectsToUse).forEach(subj => {
    const needed = subjectsToUse[subj]
    const available = bank[subj] || []
    const tagged = available.map(q => ({ ...q, subject: subj }))
    const shuffled = [...tagged].sort(() => Math.random() - 0.5)
    pool.push(...shuffled.slice(0, needed))
  })
  questions.value = pool.sort(() => Math.random() - 0.5)
}

function startExam() {
  showNegativeWarning.value = false
  buildQuestions()
  answers.value = {}
  flagged.value = new Set()
  currentIdx.value = 0
  timeLeft.value = config.value.duration * 60
  phase.value = 'exam'
  nextTick(() => setupObserver())
  startTimer()
}

function startTimer() {
  clearInterval(timerInterval.value)
  timerInterval.value = setInterval(() => {
    if (timeLeft.value <= 0) { submitExam(); return }
    timeLeft.value--
  }, 1000)
}

function stopTimer() { clearInterval(timerInterval.value) }

function submitExam() {
  stopTimer()
  showEndModal.value = false
  phase.value = 'results'
  filterTab.value = 'all'
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

// IntersectionObserver
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

function resetToSetup() {
  stopTimer()
  phase.value = 'setup'
  selectedExam.value = null
  selectedUnit.value = ''
  questions.value = []
  answers.value = {}
  flagged.value = new Set()
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const medicalExams = ['mbbs', 'bds', 'afmc']
const varsityExams = ['du', 'cu', 'ju', 'ru', 'ku', 'sust']

function diffClass(d) {
  if (d === 'easy') return 'diff-easy'
  if (d === 'hard') return 'diff-hard'
  return 'diff-med'
}

function optClass(q, idx) {
  if (answers.value[q.id] === undefined) return ''
  if (idx === q.answer) return 'opt-correct'
  if (answers.value[q.id] === idx) return 'opt-wrong'
  return ''
}

function reviewOptClass(q, idx) {
  if (idx === q.answer) return 'rc-correct'
  if (answers.value[q.id] === idx && idx !== q.answer) return 'rc-wrong'
  return ''
}

const pct = (v) => `${v}%`
</script>

<template>
  <div class="admission-page">

    <!-- ══════════════════ SETUP PHASE ══════════════════ -->
    <div v-if="phase === 'setup'" class="setup-phase">

      <!-- Page Header -->
      <div class="page-header">
        <div class="page-header-left">
          <span class="page-chip">
            <span class="chip-dot"></span>
            ADMISSION EXAM
          </span>
          <h1 class="page-title">Admission <span class="text-outline">Mock Tests</span></h1>
          <p class="page-desc">Full-length mock exams for Medical & University Admission with exact negative marking rules (−0.25 per wrong answer).</p>
        </div>
        <div class="page-header-right">
          <div class="neg-mark-badge">
            <span class="neg-mark-icon">⚠</span>
            <div>
              <div class="neg-mark-title">NEGATIVE MARKING ACTIVE</div>
              <div class="neg-mark-sub">−0.25 marks per wrong answer · Skip = 0</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Medical Section -->
      <div class="exam-section">
        <div class="section-label">
          <span class="section-pill medical-pill">🩺 MEDICAL ADMISSION</span>
          <div class="section-line"></div>
        </div>

        <div class="exam-grid medical-grid">
          <div
            v-for="key in medicalExams"
            :key="key"
            class="exam-card"
            :class="{ 'exam-card--active': selectedExam === key }"
            @click="selectExam(key)"
          >
            <div class="exam-card-corner tl"></div>
            <div class="exam-card-corner br"></div>
            <div class="exam-card-top">
              <span class="exam-icon">{{ examConfigs[key].icon }}</span>
              <div class="exam-badge-row">
                <span class="exam-label">{{ examConfigs[key].label }}</span>
                <span class="exam-neg-badge">−0.25</span>
              </div>
            </div>
            <div class="exam-card-name">{{ examConfigs[key].fullLabel }}</div>
            <div class="exam-card-authority">{{ examConfigs[key].authority }}</div>
            <div class="exam-card-desc">{{ examConfigs[key].description }}</div>
            <div class="exam-card-meta">
              <span class="meta-pill">{{ examConfigs[key].totalQuestions }}Q</span>
              <span class="meta-pill">{{ examConfigs[key].duration }} min</span>
              <span class="meta-pill">Pass: {{ examConfigs[key].passScore }}%</span>
            </div>
            <div class="exam-subject-bars">
              <div
                v-for="(count, subj) in examConfigs[key].subjects"
                :key="subj"
                class="subj-bar-wrap"
                :title="`${examConfigs[key].subjectLabels[subj]}: ${count}Q`"
              >
                <div class="subj-bar-label">{{ examConfigs[key].subjectLabels[subj] }}</div>
                <div class="subj-bar-track">
                  <div class="subj-bar-fill" :style="{ width: (count / examConfigs[key].totalQuestions * 100) + '%' }"></div>
                </div>
                <div class="subj-bar-count">{{ count }}</div>
              </div>
            </div>
            <div class="exam-card-select">
              <span v-if="selectedExam === key">✓ SELECTED</span>
              <span v-else>SELECT →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Varsity Section -->
      <div class="exam-section">
        <div class="section-label">
          <span class="section-pill varsity-pill">🎓 VARSITY ADMISSION</span>
          <div class="section-line"></div>
        </div>

        <div class="exam-grid varsity-grid">
          <div
            v-for="key in varsityExams"
            :key="key"
            class="exam-card"
            :class="{ 'exam-card--active': selectedExam === key }"
            @click="selectExam(key)"
          >
            <div class="exam-card-corner tl"></div>
            <div class="exam-card-corner br"></div>
            <div class="exam-card-top">
              <span class="exam-icon">{{ examConfigs[key].icon }}</span>
              <div class="exam-badge-row">
                <span class="exam-label">{{ examConfigs[key].label }}</span>
                <span class="exam-neg-badge">−0.25</span>
              </div>
            </div>
            <div class="exam-card-name">{{ examConfigs[key].fullLabel }}</div>
            <div class="exam-card-authority">{{ examConfigs[key].authority }}</div>
            <div class="exam-card-desc">{{ examConfigs[key].description }}</div>

            <!-- Unit selector — only shown for exams that requiresUnit (DU) when this card is selected -->
            <div v-if="examConfigs[key].requiresUnit && selectedExam === key" class="unit-selector">
              <div class="unit-selector-header">
                <div class="unit-label">SELECT UNIT <span class="unit-required">*required</span></div>
              </div>
              <div class="unit-pills">
                <button
                  v-for="u in examConfigs[key].units"
                  :key="u.key"
                  class="unit-pill"
                  :class="{ active: selectedUnit === u.key }"
                  @click.stop="selectedUnit = u.key"
                >
                  <span class="unit-pill-label">{{ u.label }}</span>
                  <span class="unit-pill-sub">{{ u.sublabel }}</span>
                </button>
              </div>
              <!-- Unit not selected warning -->
              <div v-if="!selectedUnit" class="unit-warning">
                ⚠ Please select a unit to continue
              </div>
            </div>

            <div class="exam-card-meta">
              <!-- For DU selected with unit: show unit-specific Q count; else default -->
              <span class="meta-pill">
                {{ (selectedExam === key && activeUnitConfig) ? activeUnitConfig.totalQuestions : examConfigs[key].totalQuestions }}Q
              </span>
              <span class="meta-pill">{{ examConfigs[key].duration }} min</span>
              <span class="meta-pill">Pass: {{ examConfigs[key].passScore }}%</span>
            </div>

            <!-- Subject bars: reactive to active unit when this card is selected + unit is picked -->
            <div class="exam-subject-bars">
              <template v-if="selectedExam === key && examConfigs[key].requiresUnit">
                <!-- DU selected: show unit subjects if unit picked, else a placeholder -->
                <template v-if="activeUnitConfig">
                  <div
                    v-for="(count, subj) in activeUnitConfig.subjects"
                    :key="subj"
                    class="subj-bar-wrap"
                    :title="`${activeUnitConfig.subjectLabels[subj]}: ${count}Q`"
                  >
                    <div class="subj-bar-label">{{ activeUnitConfig.subjectLabels[subj] }}</div>
                    <div class="subj-bar-track">
                      <div class="subj-bar-fill varsity-fill" :style="{ width: (count / activeUnitConfig.totalQuestions * 100) + '%' }"></div>
                    </div>
                    <div class="subj-bar-count">{{ count }}</div>
                  </div>
                </template>
                <template v-else>
                  <!-- No unit selected yet: show greyed placeholder bars -->
                  <div class="subj-bars-placeholder">
                    <div v-for="i in 4" :key="i" class="subj-bar-wrap placeholder-bar">
                      <div class="subj-bar-label placeholder-text">─────</div>
                      <div class="subj-bar-track">
                        <div class="subj-bar-fill varsity-fill placeholder-fill" :style="{ width: '25%' }"></div>
                      </div>
                      <div class="subj-bar-count placeholder-text">?</div>
                    </div>
                    <div class="placeholder-hint">Subject breakdown shown after unit selection</div>
                  </div>
                </template>
              </template>
              <template v-else>
                <!-- Non-DU cards or DU not selected: static bars -->
                <div
                  v-for="(count, subj) in examConfigs[key].subjects"
                  :key="subj"
                  class="subj-bar-wrap"
                >
                  <div class="subj-bar-label">{{ examConfigs[key].subjectLabels[subj] }}</div>
                  <div class="subj-bar-track">
                    <div class="subj-bar-fill varsity-fill" :style="{ width: (count / examConfigs[key].totalQuestions * 100) + '%' }"></div>
                  </div>
                  <div class="subj-bar-count">{{ count }}</div>
                </div>
              </template>
            </div>

            <div class="exam-card-select">
              <span v-if="selectedExam === key && examConfigs[key].requiresUnit && !selectedUnit" class="select-unit-prompt">↑ SELECT A UNIT FIRST</span>
              <span v-else-if="selectedExam === key">✓ SELECTED</span>
              <span v-else>SELECT →</span>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Bar -->
      <div v-if="selectedExam" class="cta-bar" :class="{ 'cta-bar--blocked': !canStart }">
        <div class="cta-bar-left">
          <div class="cta-exam-name">
            {{ config.fullLabel }}
            <span v-if="activeUnitConfig" class="cta-unit-badge">{{ activeUnitConfig.label }} · {{ activeUnitConfig.sublabel }}</span>
          </div>
          <div class="cta-meta">
            <span>{{ activeTotalQuestions }} Questions</span>
            <span>·</span>
            <span>{{ config.duration }} Minutes</span>
            <span>·</span>
            <span class="neg-warn">−0.25 Negative Marking</span>
            <template v-if="config.requiresUnit && !selectedUnit">
              <span>·</span>
              <span class="unit-missing-warn">⚠ No unit selected</span>
            </template>
          </div>
        </div>
        <div class="cta-bar-right">
          <button class="iso-btn iso-btn--ghost" @click="selectedExam = null; selectedUnit = ''">Cancel</button>
          <button
            class="iso-btn iso-btn--fill"
            :class="{ 'btn-disabled': !canStart }"
            :disabled="!canStart"
            @click="canStart && (showNegativeWarning = true)"
            :title="!canStart ? 'Please select a unit first' : ''"
          >
            <span v-if="config.requiresUnit && !selectedUnit">Select Unit First</span>
            <span v-else>Start Exam →</span>
          </button>
        </div>
      </div>

    </div><!-- /setup -->

    <!-- ══════════════════ NEGATIVE MARKING WARNING MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showNegativeWarning" class="modal-backdrop" @click.self="showNegativeWarning = false">
        <div class="modal neg-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="neg-modal-icon">⚠</div>
          <div class="neg-modal-title">NEGATIVE MARKING RULES</div>
          <div class="neg-modal-exam">
            {{ config?.fullLabel }}
            <span v-if="activeUnitConfig" class="neg-modal-unit">— {{ activeUnitConfig.label }}</span>
          </div>
          <div class="neg-rules">
            <div class="neg-rule"><span class="neg-rule-icon correct-icon">✓</span><div><strong>Correct answer</strong><span>+1.00 mark</span></div></div>
            <div class="neg-rule"><span class="neg-rule-icon wrong-icon">✗</span><div><strong>Wrong answer</strong><span>−0.25 marks deducted</span></div></div>
            <div class="neg-rule"><span class="neg-rule-icon skip-icon">—</span><div><strong>Skipped / No answer</strong><span>0 marks (no penalty)</span></div></div>
          </div>
          <div class="neg-formula">
            <span class="neg-formula-label">SCORE FORMULA</span>
            <div class="neg-formula-eq">Score = (Correct × 1) − (Wrong × 0.25)</div>
          </div>
          <p class="neg-tip">💡 If unsure, it's safer to <strong>skip</strong> than guess randomly.</p>
          <div class="neg-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showNegativeWarning = false">Go Back</button>
            <button class="iso-btn iso-btn--fill" @click="startExam">I Understand — Start</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ EXAM PHASE ══════════════════ -->
    <div v-if="phase === 'exam'" class="exam-phase">

      <!-- Sticky Topbar -->
      <div class="exam-topbar">
        <div class="topbar-left">
          <span class="topbar-exam-chip">
            {{ config.label }}
            <span v-if="activeUnitConfig"> · {{ activeUnitConfig.label }}</span>
          </span>
          <span class="topbar-neg">−0.25 NM</span>
          <span class="topbar-progress">{{ answeredCount }} / {{ questions.length }}</span>
        </div>
        <div class="topbar-center">
          <div class="topbar-bar-track">
            <div class="topbar-bar-fill" :style="{ width: progressPct + '%' }"></div>
          </div>
        </div>
        <div class="topbar-right">
          <div class="topbar-timer" :class="timerClass">
            <span class="timer-icon">⏱</span>
            {{ timerDisplay }}
          </div>
          <button class="iso-btn iso-btn--ghost topbar-end-btn" @click="showEndModal = true">End Exam</button>
        </div>
      </div>

      <!-- Sticky Q Palette -->
      <div class="q-palette-wrap">
        <div class="q-palette">
          <button
            v-for="(q, i) in questions"
            :key="q.id"
            class="q-dot"
            :class="{
              answered: answers[q.id] !== undefined,
              flagged: flagged.has(q.id),
              current: currentIdx === i
            }"
            @click="scrollToQuestion(i)"
            :title="`Q${i+1}${flagged.has(q.id) ? ' (Flagged)' : ''}`"
          >{{ i + 1 }}</button>
        </div>
        <div class="palette-legend">
          <span class="legend-item"><span class="legend-dot answered"></span>Answered</span>
          <span class="legend-item"><span class="legend-dot flagged"></span>Flagged</span>
          <span class="legend-item"><span class="legend-dot"></span>Unanswered</span>
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
          :class="{
            'card-answered': answers[q.id] !== undefined,
            'card-flagged': flagged.has(q.id),
            'card-current': currentIdx === i
          }"
        >
          <div class="q-card-header">
            <div class="q-meta">
              <span class="q-num">Q{{ i + 1 }}</span>
              <span class="q-subject">{{ config.subjectLabels[q.subject] }}</span>
              <span class="q-chapter">{{ q.chapter }}</span>
              <span :class="['q-diff', diffClass(q.difficulty)]">{{ q.difficulty.toUpperCase() }}</span>
              <span class="q-year">{{ q.year }}</span>
            </div>
            <div class="q-actions">
              <button
                class="flag-btn"
                :class="{ 'flag-active': flagged.has(q.id) }"
                @click="toggleFlag(q.id)"
                title="Flag for review"
              >{{ flagged.has(q.id) ? '🚩 Flagged' : '⚑ Flag' }}</button>
            </div>
          </div>

          <div class="q-text">{{ q.text }}</div>

          <div class="q-options">
            <button
              v-for="(opt, idx) in q.options"
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
            <div class="neg-reminder">
              <span v-if="answers[q.id] !== undefined">Selected — skip if unsure to avoid −0.25</span>
              <span v-else class="skip-note">Not answered — no penalty for skipping</span>
            </div>
            <button
              v-if="answers[q.id] !== undefined"
              class="clear-btn"
              @click="delete answers[q.id]"
            >✕ Clear</button>
          </div>
        </div>

        <!-- Submit Bar -->
        <div class="submit-bar">
          <div class="submit-bar-stats">
            <span>Answered: <strong>{{ answeredCount }}</strong></span>
            <span>Flagged: <strong>{{ flaggedCount }}</strong></span>
            <span>Skipped: <strong>{{ questions.length - answeredCount }}</strong></span>
          </div>
          <button class="iso-btn iso-btn--fill submit-btn" @click="showEndModal = true">
            Submit Exam →
          </button>
        </div>
      </div>

    </div><!-- /exam -->

    <!-- ══════════════════ END EXAM MODAL ══════════════════ -->
    <Teleport to="body">
      <div v-if="showEndModal" class="modal-backdrop" @click.self="showEndModal = false">
        <div class="modal end-modal">
          <div class="modal-corner tl"></div>
          <div class="modal-corner br"></div>
          <div class="end-modal-title">SUBMIT EXAM?</div>
          <div class="end-modal-sub">{{ config?.fullLabel }}</div>
          <div class="end-stats-grid">
            <div class="end-stat"><span class="end-stat-val answered-color">{{ answeredCount }}</span><span>Answered</span></div>
            <div class="end-stat"><span class="end-stat-val flagged-color">{{ flaggedCount }}</span><span>Flagged</span></div>
            <div class="end-stat"><span class="end-stat-val skipped-color">{{ questions.length - answeredCount }}</span><span>Skipped</span></div>
          </div>
          <div v-if="flaggedCount > 0" class="end-warn">⚠ You have {{ flaggedCount }} flagged question(s) still unanswered.</div>
          <div class="end-neg-note">Skipped questions carry no penalty. Wrong answers deduct 0.25 marks.</div>
          <div class="end-modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="showEndModal = false">Keep Going</button>
            <button class="iso-btn iso-btn--fill" @click="submitExam">Submit Now</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ══════════════════ RESULTS PHASE ══════════════════ -->
    <div v-if="phase === 'results'" class="results-phase">

      <!-- Score Hero -->
      <div class="score-hero">
        <div class="score-hero-corner tl"></div>
        <div class="score-hero-corner br"></div>
        <div class="score-hero-left">
          <div class="score-exam-label">{{ config.fullLabel }}</div>
          <div class="score-hero-pct" :class="gradeInfo.cls">
            {{ scoreData.pct }}<span class="score-pct-sym">%</span>
          </div>
          <div class="score-raw">Raw Score: <strong>{{ scoreData.raw }} / {{ scoreData.total }}</strong></div>
          <div class="score-neg-note">
            <span class="score-neg-calc">
              ({{ scoreData.correct }} correct × 1) − ({{ scoreData.wrong }} wrong × 0.25) = {{ scoreData.raw }}
            </span>
          </div>
          <div class="score-status" :class="parseFloat(scoreData.pct) >= config.passScore ? 'status-pass' : 'status-fail'">
            {{ parseFloat(scoreData.pct) >= config.passScore ? '✓ PASSED' : '✗ FAILED' }}
            · Pass mark: {{ config.passScore }}%
          </div>
        </div>
        <div class="score-hero-right">
          <div class="grade-badge" :class="gradeInfo.cls">{{ gradeInfo.letter }}</div>
          <div class="grade-label">{{ gradeInfo.label }}</div>
          <div class="score-cards-grid">
            <div class="score-mini-card correct-card">
              <div class="smc-val">{{ scoreData.correct }}</div>
              <div class="smc-lbl">Correct</div>
              <div class="smc-mark">+{{ scoreData.correct }}</div>
            </div>
            <div class="score-mini-card wrong-card">
              <div class="smc-val">{{ scoreData.wrong }}</div>
              <div class="smc-lbl">Wrong</div>
              <div class="smc-mark">−{{ (scoreData.wrong * 0.25).toFixed(2) }}</div>
            </div>
            <div class="score-mini-card skipped-card">
              <div class="smc-val">{{ scoreData.skipped }}</div>
              <div class="smc-lbl">Skipped</div>
              <div class="smc-mark">±0</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Subject Breakdown -->
      <div class="result-section-title">SUBJECT BREAKDOWN</div>
      <div class="subject-breakdown-grid">
        <div v-for="sb in subjectBreakdown" :key="sb.subj" class="sb-card">
          <div class="sb-name">{{ sb.label }}</div>
          <div class="sb-stats">
            <span class="sb-correct">✓ {{ sb.correct }}</span>
            <span class="sb-wrong">✗ {{ sb.wrong }}</span>
            <span class="sb-skipped">— {{ sb.skipped }}</span>
          </div>
          <div class="sb-bar-track">
            <div
              class="sb-bar-fill"
              :class="parseFloat(sb.pct) >= 60 ? 'sb-high' : parseFloat(sb.pct) >= 40 ? 'sb-mid' : 'sb-low'"
              :style="{ width: Math.max(0, parseFloat(sb.pct)) + '%' }"
            ></div>
          </div>
          <div class="sb-pct" :class="parseFloat(sb.pct) >= 60 ? 'sb-high' : parseFloat(sb.pct) >= 40 ? 'sb-mid' : 'sb-low'">{{ sb.pct }}%</div>
        </div>
      </div>

      <!-- Question Review -->
      <div class="review-header">
        <div class="result-section-title">QUESTION REVIEW</div>
        <div class="review-filter-tabs">
          <button v-for="t in ['all','correct','wrong','skipped']" :key="t" class="rev-tab" :class="{ active: filterTab === t }" @click="filterTab = t">
            {{ t.toUpperCase() }}
            <span class="rev-tab-count">
              {{ t === 'all' ? questions.length : t === 'correct' ? scoreData.correct : t === 'wrong' ? scoreData.wrong : scoreData.skipped }}
            </span>
          </button>
        </div>
      </div>

      <div class="review-list">
        <div v-for="(q, i) in filteredReview" :key="q.id" class="rc-card"
          :class="{
            'rc-card-correct': answers[q.id] === q.answer,
            'rc-card-wrong': answers[q.id] !== undefined && answers[q.id] !== q.answer,
            'rc-card-skipped': answers[q.id] === undefined
          }"
        >
          <div class="rc-header">
            <div class="rc-meta">
              <span class="rc-qnum">Q{{ questions.indexOf(q) + 1 }}</span>
              <span class="rc-subj">{{ config.subjectLabels[q.subject] }}</span>
              <span class="rc-chapter">{{ q.chapter }}</span>
              <span :class="['rc-diff', diffClass(q.difficulty)]">{{ q.difficulty }}</span>
            </div>
            <div class="rc-result-badge">
              <span v-if="answers[q.id] === q.answer" class="rc-badge-correct">+1.00 ✓</span>
              <span v-else-if="answers[q.id] !== undefined" class="rc-badge-wrong">−0.25 ✗</span>
              <span v-else class="rc-badge-skipped">±0 skipped</span>
            </div>
          </div>
          <div class="rc-question">{{ q.text }}</div>
          <div class="rc-options">
            <div
              v-for="(opt, idx) in q.options"
              :key="idx"
              class="rc-opt"
              :class="reviewOptClass(q, idx)"
            >
              <span class="rc-opt-letter">{{ ['A','B','C','D'][idx] }}</span>
              <span class="rc-opt-text">{{ opt }}</span>
              <span v-if="idx === q.answer" class="rc-correct-tag">✓ Correct</span>
              <span v-else-if="answers[q.id] === idx && idx !== q.answer" class="rc-wrong-tag">✗ Your answer</span>
            </div>
          </div>
          <div v-if="answers[q.id] === undefined" class="rc-skipped-note">— You skipped this question. No marks deducted.</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="results-actions">
        <button class="iso-btn iso-btn--ghost" @click="resetToSetup">← Back to Setup</button>
        <button class="iso-btn iso-btn--fill" @click="phase = 'setup'; nextTick(() => { showNegativeWarning = true })">
          Retake Exam
        </button>
      </div>

    </div><!-- /results -->

  </div><!-- /admission-page -->
</template>

<style scoped>
/* ─── PAGE SHELL ─────────────────────────────────────────────────────────── */
.admission-page {
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 4px 10px;
  margin-bottom: 14px;
}
.chip-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--border-bright);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
.page-title {
  font-family: var(--font-mono);
  font-size: 2rem;
  font-weight: 700;
  color: var(--white);
  margin: 0 0 10px;
  line-height: 1.2;
}
.text-outline {
  -webkit-text-stroke: 1px var(--white);
  color: transparent;
}
.page-desc {
  font-family: var(--font-sans);
  color: var(--gray);
  font-size: 0.9rem;
  max-width: 480px;
  line-height: 1.6;
}
.neg-mark-badge {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid rgba(255,100,100,0.3);
  background: rgba(255,100,100,0.06);
  padding: 14px 18px;
  white-space: nowrap;
}
.neg-mark-icon {
  font-size: 1.4rem;
  color: rgba(255,120,120,0.8);
}
.neg-mark-title {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.12em;
  color: rgba(255,120,120,0.9);
  margin-bottom: 4px;
}
.neg-mark-sub {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--gray);
}

/* ─── EXAM SECTION ───────────────────────────────────────────────────────── */
.exam-section { margin-bottom: 48px; }
.section-label {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.section-pill {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  padding: 4px 12px;
  border: 1px solid var(--border);
  white-space: nowrap;
}
.medical-pill { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.25); }
.varsity-pill  { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25); }
.section-line { flex: 1; height: 1px; background: var(--border); }

/* ─── EXAM GRIDS ─────────────────────────────────────────────────────────── */
.medical-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.varsity-grid  { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }

/* ─── EXAM CARD ──────────────────────────────────────────────────────────── */
.exam-card {
  position: relative;
  background: var(--black);
  padding: 22px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.exam-card:hover {
  border-color: var(--border-bright);
  border-left: 2px solid var(--border-bright);
  transform: translate(-1px,-1px);
  box-shadow: 5px 5px 0 0 rgba(240,240,234,0.05);
}
.exam-card--active {
  border-color: var(--white) !important;
  border-left: 3px solid var(--white) !important;
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.06);
}
.exam-card-corner {
  position: absolute;
  width: 10px; height: 10px;
}
.exam-card-corner.tl { top: 6px; left: 6px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.exam-card-corner.br { bottom: 6px; right: 6px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }
.exam-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.exam-icon { font-size: 1.4rem; }
.exam-badge-row { display: flex; align-items: center; gap: 8px; }
.exam-label {
  font-family: var(--font-mono);
  font-size: 1rem;
  font-weight: 700;
  color: var(--white);
}
.exam-neg-badge {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  color: rgba(255,100,100,0.7);
  border: 1px solid rgba(255,100,100,0.3);
  padding: 2px 6px;
}
.exam-card-name {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--white);
  margin-bottom: 4px;
}
.exam-card-authority {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  color: var(--dim);
  margin-bottom: 6px;
}
.exam-card-desc {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--gray);
  margin-bottom: 14px;
  line-height: 1.5;
}
.exam-card-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 14px; }
.meta-pill {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  color: var(--dim);
  border: 1px solid var(--border);
  padding: 2px 7px;
}

/* Subject bars */
.exam-subject-bars { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.subj-bar-wrap { display: flex; align-items: center; gap: 8px; }
.subj-bar-label {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: var(--dim);
  width: 48px;
  text-align: right;
  letter-spacing: 0.06em;
}
.subj-bar-track {
  flex: 1;
  height: 3px;
  background: rgba(240,240,234,0.06);
  position: relative;
}
.subj-bar-fill {
  height: 100%;
  background: rgba(120,220,120,0.5);
  transition: width 0.4s;
}
.varsity-fill { background: rgba(255,200,80,0.5); }
.subj-bar-count {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: var(--dim);
  width: 18px;
}
.exam-card-select {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.1em;
  color: var(--dim);
  text-align: right;
}
.exam-card--active .exam-card-select { color: var(--white); }

/* Unit selector */
.unit-selector { margin-bottom: 12px; }
.unit-selector-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
.unit-label {
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.1em;
  color: var(--dim);
}
.unit-required {
  color: rgba(255,100,100,0.7);
  margin-left: 4px;
}
.unit-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 6px; }
.unit-pill {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-family: var(--font-mono);
  padding: 5px 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  transition: all 0.15s;
  gap: 1px;
}
.unit-pill-label { font-size: 0.62rem; color: var(--white); letter-spacing: 0.04em; }
.unit-pill-sub   { font-size: 0.52rem; color: var(--dim); letter-spacing: 0.06em; }
.unit-pill.active {
  border-color: rgba(255,200,80,0.7);
  background: rgba(255,200,80,0.06);
}
.unit-pill.active .unit-pill-label { color: rgba(255,200,80,0.95); }
.unit-pill.active .unit-pill-sub   { color: rgba(255,200,80,0.6); }
.unit-pill:hover:not(.active) { border-color: var(--border-bright); color: var(--white); }
.unit-warning {
  font-family: var(--font-mono); font-size: 0.58rem;
  color: rgba(255,200,80,0.7);
  letter-spacing: 0.06em;
  padding: 4px 0;
}

/* Placeholder bars when no unit selected */
.placeholder-bar { opacity: 0.3; }
.placeholder-text { color: var(--dim) !important; font-size: 0.5rem !important; }
.placeholder-fill { background: rgba(240,240,234,0.15) !important; }
.placeholder-hint {
  font-family: var(--font-mono); font-size: 0.54rem;
  color: var(--dim); letter-spacing: 0.05em;
  margin-top: 4px; font-style: italic;
}

/* Select unit prompt on card footer */
.select-unit-prompt {
  color: rgba(255,200,80,0.7);
  font-size: 0.58rem;
  letter-spacing: 0.08em;
  animation: pulse-text 2s infinite;
}
@keyframes pulse-text { 0%,100%{opacity:1} 50%{opacity:0.5} }

/* ─── CTA BAR ────────────────────────────────────────────────────────────── */
.cta-bar {
  position: sticky;
  bottom: 20px;
  z-index: 30;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: var(--black);
  border: 1px solid var(--border-bright);
  padding: 18px 24px;
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.05);
  animation: slideUp 0.3s ease;
  transition: border-color 0.2s;
}
.cta-bar--blocked {
  border-color: rgba(255,200,80,0.35);
  box-shadow: 6px 6px 0 0 rgba(255,200,80,0.04);
}
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
.cta-exam-name {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--white);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.cta-unit-badge {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.08em;
  color: rgba(255,200,80,0.9);
  border: 1px solid rgba(255,200,80,0.35);
  background: rgba(255,200,80,0.06);
  padding: 2px 8px;
}
.cta-meta {
  font-family: var(--font-sans);
  font-size: 0.78rem;
  color: var(--gray);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}
.neg-warn { color: rgba(255,120,120,0.8); }
.unit-missing-warn {
  color: rgba(255,200,80,0.8);
  font-family: var(--font-mono);
  font-size: 0.68rem;
}
.cta-bar-right { display: flex; gap: 10px; flex-shrink: 0; }
.btn-disabled {
  opacity: 0.45;
  cursor: not-allowed !important;
  box-shadow: none !important;
  transform: none !important;
}

/* neg modal unit label */
.neg-modal-unit {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: rgba(255,200,80,0.8);
  display: block;
  margin-top: 4px;
}

/* ─── NEGATIVE MARKING MODAL ─────────────────────────────────────────────── */
.modal-backdrop {
  position: fixed; inset: 0;
  background: rgba(8,8,8,0.85);
  z-index: 200;
  display: flex; align-items: center; justify-content: center;
}
.modal {
  position: relative;
  background: var(--black);
  border: 1px solid var(--border-bright);
  padding: 36px;
  max-width: 480px;
  width: 90%;
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04);
  animation: modalPop 0.25s ease;
}
@keyframes modalPop { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
.modal-corner { position: absolute; width: 12px; height: 12px; }
.modal-corner.tl { top: 8px; left: 8px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.modal-corner.br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }

.neg-modal-icon { font-size: 2.5rem; margin-bottom: 12px; }
.neg-modal-title {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.16em;
  color: rgba(255,120,120,0.9);
  margin-bottom: 6px;
}
.neg-modal-exam {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--white);
  margin-bottom: 24px;
}
.neg-rules { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
.neg-rule {
  display: flex; align-items: center; gap: 14px;
  border: 1px solid var(--border);
  padding: 12px 14px;
  font-family: var(--font-sans); font-size: 0.85rem;
}
.neg-rule div { display: flex; flex-direction: column; gap: 2px; }
.neg-rule strong { color: var(--white); }
.neg-rule span { color: var(--gray); font-size: 0.78rem; }
.neg-rule-icon {
  font-size: 1.1rem;
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid;
  font-weight: bold;
  flex-shrink: 0;
}
.correct-icon { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); }
.wrong-icon   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); }
.skip-icon    { color: var(--gray); border-color: var(--border); }
.neg-formula {
  border: 1px solid var(--border);
  padding: 14px 16px;
  margin-bottom: 16px;
  background: rgba(240,240,234,0.02);
}
.neg-formula-label {
  font-family: var(--font-mono);
  font-size: 0.56rem;
  letter-spacing: 0.14em;
  color: var(--dim);
  display: block;
  margin-bottom: 6px;
}
.neg-formula-eq {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--white);
}
.neg-tip {
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--gray);
  margin-bottom: 24px;
}
.neg-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── EXAM TOPBAR ────────────────────────────────────────────────────────── */
.exam-topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; gap: 16px;
  background: var(--black);
  border-bottom: 1px solid var(--border);
  padding: 10px 16px;
}
.topbar-left { display: flex; align-items: center; gap: 10px; }
.topbar-exam-chip {
  font-family: var(--font-mono); font-size: 0.65rem;
  letter-spacing: 0.1em; color: var(--white);
  border: 1px solid var(--border-bright);
  padding: 3px 10px;
}
.topbar-neg {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: rgba(255,100,100,0.7);
  border: 1px solid rgba(255,100,100,0.25);
  padding: 2px 7px;
}
.topbar-progress {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray);
}
.topbar-center { flex: 1; }
.topbar-bar-track {
  height: 3px; background: rgba(240,240,234,0.08); border-radius: 0;
}
.topbar-bar-fill {
  height: 100%; background: var(--white);
  transition: width 0.3s; max-width: 100%;
}
.topbar-right { display: flex; align-items: center; gap: 12px; }
.topbar-timer {
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700;
  color: var(--white); display: flex; align-items: center; gap: 6px;
  padding: 4px 10px; border: 1px solid var(--border);
  transition: all 0.3s;
}
.topbar-timer.warning { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); }
.topbar-timer.critical {
  color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.4);
  animation: blink 0.6s infinite;
}
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.5} }
.topbar-end-btn { font-size: 0.7rem; padding: 6px 14px; }
.timer-icon { font-size: 0.8rem; }

/* ─── Q PALETTE ──────────────────────────────────────────────────────────── */
.q-palette-wrap {
  position: sticky; top: 45px; z-index: 40;
  background: var(--black);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
}
.q-palette {
  display: flex; flex-wrap: wrap; gap: 4px;
  max-height: 80px; overflow-y: auto;
  margin-bottom: 6px;
}
.q-dot {
  width: 26px; height: 22px;
  font-family: var(--font-mono); font-size: 0.55rem;
  border: 1px solid var(--border);
  background: transparent; color: var(--dim);
  cursor: pointer; transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
}
.q-dot:hover { border-color: var(--border-bright); color: var(--white); }
.q-dot.answered { background: rgba(240,240,234,0.08); color: var(--white); border-color: rgba(240,240,234,0.3); }
.q-dot.flagged  { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); }
.q-dot.current  { border-color: var(--white); color: var(--white); font-weight: 700; }
.palette-legend { display: flex; gap: 14px; }
.legend-item {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.55rem;
  color: var(--dim); letter-spacing: 0.06em;
}
.legend-dot {
  width: 10px; height: 8px; border: 1px solid var(--border);
  background: transparent;
}
.legend-dot.answered { background: rgba(240,240,234,0.1); border-color: rgba(240,240,234,0.3); }
.legend-dot.flagged  { border-color: rgba(255,200,80,0.5); }

/* ─── QUESTIONS LIST ─────────────────────────────────────────────────────── */
.questions-list { padding: 20px 0; }
.q-card {
  background: var(--black);
  border: 1px solid var(--border);
  border-left: 3px solid transparent;
  margin-bottom: 12px;
  padding: 22px;
  scroll-margin-top: 140px;
  transition: border-color 0.2s;
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.02);
}
.q-card.card-answered { border-left-color: rgba(240,240,234,0.4); }
.q-card.card-flagged  { border-left-color: rgba(255,200,80,0.6); }
.q-card.card-current  { border-left-color: var(--white); }
.q-card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.q-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-num {
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700;
  color: var(--white); background: rgba(240,240,234,0.06);
  padding: 2px 8px; border: 1px solid var(--border);
}
.q-subject, .q-chapter, .q-year {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.06em; color: var(--dim);
  border: 1px solid var(--border); padding: 2px 7px;
}
.q-diff {
  font-family: var(--font-mono); font-size: 0.56rem;
  letter-spacing: 0.08em; padding: 2px 7px; border: 1px solid;
}
.diff-easy { color: rgba(120,220,120,0.8); border-color: rgba(120,220,120,0.25); background: rgba(120,220,120,0.05); }
.diff-med  { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25);  background: rgba(255,200,80,0.05); }
.diff-hard { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); background: rgba(255,100,100,0.05); }

.flag-btn {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.06em;
  border: 1px solid var(--border); background: transparent;
  color: var(--dim); padding: 4px 10px; cursor: pointer; transition: all 0.15s;
}
.flag-btn:hover { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.8); }
.flag-btn.flag-active { border-color: rgba(255,200,80,0.6); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.06); }

.q-text {
  font-family: var(--font-sans); font-size: 0.95rem;
  color: var(--white); line-height: 1.65; margin-bottom: 18px;
}
.q-options { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
.q-opt {
  display: flex; align-items: center; gap: 12px;
  border: 1px solid var(--border);
  background: transparent;
  padding: 10px 14px;
  cursor: pointer; text-align: left;
  transition: all 0.15s;
  width: 100%;
}
.q-opt:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.q-opt.opt-selected { border-color: var(--white); background: rgba(240,240,234,0.04); }
.opt-letter {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  width: 22px; height: 22px;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--white); flex-shrink: 0;
}
.opt-selected .opt-letter { background: var(--white); color: var(--black); border-color: var(--white); }
.opt-text { font-family: var(--font-sans); font-size: 0.85rem; color: var(--white); }

.q-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  border-top: 1px solid var(--border); padding-top: 10px;
}
.neg-reminder {
  font-family: var(--font-mono); font-size: 0.58rem;
  color: var(--dim); letter-spacing: 0.05em;
}
.skip-note { color: rgba(120,220,120,0.6); }
.clear-btn {
  font-family: var(--font-mono); font-size: 0.6rem;
  border: 1px solid var(--border); background: transparent;
  color: var(--dim); padding: 4px 10px; cursor: pointer;
  transition: all 0.15s;
}
.clear-btn:hover { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.7); }

/* ─── SUBMIT BAR ─────────────────────────────────────────────────────────── */
.submit-bar {
  display: flex; align-items: center; justify-content: space-between;
  border: 1px solid var(--border-bright);
  background: rgba(240,240,234,0.02);
  padding: 18px 22px; margin-top: 20px;
  box-shadow: 5px 5px 0 0 rgba(240,240,234,0.04);
}
.submit-bar-stats {
  display: flex; gap: 20px;
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray);
}
.submit-bar-stats strong { color: var(--white); }
.submit-btn { font-size: 0.8rem; }

/* ─── END MODAL ──────────────────────────────────────────────────────────── */
.end-modal-title {
  font-family: var(--font-mono); font-size: 0.7rem;
  letter-spacing: 0.16em; color: var(--white); margin-bottom: 6px;
}
.end-modal-sub {
  font-family: var(--font-sans); font-size: 0.9rem;
  color: var(--gray); margin-bottom: 24px;
}
.end-stats-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); margin-bottom: 18px; }
.end-stat { background: var(--black); padding: 14px; text-align: center; }
.end-stat-val { display: block; font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; margin-bottom: 4px; }
.end-stat span:last-child { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.answered-color { color: rgba(120,220,120,0.9); }
.flagged-color  { color: rgba(255,200,80,0.9); }
.skipped-color  { color: var(--gray); }
.end-warn {
  font-family: var(--font-sans); font-size: 0.8rem;
  color: rgba(255,200,80,0.8); background: rgba(255,200,80,0.05);
  border: 1px solid rgba(255,200,80,0.2); padding: 8px 12px; margin-bottom: 10px;
}
.end-neg-note {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: var(--dim); letter-spacing: 0.06em; margin-bottom: 24px;
}
.end-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }

/* ─── RESULTS PHASE ──────────────────────────────────────────────────────── */
.score-hero {
  position: relative;
  display: flex; gap: 32px; align-items: flex-start;
  border: 1px solid var(--border-bright);
  background: rgba(240,240,234,0.02);
  padding: 32px; margin-bottom: 32px;
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04);
}
.score-hero-corner { position: absolute; width: 14px; height: 14px; }
.score-hero-corner.tl { top: 8px; left: 8px; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.score-hero-corner.br { bottom: 8px; right: 8px; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }
.score-hero-left { flex: 1; }
.score-exam-label {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.14em; color: var(--dim); margin-bottom: 10px;
}
.score-hero-pct {
  font-family: var(--font-mono); font-size: 4rem; font-weight: 700;
  line-height: 1; margin-bottom: 10px;
}
.score-pct-sym { font-size: 2rem; }
.grade-high { color: rgba(120,220,120,0.95); }
.grade-mid  { color: rgba(255,200,80,0.95); }
.grade-low  { color: rgba(255,150,80,0.95); }
.grade-fail { color: rgba(255,100,100,0.95); }
.score-raw {
  font-family: var(--font-mono); font-size: 0.78rem;
  color: var(--gray); margin-bottom: 6px;
}
.score-raw strong { color: var(--white); }
.score-neg-note { margin-bottom: 14px; }
.score-neg-calc {
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--dim); letter-spacing: 0.05em;
  border: 1px solid var(--border); padding: 5px 10px;
  display: inline-block;
}
.score-status {
  font-family: var(--font-mono); font-size: 0.7rem; letter-spacing: 0.1em;
  padding: 6px 14px; display: inline-block;
}
.status-pass { color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3); background: rgba(120,220,120,0.06); }
.status-fail { color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.06); }

.score-hero-right { text-align: center; min-width: 200px; }
.grade-badge {
  font-family: var(--font-mono); font-size: 4rem; font-weight: 700;
  line-height: 1; margin-bottom: 4px;
}
.grade-label { font-family: var(--font-sans); font-size: 0.8rem; color: var(--gray); margin-bottom: 20px; }
.score-cards-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); }
.score-mini-card { background: var(--black); padding: 12px 8px; }
.smc-val { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.smc-lbl { font-family: var(--font-mono); font-size: 0.55rem; color: var(--dim); letter-spacing: 0.08em; margin-bottom: 4px; }
.smc-mark { font-family: var(--font-mono); font-size: 0.65rem; }
.correct-card .smc-val { color: rgba(120,220,120,0.9); }
.correct-card .smc-mark { color: rgba(120,220,120,0.7); }
.wrong-card .smc-val   { color: rgba(255,100,100,0.9); }
.wrong-card .smc-mark  { color: rgba(255,100,100,0.7); }
.skipped-card .smc-val { color: var(--gray); }
.skipped-card .smc-mark{ color: var(--dim); }

/* Subject breakdown */
.result-section-title {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.14em; color: var(--dim);
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px; margin-bottom: 16px;
}
.subject-breakdown-grid { display: grid; grid-template-columns: repeat(auto-fill,minmax(200px,1fr)); gap: 1px; background: var(--border); margin-bottom: 32px; }
.sb-card { background: var(--black); padding: 16px; }
.sb-name { font-family: var(--font-mono); font-size: 0.68rem; color: var(--white); margin-bottom: 8px; }
.sb-stats { display: flex; gap: 8px; margin-bottom: 8px; }
.sb-correct { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(120,220,120,0.8); }
.sb-wrong   { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,100,100,0.8); }
.sb-skipped { font-family: var(--font-mono); font-size: 0.6rem; color: var(--dim); }
.sb-bar-track { height: 3px; background: rgba(240,240,234,0.06); margin-bottom: 6px; }
.sb-bar-fill { height: 100%; transition: width 0.5s; }
.sb-high { background: rgba(120,220,120,0.5); color: rgba(120,220,120,0.9); }
.sb-mid  { background: rgba(255,200,80,0.5);  color: rgba(255,200,80,0.9); }
.sb-low  { background: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); }
.sb-pct  { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; }

/* Review */
.review-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.review-filter-tabs { display: flex; gap: 1px; background: var(--border); }
.rev-tab {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  padding: 6px 14px; background: var(--black);
  border: none; color: var(--dim); cursor: pointer;
  display: flex; align-items: center; gap: 6px; transition: all 0.15s;
}
.rev-tab:hover { color: var(--white); }
.rev-tab.active { color: var(--white); background: rgba(240,240,234,0.05); }
.rev-tab-count {
  font-size: 0.55rem; background: rgba(240,240,234,0.08);
  padding: 1px 5px;
}
.review-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
.rc-card {
  border: 1px solid var(--border);
  border-left: 3px solid var(--border);
  padding: 20px; background: var(--black);
}
.rc-card-correct { border-left-color: rgba(120,220,120,0.5); }
.rc-card-wrong   { border-left-color: rgba(255,100,100,0.5); }
.rc-card-skipped { border-left-color: var(--border); }
.rc-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.rc-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rc-qnum {
  font-family: var(--font-mono); font-size: 0.68rem; font-weight: 700;
  color: var(--white); background: rgba(240,240,234,0.05);
  padding: 2px 8px; border: 1px solid var(--border);
}
.rc-subj, .rc-chapter {
  font-family: var(--font-mono); font-size: 0.56rem;
  color: var(--dim); border: 1px solid var(--border); padding: 2px 6px;
}
.rc-diff { font-family: var(--font-mono); font-size: 0.54rem; padding: 2px 6px; border: 1px solid; }
.rc-result-badge {}
.rc-badge-correct {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3);
  padding: 3px 8px; background: rgba(120,220,120,0.06);
}
.rc-badge-wrong {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3);
  padding: 3px 8px; background: rgba(255,100,100,0.06);
}
.rc-badge-skipped {
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--dim); border: 1px solid var(--border); padding: 3px 8px;
}
.rc-question {
  font-family: var(--font-sans); font-size: 0.9rem; color: var(--white);
  line-height: 1.6; margin-bottom: 14px;
}
.rc-options { display: flex; flex-direction: column; gap: 6px; }
.rc-opt {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border: 1px solid var(--border);
  position: relative;
}
.rc-correct { border-color: rgba(120,220,120,0.4); background: rgba(120,220,120,0.05); }
.rc-wrong   { border-color: rgba(255,100,100,0.4); background: rgba(255,100,100,0.05); }
.rc-opt-letter {
  font-family: var(--font-mono); font-size: 0.6rem;
  width: 20px; height: 20px; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--white); flex-shrink: 0;
}
.rc-correct .rc-opt-letter { background: rgba(120,220,120,0.3); border-color: rgba(120,220,120,0.5); }
.rc-wrong   .rc-opt-letter { background: rgba(255,100,100,0.3); border-color: rgba(255,100,100,0.5); }
.rc-opt-text { font-family: var(--font-sans); font-size: 0.82rem; color: var(--white); flex: 1; }
.rc-correct-tag, .rc-wrong-tag {
  font-family: var(--font-mono); font-size: 0.55rem;
  letter-spacing: 0.06em; padding: 2px 6px;
}
.rc-correct-tag { color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3); }
.rc-wrong-tag   { color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.3); }
.rc-skipped-note {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: var(--dim); letter-spacing: 0.06em;
  border-top: 1px solid var(--border); padding-top: 10px; margin-top: 10px;
}

/* ─── RESULTS ACTIONS ────────────────────────────────────────────────────── */
.results-actions {
  display: flex; gap: 12px; justify-content: flex-end;
  border-top: 1px solid var(--border); padding-top: 24px;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 900px) {
  .medical-grid, .varsity-grid { grid-template-columns: repeat(2,1fr); }
  .page-header { flex-direction: column; }
  .score-hero { flex-direction: column; }
}
@media (max-width: 600px) {
  .admission-page { padding: 16px 12px 60px; }
  .medical-grid, .varsity-grid { grid-template-columns: 1fr; }
  .score-hero-pct { font-size: 2.8rem; }
}
</style>
