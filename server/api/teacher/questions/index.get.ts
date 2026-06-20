// server/api/teacher/questions.get.ts
//
// Paginated, filterable question browser for the teacher dashboard.
// Builds on the same per-stream-project pattern as server/api/qbank
// (index.get.ts) but:
//   1. Maps every stream to its project explicitly instead of the
//      HSC/else-Medical shortcut, so BUET/BCS/SSC don't silently hit
//      the wrong database.
//   2. Adds pagination + total count (the qbank endpoint had `limit`
//      commented out — fine for "give me N random questions", not
//      fine for "let a teacher page through everything").
//   3. Adds a `search` param (matches question text, both languages).

import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const {
    stream,
    subject,
    chapter,
    difficulty,
    search,
    page = '1',
    pageSize = '15',
  } = getQuery(event)

  if (!stream || typeof stream !== 'string') {
    throw createError({ statusCode: 400, message: 'stream is required' })
  }

  // ── Stream → Supabase project map ──────────────────────────
  // Extend this as new streams get their own project. Anything not
  // listed explicitly falls back to a default rather than silently
  // querying Medical's DB (the bug in the original qbank handler).
  const STREAM_PROJECTS: Record<string, { url: string; key: string }> = {
    'HSC Science':  { url: config.public.supabaseCortexHSC_URL,     key: config.public.supabaseCortexHSC_KEY },
    'HSC Arts':      { url: config.public.supabaseCortexHSC_URL,     key: config.public.supabaseCortexHSC_KEY },
    'HSC Commerce':  { url: config.public.supabaseCortexHSC_URL,     key: config.public.supabaseCortexHSC_KEY },
    'SSC Science':   { url: config.public.supabaseCortexHSC_URL,     key: config.public.supabaseCortexHSC_KEY },
    'SSC Arts':      { url: config.public.supabaseCortexHSC_URL,     key: config.public.supabaseCortexHSC_KEY },
    'SSC Commerce':  { url: config.public.supabaseCortexHSC_URL,     key: config.public.supabaseCortexHSC_KEY },
    Medical:         { url: config.public.supabaseCortexMedical_URL, key: config.public.supabaseCortexMedical_KEY },
    BUET:            { url: config.public.supabaseCortexMedical_URL, key: config.public.supabaseCortexMedical_KEY }, // TODO: give BUET its own project, riding on Medical's for now
    BCS:             { url: config.public.supabaseCortexMedical_URL, key: config.public.supabaseCortexMedical_KEY },
  }

  const project = STREAM_PROJECTS[stream] ?? STREAM_PROJECTS['HSC Science']
  if (!project.url || !project.key) {
    throw createError({ statusCode: 500, message: `No Supabase project configured for stream "${stream}"` })
  }

  const supabase = createClient(project.url, project.key)

  const pageNum  = Math.max(1, parseInt(String(page), 10) || 1)
  const sizeNum  = Math.min(50, Math.max(1, parseInt(String(pageSize), 10) || 15))
  const from     = (pageNum - 1) * sizeNum
  const to       = from + sizeNum - 1

  let query = supabase
    .from('questions')
    .select('*', { count: 'exact' })
    .eq('status', 'published')
    .eq('exam', stream)

  if (subject && subject !== 'All') {
    query = query.eq('subject->>english', subject as string)
  }
  if (chapter && chapter !== 'All' && chapter !== 'undefined') {
    query = query.eq('chapter->>english', chapter as string)
  }
  if (difficulty && difficulty !== 'All') {
    query = query.eq('difficulty_level', String(difficulty).toLowerCase())
  }
  if (search && String(search).trim()) {
    // Matches either language. ilike on a jsonb->>text path.
    const term = `%${String(search).trim()}%`
    query = query.or(`question->>english.ilike.${term},question->>bangla.ilike.${term}`)
  }

  query = query.order('id', { ascending: true }).range(from, to)

  const { data, error, count } = await query

  if (error) throw createError({ statusCode: 500, message: error.message })

  return {
    data,
    page: pageNum,
    pageSize: sizeNum,
    total: count ?? 0,
    totalPages: count ? Math.ceil(count / sizeNum) : 0,
  }
})
