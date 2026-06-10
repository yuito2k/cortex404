//import { createClient } from '@supabase/supabase-js'
//
//function normalize(text: string): string {
//    return text
//        .normalize('NFC')           // consistent unicode form
//        .replace(/\s+/g, ' ')       // collapse all whitespace
//        .replace(/[?？।]/g, '')     // strip punctuation variants
//        .trim()
//        .toLowerCase()
//}
//
//export default defineEventHandler(async (event) => {
//    const config = useRuntimeConfig(event)
//    const { questions, stream, chapterEN } = await readBody(event)
//
//    const supabase = createClient(
//        stream === 'HSC' ? config.public.supabaseCortexHSC_URL : config.public.supabaseCortexMedical_URL,
//        stream === 'HSC' ? config.public.supabaseCortexHSC_KEY : config.public.supabaseCortexMedical_KEY
//    )
//
//    // Pull all Bengali question texts from db
//    const { data, error } = await supabase
//        .from('questions')
//        .select('question')
//        .eq('chapter->>english', chapterEN)
//
//    if (error) throw createError({ statusCode: 500, message: error.message })
//
//    // Build normalized set from db
//    const dbNormalized = new Set(
//        (data || []).map(row => normalize(row.question?.bangla || ''))
//    )
//
//    // Check each incoming question
//    const results = questions.map((q: any) => ({
//        questionBN: q.questionBN,
//        isDuplicate: dbNormalized.has(normalize(q.questionBN || ''))
//    }))
//
//    return { results }
//})

import { createClient } from '@supabase/supabase-js'

function normalize(text: string): string {
    return text
        .normalize('NFC')
        .replace(/\s+/g, ' ')
        .replace(/[?？।]/g, '')
        .trim()
        .toLowerCase()
}

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const { questions, stream } = await readBody(event)

    const supabase = createClient(
        stream === 'HSC' ? config.public.supabaseCortexHSC_URL : config.public.supabaseCortexMedical_URL,
        stream === 'HSC' ? config.public.supabaseCortexHSC_KEY : config.public.supabaseCortexMedical_KEY
    )

    // Get all unique chapters from incoming questions
    const uniqueChapters = [...new Set(
        questions.map((q: any) => q.chapterEN).filter(Boolean)
    )]

    // Get all unique subjects from incoming questions
    const uniqueSubjects = [...new Set(
        questions.map((q: any) => q.subjectEN).filter(Boolean)
    )]

    // Query only those chapters in one request
    const { data, error } = await supabase
        .from('questions')
        .select('question')
        .in('subject->>english', uniqueSubjects)
        .in('chapter->>english', uniqueChapters)

    if (error) throw createError({ statusCode: 500, message: error.message })

    // Build normalized set from db
    const dbNormalized = new Set(
        (data || []).map(row => normalize(row.question?.bangla || ''))
    )

    const results = questions.map((q: any) => ({
        questionBN: q.questionBN,
        isDuplicate: dbNormalized.has(normalize(q.questionBN || ''))
    }))

    return { results }
})