export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/supabase'],

  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: [
        '/',
        '/auth/login',
        '/auth/register',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/confirm',
      ],
    },
  },

  runtimeConfig: {
    public: {
      geminiAPIKey: process.env.GEMINI_API_KEY,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
      supabaseCortexHSC_URL: process.env.SUPABASE_CORTEX_HSC_URL,
      supabaseCortexHSC_KEY: process.env.SUPABASE_CORTEX_HSC_KEY,
      supabaseCortexMedical_URL: process.env.SUPABASE_CORTEX_MEDICAL_URL,
      supabaseCortexMedical_KEY: process.env.SUPABASE_CORTEX_MEDICAL_KEY,
    },
  },

  app: {
    head: {
      title: 'Cortex404 — Learn · Build · Engineer',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Intelligent exam preparation for SSC, HSC, University Admission, BCS and beyond.',
        },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap',
        },
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.css' },
      ],
      script: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.2/cropper.min.js' }
      ],
    },
  },

  css: ['~/assets/css/global.css'],
})
