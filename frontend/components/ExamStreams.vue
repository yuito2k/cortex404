<template>
  <section id="exams" class="section-wrap streams-bg">
    <p class="section-tag">{{ t('examStreams.chip') }}</p>
    <h2>{{ t('examStreams.heading1') }}<br />{{ t('examStreams.heading2') }}</h2>
    <p class="section-sub">
      {{ t('examStreams.subHeading') }}
    </p>

    <div ref="gridRef" class="streams-grid fade-up">
      <a v-for="s in streams" :key="s.title" href="#" class="stream-card">
        <span class="stream-label">{{ s.label }}</span>
        <span class="stream-title">{{ s.title }}</span>
        <span class="stream-count">{{ s.count }}</span>
      </a>
    </div>
  </section>
</template>

<script setup>
const { t, ta } = useI18n()
const gridRef = ref(null)

const streams = computed(() => ta('examStreams.streams'))

onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.08 })
  if (gridRef.value) obs.observe(gridRef.value)
})
</script>

<style scoped>
.streams-bg { background: #0d0d0d; }

.streams-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.05);
}

.stream-card {
  background: #0d0d0d;
  padding: 2rem 1.8rem;
  display: flex; flex-direction: column; gap: 0.9rem;
  transition: background 0.2s, border-color 0.2s; cursor: pointer;
  border-left: 2px solid transparent;
  position: relative;
}
.stream-card:hover {
  background: #161616;
  border-left-color: var(--border-bright);
}
.stream-card::after {
  content: '→';
  position: absolute; bottom: 1.8rem; right: 1.8rem;
  font-family: var(--font-mono); font-size: 0.75rem;
  color: var(--gray); opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
}
.stream-card:hover::after { opacity: 1; transform: translateX(3px); }

.stream-label {
  font-family: var(--font-mono);
  font-size: 0.58rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gray);
}

.stream-title {
  font-family: var(--font-mono);
  font-size: 0.95rem; font-weight: 700;
  color: var(--white); line-height: 1.3;
}

.stream-count {
  font-size: 0.73rem; color: var(--gray);
  margin-top: auto; padding-top: 1rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 960px) { .streams-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .streams-grid { grid-template-columns: 1fr; } }
</style>
