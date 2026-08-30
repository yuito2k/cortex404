// server/api/omr/sheet/[code].get.ts
//
// Returns the current status and score for a sheet.
// Used by the result page to poll until graded, and by the
// admin review queue to check individual sheets.

import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw createError({ statusCode: 401, message: 'Unauthorised' })
  }

  const code = getRouterParam(event, 'code')
  if (!code) {
    throw createError({ statusCode: 400, message: 'Sheet code is required' })
  }

  const adminSb = serverSupabaseServiceRole(event)
  const { data: sheet, error: sheetError } = await adminSb
    .from('omr_sheets')
    .select(`
      sheet_code, status, user_id, pdf_url,
      score, correct_count, wrong_count, skipped_count, flagged_count,
      graded_at, submitted_at, created_at,
      question_ids, raw_detection,
      stream, subject, chapter
    `)
    .eq('sheet_code', code)
    .single()

  if (sheetError || !sheet) {
    throw createError({ statusCode: 404, message: `Sheet '${code}' not found` })
  }

  // Students can only see their own sheets
  if (sheet.user_id !== user.id) {
    throw createError({ statusCode: 403, message: 'Access denied' })
  }

  // Generate a fresh signed URL if sheet has a PDF
  let signed_url: string | null = null
  if (sheet.pdf_url) {
    const storage_path = `${user.id}/${code}.pdf`
    const { data: signed } = await adminSb.storage
      .from('omr-sheets')
      .createSignedUrl(storage_path, 3600)
    signed_url = signed?.signedUrl ?? null
  }

  return {
    sheet_code:    sheet.sheet_code,
    status:        sheet.status,
    signed_url,
    score:         sheet.score,
    total:         (sheet.question_ids as number[])?.length ?? 0,
    correct_count: sheet.correct_count,
    wrong_count:   sheet.wrong_count,
    skipped_count: sheet.skipped_count,
    flagged_count: sheet.flagged_count,
    percentage:    sheet.score && sheet.question_ids
      ? Math.round((sheet.score / (sheet.question_ids as number[]).length) * 100 * 100) / 100
      : null,
    graded_at:     sheet.graded_at,
    submitted_at:  sheet.submitted_at,
    created_at:    sheet.created_at,
    subject:       sheet.subject,
    stream:        sheet.stream,
    // raw_detection only included when graded/flagged
    raw_detection: ['graded', 'flagged'].includes(sheet.status)
      ? sheet.raw_detection
      : null,
  }
})
