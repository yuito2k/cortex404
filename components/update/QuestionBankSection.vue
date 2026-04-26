<template>
  <section class="section-wrap">
    <div ref="wrapRef" class="qbank-wrap fade-up">
      <div class="qbank-text">
        <p class="section-tag">Question Bank</p>
        <h2>1,000,000+ Questions.<br />Zero Repetition.</h2>
        <p class="section-sub">
          Built from actual board and competitive exam papers going back 7+ years.
          Every question tagged by topic, difficulty, and year — so you always practice what matters.
        </p>
        <a href="#" class="btn-fill">Browse Questions →</a>
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
const wrapRef = ref(null)

const questions = [
  {
    subject: 'Physics · HSC', difficulty: 'Medium',
    question: 'A body of mass 5 kg is acted upon by a net force of 20 N. What is the acceleration of the body?',
    options: [
      { label: 'A', text: '2 m/s²',  correct: false },
      { label: 'B', text: '4 m/s²',  correct: true  },
      { label: 'C', text: '6 m/s²',  correct: false },
      { label: 'D', text: '8 m/s²',  correct: false },
    ],
  },
  {
    subject: 'Chemistry · HSC', difficulty: 'Hard',
    question: 'Which of the following elements has the highest electronegativity?',
    options: [
      { label: 'A', text: 'Oxygen',   correct: false },
      { label: 'B', text: 'Nitrogen', correct: false },
      { label: 'C', text: 'Fluorine', correct: true  },
      { label: 'D', text: 'Chlorine', correct: false },
    ],
  },
  {
    subject: 'BCS General Knowledge', difficulty: 'Easy',
    question: 'Which is the longest river system flowing through Bangladesh?',
    options: [
      { label: 'A', text: 'Meghna',    correct: true  },
      { label: 'B', text: 'Buriganga', correct: false },
      { label: 'C', text: 'Karnaphuli',correct: false },
      { label: 'D', text: 'Surma',     correct: false },
    ],
  },
]

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
  transition: transform 0.2s;
}
.qcard:hover { transform: translateX(6px); }

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
}
.qcard-opt:hover { background: #1a1a1a; border-color: var(--border-bright); }
.qcard-opt.correct {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.07);
  color: var(--white);
}

@media (max-width: 960px) {
  .qbank-wrap { grid-template-columns: 1fr; gap: 3rem; }
}
</style>
