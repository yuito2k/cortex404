<template>
  <div class="pricing-page">

    <!-- Grain overlay -->
    <div class="grain-overlay" aria-hidden="true" />

    <!-- Page Header -->
    <section class="pricing-hero">
      <div class="dot-grid" aria-hidden="true" />
      <div class="hero-inner">
        <div class="page-chip">
          <span class="chip-dot" aria-hidden="true" />
          PRICING
        </div>
        <h1 class="hero-title">
          Invest in your<br />
          <span class="text-outline">exam success.</span>
        </h1>
        <p class="hero-sub">
          Choose the plan that fits your preparation journey. No hidden fees, no surprises — cancel anytime.
        </p>
        <div class="billing-toggle">
          <button
            class="toggle-pill"
            :class="{ active: billing === 'monthly' }"
            @click="billing = 'monthly'"
          >Monthly</button>
          <button
            class="toggle-pill"
            :class="{ active: billing === 'yearly' }"
            @click="billing = 'yearly'"
          >
            Yearly
            <span class="save-badge">Save 20%</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Plans Grid -->
    <section class="plans-section">
      <div class="plans-grid">

        <!-- Free Plan -->
        <div class="plan-card" :class="{ 'plan-card--hovered': hoveredPlan === 'free' }"
          @mouseenter="hoveredPlan = 'free'" @mouseleave="hoveredPlan = null">
          <div class="plan-corner corner-tl" aria-hidden="true" />
          <div class="plan-corner corner-br" aria-hidden="true" />
          <div class="plan-tier">FREE</div>
          <div class="plan-name">Explorer</div>
          <div class="plan-price-block">
            <span class="plan-price">৳0</span>
            <span class="plan-period">/ forever</span>
          </div>
          <p class="plan-desc">Start your prep journey. No credit card needed.</p>
          <div class="plan-cta">
            <NuxtLink to="/auth/register" class="iso-btn iso-btn--ghost iso-btn--full">
              Get Started Free
            </NuxtLink>
          </div>
          <div class="plan-divider" />
          <ul class="plan-features">
            <li v-for="f in freePlan.features" :key="f.text" class="feature-item" :class="{ 'feature-disabled': !f.included }">
              <span class="feature-icon" aria-hidden="true">{{ f.included ? '✓' : '✗' }}</span>
              <span>{{ f.text }}</span>
              <span v-if="f.limit" class="feature-limit">{{ f.limit }}</span>
            </li>
          </ul>
        </div>

        <!-- Pro Plan (Featured) -->
        <div class="plan-card plan-card--pro" :class="{ 'plan-card--hovered': hoveredPlan === 'pro' }"
          @mouseenter="hoveredPlan = 'pro'" @mouseleave="hoveredPlan = null">
          <div class="plan-corner corner-tl" aria-hidden="true" />
          <div class="plan-corner corner-br" aria-hidden="true" />
          <div class="plan-featured-label">
            <span class="chip-dot chip-dot--dark" aria-hidden="true" />
            MOST POPULAR
          </div>
          <div class="plan-tier">PRO</div>
          <div class="plan-name">Achiever</div>
          <div class="plan-price-block">
            <span class="plan-price">
              {{ billing === 'monthly' ? '৳299' : '৳239' }}
            </span>
            <span class="plan-period">/ month</span>
          </div>
          <p v-if="billing === 'yearly'" class="plan-yearly-note">Billed ৳2,868/year — save ৳720</p>
          <p class="plan-desc">Full access for serious exam aspirants.</p>
          <div class="plan-cta">
            <NuxtLink to="/auth/register?plan=pro" class="iso-btn iso-btn--fill iso-btn--full">
              Start 7-Day Free Trial →
            </NuxtLink>
          </div>
          <div class="plan-divider" />
          <ul class="plan-features">
            <li v-for="f in proPlan.features" :key="f.text" class="feature-item" :class="{ 'feature-disabled': !f.included }">
              <span class="feature-icon" aria-hidden="true">{{ f.included ? '✓' : '✗' }}</span>
              <span>{{ f.text }}</span>
              <span v-if="f.limit" class="feature-limit">{{ f.limit }}</span>
            </li>
          </ul>
        </div>

        <!-- Elite Plan -->
        <div class="plan-card" :class="{ 'plan-card--hovered': hoveredPlan === 'elite' }"
          @mouseenter="hoveredPlan = 'elite'" @mouseleave="hoveredPlan = null">
          <div class="plan-corner corner-tl" aria-hidden="true" />
          <div class="plan-corner corner-br" aria-hidden="true" />
          <div class="plan-tier">ELITE</div>
          <div class="plan-name">Dominator</div>
          <div class="plan-price-block">
            <span class="plan-price">
              {{ billing === 'monthly' ? '৳599' : '৳479' }}
            </span>
            <span class="plan-period">/ month</span>
          </div>
          <p v-if="billing === 'yearly'" class="plan-yearly-note">Billed ৳5,748/year — save ৳1,440</p>
          <p class="plan-desc">Maximum firepower for BUET, Medical & BCS.</p>
          <div class="plan-cta">
            <NuxtLink to="/auth/register?plan=elite" class="iso-btn iso-btn--ghost iso-btn--full">
              Start 7-Day Free Trial →
            </NuxtLink>
          </div>
          <div class="plan-divider" />
          <ul class="plan-features">
            <li v-for="f in elitePlan.features" :key="f.text" class="feature-item" :class="{ 'feature-disabled': !f.included }">
              <span class="feature-icon" aria-hidden="true">{{ f.included ? '✓' : '✗' }}</span>
              <span>{{ f.text }}</span>
              <span v-if="f.limit" class="feature-limit">{{ f.limit }}</span>
            </li>
          </ul>
        </div>

      </div>
    </section>

    <!-- Feature Comparison Table -->
    <section class="compare-section">
      <div class="section-header">
        <div class="page-chip">
          <span class="chip-dot" aria-hidden="true" />
          COMPARE PLANS
        </div>
        <h2 class="section-title">Every detail, side by side.</h2>
      </div>

      <div class="compare-table-wrap">
        <div class="compare-header-row">
          <div class="compare-feature-col">Feature</div>
          <div class="compare-plan-col">
            <span class="compare-plan-label">Explorer</span>
            <span class="compare-plan-sub">Free</span>
          </div>
          <div class="compare-plan-col compare-plan-col--pro">
            <span class="compare-plan-label">Achiever</span>
            <span class="compare-plan-sub">Pro</span>
          </div>
          <div class="compare-plan-col">
            <span class="compare-plan-label">Dominator</span>
            <span class="compare-plan-sub">Elite</span>
          </div>
        </div>

        <div v-for="group in compareGroups" :key="group.title">
          <div class="compare-group-label">{{ group.title }}</div>
          <div v-for="row in group.rows" :key="row.label" class="compare-row">
            <div class="compare-feature-col">
              <span class="compare-row-label">{{ row.label }}</span>
              <span v-if="row.note" class="compare-row-note">{{ row.note }}</span>
            </div>
            <div class="compare-plan-col">
              <span v-if="row.free === true" class="check-yes" aria-label="Included">✓</span>
              <span v-else-if="row.free === false" class="check-no" aria-label="Not included">—</span>
              <span v-else class="check-val">{{ row.free }}</span>
            </div>
            <div class="compare-plan-col compare-plan-col--pro">
              <span v-if="row.pro === true" class="check-yes" aria-label="Included">✓</span>
              <span v-else-if="row.pro === false" class="check-no" aria-label="Not included">—</span>
              <span v-else class="check-val">{{ row.pro }}</span>
            </div>
            <div class="compare-plan-col">
              <span v-if="row.elite === true" class="check-yes" aria-label="Included">✓</span>
              <span v-else-if="row.elite === false" class="check-no" aria-label="Not included">—</span>
              <span v-else class="check-val">{{ row.elite }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Exam Streams Coverage -->
    <section class="streams-section">
      <div class="section-header">
        <div class="page-chip">
          <span class="chip-dot" aria-hidden="true" />
          COVERAGE
        </div>
        <h2 class="section-title">Built for every exam stream.</h2>
      </div>
      <div class="streams-grid">
        <div v-for="stream in examStreams" :key="stream.name" class="stream-card">
          <div class="stream-icon" aria-hidden="true">{{ stream.icon }}</div>
          <div class="stream-info">
            <span class="stream-name">{{ stream.name }}</span>
            <span class="stream-count">{{ stream.count }} questions</span>
          </div>
          <div class="stream-plans">
            <span v-for="plan in stream.plans" :key="plan" class="stream-plan-badge" :class="`badge--${plan.toLowerCase()}`">
              {{ plan }}
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- Social Proof Strip -->
    <section class="social-section">
      <div class="social-stats-row">
        <div v-for="stat in socialStats" :key="stat.value" class="social-stat">
          <span class="social-stat-value">{{ stat.value }}</span>
          <span class="social-stat-label">{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="faq-section">
      <div class="section-header">
        <div class="page-chip">
          <span class="chip-dot" aria-hidden="true" />
          FAQ
        </div>
        <h2 class="section-title">Common questions.</h2>
      </div>
      <div class="faq-grid">
        <div v-for="(item, i) in faqs" :key="i" class="faq-item" :class="{ 'faq-item--open': openFaq === i }" @click="openFaq = openFaq === i ? null : i">
          <div class="faq-question">
            <span>{{ item.q }}</span>
            <span class="faq-chevron" aria-hidden="true">{{ openFaq === i ? '−' : '+' }}</span>
          </div>
          <div v-if="openFaq === i" class="faq-answer">{{ item.a }}</div>
        </div>
      </div>
    </section>

    <!-- CTA Banner -->
    <section class="cta-section">
      <div class="cta-dot-grid" aria-hidden="true" />
      <div class="cta-inner">
        <div class="page-chip">
          <span class="chip-dot" aria-hidden="true" />
          START TODAY
        </div>
        <h2 class="cta-title">Your rank is waiting.<br /><span class="text-outline">Don't keep it waiting.</span></h2>
        <p class="cta-sub">Join 50,000+ students already preparing smarter with Cortex404.</p>
        <div class="cta-actions">
          <NuxtLink to="/auth/register" class="iso-btn iso-btn--fill">Start Free — No Card Needed</NuxtLink>
          <NuxtLink to="/dashboard/mock-exam" class="iso-btn iso-btn--ghost">Try a Mock Exam →</NuxtLink>
        </div>
        <p class="cta-fine">7-day free trial on Pro & Elite. Cancel anytime.</p>
      </div>
    </section>

  </div>
</template>

<script setup>
definePageMeta({ layout: 'default' })

const billing = ref('monthly')
const hoveredPlan = ref(null)
const openFaq = ref(null)

const freePlan = {
  features: [
    { text: 'Question bank access', included: true, limit: '50/day' },
    { text: 'Mock exams', included: true, limit: '2/month' },
    { text: 'Progress tracking', included: true },
    { text: 'Leaderboard (view only)', included: true },
    { text: 'All exam streams', included: false },
    { text: 'Bookmark questions', included: false },
    { text: 'Detailed explanations', included: false },
    { text: 'Weak topic drill', included: false },
    { text: 'Study streak tracking', included: false },
    { text: 'Offline access', included: false },
  ]
}

const proPlan = {
  features: [
    { text: 'Unlimited question bank', included: true },
    { text: 'Unlimited mock exams', included: true },
    { text: 'Full progress analytics', included: true },
    { text: 'Leaderboard (compete)', included: true },
    { text: 'All 6 exam streams', included: true },
    { text: 'Bookmark questions', included: true },
    { text: 'Detailed explanations', included: true },
    { text: 'Weak topic drill', included: true },
    { text: 'Study streak tracking', included: true },
    { text: 'Offline access', included: false },
  ]
}

const elitePlan = {
  features: [
    { text: 'Unlimited question bank', included: true },
    { text: 'Unlimited mock exams', included: true },
    { text: 'Full progress analytics', included: true },
    { text: 'Leaderboard (compete)', included: true },
    { text: 'All 6 exam streams', included: true },
    { text: 'Bookmark questions', included: true },
    { text: 'Detailed explanations', included: true },
    { text: 'Weak topic drill', included: true },
    { text: 'Study streak tracking', included: true },
    { text: 'Offline access', included: true },
  ]
}

const compareGroups = [
  {
    title: 'Question Bank',
    rows: [
      { label: 'Daily question limit', free: '50 Qs', pro: 'Unlimited', elite: 'Unlimited' },
      { label: 'All exam streams', free: false, pro: true, elite: true },
      { label: 'Detailed answer explanations', free: false, pro: true, elite: true },
      { label: 'Bookmark questions', free: false, pro: true, elite: true },
      { label: 'Year-wise question filter', free: true, pro: true, elite: true },
      { label: 'Chapter-wise breakdown', free: true, pro: true, elite: true },
    ]
  },
  {
    title: 'Mock Exams',
    rows: [
      { label: 'Mock exams per month', free: '2', pro: 'Unlimited', elite: 'Unlimited' },
      { label: 'Custom difficulty mode', free: false, pro: true, elite: true },
      { label: 'Negative marking simulation', free: false, pro: true, elite: true },
      { label: 'Full question review after exam', free: false, pro: true, elite: true },
      { label: 'Time pressure timer', free: true, pro: true, elite: true },
    ]
  },
  {
    title: 'Analytics & Progress',
    rows: [
      { label: 'Basic progress dashboard', free: true, pro: true, elite: true },
      { label: 'Subject mastery tracking', free: false, pro: true, elite: true },
      { label: 'Weak topic identification', free: false, pro: true, elite: true },
      { label: 'Score trend chart', free: false, pro: true, elite: true },
      { label: 'Activity heatmap', free: false, pro: true, elite: true },
      { label: 'Leaderboard ranking', note: 'Free = view only', free: 'View', pro: true, elite: true },
    ]
  },
  {
    title: 'Advanced',
    rows: [
      { label: 'Offline access', free: false, pro: false, elite: true },
      { label: 'Priority support', free: false, pro: false, elite: true },
      { label: 'Early feature access', free: false, pro: false, elite: true },
      { label: 'Export progress PDF', free: false, pro: false, elite: true },
    ]
  }
]

const examStreams = [
  { name: 'HSC', icon: '📘', count: '12,400+', plans: ['FREE', 'PRO', 'ELITE'] },
  { name: 'SSC', icon: '📗', count: '9,800+', plans: ['FREE', 'PRO', 'ELITE'] },
  { name: 'BUET', icon: '⚙️', count: '8,200+', plans: ['PRO', 'ELITE'] },
  { name: 'Medical', icon: '🩺', count: '10,500+', plans: ['PRO', 'ELITE'] },
  { name: 'DU Admission', icon: '🏛️', count: '7,300+', plans: ['PRO', 'ELITE'] },
  { name: 'BCS', icon: '🇧🇩', count: '15,000+', plans: ['PRO', 'ELITE'] },
]

const socialStats = [
  { value: '50,000+', label: 'Active Students' },
  { value: '63,000+', label: 'Questions in Bank' },
  { value: '4.8/5', label: 'Average Rating' },
  { value: '82%', label: 'Pass Rate Improvement' },
]

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades apply at the start of your next billing cycle, so you keep your current features until then.'
  },
  {
    q: 'Is there really a 7-day free trial on Pro and Elite?',
    a: 'Absolutely. No credit card is required to start the trial. You get full access to all features of your chosen plan for 7 days. After that, you can subscribe or drop to the Free plan — no pressure.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept bKash, Nagad, Rocket, and all major credit/debit cards (Visa, Mastercard). Bank transfer is also available for yearly plans.'
  },
  {
    q: 'Are the questions updated regularly?',
    a: 'Yes. Our question bank is updated after every major exam with new questions sourced from official question papers. We also add new questions every week across all streams.'
  },
  {
    q: 'Does the Free plan ever expire?',
    a: 'No. The Free plan is yours forever with no expiry. You can use it as long as you like and upgrade whenever you\'re ready.'
  },
  {
    q: 'Can I use Cortex404 on my phone?',
    a: 'Cortex404 is fully responsive and works great in any mobile browser. Elite plan users also get offline access so you can practice without internet.'
  },
]
</script>

<style scoped>
/* ─── Page Base ─────────────────────────────────────────────── */
.pricing-page {
  background: var(--black, #080808);
  color: var(--white, #f0f0ea);
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
  font-family: var(--font-sans, 'Space Grotesk', sans-serif);
}

.grain-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px 200px;
}

/* ─── Design Tokens ─────────────────────────────────────────── */
.pricing-page {
  --black: #080808;
  --white: #f0f0ea;
  --gray: rgba(240,240,234,0.45);
  --dim: rgba(240,240,234,0.25);
  --border: rgba(240,240,234,0.08);
  --border-bright: rgba(240,240,234,0.35);
  --font-mono: 'Space Mono', monospace;
  --font-sans: 'Space Grotesk', sans-serif;
}

/* ─── Dot Grid ──────────────────────────────────────────────── */
.dot-grid, .cta-dot-grid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

/* ─── Page Chip ─────────────────────────────────────────────── */
.page-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 5px 10px;
  margin-bottom: 1.5rem;
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--white);
  display: inline-block;
  animation: chipPulse 2.4s ease-in-out infinite;
}

.chip-dot--dark {
  background: var(--black);
}

@keyframes chipPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ─── Text Outline ──────────────────────────────────────────── */
.text-outline {
  -webkit-text-stroke: 1px var(--white);
  color: transparent;
}

/* ─── Hero ──────────────────────────────────────────────────── */
.pricing-hero {
  position: relative;
  padding: 100px 40px 80px;
  text-align: center;
  border-bottom: 1px solid var(--border);
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0 auto;
}

.hero-title {
  font-family: var(--font-mono);
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 1.2rem;
  color: var(--white);
}

.hero-sub {
  font-size: 1.05rem;
  color: var(--gray);
  line-height: 1.65;
  max-width: 500px;
  margin: 0 auto 2.5rem;
}

/* ─── Billing Toggle ────────────────────────────────────────── */
.billing-toggle {
  display: inline-flex;
  border: 1px solid var(--border-bright);
  overflow: hidden;
  position: relative;
}

.toggle-pill {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 8px 20px;
  background: transparent;
  border: none;
  color: var(--gray);
  cursor: pointer;
  transition: all 0.18s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-pill.active {
  background: var(--white);
  color: var(--black);
}

.save-badge {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  letter-spacing: 0.08em;
  background: rgba(120,230,120,0.18);
  color: rgba(120,230,120,1);
  border: 1px solid rgba(120,230,120,0.3);
  padding: 2px 6px;
}

/* ─── Plans Grid ────────────────────────────────────────────── */
.plans-section {
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
}

/* ─── Plan Card ─────────────────────────────────────────────── */
.plan-card {
  background: var(--black);
  padding: 36px 32px;
  position: relative;
  transition: transform 0.2s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s cubic-bezier(0.22,1,0.36,1), background 0.18s;
  box-shadow:
    2px 2px 0 0 rgba(240,240,234,0.07),
    4px 4px 0 0 rgba(240,240,234,0.05),
    6px 6px 0 0 rgba(240,240,234,0.03),
    8px 8px 0 0 rgba(240,240,234,0.015);
}

.plan-card--hovered {
  background: rgba(240,240,234,0.025);
  transform: translate(-5px, -5px);
  box-shadow:
    2px 2px 0 0 rgba(240,240,234,0.12),
    4px 4px 0 0 rgba(240,240,234,0.09),
    6px 6px 0 0 rgba(240,240,234,0.06),
    8px 8px 0 0 rgba(240,240,234,0.04),
    10px 10px 0 0 rgba(240,240,234,0.02),
    12px 12px 0 0 rgba(240,240,234,0.01);
}

.plan-card--pro {
  background: rgba(240,240,234,0.035);
  box-shadow:
    2px 2px 0 0 rgba(240,240,234,0.12),
    4px 4px 0 0 rgba(240,240,234,0.09),
    6px 6px 0 0 rgba(240,240,234,0.06),
    8px 8px 0 0 rgba(240,240,234,0.03);
}

.plan-card--pro.plan-card--hovered {
  background: rgba(240,240,234,0.06);
  transform: translate(-5px, -5px);
  box-shadow:
    2px 2px 0 0 rgba(240,240,234,0.2),
    4px 4px 0 0 rgba(240,240,234,0.15),
    6px 6px 0 0 rgba(240,240,234,0.1),
    8px 8px 0 0 rgba(240,240,234,0.06),
    10px 10px 0 0 rgba(240,240,234,0.03),
    12px 12px 0 0 rgba(240,240,234,0.015);
}

/* give the grid overflow room for the shadow lift */
.plans-grid {
  overflow: visible !important;
}

.plans-section {
  overflow: visible !important;
}

/* Corner brackets */
.plan-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
}

.corner-tl {
  top: 12px;
  left: 12px;
  border-top: 1.5px solid var(--border-bright);
  border-left: 1.5px solid var(--border-bright);
}

.corner-br {
  bottom: 12px;
  right: 12px;
  border-bottom: 1.5px solid var(--border-bright);
  border-right: 1.5px solid var(--border-bright);
}

.plan-featured-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--black);
  background: var(--white);
  padding: 4px 10px;
  margin-bottom: 1rem;
}

.plan-tier {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.2em;
  color: var(--dim);
  margin-bottom: 6px;
}

.plan-name {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--white);
  margin-bottom: 1.2rem;
}

.plan-price-block {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}

.plan-price {
  font-family: var(--font-mono);
  font-size: 2.8rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--white);
  line-height: 1;
}

.plan-period {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--gray);
}

.plan-yearly-note {
  font-size: 0.75rem;
  color: rgba(120,230,120,0.85);
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
  margin-bottom: 0;
  margin-top: 2px;
}

.plan-desc {
  font-size: 0.88rem;
  color: var(--gray);
  line-height: 1.5;
  margin: 8px 0 0;
}

.plan-divider {
  height: 1px;
  background: var(--border);
  margin: 1.6rem 0;
}

/* ─── Feature List ──────────────────────────────────────────── */
.plan-features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.88rem;
  color: var(--white);
  line-height: 1.4;
}

.feature-item.feature-disabled {
  color: var(--dim);
}

.feature-icon {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  min-width: 14px;
  color: var(--white);
}

.feature-disabled .feature-icon {
  color: var(--dim);
}

.feature-limit {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: var(--dim);
  border: 1px solid var(--border);
  padding: 1px 6px;
  margin-left: auto;
  white-space: nowrap;
}

/* ─── iso-btn (matching global.css pattern) ─────────────────── */
.iso-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 12px 20px;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.12s, box-shadow 0.12s;
  border: none;
  outline: none;
  position: relative;
}

.iso-btn--fill {
  background: var(--white);
  color: var(--black);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.2), 3px 3px 0 0 rgba(240,240,234,0.12), 4px 4px 0 0 rgba(240,240,234,0.06);
}

.iso-btn--fill:hover {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.2), 5px 5px 0 0 rgba(240,240,234,0.12), 6px 6px 0 0 rgba(240,240,234,0.06);
}

.iso-btn--ghost {
  background: transparent;
  color: var(--white);
  border: 1px solid var(--border-bright);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.06), 3px 3px 0 0 rgba(240,240,234,0.04);
}

.iso-btn--ghost:hover {
  transform: translate(-2px, -2px);
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.1), 5px 5px 0 0 rgba(240,240,234,0.06);
  border-color: var(--white);
}

.iso-btn--full {
  width: 100%;
}

/* ─── Compare Table ─────────────────────────────────────────── */
.compare-section {
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border);
}

.section-header {
  margin-bottom: 2.5rem;
}

.section-title {
  font-family: var(--font-mono);
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--white);
  margin: 0;
}

.compare-table-wrap {
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.compare-header-row,
.compare-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  border-bottom: 1px solid var(--border);
  transition: background 0.14s;
}

.compare-row:hover {
  background: rgba(240,240,234,0.03);
}

.compare-row:hover .compare-feature-col {
  border-left: 2px solid var(--border-bright);
  padding-left: 18px;
}

.compare-feature-col {
  transition: border-left 0.14s, padding-left 0.14s;
  border-left: 2px solid transparent;
}

.compare-row:hover .compare-plan-col .check-yes {
  text-shadow: 0 0 8px rgba(120,230,120,0.5);
}

.compare-row:hover .check-val {
  color: var(--white);
}

.compare-header-row {
  background: rgba(240,240,234,0.03);
}

.compare-header-row:last-child,
.compare-row:last-child {
  border-bottom: none;
}

.compare-feature-col,
.compare-plan-col {
  padding: 14px 20px;
  border-right: 1px solid var(--border);
}

.compare-plan-col:last-child {
  border-right: none;
}

.compare-feature-col {
  font-size: 0.85rem;
  color: var(--white);
}

.compare-plan-col {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.compare-plan-col--pro {
  background: rgba(240,240,234,0.025);
}

.compare-plan-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--white);
}

.compare-plan-sub {
  font-family: var(--font-mono);
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--dim);
}

.compare-group-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--dim);
  padding: 10px 20px 8px;
  background: rgba(240,240,234,0.015);
  border-bottom: 1px solid var(--border);
}

.compare-row-label {
  font-size: 0.85rem;
  color: var(--white);
  display: block;
}

.compare-row-note {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  color: var(--dim);
  letter-spacing: 0.06em;
  display: block;
  margin-top: 2px;
}

.check-yes {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  color: rgba(120,230,120,0.9);
}

.check-no {
  font-family: var(--font-mono);
  font-size: 0.88rem;
  color: var(--dim);
}

.check-val {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--gray);
  letter-spacing: 0.04em;
}

/* ─── Streams ───────────────────────────────────────────────── */
.streams-section {
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border);
}

.streams-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.stream-card {
  background: var(--black);
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: background 0.15s, border-left 0.15s;
  border-left: 2px solid transparent;
}

.stream-card:hover {
  background: rgba(240,240,234,0.02);
  border-left-color: var(--border-bright);
}

.stream-icon {
  font-size: 1.6rem;
  line-height: 1;
  min-width: 32px;
}

.stream-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}

.stream-name {
  font-family: var(--font-mono);
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--white);
}

.stream-count {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: var(--dim);
}

.stream-plans {
  display: flex;
  gap: 4px;
}

.stream-plan-badge {
  font-family: var(--font-mono);
  font-size: 0.5rem;
  letter-spacing: 0.12em;
  padding: 2px 6px;
  border: 1px solid;
}

.badge--free {
  color: var(--gray);
  border-color: var(--border);
}

.badge--pro {
  color: var(--white);
  border-color: rgba(240,240,234,0.4);
}

.badge--elite {
  color: rgba(255,200,80,0.9);
  border-color: rgba(255,200,80,0.3);
}

/* ─── Social Stats ──────────────────────────────────────────── */
.social-section {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.social-stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--border);
  gap: 1px;
}

.social-stat {
  background: var(--black);
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
  align-items: center;
}

.social-stat-value {
  font-family: var(--font-mono);
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--white);
}

.social-stat-label {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--gray);
}

/* ─── FAQ ───────────────────────────────────────────────────── */
.faq-section {
  padding: 60px 40px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid var(--border);
}

.faq-grid {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.faq-item {
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background 0.15s;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item:hover {
  background: rgba(240,240,234,0.02);
}

.faq-item--open {
  background: rgba(240,240,234,0.025);
  border-left: 2px solid var(--border-bright);
}

.faq-question {
  padding: 20px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-size: 0.92rem;
  color: var(--white);
  font-family: var(--font-sans);
  font-weight: 500;
}

.faq-chevron {
  font-family: var(--font-mono);
  font-size: 1.1rem;
  color: var(--gray);
  min-width: 16px;
  text-align: center;
  transition: transform 0.15s;
}

.faq-answer {
  padding: 0 28px 20px;
  font-size: 0.88rem;
  color: var(--gray);
  line-height: 1.7;
  border-top: 1px solid var(--border);
  padding-top: 16px;
}

/* ─── CTA Section ───────────────────────────────────────────── */
.cta-section {
  position: relative;
  padding: 80px 40px 100px;
  text-align: center;
  border-top: 1px solid var(--border);
  overflow: hidden;
}

.cta-inner {
  position: relative;
  z-index: 1;
  max-width: 680px;
  margin: 0 auto;
}

.cta-title {
  font-family: var(--font-mono);
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.02em;
  color: var(--white);
  margin: 0 0 1.2rem;
}

.cta-sub {
  font-size: 1rem;
  color: var(--gray);
  margin-bottom: 2.4rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 1.2rem;
}

.cta-fine {
  font-family: var(--font-mono);
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: var(--dim);
  text-transform: uppercase;
}

/* ─── Responsive ────────────────────────────────────────────── */
@media (max-width: 960px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }

  .streams-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .compare-header-row,
  .compare-row {
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
  }

  .social-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .pricing-hero {
    padding: 70px 20px 56px;
  }

  .plans-section,
  .compare-section,
  .streams-section,
  .faq-section,
  .cta-section {
    padding-left: 20px;
    padding-right: 20px;
  }

  .compare-section {
    overflow-x: auto;
  }

  .compare-table-wrap {
    min-width: 560px;
  }

  .streams-grid {
    grid-template-columns: 1fr;
  }

  .social-stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
