// server/api/ai-routine.post.ts
// ---------------------------------------------------------------------------
// Single endpoint for all Gemini-assisted routine features:
//   task: 'generate-routine'   -> { blocks: RoutineBlock[] }
//   task: 'daily-tip'          -> { tip: string }
//   task: 'target-suggestion'  -> { suggestion: {...} }
//
// If GEMINI_API_KEY is not set (or the call fails for any reason), every task
// resolves to a deterministic local "demo" generator instead of erroring —
// matches the project's existing "always include demo fallbacks" rule.
// Get a free key (no card needed) at https://aistudio.google.com/app/apikey
// ---------------------------------------------------------------------------

interface RoutinePayload {
  stream: string
  subjects: string[]
  dailyHours: number
  planType: 'weekly' | 'countdown'
  examDate?: string
  weakTopics?: string[]
  intensity: 'relaxed' | 'balanced' | 'intense'
}

const GEMINI_MODEL = 'gemini-2.0-flash'
const geminiUrl = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const task = body?.task as 'generate-routine' | 'daily-tip' | 'target-suggestion' | undefined
  const config = useRuntimeConfig()
  const apiKey = config.geminiApiKey as string | undefined

  if (!task) {
    throw createError({ statusCode: 400, statusMessage: 'Missing "task" in request body' })
  }

  try {
    if (task === 'generate-routine') {
      const payload = body.payload as RoutinePayload
      if (apiKey) {
        const blocks = await generateRoutineWithGemini(apiKey, payload)
        if (blocks) return { source: 'gemini', blocks }
      }
      return { source: 'demo', blocks: demoRoutine(payload) }
    }

    if (task === 'daily-tip') {
      if (apiKey) {
        const tip = await generateTipWithGemini(apiKey, body.payload)
        if (tip) return { source: 'gemini', tip }
      }
      return { source: 'demo', tip: demoTip() }
    }

    if (task === 'target-suggestion') {
      if (apiKey) {
        const suggestion = await generateTargetWithGemini(apiKey, body.payload)
        if (suggestion) return { source: 'gemini', suggestion }
      }
      return { source: 'demo', suggestion: demoTargetSuggestion(body.payload) }
    }

    throw createError({ statusCode: 400, statusMessage: `Unknown task: ${task}` })
  } catch {
    // Network failure, bad JSON, rate limit, anything — never break the page.
    if (task === 'generate-routine') return { source: 'demo-fallback', blocks: demoRoutine(body.payload) }
    if (task === 'daily-tip') return { source: 'demo-fallback', tip: demoTip() }
    if (task === 'target-suggestion') return { source: 'demo-fallback', suggestion: demoTargetSuggestion(body.payload) }
    return { source: 'demo-fallback', error: true }
  }
})

// ───────────────────────── Gemini calls ─────────────────────────

async function callGemini(apiKey: string, prompt: string, systemInstruction: string) {
  const res = await fetch(geminiUrl(apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) return null
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function generateRoutineWithGemini(apiKey: string, payload: RoutinePayload) {
  const system = `You are a study-routine planner for Bangladeshi exam prep (SSC/HSC/admission/BCS/bank).
Return ONLY a valid JSON array, no prose, no markdown fences. Each item shaped exactly as:
{"dayKey": string, "subject": string, "topic": string, "start": "HH:MM", "duration": number}
"dayKey" must be one of mon,tue,wed,thu,fri,sat,sun when planType is "weekly", or an ISO date (YYYY-MM-DD) starting from today when planType is "countdown".
"duration" is in minutes. Keep each day's total study time close to the requested dailyHours. Prioritise the listed weakTopics more often.`
  const prompt = `stream: ${payload.stream}
subjects: ${payload.subjects.join(', ')}
dailyHours: ${payload.dailyHours}
planType: ${payload.planType}
examDate: ${payload.examDate || 'n/a'}
weakTopics: ${(payload.weakTopics || []).join(', ') || 'none specified'}
intensity: ${payload.intensity}
Generate the plan now.`
  const result = await callGemini(apiKey, prompt, system)
  return Array.isArray(result) ? result : null
}

async function generateTipWithGemini(apiKey: string, payload: any) {
  const system = `You are an encouraging Bangladeshi exam-prep coach. Return ONLY valid JSON: {"tip": string}. One sentence, under 22 words, no markdown, no emoji.`
  const prompt = `stream: ${payload?.stream || 'general'}, currentStreak: ${payload?.streak ?? 0} days, weakTopics: ${(payload?.weakTopics || []).join(', ') || 'none'}`
  const result = await callGemini(apiKey, prompt, system)
  return result?.tip || null
}

async function generateTargetWithGemini(apiKey: string, payload: any) {
  const system = `Suggest one achievable study target for a student. Return ONLY valid JSON, no markdown:
{"title": string, "type": "topic-completion"|"score-threshold"|"study-hours", "targetValue": number, "deadlineDays": number}`
  const prompt = `stream: ${payload?.stream}, weakTopics: ${(payload?.weakTopics || []).join(', ') || 'none specified'}`
  return await callGemini(apiKey, prompt, system)
}

// ───────────────────────── Demo fallbacks (deterministic, offline) ─────────────────────────

const TOPICS_BY_SUBJECT: Record<string, string[]> = {
  Physics: ['Vectors', 'Kinematics', 'Work & Energy', 'Waves', 'Thermodynamics'],
  Chemistry: ['Mole Concept', 'Periodic Table', 'Chemical Bonding', 'Organic Basics', 'Equilibrium'],
  'Higher Math': ['Algebra', 'Trigonometry', 'Calculus Intro', 'Coordinate Geometry', 'Vectors'],
  Math: ['Algebra', 'Trigonometry', 'Geometry', 'Mensuration', 'Statistics'],
  Biology: ['Cell Structure', 'Genetics', 'Human Physiology', 'Ecology', 'Plant Biology'],
  English: ['Grammar', 'Comprehension', 'Vocabulary', 'Writing', 'Translation'],
  ICT: ['Number System', 'Networking', 'Programming Basics', 'Database', 'Web Design'],
  Bangla: ['Grammar', 'Literature', 'Essay Writing', 'Comprehension', 'Bangla 2nd Paper'],
  'General Knowledge': ['Bangladesh Affairs', 'International Affairs', 'Current Affairs', 'Science GK'],
  'Bangladesh Affairs': ['History', 'Geography', 'Constitution', 'Liberation War'],
  'International Affairs': ['Organizations', 'World Geography', 'World History'],
  Computer: ['MS Office', 'Internet Basics', 'Hardware', 'Networking'],
  General: ['Core Concepts', 'Revision', 'Practice Set'],
}

function demoRoutine(payload: RoutinePayload) {
  const subjects = payload.subjects?.length ? payload.subjects : ['Physics', 'Chemistry', 'Math', 'English']
  const slotsPerDay = Math.max(1, Math.min(4, Math.round(payload.dailyHours / 1.2)))
  const minutesPerSlot = Math.max(30, Math.round((payload.dailyHours * 60) / slotsPerDay))
  const startHour = 17 // 5pm baseline study start

  const dayKeys =
    payload.planType === 'countdown'
      ? buildCountdownDates(14) // demo preview: first 14 days
      : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

  const blocks: any[] = []
  let subjIdx = 0
  for (const dayKey of dayKeys) {
    for (let s = 0; s < slotsPerDay; s++) {
      const subject = subjects[subjIdx % subjects.length]
      const topics = TOPICS_BY_SUBJECT[subject] || TOPICS_BY_SUBJECT.General
      const topic = topics[(subjIdx + s) % topics.length]
      blocks.push({
        dayKey,
        subject,
        topic,
        start: formatTime(startHour, s * (minutesPerSlot + 10)),
        duration: minutesPerSlot,
      })
      subjIdx++
    }
  }
  return blocks
}

function buildCountdownDates(count: number) {
  const dates: string[] = []
  const start = new Date()
  for (let i = 0; i < count; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d.toISOString().slice(0, 10))
  }
  return dates
}

function formatTime(startHour: number, offsetMinutes: number) {
  const total = startHour * 60 + offsetMinutes
  const h = Math.floor(total / 60) % 24
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function demoTip() {
  const tips = [
    'Review your weakest topic for 15 minutes before sleeping — recall improves overnight.',
    'Switch subjects every 90 minutes. Variety keeps focus sharper than long single-subject blocks.',
    "Redo yesterday's wrong answers first today. Fixing mistakes beats fresh practice.",
    'Five focused mock questions now beat thirty distracted ones later.',
    "Your streak is a habit, not a sprint. Protect today's session above all else.",
    'Block your hardest subject first, while your focus is freshest.',
  ]
  return tips[new Date().getDate() % tips.length]
}

function demoTargetSuggestion(payload: any) {
  const weak = payload?.weakTopics?.[0] || 'your weakest topic'
  return { title: `Master ${weak}`, type: 'topic-completion', targetValue: 20, deadlineDays: 10 }
}
