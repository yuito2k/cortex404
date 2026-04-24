<template>
  <AuthCard>
    <div class="auth-heading">
      <div class="auth-chip"><span class="chip-dot" />Recovery</div>
      <h1>Reset password.</h1>
      <p class="auth-sub">We'll send a reset link to your email.</p>
    </div>

    <form v-if="!sent" class="auth-form" novalidate @submit.prevent="handleReset">
      <div class="form-group">
        <label class="form-label" for="email">Email Address</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="form-input"
          :class="{ error: emailError }"
          placeholder="you@example.com"
          autocomplete="email"
        />
        <span v-if="emailError" class="form-error">{{ emailError }}</span>
      </div>

      <div v-if="serverError" class="form-error server-error">{{ serverError }}</div>

      <button type="submit" class="iso-btn iso-btn--fill iso-btn--full" :disabled="loading">
        <span v-if="loading" class="spinner dark" />
        {{ loading ? 'Sending…' : 'Send Reset Link →' }}
      </button>
    </form>

    <!-- Success state -->
    <div v-else class="sent-state">
      <div class="sent-icon">✓</div>
      <p class="sent-title">Check your inbox</p>
      <p class="sent-desc">A password reset link has been sent to <strong>{{ email }}</strong>. It expires in 1 hour.</p>
      <button class="iso-btn iso-btn--ghost iso-btn--full" style="margin-top:1.5rem" @click="sent = false">
        Send again
      </button>
    </div>

    <template #footer>
      Remembered it? <NuxtLink to="/auth/login">Back to Sign In</NuxtLink>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest' })

const { resetPassword } = useAuth()

const email = ref('')
const emailError = ref('')
const serverError = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleReset() {
  emailError.value = ''
  serverError.value = ''
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email address.'
    return
  }
  loading.value = true
  const { error } = await resetPassword(email.value)
  loading.value = false
  if (error) {
    serverError.value = error.message ?? 'Failed to send reset email.'
  } else {
    sent.value = true
  }
}
</script>

<style scoped>
.auth-heading { margin-bottom: 1.8rem; }
.auth-chip { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray); border: 1px solid var(--border-bright); padding: 5px 12px; margin-bottom: 1rem; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); animation: blink 2s infinite; }
h1 { font-family: var(--font-mono); font-weight: 700; font-size: 1.6rem; letter-spacing: -0.8px; color: var(--white); margin-bottom: 0.4rem; }
.auth-sub { font-size: 0.82rem; color: var(--gray); font-weight: 300; }
.auth-form { display: flex; flex-direction: column; gap: 1.2rem; }
.server-error { padding: 10px 14px; border: 1px solid rgba(255,80,80,0.3); background: rgba(255,80,80,0.05); font-size: 0.75rem; }

/* Sent state */
.sent-state { text-align: center; padding: 1rem 0; }
.sent-icon {
  width: 52px; height: 52px; margin: 0 auto 1.2rem;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: rgba(120,230,120,0.9);
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.06);
}
.sent-title { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 0.6rem; }
.sent-desc { font-size: 0.82rem; color: var(--gray); line-height: 1.7; }
.sent-desc strong { color: var(--white); }

.spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(240,240,234,0.3); border-top-color: var(--white); animation: spin 0.7s linear infinite; flex-shrink: 0; }
.spinner.dark { border-color: rgba(8,8,8,0.3); border-top-color: var(--black); }
</style>
