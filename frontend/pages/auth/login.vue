<template>
  <AuthCard>
    <div class="auth-heading">
      <div class="auth-chip"><span class="chip-dot" />Sign In</div>
      <h1>Welcome back.</h1>
      <p class="auth-sub">Enter your credentials to continue.</p>
    </div>

    <!-- Google OAuth -->
    <button class="iso-btn iso-btn--google iso-btn--full" :disabled="googleLoading" @click="handleGoogle">
      <span v-if="googleLoading" class="spinner" />
      <GoogleIcon v-else />
      {{ googleLoading ? 'Redirecting…' : 'Continue with Google' }}
    </button>

    <div class="auth-divider"><span>or continue with email</span></div>

    <!-- Email / Password form -->
    <form class="auth-form" novalidate @submit.prevent="handleLogin">
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

      <div class="form-group">
        <div class="label-row">
          <label class="form-label" for="password">Password</label>
          <NuxtLink to="/auth/forgot-password" class="forgot-link">Forgot password?</NuxtLink>
        </div>
        <div class="input-wrap">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ error: errors.password }"
            placeholder="••••••••"
            autocomplete="current-password"
          />
          <button type="button" class="eye-btn" @click="showPassword = !showPassword">
            <EyeIcon v-if="!showPassword" />
            <EyeOffIcon v-else />
          </button>
        </div>
        <span v-if="errors.password" class="form-error">{{ errors.password }}</span>
      </div>

      <!-- Server error -->
      <div v-if="serverError" class="form-error server-error">{{ serverError }}</div>

      <button type="submit" class="iso-btn iso-btn--fill iso-btn--full" :disabled="loading">
        <span v-if="loading" class="spinner dark" />
        {{ loading ? 'Signing in…' : 'Sign In →' }}
      </button>
    </form>

    <template #footer>
      Don't have an account? <NuxtLink to="/auth/register">Create one</NuxtLink>
    </template>
  </AuthCard>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'guest', layout: 'auth' })

const { signIn, signInWithGoogle } = useAuth()

const form = reactive({ email: '', password: '' })
const errors = reactive({ email: '', password: '' })
const serverError = ref('')
const loading = ref(false)
const googleLoading = ref(false)
const showPassword = ref(false)

function validate() {
  errors.email = ''
  errors.password = ''
  let ok = true
  if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
    ok = false
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
    ok = false
  }
  return ok
}

async function handleLogin() {
  serverError.value = ''
  if (!validate()) return
  loading.value = true
  const { error } = await signIn(form.email, form.password)
  loading.value = false
  if (error) {
    serverError.value = error.message ?? 'Invalid email or password.'
  } else {
    await navigateTo('/dashboard')
  }
}

async function handleGoogle() {
  googleLoading.value = true
  const { error } = await signInWithGoogle()
  if (error) {
    serverError.value = error.message ?? 'Google sign-in failed.'
    googleLoading.value = false
  }
  // On success Supabase redirects automatically — no need to reset loading
}

// Inline icon components
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
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--white); animation: blink 2s infinite;
}

h1 {
  font-family: var(--font-mono); font-weight: 700;
  font-size: 1.6rem; letter-spacing: -0.8px;
  color: var(--white); margin-bottom: 0.4rem;
}

.auth-sub { font-size: 0.82rem; color: var(--gray); font-weight: 300; }

.auth-form { display: flex; flex-direction: column; gap: 1.2rem; margin-top: 0; }

.label-row {
  display: flex; justify-content: space-between; align-items: center;
}
.forgot-link {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--gray); transition: color 0.2s;
}
.forgot-link:hover { color: var(--white); }

.input-wrap { position: relative; }
.input-wrap .form-input { padding-right: 44px; }
.eye-btn {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: var(--gray); display: flex; align-items: center;
  transition: color 0.2s; padding: 4px;
}
.eye-btn:hover { color: var(--white); }

.server-error {
  padding: 10px 14px;
  border: 1px solid rgba(255,80,80,0.3);
  background: rgba(255,80,80,0.05);
  font-size: 0.75rem;
}

/* Spinner */
.spinner {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2px solid rgba(240,240,234,0.3);
  border-top-color: var(--white);
  animation: spin 0.7s linear infinite; flex-shrink: 0;
}
.spinner.dark {
  border-color: rgba(8,8,8,0.3);
  border-top-color: var(--black);
}
</style>
