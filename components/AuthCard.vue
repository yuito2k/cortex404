<template>
  <div class="auth-shell">
    <!-- Animated background grid -->
    <div class="bg-grid" aria-hidden="true" />

    <!-- Corner brackets -->
    <div class="bracket bracket--tl" aria-hidden="true" />
    <div class="bracket bracket--tr" aria-hidden="true" />
    <div class="bracket bracket--bl" aria-hidden="true" />
    <div class="bracket bracket--br" aria-hidden="true" />

    <div class="auth-card">
      <!-- Logo -->
      <NuxtLink to="/" class="auth-logo">
        CORTEX<span class="gray">404</span>
      </NuxtLink>

      <!-- Slot for page content -->
      <slot />

      <!-- Bottom nav link -->
      <p class="auth-footer-note">
        <slot name="footer" />
      </p>
    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

/* Subtle dot-grid background */
.bg-grid {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image:
    radial-gradient(circle, rgba(240,240,234,0.07) 1px, transparent 1px);
  background-size: 32px 32px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

/* Corner brackets */
.bracket {
  position: fixed;
  width: 48px; height: 48px;
  pointer-events: none; z-index: 1;
}
.bracket--tl { top: 24px; left: 24px; border-top: 1px solid rgba(240,240,234,0.2); border-left: 1px solid rgba(240,240,234,0.2); }
.bracket--tr { top: 24px; right: 24px; border-top: 1px solid rgba(240,240,234,0.2); border-right: 1px solid rgba(240,240,234,0.2); }
.bracket--bl { bottom: 24px; left: 24px; border-bottom: 1px solid rgba(240,240,234,0.2); border-left: 1px solid rgba(240,240,234,0.2); }
.bracket--br { bottom: 24px; right: 24px; border-bottom: 1px solid rgba(240,240,234,0.2); border-right: 1px solid rgba(240,240,234,0.2); }

/* Card */
.auth-card {
  position: relative; z-index: 2;
  width: 100%; max-width: 440px;
  background: rgba(8,8,8,0.92);
  border: 1px solid rgba(240,240,234,0.12);
  padding: 2.8rem 2.8rem 2.2rem;
  /* Isometric card shadow */
  box-shadow:
    6px 6px 0 0 rgba(240,240,234,0.06),
    5px 5px 0 0 rgba(240,240,234,0.04),
    4px 4px 0 0 rgba(240,240,234,0.03);
  backdrop-filter: blur(20px);
  animation: cardIn 0.4s ease both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px) translateX(-4px); }
  to   { opacity: 1; transform: translateY(0) translateX(0); }
}

.auth-logo {
  display: block;
  font-family: 'Space Mono', monospace;
  font-weight: 700; font-size: 1.2rem;
  letter-spacing: -0.5px;
  color: var(--white);
  margin-bottom: 2.2rem;
}
.gray { color: var(--gray); }

.auth-footer-note {
  text-align: center;
  font-size: 0.78rem;
  color: var(--gray);
  margin-top: 1.6rem;
  line-height: 1.6;
}
.auth-footer-note :deep(a) {
  color: var(--white);
  text-decoration: underline;
  text-underline-offset: 3px;
  transition: opacity 0.2s;
}
.auth-footer-note :deep(a):hover { opacity: 0.7; }
</style>
