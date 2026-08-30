<template>
  <footer class="footer">
    <div class="footer-top">
      <div class="footer-brand">
        <NuxtLink to="/" class="footer-logo">
          CORTEX<span class="gray">404</span>
        </NuxtLink>
        <p>{{ t('footer.tagline') }}</p>
        <div class="socials">
          <a v-for="s in socials" :key="s.label" href="#" class="social-btn" :aria-label="s.label">{{ s.icon }}</a>
        </div>
      </div>

      <div v-for="col in footerCols" :key="col.heading" class="footer-col">
        <h4>{{ col.heading }}</h4>
        <ul>
          <li v-for="link in col.links" :key="link">
            <a href="#">{{ link }}</a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© 2026 Cortex404. All rights reserved.</span>
      <div class="footer-bottom-right">
          <LangToggle />
      </div>
    </div>
  </footer>
</template>

<script setup>
const { t, ta } = useI18n()
const socials = [
  { label: 'Facebook',  icon: 'fb' },
  { label: 'LinkedIn',  icon: 'in' },
  { label: 'YouTube',   icon: 'yt' },
  { label: 'Instagram', icon: 'ig' },
]

const footerCols = computed(() => ta('footer.footerCols'))
</script>

<style scoped>
.footer {
  padding: 60px 6vw 40px;
  border-top: 1px solid var(--border);
}

.footer-top {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  margin-bottom: 3rem;
}

.footer-logo {
  font-family: var(--font-mono);
  font-weight: 700; font-size: 1.1rem;
  color: var(--white); display: block; margin-bottom: 1rem;
}
.gray { color: var(--gray); }

.footer-brand p {
  font-size: 0.8rem; color: var(--gray);
  line-height: 1.7; max-width: 280px; margin-bottom: 1.5rem;
}

.socials { display: flex; gap: 8px; }
.social-btn {
  width: 32px; height: 32px;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray); font-size: 0.7rem;
  transition: border-color 0.2s, color 0.2s;
}
.social-btn:hover { border-color: var(--white); color: var(--white); }

.footer-col h4 {
  font-family: var(--font-mono);
  font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--gray); margin-bottom: 1.2rem;
}
.footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 10px; }
.footer-col ul li a {
  font-size: 0.8rem; color: rgba(240,240,234,0.45);
  transition: color 0.2s;
}
.footer-col ul li a:hover { color: var(--white); }

.footer-bottom {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 2rem; border-top: 1px solid var(--border);
  font-size: 0.7rem; color: var(--gray);
}
.footer-bottom-right { display: flex; align-items: center; gap: 16px; }

@media (max-width: 960px) { .footer-top { grid-template-columns: 1fr 1fr; } }
@media (max-width: 560px) { .footer-top { grid-template-columns: 1fr; } }
</style>
