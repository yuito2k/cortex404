<template>
  <button
    class="lang-toggle"
    :class="{ 'is-bn': isBn }"
    :aria-label="isBn ? 'Switch to English' : 'বাংলায় দেখুন'"
    @click="toggleLocale"
  >
    <span class="lt-track" aria-hidden="true">
      <span class="lt-pill lt-pill--en">EN</span>
      <span class="lt-pill lt-pill--bn">বাং</span>
    </span>
    <span class="lt-knob" aria-hidden="true">
      <span class="lt-knob-label">{{ isBn ? 'বাং' : 'EN' }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
const { isBn, toggleLocale } = useI18n()
</script>

<style scoped>
.lang-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 72px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--border-bright);
  border-radius: 0;
  cursor: pointer;
  outline: none;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.06), 3px 3px 0 0 rgba(240,240,234,0.03);
  transition: box-shadow 0.15s ease, transform 0.15s ease, border-color 0.15s ease;
}
.lang-toggle:hover {
  border-color: var(--white);
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.08), 4px 4px 0 0 rgba(240,240,234,0.04);
  transform: translate(-1px, -1px);
}
.lang-toggle:active { transform: translate(1px, 1px); box-shadow: none; }

.lt-track {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.lt-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--white);
  opacity: 0.35;
}
.lt-pill--bn { font-size: 0.72rem; letter-spacing: 0; }
.lang-toggle:not(.is-bn) .lt-pill--en { opacity: 0; }
.lang-toggle.is-bn .lt-pill--bn { opacity: 0; }

.lt-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: calc(100% - 4px);
  background: var(--white);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 1px 0 0 rgba(0,0,0,0.4);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}
.lang-toggle.is-bn .lt-knob { transform: translateX(100%); }

.lt-knob-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--black);
  user-select: none;
}
.lang-toggle.is-bn .lt-knob-label { font-size: 0.72rem; letter-spacing: 0; }

@media (max-width: 768px) {
  .lang-toggle { width: 64px; height: 28px; }
}
</style>
