import { createClient } from '@supabase/supabase-js'
import { normalizeText } from '~/utils/hashQuestion'
import { createHash } from 'crypto'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const { questions, stream } = await readBody(event)

    const supabase = createClient(
        stream.startsWith('HSC') ? config.public.supabaseCortexHSC_URL : config.public.supabaseCortexMedical_URL,
        stream.startsWith('HSC') ? config.public.supabaseCortexHSC_KEY : config.public.supabaseCortexMedical_KEY
    )

    // Hash each incoming question's Bengali text
    const hashes = questions.map((q: any) => {
        const normalized = normalizeText(q.questionBN || '')
        return createHash('sha256').update(normalized).digest('hex')
    })

    // Single indexed query — no full table scan
    const { data, error } = await supabase
        .from('questions')
        .select('question_hash')
        .in('question_hash', hashes)

    if (error) throw createError({ statusCode: 500, message: error.message })

    const foundHashes = new Set((data || []).map(r => r.question_hash))

    // Map results back to questionBN for compatibility with existing code
    const results = questions.map((q: any) => {
        const normalized = normalizeText(q.questionBN || '')
        const hash = createHash('sha256').update(normalized).digest('hex')
        return { questionBN: q.questionBN, isDuplicate: foundHashes.has(hash) }
    })

    return { results }
})