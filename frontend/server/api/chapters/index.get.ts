import { createClient } from '@supabase/supabase-js'
//import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
    //const supabase = await serverSupabaseClient(event)
    const config = useRuntimeConfig(event)
    const { stream, subject, text_book } = getQuery(event)

    if (!stream) throw createError({ statusCode: 400, message: 'stream is required' })

    const supabase = createClient(
        stream.startsWith('HSC') ? config.public.supabaseCortexHSC_URL : config.public.supabaseCortexMedical_URL,
        stream.startsWith('HSC') ? config.public.supabaseCortexHSC_KEY : config.public.supabaseCortexMedical_KEY
    )

    let query = supabase
        .from('questions')
        .select('chapter')
        .eq('status', 'published')
        .eq('exam', stream)

    if (subject && subject !== 'All') {
        query = query.eq('subject->>english', subject)
    }

    if (text_book && text_book !== 'All') {
        query = query.eq('text_book', text_book)
    }

    const { data, error } = await query

    if (error) throw createError({ statusCode: 500, message: error.message })

    const counts: Record<string, number> = {}
    data.forEach(r => {
        const name = r.chapter?.english  // or whichever lang key
        counts[name] = (counts[name] ?? 0) + 1
    })

    // Extract unique english chapter names from the JSONB and their count
    //    const chapters = [
    //        ...new Set(
    //            data
    //                ?.map(r => r.chapter?.english)
    //                .filter(Boolean)
    //        )
    //    ].sort()
    //
    //    return chapters
    return Object.entries(counts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name))
})