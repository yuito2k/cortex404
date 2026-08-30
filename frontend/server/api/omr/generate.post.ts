// server/api/omr/generate.post.ts
//
// Generates a per-student OMR answer sheet.
//
// Flow
// ────
// 1. Verify user session via Supabase
// 2. Check no active sheet already exists for this user + subject
// 3. Fetch and shuffle questions from the question bank
// 4. Call Python OMR service  POST {OMR_SERVICE_URL}/generate
// 5. Return { sheet_code, signed_url } to the client

import { createClient } from '@supabase/supabase-js'
import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // ── Auth ────────────────────────────────────────────────────────────────
  const supabase = await serverSupabaseClient(event)
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw createError({ statusCode: 401, message: 'Unauthorised' })
  }

  // ── Request body ────────────────────────────────────────────────────────
  const body = await readBody(event)
  const {
    exam_id,
    //question_count = 25,
  } = body

  if (!exam_id) {
    throw createError({ statusCode: 400, message: 'exam_id is required' })
  }

  //if (question_count < 1 || question_count > 25) {
    //throw createError({ statusCode: 400, message: 'question_count must be between 1 and 25' })
  //}

  // ── Duplicate check ──────────────────────────────────────────────────────
  // Prevent generating a new sheet if one is already active for this subject
  const adminSb = serverSupabaseServiceRole(event)
  const { data: existing } = await adminSb
    .from('omr_sheets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (existing && existing.length > 0) {
    const active = existing[0]
    // Return the existing sheet instead of generating a duplicate
    const signed = await adminSb.storage
      .from('omr-sheets')
      .createSignedUrl(`${user.id}/${active.sheet_code}.pdf`, 3600)

    return {
      sheet_code:  active.sheet_code,
      signed_url:  signed.data?.signedUrl ?? active.pdf_url,
      is_existing: true,
      created_at:  active.created_at,
    }
  }

  // ── Fetch questions ──────────────────────────────────────────────────────
  // Adjust the query to match your exact questions table schema.
  // This assumes: id, question_text, option_a, option_b, option_c, option_d,
  //               correct_option (0-indexed int), subject_code, chapter_id
  let exam_data = null
  if (exam_id) {
    const { data: sessionData } = await adminSb
      .from('preset_exams')
      .select('*')
      .eq('id', exam_id)
      .single()
    exam_data = sessionData
  }

  const config = useRuntimeConfig(event)

  const sup = createClient(
       exam_data.stream.startsWith('HSC') ? config.public.supabaseCortexHSC_URL : config.public.supabaseCortexMedical_URL,
       exam_data.stream.startsWith('HSC') ? config.public.supabaseCortexHSC_KEY : config.public.supabaseCortexMedical_KEY
  )

  const ids: number[] = exam_data?.question_ids
    //if (ids.length) {

  //const supa = selectedSession.value?.stream.includes('HSC') ? HSC_supabase : Medical_supabase

  let query = sup
    .from('questions')
    .select('*')
    .in('id', ids)

  const { data: allQuestions, error: qError } = await query

  if (qError || !allQuestions || allQuestions.length === 0) {
    throw createError({
      statusCode: 500,
      message: `No questions found for exam_id ${exam_id}`
    })
  }

  //if (allQuestions.length < question_count) {
  //  throw createError({
  //    statusCode: 400,
  //    message: `Only ${allQuestions.length} questions available, but ${question_count} requested`
  //  })
  //}

  // Fisher-Yates shuffle then slice — unique order per student
  const shuffled = [...allQuestions]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  //const selected = shuffled.slice(0, question_count)
  const selected = shuffled

  // ── Format questions for the Python service ──────────────────────────────
  console.log(selected)
  const questions = selected.map((q: any) => ({
    id:            q.id,
    text:          q.question,
    options:       [q.option_a, q.option_b, q.option_c, q.option_d],
    correct_index: q.correct_index,   // 0=A, 1=B, 2=C, 3=D
  }))

  // ── Fetch student profile for the sheet header ───────────────────────────
  const { data: profile } = await adminSb
    .from('profiles')
    .select('full_name, student_id')
    .eq('id', user.id)
    .single()

  // ── Call Python OMR service ──────────────────────────────────────────────
  const OMR_SERVICE_URL = process.env.OMR_SERVICE_URL ?? 'http://localhost:8000'

  const payload = {
    student_id:      user.id,
    student_name: profile?.full_name ?? user.email ?? 'Student',
    //student_id:   profile?.student_id ?? user.id.slice(0, 8).toUpperCase(),
    exam_id,
    questions,
  }

  let omrResponse: any
  try {
    const res = await $fetch(`${OMR_SERVICE_URL}/generate`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    omrResponse = res
  } catch (err: any) {
    console.error('[OMR] /generate failed:', err)
    throw createError({
      statusCode: 502,
      message: 'OMR service unavailable. Please try again in a moment.',
    })
  }

  return {
    sheet_code:  omrResponse.sheet_code,
    signed_url:  omrResponse.signed_url,
    is_existing: false,
    status:      'generated',
  }
})
