<script setup lang="ts">
// pages/omr/sheet.vue
//
// Student flow:
//  1. Arrives here with exam config in route query or from a parent page
//  2. Clicks "Generate My Sheet" → POST /api/omr/generate
//  3. PDF preview appears in an iframe (signed Supabase URL)
//  4. Download button saves the PDF
//  5. Instructions remind them to print at 100% scale and cut along the line

definePageMeta({ middleware: 'auth' })

const route  = useRoute()
const router = useRouter()

// ── State ──────────────────────────────────────────────────────────────────
const generating  = ref(false)
const error       = ref<string | null>(null)
const sheet       = ref<{
  sheet_code:  string
  signed_url:  string
  is_existing: boolean
  status:      string
} | null>(null)

// ── Exam config (passed from parent page via query or composable) ───────────
// Adjust these to match however your app passes exam context.
const examConfig = computed(() => ({
  exam_title:     route.query.title     as string ?? 'Offline Mock Test',
  stream:         route.query.stream    as string ?? 'HSC',
  subject:        JSON.parse(route.query.subject as string ?? '{"name":"Physics","code":"105"}'),
  chapter:        route.query.chapter   ? JSON.parse(route.query.chapter as string) : null,
  question_count: Number(route.query.count ?? 25),
}))

// ── Generate ───────────────────────────────────────────────────────────────
async function generate() {
  generating.value = true
  error.value      = null

  try {
    const res = await $fetch('/api/omr/generate', {
      method: 'POST',
      body:   examConfig.value,
    })
    sheet.value = res as any
  } catch (err: any) {
    error.value = err?.data?.message ?? err?.message ?? 'Something went wrong. Please try again.'
  } finally {
    generating.value = false
  }
}

// ── Download ───────────────────────────────────────────────────────────────
function downloadPdf() {
  if (!sheet.value?.signed_url) return
  const a   = document.createElement('a')
  a.href     = sheet.value.signed_url
  a.download = `${sheet.value.sheet_code}.pdf`
  a.click()
}

// ── Auto-generate if navigated here with config ────────────────────────────
onMounted(() => {
  if (route.query.auto === '1') generate()
})
</script>

<template>
  <div class="omr-sheet-page">

    <!-- ── Header ──────────────────────────────────────────────────────── -->
    <div class="page-header">
      <button class="btn-back" @click="router.back()">← Back</button>
      <div class="header-text">
        <h1>Your Answer Sheet</h1>
        <p class="subtitle">{{ examConfig.exam_title }}</p>
      </div>
    </div>

    <!-- ── Not yet generated ───────────────────────────────────────────── -->
    <template v-if="!sheet">
      <div class="generate-card">
        <div class="generate-icon">📄</div>
        <h2>Ready to generate your sheet?</h2>
        <p>
          A personalised MCQ answer sheet with
          <strong>{{ examConfig.question_count }} questions</strong>
          will be created just for you. Print it at home and fill it during your exam.
        </p>

        <div class="subject-badge">
          {{ examConfig.stream }} · {{ examConfig.subject.name }}
          <span v-if="examConfig.chapter"> · {{ examConfig.chapter.name }}</span>
        </div>

        <div v-if="error" class="error-box">
          ⚠️ {{ error }}
          <button @click="error = null">Dismiss</button>
        </div>

        <button
          class="btn-primary btn-large"
          :disabled="generating"
          @click="generate"
        >
          <span v-if="generating" class="spinner" />
          {{ generating ? 'Generating…' : 'Generate My Sheet' }}
        </button>
      </div>
    </template>

    <!-- ── Sheet ready ─────────────────────────────────────────────────── -->
    <template v-else>

      <!-- Existing sheet notice -->
      <div v-if="sheet.is_existing" class="notice-banner">
        📋 You already have an active sheet for this exam ({{ sheet.sheet_code }}).
        A fresh copy is shown below.
      </div>

      <!-- Print instructions -->
      <div class="instructions-bar">
        <div class="instruction-step">
          <span class="step-num">1</span>
          <span>Download &amp; print on <strong>A4 at 100% scale</strong> (not "fit to page")</span>
        </div>
        <div class="instruction-step">
          <span class="step-num">2</span>
          <span>Fill bubbles with a <strong>black/blue ballpoint pen</strong></span>
        </div>
        <div class="instruction-step">
          <span class="step-num">3</span>
          <span>Cut along the <strong>dotted line</strong>, keep questions — submit the top strip</span>
        </div>
        <div class="instruction-step">
          <span class="step-num">4</span>
          <span>Photograph the strip and <strong>upload for instant results</strong></span>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="action-bar">
        <button class="btn-primary" @click="downloadPdf">
          ⬇ Download PDF
        </button>
        <span class="sheet-code-label">
          Sheet code: <code>{{ sheet.sheet_code }}</code>
        </span>
        <NuxtLink
          :to="`/omr/scan?code=${sheet.sheet_code}`"
          class="btn-secondary"
        >
          📷 Upload filled sheet
        </NuxtLink>
      </div>

      <!-- PDF preview -->
      <div class="pdf-preview-wrap">
        <iframe
          :src="sheet.signed_url"
          class="pdf-preview"
          title="Answer Sheet Preview"
        />
        <p class="preview-hint">
          Can't see the preview?
          <a :href="sheet.signed_url" target="_blank">Open in new tab</a>
        </p>
      </div>

    </template>
  </div>
</template>

<style scoped>
.omr-sheet-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: system-ui, sans-serif;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}
.btn-back {
  background: none;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
  font-size: 0.9rem;
}
.header-text h1 { margin: 0; font-size: 1.4rem; }
.subtitle { margin: 0; color: #666; font-size: 0.9rem; }

/* Generate card */
.generate-card {
  text-align: center;
  padding: 3rem 2rem;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafafa;
}
.generate-icon { font-size: 3rem; margin-bottom: 1rem; }
.generate-card h2 { margin-bottom: 0.5rem; }
.generate-card p  { color: #555; max-width: 480px; margin: 0 auto 1.5rem; }

.subject-badge {
  display: inline-block;
  background: #f0f4ff;
  color: #3b49df;
  border-radius: 20px;
  padding: 0.3rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

/* Buttons */
.btn-primary {
  background: #1a1a2e;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.15s;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary:hover:not(:disabled) { opacity: 0.88; }
.btn-large { padding: 0.85rem 2.5rem; font-size: 1.05rem; }

.btn-secondary {
  background: white;
  border: 1px solid #1a1a2e;
  color: #1a1a2e;
  border-radius: 8px;
  padding: 0.65rem 1.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: background 0.15s;
}
.btn-secondary:hover { background: #f5f5f5; }

/* Error */
.error-box {
  background: #fff0f0;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
}
.error-box button {
  background: none;
  border: none;
  color: #b91c1c;
  cursor: pointer;
  text-decoration: underline;
  font-size: 0.85rem;
}

/* Notice banner */
.notice-banner {
  background: #fffbeb;
  border: 1px solid #fcd34d;
  color: #92400e;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

/* Instructions */
.instructions-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.instruction-step {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 0.83rem;
  color: #444;
}
.step-num {
  background: #1a1a2e;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

/* Action bar */
.action-bar {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.sheet-code-label {
  font-size: 0.85rem;
  color: #666;
}
.sheet-code-label code {
  background: #f0f0f0;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
}

/* PDF preview */
.pdf-preview-wrap {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}
.pdf-preview {
  width: 100%;
  height: 75vh;
  min-height: 500px;
  border: none;
  display: block;
}
.preview-hint {
  text-align: center;
  font-size: 0.8rem;
  color: #888;
  padding: 0.5rem;
  margin: 0;
  background: #f9f9f9;
}

/* Spinner */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
