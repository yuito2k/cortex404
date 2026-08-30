<template>
  <AuthCard>
    <div class="auth-heading">
      <div class="auth-chip"><span class="chip-dot" />New Password</div>
      <h1>Set new password.</h1>
      <p class="auth-sub">Choose a strong password for your account.</p>
    </div>

    <form v-if="!done" class="auth-form" novalidate @submit.prevent="handleUpdate">
      <div class="form-group">
        <label class="form-label" for="password">New Password</label>
        <div class="input-wrap">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ error: errors.password }"
            placeholder="Min. 8 characters"
            autocomplete="new-password"
          />
          <button type="button" class="eye-btn" @click="showPassword = !showPassword">
            <EyeIcon v-if="!showPassword" /><EyeOffIcon v-else />
          </button>
        </div>
        <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="confirm">Confirm New Password</label>
        <div class="input-wrap">
          <input
            id="confirm"
            v-model="form.confirm"
            :type="showConfirm ? 'text' : 'password'"
            class="form-input"
            :class="{ error: errors.confirm }"
            placeholder="Repeat password"
            autocomplete="new-password"
          />
          <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
            <EyeIcon v-if="!showConfirm" /><EyeOffIcon v-else />
          </button>
        </div>
        <span v-if="errors.confirm" class="form-error">{{ errors.confirm }}</span>
      </div>

      <div v-if="serverError" class="form-error server-error">{{ serverError }}</div>

      <button type="submit" class="iso-btn iso-btn--fill iso-btn--full" :disabled="loading">
        <span v-if="loading" class="spinner dark" />
        {{ loading ? 'Updating…' : 'Update Password →' }}
      </button>
    </form>

    <div v-else class="done-state">
      <div class="done-icon">✓</div>
      <p class="done-title">Password updated!</p>
      <p class="done-desc">Your password has been changed successfully.</p>
      <NuxtLink to="/auth/login" class="iso-btn iso-btn--fill iso-btn--full" style="margin-top:1.5rem;text-align:center;">
        Go to Sign In →
      </NuxtLink>
    </div>

    <template #footer>
      <NuxtLink to="/auth/login">Back to Sign In</NuxtLink>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
// No guest middleware — user arrives here from email link, may not have session yet
const { updatePassword } = useAuth()

const form = reactive({ password: '', confirm: '' })
const errors = reactive({ password: '', confirm: '' })
const serverError = ref('')
const loading = ref(false)
const done = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

function validate() {
  errors.password = ''; errors.confirm = ''
  let ok = true
  if (!form.password || form.password.length < 8) { errors.password = 'Password must be at least 8 characters.'; ok = false }
  if (form.password !== form.confirm) { errors.confirm = 'Passwords do not match.'; ok = false }
  return ok
}

async function handleUpdate() {
  serverError.value = ''
  if (!validate()) return
  loading.value = true
  const { error } = await updatePassword(form.password)
  loading.value = false
  if (error) { serverError.value = error.message ?? 'Failed to update password.' }
  else { done.value = true }
}

const EyeIcon = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [h('path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z' }), h('circle', { cx: 12, cy: 12, r: 3 })]) })
const EyeOffIcon = defineComponent({ render: () => h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [h('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }), h('line', { x1: 1, y1: 1, x2: 23, y2: 23 })]) })
</script>

<style scoped>
.auth-heading { margin-bottom: 1.8rem; }
.auth-chip { display: inline-flex; align-items: center; gap: 7px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray); border: 1px solid var(--border-bright); padding: 5px 12px; margin-bottom: 1rem; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); animation: blink 2s infinite; }
h1 { font-family: var(--font-mono); font-weight: 700; font-size: 1.6rem; letter-spacing: -0.8px; color: var(--white); margin-bottom: 0.4rem; }
.auth-sub { font-size: 0.82rem; color: var(--gray); font-weight: 300; }
.auth-form { display: flex; flex-direction: column; gap: 1.2rem; }
.input-wrap { position: relative; }
.input-wrap .form-input { padding-right: 44px; }
.eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--gray); display: flex; align-items: center; transition: color 0.2s; padding: 4px; }
.eye-btn:hover { color: var(--white); }
.server-error { padding: 10px 14px; border: 1px solid rgba(255,80,80,0.3); background: rgba(255,80,80,0.05); font-size: 0.75rem; }
.done-state { text-align: center; padding: 1rem 0; }
.done-icon { width: 52px; height: 52px; margin: 0 auto 1.2rem; border: 1px solid var(--border-bright); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: rgba(120,230,120,0.9); box-shadow: 3px 3px 0 0 rgba(240,240,234,0.06); }
.done-title { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--white); margin-bottom: 0.6rem; }
.done-desc { font-size: 0.82rem; color: var(--gray); line-height: 1.7; }
.spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(240,240,234,0.3); border-top-color: var(--white); animation: spin 0.7s linear infinite; flex-shrink: 0; }
.spinner.dark { border-color: rgba(8,8,8,0.3); border-top-color: var(--black); }
</style>
