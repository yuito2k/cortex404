<template>
  <div class="download-section">
    <!-- Corner brackets -->
    <div class="corner corner-tl" /><div class="corner corner-tr" />
    <div class="corner corner-bl" /><div class="corner corner-br" />

    <p class="section-tag centered">{{ t('downloadCTA.chip') }}</p>
    <h2>{{ t('downloadCTA.heading1') }}<br />{{ t('downloadCTA.heading2') }}<br />{{ t('downloadCTA.heading3') }}</h2>
    <p class="dl-sub">{{ t('downloadCTA.subHeading') }}</p>

    <!-- Primary CTA -->
    <div class="dl-cta-row">
      <NuxtLink to="/auth/register" class="iso-btn iso-btn--fill dl-primary-btn">{{ t('downloadCTA.btnPrimary') }}</NuxtLink>
      <NuxtLink to="/auth/login" class="iso-btn iso-btn--ghost">{{ t('downloadCTA.btnSecondary') }}</NuxtLink>
    </div>

    <div class="dl-divider">
      <span>{{ t('downloadCTA.divider') }}</span>
    </div>

    <div class="dl-btns">
      <a href="#" class="dl-btn iso-btn iso-btn--ghost">
        <span class="dl-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        </span>
        <div class="dl-text">
          <span class="dl-small">{{ t('downloadCTA.appStoreSub') }}</span>
          <span class="dl-main">{{ t('downloadCTA.appStore') }}</span>
        </div>
      </a>
      <a href="#" class="dl-btn iso-btn iso-btn--ghost">
        <span class="dl-icon">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M3.18 23.76c.35.19.76.2 1.14.01l12.11-6.77-2.59-2.59-10.66 9.35zM.5 1.1C.2 1.47.02 2 .02 2.67v18.67c0 .67.18 1.2.49 1.57l.08.07 10.46-10.46v-.25L.58 1.03.5 1.1zM20.4 10.5l-2.74-1.53-2.91 2.91 2.91 2.91 2.74-1.54c.78-.44.78-1.31 0-1.75zM4.32.25L16.43 7 13.84 9.6 3.18.25C3.56.06 4 .07 4.32.25z"/>
          </svg>
        </span>
        <div class="dl-text">
          <span class="dl-small">{{ t('downloadCTA.playStoreSub') }}</span>
          <span class="dl-main">{{ t('downloadCTA.playStore') }}</span>
        </div>
      </a>
    </div>

    <!-- Trust strip -->
    <div class="trust-strip">
      <span v-for="i in trustItems" :key="i" class="trust-item">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="12" height="12">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        {{ i }}
      </span>
    </div>
  </div>
</template>

<script setup>
const { t, ta } = useI18n();

const trustItems = computed(() => ta('downloadCTA.trustItems'));
</script>

<style scoped>
.download-section {
  text-align: center;
  background: #0d0d0d;
  padding: 100px 6vw;
  position: relative;
  overflow: hidden;
  border-top: 1px solid var(--border);
}

/* Watermark */
.download-section::before {
  content: 'CORTEX404';
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-mono); font-weight: 700;
  font-size: clamp(5rem, 14vw, 11rem);
  color: rgba(255,255,255,0.018);
  white-space: nowrap; pointer-events: none;
  letter-spacing: -4px;
}

/* Dot grid */
.download-section::after {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.05) 1px, transparent 1px);
  background-size: 28px 28px;
  pointer-events: none;
}

/* Corner brackets */
.corner {
  position: absolute; width: 40px; height: 40px; pointer-events: none;
  z-index: 1;
}
.corner-tl { top: 40px; left: 6vw; border-top: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.corner-tr { top: 40px; right: 6vw; border-top: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }
.corner-bl { bottom: 40px; left: 6vw; border-bottom: 1px solid var(--border-bright); border-left: 1px solid var(--border-bright); }
.corner-br { bottom: 40px; right: 6vw; border-bottom: 1px solid var(--border-bright); border-right: 1px solid var(--border-bright); }

.section-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--gray); display: flex; align-items: center; gap: 10px;
  margin-bottom: 1.5rem; position: relative; z-index: 1;
}
.section-tag::before { content: ''; flex: 0 0 22px; height: 1px; background: var(--gray); }
.centered { justify-content: center; }

h2 {
  font-family: var(--font-mono); font-weight: 700;
  font-size: clamp(1.8rem, 2.8vw, 2.5rem);
  letter-spacing: -1px; line-height: 1.15;
  color: var(--white);
  margin: 0 auto 1rem; max-width: 600px;
  position: relative; z-index: 1;
}

.dl-sub {
  font-size: 0.93rem; color: var(--dim);
  margin-bottom: 2.5rem; position: relative; z-index: 1;
}

/* Primary CTA */
.dl-cta-row {
  display: flex; gap: 12px; justify-content: center;
  flex-wrap: wrap; margin-bottom: 2rem;
  position: relative; z-index: 1;
}
.dl-primary-btn {
  font-size: 0.78rem !important;
  padding: 16px 32px !important;
}

/* Divider */
.dl-divider {
  display: flex; align-items: center; gap: 16px;
  max-width: 360px; margin: 0 auto 2rem;
  position: relative; z-index: 1;
}
.dl-divider::before, .dl-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}
.dl-divider span {
  font-family: var(--font-mono); font-size: 0.58rem;
  color: var(--gray); letter-spacing: 0.14em; text-transform: uppercase;
  white-space: nowrap;
}

/* App store buttons */
.dl-btns {
  display: flex; gap: 14px; justify-content: center;
  flex-wrap: wrap; margin-bottom: 3rem;
  position: relative; z-index: 1;
}
.dl-btn {
  display: inline-flex !important;
  align-items: center !important;
  gap: 14px !important;
  padding: 14px 24px !important;
  min-width: 180px;
}
.dl-icon { display: flex; align-items: center; flex-shrink: 0; color: var(--white); }
.dl-text { display: flex; flex-direction: column; gap: 1px; text-align: left; }
.dl-small { font-size: 0.58rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.12em; font-family: var(--font-mono); }
.dl-main  { font-family: var(--font-mono); font-size: 0.88rem; font-weight: 700; color: var(--white); }

/* Trust strip */
.trust-strip {
  display: flex; align-items: center; justify-content: center;
  gap: 2rem; flex-wrap: wrap;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
  position: relative; z-index: 1;
}
.trust-item {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray);
}
.trust-item svg { color: rgba(120,230,120,0.6); flex-shrink: 0; }

@media (max-width: 560px) {
  .trust-strip { gap: 1rem; }
  .dl-primary-btn { font-size: 0.7rem !important; padding: 14px 20px !important; }
}
</style>
