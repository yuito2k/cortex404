// server/api/analyze-question.post.ts
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

  // Build constrained subject+chapter list for the prompt
  const subjectList = subjects.map(s =>
    `- "${s.en}" (${s.bn})\n` +
    s.chapters.map(c => `    • "${c.en}" (${c.bn})`).join('\n')
  ).join('\n')

  const prompt = `You are a bilingual (Bengali/English) exam question parser for the Bangladesh ${stream} curriculum.

Analyze this exam question image and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

The JSON must follow this exact shape:
{
  "questionBN":    "<full question text in Bengali exactly as it appears>",
  "questionEN":    "<accurate English translation of the question>",
  "optionsBN":     ["<A>", "<B>", "<C>", "<D>"],
  "optionsEN":     ["<A>", "<B>", "<C>", "<D>"],
  "answerEN":      "<A | B | C | D — whichever is marked correct; default A if unclear>",
  "explanationBN": "<explanation in Bengali if not present, give a very short explanation in Bengali>",
  "explanationEN": "<English translation of explanation if not present, give a very short explanation in English>",
  "year":          "<4-digit year if visible in image, otherwise empty string>",
  "sourceBN":      "<array of board/school/institution names in Bengali if visible — e.g. [\"ঢাকা বোর্ড\", \"রাজশাহী বোর্ড\"]. Single source still goes in an array: [\"ঢাকা বোর্ড\"]. Empty array [] if none found>",
  "sourceEN":      "<array of the same sources translated to English — e.g. [\"Dhaka Board\", \"Rajshahi Board\"]. Must match sourceBN order. Empty array [] if none found>",
  "subjectEN":     "<pick the single closest match from the subject list below>",
  "subjectBN":     "<the Bengali name of the chosen subject, exactly as shown in the list>",
  "chapterEN":     "<pick the single closest matching chapter for the chosen subject from the list below>",
  "chapterBN":     "<the Bengali name of the chosen chapter, exactly as shown in the list>",
  "difficulty":    "<Easy | Medium | Hard — judge by question complexity>",
  "lowConfidence": <true if the text was blurry, partially cut off, handwritten, or you were uncertain about any field — else false>,
  "hasQuestionImage":  <true if this question contains a diagram, figure, graph, circuit, or any image that is part of the question — else false>,
  "questionImageType": "<'image-only' if the question is entirely an image with no text | 'image-and-text' if both present | null if no image>",
  "questionImageCrop": <null if no image, otherwise { "xPct": <0-1>, "yPct": <0-1>, "wPct": <0-1>, "hPct": <0-1> } — TIGHT bounding box of the diagram only, excluding all surrounding text. Coordinates are normalized 0-1 relative to full image dimensions>
}

Rules:
- subjectEN and chapterEN MUST be chosen exactly from the list below. Do not invent values.
- If fewer than 4 options exist in the image, fill remaining optionsBN/optionsEN with empty strings.
- sourceBN and sourceEN are always arrays. Even a single source must be wrapped: ["ঢাকা বোর্ড"]. Never a plain string.
- If the image contains a mix of board exams and school/college test papers, include all institution names found.
- Set lowConfidence: true if the image quality was poor for that question, text was ambiguous, correct answer was unclear, or you had to guess any field.
- questionImageCrop coordinates must be TIGHT around the diagram/figure only.
  Do NOT include the question text above or option text below the image.
  The crop should start at the very top edge of the diagram and end at the very bottom edge.
  Add no extra whitespace — the coordinates should capture only the visual element itself.
- Only set hasQuestionImage: true for actual diagrams, figures, graphs, circuits, maps, or visual content that is part of the question. Do not flag decorative elements or question numbering.
- Don't add A. B. C. D. or ক. খ. গ. ঘ. in the optionsBN and optionsEN. Just add the option text.
- Return ONLY the JSON object.

Valid subjects and chapters for ${stream}:
${subjectList || '(none defined yet — leave subjectEN, subjectBN, chapterEN, chapterBN as empty strings)'}
`

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: [
        { inlineData: { data: fileField.data.toString('base64'), mimeType: fileField.type } },
        prompt
      ]
    })

    const raw = response.text?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/, '').replace(/```$/, '').trim()

    // Validate it's actually JSON before returning
    JSON.parse(clean)

    return { result: clean }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Gemini API Error' })
  }
})
