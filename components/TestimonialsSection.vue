<template>
  <section id="testimonials" class="section-wrap">
    <p class="section-tag">Student Stories</p>
    <h2>Results That Speak.</h2>
    <p class="section-sub">
      Thousands of students have used Cortex404 to crack their dream exams.
    </p>

    <div ref="gridRef" class="t-grid fade-up">
      <div v-for="t in testimonials" :key="t.name" class="tcard">
        <div class="stars">★★★★★</div>
        <p class="tcard-text">"{{ t.quote }}"</p>
        <div class="tcard-author">
          <div class="avatar">{{ t.initials }}</div>
          <div>
            <div class="tcard-name">{{ t.name }}</div>
            <div class="tcard-uni">{{ t.uni }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
const gridRef = ref(null)

const testimonials = [
  { initials: 'IH', name: 'Imran Hossain',   uni: 'BUET · EEE',           quote: 'Cortex404 completely changed how I study. The mock tests and AI explanations helped me nail my HSC physics. I recommend it to every student I know.' },
  { initials: 'SK', name: 'Sara Khatun',     uni: 'Dhaka University',      quote: 'The streak system made me study every single day without fail. It feels like a game but the results are very real. Got into DU on my first attempt.' },
  { initials: 'TA', name: 'Tanvir Ahmed',    uni: 'KUET · Mechanical',     quote: 'Works perfectly even on my old Android with slow internet. The app is lightweight and the question bank is massive. One of the best study tools in Bangladesh.' },
  { initials: 'MS', name: 'Mousumi Sultana', uni: 'SUST · Chemistry',      quote: 'The explanations are crystal clear. I used to struggle with BCS questions but now I understand the reasoning behind every answer. Truly impressive platform.' },
  { initials: 'NI', name: 'Nabila Islam',    uni: 'Chittagong University', quote: 'Completely ad-free even on the free plan. Finally a platform that respects students. The leaderboard keeps me motivated and competitive every day.' },
  { initials: 'RI', name: 'Raihan ul Islam', uni: 'RUET · CSE',            quote: 'Once you start giving daily tests, you fall in love with the habit. It pushed my scores up week after week until I finally cleared my admission exam.' },
]

onMounted(() => {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') })
  }, { threshold: 0.08 })
  if (gridRef.value) obs.observe(gridRef.value)
})
</script>

<style scoped>
.t-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
}

.tcard {
  background: var(--black);
  padding: 2rem;
  display: flex; flex-direction: column; gap: 1rem;
}

.stars { font-size: 0.75rem; color: var(--white); letter-spacing: 2px; }

.tcard-text {
  font-size: 0.86rem; font-weight: 300;
  line-height: 1.75; color: var(--dim);
  flex: 1; font-style: italic;
}

.tcard-author {
  display: flex; align-items: center; gap: 12px;
  padding-top: 1rem; border-top: 1px solid var(--border);
}

.avatar {
  width: 36px; height: 36px;
  background: #1a1a1a; border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  color: var(--white); flex-shrink: 0;
}

.tcard-name {
  font-family: var(--font-mono);
  font-size: 0.72rem; font-weight: 700; color: var(--white);
}
.tcard-uni { font-size: 0.68rem; color: var(--gray); }

@media (max-width: 960px) { .t-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .t-grid { grid-template-columns: 1fr; } }
</style>
