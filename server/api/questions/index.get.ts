import { createClient } from '@supabase/supabase-js'
//import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    //const supabase = await serverSupabaseClient(event)
    const config = useRuntimeConfig(event)
    const { stream, subject, chapter, difficulty, limit } = getQuery(event)

    const supabase = createClient(
        stream.startsWith('HSC') ? config.public.supabaseCortexHSC_URL : config.public.supabaseCortexMedical_URL,
        stream.startsWith('HSC') ? config.public.supabaseCortexHSC_KEY : config.public.supabaseCortexMedical_KEY
    )

    //let query = supabase
    //    .from('questions')
    //    .select('*')
    //    .eq('status', 'published')
    //    .eq('exam', stream)

    //if (subject && subject !== 'All') {
    //    query = query.eq('subject->>english', subject)
    //}

    //if (chapter && chapter !== 'All') {
    //    if (chapter !== 'undefined') {
    //        query = query.eq('chapter->>english', chapter)
    //    }
    //}

    //if (difficulty && difficulty !== 'mixed') {
    //    query = query.eq('difficulty_level', difficulty)
    //}

    //query = query.limit(Number(limit) || 100)

    //const { data, error } = await query

    const { data, error } = await supabase
        .rpc('get_random_questions', {
            p_exam: stream,
            p_subject: (subject && subject !== 'All') ? subject : null,
            p_chapter: (chapter && chapter !== 'All') ? chapter : null,
            //p_difficulty: (difficulty && difficulty !== 'mixed') ? difficulty : null,
            p_limit: Number(limit) || 100,
        })

    if (error) throw createError({ statusCode: 500, message: error.message })

    return data
})