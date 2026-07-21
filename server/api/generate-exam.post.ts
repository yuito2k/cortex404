// server/api/generate-exam.post.ts
// Generates bilingual (Bangla + English) MCQ questions for a preset exam
// using Gemini. Follows the exact same patterns as analyze-question-bulk.post.ts

import { GoogleGenAI } from '@google/genai'
import { curriculum } from '~/utils/curriculum'

function autoWrapStrayLatex(text: string): string {
  if (typeof text !== 'string') return text
  if (text.includes('@@') && !text.includes('<<') && !text.includes('[[')) {
    return `<<${text}>>`
  }
  return text
}

function fixOptionsArray(arr: unknown): unknown {
  if (!Array.isArray(arr)) return arr
  return arr.map(autoWrapStrayLatex)
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const body   = await readBody(event)

  const {
    stream,      // group_key: e.g. 'hsc_science' | 'buet' | 'mbbs'
    subject,     // English subject name or null (= all subjects)
    chapter,     // English chapter name or null (= all chapters)
    difficulty,  // 'easy' | 'medium' | 'hard' | null (= mixed)
    count,       // number of questions to generate (default 20)
    seed,        // optional free-form instruction string for Gemini
  } = body

  if (!stream) {
    throw createError({ statusCode: 400, message: 'stream is required' })
  }

  const questionCount = Math.min(Math.max(parseInt(count) || 20, 1), 50)

  // ── Build curriculum context for Gemini ─────────────────────────
  const subjects = curriculum[stream] ?? []
  const subjectList = subjects.map(s =>
    `- "${s.en}" (${s.bn})\n` +
    s.chapters.map(c => `    • "${c.en}" (${c.bn})`).join('\n')
  ).join('\n')

  // ── Narrow scope if subject/chapter provided ──────────────────────
  const scopeLines: string[] = []
  if (subject)    scopeLines.push(`Subject: ${subject}`)
  if (chapter)    scopeLines.push(`Chapter: ${chapter}`)
  if (difficulty) scopeLines.push(`Difficulty: ${difficulty} questions only`)
  if (seed)       scopeLines.push(`Extra instructions: ${seed}`)
  const scopeStr = scopeLines.length
    ? `\n\nFocus specifically on:\n${scopeLines.map(l => `- ${l}`).join('\n')}`
    : ''

  const prompt = `You are an expert bilingual (Bengali/English) MCQ question writer for the Bangladesh ${stream} curriculum.

Your task is to generate EXACTLY ${questionCount} high-quality MCQ questions.${scopeStr}

Requirements:
- Each question must have EXACTLY 4 options (A, B, C, D)
- Exactly ONE correct answer per question
- Questions must be original — do not copy from existing papers
- Cover a variety of concepts within the specified scope
- Write accurate, concise bilingual content
- Explanations should be educational and clear

${difficulty ? `All questions should be ${difficulty} difficulty.` : 'Mix difficulties: roughly 40% easy, 40% medium, 20% hard.'}

Return ONLY a valid JSON object with NO markdown, NO explanation, NO code fences:
{
  "questions": [
    {
      "questionBN":    "<full question text in Bengali>",
      "questionEN":    "<accurate English translation>",
      "optionsBN":     ["<A>", "<B>", "<C>", "<D>"],
      "optionsEN":     ["<A>", "<B>", "<C>", "<D>"],
      "answerEN":      "<A | B | C | D>",
      "explanationBN": "<clear explanation in Bengali why the answer is correct>",
      "explanationEN": "<English translation of explanation>",
      "subjectEN":     "<pick the single closest match from the subject list below>",
      "subjectBN":     "<Bengali name of chosen subject exactly as in the list>",
      "chapterEN":     "<pick the single closest matching chapter for the chosen subject>",
      "chapterBN":     "<Bengali name of chosen chapter exactly as in the list>",
      "difficulty":    "<Easy | Medium | Hard>"
    }
  ]
}

Rules:
- subjectEN and chapterEN MUST be chosen exactly from the list below — do not invent values.
- Do NOT add A. B. C. D. or ক. খ. গ. ঘ. in the optionsBN or optionsEN. Just the option text.
- Options must be self-contained — never merge two separate options with "/" or "or".
- Greek letters and math symbols must use the actual character: θ π ε η μ σ ρ λ ∞ ° etc.
- Never spell out "theta", "pi", "infinity" etc. in either language.
- Arithmetic operators must use signs: +, −, ×, ÷, =, ≠

Math/chemistry formatting (CRITICAL — same rules as the parser):
- Wrap inline math in <<...>>, display math in [[...]]
- Inside wrappers, write LaTeX commands with @@ instead of backslash
  e.g. <<@@frac{1}{2}>>, <<@@lim_{x @@to @@infty}>>, <<H_2SO_4>>
- A degree value like "90°" needs NO wrapping — leave as plain text
- Never include a bare @@ command outside of << >> or [[ ]]
- The "?" character is plain text — never inside << >> / [[ ]]

Valid subjects and chapters for ${stream}:
${subjectList || '(none defined — leave subjectEN/subjectBN/chapterEN/chapterBN as empty strings)'}
`

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      config: { temperature: 0.7 },   // slightly higher than parser for creativity
      contents: [prompt]
    })

    const raw   = response.text?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/, '').replace(/```$/, '').trim()

    const parsedObj = JSON.parse(clean)

    // Safety net: fix stray LaTeX in options
    for (const q of parsedObj.questions ?? []) {
      q.optionsEN = fixOptionsArray(q.optionsEN)
      q.optionsBN = fixOptionsArray(q.optionsBN)
    }

    return { result: JSON.stringify(parsedObj) }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Gemini API Error' })
  }
})
