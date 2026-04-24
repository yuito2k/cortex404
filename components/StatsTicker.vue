<template>
  <div class="ticker-section">
    <div class="ticker-track">
      <div v-for="(item, i) in doubled" :key="i" class="ticker-item">
        <span class="ticker-num">{{ item.value }}</span>
        <span class="ticker-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const items = [
  { value: '1M+',   label: 'Questions in Bank' },
  { value: '500K+', label: 'Students Enrolled' },
  { value: '50+',   label: 'Exam Categories' },
  { value: '4.8★',  label: 'Average Rating' },
  { value: '24/7',  label: 'AI Doubt Solving' },
  { value: '100%',  label: 'Ad-Free Platform' },
]

// Duplicate for seamless loop
const doubled = [...items, ...items]
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
