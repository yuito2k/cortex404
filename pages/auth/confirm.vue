<template>
  <AuthCard>
    <div class="confirm-state">
      <div class="confirm-icon">
        <span v-if="error">✕</span>
        <span v-else-if="done">✓</span>
        <span v-else class="spinner-lg" />
      </div>

      <p class="confirm-title">
        {{ error ? 'Something went wrong' : done ? 'Confirmed!' : 'Confirming…' }}
      </p>
      <p class="confirm-desc">
        {{ error ? error : done ? 'Redirecting you to the dashboard…' : 'Please wait a moment.' }}
      </p>

      <NuxtLink v-if="error" to="/auth/login" class="iso-btn iso-btn--fill iso-btn--full" style="margin-top:2rem;text-align:center;">
        Back to Sign In →
      </NuxtLink>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const route = useRoute()
const done = ref(false)
const error = ref('')

onMounted(async () => {
  // The supabase module may need a moment to exchange the code/token
  // Wait a few ticks and check again
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 300))
    if (user.value) break
  }

  if (user.value) {
    done.value = true
    setTimeout(() => navigateTo('/dashboard'), 1200)
    return
  }

  // Check for an error in the URL hash (e.g. expired link)
  const hash = window.location.hash
  if (hash.includes('error=')) {
    const params = new URLSearchParams(hash.replace('#', ''))
    error.value = params.get('error_description') ?? 'Confirmation failed. The link may have expired.'
    return
  }

  // If there's a code param, the module should handle exchange — but if user
  // is still null the code may be invalid/expired
  if (route.query.code) {
    error.value = 'Confirmation failed. The link may have expired — please try signing in.'
    return
  }

  // No code, no hash, no user — probably a direct visit
  error.value = 'No confirmation token found. Please check your email or try signing in.'
})
</script>

<style scoped>
.confirm-state { text-align: center; padding: 1rem 0 0.5rem; }
.confirm-icon {
  width: 56px; height: 56px; margin: 0 auto 1.4rem;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem;
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.06);
}
.confirm-title { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--white); margin-bottom: 0.6rem; }
.confirm-desc { font-size: 0.82rem; color: var(--gray); line-height: 1.7; }

.spinner-lg {
  display: block;
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid rgba(240,240,234,0.2);
  border-top-color: var(--white);
  animation: spin 0.8s linear infinite;
}
</style>
