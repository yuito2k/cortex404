// server/api/teacher/exams.post.ts
//
// Creates a teacher_exams row plus its teacher_exam_questions and
// (optionally) teacher_exam_written_questions, all in the CORE app
// DB (the same project as `profiles`) — not the per-stream question
// projects. Snapshots each selected question so the exam keeps
// working even if the source question changes later.

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

interface IncomingMcq {
  question_id: number
  source_stream: string
  marks?: number
  // Full row as returned by /api/teacher/questions — gets frozen as `snapshot`.
  snapshot: Record<string, any>
}

interface IncomingWritten {
  type?: 'saq' | 'creative' | 'long'
  marks?: number
  question_text: string
  question_image_url?: string | null
  model_answer?: string | null
}

interface ExamPayload {
  title: string
  description?: string
  access_type: 'public' | 'private'
  access_code?: string | null
  starts_at?: string | null
  ends_at?: string | null
  duration_mins: number
  max_attempts: number
  show_result_immediately: boolean
  shuffle_questions: boolean
  negative_marking: boolean
  negative_mark_value: number
  has_written_section: boolean
  questions: IncomingMcq[]
  written_questions: IncomingWritten[]
  status?: 'draft' | 'published'
}

function generateToken(): string {
  // 10-char URL-safe slug — no external deps needed.
  return crypto.randomUUID().replace(/-/g, '').slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) throw createError({ statusCode: 401, message: 'Not authenticated' })

  const body = await readBody<ExamPayload>(event)

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, message: 'Exam title is required' })
  }
  if (!body.questions?.length) {
    throw createError({ statusCode: 400, message: 'Add at least one question before creating the exam' })
  }
  if (body.has_written_section && !body.written_questions?.length) {
    throw createError({ statusCode: 400, message: 'Written section is enabled but no written questions were added' })
  }
  if (body.access_type === 'private' && !body.access_code?.trim()) {
    throw createError({ statusCode: 400, message: 'Private exams require an access code' })
  }

  const coverStreams = Array.from(new Set(body.questions.map(q => q.source_stream)))
  const totalMcqMarks = body.questions.reduce((sum, q) => sum + (q.marks ?? 1), 0)
  const totalWrittenMarks = body.has_written_section
    ? (body.written_questions ?? []).reduce((sum, w) => sum + (w.marks ?? 10), 0)
    : 0

  // ── 1. Insert the exam shell ────────────────────────────────
  const { data: exam, error: examErr } = await supabase
    .from('teacher_exams')
    .insert({
      teacher_id: user.id,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      cover_streams: coverStreams,
      access_type: body.access_type,
      access_code: body.access_type === 'private' ? body.access_code!.trim() : null,
      share_token: generateToken(),
      starts_at: body.starts_at || null,
      ends_at: body.ends_at || null,
      duration_mins: body.duration_mins,
      max_attempts: body.max_attempts,
      show_result_immediately: body.show_result_immediately,
      shuffle_questions: body.shuffle_questions,
      negative_marking: body.negative_marking,
      negative_mark_value: body.negative_mark_value,
      has_written_section: body.has_written_section,
      mcq_count: body.questions.length,
      written_count: body.has_written_section ? (body.written_questions?.length ?? 0) : 0,
      total_mcq_marks: totalMcqMarks,
      total_written_marks: totalWrittenMarks,
      status: body.status ?? 'published',
    })
    .select()
    .single()

  if (examErr) throw createError({ statusCode: 500, message: `Failed to create exam: ${examErr.message}` })

  // ── 2. Insert MCQ rows (with frozen snapshots) ──────────────
  const mcqRows = body.questions.map((q, i) => ({
    exam_id: exam.id,
    question_id: q.question_id,
    source_stream: q.source_stream,
    order_index: i,
    marks: q.marks ?? 1,
    snapshot: q.snapshot,
  }))

  const { error: mcqErr } = await supabase.from('teacher_exam_questions').insert(mcqRows)
  if (mcqErr) {
    await supabase.from('teacher_exams').delete().eq('id', exam.id) // roll back the shell
    throw createError({ statusCode: 500, message: `Failed to attach questions: ${mcqErr.message}` })
  }

  // ── 3. Insert written-section rows, if enabled ──────────────
  if (body.has_written_section && body.written_questions?.length) {
    const writtenRows = body.written_questions.map((w, i) => ({
      exam_id: exam.id,
      order_index: i,
      type: w.type ?? 'saq',
      marks: w.marks ?? 10,
      question_text: w.question_text,
      question_image_url: w.question_image_url || null,
      model_answer: w.model_answer || null,
    }))

    const { error: writtenErr } = await supabase.from('teacher_exam_written_questions').insert(writtenRows)
    if (writtenErr) {
      await supabase.from('teacher_exam_questions').delete().eq('exam_id', exam.id)
      await supabase.from('teacher_exams').delete().eq('id', exam.id)
      throw createError({ statusCode: 500, message: `Failed to attach written questions: ${writtenErr.message}` })
    }
  }

  return {
    exam,
    share_url: `/exam/${exam.share_token}`,
  }
})
