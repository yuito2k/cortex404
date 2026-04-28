// plugins/i18n.client.ts
// Reads saved locale from localStorage before first render to avoid flash.
export default defineNuxtPlugin(() => {
  if (!import.meta.client) return
  const stored = localStorage.getItem('cortex404_locale')
  if (stored === 'bn') document.documentElement.lang = 'bn'
})
