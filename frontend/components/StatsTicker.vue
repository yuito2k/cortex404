<template>
  <div class="ticker-section">
    <div class="ticker-track">
      <div v-for="item in items" :key="item.label" class="ticker-item">
        <span class="ticker-num">{{ item.value }}</span>
        <span class="ticker-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const { ta } = useI18n()
const items = computed(() => ta('statsTicker.stats'))
</script>

<style scoped>
.ticker-section {
  padding: 38px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
}
.ticker-track {
  display: flex;
  animation: ticker 22s linear infinite;
  width: max-content;
}
.ticker-item {
  display: flex; align-items: center; gap: 1.5rem;
  padding: 0 3rem;
  border-right: 1px solid var(--border);
  white-space: nowrap;
}
.ticker-num {
  font-family: var(--font-mono);
  font-size: 1.7rem; font-weight: 700; color: var(--white);
}
.ticker-label {
  font-size: 0.72rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--gray);
}
</style>
