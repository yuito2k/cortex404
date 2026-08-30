<template>
  <section id="testimonials" class="section-wrap">
    <p class="section-tag">{{ t('testimonials.chip') }}</p>
    <h2>{{ t('testimonials.heading') }}</h2>
    <p class="section-sub">
      {{ t('testimonials.subHeading') }}
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
const { t, ta } = useI18n()
const gridRef = ref(null)

const testimonials = computed(() => ta('testimonials.testimonials'))

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
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.05);
}

.tcard {
  background: var(--black);
  padding: 2rem;
  display: flex; flex-direction: column; gap: 1rem;
  border-left: 2px solid transparent;
  transition: background 0.2s, border-color 0.2s;
}
.tcard:hover { background: #0d0d0d; border-left-color: var(--border-bright); }

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
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.08), 1px 1px 0 0 rgba(240,240,234,0.05);
}

.tcard-name {
  font-family: var(--font-mono);
  font-size: 0.72rem; font-weight: 700; color: var(--white);
}
.tcard-uni { font-size: 0.68rem; color: var(--gray); }

@media (max-width: 960px) { .t-grid { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .t-grid { grid-template-columns: 1fr; } }
</style>
