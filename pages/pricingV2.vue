<script setup>
// This file works both as a standalone page AND as an importable component.
// As a page:  pages/pricing.vue  (uses default layout)
// As a section component: components/PricingSection.vue (no definePageMeta)

// Uncomment the line below if using as a standalone page:
// definePageMeta({ layout: 'default' })

const billingCycle = ref('monthly') // 'monthly' | 'yearly'
const hoveredPlan = ref(null)

const plans = [
  {
    key: 'free',
    label: 'FREE',
    sublabel: 'Get started',
    price: { monthly: 0, yearly: 0 },
    currency: '৳',
    description: 'Start your exam prep journey with core MCQ practice.',
    badge: null,
    cta: 'Start Free',
    ctaLink: '/auth/register',
    ctaStyle: 'ghost',
    features: [
      { text: 'MCQ practice — all subjects', included: true },
      { text: 'HSC, SSC & Admission exams', included: true },
      { text: 'Question bank (limited — 50/day)', included: true },
      { text: 'Basic progress tracking', included: true },
      { text: 'Leaderboard access (read-only)', included: true },
      { text: 'Written section (HSC/SSC)', included: false },
      { text: 'Full question bank (unlimited)', included: false },
      { text: 'Mock exam analytics', included: false },
      { text: 'Subject mastery reports', included: false },
      { text: 'AI-powered weak topic detection', included: false },
      { text: 'Priority support', included: false },
    ],
    highlight: false,
  },
  {
    key: 'pro',
    label: 'PRO',
    sublabel: 'Most popular',
    price: { monthly: 299, yearly: 199 },
    currency: '৳',
    description: 'Full exam simulation with written section, analytics and unlimited practice.',
    badge: 'MOST POPULAR',
    badgeColor: 'badge-green',
    cta: 'Get Pro',
    ctaLink: '/auth/register?plan=pro',
    ctaStyle: 'fill',
    features: [
      { text: 'MCQ practice — all subjects', included: true },
      { text: 'HSC, SSC & Admission exams', included: true },
      { text: 'Full question bank (unlimited)', included: true },
      { text: 'Written section (HSC/SSC)', included: true, highlight: true },
      { text: 'Image upload in written answers', included: true, highlight: true },
      { text: 'Mock exam analytics & breakdown', included: true },
      { text: 'Subject mastery reports', included: true },
      { text: 'Leaderboard (full access)', included: true },
      { text: 'Progress heatmap & streak tracking', included: true },
      { text: 'AI-powered weak topic detection', included: false },
      { text: 'Priority support', included: false },
    ],
    highlight: true,
  },
  {
    key: 'elite',
    label: 'ELITE',
    sublabel: 'Maximum results',
    price: { monthly: 599, yearly: 399 },
    currency: '৳',
    description: 'Everything in Pro plus AI tutoring, live exam updates and priority access.',
    badge: 'COMING SOON',
    badgeColor: 'badge-yellow',
    cta: 'Join Waitlist',
    ctaLink: '/waitlist',
    ctaStyle: 'ghost',
    comingSoon: true,
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'AI-powered weak topic detection', included: true, highlight: true },
      { text: 'Personalised study plan (AI)', included: true, highlight: true },
      { text: 'Live board exam question updates', included: true, highlight: true },
      { text: 'Video solution explanations', included: true },
      { text: 'Offline mode (mobile app)', included: true },
      { text: 'Priority support (24h response)', included: true },
      { text: 'Early access to new features', included: true },
      { text: 'Dedicated study group channel', included: true },
      { text: '1-on-1 mentor session (monthly)', included: true, highlight: true },
      { text: 'Custom mock exam builder', included: true },
    ],
    highlight: false,
  },
]

const faqItems = ref([
  { q: 'Can I switch between monthly and yearly billing?', a: 'Yes — you can switch at any time from your account settings. Upgrading to yearly will prorate the difference automatically.', open: false },
  { q: 'Is there a refund policy?', a: 'We offer a 7-day full refund, no questions asked. If you are not satisfied within 7 days of purchase, contact us at support@cortex404.com.', open: false },
  { q: 'What payment methods are accepted?', a: 'We accept bKash, Nagad, Rocket, Visa/Mastercard and internet banking. All payments are secured and encrypted.', open: false },
  { q: 'Can I use Cortex404 for free forever?', a: 'Yes. The Free tier never expires. You can practice MCQs, track basic progress and access the leaderboard indefinitely with no credit card required.', open: false },
  { q: 'What exams does Pro cover?', a: 'Pro covers HSC (Science, Arts, Commerce), SSC (Science, Arts, Commerce), University Admission (BUET, DU Medical, and major varsities), BCS, and Bank/Govt job prep — with full MCQ + Written sections where applicable.', open: false },
  { q: 'When is Elite launching?', a: 'Elite is currently in development. Join the waitlist to get early access at a discounted rate and be first to try AI-powered personalised study plans.', open: false },
])

function toggleFaq(i) {
  faqItems.value[i].open = !faqItems.value[i].open
}

const yearlyDiscount = (plan) => {
  if (!plan.price.monthly) return null
  const saved = (plan.price.monthly - plan.price.yearly) * 12
  const pct = Math.round((1 - plan.price.yearly / plan.price.monthly) * 100)
  return { saved, pct }
}

const displayPrice = (plan) => {
  return billingCycle.value === 'yearly' ? plan.price.yearly : plan.price.monthly
}
</script>

<template>
  <div class="pricing-page">

    <!-- ─── DOT-GRID BACKGROUND ──────────────────────────────────────────── -->
    <div class="dot-grid-bg"></div>

    <!-- ─── HEADER ───────────────────────────────────────────────────────── -->
    <div class="pricing-header">
      <span class="page-chip">
        <span class="chip-dot"></span>
        PRICING
      </span>
      <h1 class="pricing-title">Simple, <span class="text-outline">Transparent</span> Pricing</h1>
      <p class="pricing-sub">No hidden fees. No surprise charges. Cancel anytime. Pick the plan that fits your exam journey.</p>

      <!-- Billing toggle -->
      <div class="billing-toggle">
        <button
          class="billing-btn"
          :class="{ 'billing-btn--active': billingCycle === 'monthly' }"
          @click="billingCycle = 'monthly'"
        >MONTHLY</button>
        <div class="billing-divider"></div>
        <button
          class="billing-btn"
          :class="{ 'billing-btn--active': billingCycle === 'yearly' }"
          @click="billingCycle = 'yearly'"
        >
          YEARLY
          <span class="billing-save-tag">SAVE UP TO 33%</span>
        </button>
      </div>
    </div>

    <!-- ─── PLANS GRID ────────────────────────────────────────────────────── -->
    <div class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.key"
        class="plan-card"
        :class="{
          'plan-card--highlight': plan.highlight,
          'plan-card--coming-soon': plan.comingSoon,
          'plan-card--hovered': hoveredPlan === plan.key
        }"
        @mouseenter="hoveredPlan = plan.key"
        @mouseleave="hoveredPlan = null"
      >
        <!-- Corner decorations -->
        <div class="plan-corner tl"></div>
        <div class="plan-corner br"></div>

        <!-- Badge -->
        <div v-if="plan.badge" class="plan-badge" :class="plan.badgeColor">{{ plan.badge }}</div>

        <!-- Plan header -->
        <div class="plan-header">
          <div class="plan-label-row">
            <span class="plan-label">{{ plan.label }}</span>
            <span class="plan-sublabel">{{ plan.sublabel }}</span>
          </div>

          <!-- Price -->
          <div class="plan-price-block">
            <div v-if="displayPrice(plan) === 0" class="plan-price-free">
              <span class="plan-price-val">Free</span>
              <span class="plan-price-forever">forever</span>
            </div>
            <div v-else class="plan-price-paid">
              <span class="plan-price-currency">{{ plan.currency }}</span>
              <span class="plan-price-val">{{ displayPrice(plan) }}</span>
              <span class="plan-price-cycle">/mo</span>
            </div>
            <div v-if="billingCycle === 'yearly' && yearlyDiscount(plan)" class="plan-yearly-note">
              <span class="plan-yearly-total">{{ plan.currency }}{{ displayPrice(plan) * 12 }}/year</span>
              <span class="plan-yearly-save">Save {{ yearlyDiscount(plan).pct }}%</span>
            </div>
            <div v-if="billingCycle === 'monthly' && plan.price.monthly > 0" class="plan-yearly-hint">
              {{ plan.currency }}{{ plan.price.yearly }}/mo billed yearly
            </div>
          </div>

          <p class="plan-description">{{ plan.description }}</p>
        </div>

        <!-- CTA -->
        <div class="plan-cta">
          <NuxtLink
            :to="plan.ctaLink"
            class="iso-btn"
            :class="plan.ctaStyle === 'fill' ? 'iso-btn--fill iso-btn--full' : 'iso-btn--ghost iso-btn--full'"
          >{{ plan.cta }}</NuxtLink>
        </div>

        <!-- Divider -->
        <div class="plan-divider"></div>

        <!-- Features list -->
        <div class="plan-features">
          <div
            v-for="feat in plan.features"
            :key="feat.text"
            class="plan-feat"
            :class="{
              'feat-included': feat.included,
              'feat-excluded': !feat.included,
              'feat-highlight': feat.highlight && feat.included,
            }"
          >
            <span class="feat-icon">{{ feat.included ? '✓' : '✗' }}</span>
            <span class="feat-text">{{ feat.text }}</span>
            <span v-if="feat.highlight && feat.included" class="feat-badge">PRO</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ─── COMPARISON TABLE ───────────────────────────────────────────────── -->
    <div class="compare-section">
      <div class="section-label-row">
        <span class="section-pill">FULL COMPARISON</span>
        <div class="section-line"></div>
      </div>

      <div class="compare-table">
        <!-- Header -->
        <div class="compare-row compare-head">
          <div class="compare-feature-col">FEATURE</div>
          <div class="compare-plan-col">FREE</div>
          <div class="compare-plan-col compare-plan-col--pro">PRO</div>
          <div class="compare-plan-col">ELITE</div>
        </div>

        <!-- Rows -->
        <div class="compare-group-label">EXAM COVERAGE</div>
        <div class="compare-row"><div class="compare-feature-col">HSC Mock Exams (MCQ)</div><div class="compare-plan-col"><span class="ct-yes">✓</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">SSC Mock Exams (MCQ)</div><div class="compare-plan-col"><span class="ct-yes">✓</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">HSC/SSC Written Section</div><div class="compare-plan-col"><span class="ct-no">✗</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Admission Exams (BUET, DU, Medical)</div><div class="compare-plan-col"><span class="ct-yes">✓</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">BCS & Bank Exam Prep</div><div class="compare-plan-col"><span class="ct-partial">⅄ Limited</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓ Full</span></div><div class="compare-plan-col"><span class="ct-yes">✓ Full</span></div></div>

        <div class="compare-group-label">QUESTION BANK</div>
        <div class="compare-row"><div class="compare-feature-col">Daily MCQ limit</div><div class="compare-plan-col"><span class="ct-text">50/day</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-text">Unlimited</span></div><div class="compare-plan-col"><span class="ct-text">Unlimited</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Past paper questions</div><div class="compare-plan-col"><span class="ct-text">3 years</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-text">All years</span></div><div class="compare-plan-col"><span class="ct-text">All years + Live</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Bookmark questions</div><div class="compare-plan-col"><span class="ct-yes">✓</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Filter by chapter / difficulty</div><div class="compare-plan-col"><span class="ct-yes">✓</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>

        <div class="compare-group-label">ANALYTICS & PROGRESS</div>
        <div class="compare-row"><div class="compare-feature-col">Basic progress tracking</div><div class="compare-plan-col"><span class="ct-yes">✓</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Subject mastery heatmap</div><div class="compare-plan-col"><span class="ct-no">✗</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Mock exam score breakdown</div><div class="compare-plan-col"><span class="ct-no">✗</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">AI weak topic detection</div><div class="compare-plan-col"><span class="ct-no">✗</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-no">✗</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Personalised AI study plan</div><div class="compare-plan-col"><span class="ct-no">✗</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-no">✗</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>

        <div class="compare-group-label">SUPPORT</div>
        <div class="compare-row"><div class="compare-feature-col">Community support</div><div class="compare-plan-col"><span class="ct-yes">✓</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">Priority email support</div><div class="compare-plan-col"><span class="ct-no">✗</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-yes">✓</span></div><div class="compare-plan-col"><span class="ct-yes">✓ 24h</span></div></div>
        <div class="compare-row"><div class="compare-feature-col">1-on-1 mentor session</div><div class="compare-plan-col"><span class="ct-no">✗</span></div><div class="compare-plan-col compare-plan-col--pro"><span class="ct-no">✗</span></div><div class="compare-plan-col"><span class="ct-yes">Monthly</span></div></div>
      </div>
    </div>

    <!-- ─── TRUST BAR ─────────────────────────────────────────────────────── -->
    <div class="trust-bar">
      <div class="trust-item">
        <span class="trust-icon">🔒</span>
        <div>
          <div class="trust-label">SECURE PAYMENT</div>
          <div class="trust-sub">bKash · Nagad · Rocket · Card</div>
        </div>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <span class="trust-icon">↩</span>
        <div>
          <div class="trust-label">7-DAY REFUND</div>
          <div class="trust-sub">No questions asked</div>
        </div>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <span class="trust-icon">∞</span>
        <div>
          <div class="trust-label">FREE FOREVER</div>
          <div class="trust-sub">Core MCQ never locked</div>
        </div>
      </div>
      <div class="trust-divider"></div>
      <div class="trust-item">
        <span class="trust-icon">✕</span>
        <div>
          <div class="trust-label">CANCEL ANYTIME</div>
          <div class="trust-sub">No lock-in contracts</div>
        </div>
      </div>
    </div>

    <!-- ─── PAYMENT METHODS ───────────────────────────────────────────────── -->
    <div class="payment-section">
      <div class="section-label-row" style="margin-bottom:16px;">
        <span class="section-pill">ACCEPTED PAYMENTS</span>
        <div class="section-line"></div>
      </div>
      <div class="payment-methods">
        <div class="payment-method">
          <div class="pm-icon pm-bkash">bK</div>
          <span>bKash</span>
        </div>
        <div class="payment-method">
          <div class="pm-icon pm-nagad">N</div>
          <span>Nagad</span>
        </div>
        <div class="payment-method">
          <div class="pm-icon pm-rocket">R</div>
          <span>Rocket</span>
        </div>
        <div class="payment-method">
          <div class="pm-icon pm-card">VISA</div>
          <span>Visa / MC</span>
        </div>
        <div class="payment-method">
          <div class="pm-icon pm-bank">🏦</div>
          <span>Net Banking</span>
        </div>
      </div>
    </div>

    <!-- ─── FAQ ───────────────────────────────────────────────────────────── -->
    <div class="faq-section">
      <div class="section-label-row">
        <span class="section-pill">FAQ</span>
        <div class="section-line"></div>
      </div>
      <div class="faq-list">
        <div
          v-for="(item, i) in faqItems"
          :key="i"
          class="faq-item"
          :class="{ 'faq-item--open': item.open }"
          @click="toggleFaq(i)"
        >
          <div class="faq-q">
            <span class="faq-q-text">{{ item.q }}</span>
            <span class="faq-chevron">{{ item.open ? '−' : '+' }}</span>
          </div>
          <transition name="faq-expand">
            <div v-if="item.open" class="faq-a">{{ item.a }}</div>
          </transition>
        </div>
      </div>
    </div>

    <!-- ─── BOTTOM CTA ────────────────────────────────────────────────────── -->
    <div class="bottom-cta">
      <div class="bottom-cta-corner tl"></div>
      <div class="bottom-cta-corner br"></div>
      <div class="bottom-cta-left">
        <div class="bottom-cta-label">READY TO START?</div>
        <div class="bottom-cta-title">Begin your exam prep <span class="text-outline">today</span></div>
        <div class="bottom-cta-sub">Free forever. Upgrade when you need more.</div>
      </div>
      <div class="bottom-cta-right">
        <NuxtLink to="/auth/register" class="iso-btn iso-btn--fill">Get Started Free →</NuxtLink>
        <NuxtLink to="/auth/register?plan=pro" class="iso-btn iso-btn--ghost">Go Pro ⭐</NuxtLink>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ─── PAGE SHELL ─────────────────────────────────────────────────────────── */
.pricing-page {
  position: relative;
  min-height: 100vh;
  padding: 60px 6vw 100px;
  max-width: 1160px;
  margin: 0 auto;
}

/* ─── DOT GRID ───────────────────────────────────────────────────────────── */
.dot-grid-bg {
  position: fixed; inset: 0; pointer-events: none; z-index: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.055) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}
.pricing-page > * { position: relative; z-index: 1; }

/* ─── HEADER ─────────────────────────────────────────────────────────────── */
.pricing-header { text-align: center; margin-bottom: 52px; }
.page-chip {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.18em;
  color: var(--gray); border: 1px solid var(--border); padding: 4px 10px; margin-bottom: 18px;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%; background: var(--border-bright);
  animation: pulse-dot 2s infinite;
}
@keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
.pricing-title {
  font-family: var(--font-mono); font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700; color: var(--white); margin: 0 0 14px; line-height: 1.15;
}
.text-outline { -webkit-text-stroke: 1px var(--white); color: transparent; }
.pricing-sub {
  font-family: var(--font-sans); font-size: 0.92rem; color: var(--gray);
  max-width: 480px; margin: 0 auto 32px; line-height: 1.65;
}

/* ─── BILLING TOGGLE ──────────────────────────────────────────────────────── */
.billing-toggle {
  display: inline-flex; align-items: center; gap: 0;
  border: 1px solid var(--border); background: rgba(240,240,234,0.02);
}
.billing-btn {
  font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.12em;
  padding: 10px 22px; background: transparent; border: none; color: var(--dim);
  cursor: pointer; transition: all 0.15s; display: flex; align-items: center; gap: 10px;
}
.billing-btn--active { color: var(--white); background: rgba(240,240,234,0.06); }
.billing-divider { width: 1px; background: var(--border); align-self: stretch; }
.billing-save-tag {
  font-family: var(--font-mono); font-size: 0.5rem; letter-spacing: 0.1em;
  color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3);
  padding: 2px 6px; background: rgba(120,220,120,0.06);
}
.billing-btn--active .billing-save-tag { opacity: 1; }

/* ─── PLANS GRID ─────────────────────────────────────────────────────────── */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  margin-bottom: 64px;
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04);
}

/* ─── PLAN CARD ──────────────────────────────────────────────────────────── */
.plan-card {
  position: relative;
  background: var(--black);
  padding: 28px 26px 32px;
  border: 1px solid transparent;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.15s;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.plan-card:hover {
  border-color: var(--border-bright);
  transform: translate(-1px, -1px);
  box-shadow: 5px 5px 0 0 rgba(240,240,234,0.05);
  z-index: 2;
}
.plan-card--highlight {
  border-color: rgba(240,240,234,0.18) !important;
  border-left: 2px solid var(--white);
  background: rgba(240,240,234,0.015);
}
.plan-card--highlight:hover {
  border-color: var(--white) !important;
  border-left: 3px solid var(--white);
}
.plan-card--coming-soon { opacity: 0.7; }
.plan-card--coming-soon:hover { transform: none; box-shadow: none; }

/* Corners */
.plan-corner { position: absolute; width: 10px; height: 10px; }
.plan-corner.tl { top:7px; left:7px; border-top:1px solid var(--border-bright); border-left:1px solid var(--border-bright); }
.plan-corner.br { bottom:7px; right:7px; border-bottom:1px solid var(--border-bright); border-right:1px solid var(--border-bright); }
.plan-card--highlight .plan-corner { border-color: rgba(240,240,234,0.35); }

/* Badge */
.plan-badge {
  display: inline-block;
  font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.12em;
  padding: 3px 8px; margin-bottom: 14px; border: 1px solid; align-self: flex-start;
}
.badge-green { color: rgba(120,220,120,0.9); border-color: rgba(120,220,120,0.3); background: rgba(120,220,120,0.06); }
.badge-yellow { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.3); background: rgba(255,200,80,0.06); }

/* Plan header */
.plan-header { margin-bottom: 22px; }
.plan-label-row { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; }
.plan-label { font-family: var(--font-mono); font-size: 1.2rem; font-weight: 700; color: var(--white); letter-spacing: 0.06em; }
.plan-sublabel { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; color: var(--dim); }

/* Price */
.plan-price-block { margin-bottom: 14px; }
.plan-price-free { display: flex; align-items: baseline; gap: 8px; }
.plan-price-paid { display: flex; align-items: baseline; gap: 3px; }
.plan-price-currency { font-family: var(--font-mono); font-size: 1rem; color: var(--gray); }
.plan-price-val { font-family: var(--font-mono); font-size: 2.8rem; font-weight: 700; color: var(--white); line-height: 1; }
.plan-price-free .plan-price-val { font-size: 2.2rem; }
.plan-price-forever { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); }
.plan-price-cycle { font-family: var(--font-mono); font-size: 0.75rem; color: var(--gray); margin-left: 2px; }
.plan-yearly-note { display: flex; align-items: center; gap: 10px; margin-top: 8px; }
.plan-yearly-total { font-family: var(--font-mono); font-size: 0.65rem; color: var(--dim); }
.plan-yearly-save { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(120,220,120,0.9); border: 1px solid rgba(120,220,120,0.3); padding: 2px 6px; background: rgba(120,220,120,0.06); }
.plan-yearly-hint { font-family: var(--font-mono); font-size: 0.58rem; color: var(--dim); margin-top: 6px; }

.plan-description { font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray); line-height: 1.55; }

/* CTA */
.plan-cta { margin-bottom: 20px; }
.plan-card--coming-soon .plan-cta .iso-btn { opacity: 0.6; pointer-events: none; }

/* Divider */
.plan-divider { height: 1px; background: var(--border); margin-bottom: 20px; }

/* Features */
.plan-features { display: flex; flex-direction: column; gap: 10px; flex: 1; }
.plan-feat { display: flex; align-items: flex-start; gap: 10px; }
.feat-icon {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  width: 16px; flex-shrink: 0; margin-top: 1px;
}
.feat-included .feat-icon { color: rgba(120,220,120,0.8); }
.feat-excluded .feat-icon { color: rgba(240,240,234,0.2); }
.feat-text {
  font-family: var(--font-sans); font-size: 0.8rem; line-height: 1.4; flex: 1;
}
.feat-included .feat-text { color: var(--white); }
.feat-excluded .feat-text { color: rgba(240,240,234,0.25); }
.feat-highlight .feat-text { color: var(--white); }
.feat-badge {
  font-family: var(--font-mono); font-size: 0.48rem; letter-spacing: 0.1em;
  color: rgba(255,200,80,0.8); border: 1px solid rgba(255,200,80,0.3);
  padding: 1px 5px; background: rgba(255,200,80,0.05); flex-shrink: 0;
  margin-top: 2px;
}

/* ─── COMPARE TABLE ──────────────────────────────────────────────────────── */
.compare-section { margin-bottom: 52px; }
.section-label-row { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.section-pill { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; color: var(--dim); border: 1px solid var(--border); padding: 4px 12px; white-space: nowrap; }
.section-line { flex: 1; height: 1px; background: var(--border); }

.compare-table {
  border: 1px solid var(--border);
  overflow-x: auto;
}
.compare-head {
  background: rgba(240,240,234,0.04) !important;
  border-bottom: 1px solid var(--border-bright) !important;
}
.compare-head .compare-feature-col,
.compare-head .compare-plan-col {
  font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.12em;
  color: var(--white); font-weight: 700;
}
.compare-group-label {
  font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.14em;
  color: var(--dim); padding: 8px 16px 4px;
  border-bottom: 1px solid var(--border); border-top: 1px solid var(--border);
  background: rgba(240,240,234,0.01);
}
.compare-row {
  display: grid;
  grid-template-columns: 1fr 100px 120px 100px;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.compare-row:hover { background: rgba(240,240,234,0.015); }
.compare-row:last-child { border-bottom: none; }
.compare-feature-col {
  font-family: var(--font-sans); font-size: 0.82rem; color: var(--gray);
  padding: 11px 16px; border-right: 1px solid var(--border);
}
.compare-plan-col {
  font-family: var(--font-mono); font-size: 0.7rem;
  padding: 11px 12px; text-align: center; border-right: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
}
.compare-plan-col:last-child { border-right: none; }
.compare-plan-col--pro {
  background: rgba(240,240,234,0.025);
  border-right: 1px solid rgba(240,240,234,0.12);
  border-left: 1px solid rgba(240,240,234,0.12);
}
.ct-yes     { color: rgba(120,220,120,0.9); font-size: 0.68rem; }
.ct-no      { color: rgba(240,240,234,0.18); font-size: 0.68rem; }
.ct-partial { color: rgba(255,200,80,0.8); font-size: 0.62rem; }
.ct-text    { color: var(--white); font-size: 0.65rem; }

/* ─── TRUST BAR ──────────────────────────────────────────────────────────── */
.trust-bar {
  display: flex; align-items: center; justify-content: center;
  gap: 0; border: 1px solid var(--border);
  background: rgba(240,240,234,0.02);
  margin-bottom: 40px;
  flex-wrap: wrap;
}
.trust-item { display: flex; align-items: center; gap: 14px; padding: 20px 28px; }
.trust-icon { font-size: 1.3rem; }
.trust-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; color: var(--white); margin-bottom: 3px; }
.trust-sub { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.trust-divider { width: 1px; background: var(--border); align-self: stretch; }

/* ─── PAYMENT METHODS ────────────────────────────────────────────────────── */
.payment-section { margin-bottom: 52px; }
.payment-methods { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.payment-method { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.payment-method span { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.08em; color: var(--dim); }
.pm-icon {
  width: 56px; height: 36px; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.04em; background: rgba(240,240,234,0.02);
  transition: border-color 0.2s, background 0.2s;
}
.pm-icon:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.04); }
.pm-bkash { color: rgba(220,80,80,0.9); }
.pm-nagad  { color: rgba(255,130,40,0.9); }
.pm-rocket { color: rgba(100,180,255,0.9); }
.pm-card   { color: var(--white); font-size: 0.6rem; }
.pm-bank   { font-size: 1.1rem; }

/* ─── FAQ ────────────────────────────────────────────────────────────────── */
.faq-section { margin-bottom: 56px; }
.faq-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.faq-item {
  background: var(--black); padding: 0;
  cursor: pointer; transition: background 0.15s;
  border-left: 3px solid transparent; transition: border-color 0.2s, background 0.15s;
}
.faq-item:hover { background: rgba(240,240,234,0.015); border-left-color: var(--border-bright); }
.faq-item--open { border-left-color: var(--white); background: rgba(240,240,234,0.02); }
.faq-q {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  padding: 18px 20px;
}
.faq-q-text { font-family: var(--font-sans); font-size: 0.9rem; color: var(--white); line-height: 1.4; }
.faq-chevron { font-family: var(--font-mono); font-size: 1rem; color: var(--dim); flex-shrink: 0; width: 20px; text-align: center; }
.faq-item--open .faq-chevron { color: var(--white); }
.faq-a {
  font-family: var(--font-sans); font-size: 0.85rem; color: var(--gray);
  padding: 0 20px 18px 20px; line-height: 1.65;
}
.faq-expand-enter-active, .faq-expand-leave-active { transition: all 0.25s ease; }
.faq-expand-enter-from, .faq-expand-leave-to { opacity: 0; transform: translateY(-6px); }

/* ─── BOTTOM CTA ─────────────────────────────────────────────────────────── */
.bottom-cta {
  position: relative;
  display: flex; align-items: center; justify-content: space-between; gap: 32px;
  border: 1px solid var(--border-bright); padding: 40px 36px;
  background-image: radial-gradient(circle at 30% 50%, rgba(240,240,234,0.025) 0%, transparent 60%);
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.04);
}
.bottom-cta-corner { position: absolute; width: 14px; height: 14px; }
.bottom-cta-corner.tl { top:10px;left:10px; border-top:1px solid var(--border-bright);border-left:1px solid var(--border-bright); }
.bottom-cta-corner.br { bottom:10px;right:10px; border-bottom:1px solid var(--border-bright);border-right:1px solid var(--border-bright); }
.bottom-cta-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.18em; color: var(--dim); margin-bottom: 8px; }
.bottom-cta-title { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--white); margin-bottom: 8px; line-height: 1.2; }
.bottom-cta-sub { font-family: var(--font-sans); font-size: 0.85rem; color: var(--gray); }
.bottom-cta-right { display: flex; gap: 12px; flex-shrink: 0; }

/* ─── RESPONSIVE ─────────────────────────────────────────────────────────── */
@media (max-width: 960px) {
  .pricing-page { padding: 48px 4vw 80px; }
  .plans-grid { grid-template-columns: 1fr; }
  .plan-card--highlight { border-left-width: 3px; }
  .compare-row { grid-template-columns: 1fr 80px 100px 80px; }
  .trust-bar { flex-direction: column; align-items: stretch; }
  .trust-divider { width: auto; height: 1px; }
  .trust-item { border-bottom: 1px solid var(--border); padding: 16px 20px; }
  .trust-item:last-child { border-bottom: none; }
  .bottom-cta { flex-direction: column; align-items: flex-start; gap: 24px; padding: 28px; }
  .bottom-cta-right { width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .bottom-cta-right .iso-btn { justify-content: center; }
}

@media (max-width: 640px) {
  .pricing-page { padding: 32px 16px 60px; }
  .pricing-title { font-size: 1.7rem; }
  .billing-toggle { width: 100%; }
  .billing-btn { flex: 1; justify-content: center; flex-wrap: wrap; gap: 6px; padding: 10px 12px; }
  .billing-save-tag { font-size: 0.46rem; }
  .plans-grid { grid-template-columns: 1fr; }
  .plan-card { padding: 22px 18px 26px; }
  .plan-price-val { font-size: 2.2rem; }
  .compare-table { font-size: 0.78rem; }
  .compare-row { grid-template-columns: 1fr 70px 90px 70px; }
  .compare-feature-col { font-size: 0.75rem; padding: 10px 10px; }
  .compare-plan-col { padding: 10px 8px; font-size: 0.62rem; }
  .compare-group-label { font-size: 0.52rem; padding: 6px 10px 3px; }
  .payment-methods { gap: 8px; }
  .pm-icon { width: 46px; height: 30px; font-size: 0.58rem; }
  .bottom-cta { padding: 22px 18px; }
  .bottom-cta-title { font-size: 1.3rem; }
  .bottom-cta-right { grid-template-columns: 1fr; }
  .faq-q-text { font-size: 0.84rem; }
  .faq-a { font-size: 0.8rem; }
  .trust-item { gap: 10px; }
}
</style>
