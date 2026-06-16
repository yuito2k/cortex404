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
      "questionBN":    "<full question text in Bengali exactly as it appears. Don't add image or image description or image instructions in questionBN>",
      "questionEN":    "<accurate English translation>",
      "optionsBN":     ["<A>", "<B>", "<C>", "<D>"],
      "optionsEN":     ["<A>", "<B>", "<C>", "<D>"],
      "answerEN":      "<A | B | C | D — whichever is marked correct; default A if unclear>",
      "explanationBN": "<explanation in Bengali if not present, give a very short explanation in Bengali>",
      "explanationEN": "<English translation of explanation if not present, give a very short explanation in English>",
      "years":         "<array of 4-digit years if visible — e.g. [\"2023\", \"2024\"]. Single year still goes in array: [\"2023\"]. Empty array [] if none found>",
      "sourceBN":      "<array of board/school/institution names in Bengali if visible — e.g. [\"ঢাকা বোর্ড\", \"রাজশাহী বোর্ড\"]. Single source still goes in an array: [\"ঢাকা বোর্ড\"]. Empty array [] if none found>",
      "sourceEN":      "<array of the same sources translated to English — e.g. [\"Dhaka Board\", \"Rajshahi Board\"]. Must match sourceBN order. Empty array [] if none found>",
      "subjectEN":     "<pick the single closest match from the subject list below>",
      "subjectBN":     "<Bengali name of chosen subject exactly as in the list>",
      "chapterEN":     "<pick the single closest matching chapter for the chosen subject>",
      "chapterBN":     "<Bengali name of chosen chapter exactly as in the list>",
      "difficulty":    "<Easy | Medium | Hard>",
      "stimulusBN":    "<shared passage/উদ্দীপক text in Bengali exactly as it appears (with instructions if available in/up the question ex-> 'নিচের উদ্দীপকের আলোকে পরবর্তী দুটি প্রশ্নের উত্তর দাও:' something like this) if this question is part of a stimulus group, else empty string. Don't add image or image description or image instructions in stimulusBN>",
      "stimulusEN":    "<accurate English translation of the passage if present, else empty string>",
      "hasStimulusImage": <true if the stimulus/passage section contains a diagram, figure, circuit, graph or any visual element — else false>
      "redDot":        <true if this specific question had a red dot, else false>,
      "lowConfidence": <true if the text was blurry, partially cut off, handwritten, or you were uncertain about any field — else false>,
      "hasQuestionImage":  <true if this question contains a diagram, figure, graph, circuit, or any image that is part of the question — else false>,
      "questionImageType": "<'image-only' if the question is entirely an image with no text | 'image-and-text' if both present | null if no image>",
      "questionImageCrop": <null if no image, otherwise { "xPct": <0-1>, "yPct": <0-1>, "wPct": <0-1>, "hPct": <0-1> } — normalized coordinates of the image region relative to the full sheet width and height>
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
- For questionImageCrop, coordinates are percentages (0 to 1) of the total image dimensions. xPct/yPct are the top-left corner, wPct/hPct are width and height of the region.
- Only set hasQuestionImage: true for actual diagrams, figures, graphs, circuits, maps, or visual content that is part of the question. Do not flag decorative elements or question numbering.
- If multiple questions share a common passage/stimulus (উদ্দীপক) printed above them, copy that exact passage into stimulusBN for each of those questions. Same passage = same stimulusBN text across all linked questions.
- If a question has no shared passage, set stimulusBN and stimulusEN to empty strings.
- Set hasStimulusImage: true only if the উদ্দীপক/stimulus block itself contains a visual element. Do not flag question diagrams here — those go in hasQuestionImage.
- questionBN must include the COMPLETE passage — this includes the opening sentence AND all numbered points (i), (ii), (iii) etc. that follow it. Never split the numbered points from their parent passage.
- A clear way to identify the boundary: the question stem always ends with a "?" and usually starts with "নিচের কোনটি" or "উপরের কোনটি" or similar. Add a newline before "নিচের কোনটি" or "উপরের কোনটি" or similar. Everything above that line belongs to questionBN including that line and excluding the stimulusBN if present.
- Don't add sourceEN or SourceBN or year in the question or stimulus text.
- Always use full form for sourceBN and sourceEN (e.g. "Dhaka Board" instead of "DB").
- All B'18 these type of expression means All Boards (2018) for sourceBN and sourceEN.
- Don't add A. B. C. D. or ক. খ. গ. ঘ. in the optionsBN and optionsEN. Just add the option text.
- years is always an array. Even a single year must be wrapped: ["2023"]. Never a plain string.
- Don't include serial numbers (if present in the image) in questionBN and questionEN text.
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

    // Validate it's parseable JSON before returning
    JSON.parse(clean)

    return { result: clean }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Gemini API Error' })
  }
})
