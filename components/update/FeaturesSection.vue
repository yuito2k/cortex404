<template>
  <section id="features" class="section-wrap">
    <p class="section-tag">Core Features</p>
    <h2>Study is Smart,<br />Fun &amp; Effective</h2>
    <p class="section-sub">
      Everything you need to crack any exam — organized, personalized, and powered by AI.
    </p>

    <div ref="gridRef" class="features-grid fade-up">
      <div v-for="f in features" :key="f.num" class="fcard">
        <span class="fcard-num">{{ f.num }}</span>
        <div class="fcard-icon" v-html="f.icon" />
        <h3 class="fcard-title">{{ f.title }}</h3>
        <p class="fcard-desc">{{ f.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const gridRef = ref(null)

const features = [
  {
    num: '01',
    title: 'Custom Mock Tests',
    desc: 'Choose subject, chapter, time limit, and question count. Build the exact exam you need to practice, on demand.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M8 12h8M12 8v8"/></svg>`,
  },
  {
    num: '02',
    title: 'Question Bank (1M+)',
    desc: 'Previous year questions from every major board and competitive exam, sorted by topic and difficulty.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
  },
  {
    num: '03',
    title: 'AI Doubt Solver',
    desc: 'Ask any question, get an instant explanation aligned with your syllabus and batch. Available 24/7.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M2 12h2M20 12h2M12 2v2M12 20v2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4l1.4-1.4M17 7l1.4-1.4"/></svg>`,
  },
  {
    num: '04',
    title: 'Progress Analytics',
    desc: 'Track your strengths and weak spots exam-by-exam. Visual breakdowns keep your preparation sharp and focused.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
  },
  {
    num: '05',
    title: 'National Leaderboard',
    desc: 'Compete with students across the country. See your rank live and push your limits every single day.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z"/></svg>`,
  },
  {
    num: '06',
    title: 'Streak & Habit System',
    desc: 'Daily goals, streaks, and smart notifications that build a consistent exam habit — automatically.',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>`,
  },
]

onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.08 })
  if (gridRef.value) obs.observe(gridRef.value)
})
</script>

<style scoped>
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
}

.fcard {
  background: var(--black);
  padding: 2.5rem 2rem;
  position: relative;
  transition: background 0.25s;
}
.fcard:hover { background: #111; }

.fcard-num {
  position: absolute; top: 1.5rem; right: 1.8rem;
  font-family: var(--font-mono); font-size: 0.62rem;
  color: rgba(255,255,255,0.08); letter-spacing: 0.1em;
}

.fcard-icon {
  width: 46px; height: 46px;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.8rem; color: var(--white);
}
.fcard-icon :deep(svg) { width: 22px; height: 22px; }

.fcard-title {
  font-family: var(--font-mono);
  font-size: 0.9rem; font-weight: 700;
  color: var(--white); margin-bottom: 0.8rem;
  letter-spacing: -0.2px;
}

.fcard-desc {
  font-size: 0.83rem; font-weight: 300;
  line-height: 1.7; color: var(--dim);
}

@media (max-width: 960px) { .features-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .features-grid { grid-template-columns: 1fr; } }
</style>
