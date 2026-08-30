// server/api/exam/[token].get.ts
//
// Public endpoint backing the student-facing /exam/[token] page.
// Uses the SERVICE ROLE client deliberately — see
// teacher-dashboard-schema-v2-security-fix.sql for why direct
// table access from the browser was removed. This route is the
// only legitimate way to read a teacher exam's content, and it
// strips correct_index / explanation / model_answer / access_code
// before anything goes back to the client.
//
// Called twice by the page:
//   1. On mount, no `code` query param → returns metadata only,
//      with `unlocked: false`, so the page can render the gate.
//   2. After the student enters a code (or immediately, for public
//      exams) → returns metadata AND the sanitized question set.

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  const { code } = getQuery(event)
  if (!token) throw createError({ statusCode: 400, message: 'Missing exam token' })

  const supabase = serverSupabaseServiceRole(event)
  const user = await serverSupabaseUser(event).catch(() => null)

  const { data: exam, error: examErr } = await supabase
    .from('teacher_exams')
    .select('*')
    .eq('share_token', token)
    .maybeSingle()

  if (examErr) throw createError({ statusCode: 500, message: examErr.message })
  if (!exam || exam.status !== 'published') {
    throw createError({ statusCode: 404, message: "This exam link isn't valid or is no longer available." })
  }

  // ── Schedule gate ────────────────────────────────────────────
  const now = Date.now()
  let scheduleStatus: 'open' | 'not_open' | 'closed' = 'open'
  if (exam.starts_at && now < new Date(exam.starts_at).getTime()) scheduleStatus = 'not_open'
  if (exam.ends_at && now > new Date(exam.ends_at).getTime()) scheduleStatus = 'closed'

  // ── Teacher display info (service role bypasses profiles RLS) ─
  const { data: teacherProfile } = await supabase
    .from('profiles')
    .select('full_name, teacher_org')
    .eq('user_id', exam.teacher_id)
    .maybeSingle()

  // ── Attempts already used, for logged-in students only ───────
  let attemptsUsed = 0
  if (user) {
    const { count } = await supabase
      .from('teacher_exam_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', exam.id)
      .eq('student_id', user.id)
    attemptsUsed = count ?? 0
  }

  const meta = {
    title: exam.title,
    description: exam.description,
    access_type: exam.access_type,
    duration_mins: exam.duration_mins,
    max_attempts: exam.max_attempts,
    attempts_used: attemptsUsed, // 0 for guests — can't be reliably tracked without an account
    show_result_immediately: exam.show_result_immediately,
    has_written_section: exam.has_written_section,
    negative_marking: exam.negative_marking,
    mcq_count: exam.mcq_count,
    written_count: exam.written_count,
    total_mcq_marks: exam.total_mcq_marks,
    total_written_marks: exam.total_written_marks,
    teacher_name: teacherProfile?.full_name ?? null,
    teacher_org: teacherProfile?.teacher_org ?? null,
    schedule_status: scheduleStatus,
    starts_at: exam.starts_at,
    ends_at: exam.ends_at,
  }

  if (scheduleStatus !== 'open') {
    return { exam: meta, unlocked: false }
  }
  if (user && attemptsUsed >= exam.max_attempts) {
    return { exam: meta, unlocked: false, attempts_exhausted: true }
  }

  const isUnlockAttempt = exam.access_type === 'public' || (typeof code === 'string' && code.trim().length > 0)
  if (!isUnlockAttempt) {
    return { exam: meta, unlocked: false }
  }
  if (exam.access_type === 'private' && String(code).trim().toUpperCase() !== String(exam.access_code).trim().toUpperCase()) {
    return { exam: meta, unlocked: false, wrong_code: true }
  }

  // ── Unlocked: fetch + sanitize content ────────────────────────
  const { data: mcqRows, error: mcqErr } = await supabase
    .from('teacher_exam_questions')
    .select('id, order_index, marks, snapshot')
    .eq('exam_id', exam.id)
    .order('order_index', { ascending: true })

  if (mcqErr) throw createError({ statusCode: 500, message: mcqErr.message })

  let questions = mcqRows.map(row => {
    const s = row.snapshot ?? {}
    return {
      id: row.id,
      marks: row.marks,
      question: s.question,
      options: s.options,
      question_image: s.question_image ?? null,
      stimulus: s.stimulus ?? null,
      stimulus_image: s.stimulus_image ?? null,
      // correct_index / explanation deliberately omitted
    }
  })

  if (exam.shuffle_questions) {
    questions = questions
      .map(q => ({ q, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ q }) => q)
  }

  let writtenQuestions: any[] = []
  if (exam.has_written_section) {
    const { data: writtenRows, error: writtenErr } = await supabase
      .from('teacher_exam_written_questions')
      .select('id, order_index, type, marks, question_text, question_image_url')
      .eq('exam_id', exam.id)
      .order('order_index', { ascending: true })

    if (writtenErr) throw createError({ statusCode: 500, message: writtenErr.message })
    writtenQuestions = writtenRows // model_answer column wasn't selected — never reaches the client
  }

  return { exam: meta, unlocked: true, questions, written_questions: writtenQuestions }
})
