// composables/useI18n.ts
import en from '~/locales/en'
import bn from '~/locales/bn'

type Locale = 'en' | 'bn'
const STORAGE_KEY = 'cortex404_locale'

// Module-level singleton — shared across all components
const locale = ref<Locale>('en')

function deepGet(obj: Record<string, any>, path: string): any {
  return path.split('.').reduce((acc, key) => acc?.[key] ?? null, obj as any)
}

export function useI18n() {
  onMounted(() => {
    if (!import.meta.client) return
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (stored === 'en' || stored === 'bn') locale.value = stored
  })

  /** t('hero.headline1') → string */
  function t(key: string): string {
    const src = locale.value === 'bn' ? bn : en
    const val = deepGet(src as Record<string, any>, key)
    return typeof val === 'string' ? val : String(val ?? key)
  }

  /** ta('features.items') → array */
  function ta(key: string): any[] {
    const src = locale.value === 'bn' ? bn : en
    const val = deepGet(src as Record<string, any>, key)
    return Array.isArray(val) ? val : []
  }

  /** tm('features.items') → object or nested structure */
  function tm(key: string): any {
    const src = locale.value === 'bn' ? bn : en
    return deepGet(src as Record<string, any>, key) ?? {}
  }

  function setLocale(loc: Locale) {
    locale.value = loc
    if (import.meta.client) localStorage.setItem(STORAGE_KEY, loc)
  }

  function toggleLocale() {
    setLocale(locale.value === 'en' ? 'bn' : 'en')
  }

  const isBn = computed(() => locale.value === 'bn')

  return { locale: readonly(locale), t, ta, tm, setLocale, toggleLocale, isBn }
}
