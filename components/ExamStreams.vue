<template>
  <section id="exams" class="section-wrap streams-bg">
    <p class="section-tag">Exam Coverage</p>
    <h2>Every Exam.<br />One Platform.</h2>
    <p class="section-sub">
      From school board to BCS — Cortex404 covers all major exams in Bangladesh.
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
const gridRef = ref(null)

const streams = [
  { label: 'Board Exam',           title: 'SSC',                   count: 'All boards · Science, Arts, Commerce' },
  { label: 'Board Exam',           title: 'HSC Science',           count: 'Physics · Chemistry · Biology · Math' },
  { label: 'Board Exam',           title: 'HSC Arts & Commerce',   count: 'All subjects covered' },
  { label: 'University Admission', title: 'BUET · DU · CU · RU',  count: 'All units & clusters' },
  { label: 'University Admission', title: 'Medical & Dental',      count: 'MBBS · BDS · AFMC · Nursing' },
  { label: 'Competitive',          title: 'BCS Preliminary',       count: '38th – 47th BCS full archives' },
  { label: 'Job Prep',             title: 'Bank & Govt Jobs',      count: 'Bangladesh Bank · Primary · Others' },
  { label: 'Engineering',          title: 'RUET · KUET · CUET',   count: 'IUT · MIST · BUP · SUST included' },
]

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
}

.stream-card {
  background: #0d0d0d;
  padding: 2rem 1.8rem;
  display: flex; flex-direction: column; gap: 0.9rem;
  transition: background 0.2s; cursor: pointer;
}
.stream-card:hover { background: #161616; }

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
