// composables/useMockExam.ts
// State machine for the full mock exam lifecycle: setup → in-progress → finished

export type ExamState = 'setup' | 'in-progress' | 'finished'
export type QuestionStatus = 'unanswered' | 'answered' | 'skipped' | 'marked'

export interface Question {
  id: string
  text: string
  options: string[]
  correct: number
  explanation: string
}

export interface Subject {
  label: string
  questions: Question[]
}

export interface Stream {
  label: string
  subjects: Record<string, Subject>
}

export interface QuestionData {
  streams: Record<string, Stream>
}

export interface QuestionResult {
  questionIndex: number
  question: Question
  selectedAnswer: number | null
  isCorrect: boolean
  status: QuestionStatus
}

const state = reactive<{
  examState: ExamState
  // Setup
  selectedStream: string
  selectedSubject: string
  questionCount: number
  availableStreams: Record<string, Stream>
  // In-progress
  questions: Question[]
  currentIndex: number
  answers: (number | null)[]
  statuses: QuestionStatus[]
  timeRemaining: number
  totalTime: number
  showWarning: boolean
  timerInterval: ReturnType<typeof setInterval> | null
  startTime: number | null
  // Finished
  results: QuestionResult[]
  timeTaken: number
  loading: boolean
  error: string | null
}>({
  examState: 'setup',
  selectedStream: '',
  selectedSubject: '',
  questionCount: 10,
  availableStreams: {},
  questions: [],
  currentIndex: 0,
  answers: [],
  statuses: [],
  timeRemaining: 0,
  totalTime: 0,
  showWarning: false,
  timerInterval: null,
  startTime: null,
  results: [],
  timeTaken: 0,
  loading: false,
  error: null,
})

export function useMockExam() {
  // ─── Computed ────────────────────────────────────────────────────────────────

  const streamOptions = computed(() =>
    Object.entries(state.availableStreams).map(([key, val]) => ({
      key,
      label: val.label,
    }))
  )

  const subjectOptions = computed(() => {
    if (!state.selectedStream || !state.availableStreams[state.selectedStream]) return []
    return Object.entries(state.availableStreams[state.selectedStream].subjects).map(([key, val]) => ({
      key,
      label: val.label,
    }))
  })

  const availableQuestionCounts = computed(() => {
    if (!state.selectedStream || !state.selectedSubject) return [10, 25]
    const total = state.availableStreams[state.selectedStream]?.subjects[state.selectedSubject]?.questions?.length ?? 0
    return [10, 25, 50].filter((n) => n <= total)
  })

  const currentQuestion = computed(() => state.questions[state.currentIndex] ?? null)

  const currentAnswer = computed(() => state.answers[state.currentIndex] ?? null)

  const currentStatus = computed(() => state.statuses[state.currentIndex] ?? 'unanswered')

  const answeredCount = computed(() => state.answers.filter((a) => a !== null).length)

  const skippedCount = computed(() => state.statuses.filter((s) => s === 'skipped').length)

  const markedCount = computed(() => state.statuses.filter((s) => s === 'marked').length)

  const score = computed(() => {
    if (state.results.length === 0) return { correct: 0, wrong: 0, skipped: 0, percentage: 0, grade: 'F' }
    const correct = state.results.filter((r) => r.isCorrect).length
    const skipped = state.results.filter((r) => r.selectedAnswer === null).length
    const wrong = state.results.length - correct - skipped
    const percentage = Math.round((correct / state.results.length) * 100)
    let grade = 'F'
    if (percentage >= 80) grade = 'A+'
    else if (percentage >= 70) grade = 'A'
    else if (percentage >= 60) grade = 'B'
    else if (percentage >= 50) grade = 'C'
    return { correct, wrong, skipped, percentage, grade }
  })

  const timerDisplay = computed(() => {
    const mins = Math.floor(state.timeRemaining / 60)
    const secs = state.timeRemaining % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  })

  const timerWarning = computed(() => state.timeRemaining <= 30 && state.timeRemaining > 0)

  const timerDanger = computed(() => state.timeRemaining <= 10 && state.timeRemaining > 0)

  const timerProgress = computed(() =>
    state.totalTime > 0 ? (state.timeRemaining / state.totalTime) * 100 : 0
  )

  // ─── Data Loading ─────────────────────────────────────────────────────────

  async function loadQuestions() {
    if (Object.keys(state.availableStreams).length > 0) return
    state.loading = true
    state.error = null
    try {
      const data = await $fetch<QuestionData>('/data/questions.json')
      state.availableStreams = data.streams
      // Auto-select first stream and subject
      const firstStream = Object.keys(data.streams)[0]
      if (firstStream) {
        state.selectedStream = firstStream
        const firstSubject = Object.keys(data.streams[firstStream].subjects)[0]
        if (firstSubject) state.selectedSubject = firstSubject
      }
    } catch (e) {
      state.error = 'Failed to load questions. Please refresh.'
    } finally {
      state.loading = false
    }
  }

  // ─── Setup ───────────────────────────────────────────────────────────────

  function setStream(stream: string) {
    state.selectedStream = stream
    // Auto-select first subject of new stream
    const firstSubject = Object.keys(state.availableStreams[stream]?.subjects ?? {})[0]
    state.selectedSubject = firstSubject ?? ''
    // Reset question count if not available
    const available = [10, 25, 50].filter(
      (n) => n <= (state.availableStreams[stream]?.subjects[state.selectedSubject]?.questions?.length ?? 0)
    )
    if (!available.includes(state.questionCount)) state.questionCount = available[0] ?? 10
  }

  function setSubject(subject: string) {
    state.selectedSubject = subject
    const total = state.availableStreams[state.selectedStream]?.subjects[subject]?.questions?.length ?? 0
    const available = [10, 25, 50].filter((n) => n <= total)
    if (!available.includes(state.questionCount)) state.questionCount = available[0] ?? 10
  }

  function setQuestionCount(count: number) {
    state.questionCount = count
  }

  // ─── Start Exam ───────────────────────────────────────────────────────────

  function startExam() {
    const subjectData = state.availableStreams[state.selectedStream]?.subjects[state.selectedSubject]
    if (!subjectData) return

    // Shuffle and slice questions
    const shuffled = [...subjectData.questions].sort(() => Math.random() - 0.5)
    state.questions = shuffled.slice(0, state.questionCount)
    state.answers = new Array(state.questions.length).fill(null)
    state.statuses = new Array(state.questions.length).fill('unanswered')
    state.currentIndex = 0
    state.totalTime = state.questionCount * 60
    state.timeRemaining = state.totalTime
    state.showWarning = false
    state.startTime = Date.now()
    state.results = []
    state.examState = 'in-progress'

    startTimer()
  }

  // ─── Timer ────────────────────────────────────────────────────────────────

  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval)
    state.timerInterval = setInterval(() => {
      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval!)
        submitExam()
        return
      }
      state.timeRemaining--
      if (state.timeRemaining === 30) state.showWarning = true
      if (state.timeRemaining < 25) state.showWarning = false
    }, 1000)
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval)
      state.timerInterval = null
    }
  }

  function dismissWarning() {
    state.showWarning = false
  }

  // ─── Answer & Navigation ──────────────────────────────────────────────────

  function selectAnswer(optionIndex: number) {
    state.answers[state.currentIndex] = optionIndex
    if (state.statuses[state.currentIndex] !== 'marked') {
      state.statuses[state.currentIndex] = 'answered'
    }
  }

  function toggleMarkForReview() {
    const current = state.statuses[state.currentIndex]
    if (current === 'marked') {
      state.statuses[state.currentIndex] = state.answers[state.currentIndex] !== null ? 'answered' : 'unanswered'
    } else {
      state.statuses[state.currentIndex] = 'marked'
    }
  }

  function skipQuestion() {
    if (state.answers[state.currentIndex] === null) {
      state.statuses[state.currentIndex] = 'skipped'
    }
    goNext()
  }

  function goToQuestion(index: number) {
    if (index >= 0 && index < state.questions.length) {
      state.currentIndex = index
    }
  }

  function goPrev() {
    if (state.currentIndex > 0) state.currentIndex--
  }

  function goNext() {
    if (state.currentIndex < state.questions.length - 1) state.currentIndex++
  }

  // ─── Submit ───────────────────────────────────────────────────────────────

  function submitExam() {
    stopTimer()
    state.timeTaken = state.startTime ? Math.floor((Date.now() - state.startTime) / 1000) : state.totalTime

    state.results = state.questions.map((q, i) => ({
      questionIndex: i,
      question: q,
      selectedAnswer: state.answers[i],
      isCorrect: state.answers[i] === q.correct,
      status: state.statuses[i],
    }))

    state.examState = 'finished'
  }

  // ─── Reset ────────────────────────────────────────────────────────────────

  function resetExam() {
    stopTimer()
    state.examState = 'setup'
    state.questions = []
    state.answers = []
    state.statuses = []
    state.currentIndex = 0
    state.timeRemaining = 0
    state.totalTime = 0
    state.showWarning = false
    state.results = []
    state.timeTaken = 0
    state.startTime = null
  }

  // ─── Format helpers ───────────────────────────────────────────────────────

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${String(s).padStart(2, '0')}s`
  }

  return {
    // State (readonly refs)
    examState: computed(() => state.examState),
    selectedStream: computed(() => state.selectedStream),
    selectedSubject: computed(() => state.selectedSubject),
    questionCount: computed(() => state.questionCount),
    questions: computed(() => state.questions),
    currentIndex: computed(() => state.currentIndex),
    answers: computed(() => state.answers),
    statuses: computed(() => state.statuses),
    timeRemaining: computed(() => state.timeRemaining),
    showWarning: computed(() => state.showWarning),
    results: computed(() => state.results),
    timeTaken: computed(() => state.timeTaken),
    loading: computed(() => state.loading),
    error: computed(() => state.error),
    // Computed
    streamOptions,
    subjectOptions,
    availableQuestionCounts,
    currentQuestion,
    currentAnswer,
    currentStatus,
    answeredCount,
    skippedCount,
    markedCount,
    score,
    timerDisplay,
    timerWarning,
    timerDanger,
    timerProgress,
    // Actions
    loadQuestions,
    setStream,
    setSubject,
    setQuestionCount,
    startExam,
    selectAnswer,
    toggleMarkForReview,
    skipQuestion,
    goToQuestion,
    goPrev,
    goNext,
    submitExam,
    resetExam,
    dismissWarning,
    formatTime,
  }
}
