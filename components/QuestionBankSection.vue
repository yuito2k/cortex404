<template>
  <section class="section-wrap">
    <div ref="wrapRef" class="qbank-wrap fade-up">
      <div class="qbank-text">
        <p class="section-tag">{{ t('questionBankSection.chip') }}</p>
        <h2>{{ t('questionBankSection.heading1') }}<br />{{ t('questionBankSection.heading2') }}</h2>
        <p class="section-sub">
          {{ t('questionBankSection.subHeading') }}
        </p>
        <NuxtLink to="/dashboard/question-bank" class="iso-btn iso-btn--fill">{{ t('questionBankSection.ctaBrowse') }}</NuxtLink>
      </div>

      <div class="qbank-cards">
        <div v-for="q in questions" :key="q.subject" class="qcard">
          <div class="qcard-meta">
            <span class="qcard-subject">{{ q.subject }}</span>
            <span class="qcard-diff">{{ q.difficulty }}</span>
          </div>
          <p class="qcard-text">{{ q.question }}</p>
          <div class="qcard-options">
            <div
              v-for="opt in q.options"
              :key="opt.label"
              class="qcard-opt"
              :class="{ correct: opt.correct }"
            >
              {{ opt.label }}.&nbsp; {{ opt.text }}{{ opt.correct ? ' ✓' : '' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t, ta } = useI18n()
const wrapRef = ref(null)

const questions = computed(() => ta('questionBankSection.questions'))

onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.08 })
  if (wrapRef.value) obs.observe(wrapRef.value)
})
</script>

<style scoped>
.qbank-wrap {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 5rem;
}

.qcard {
  background: #111;
  border: 1px solid var(--border);
  padding: 1.5rem 1.8rem;
  margin-bottom: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06), 3px 3px 0 0 rgba(240,240,234,0.04);
}
.qcard:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.08), 4px 4px 0 0 rgba(240,240,234,0.05);
}

.qcard-meta {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 0.8rem;
}
.qcard-subject {
  font-family: var(--font-mono);
  font-size: 0.58rem; letter-spacing: 0.15em;
  text-transform: uppercase; color: var(--gray);
}
.qcard-diff {
  font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 3px 8px; border: 1px solid var(--border-bright); color: var(--gray);
}
.qcard-text {
  font-size: 0.83rem; font-weight: 300; line-height: 1.65;
  color: var(--white); margin-bottom: 1rem;
}
.qcard-options {
  display: grid; grid-template-columns: 1fr 1fr; gap: 6px;
}
.qcard-opt {
  font-size: 0.73rem; color: var(--dim);
  padding: 7px 10px; border: 1px solid var(--border);
  cursor: pointer; transition: background 0.15s, border-color 0.15s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.qcard-opt:hover { background: #1a1a1a; border-color: var(--border-bright); }
.qcard-opt.correct {
  border-color: rgba(240,240,234,0.4);
  background: rgba(240,240,234,0.06);
  color: var(--white);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.1);
}

@media (max-width: 960px) {
  .qbank-wrap { grid-template-columns: 1fr; gap: 3rem; }
}
</style>
