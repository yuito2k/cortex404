// middleware/teacher.ts
//
// Guards teacher-only routes (e.g. /dashboard/teacher/*). Assumes
// `auth` middleware already ran and confirmed a logged-in session —
// chain them: definePageMeta({ middleware: ['auth', 'teacher'] }).

export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  if (!user.value) return navigateTo('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.value.id)
    .single()

  if (!profile || !['teacher', 'admin'].includes(profile.role)) {
    return navigateTo('/dashboard')
  }
})
