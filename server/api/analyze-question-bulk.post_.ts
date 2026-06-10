// server/api/analyze-question-bulk.post.ts
import { GoogleGenAI } from '@google/genai'
import { curriculum } from '~/utils/curriculum'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const form = await readMultipartFormData(event)

  if (!form || form.length === 0)
    throw createError({ statusCode: 400, message: 'No data received' })

  const fileField = form.find(f => f.name === 'image')
  const streamField = form.find(f => f.name === 'stream')

  if (!fileField?.data || !fileField?.type)
    throw createError({ statusCode: 400, message: 'Invalid image data' })

  if (!streamField?.data)
    throw createError({ statusCode: 400, message: 'Stream is required' })

  const stream = streamField.data.toString('utf-8').trim()
  const subjects = curriculum[stream] ?? []

  const subjectList = subjects.map(s =>
    `- "${s.en}" (${s.bn})\n` +
    s.chapters.map(c => `    • "${c.en}" (${c.bn})`).join('\n')
  ).join('\n')

  const prompt = `You are a bilingual (Bengali/English) exam question parser for the Bangladesh ${stream} curriculum.

This image contains a printed exam question sheet with multiple questions.

STEP 1 — RED DOT DETECTION:
Scan the entire image for red dot (●) markers next to any questions.
- If red dots ARE present: extract ONLY the red-dot-marked questions, up to a maximum of 30.
- If red dots are NOT present: extract ALL questions found, up to a maximum of 30.
- If fewer than 30 qualifying questions exist, extract all of them.

STEP 2 — EXTRACTION:
For each qualifying question, extract all fields carefully.

Return ONLY a valid JSON object with NO markdown, NO explanation, NO code fences:
{
  "redDotDetected": <true | false>,
  "totalFound": <number of questions extracted>,
  "questions": [
    {
      "questionBN":    "<full question text in Bengali exactly as it appears>",
      "questionEN":    "<accurate English translation>",
      "optionsBN":     ["<A>", "<B>", "<C>", "<D>"],
      "optionsEN":     ["<A>", "<B>", "<C>", "<D>"],
      "answerEN":      "<A | B | C | D — whichever is marked correct; default A if unclear>",
      "explanationBN": "<explanation in Bengali if not present, give a very short explanation in Bengali>",
      "explanationEN": "<English translation of explanation if not present, give a very short explanation in English>",
      "year":          "<4-digit year if visible, else empty string>",
      "sourceBN":      "<array of board/school/institution names in Bengali if visible — e.g. [\"ঢাকা বোর্ড\", \"রাজশাহী বোর্ড\"]. Single source still goes in an array: [\"ঢাকা বোর্ড\"]. Empty array [] if none found>",
      "sourceEN":      "<array of the same sources translated to English — e.g. [\"Dhaka Board\", \"Rajshahi Board\"]. Must match sourceBN order. Empty array [] if none found>",
      "subjectEN":     "<pick the single closest match from the subject list below>",
      "subjectBN":     "<Bengali name of chosen subject exactly as in the list>",
      "chapterEN":     "<pick the single closest matching chapter for the chosen subject>",
      "chapterBN":     "<Bengali name of chosen chapter exactly as in the list>",
      "difficulty":    "<Easy | Medium | Hard>",
      "redDot":        <true if this specific question had a red dot, else false>,
      "lowConfidence": <true if the text was blurry, partially cut off, handwritten, or you were uncertain about any field — else false>
    }
  ]
}

Rules:
- subjectEN and chapterEN MUST be chosen exactly from the list below — do not invent values.
- If fewer than 4 options exist, fill remaining optionsBN/optionsEN with empty strings.
- year and source may be shared across all questions if printed once at the top of the sheet.
- sourceBN and sourceEN are always arrays. Even a single source must be wrapped: ["ঢাকা বোর্ড"]. Never a plain string.
- If the image contains a mix of board exams and school/college test papers, include all institution names found.
- Set lowConfidence: true if the image quality was poor for that question, text was ambiguous, correct answer was unclear, or you had to guess any field.
- Return ONLY the JSON object.

Valid subjects and chapters for ${stream}:
${subjectList || '(none defined yet — leave subjectEN, subjectBN, chapterEN, chapterBN as empty strings)'}
`

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-preview',
      contents: [
        { inlineData: { data: fileField.data.toString('base64'), mimeType: fileField.type } },
        prompt
      ]
    })

    const raw = response.text?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/, '').replace(/```$/, '').trim()

    // Validate it's parseable JSON before returning
    JSON.parse(clean)

    return { result: clean }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Gemini API Error' })
  }
})
