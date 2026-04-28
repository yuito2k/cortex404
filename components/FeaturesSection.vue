<template>
  <section id="features" class="section-wrap">
    <p class="section-tag">{{ t('features.chip') }}</p>
    <h2>{{ t('features.heading1') }}<br />{{ t('features.heading2') }} &amp; {{ t('features.heading3') }}</h2>
    <p class="section-sub">
      {{ t('features.subHeading') }}
    </p>

    <div ref="gridRef" class="features-grid fade-up">
      <div v-for="f in features" :key="f.id" class="fcard">
        <span class="fcard-num">{{ f.num }}</span>
        <div class="fcard-icon" v-html="f.icon" />
        <h3 class="fcard-title">{{ f.title }}</h3>
        <p class="fcard-desc">{{ f.desc }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
const { t, ta } = useI18n()
const gridRef = ref(null)

const features = computed(() => ta('features.items'))

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
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.05);
}

.fcard {
  background: var(--black);
  padding: 2.5rem 2rem;
  position: relative;
  transition: background 0.25s;
  border-left: 2px solid transparent;
}
.fcard:hover { background: #111; border-left-color: var(--border-bright); }

.fcard-num {
  position: absolute; top: 1.5rem; right: 1.8rem;
  font-family: var(--font-mono); font-size: 0.62rem;
  color: rgba(255,255,255,0.5); letter-spacing: 0.1em;
}

.fcard-icon {
  width: 46px; height: 46px;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 1.8rem; color: var(--white);
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.08), 2px 2px 0 0 rgba(240,240,234,0.05);
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
