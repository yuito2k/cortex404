// server/api/analyze-question-bulk.post.ts
import { GoogleGenAI } from '@google/genai'
import { curriculum } from '~/utils/curriculum'

// Safety net: if the model emits "@@command" without the required <<>> / [[]]
// wrapper (most common in short optionsEN/optionsBN entries), auto-wrap the
// whole string so renderLatexText can still pick it up on the client.
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
Scan the entire image for red dot (●) markers (only red coloured dot markers, not any other symbols or any other colour marks) next to any questions.
- If red dots ARE present: extract ONLY the red-dot-marked questions, up to a maximum of 30.
- If red dots are NOT present: extract ALL questions found, up to a maximum of 30.
- If fewer than 30 qualifying questions exist, extract all of them.

STEP 2 — EXTRACTION:
For each qualifying question, extract all fields carefully, then apply these post-processing steps IN ORDER before writing the final JSON:

  STEP 2a — STIMULUS INSTRUCTION SENTENCE:
  Look at the first sentence of any stimulus/উদ্দীপক block.
  IF it references specific question numbers from the sheet (e.g. "১২ ও ১৩ নম্বর প্রশ্নের উত্তর দাও", "৫ ও ৬ নং প্রশ্নের জবাব দাও", or any similar phrasing):
    → REPLACE that entire sentence (and ONLY that sentence) with:
      stimulusBN: "নিচের উদ্দীপকের আলোকে নিম্নলিখিত প্রশ্নগুলোর উত্তর দাও।"
      stimulusEN: "Answer the following questions based on the passage below."
  IF no such number-referencing sentence exists → leave the stimulus exactly as-is.
  The rest of the passage body after the instruction sentence is NEVER modified.

Before writing the final JSON, verify:
□ Does any stimulusBN still contain Bengali number words (নম্বর, নং) referring to question numbers? If yes, you missed STEP 2a — go back and replace that sentence now.

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

- questionBN, questionEN, stimulusBN, and stimulusEN must contain ONLY the literal printed sentence/passage text. Never add a description, mathematical expression, caption, or placeholder for a diagram, figure, graph, chart, or photo (e.g. do not write things like "[a diagram is shown]", "(see figure)", "চিত্র দেখানো হয়েছে", or a figure label like "চিত্র-১", or a mathematical expression like "(1+1)^2" or "x^2+y^2=z^2") into these fields — even if such a caption is visible in the image. Visual content itself is tracked separately via hasQuestionImage/hasStimulusImage and questionImageCrop, not described in text.
- Strip only the question's leading serial/numbering label from the start of questionBN and questionEN (e.g. "১.", "12)", "Q5.", "৪।") — never any other number. Numbers that are part of the actual question content (measurements, equation values, answer figures, etc.) must be kept exactly as they appear.

- Set hasStimulusImage: true only if the উদ্দীপক/stimulus block itself contains a visual element. Do not flag question diagrams here — those go in hasQuestionImage.
- questionBN must include the COMPLETE passage — this includes the opening sentence AND all numbered points (i), (ii), (iii) etc. that follow it. Never split the numbered points from their parent passage.
- A clear way to identify the boundary: the question stem always ends with a "?" and usually starts with "নিচের কোনটি" or "উপরের কোনটি" or similar. Add a newline before "নিচের কোনটি" or "উপরের কোনটি" or similar. Everything above that line belongs to questionBN including that line and excluding the stimulusBN if present.
- Don't add sourceEN or SourceBN or year in the question or stimulus text.
- Always use full form for sourceBN and sourceEN (e.g. "Dhaka Board" instead of "DB").
- All B'18 these type of expression means All Boards (2018) for sourceBN and sourceEN.
- Don't add A. B. C. D. or ক. খ. গ. ঘ. in the optionsBN and optionsEN. Just add the option text.
- years is always an array. Even a single year must be wrapped: ["2023"]. Never a plain string.

- MCQ options are sometimes printed in a 2-column grid (two options per row, stacked in two rows) rather than a single vertical list — look carefully at the spatial layout before assigning option order.
- Each option/answer choice is ALWAYS a single, independent, self-contained value. NEVER merge two adjacent options together, and NEVER join two options with a "/", "or", or any other separator inside one optionsBN/optionsEN entry.
- When options are in a 2-column grid, the typical reading order is: top-left = A, top-right = B, bottom-left = C, bottom-right = D — but always verify against the actual ⓐⓑⓒⓓ or ক-খ-গ-ঘ markers/bullets printed next to each option rather than assuming position alone.
- If you ever find yourself about to write a "/" or "or" inside a single option's text to join two different-looking expressions, STOP — that means you've misread two separate options as one. Split them into their correct optionsBN[i] / optionsEN[i] slots instead.

- A variable with a bar/overline above it (commonly used for complex conjugates, e.g. z̄, or averages, e.g. x̄) must use @@overline{...} — never write the word "overline" as plain text, and never drop it as a bare letter.
  EXAMPLE:
  "the modulus of z̄1 − z2 is" → "the modulus of <<@@overline{z_1} - z_2>> is"
  "x̄ এর মান" → "<<@@overline{x}>> এর মান"

- Every math/chemistry expression needs BOTH layers together — never one without the other:
  1. The outer delimiter: <<...>> for inline, [[...]] for display
  2. Inside that, every LaTeX backslash written as @@

  A segment is correct ONLY if it has both. An @@ command appearing outside of << >> or [[ ]] is WRONG and will not render.

  WRONG: Dividing by @@x^2@@, we get @@lim_{x @@to @@infty} @@frac{5}{7-3/x^2} = @@frac{5}{7-0} = @@frac{5}{7}@@
  RIGHT: Dividing by <<x^2>>, we get <<@@lim_{x @@to @@infty} @@frac{5}{7-3/x^2} = @@frac{5}{7-0} = @@frac{5}{7}>>
  
- The question mark "?" is ordinary punctuation, never part of the math itself — even when it directly follows an expression like "lim x->0 f(x) = ?". Do NOT write it as @@? or include it inside the << >> / [[ ]] wrapper at all. Close the math wrapper right after the last actual mathematical symbol, then place "?" as plain text outside it.

  WRONG: <<\lim_{x \to 0} \frac{f(\frac{\pi}{2}-3x)}{3x} = \?>>
  RIGHT: <<@@lim_{x @@to 0} @@frac{f(@@frac{@@pi}{2}-3x)}{3x} = >>?

- When a sentence contains a long CHAIN of expressions connected by words ("we get... = ... = ..."), you do not need to open and close a new << >> for every single piece — wrap the entire connected mathematical chain (including the "=" signs joining them) in ONE pair of << >>, as shown in the RIGHT example above. Only break out of << >> for actual prose words like "Dividing by" or "we get".

- Limit expressions must use the proper LaTeX limit command, never write "lim" as a plain variable or "->" as a literal arrow:
  - Use @@lim_{x @@to @@infty} for "lim as x approaches infinity"
  - Use @@to for any "approaches/tends to" arrow (never the literal characters "->")
  - Use @@infty for infinity (never the word "infinity" or the symbol ∞ typed directly, for consistency)
  EXAMPLE:
    "lim x->infinity (x^2+6x)/(2x^2+5) = ?" → "<<@@lim_{x @@to @@infty} \frac{x^2+6x}{2x^2+5} = ?>>"

- Greek letters and mathematical/scientific symbols must always be written as their actual sign, never spelled out as a word — in either Bengali or English. This applies inside math expressions AND in surrounding prose when referring to a quantity/variable.
  - Use: ∞, °, θ, π, ε, η, μ, σ, ρ, λ, γ, α, β, δ, φ, ψ, ω, Δ, Σ, ±, ≤, ≥, ≠, ≈
  - Never write: "theta", "infinity", "pi", "thita", "পাই", "থিটা", "মিউ", "ডেল্টা", or similar spelled-out forms.
- This applies even when the source image itself has the word spelled out (e.g. OCR'd handwriting saying "theta") — always normalize it to the symbol in your output.
- Arithmetic operators must also use signs, not words: +, −, ×, ÷, =, ≠ — never "plus", "minus", "যোগ", "বিয়োগ" when used as a math operator. (Note: if these words are used in ordinary sentence prose unrelated to a specific operation — e.g. "you must add the given values" — leave that prose as normal text; this rule only applies to symbol usage in/around expressions.)
  EXAMPLES:
    - "the angle theta is 90 degrees" → "the angle θ is 90°"
    - "ভর m এবং ত্বরণ a এর গুণফল হলো বল, F = m গুণ a" → "ভর m এবং ত্বরণ a এর গুণফল হলো বল, <<F = m \times a>>"
    - "resistivity rho of the material" → "resistivity ρ of the material"
    - "মান পাই এর সমান" → "মান π এর সমান"

- If any text field contains math, physics, or chemistry notation that needs proper typesetting, wrap ONLY that notation using these placeholder delimiters — do NOT use a literal backslash (\) anywhere in your output:
  - Inline math: <<...>>
  - Block/display math: [[...]]
  - Inside the math, write any LaTeX command using "@@" in place of a backslash. Example: instead of \frac{1}{2}, write @@frac{1}{2}.
  - A vector letter with a hat/cap (circumflex) accent above it denotes a unit vector (e.g. î, ĵ, k̂) and must NEVER be flattened to a plain letter. Wrap it using @@hat{...}: "î" → @@hat{i}, "ĵ" → @@hat{j}, "k̂" → @@hat{k}.
  - A vector letter with an arrow above it (e.g. A with an arrow) should use @@vec{...} the same way.
  - The degree symbol (°) must always stay as the literal "°" character. Never represent it as \circ, ^\circ, @circ, or any other escaped command.
  - A plain value like "90°" or "45°" needs NO LaTeX wrapping at all — leave it exactly as printed text.
  - If the degree value appears inside a larger expression that does need wrapping (e.g. an angle equation), keep the ° as a literal character inside the wrapper too — do not convert it.
  - EXAMPLES (input → correctly formatted output):
    "x^2 + 3x" → <<x^{2} + 3x>>
    "H2SO4" → <<H_2SO_4>>
    a fraction → <<@@frac{1}{2}>>
    a displayed integral → [[@@int_0^1 x^2@@,dx]]
    "the matrix (A^T + B)C" → "the matrix <<(A^T + B)C>>"
    "matrix [-3,0,-1],[0,3,p],[-1,4,0]" → "matrix [[@@begin{bmatrix} -3 & 0 & -1 @@@@ 0 & 3 & p @@@@ -1 & 4 & 0 @@end{bmatrix}]]"
    "H2SO4 reacts with NaOH" → "<<H_2SO_4>> reacts with NaOH"
    "x^2 + 3x - 5 = 0" → "<<x^2 + 3x - 5 = 0>>"
    "2î − 3ĵ + 7k̂ বরাবর একক ভেক্টর কোনটি?" → "<<2@@hat{i} - 3@@hat{j} + 7@@hat{k}>> বরাবর একক ভেক্টর কোনটি?"
    "the angle is 90°" → "the angle is 90°" (unchanged, no wrapping)
    "∠ABC = 45° এবং ∠BCD = 60°" → "<<\angle ABC = 45°>> এবং <<\angle BCD = 60°>>"
- Do not LaTeX-wrap plain words or simple integers — only genuine math/chemistry expressions.

- Return ONLY the JSON object.

Valid subjects and chapters for ${stream}:
${subjectList || '(none defined yet — leave subjectEN, subjectBN, chapterEN, chapterBN as empty strings)'}
`

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      //model: 'gemma-4-31b-it',
      config: {
        temperature: 0.0,
      },
      contents: [
        { inlineData: { data: fileField.data.toString('base64'), mimeType: fileField.type } },
        prompt
      ]
    })

    const raw = response.text?.trim() ?? ''
    const clean = raw.replace(/^```json\s*/, '').replace(/```$/, '').trim()

    // Validate it's parseable JSON before returning
    const parsedObj = JSON.parse(clean)

    // Safety net: auto-wrap any stray @@ LaTeX in options that the model
    // forgot to enclose in << >> / [[ ]]
    for (const q of parsedObj.questions ?? []) {
      q.optionsEN = fixOptionsArray(q.optionsEN)
      q.optionsBN = fixOptionsArray(q.optionsBN)
    }

    return { result: JSON.stringify(parsedObj) }
  } catch (error: any) {
    throw createError({ statusCode: 500, message: error.message || 'Gemini API Error' })
  }
})
