<template>
  <AuthCard>
    <div class="auth-heading">
      <div class="auth-chip"><span class="chip-dot" />New Account</div>
      <h1>Join Cortex404.</h1>
      <p class="auth-sub">Create your free account and start preparing today.</p>
    </div>

    <!-- Google OAuth -->
    <button class="iso-btn iso-btn--google iso-btn--full" :disabled="googleLoading" @click="handleGoogle">
      <span v-if="googleLoading" class="spinner" />
      <GoogleIcon v-else />
      {{ googleLoading ? 'Redirecting…' : 'Sign up with Google' }}
    </button>

    <div class="auth-divider"><span>or register with email</span></div>

    <form class="auth-form" novalidate @submit.prevent="handleRegister">
      <!-- Full name -->
      <div class="form-group">
        <label class="form-label" for="fullName">Full Name</label>
        <input
          id="fullName"
          v-model="form.fullName"
          type="text"
          class="form-input"
          :class="{ error: errors.fullName }"
          placeholder="Raihan Islam"
          autocomplete="name"
        />
        <span v-if="errors.fullName" class="form-error">{{ errors.fullName }}</span>
      </div>

      <!-- Email -->
      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-input"
          :class="{ error: errors.email }"
          placeholder="you@example.com"
          autocomplete="email"
        />
        <span v-if="errors.email" class="form-error">{{ errors.email }}</span>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label class="form-label" for="password">Password</label>
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
            <EyeIcon v-if="!showPassword" />
            <EyeOffIcon v-else />
          </button>
        </div>
        <!-- Password strength bar -->
        <div class="strength-wrap" v-if="form.password">
          <div class="strength-bar">
            <div class="strength-fill" :style="{ width: strengthPercent + '%' }" :class="strengthClass" />
          </div>
          <span class="strength-label" :class="strengthClass">{{ strengthLabel }}</span>
        </div>
        <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
      </div>

      <!-- Confirm password -->
      <div class="form-group">
        <label class="form-label" for="confirmPassword">Confirm Password</label>
        <div class="input-wrap">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            class="form-input"
            :class="{ error: errors.confirmPassword }"
            placeholder="Repeat password"
            autocomplete="new-password"
          />
          <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
            <EyeIcon v-if="!showConfirm" />
            <EyeOffIcon v-else />
          </button>
        </div>
        <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
      </div>

      <!-- Server error -->
      <div v-if="serverError" class="form-error server-error">{{ serverError }}</div>

      <!-- Success -->
      <div v-if="success" class="form-success server-success">
        ✓ Check your email to confirm your account.
      </div>

      <button type="submit" class="iso-btn iso-btn--fill iso-btn--full" :disabled="loading || success">
        <span v-if="loading" class="spinner dark" />
        {{ loading ? 'Creating account…' : 'Create Account →' }}
      </button>
    </form>

    <template #footer>
      Already have an account? <NuxtLink to="/auth/login">Sign in</NuxtLink>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: 'auth' })

const { signUp, signInWithGoogle } = useAuth()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const serverError = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const success = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)

// ── Password strength ──────────────────────────────────
const strengthScore = computed(() => {
  const p = form.password
  if (!p) return 0
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  return score
})
const strengthPercent = computed(() => (strengthScore.value / 5) * 100)
const strengthClass = computed(() => {
  if (strengthScore.value <= 1) return 'weak'
  if (strengthScore.value <= 3) return 'medium'
  return 'strong'
})
const strengthLabel = computed(() => {
  if (strengthScore.value <= 1) return 'Weak'
  if (strengthScore.value <= 3) return 'Medium'
  return 'Strong'
})

// ── Validation ────────────────────────────────────────
function validate() {
  Object.assign(errors, { fullName: '', email: '', password: '', confirmPassword: '' })
  let ok = true
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.'
    ok = false
  }
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    ok = false
  }
  if (!form.password || form.password.length < 8) {
    errors.password = 'Password must be at least 8 characters.'
    ok = false
  }
  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
    ok = false
  }
  return ok
}

async function handleRegister() {
  serverError.value = ''
  success.value = false
  if (!validate()) return
  loading.value = true
  const { error } = await signUp(form.email, form.password, form.fullName)
  loading.value = false
  if (error) {
    serverError.value = error.message ?? 'Registration failed. Please try again.'
  } else {
    success.value = true
  }
}

async function handleGoogle() {
  googleLoading.value = true
  const { error } = await signInWithGoogle()
  if (error) {
    serverError.value = error.message ?? 'Google sign-up failed.'
    googleLoading.value = false
  }
}

// Inline icons
const GoogleIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', width: 18, height: 18, fill: 'none' }, [
      h('path', { d: 'M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z', fill: '#4285F4' }),
      h('path', { d: 'M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z', fill: '#34A853' }),
      h('path', { d: 'M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z', fill: '#FBBC05' }),
      h('path', { d: 'M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z', fill: '#EA4335' }),
    ]),
})
const EyeIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
      h('path', { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z' }),
      h('circle', { cx: 12, cy: 12, r: 3 }),
    ]),
})
const EyeOffIcon = defineComponent({
  render: () =>
    h('svg', { viewBox: '0 0 24 24', width: 16, height: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }, [
      h('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
      h('line', { x1: 1, y1: 1, x2: 23, y2: 23 }),
    ]),
})
</script>

<style scoped>
.auth-heading { margin-bottom: 1.8rem; }
.auth-chip {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border-bright);
  padding: 5px 12px; margin-bottom: 1rem;
}
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); animation: blink 2s infinite; }
h1 { font-family: var(--font-mono); font-weight: 700; font-size: 1.6rem; letter-spacing: -0.8px; color: var(--white); margin-bottom: 0.4rem; }
.auth-sub { font-size: 0.82rem; color: var(--gray); font-weight: 300; }
.auth-form { display: flex; flex-direction: column; gap: 1.2rem; }
.input-wrap { position: relative; }
.input-wrap .form-input { padding-right: 44px; }
.eye-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer; color: var(--gray);
  display: flex; align-items: center; transition: color 0.2s; padding: 4px;
}
.eye-btn:hover { color: var(--white); }

/* Strength bar */
.strength-wrap { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
.strength-bar { flex: 1; height: 2px; background: var(--border); }
.strength-fill { height: 100%; transition: width 0.3s ease, background 0.3s ease; }
.strength-fill.weak   { background: rgba(255,80,80,0.7); }
.strength-fill.medium { background: rgba(255,200,80,0.7); }
.strength-fill.strong { background: rgba(120,230,120,0.7); }
.strength-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase; }
.strength-label.weak   { color: rgba(255,80,80,0.8); }
.strength-label.medium { color: rgba(255,200,80,0.8); }
.strength-label.strong { color: rgba(120,230,120,0.8); }

.server-error { padding: 10px 14px; border: 1px solid rgba(255,80,80,0.3); background: rgba(255,80,80,0.05); font-size: 0.75rem; }
.server-success { padding: 10px 14px; border: 1px solid rgba(120,230,120,0.3); background: rgba(120,230,120,0.05); font-size: 0.75rem; }

.spinner { width: 14px; height: 14px; border-radius: 50%; border: 2px solid rgba(240,240,234,0.3); border-top-color: var(--white); animation: spin 0.7s linear infinite; flex-shrink: 0; }
.spinner.dark { border-color: rgba(8,8,8,0.3); border-top-color: var(--black); }
</style>
