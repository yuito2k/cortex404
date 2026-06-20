// server/api/exam/[token]/submit.post.ts
//
// Grades the MCQ section server-side (never trusts a client-sent
// score) and stores the attempt. If the exam has a written
// section, those answers are stored ungraded — the teacher grades
// them later from /dashboard/teacher/exams/[id].

import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

interface SubmitBody {
  mcq_answers: Record<string, number>          // { [teacher_exam_questions.id]: selected_index }
  written_answers?: Record<string, { text: string; image_url?: string | null }>
  guest_name?: string
  guest_contact?: string
}

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) throw createError({ statusCode: 400, message: 'Missing exam token' })

  const body = await readBody<SubmitBody>(event)
  const supabase = serverSupabaseServiceRole(event)
  const user = await serverSupabaseUser(event).catch(() => null)

  if (!user && !body.guest_name?.trim()) {
    throw createError({ statusCode: 400, message: 'Name is required to submit as a guest' })
  }

  const { data: exam, error: examErr } = await supabase
    .from('teacher_exams')
    .select('*')
    .eq('share_token', token)
    .maybeSingle()

  if (examErr) throw createError({ statusCode: 500, message: examErr.message })
  if (!exam || exam.status !== 'published') {
    throw createError({ statusCode: 404, message: "This exam link isn't valid or is no longer available." })
  }

  const now = Date.now()
  if (exam.ends_at && now > new Date(exam.ends_at).getTime()) {
    throw createError({ statusCode: 403, message: 'This exam has closed and can no longer accept submissions.' })
  }

  // ── Attempt limit (logged-in students only) ──────────────────
  let attemptNumber = 1
  if (user) {
    const { count } = await supabase
      .from('teacher_exam_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('exam_id', exam.id)
      .eq('student_id', user.id)
    attemptNumber = (count ?? 0) + 1
    if (attemptNumber > exam.max_attempts) {
      throw createError({ statusCode: 403, message: "You've used all of your attempts for this exam." })
    }
  }

  // ── Resolve a display name to denormalize onto the attempt ───
  let studentName = body.guest_name?.trim() || 'Guest'
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('full_name').eq('user_id', user.id).maybeSingle()
    studentName = profile?.full_name || user.email || 'Student'
  }

  // ── Grade the MCQ section against the REAL snapshot ───────────
  const { data: mcqRows, error: mcqErr } = await supabase
    .from('teacher_exam_questions')
    .select('id, marks, snapshot')
    .eq('exam_id', exam.id)

  if (mcqErr) throw createError({ statusCode: 500, message: mcqErr.message })

  let correct = 0, wrong = 0, skipped = 0
  let mcqMarksEarned = 0
  const totalMcqMarksPossible = mcqRows.reduce((s, r) => s + Number(r.marks), 0)

  const review = mcqRows.map(row => {
    const selected = body.mcq_answers?.[row.id]
    const correctIndex = row.snapshot?.correct_index
    const marks = Number(row.marks)
    let outcome: 'correct' | 'wrong' | 'skipped'

    if (selected === undefined || selected === null) {
      outcome = 'skipped'; skipped++
    } else if (selected === correctIndex) {
      outcome = 'correct'; correct++; mcqMarksEarned += marks
    } else {
      outcome = 'wrong'; wrong++
      if (exam.negative_marking) mcqMarksEarned -= marks * Number(exam.negative_mark_value)
    }

    return exam.show_result_immediately
      ? {
          id: row.id,
          question: row.snapshot?.question,
          options: row.snapshot?.options,
          correct_index: correctIndex,
          explanation: row.snapshot?.explanation,
          selected: selected ?? null,
          outcome,
          marks,
        }
      : null
  }).filter(Boolean)

  mcqMarksEarned = Math.max(0, Math.round(mcqMarksEarned * 100) / 100)

  const hasWritten = exam.has_written_section
  const totalMarksPossible = totalMcqMarksPossible + (hasWritten ? Number(exam.total_written_marks) : 0)

  // ── Store the attempt ──────────────────────────────────────────
  const { data: attempt, error: insertErr } = await supabase
    .from('teacher_exam_attempts')
    .insert({
      exam_id: exam.id,
      student_id: user?.id ?? null,
      guest_name: user ? null : body.guest_name?.trim(),
      guest_contact: user ? null : (body.guest_contact?.trim() || null),
      student_name: studentName,
      attempt_number: attemptNumber,
      mcq_answers: body.mcq_answers ?? {},
      written_answers: body.written_answers ?? {},
      mcq_correct_count: correct,
      mcq_wrong_count: wrong,
      mcq_skipped_count: skipped,
      mcq_marks_earned: mcqMarksEarned,
      written_graded: !hasWritten, // nothing to grade → already "done"
      total_marks_earned: mcqMarksEarned, // written marks added in later once graded
      total_marks_possible: totalMarksPossible,
      status: hasWritten ? 'submitted' : 'graded',
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (insertErr) throw createError({ statusCode: 500, message: insertErr.message })

  return {
    attempt_id: attempt.id,
    show_result_immediately: exam.show_result_immediately,
    has_written_section: hasWritten,
    mcq_correct_count: correct,
    mcq_wrong_count: wrong,
    mcq_skipped_count: skipped,
    mcq_marks_earned: mcqMarksEarned,
    total_mcq_marks_possible: totalMcqMarksPossible,
    total_written_marks: hasWritten ? Number(exam.total_written_marks) : 0,
    review: exam.show_result_immediately ? review : null,
  }
})
