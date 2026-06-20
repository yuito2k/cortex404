<script setup>
definePageMeta({ middleware: 'auth', layout: 'admin' })
// NOTE: In production, also add an admin-role guard here:
const user = useSupabaseUser();
const { data: profile, error } = await useSupabaseClient().from('profiles').select('role').eq('user_id', user.value?.id).single();

if (error) {
  console.error("Profile fetch failed:", error.message, error.details);
}

if (profile?.role !== 'admin') navigateTo('/dashboard')

import { ref, reactive, computed, watch, nextTick } from 'vue'
import { curriculum } from '~/utils/curriculum'
import { hashText } from '~/utils/hashQuestion'
import { renderLatexText } from '~/utils/renderLatex'

const supabaseProfile = useSupabaseClient()
const supabaseHSC = useSupabaseHSC()
const supabaseMedical = useSupabaseMedical()

let questionEN = ref('')
let questionBN = ref('')

let subjectEN = ref('')
let subjectBN = ref('')

let chapterEN = ref('')
let chapterBN = ref('')

let streamEN = ref('')
let sourceEN = ref('')
let sourceBN = ref('')

const textBookEN = ref('')   // this is your actual "selected value"
const searchQuery = ref('')  // this is what the user types
const showDropdown = ref(false)

const textBooks = [
  'Mathematics 1st Paper (Ketab Uddin Ahmed)',
  'Mathematics 2nd Paper (Ketab Uddin Ahmed)',
  'Mathematics 1st Paper (Ruponti Prokashoni)',
  'Mathematics 2nd Paper (Ruponti Prokashoni)',
  'Physics 1st Paper (Dr. Shahjahan Tapan)',
  'Physics 2nd Paper (Dr. Shahjahan Tapan)',
  'Physics 1st Paper (Prof. Md. Ishaq)',
  'Physics 2nd Paper (Prof. Md. Ishaq)',
  'Physics 1st Paper (Prof. Shamsuzzaman Selu)',
  'Physics 2nd Paper (Prof. Shamsuzzaman Selu)',
  'Chemistry 1st Paper (Hazari-Nag)',
  'Chemistry 2nd Paper (Hazari-Nag)',
  'Chemistry 1st Paper (Sanjit kumar Guha)',
  'Chemistry 2nd Paper (Sanjit kumar Guha)',
  'Botany (Dr. Md. Abul Hasan)',
  'Zoology (Gazi Azmal & Gazi Asmat)',
  'Botany (Dr. Md. Abdul Alim)',
  'Zoology (Dr. Md. Abdul Alim)',
  'Botany (Mazedam Begum & Rashida Begum)',
  'Zoology (Mazedam Begum & Rashida Begum)',
  'ICT (Mahabubur Rahman)',
  'ICT (Engr. Mujibur Rahman)',
]

const filteredBooks = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return textBooks
  return textBooks.filter(b => b.toLowerCase().includes(q))
})

function selectBook(s) {
  textBookEN.value = s
  searchQuery.value = s
  showDropdown.value = false
}

// small delay so the @mousedown on the <li> fires before blur closes the list
function closeDropdownDelayed() {
  setTimeout(() => { showDropdown.value = false }, 150)
}

// ─── Curriculum-driven subject / chapter computed ─────────────
const availableSubjects = computed(() =>
  streamEN.value ? (curriculum[streamEN.value] ?? []) : []
)
const availableChapters = computed(() =>
  availableSubjects.value.find(s => s.en === subjectEN.value)?.chapters ?? []
)

// ─── Subject / Chapter manual search (filterable by stream) ──
const subjectSearchQuery   = ref('')
const chapterSearchQuery   = ref('')
const subjectSearchQueryBN   = ref('')
const chapterSearchQueryBN   = ref('')
const showSubjectDropdownEN = ref(false)
const showSubjectDropdownBN = ref(false)
const showChapterDropdownEN = ref(false)
const showChapterDropdownBN = ref(false)

const filteredSubjectsList = computed(() => {
  const q = subjectSearchQuery.value.trim().toLowerCase()
  if (!q) return availableSubjects.value
  return availableSubjects.value.filter(s => s.en.toLowerCase().includes(q))
})

const filteredChaptersList = computed(() => {
  const q = chapterSearchQuery.value.trim().toLowerCase()
  if (!q) return availableChapters.value
  return availableChapters.value.filter(c => c.en.toLowerCase().includes(q))
})

const filteredSubjectsListBN = computed(() => {
  const q = subjectSearchQueryBN.value.trim().toLowerCase()
  if (!q) return availableSubjects.value
  return availableSubjects.value.filter(s => s.bn.toLowerCase().includes(q))
})

const filteredChaptersListBN = computed(() => {
  const q = chapterSearchQueryBN.value.trim().toLowerCase()
  if (!q) return availableChapters.value
  return availableChapters.value.filter(c => c.bn.toLowerCase().includes(q))
})

function selectSubject(s) {
  subjectEN.value = s.en
  subjectBN.value = s.bn
  subjectSearchQuery.value   = s.en
  subjectSearchQueryBN.value = s.bn
  showSubjectDropdownEN.value = false
  showSubjectDropdownBN.value = false
}

function selectChapter(c) {
  chapterEN.value = c.en
  chapterBN.value = c.bn
  chapterSearchQuery.value   = c.en
  chapterSearchQueryBN.value = c.bn
  showChapterDropdownEN.value = false
  showChapterDropdownBN.value = false
}

function closeSubjectDropdownDelayedEN() { setTimeout(() => { showSubjectDropdownEN.value = false }, 150) }
function closeSubjectDropdownDelayedBN() { setTimeout(() => { showSubjectDropdownBN.value = false }, 150) }
function closeChapterDropdownDelayedEN() { setTimeout(() => { showChapterDropdownEN.value = false }, 150) }
function closeChapterDropdownDelayedBN() { setTimeout(() => { showChapterDropdownBN.value = false }, 150) }

// Clear downstream selections when parent changes
//watch(subjectEN, () => { chapterEN.value = ''; chapterBN.value = '' })
//watch(streamEN,  () => { subjectEN.value = ''; subjectBN.value = ''; chapterEN.value = ''; chapterBN.value = '' })

watch(subjectEN, () => {
  chapterEN.value = ''; chapterBN.value = ''
  chapterSearchQuery.value = ''; chapterSearchQueryBN.value = ''
})
watch(streamEN, () => {
  subjectEN.value = ''; subjectBN.value = ''
  chapterEN.value = ''; chapterBN.value = ''
  subjectSearchQuery.value = ''; subjectSearchQueryBN.value = ''
  chapterSearchQuery.value = ''; chapterSearchQueryBN.value = ''
})

let yearEN = ref('')

let difficultyEN = ref('')

let optionsEN = ref([])
let optionsBN = ref([])

let answerEN = ref('')

let explanationEN = ref('')
let explanationBN = ref('')

let statusQuestion = ref('')

// ─── Question image (cropped from sheet) ──────────────────────
const questionImageUrl      = ref('')   // final public URL after upload
const questionImagePreview  = ref('')   // local blob URL for preview before upload
const questionImageUploading = ref(false)

// ─── Manual crop UI ───────────────────────────────────────────
const cropperOpen        = ref(false)
const cropperImgFile     = ref(null)   // the source image file for cropping
const cropperInstance    = ref(null)   // Cropper.js instance
const cropperForBulkIdx  = ref(null)   // null = single parser, number = bulk row index
const cropperForStimulus = ref(false)  // true = cropping stimulus, false = cropping question image

const cropperImgSrc = computed(() =>
  cropperImgFile.value ? URL.createObjectURL(cropperImgFile.value) : ''
)

function openCropper(imageFile, bulkIdx = null, forStimulus = false) {
  cropperImgFile.value     = imageFile
  cropperForBulkIdx.value  = bulkIdx
  cropperForStimulus.value = forStimulus
  cropperOpen.value        = true
  nextTick(() => {
    const el = document.getElementById('cropper-img')
    if (!el) return
    if (cropperInstance.value) cropperInstance.value.destroy()
    cropperInstance.value = new Cropper(el, {
      viewMode:      1,
      dragMode:      'move',
      autoCropArea:  0.5,
      movable:       true,
      zoomable:      true,
      scalable:      false,
      responsive:    true,
      background:    false,
    })
  })
}

function closeCropper() {
  if (cropperInstance.value) { cropperInstance.value.destroy(); cropperInstance.value = null }
  cropperOpen.value    = false
  cropperImgFile.value = null
}

async function confirmCrop() {
  if (!cropperInstance.value) return
  questionImageUploading.value = true

  try {
    const canvas = cropperInstance.value.getCroppedCanvas({ maxWidth: 1200, imageSmoothingQuality: 'high' })

    const stream  = streamEN.value
    const subject = (cropperForBulkIdx.value !== null ? bulkResults.value[cropperForBulkIdx.value]?.subjectEN : subjectEN.value) || 'unknown'
    const chapter = (cropperForBulkIdx.value !== null ? bulkResults.value[cropperForBulkIdx.value]?.chapterEN : chapterEN.value) || 'unknown'

    const blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92))
    const safeSub  = subject.replace(/[^a-zA-Z0-9]/g, '_')
    const safeCh   = chapter.replace(/[^a-zA-Z0-9]/g, '_')
    const path     = `${stream}/${safeSub}/${safeCh}/${Date.now()}.jpg`
    const supabase = stream.startsWith('HSC') ? supabaseHSC : supabaseMedical

    const { error } = await supabase.storage
      .from('question-images')
      .upload(path, blob, { contentType: 'image/jpeg', upsert: false })

    if (error) throw new Error(error.message)

    const { data } = supabase.storage.from('question-images').getPublicUrl(path)
    const url      = data.publicUrl
    const preview  = canvas.toDataURL('image/jpeg', 0.92)

    //if (cropperForBulkIdx.value !== null) {
    //  // Bulk — update that specific row
    //  bulkResults.value[cropperForBulkIdx.value].questionImageUrl     = url
    //  bulkResults.value[cropperForBulkIdx.value].questionImagePreview = preview
    //} else {
    //  // Single parser
    //  questionImageUrl.value     = url
    //  questionImagePreview.value = preview
    //}

    if (cropperForBulkIdx.value !== null) {
      if (cropperForStimulus.value) {
        // Get the stimulus text of the cropped row
        const stimulusText = bulkResults.value[cropperForBulkIdx.value]?.stimulusBN
      
        // Auto-fill ALL questions sharing the same stimulus
        bulkResults.value.forEach(q => {
          if (q.stimulusBN && q.stimulusBN === stimulusText) {
            q.stimulusImageUrl     = url
            q.stimulusImagePreview = preview
          }
        })
      } else {
        bulkResults.value[cropperForBulkIdx.value].questionImageUrl     = url
        bulkResults.value[cropperForBulkIdx.value].questionImagePreview = preview
      }
    } else {
      questionImageUrl.value     = url
      questionImagePreview.value = preview
    }

    showToast('Image cropped & uploaded ✓')
    closeCropper()
  } catch (e) {
    console.error(e)
    showToast('Crop upload failed.', 'error')
  } finally {
    questionImageUploading.value = false
  }
}

async function cropAndUpload(imageFile, crop, stream, subject, chapter) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = async () => {
      try {
        const canvas  = document.createElement('canvas')
        const padding = 12
        const x = Math.max(0, crop.xPct * img.naturalWidth  - padding)
        const y = Math.max(0, crop.yPct * img.naturalHeight - padding)
        const w = Math.min(img.naturalWidth  - x, crop.wPct * img.naturalWidth  + padding * 2)
        const h = Math.min(img.naturalHeight - y, crop.hPct * img.naturalHeight + padding * 2)
        canvas.width  = w
        canvas.height = h
        canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h)

        // Show local preview immediately
        questionImagePreview.value = canvas.toDataURL('image/jpeg', 0.92)

        canvas.toBlob(async (blob) => {
          if (!blob) return reject(new Error('Canvas crop failed'))
          const supabase  = stream.startsWith('HSC') ? supabaseHSC : supabaseMedical
          const timestamp = Date.now()
          const safeSub   = subject.replace(/[^a-zA-Z0-9]/g, '_')
          const safeCh    = chapter.replace(/[^a-zA-Z0-9]/g, '_')
          const path      = `${stream}/${safeSub}/${safeCh}/${timestamp}.jpg`

          const { error: upErr } = await supabase.storage
            .from('question-images')
            .upload(path, blob, { contentType: 'image/jpeg', upsert: false })

          if (upErr) return reject(new Error(upErr.message))

          const { data } = supabase.storage.from('question-images').getPublicUrl(path)
          resolve(data.publicUrl)
        }, 'image/jpeg', 0.92)
      } catch (e) { reject(e) }
    }
    img.onerror = () => reject(new Error('Failed to load image for cropping'))
    img.src = URL.createObjectURL(imageFile)
  })
}

function onQuestionImageReupload(e) {
  const f = e.target.files?.[0]
  if (!f) return
  questionImagePreview.value = URL.createObjectURL(f)
  // Upload the manually selected file directly (no crop needed)
  questionImageUploading.value = true
  const supabase  = streamEN.value.startsWith('HSC') ? supabaseHSC : supabaseMedical
  const timestamp = Date.now()
  const safeSub   = subjectEN.value.replace(/[^a-zA-Z0-9]/g, '_')
  const safeCh    = chapterEN.value.replace(/[^a-zA-Z0-9]/g, '_')
  const path      = `${streamEN.value}/${safeSub}/${safeCh}/${timestamp}.jpg`
  supabase.storage.from('question-images').upload(path, f, { contentType: f.type, upsert: false })
    .then(({ error }) => {
      if (error) { showToast('Image upload failed.', 'error'); return }
      const { data } = supabase.storage.from('question-images').getPublicUrl(path)
      questionImageUrl.value = data.publicUrl
      showToast('Question image updated ✓')
    })
    .finally(() => { questionImageUploading.value = false })
}

// ─── Image extraction ─────────────────────────────────────────
const imgFile        = ref(null)
const imgPreview     = ref('')
const imgExtracting  = ref(false)
const imgError       = ref('')
const imgPanelOpen   = ref(false)
const singleIsDuplicate   = ref(false)
const singleLowConfidence = ref(false)

function onImgFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return
  imgFile.value    = f
  imgPreview.value = URL.createObjectURL(f)
  imgError.value   = ''
}

async function extractFromImage() {
  if (!imgFile.value || !streamEN.value) return
  imgExtracting.value = true
  imgError.value = ''

  try {
    // Single call — image + stream go to analyze-question, Gemini does everything
    const formData = new FormData()
    formData.append('image', imgFile.value)
    formData.append('stream', streamEN.value)

    const raw = await $fetch('/api/analyze-question', { method: 'POST', body: formData })
    const parsed = JSON.parse(raw.result)

    // Fill question + options + answer + explanation
    questionBN.value    = parsed.questionBN    || ''
    questionEN.value    = parsed.questionEN    || ''
    optionsBN.value     = parsed.optionsBN     || ['', '', '', '']
    optionsEN.value     = parsed.optionsEN     || ['', '', '', '']
    answerEN.value      = parsed.answerEN      || 'A'
    explanationBN.value = parsed.explanationBN || ''
    explanationEN.value = parsed.explanationEN || ''
    statusQuestion.value = 'Published'

    // Fill metadata
    yearEN.value       = parsed.year       || ''
    difficultyEN.value = parsed.difficulty || ''
    if (parsed.sourceEN) sourceEN.value = parsed.sourceEN
    if (parsed.sourceBN) sourceBN.value = parsed.sourceBN

    // Subject first — triggers availableChapters to recompute
    subjectEN.value = parsed.subjectEN || ''
    subjectBN.value = parsed.subjectBN || ''

    // Wait one tick so availableChapters updates before setting chapter
    await nextTick()
    chapterEN.value = parsed.chapterEN || ''
    chapterBN.value = parsed.chapterBN || ''

    imgPanelOpen.value = false

    // Crop question image if Gemini detected one
    //if (parsed.hasQuestionImage && parsed.questionImageCrop && imgFile.value) {
    //  questionImageUploading.value = true
    //  try {
    //    questionImageUrl.value = await cropAndUpload(
    //      imgFile.value,
    //      parsed.questionImageCrop,
    //      streamEN.value,
    //      parsed.subjectEN || subjectEN.value,
    //      parsed.chapterEN || chapterEN.value
    //    )
    //  } catch (e) {
    //    console.error('Crop/upload failed:', e)
    //    showToast('Image crop failed — you can upload manually.', 'error')
    //  } finally {
    //    questionImageUploading.value = false
    //  }
    //}

    // Open manual crop UI if Gemini detected an image
    if (parsed.hasQuestionImage && imgFile.value) {
      openCropper(imgFile.value, null)
    }

    // Duplicate + confidence check
    //const isDup = (await checkDuplicates([parsed])).has(parsed.questionBN)
    //if (isDup) showToast('⚠ Possible duplicate detected in DB', 'warning')
    //if (parsed.lowConfidence) showToast('⚠ Low confidence — review fields carefully', 'warning')
    singleLowConfidence.value = parsed.lowConfidence ?? false
    singleIsDuplicate.value   = (await checkDuplicates([parsed])).has(parsed.questionBN)
    if (singleIsDuplicate.value)   showToast('⚠ Possible duplicate detected in DB', 'warning')
    if (singleLowConfidence.value) showToast('⚠ Low confidence — review fields carefully', 'warning')
    showToast('Fields auto-filled from image ✓')

  } catch (err) {
    console.error(err)
    imgError.value = err.message || 'Extraction failed. Check console.'
  } finally {
    imgExtracting.value = false
  }
}

// ─── Add Question modal tab ───────────────────────────────────
const addQuestionTab = ref('single') // 'single' | 'bulk'

// ─── Bulk import ──────────────────────────────────────────────
const bulkImgFile        = ref(null)
const bulkImgPreview     = ref('')
const bulkParsing        = ref(false)
const bulkError          = ref('')
const bulkResults        = ref([])      // array of parsed question objects
const bulkSelected       = ref([])      // parallel boolean array for checkboxes
const bulkExpanded       = ref([])      // parallel boolean array for row expand
const bulkRedDotDetected = ref(false)
const bulkTotalFound     = ref(0)
const bulkSaving         = ref(false)

function onBulkFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return
  bulkImgFile.value    = f
  bulkImgPreview.value = URL.createObjectURL(f)
  bulkError.value      = ''
  bulkResults.value    = []
  bulkSelected.value   = []
  bulkExpanded.value   = []
}

function resetBulk() {
  bulkImgFile.value        = null
  bulkImgPreview.value     = ''
  bulkError.value          = ''
  bulkResults.value        = []
  bulkSelected.value       = []
  bulkExpanded.value       = []
  bulkRedDotDetected.value = false
  bulkTotalFound.value     = 0
  //streamEN.value = ''
}

//async function checkDuplicates(questions) {
//  const supabase = streamEN.value === 'HSC' ? supabaseHSC : supabaseMedical
//  // const texts = questions.map(q => q.questionEN).filter(Boolean)
//  const texts = questions.map(q => q.questionBN).filter(Boolean)
//  if (!texts.length) return new Set()
//
//  const { data } = await supabase
//    .from('questions')
//    .select('question')
//    .in('question->>bangla', texts) //.in('question->>english', texts)
//
//
//  //const foundTexts = new Set((data || []).map(row => row.question?.english))
//  const foundTexts = new Set((data || []).map(row => row.question?.bangla))
//  return foundTexts
//}

async function checkDuplicates(questions) {
  const raw = await $fetch('/api/check-duplicates', {
    method: 'POST',
    body: { questions, stream: streamEN.value}
  })

  return new Set(
    raw.results
      .filter(r => r.isDuplicate)
      .map(r => r.questionBN)
  )
}

const bulkSelectedCount = computed(() => bulkSelected.value.filter(Boolean).length)

function toggleBulkAll(val) {
  bulkSelected.value = bulkSelected.value.map(() => val)
}

async function parseBulk() {
  if (!bulkImgFile.value || !streamEN.value) return
  bulkParsing.value = true
  bulkError.value   = ''
  bulkResults.value = []

  try {
    const formData = new FormData()
    formData.append('image', bulkImgFile.value)
    formData.append('stream', streamEN.value)

    const raw = await $fetch('/api/analyze-question-bulk', { method: 'POST', body: formData })
    const parsed = JSON.parse(raw.result)

    bulkRedDotDetected.value = parsed.redDotDetected ?? false
    bulkTotalFound.value     = parsed.totalFound     ?? parsed.questions?.length ?? 0

    const questions          = parsed.questions ?? []
    const duplicates         = await checkDuplicates(questions)
    bulkResults.value        = questions.map(q => ({
      ...q,
      isDuplicate: duplicates.has(q.questionBN),
      questionImageUrl:     null,
      questionImagePreview: null,
      stimulusImageUrl:     null,      // add this
      stimulusImagePreview: null,      // add this
    }))
    bulkSelected.value = bulkResults.value.map(q => !q.isDuplicate)
    bulkExpanded.value = bulkResults.value.map(() => false)

    // Crop question images for any question that has one
    //const cropsNeeded = bulkResults.value.filter(q => q.hasQuestionImage && q.questionImageCrop)
    //for (const q of cropsNeeded) {
    //  try {
    //    q.questionImageUrl = await cropAndUpload(
    //      bulkImgFile.value,
    //      q.questionImageCrop,
    //      streamEN.value,
    //      q.subjectEN,
    //      q.chapterEN
    //    )
    //    // local preview
    //    const img = new Image()
    //    img.src = URL.createObjectURL(bulkImgFile.value)
    //    await new Promise(r => { img.onload = r })
    //    const canvas = document.createElement('canvas')
    //    const p = 8
    //    const x = Math.max(0, q.questionImageCrop.xPct * img.naturalWidth  - p)
    //    const y = Math.max(0, q.questionImageCrop.yPct * img.naturalHeight - p)
    //    const w = Math.min(img.naturalWidth  - x, q.questionImageCrop.wPct * img.naturalWidth  + p * 2)
    //    const h = Math.min(img.naturalHeight - y, q.questionImageCrop.hPct * img.naturalHeight + p * 2)
    //    canvas.width = w; canvas.height = h
    //    canvas.getContext('2d').drawImage(img, x, y, w, h, 0, 0, w, h)
    //    q.questionImagePreview = canvas.toDataURL('image/jpeg', 0.92)
    //  } catch (e) {
    //    console.error('Bulk crop failed for question:', e)
    //  }
    //}

  } catch (err) {
    console.error(err)
    bulkError.value = err.message || 'Bulk parse failed. Check console.'
  } finally {
    bulkParsing.value = false
  }
}

async function saveBulk() {
  const toSave = bulkResults.value.filter((_, i) => bulkSelected.value[i])
  if (!toSave.length) return
  bulkSaving.value = true

  const answerIndexMap    = { A: 0, B: 1, C: 2, D: 3 }
  const difficultyBanglaMap = { Easy: 'সহজ', Medium: 'মাধ্যম', Hard: 'কঠিন' }

  const payloads = await Promise.all(toSave.map(async q => ({
    exam: streamEN.value,
    text_book: textBookEN.value,
    question:    { english: q.questionEN || null, bangla: q.questionBN || null },
    question_hash: await hashText(q.questionBN || null),
    options:     { english: q.optionsEN || null,  bangla: q.optionsBN  || [] },
    explanation: (q.explanationEN || q.explanationBN)
      ? { english: q.explanationEN || null, bangla: q.explanationBN || null }
      : null,
    subject:     { english: subjectSearchQuery.value ? subjectSearchQuery.value : q.subjectEN || null,   bangla: subjectSearchQueryBN.value ? subjectSearchQueryBN.value : q.subjectBN || null },
    chapter:     { english: chapterSearchQuery.value ? chapterSearchQuery.value : q.chapterEN || null,   bangla: chapterSearchQueryBN.value ? chapterSearchQueryBN.value : q.chapterBN || null },
    difficulty:  { english: q.difficulty || null,  bangla: difficultyBanglaMap[q.difficulty] || null },
    years: q.years?.length
      ? q.years.map(y => ({ english: y, bangla: toBengaliDigits(y) }))
      : null,
    source:      { english: q.sourceEN || null,    bangla: q.sourceBN || null },
    correct_index:    answerIndexMap[q.answerEN] ?? 0,
    is_verified: true,
    difficulty_level: q.difficulty?.toLowerCase() || 'medium',
    status: 'published',
    question_image: q.questionImageUrl || null,
    stimulus: (q.stimulusBN || q.stimulusEN)
      ? { bangla: q.stimulusBN || null, english: q.stimulusEN || null }
      : null,
    stimulus_hash: q.stimulusBN
      ? await hashText(q.stimulusBN)
      : null,
    stimulus_image: q.stimulusImageUrl || null,
  })))

  try {
    const supabase = streamEN.value.startsWith('HSC') ? supabaseHSC : supabaseMedical
    const { error } = await supabase.from('questions').insert(payloads)
    if (error) throw new Error(error.message)
    showToast(`${payloads.length} question${payloads.length > 1 ? 's' : ''} saved ✓`)
    resetBulk()
    closeModal()
  } catch (err) {
    console.error(err)
    bulkError.value = err.message || 'Save failed. Check console.'
  } finally {
    bulkSaving.value = false
  }
}

// ─── Sidebar & layout ────────────────────────────────────────
const sidebarCollapsed = ref(
  typeof window !== 'undefined' && window.innerWidth <= 1024
)
const mobileDrawerOpen  = ref(false)
const activeTab = ref('overview')

function handleTabChange(tab) {
  activeTab.value = tab
  mobileDrawerOpen.value = false   // close drawer on mobile after nav
}

// ─── Toast ────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', type: 'success' })
function showToast(msg, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3500)
}

// ─── Modals ───────────────────────────────────────────────────
const modal = reactive({ show: false, type: null, data: null })
function openModal(type, data = null) { modal.show = true; modal.type = type; modal.data = data }
function closeModal() { modal.show = false; modal.type = null; modal.data = null }

// Handle quick actions from topbar or AdminQuickActions
function handleAction(type) {
  if (type === 'addQuestion')       { activeTab.value = 'questions'; openModal('addQuestion') }
  else if (type === 'announcement') { activeTab.value = 'content';   openModal('announcement') }
  else if (type === 'purgecache')   { logAction('system', 'CDN cache purge triggered', 'Admin'); showToast('Cache purge initiated.') }
  else if (type === 'recalcleaderboard') { logAction('system', 'Leaderboard recalc triggered', 'Admin'); showToast('Leaderboard recalculation started.') }
  else if (type === 'viewusers')    { activeTab.value = 'users' }
  else if (type === 'viewsystem')   { activeTab.value = 'system' }
}

// ─── Audit log (shared across tabs) ──────────────────────────
const auditLog = ref([
  { id: 1, type: 'ban',      title: 'Banned user: Rafiq Islam',        actor: 'Admin', time: '5m ago' },
  { id: 2, type: 'publish',  title: 'Published question #4 (flagged)', actor: 'Admin', time: '12m ago' },
  { id: 3, type: 'announce', title: 'SSC 2025 Pack announcement live', actor: 'Admin', time: '34m ago' },
  { id: 4, type: 'delete',   title: 'Deleted question #7',             actor: 'Admin', time: '1h ago' },
  { id: 5, type: 'promote',  title: 'Promoted Touhid Bhuiyan → Admin',actor: 'Admin', time: '2h ago' },
  { id: 6, type: 'system',   title: 'Leaderboard recalculated',        actor: 'System', time: '4h ago' },
])

function logAction(type, title, actor = 'Admin') {
  auditLog.value.unshift({ id: Date.now(), type, title, actor, time: 'just now' })
}

// ─── System health data ───────────────────────────────────────
const systemServices = ref([
  { name: 'Supabase DB',    status: 'healthy', ping: '12ms' },
  { name: 'Auth Service',   status: 'healthy', ping: '8ms'  },
  { name: 'CDN / Edge',     status: 'healthy', ping: '4ms'  },
  { name: 'Storage',        status: 'warn',    ping: '41ms' },
  { name: 'Email (Resend)', status: 'healthy', ping: '29ms' },
])
const systemLogs = ref([
  { time: '05:14:02', level: 'INFO',  msg: 'Supabase connection healthy' },
  { time: '05:12:44', level: 'WARN',  msg: 'Question bank cache miss rate 18%' },
  { time: '05:10:11', level: 'INFO',  msg: 'Leaderboard recalculated successfully' },
  { time: '04:55:33', level: 'ERROR', msg: 'Edge function account-deletion timeout (uid: a8f2…)' },
  { time: '04:48:00', level: 'INFO',  msg: 'Daily streak cron — 14,203 rows updated' },
])
const systemStatus = computed(() => {
  if (systemServices.value.some(s => s.status === 'error')) return 'error'
  if (systemServices.value.some(s => s.status === 'warn'))  return 'warn'
  return 'ok'
})

// ─── Overview stats ───────────────────────────────────────────
const overviewStats = [
  {
    label: 'Total Users', value: '14,820', delta: '+312 today', up: true, percent: 74,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    label: 'Questions', value: '8,441', delta: '+96 this week', up: true, percent: 84,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  },
  {
    label: 'Exams Today', value: '1,203', delta: '+18% vs yesterday', up: true, percent: 60,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  },
  {
    label: 'Active Sessions', value: '342', delta: '12 less than 1h ago', up: false, percent: 34,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  },
]

const weeklyActivity = [42,67,55,80,93,71,88,60,74,91,65,83,77,95]

// ─── Users tab ────────────────────────────────────────────────
const userSearch = ref('')
const userFilter = ref('all')
const userSort   = ref('joined')
const userPage   = ref(1)
const usersPerPage = 10

const users = ref([
  { id:1,  name:'Tanvir Ahmed',    email:'tanvir@gmail.com',   stream:'HSC Science',     exams:34,  score:82, joined:'2024-11-01', status:'active',     role:'user'  },
  { id:2,  name:'Farida Khanam',   email:'farida@yahoo.com',   stream:'Medical', exams:61,  score:91, joined:'2024-10-14', status:'active',     role:'user'  },
  { id:3,  name:'Rafiq Islam',     email:'rafiq@gmail.com',    stream:'BUET',    exams:27,  score:74, joined:'2025-01-03', status:'banned',     role:'user'  },
  { id:4,  name:'Maliha Sultana',  email:'maliha@hotmail.com', stream:'BCS',     exams:88,  score:88, joined:'2024-09-22', status:'active',     role:'user'  },
  { id:5,  name:'Jahid Hasan',     email:'jahid@gmail.com',    stream:'SSC',     exams:12,  score:67, joined:'2025-02-11', status:'unverified', role:'user'  },
  { id:6,  name:'Nusrat Jahan',    email:'nusrat@gmail.com',   stream:'HSC Science',     exams:45,  score:79, joined:'2024-12-05', status:'active',     role:'user'  },
  { id:7,  name:'Sabbir Rahman',   email:'sabbir@gmail.com',   stream:'DU',      exams:19,  score:71, joined:'2025-01-19', status:'active',     role:'user'  },
  { id:8,  name:'Priya Roy',       email:'priya@gmail.com',    stream:'Medical', exams:53,  score:86, joined:'2024-08-30', status:'active',     role:'user'  },
  { id:9,  name:'Kamrul Islam',    email:'kamrul@gmail.com',   stream:'Bank',    exams:31,  score:73, joined:'2025-03-01', status:'active',     role:'user'  },
  { id:10, name:'Sadia Akter',     email:'sadia@gmail.com',    stream:'BCS',     exams:72,  score:84, joined:'2024-11-17', status:'active',     role:'user'  },
  { id:11, name:'Alamin Hossain',  email:'alamin@gmail.com',   stream:'BUET',    exams:9,   score:60, joined:'2025-04-02', status:'unverified', role:'user'  },
  { id:12, name:'Rima Begum',      email:'rima@gmail.com',     stream:'HSC Science',     exams:40,  score:77, joined:'2024-12-22', status:'active',     role:'user'  },
  { id:13, name:'Nasrin Khatun',   email:'nasrin@gmail.com',   stream:'SSC',     exams:5,   score:55, joined:'2025-04-15', status:'banned',     role:'user'  },
  { id:14, name:'Touhid Bhuiyan',  email:'touhid@gmail.com',   stream:'DU',      exams:66,  score:90, joined:'2024-07-09', status:'active',     role:'user'  },
  { id:15, name:'Admin User',      email:'admin@cortex404.com',stream:'—',       exams:0,   score:0,  joined:'2024-06-01', status:'active',     role:'admin' },
])

const filteredUsers = computed(() => {
  let list = users.value
  if (userSearch.value) {
    const q = userSearch.value.toLowerCase()
    list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
  }
  if (userFilter.value !== 'all') list = list.filter(u => u.status === userFilter.value)
  if (userSort.value === 'joined') list = [...list].sort((a,b) => b.joined.localeCompare(a.joined))
  if (userSort.value === 'score')  list = [...list].sort((a,b) => b.score - a.score)
  if (userSort.value === 'exams')  list = [...list].sort((a,b) => b.exams - a.exams)
  return list
})
const paginatedUsers = computed(() => {
  const start = (userPage.value - 1) * usersPerPage
  return filteredUsers.value.slice(start, start + usersPerPage)
})
const totalUserPages = computed(() => Math.ceil(filteredUsers.value.length / usersPerPage))

function banUser(u) {
  const wasBanned = u.status === 'banned'
  u.status = wasBanned ? 'active' : 'banned'
  logAction('ban', `${wasBanned ? 'Unbanned' : 'Banned'} user: ${u.name}`)
  showToast(wasBanned ? `${u.name} unbanned.` : `${u.name} banned.`, wasBanned ? 'success' : 'error')
}
function promoteUser(u) {
  u.role = u.role === 'admin' ? 'user' : 'admin'
  logAction('promote', `${u.role === 'admin' ? 'Promoted' : 'Demoted'} ${u.name}`)
  showToast(`${u.name} is now ${u.role}.`)
}

// ─── Review Queue tab ────────────────────────────────────────────
const queueFilter = ref('all')
const queueStream = ref('All')
const queueSearch = ref('')

function toggleQueueExpand(q) { q.expanded = !q.expanded }

//const reviewQueue = ref([
//  { id:101, text:'What is the Krebs cycle?',                    stream:'Medical', subject:'Biology',   diff:'Medium', submittedBy:'Moderator A', status:'pending',  date:'2025-05-09' },
//  { id:102, text:'Solve for x: 3x² + 5x - 2 = 0',             stream:'BUET',    subject:'Math',      diff:'Hard',   submittedBy:'Moderator B', status:'pending',  date:'2025-05-09' },
//  { id:103, text:'Who was the first President of Bangladesh?',  stream:'BCS',     subject:'History',   diff:'Easy',   submittedBy:'Moderator A', status:'pending',  date:'2025-05-08' },
//  { id:104, text:'What does RAM stand for?',                    stream:'SSC',     subject:'ICT',       diff:'Easy',   submittedBy:'Moderator C', status:'approved', date:'2025-05-08' },
//  { id:105, text:"Define Newton's third law",                   stream:'HSC',     subject:'Physics',   diff:'Medium', submittedBy:'Moderator B', status:'pending',  date:'2025-05-07' },
//  { id:106, text:'What is the capital of France?',             stream:'BCS',     subject:'GK',        diff:'Easy',   submittedBy:'Moderator A', status:'rejected', date:'2025-05-07', note:'Too generic' },
//  { id:107, text:'Find derivative of sin²(x)',                 stream:'DU',      subject:'Math',      diff:'Medium', submittedBy:'Moderator C', status:'pending',  date:'2025-05-06' },
//  { id:108, text:'What is the atomic number of gold?',         stream:'HSC',     subject:'Chemistry', diff:'Easy',   submittedBy:'Moderator A', status:'pending',  date:'2025-05-05' },
//  { id:109, text:'Binary search time complexity?',             stream:'BUET',    subject:'CS',        diff:'Medium', submittedBy:'Moderator B', status:'approved', date:'2025-05-05' },
//  { id:110, text:'What is photosynthesis?',                    stream:'SSC',     subject:'Biology',   diff:'Easy',   submittedBy:'Moderator C', status:'pending',  date:'2025-05-04' },
//])

const reviewQueue    = ref([])
const queueLoading   = ref(false)

async function loadReviewQueue() {
  queueLoading.value = true
  const [hscRes, medRes] = await Promise.all([
    supabaseHSC.from('question_submissions').select('*').order('created_at', { ascending: false }),
    supabaseMedical.from('question_submissions').select('*').order('created_at', { ascending: false }),
  ])
  const rows = [...(hscRes.data ?? []), ...(medRes.data ?? [])]

  // Collect unique submitter UUIDs and fetch their profiles in one query
  const submitterIds = [...new Set(rows.map(r => r.submitted_by).filter(Boolean))]
  let profileMap = {}
  if (submitterIds.length) {
    // profiles lives in one DB (use either client — it's a shared auth table)
    const { data: profiles } = await supabaseProfile
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .in('user_id', submitterIds)
    ;(profiles ?? []).forEach(p => { profileMap[p.user_id] = p })
  }

  reviewQueue.value = rows.map(r => ({
    ...r,
    id:          r.id,
    text:        r.question?.english || '',
    text_bn:     r.question?.bangla || '',
    stream:      r.stream,
    subj:        r.subject?.english  || r.subject?.bangla || '',
    diff:        r.difficulty?.english || r.difficulty_level || '',
    submittedBy: profileMap[r.submitted_by]?.full_name  ?? r.submitted_by ?? 'Unknown',
    submitterAvatar:   profileMap[r.submitted_by]?.avatar_url ?? null,
    note:        r.admin_note  ?? '',
    status:      r.status,
    date:        r.created_at?.slice(0, 10) ?? '',
    expanded:    false,   // for the expand feature below
  }))
  queueLoading.value = false
}

loadReviewQueue()

const filteredReviewQueue = computed(() => {
  let list = reviewQueue.value
  if (queueFilter.value !== 'all') list = list.filter(q => q.status === queueFilter.value)
  if (queueStream.value !== 'All') list = list.filter(q => q.stream === queueStream.value)
  if (queueSearch.value) { const s = queueSearch.value.toLowerCase(); list = list.filter(q => q.text.toLowerCase().includes(s)) }
  return list
})

async function adminApproveQ(q) {
  const supabase = q.stream.startsWith('HSC') ? supabaseHSC : supabaseMedical

  // 1. Check for existing question with same hash
  const { data: existing } = await supabase
    .from('questions')
    .select('id')
    .eq('question_hash', q.question_hash)
    .maybeSingle()

  if (!existing) {
    // 2. Insert into questions table only if not duplicate
    const { error: insertError } = await supabase
      .from('questions')
      .insert({
        exam:             q.stream,
        text_book:        q.text_book,
        question:         q.question,
        question_hash:    q.question_hash,
        options:          q.options,
        explanation:      q.explanation,
        subject:          q.subject,
        chapter:          q.chapter,
        difficulty:       q.difficulty,
        difficulty_level: q.difficulty_level,
        years:            q.years,
        source:           q.source,
        stimulus:         q.stimulus,
        stimulus_hash:    q.stimulus_hash,
        correct_index:    q.correct_index,
        question_image:   q.question_image  ?? null,
        stimulus_image:   q.stimulus_image  ?? null,
        is_verified:      true,
        status:           'published',
      })

    if (insertError) { showToast(insertError.message, 'error'); return }
  } else {
    showToast('Already exists in questions table — marking approved only.', 'warning')
  }

  // 3. Mark submission as approved regardless
  const { error: updateError } = await supabase
    .from('question_submissions')
    .update({ status: 'approved' })
    .eq('id', q.id)

  if (updateError) { showToast(updateError.message, 'error'); return }

  q.status = 'approved'
  showToast('Question approved and published ✓')
}

const rejectNote = ref('')

async function adminRejectQ(q) {
  const supabase = q.stream.startsWith('HSC') ? supabaseHSC : supabaseMedical
  const { error } = await supabase
    .from('question_submissions')
    .update({ status: 'rejected', admin_note: rejectNote.value || null })
    .eq('id', q.id)
  if (error) { showToast(error.message, 'error'); return }
  q.status = 'rejected'
  q.admin_note = rejectNote.value || null
  showToast('Question rejected.', 'error')
}

//function adminApproveQ(q) {
//  q.status = 'approved'
//  showToast('Question approved and published.')
//}
//function adminRejectQ(q) {
//  q.status = 'rejected'
//  showToast('Question rejected.', 'error')
//}

// ─── Questions tab ────────────────────────────────────────────
const qSearch = ref('')
const qStream = ref('All')
const qDiff   = ref('All')
const qStatus = ref('All')
const streams     = ['All','SSC','HSC Science','HSC Arts','HSC Commerce','BUET','Medical','DU','BCS','Bank']
const difficulties = ['All','Easy','Medium','Hard']
const qStatuses   = ['All','Published','Draft','Flagged']

function toBengaliDigits(str) {
  return str.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d])
}

function resetQuestionForm() {
  questionEN.value = '';    questionBN.value = ''
  subjectEN.value = '';     subjectBN.value = ''
  chapterEN.value = '';     chapterBN.value = ''
  yearEN.value = '';        sourceEN.value = ''
  difficultyEN.value = '';  streamEN.value = ''
  optionsEN.value = [];     optionsBN.value = []
  answerEN.value = '';      statusQuestion.value = ''
  explanationEN.value = ''; explanationBN.value = ''
  // Image extractor
  imgFile.value = null;     imgPreview.value = ''
  imgError.value = '';      imgPanelOpen.value = false
  sourceEN.value = '';      sourceBN.value = ''
  questionImageUrl.value     = ''
  questionImagePreview.value = ''
  singleIsDuplicate.value   = false
  singleLowConfidence.value = false
}

async function saveQuestion() {
  // Map answer letter to index
  const answerIndexMap = { A: 0, B: 1, C: 2, D: 3 }
  const difficultyBanglaMap = {
    Easy: 'সহজ',
    Medium: 'মাধ্যম',
    Hard: 'কঠিন',
  }
  const correctIndex = answerIndexMap[answerEN.value]

  // Build the row matching your schema
  const payload = {
    exam: streamEN.value,
    //text_book: textBookEN.value || null,

    question: {
      english: questionEN.value,
      bangla: questionBN.value || null,
    },

    question_hash: await hashText(questionBN.value),

    options: {
      english: optionsEN.value,        // already an array ["A text","B text","C text","D text"]
      bangla: optionsBN.value || [],
    },

    explanation: explanationEN.value || explanationBN.value
      ? { english: explanationEN.value || null, bangla: explanationBN.value || null }
      : null,

    subject: {
      english: subjectEN.value,
      bangla: subjectBN.value || null,
    },

    chapter: {
      english: chapterEN.value,
      bangla: chapterBN.value || null,
    },

    difficulty: {
      english: difficultyEN.value,
      bangla: difficultyBanglaMap[difficultyEN.value] || null,
    },

    source: {
      english: sourceEN.value || null,
      bangla: sourceBN.value || null,
    },

    years: yearEN.value
      ? [{ english: yearEN.value, bangla: toBengaliDigits(yearEN.value) }]
      : null, // TODO: seems a little wrong here (maybe)

    is_verified: true,

    correct_index: correctIndex,
    difficulty_level: difficultyEN.value?.toLowerCase() || 'medium',  // scalar col too
    status: statusQuestion.value?.toLowerCase() || 'published',
    question_image: questionImageUrl.value || null,
  }

  // Edit vs Add
  if (modal.type === 'editQuestion' && modal.data?.id) {
    const supabase = streamEN.value.startsWith('HSC') ? supabaseHSC : supabaseMedical

    const { error } = await supabase
      .from('questions')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', modal.data.id)

    if (error) {
      console.error(error)
      showToast('Failed to update question.')
      return
    }
    showToast('Question updated.')

  } else {
    const supabase = streamEN.value.startsWith('HSC') ? supabaseHSC : supabaseMedical

    const { error } = await supabase
      .from('questions')
      .insert(payload)

    if (error) {
      console.error(error)
      showToast('Failed to save question.')
      return
    }
    showToast('Question saved.')
  }
}

const questions = ref([
  { id:1,  text:'What is the SI unit of electric charge?',           stream:'HSC Science',    subject:'Physics',  diff:'Easy',   status:'Published', reports:0 },
  { id:2,  text:'Solve: lim(x→0) sin(x)/x',                        stream:'BUET',   subject:'Math',     diff:'Medium', status:'Published', reports:1 },
  { id:3,  text:'Which organelle is called the powerhouse of the cell?', stream:'Medical',subject:'Biology',diff:'Easy',status:'Published', reports:0 },
  { id:4,  text:'The Treaty of Westphalia was signed in which year?',stream:'BCS',    subject:'History',  diff:'Medium', status:'Draft',     reports:0 },
  { id:5,  text:'What is the valency of carbon?',                   stream:'SSC',    subject:'Chemistry',diff:'Easy',   status:'Published', reports:0 },
  { id:6,  text:'Binary representation of decimal 255 is?',         stream:'BUET',   subject:'CS',       diff:'Easy',   status:'Published', reports:0 },
  { id:7,  text:'Who wrote "Amar Sonar Bangla"?',                   stream:'BCS',    subject:'Bangla',   diff:'Easy',   status:'Flagged',   reports:3 },
  { id:8,  text:"What is Avogadro's number?",                       stream:'HSC Science',    subject:'Chemistry',diff:'Medium', status:'Published', reports:0 },
  { id:9,  text:'Find the derivative of e^(2x)',                    stream:'DU',     subject:'Math',     diff:'Medium', status:'Published', reports:0 },
  { id:10, text:'Bangladesh gained independence in which year?',    stream:'SSC',    subject:'History',  diff:'Easy',   status:'Published', reports:0 },
])

const filteredQuestions = computed(() => {
  let list = questions.value
  if (qSearch.value) { const q = qSearch.value.toLowerCase(); list = list.filter(q2 => q2.text.toLowerCase().includes(q)) }
  if (qStream.value !== 'All') list = list.filter(q => q.stream === qStream.value)
  if (qDiff.value !== 'All')   list = list.filter(q => q.diff === qDiff.value)
  if (qStatus.value !== 'All') list = list.filter(q => q.status === qStatus.value)
  return list
})

function deleteQuestion(q) {
  questions.value = questions.value.filter(x => x.id !== q.id)
  logAction('delete', `Deleted question #${q.id}`)
  showToast('Question deleted.', 'error')
}
function toggleQStatus(q) {
  q.status = q.status === 'Published' ? 'Draft' : 'Published'
  logAction('publish', `${q.status === 'Published' ? 'Published' : 'Unpublished'} question #${q.id}`)
  showToast(`Question ${q.status.toLowerCase()}.`)
}

// ─── Exam Results tab ─────────────────────────────────────────
const examFilter = ref('all')
const examResults = ref([
  { id:1,  user:'Tanvir Ahmed',   stream:'HSC Science',    subject:'Physics', score:88, qs:30, date:'2025-05-07', status:'passed'  },
  { id:2,  user:'Farida Khanam', stream:'Medical',subject:'Biology', score:94, qs:50, date:'2025-05-07', status:'passed'  },
  { id:3,  user:'Maliha Sultana',stream:'BCS',    subject:'General', score:62, qs:50, date:'2025-05-06', status:'passed'  },
  { id:4,  user:'Jahid Hasan',   stream:'SSC',    subject:'Math',    score:44, qs:20, date:'2025-05-06', status:'failed'  },
  { id:5,  user:'Nusrat Jahan',  stream:'HSC Science',    subject:'Bangla',  score:77, qs:30, date:'2025-05-05', status:'passed'  },
  { id:6,  user:'Sabbir Rahman', stream:'DU',     subject:'English', score:55, qs:20, date:'2025-05-05', status:'passed'  },
  { id:7,  user:'Priya Roy',     stream:'Medical',subject:'Chem',    score:91, qs:50, date:'2025-05-04', status:'passed'  },
  { id:8,  user:'Kamrul Islam',  stream:'Bank',   subject:'Math',    score:38, qs:50, date:'2025-05-04', status:'failed'  },
  { id:9,  user:'Touhid Bhuiyan',stream:'DU',     subject:'GK',      score:85, qs:30, date:'2025-05-03', status:'passed'  },
  { id:10, user:'Sadia Akter',   stream:'BCS',    subject:'BCS-P',   score:79, qs:100,date:'2025-05-03', status:'passed'  },
])
const filteredResults = computed(() => {
  if (examFilter.value === 'high') return examResults.value.filter(r => r.score >= 80)
  if (examFilter.value === 'low')  return examResults.value.filter(r => r.score < 50)
  return examResults.value
})

// ─── Content tab ──────────────────────────────────────────────
const announcements = ref([
  { id:1, title:'SSC 2025 Question Pack Released', date:'2025-05-01', status:'live'  },
  { id:2, title:'Server maintenance May 12, 2am',  date:'2025-05-05', status:'draft' },
  { id:3, title:'New BCS Mock Exam Series',         date:'2025-04-28', status:'live'  },
])
const newAnnTitle = ref('')
function addAnnouncement() {
  if (!newAnnTitle.value.trim()) return
  announcements.value.unshift({ id: Date.now(), title: newAnnTitle.value, date: new Date().toISOString().slice(0,10), status: 'draft' })
  logAction('announce', `Created announcement: "${newAnnTitle.value}"`)
  newAnnTitle.value = ''
  showToast('Announcement created as draft.')
}
function publishAnn(a) {
  a.status = 'live'
  logAction('publish', `Published announcement: "${a.title}"`)
  showToast('Announcement published.')
}
function deleteAnn(a) {
  announcements.value = announcements.value.filter(x => x.id !== a.id)
  logAction('delete', `Deleted announcement: "${a.title}"`)
  showToast('Deleted.', 'error')
}

// ─── System tab ───────────────────────────────────────────────
function runCachePurge() {
  systemLogs.value.unshift({ time: new Date().toTimeString().slice(0,8), level: 'INFO', msg: 'Manual CDN cache purge triggered by admin.' })
  logAction('system', 'CDN cache purge triggered')
  showToast('Cache purge initiated.')
}
function runRecalc() {
  systemLogs.value.unshift({ time: new Date().toTimeString().slice(0,8), level: 'INFO', msg: 'Leaderboard recalc triggered by admin.' })
  logAction('system', 'Leaderboard recalculated')
  showToast('Leaderboard recalculation started.')
}
function runBackup() {
  systemLogs.value.unshift({ time: new Date().toTimeString().slice(0,8), level: 'INFO', msg: 'Manual DB backup triggered by admin.' })
  logAction('system', 'DB backup started')
  showToast('Backup started.')
}
function runStreakCron() {
  systemLogs.value.unshift({ time: new Date().toTimeString().slice(0,8), level: 'INFO', msg: 'Streak cron manually triggered by admin.' })
  logAction('system', 'Streak cron triggered')
  showToast('Streak cron triggered.')
}

// ─── Helpers ──────────────────────────────────────────────────
function scoreClass(s) { return s >= 75 ? 'high' : s >= 50 ? 'mid' : 'low' }
function diffClass(d)  { return d === 'Easy' ? 'diff-easy' : d === 'Medium' ? 'diff-mid' : 'diff-hard' }
function initials(name) { return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() }
</script>

<template>
  <div class="admin-shell">

    <!-- ── Admin Sidebar ────────────────────────────────────── -->
    <AdminSidebar
      :collapsed="sidebarCollapsed"
      :mobileOpen="mobileDrawerOpen"
      :activeTab="activeTab"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @tab="handleTabChange"
    />

    <!-- Mobile backdrop (closes drawer on tap) -->
    <div
      v-if="mobileDrawerOpen"
      class="mobile-backdrop"
      @click="mobileDrawerOpen = false"
    ></div>

    <!-- ── Main content ─────────────────────────────────────── -->
    <div class="admin-main">

      <!-- ── Admin TopBar ─────────────────────────────────── -->
      <AdminTopBar
        :activeTab="activeTab"
        :systemStatus="systemStatus"
        :alertCount="1"
        @action="handleAction"
        @openMobileMenu="mobileDrawerOpen = true"
      />

      <!-- ═══════════════════════════════════════════════════
           OVERVIEW TAB
      ══════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'overview'" class="tab-body">

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Admin Panel</div>
            <h1 class="page-title">Platform Overview.<br><span class="text-outline">Everything at a Glance.</span></h1>
            <p class="page-sub">Live metrics, activity trends, and system health for Cortex404.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Platform Status</span>
              <span class="hsc-value">Operational</span>
              <div class="hsc-row">
                <span class="h-dot-inline healthy" /><span class="hsc-meta">All 5 services healthy</span>
              </div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill" style="width:100%" /></div>
            </div>
          </div>
        </div>

        <AdminStats :stats="overviewStats" />

        <div class="ov-row">
          <!-- Activity chart -->
          <div class="panel ov-chart-panel">
            <div class="panel-head">
              <span class="panel-title">EXAM ACTIVITY — LAST 14 DAYS</span>
            </div>
            <div class="activity-chart">
              <div class="ac-bars">
                <div v-for="(val, i) in weeklyActivity" :key="i" class="ac-bar" :style="{ height: val + '%' }" :title="val + ' exams'">
                  <div class="ac-bar-inner" />
                </div>
              </div>
              <div class="ac-labels">
                <span v-for="(_, i) in weeklyActivity" :key="i">D{{ i + 1 }}</span>
              </div>
            </div>
          </div>

          <!-- Stream breakdown -->
          <div class="panel ov-breakdown-panel">
            <div class="panel-head"><span class="panel-title">USER STREAMS</span></div>
            <div class="stream-bars">
              <div class="sbar-row" v-for="item in [{name:'HSC',pct:28},{name:'Medical',pct:22},{name:'BUET',pct:18},{name:'BCS',pct:15},{name:'SSC',pct:10},{name:'DU',pct:5},{name:'Bank',pct:2}]" :key="item.name">
                <span class="sbar-name">{{ item.name }}</span>
                <div class="sbar-track"><div class="sbar-fill" :style="{ width: item.pct + '%' }" /></div>
                <span class="sbar-pct">{{ item.pct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="ov-bottom-row">
          <!-- Recent admin actions component -->
          <AdminRecentActions :actions="auditLog.slice(0, 6)" />

          <!-- Quick actions component -->
          <AdminQuickActions @action="handleAction" />

          <!-- System health component -->
          <AdminSystemHealth
            :services="systemServices"
            :logs="systemLogs.slice(0, 4)"
            :dbUsed="2.3"
            :dbTotal="8"
          />
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════
           USERS TAB
      ══════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'users'" class="tab-body">

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> User Management</div>
            <h1 class="page-title">All Users.<br><span class="text-outline">Ban, Promote, Inspect.</span></h1>
            <p class="page-sub">Manage student and admin accounts across all exam streams.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Total Users</span>
              <span class="hsc-value">14,820</span>
              <div class="hsc-row">
                <span class="hsc-meta">{{ users.filter(u=>u.status==='banned').length }} banned · {{ users.filter(u=>u.status==='unverified').length }} unverified</span>
              </div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill" :style="{width: (users.filter(u=>u.status==='active').length / users.length * 100) + '%'}" /></div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="fb-search">
            <span class="fb-icon">⌕</span>
            <input v-model="userSearch" class="fb-input" placeholder="Search name or email…" />
            <button v-if="userSearch" class="fb-clear" @click="userSearch=''">×</button>
          </div>
          <div class="fb-pills">
            <button v-for="f in ['all','active','banned','unverified']" :key="f"
              class="pill" :class="{active: userFilter===f}" @click="userFilter=f; userPage=1">
              {{ f.charAt(0).toUpperCase() + f.slice(1) }}
            </button>
          </div>
          <div class="fb-sort">
            <select v-model="userSort" class="fb-select">
              <option value="joined">Sort: Newest</option>
              <option value="score">Sort: Score</option>
              <option value="exams">Sort: Exams</option>
            </select>
          </div>
          <div class="fb-meta">{{ filteredUsers.length }} users</div>
        </div>

        <div class="panel table-panel">
          <div class="table-scroll"><div class="data-table users-table">
            <div class="dt-head">
              <span>User</span><span>Stream</span><span>Exams</span>
              <span>Avg Score</span><span>Joined</span><span>Status</span>
              <span>Role</span><span>Actions</span>
            </div>
            <div class="dt-row" v-for="u in paginatedUsers" :key="u.id" @click="openModal('userDetail', u)">
              <div class="dt-user">
                <div class="dt-avatar">{{ initials(u.name) }}</div>
                <div class="dt-user-info">
                  <span class="dt-name">{{ u.name }}</span>
                  <span class="dt-email">{{ u.email }}</span>
                </div>
              </div>
              <span class="stream-tag">{{ u.stream }}</span>
              <span class="mono">{{ u.exams }}</span>
              <span class="score-val" :class="scoreClass(u.score)">{{ u.score > 0 ? u.score + '%' : '—' }}</span>
              <span class="mono dim">{{ u.joined }}</span>
              <span class="status-badge" :class="u.status">{{ u.status }}</span>
              <span class="role-badge" :class="u.role">{{ u.role }}</span>
              <div class="dt-actions" @click.stop>
                <button class="act-btn" :class="u.status==='banned'?'unban':'ban'" @click="banUser(u)" :title="u.status==='banned'?'Unban':'Ban'">
                  {{ u.status === 'banned' ? '✓' : '⊘' }}
                </button>
                <button class="act-btn promote" @click="promoteUser(u)" :title="u.role==='admin'?'Demote':'Make Admin'">
                  {{ u.role === 'admin' ? '↓' : '↑' }}
                </button>
                <button class="act-btn view" @click="openModal('userDetail', u)" title="View">◈</button>
              </div>
            </div>
          </div></div><!-- /table-scroll -->
          <div class="pagination" v-if="totalUserPages > 1">
            <button class="iso-btn iso-btn--ghost pg-btn" :disabled="userPage===1" @click="userPage--">← Prev</button>
            <span class="pg-info">{{ userPage }} / {{ totalUserPages }}</span>
            <button class="iso-btn iso-btn--ghost pg-btn" :disabled="userPage===totalUserPages" @click="userPage++">Next →</button>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════
           QUESTIONS TAB
      ══════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'questions'" class="tab-body">

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Question Bank</div>
            <h1 class="page-title">8,441 Questions.<br><span class="text-outline">Publish, Flag, Control.</span></h1>
            <p class="page-sub">Review, moderate, and add questions across all exam streams and subjects.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Flagged</span>
              <span class="hsc-value hsc-value--warn">120</span>
              <div class="hsc-row">
                <span class="hsc-meta">341 drafts · 7,980 published</span>
              </div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill hsc-bar--warn" style="width:1.4%" /></div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="fb-search">
            <span class="fb-icon">⌕</span>
            <input v-model="qSearch" class="fb-input" placeholder="Search questions…" />
          </div>
          <div class="fb-pills">
            <button v-for="s in streams" :key="s" class="pill" :class="{active:qStream===s}" @click="qStream=s">{{ s }}</button>
          </div>
          <div class="fb-pills">
            <button v-for="d in difficulties" :key="d" class="pill" :class="{active:qDiff===d,[diffClass(d)]:d!=='All'}" @click="qDiff=d">{{ d }}</button>
          </div>
          <div class="fb-pills">
            <button v-for="s in qStatuses" :key="s" class="pill" :class="{active:qStatus===s}" @click="qStatus=s">{{ s }}</button>
          </div>
          <button class="iso-btn iso-btn--fill add-btn" @click="openModal('addQuestion')">+ Add Question</button>
        </div>

        <div class="panel table-panel">
          <div class="table-scroll"><div class="data-table questions-table">
            <div class="dt-head">
              <span>#</span><span>Question</span><span>Stream</span>
              <span>Subject</span><span>Difficulty</span><span>Status</span>
              <span>Reports</span><span>Actions</span>
            </div>
            <div class="dt-row" v-for="q in filteredQuestions" :key="q.id">
              <span class="mono dim">{{ q.id }}</span>
              <span class="q-text">{{ q.text }}</span>
              <span class="stream-tag">{{ q.stream }}</span>
              <span class="mono dim">{{ q.subject }}</span>
              <span class="diff-badge" :class="diffClass(q.diff)">{{ q.diff }}</span>
              <span class="status-badge" :class="q.status.toLowerCase()">{{ q.status }}</span>
              <span class="reports-count" :class="q.reports > 0 ? 'has-reports' : ''">{{ q.reports }}</span>
              <div class="dt-actions">
                <button class="act-btn view" @click="openModal('editQuestion', q)" title="Edit">✎</button>
                <button class="act-btn" :class="q.status==='Published'?'ban':'unban'" @click="toggleQStatus(q)">
                  {{ q.status === 'Published' ? '◻' : '▣' }}
                </button>
                <button class="act-btn ban" @click="deleteQuestion(q)" title="Delete">✕</button>
              </div>
            </div>
          </div>
          </div><!-- /table-scroll -->
          <div class="dt-footer mono">{{ filteredQuestions.length }} questions</div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════
           EXAM RESULTS TAB
      ══════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'exams'" class="tab-body">

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Exam Results</div>
            <h1 class="page-title">All Attempts.<br><span class="text-outline">Pass Rates & Scores.</span></h1>
            <p class="page-sub">Browse every exam result submitted by students across the platform.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Today's Exams</span>
              <span class="hsc-value">1,203</span>
              <div class="hsc-row">
                <span class="hsc-meta">+18% vs yesterday · avg score 74%</span>
              </div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill" style="width:74%" /></div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="fb-pills">
            <button v-for="f in ['all','high','low']" :key="f" class="pill" :class="{active:examFilter===f}" @click="examFilter=f">
              {{ f === 'all' ? 'All' : f === 'high' ? '≥ 80%' : '< 50%' }}
            </button>
          </div>
          <div class="fb-meta">{{ filteredResults.length }} results</div>
        </div>
        <div class="panel table-panel">
          <div class="table-scroll"><div class="data-table results-table">
            <div class="dt-head">
              <span>User</span><span>Stream</span><span>Subject</span>
              <span>Score</span><span>Questions</span><span>Date</span><span>Status</span>
            </div>
            <div class="dt-row" v-for="r in filteredResults" :key="r.id">
              <span class="dt-name">{{ r.user }}</span>
              <span class="stream-tag">{{ r.stream }}</span>
              <span class="mono dim">{{ r.subject }}</span>
              <div class="score-cell">
                <span class="score-val" :class="scoreClass(r.score)">{{ r.score }}%</span>
                <div class="score-bar-mini"><div class="sbm-fill" :class="scoreClass(r.score)" :style="{width: r.score+'%'}"/></div>
              </div>
              <span class="mono">{{ r.qs }}</span>
              <span class="mono dim">{{ r.date }}</span>
              <span class="status-badge" :class="r.status">{{ r.status }}</span>
            </div>
        </div></div><!-- /table-scroll -->
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════
           REVIEW QUEUE TAB
      ══════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'queue'" class="tab-body">

        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Review Queue</div>
            <h1 class="page-title">Moderator Submissions.<br><span class="text-outline">Approve or Reject.</span></h1>
            <p class="page-sub">Review questions submitted by moderators — including mod-fixed reported questions — then publish or reject them.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Pending Review</span>
              <span class="hsc-value">{{ reviewQueue.filter(q=>q.status==='pending'||q.status==='fixed').length }}</span>
              <div class="hsc-row"><span class="hsc-meta">{{ reviewQueue.filter(q=>q.status==='approved').length }} approved · {{ reviewQueue.filter(q=>q.status==='rejected').length }} rejected</span></div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill" :style="{width:(reviewQueue.filter(q=>q.status==='pending'||q.status==='fixed').length/reviewQueue.length*100)+'%'}" /></div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="fb-search">
            <span class="fb-icon">⌕</span>
            <input v-model="queueSearch" class="fb-input" placeholder="Search questions…" />
            <button v-if="queueSearch" class="fb-clear" @click="queueSearch=''">×</button>
          </div>
          <div class="fb-pills">
            <button v-for="f in ['all','pending','fixed','approved','rejected']" :key="f"
              class="pill" :class="{active:queueFilter===f}" @click="queueFilter=f">
              {{ f === 'fixed' ? 'Mod-Fixed' : f.charAt(0).toUpperCase()+f.slice(1) }}
            </button>
          </div>
          <div class="fb-pills">
            <button v-for="s in ['All','SSC','HSC','BUET','Medical','DU','BCS','Bank']" :key="s"
              class="pill" :class="{active:queueStream===s}" @click="queueStream=s">{{ s }}</button>
          </div>
          <div class="fb-meta">{{ filteredReviewQueue.length }} questions</div>
        </div>

        <div v-if="queueLoading" class="empty-panel">Loading submissions…</div>
        <!--<div v-else-if="filteredReviewQueue.length === 0" class="empty-panel">
          <span class="empty-icon">✓</span>
          <h3>No pending questions</h3>
          <p>Everything is clean. Take a break.</p>
        </div>-->

        <!-- <div class="queue-cards">
          <div class="queue-card" v-for="q in filteredReviewQueue" :key="q.id" :class="'qcard-'+q.status">
            <div class="qcard-top">
              <div class="qcard-meta">
                <span class="stream-tag">{{ q.stream }}</span>
                <span class="mono dim">{{ q.subj }}</span>
                <span class="diff-badge" :class="diffClass(q.diff)">{{ q.diff }}</span>
                <span v-if="q.status==='fixed'" class="fixed-tag">✎ Mod-Fixed</span>
              </div>
              <span class="status-badge" :class="q.status==='fixed'?'pending':q.status">
                {{ q.status === 'fixed' ? 'pending (fixed)' : q.status }}
              </span>
            </div>
            <p class="qcard-text">{{ q.text }}</p>
            <div class="qcard-footer">
              <span class="qcard-by mono dim">Submitted by {{ q.submittedBy }} · {{ q.date }}</span>
              <span v-if="q.note" class="qcard-note">Note: {{ q.note }}</span>
              <div class="qcard-actions" v-if="q.status==='pending'||q.status==='fixed'">
                <button class="iso-btn iso-btn--ghost qact-btn approve-btn" @click="adminApproveQ(q)">✓ Approve & Publish</button>
                <button class="iso-btn iso-btn--ghost qact-btn reject-btn"  @click="openModal('adminRejectQ', q)">✕ Reject</button>
              </div>
              <div v-else class="qcard-done">
                <span class="status-badge" :class="q.status">{{ q.status }}</span>
              </div>
            </div>
          </div>
          <div v-if="!filteredReviewQueue.length" class="empty-panel">No questions match this filter.</div>
        </div> -->

        <div class="queue-cards">
          <div class="queue-card" v-for="q in filteredReviewQueue" :key="q.id" :class="'qcard-'+q.status">
          
            <!-- TOP ROW: tags + status badge -->
            <div class="qcard-top">
              <div class="qcard-meta">
                <span class="stream-tag">{{ q.stream }}</span>
                <span class="mono dim">{{ q.subj }}</span>
                <span class="diff-badge" :class="diffClass(q.diff)">{{ q.diff }}</span>
                <span v-if="q.status==='fixed'" class="fixed-tag">✎ Mod-Fixed</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <!-- <span class="status-badge" :class="q.status==='fixed'?'pending':q.status">
                  {{ q.status === 'fixed' ? 'pending (fixed)' : q.status }}
                </span>  -->
                <span class="iso-btn iso-btn--ghost" style="font-size:0.65rem;padding:3px 8px" >
                  {{ q.status === 'fixed' ? 'pending (fixed)' : q.status }}
                </span>
                <!-- Expand toggle -->
                <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem;padding:3px 8px" @click="toggleQueueExpand(q)">
                  {{ q.expanded ? '▲ Collapse' : '▼ Details' }}
                </button>
              </div>
            </div>
          
            <!-- QUESTION TEXT -->
            <p class="qcard-text"><span v-if="q.expanded">EN:</span> {{ q.text }}</p>
            <p v-if="q.expanded" class="qcard-text">BN: {{ q.text_bn }}</p>
          
            <!-- EXPANDED DETAILS -->
            <div v-if="q.expanded" class="qcard-details">
              <!-- Stimulus -->
              <div v-if="q.stimulus?.bangla || q.stimulus?.english" class="qd-section">
                <span class="qd-label">STIMULUS</span>
                <p class="qd-text">EN: {{ q.stimulus?.english }}</p>
                <p class="qd-text">BN: {{ q.stimulus?.bangla }}</p>
                <img v-if="q.stimulus_image" :src="q.stimulus_image" class="qd-img" />
              </div>
            
              <!-- Options -->
              <div class="qd-section">
                <span class="qd-label">OPTIONS</span>
                <div class="qd-options">
                  <div
                    v-for="(opt, i) in (q.options?.english || q.options?.bangla || [])"
                    :key="i"
                    class="qd-option"
                    :class="{ 'qd-option--correct': i === q.correct_index }"
                  >
                    <span class="qd-opt-letter">{{ ['A','B','C','D'][i] }}.</span>
                    {{ opt }} / {{ q.options?.bangla[i] }}
                    <span v-if="i === q.correct_index" style="margin-left:6px;color:rgba(120,230,120,0.9)">✓</span>
                  </div>
                </div>
              </div>
            
              <!-- Explanation -->
              <div v-if="q.explanation?.bangla || q.explanation?.english" class="qd-section">
                <span class="qd-label">EXPLANATION</span>
                <p class="qd-text">EN: {{ q.explanation?.english }}</p>
                <p class="qd-text">BN: {{ q.explanation?.bangla }}</p>
              </div>
            
              <!-- Question image -->
              <div v-if="q.question_image" class="qd-section">
                <span class="qd-label">QUESTION IMAGE</span>
                <img :src="q.question_image" class="qd-img" />
              </div>
            
              <!-- Metadata row -->
              <div class="qd-meta-row">
                <span v-if="q.chapter?.english">
                  Chapter: {{ q.chapter?.english }}
                </span>
                <span v-if="q.years">Year: {{ Array.isArray(q.years) ? q.years.map(y=>y.english||y).join(', ') : q.years }}</span>
                <span v-if="q.source?.english">Source: {{ q.source.english.join(', ') }}</span>
                <!-- <span>Correct index: {{ q.correct_index }}</span> -->
              </div>
              <div class="qd-meta-row">
                <span v-if="q.chapter?.bangla">
                  Chapter: {{ q.chapter?.bangla }}
                </span>
                <span v-if="q.years">Year: {{ Array.isArray(q.years) ? q.years.map(y=>y.bangla||y).join(', ') : q.years }}</span>
                <span v-if="q.source?.bangla">Source: {{ q.source.bangla.join(', ') }}</span>
                <!-- <span>Correct index: {{ q.correct_index }}</span> -->
              </div>
              <br>
            </div>
          
            <!-- FOOTER: submitter + actions -->
            <div class="qcard-footer">
              <!-- ↓ CHANGED: avatar + full name instead of bare UUID -->
              <div class="qcard-submitter">
                <span class="qcard-by mono dim">Submitted by:</span>
                <img
                  v-if="q.submitterAvatar"
                  :src="q.submitterAvatar"
                  class="qcard-avatar"
                  :alt="q.submittedBy"
                />
                <span v-else class="qcard-avatar qcard-avatar--fallback">
                  {{ q.submittedBy?.charAt(0)?.toUpperCase() ?? '?' }}
                </span>
                <span class="qcard-by mono dim">{{ q.submittedBy }} · {{ q.date }}</span>
              </div>
            
              <span v-if="q.note" class="qcard-note">Note: {{ q.note }}</span>
              <div class="qcard-actions" v-if="q.status==='pending'||q.status==='fixed'">
                <button class="iso-btn iso-btn--ghost qact-btn approve-btn" @click="adminApproveQ(q)">✓ Approve & Publish</button>
                <button class="iso-btn iso-btn--ghost qact-btn reject-btn"  @click="openModal('adminRejectQ', q)">✕ Reject</button>
              </div>
              <div v-else class="qcard-done">
                <span class="status-badge" :class="q.status">{{ q.status }}</span>
              </div>
            </div>
          
          </div>
          <div v-if="!filteredReviewQueue.length" class="empty-panel">No questions match this filter.</div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════
           CONTENT TAB
      ══════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'content'" class="tab-body">

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Content</div>
            <h1 class="page-title">Announcements & Packs.<br><span class="text-outline">Broadcast to Students.</span></h1>
            <p class="page-sub">Manage platform announcements and exam question packs.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Live Announcements</span>
              <span class="hsc-value">{{ announcements.filter(a=>a.status==='live').length }}</span>
              <div class="hsc-row">
                <span class="hsc-meta">{{ announcements.filter(a=>a.status==='draft').length }} drafts pending publish</span>
              </div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill" :style="{width: (announcements.filter(a=>a.status==='live').length / announcements.length * 100) + '%'}" /></div>
            </div>
          </div>
        </div>

        <div class="content-layout">
          <div class="panel ann-panel">
            <div class="panel-head">
              <span class="panel-title">ANNOUNCEMENTS</span>
              <span class="mono dim">{{ announcements.length }} total</span>
            </div>
            <div class="ann-form">
              <input v-model="newAnnTitle" class="fb-input ann-input" placeholder="New announcement title…" @keyup.enter="addAnnouncement" />
              <button class="iso-btn iso-btn--fill" @click="addAnnouncement">+ Create</button>
            </div>
            <div class="ann-list">
              <div class="ann-item" v-for="a in announcements" :key="a.id">
                <div class="ann-info">
                  <span class="ann-title-text">{{ a.title }}</span>
                  <span class="ann-date mono dim">{{ a.date }}</span>
                </div>
                <div class="ann-controls">
                  <span class="status-badge" :class="a.status">{{ a.status }}</span>
                  <button class="act-btn unban" v-if="a.status==='draft'" @click="publishAnn(a)" title="Publish">▶</button>
                  <button class="act-btn ban" @click="deleteAnn(a)" title="Delete">✕</button>
                </div>
              </div>
            </div>
          </div>

          <div class="content-sidebar">
            <div class="panel">
              <div class="panel-head"><span class="panel-title">QUESTION BANK STATS</span></div>
              <div class="cstat-list">
                <div class="cstat-row" v-for="item in [{label:'Total',val:'8,441'},{label:'Published',val:'7,980'},{label:'Draft',val:'341'},{label:'Flagged',val:'120'},{label:'Avg Difficulty',val:'Medium'},{label:'Top Stream',val:'HSC'}]" :key="item.label">
                  <span class="cstat-label">{{ item.label }}</span>
                  <span class="cstat-val mono">{{ item.val }}</span>
                </div>
              </div>
            </div>
            <div class="panel">
              <div class="panel-head"><span class="panel-title">EXAM PACKS</span></div>
              <div class="pack-list">
                <div class="pack-row" v-for="p in [{name:'SSC 2025 Full Pack',status:'live',qs:800},{name:'HSC Physics Set A',status:'live',qs:200},{name:'BUET Mock Series',status:'draft',qs:300},{name:'BCS Preli 44th',status:'live',qs:200},{name:'Medical Digest 25',status:'draft',qs:500}]" :key="p.name">
                  <div class="pack-info">
                    <span class="pack-name">{{ p.name }}</span>
                    <span class="mono dim">{{ p.qs }} Qs</span>
                  </div>
                  <span class="status-badge" :class="p.status">{{ p.status }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════
           SYSTEM TAB
      ══════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'system'" class="tab-body">

        <!-- Page Header -->
        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> System</div>
            <h1 class="page-title">Infrastructure.<br><span class="text-outline">Logs, Health & Actions.</span></h1>
            <p class="page-sub">Monitor service health, run admin operations, and review system logs.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Services</span>
              <span class="hsc-value" :class="systemServices.some(s=>s.status==='error') ? 'hsc-value--error' : systemServices.some(s=>s.status==='warn') ? 'hsc-value--warn' : ''">
                {{ systemServices.filter(s=>s.status==='healthy').length }} / {{ systemServices.length }} OK
              </span>
              <div class="hsc-row">
                <span class="h-dot-inline" :class="systemStatus === 'ok' ? 'healthy' : systemStatus" />
                <span class="hsc-meta">{{ systemStatus === 'ok' ? 'All systems operational' : 'Degraded performance' }}</span>
              </div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill" :style="{width: (systemServices.filter(s=>s.status==='healthy').length / systemServices.length * 100) + '%'}" /></div>
            </div>
          </div>
        </div>

        <div class="system-layout">
          <div class="sys-main">
            <!-- Full system health panel as component -->
            <AdminSystemHealth
              :services="systemServices"
              :logs="systemLogs"
              :dbUsed="2.3"
              :dbTotal="8"
            />
            <!-- Full log panel -->
            <div class="panel logs-panel">
              <div class="panel-head">
                <span class="panel-title">FULL SYSTEM LOG</span>
                <span class="mono dim">{{ systemLogs.length }} entries</span>
              </div>
              <div class="log-list-full">
                <div class="log-row-full" v-for="(log, i) in systemLogs" :key="i" :class="'log-'+log.level.toLowerCase()">
                  <span class="log-time mono">{{ log.time }}</span>
                  <span class="log-level mono">{{ log.level }}</span>
                  <span class="log-msg-text">{{ log.msg }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="sys-sidebar">
            <div class="panel">
              <div class="panel-head"><span class="panel-title">ADMIN ACTIONS</span></div>
              <div class="sys-actions">
                <button class="iso-btn iso-btn--ghost iso-btn--full sys-act-btn" @click="runCachePurge()">⚙ Purge CDN Cache</button>
                <button class="iso-btn iso-btn--ghost iso-btn--full sys-act-btn" @click="runRecalc()">▣ Recalc Leaderboard</button>
                <button class="iso-btn iso-btn--ghost iso-btn--full sys-act-btn" @click="runBackup()">◈ Run DB Backup</button>
                <button class="iso-btn iso-btn--ghost iso-btn--full sys-act-btn" @click="runStreakCron()">⬡ Trigger Streak Cron</button>
              </div>
            </div>
            <!-- Audit log in sidebar -->
            <div class="panel">
              <div class="panel-head"><span class="panel-title">AUDIT LOG</span></div>
              <AdminRecentActions :actions="auditLog.slice(0, 8)" />
            </div>
          </div>
        </div>
      </div>

    </div><!-- /admin-main -->

    <!-- ═══════════════════════════════════════════════════════
         MODALS
    ══════════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modal.show" @click.self="closeModal()">
        <div class="modal-box">

          <!-- User Detail -->
          <template v-if="modal.type === 'userDetail' && modal.data">
            <div class="modal-head">
              <span class="panel-title">USER DETAIL</span>
              <button class="modal-close" @click="closeModal()">×</button>
            </div>
            <div class="modal-user-hero">
              <div class="dt-avatar big-avatar">{{ initials(modal.data.name) }}</div>
              <div class="modal-user-info">
                <div class="modal-name">{{ modal.data.name }}</div>
                <div class="modal-email mono dim">{{ modal.data.email }}</div>
                <div class="modal-badges">
                  <span class="status-badge" :class="modal.data.status">{{ modal.data.status }}</span>
                  <span class="role-badge" :class="modal.data.role">{{ modal.data.role }}</span>
                </div>
              </div>
            </div>
            <div class="modal-stats-grid">
              <div class="mstat" v-for="item in [{label:'Stream',val:modal.data.stream},{label:'Exams',val:modal.data.exams},{label:'Avg Score',val:modal.data.score+'%'},{label:'Joined',val:modal.data.joined}]" :key="item.label">
                <span class="mstat-val mono">{{ item.val }}</span>
                <span class="mstat-label">{{ item.label }}</span>
              </div>
            </div>
            <div class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="banUser(modal.data); closeModal()">
                {{ modal.data.status === 'banned' ? 'Unban User' : 'Ban User' }}
              </button>
              <button class="iso-btn iso-btn--ghost" @click="promoteUser(modal.data); closeModal()">
                {{ modal.data.role === 'admin' ? 'Demote to User' : 'Make Admin' }}
              </button>
              <button class="iso-btn iso-btn--fill" @click="closeModal()">Close</button>
            </div>
          </template>

          <!-- Add / Edit Question -->
          <template v-if="modal.type === 'addQuestion' || modal.type === 'editQuestion'">
            <div class="modal-head">
              <span class="panel-title">{{ modal.type === 'addQuestion' ? 'ADD QUESTION' : 'EDIT QUESTION' }}</span>
              <button class="modal-close" @click="closeModal()">×</button>
            </div>

            <!-- ── Tab switcher (hidden on editQuestion) ──── -->
            <div v-if="modal.type === 'addQuestion'" class="aq-tabs">
              <button
                class="aq-tab"
                :class="{ active: addQuestionTab === 'single' }"
                @click="addQuestionTab = 'single'"
              >Single Question</button>
              <button
                class="aq-tab"
                :class="{ active: addQuestionTab === 'bulk' }"
                @click="addQuestionTab = 'bulk'"
              >Bulk Import</button>
            </div>

            <!-- ══════════════════════════════════════════════
                 SINGLE QUESTION TAB
            ══════════════════════════════════════════════ -->
            <div v-if="modal.type === 'editQuestion' || addQuestionTab === 'single'" class="modal-form">

              <!-- ── Image Extractor ───────────────────────── -->
              <div class="img-extract-panel">
                <button class="img-extract-toggle" @click="imgPanelOpen = !imgPanelOpen">
                  <span class="img-extract-icon">⬆</span>
                  <span>Extract from Image (Bengali OCR → Auto-fill)</span>
                  <span class="img-extract-chevron" :class="{ open: imgPanelOpen }">▾</span>
                </button>

                <div v-if="imgPanelOpen" class="img-extract-body">
                  <div
                    class="img-drop-zone"
                    :class="{ 'has-file': imgPreview }"
                    @click="$refs.imgInput.click()"
                    @dragover.prevent
                    @drop.prevent="e => { imgFile = e.dataTransfer.files[0]; imgPreview = URL.createObjectURL(imgFile); imgError = '' }"
                  >
                    <img v-if="imgPreview" :src="imgPreview" class="img-preview" />
                    <div v-else class="img-drop-hint">
                      <span class="img-drop-icon">🖼</span>
                      <span>Click or drag &amp; drop a question image</span>
                      <span class="mono dim" style="font-size:0.62rem">PNG, JPG, WEBP supported</span>
                    </div>
                    <input
                      ref="imgInput"
                      type="file"
                      accept="image/*"
                      style="display:none"
                      @change="onImgFileChange"
                    />
                  </div>

                  <div v-if="imgError" class="img-error">⚠ {{ imgError }}</div>

                  <div class="img-extract-actions">
                    <button
                      class="iso-btn iso-btn--fill img-extract-btn"
                      :disabled="!imgFile || imgExtracting || !streamEN"
                      @click="extractFromImage"
                    >
                      <span v-if="imgExtracting" class="img-spinner">◌</span>
                      {{ imgExtracting ? 'Extracting & Translating…' : !streamEN ? 'Select a stream first' : '⚡ Extract & Auto-fill Fields' }}
                    </button>
                    <button
                      v-if="imgFile"
                      class="iso-btn iso-btn--ghost"
                      @click="imgFile = null; imgPreview = ''; imgError = ''"
                      style="font-size:0.72rem"
                    >Clear</button>
                  </div>
                </div>
              </div>
              <!-- ── / Image Extractor ──────────────────────── -->

              <div class="mf-group">
                <div class="single-flags" v-if="singleIsDuplicate || singleLowConfidence">
                  <span v-if="singleLowConfidence" class="flag-badge flag-warn">⚠ Low Confidence — review carefully</span>
                  <span v-if="singleIsDuplicate"   class="flag-badge flag-dup">DUP — possible duplicate in database</span>
                </div>
                <label class="mf-label">QUESTION TEXT (English)</label>
                <textarea v-model="questionEN" class="mf-input mf-textarea" placeholder="Enter question…" rows="3"></textarea>
                <label class="mf-label">QUESTION TEXT (Bengali)</label>
                <textarea v-model="questionBN" class="mf-input mf-textarea" placeholder="Enter question…" rows="3"></textarea>
              </div>
              <br>
              <!-- ── Question Image field ──────────────────── -->
              <div class="mf-group">
                <label class="mf-label">QUESTION IMAGE <span style="opacity:0.5;font-size:0.6rem">(auto-filled if detected · optional)</span></label>
                <div class="qimg-field" style="background-color: #1A1A1A;">
                  <div v-if="questionImageUploading" class="qimg-uploading">
                    <span class="img-spinner">◌</span> Cropping &amp; uploading…
                  </div>
                  <div v-else-if="questionImagePreview || questionImageUrl" class="qimg-preview-wrap">
                    <img :src="questionImagePreview || questionImageUrl" class="qimg-preview" />
                    <div class="qimg-actions">
                      <span class="qimg-status">{{ questionImageUrl ? '✓ Uploaded' : '⏳ Preview only' }}</span>
                      <button class="iso-btn iso-btn--ghost qimg-reupload-btn" @click="openCropper(imgFile, null)">
                        Re-crop
                      </button>
                      <label class="iso-btn iso-btn--ghost qimg-reupload-btn">
                        Re-upload
                        <input type="file" accept="image/*" style="display:none" @change="onQuestionImageReupload" />
                      </label>
                      <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem" @click="questionImageUrl = ''; questionImagePreview = ''">Remove</button>
                    </div>
                  </div>
                  <div v-else class="qimg-empty">
                    <label class="qimg-upload-label">
                      <span>📎 Upload question image manually</span>
                      <input type="file" accept="image/*" style="display:none" @change="onQuestionImageReupload" />
                    </label>
                  </div>
                </div>
              </div>
              <!-- ── / Question Image field ────────────────── -->
              <br>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">STREAM</label>
                  <select v-model="streamEN" class="mf-input mf-select">
                    <option v-for="s in ['SSC Science','SSC Arts','SSC Commerce','HSC Science','HSC Arts','HSC Commerce','BUET','Medical','DU','BCS']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">DIFFICULTY</label>
                  <select v-model="difficultyEN" class="mf-input mf-select"><option>Easy</option><option>Medium</option><option>Hard</option></select>
                </div>
              </div>
              <div class="mf-group">
                <label class="mf-label">YEAR</label>
                <input v-model="yearEN" class="mf-input" placeholder="Year" />
              </div>
              <div class="mf-group">
                <label class="mf-label">SOURCE (English)</label>
                <input v-model="sourceEN" class="mf-input" placeholder="Source (e.g. Board or School name)" />
              </div>
              <div class="mf-group">
                <label class="mf-label">SOURCE (Bengali)</label>
                <input v-model="sourceBN" class="mf-input" placeholder="Source (e.g. Board or School name)" />
              </div>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">SUBJECT (English)</label>
                  <select
                    v-model="subjectEN"
                    class="mf-input mf-select"
                    :disabled="!availableSubjects.length"
                    @change="() => { const m = availableSubjects.find(x => x.en === subjectEN); subjectBN = m?.bn ?? '' }"
                  >
                    <option value="" disabled>{{ streamEN ? 'Select subject…' : 'Select stream first' }}</option>
                    <option v-for="s in availableSubjects" :key="s.en" :value="s.en">{{ s.en }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">SUBJECT (Bangla)</label>
                  <select
                    v-model="subjectBN"
                    class="mf-input mf-select"
                    :disabled="!availableSubjects.length"
                    @change="() => { const m = availableSubjects.find(x => x.bn === subjectBN); subjectEN = m?.en ?? '' }"
                  >
                    <option value="" disabled>{{ streamEN ? 'Select subject…' : 'Select stream first' }}</option>
                    <option v-for="s in availableSubjects" :key="s.bn" :value="s.bn">{{ s.bn }}</option>
                  </select>
                </div>
              </div>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">CHAPTER (English)</label>
                  <select
                    v-model="chapterEN"
                    class="mf-input mf-select"
                    :disabled="!availableChapters.length"
                    @change="() => { const m = availableChapters.find(c => c.en === chapterEN); chapterBN = m?.bn ?? '' }"
                  >
                    <option value="" disabled>{{ subjectEN ? 'Select chapter…' : 'Select subject first' }}</option>
                    <option v-for="c in availableChapters" :key="c.en" :value="c.en">{{ c.en }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">CHAPTER (Bangla)</label>
                  <select
                    v-model="chapterBN"
                    class="mf-input mf-select"
                    :disabled="!availableChapters.length"
                    @change="() => { const m = availableChapters.find(c => c.bn === chapterBN); chapterEN = m?.en ?? '' }"
                  >
                    <option value="" disabled>{{ subjectEN ? 'Select chapter…' : 'Select subject first' }}</option>
                    <option v-for="c in availableChapters" :key="c.bn" :value="c.bn">{{ c.bn }}</option>
                  </select>
                </div>
              </div>
              <br>
              <div class="mf-group">
                <label class="mf-label">OPTIONS (A / B / C / D)</label>
                <input v-model="optionsEN[0]" class="mf-input" placeholder="Option A (English)" /><input v-model="optionsBN[0]" class="mf-input" placeholder="Option A (Bengali)" /><br>
                <input v-model="optionsEN[1]" class="mf-input mt4" placeholder="Option B (English)" /><input v-model="optionsBN[1]" class="mf-input mt4" placeholder="Option B (Bengali)" /><br>
                <input v-model="optionsEN[2]" class="mf-input mt4" placeholder="Option C (English)" /><input v-model="optionsBN[2]" class="mf-input mt4" placeholder="Option C (Bengali)" /><br>
                <input v-model="optionsEN[3]" class="mf-input mt4" placeholder="Option D (English)" /><input v-model="optionsBN[3]" class="mf-input mt4" placeholder="Option D (Bengali)" /><br>
              </div>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">CORRECT ANSWER</label>
                  <select v-model="answerEN" class="mf-input mf-select"><option>A</option><option>B</option><option>C</option><option>D</option></select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">STATUS</label>
                  <select v-model="statusQuestion" class="mf-input mf-select"><option>Published</option><option>Draft</option></select>
                </div>
              </div>
              <br>
              <div class="mf-group">
                <label class="mf-label">EXPLANATION (optional) (English)</label>
                <textarea v-model="explanationEN" class="mf-input mf-textarea" rows="2" placeholder="Explain the answer…"></textarea>
                <label class="mf-label">EXPLANATION (optional) (Bengali)</label>
                <textarea v-model="explanationBN" class="mf-input mf-textarea" rows="2" placeholder="Explain the answer…"></textarea>
              </div>
            </div>
            <div v-if="modal.type === 'editQuestion' || addQuestionTab === 'single'" class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="closeModal()">Cancel</button>
              <button class="iso-btn iso-btn--fill" @click="saveQuestion(); resetQuestionForm(); closeModal()">Save Question</button>
            </div>

            <!-- ══════════════════════════════════════════════
                 BULK IMPORT TAB
            ══════════════════════════════════════════════ -->
            <div v-if="addQuestionTab === 'bulk' && modal.type === 'addQuestion'" class="modal-form bulk-form">

              <!-- Stream selector (shared ref) -->
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">STREAM (required)</label>
                  <select v-model="streamEN" class="mf-input mf-select">
                    <option value="" disabled>Select stream…</option>
                    <option v-for="s in ['SSC Science','SSC Arts','SSC Commerce','HSC Science','HSC Arts','HSC Commerce','Engineering','Medical','Varsity','BCS']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <!--<div class="mf-group">
                  <label class="mf-label">Text Book (Optional)</label>
                  <select v-model="textBookEN" style="overflow-y: scroll;" class="mf-input mf-select">
                    <option value="" disabled>Select Text Book…</option>
                    <option v-for="s in ['Mathematics 1st Paper (Ketab Uddin Ahmed)','Mathematics 2nd Paper (Ketab Uddin Ahmed)', 'Mathematics 1st Paper (Ruponti Prokashoni)','Mathematics 2nd Paper (Ruponti Prokashoni)','Physics 1st Paper (Dr. Shahjahan Tapan)','Physics 2nd Paper (Dr. Shahjahan Tapan)', 'Physics 1st Paper (Prof. Md. Ishaq)','Physics 2nd Paper (Prof. Md. Ishaq)', 'Physics 1st Paper (Prof. Shamsuzzaman Selu)','Physics 2nd Paper (Prof. Shamsuzzaman Selu)','Chemistry 1st Paper (Hazari-Nag)','Chemistry 2nd Paper (Hazari-Nag)','Chemistry 1st Paper (Sanjit kumar Guha)','Chemistry 2nd Paper (Sanjit kumar Guha)','Botany (Dr. Md. Abul Hasan)','Zoology (Gazi Azmal & Gazi Asmat)','ICT (Mahabubur Rahman)', 'ICT (Engr. Mujibur Rahman)']" :key="s">{{ s }}</option>
                  </select>
                </div>-->
                <div class="mf-group" style="position: relative;">
                  <label class="mf-label">Text Book (Optional)</label>

                  <input
                    type="text"
                    class="mf-input mf-select"
                    v-model="searchQuery"
                    @focus="showDropdown = true"
                    @input="showDropdown = true"
                    @blur="closeDropdownDelayed"
                    placeholder="Select Text Book…"
                    autocomplete="off"
                  />

                  <ul v-if="showDropdown && filteredBooks.length" class="mf-dropdown-list">
                    <li
                      v-for="s in filteredBooks"
                      :key="s"
                      @mousedown.prevent="selectBook(s)"
                    >
                      {{ s }}
                    </li>
                  </ul>
                </div>
                
                <div class="mf-group" style="position: relative;">
                  <label class="mf-label">Subject (Optional)</label>
                  <input
                    type="text"
                    class="mf-input mf-select"
                    v-model="subjectSearchQuery"
                    :disabled="!streamEN"
                    @focus="showSubjectDropdownEN = true"
                    @input="showSubjectDropdownEN = true"
                    @blur="closeSubjectDropdownDelayedEN"
                    :placeholder="streamEN ? 'Select subject…' : 'Select stream first'"
                    autocomplete="off"
                  />
                  <ul v-if="showSubjectDropdownEN && filteredSubjectsList.length" class="mf-dropdown-list">
                    <li v-for="s in filteredSubjectsList" :key="s.en" @mousedown.prevent="selectSubject(s)">
                      {{ s.en }}
                    </li>
                  </ul>
                </div>

                <div class="mf-group" style="position: relative;">
                  <label class="mf-label">Chapter (Optional)</label>
                  <input
                    type="text"
                    class="mf-input mf-select"
                    v-model="chapterSearchQuery"
                    :disabled="!subjectEN"
                    @focus="showChapterDropdownEN = true"
                    @input="showChapterDropdownEN = true"
                    @blur="closeChapterDropdownDelayedEN"
                    :placeholder="subjectEN ? 'Select chapter…' : 'Select subject first'"
                    autocomplete="off"
                  />
                  <ul v-if="showChapterDropdownEN && filteredChaptersList.length" class="mf-dropdown-list">
                    <li v-for="c in filteredChaptersList" :key="c.en" @mousedown.prevent="selectChapter(c)">
                      {{ c.en }}
                    </li>
                  </ul>
                </div>

                <div class="mf-group" style="position: relative;">
                  <label class="mf-label">Subject BN (Optional)</label>
                  <input
                    type="text"
                    class="mf-input mf-select"
                    v-model="subjectSearchQueryBN"
                    :disabled="!streamEN"
                    @focus="showSubjectDropdownBN = true"
                    @input="showSubjectDropdownBN = true"
                    @blur="closeSubjectDropdownDelayedBN"
                    :placeholder="streamEN ? 'Select subject…' : 'Select stream first'"
                    autocomplete="off"
                  />
                  <ul v-if="showSubjectDropdownBN && filteredSubjectsListBN.length" class="mf-dropdown-list">
                    <li v-for="s in filteredSubjectsListBN" :key="s.bn" @mousedown.prevent="selectSubject(s)">
                      {{ s.bn }}
                    </li>
                  </ul>
                </div>

                <div class="mf-group" style="position: relative;">
                  <label class="mf-label">Chapter BN (Optional)</label>
                  <input
                    type="text"
                    class="mf-input mf-select"
                    v-model="chapterSearchQueryBN"
                    :disabled="!subjectEN"
                    @focus="showChapterDropdownBN = true"
                    @input="showChapterDropdownBN = true"
                    @blur="closeChapterDropdownDelayedBN"
                    :placeholder="subjectEN ? 'Select chapter…' : 'Select subject first'"
                    autocomplete="off"
                  />
                  <ul v-if="showChapterDropdownBN && filteredChaptersListBN.length" class="mf-dropdown-list">
                    <li v-for="c in filteredChaptersListBN" :key="c.bn" @mousedown.prevent="selectChapter(c)">
                      {{ c.bn }}
                    </li>
                  </ul>
                </div>
                <div class="mf-group" style="justify-content:flex-end; padding-top:18px;">
                  <span v-if="bulkRedDotDetected" class="bulk-mode-badge red-dot-badge">🔴 Red-dot mode</span>
                  <span v-else-if="bulkResults.length" class="bulk-mode-badge">All questions mode</span>
                </div>
              </div>

              <!-- Upload zone -->
              <div
                class="img-drop-zone bulk-drop-zone"
                :class="{ 'has-file': bulkImgPreview }"
                @click="$refs.bulkImgInput.click()"
                @dragover.prevent
                @drop.prevent="e => { const f = e.dataTransfer.files[0]; if(f){ bulkImgFile = f; bulkImgPreview = URL.createObjectURL(f); bulkError = ''; bulkResults = [] } }"
              >
                <img v-if="bulkImgPreview" :src="bulkImgPreview" class="img-preview bulk-img-preview" />
                <div v-else class="img-drop-hint">
                  <span class="img-drop-icon">📄</span>
                  <span>Click or drag &amp; drop a question sheet image</span>
                  <span class="mono dim" style="font-size:0.62rem">Up to 30 questions parsed · Red dots respected</span>
                </div>
                <input ref="bulkImgInput" type="file" accept="image/*" style="display:none" @change="onBulkFileChange" />
              </div>

              <div v-if="bulkError" class="img-error">⚠ {{ bulkError }}</div>

              <!-- Parse button -->
              <div class="img-extract-actions">
                <button
                  class="iso-btn iso-btn--fill img-extract-btn"
                  :disabled="!bulkImgFile || bulkParsing || !streamEN"
                  @click="parseBulk"
                >
                  <span v-if="bulkParsing" class="img-spinner">◌</span>
                  {{ bulkParsing ? 'Analyzing image…' : !streamEN ? 'Select a stream first' : '⚡ Parse Questions' }}
                </button>
                <button v-if="bulkImgFile" class="iso-btn iso-btn--ghost" @click="resetBulk" style="font-size:0.72rem">Clear</button>
              </div>

              <!-- ── Review table ─────────────────────────── -->
              <div v-if="bulkResults.length" class="bulk-review">

                <div class="bulk-review-header">
                  <span class="bulk-review-title">
                    REVIEW — {{ bulkResults.length }} QUESTION{{ bulkResults.length > 1 ? 'S' : '' }} FOUND
                    <span v-if="bulkRedDotDetected" style="color:rgba(255,100,100,0.8)"> · 🔴 Red-dot filtered</span>
                  </span>
                  <div class="bulk-review-controls">
                    <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem; padding:4px 10px" @click="toggleBulkAll(true)">Select All</button>
                    <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem; padding:4px 10px" @click="toggleBulkAll(false)">Deselect All</button>
                  </div>
                </div>

                <div class="bulk-table">
                  <!-- Header row -->
                  <div class="bulk-table-head">
                    <span class="btc-check"></span>
                    <span class="btc-num">#</span>
                    <span class="btc-flags"></span>
                    <span class="btc-q">Question (English)</span>
                    <span class="btc-meta">Subject / Chapter</span>
                    <span class="btc-ans">Ans</span>
                    <span class="btc-diff">Diff</span>
                    <span class="btc-expand"></span>
                  </div>

                  <!-- Data rows -->
                  <div
                    v-for="(q, i) in bulkResults"
                    :key="i"
                    class="bulk-row"
                    :class="{ 'bulk-row--unchecked': !bulkSelected[i], 'bulk-row--expanded': bulkExpanded[i] }"
                  >
                    <!-- Main row -->
                    <div class="bulk-row-main">
                      <span class="btc-check">
                        <input type="checkbox" v-model="bulkSelected[i]" class="bulk-checkbox" />
                      </span>
                      <span class="btc-num">
                        {{ i + 1 }}
                        <span v-if="q.redDot" class="reddot-badge" title="Red dot marked">🔴</span>
                      </span>
                      <span class="btc-flags">
                        <span v-if="q.lowConfidence" class="flag-badge flag-warn" title="Low confidence — review carefully">⚠</span>
                        <span v-if="q.isDuplicate"   class="flag-badge flag-dup"  title="Already exists in database">DUP</span>
                      </span>
                      <span class="btc-q bulk-q-text" v-html="renderLatexText(q.questionEN)"/>
                      <span class="btc-meta bulk-meta-text">
                        <span class="bulk-subject">{{ q.subjectEN || '—' }}</span>
                        <span class="bulk-chapter">{{ q.chapterEN || '—' }}</span>
                      </span>
                      <span class="btc-ans">
                        <span class="bulk-answer-badge">{{ q.answerEN }}</span>
                      </span>
                      <span class="btc-diff">
                        <span class="bulk-diff-badge" :class="'diff-' + (q.difficulty || 'medium').toLowerCase()">{{ q.difficulty }}</span>
                      </span>
                      <span class="btc-expand">
                        <button class="bulk-expand-btn" @click="bulkExpanded[i] = !bulkExpanded[i]">
                          {{ bulkExpanded[i] ? '▲' : '▼' }}
                        </button>
                      </span>
                    </div>

                    <!-- Expanded detail -->
                    <div v-if="bulkExpanded[i]" class="bulk-row-detail">
                      <div v-if="q.stimulusBN || q.stimulusEN" class="brd-section brd-stimulus">
                        <span class="brd-label">
                          STIMULUS
                          <span class="stimulus-link-badge">🔗 linked</span>
                        </span>
                      
                        <!-- Stimulus image — above text -->
                        <div v-if="q.hasStimulusImage" class="stimulus-img-wrap">
                          <img
                            v-if="q.stimulusImagePreview || q.stimulusImageUrl"
                            :src="q.stimulusImagePreview || q.stimulusImageUrl"
                            class="brd-qimg"
                          />
                          <button
                            class="iso-btn iso-btn--ghost"
                            style="font-size:0.68rem; margin-top:6px; width:fit-content"
                            @click="openCropper(bulkImgFile, i, true)"
                          >
                            {{ q.stimulusImageUrl ? '✎ Re-crop stimulus' : '✂ Crop stimulus image' }}
                          </button>
                          <span v-if="q.stimulusImageUrl" class="stimulus-auto-filled">
                            ✓ auto-filled on linked questions
                          </span>
                        </div>
                      
                        <span v-if="q.stimulusEN" v-html="renderLatexText(q.stimulusEN)" class="brd-text bn-text"/>
                        <span v-if="q.stimulusBN" v-html="renderLatexText(q.stimulusBN)" class="brd-text" style="opacity:0.7; font-size:0.72rem"/>
                      </div>
                      <div class="brd-section">
                        <span class="brd-label">English Question</span>
                        <span class="brd-text" v-html="renderLatexText(q.questionEN) || '—'" /><span class="brd-text" v-html="'(' + renderLatexText(q.questionBN) + ')'" style="font-size:0.7rem; opacity:0.7" />
                      </div>
                      <div class="brd-section">
                        <span v-if="q.hasQuestionImage" class="brd-label">QUESTION IMAGE</span>
                        <img v-if="q.questionImagePreview || q.questionImageUrl" :src="q.questionImagePreview || q.questionImageUrl" class="brd-qimg" />
                        <button
                          v-if="q.hasQuestionImage"
                          class="iso-btn iso-btn--ghost"
                          style="font-size:0.68rem; margin-top:6px; width:fit-content"
                          @click="openCropper(bulkImgFile, i)"
                        >
                          {{ q.questionImageUrl ? '✎ Re-crop' : '✂ Crop image' }}
                        </button>
                      </div>
                      <div class="brd-section">
                        <span class="brd-label">Options</span>
                        <div class="brd-options">
                          <span v-for="(opt, oi) in ['A','B','C','D']" :key="oi" class="brd-option" :class="{ 'brd-option--correct': q.answerEN === opt }">
                            <b>{{ opt }}.</b> <span v-html="renderLatexText(q.optionsEN[oi]) || '—'" />
                            <span v-if="q.optionsBN[oi]" class="brd-option-bn bn-text" v-html="'  /  ' + '(' + renderLatexText(q.optionsBN[oi]) + ')'" />
                          </span>
                        </div>
                      </div>
                      <div v-if="q.explanationEN || q.explanationBN" class="brd-section">
                        <span class="brd-label">Explanation</span>
                        <span v-if="q.explanationEN" class="brd-text" v-html="renderLatexText(q.explanationEN)" /> <span v-if="q.explanationBN" class="brd-text" style="font-size:0.7rem; opacity:0.7" v-html="'(' + renderLatexText(q.explanationBN) + ')'" />
                      </div>
                      <div class="brd-section brd-meta-row">
                        <span v-if="q.years?.length"><b>Year:</b> {{ q.years.join(' · ') }}</span>
                        <span v-if="q.sourceEN?.length">
                          <b>Source: </b>
                          <span v-for="(s, si) in q.sourceEN" :key="si" class="bn-text">{{ s }}{{ si < q.sourceEN.length - 1 ? ' · ' : '' }}</span>
                        </span>
                        <span v-if="q.sourceBN?.length" style="font-size:0.65rem; opacity:0.7">
                          ({{ q.sourceBN.join(' · ') }})
                        </span>
                        <span v-if="q.subjectEN" class="bn-text"><b>Subject:</b> {{ q.subjectEN }} <span v-if="q.subjectBN" style="font-size:0.65rem; opacity:0.7">({{ q.subjectBN }})</span></span>
                        <span v-if="q.chapterEN" class="bn-text"><b>Chapter:</b> {{ q.chapterEN }} <span v-if="q.chapterBN" style="font-size:0.65rem; opacity:0.7">({{ q.chapterBN }})</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Save bar -->
                <div class="bulk-save-bar">
                  <span class="bulk-save-info">{{ bulkSelectedCount }} of {{ bulkResults.length }} selected</span>
                  <button
                    class="iso-btn iso-btn--fill"
                    :disabled="!bulkSelectedCount || bulkSaving"
                    @click="saveBulk"
                  >
                    <span v-if="bulkSaving" class="img-spinner">◌</span>
                    {{ bulkSaving ? 'Saving…' : `Save Selected (${bulkSelectedCount})` }}
                  </button>
                </div>

              </div>
              <!-- ── / Review table ───────────────────────── -->

            </div>
            <div v-if="addQuestionTab === 'bulk' && modal.type === 'addQuestion' && !bulkResults.length" class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="closeModal()">Cancel</button>
            </div>
          </template>

          <!-- Announcement -->
          <template v-if="modal.type === 'announcement'">
            <div class="modal-head">
              <span class="panel-title">NEW ANNOUNCEMENT</span>
              <button class="modal-close" @click="closeModal()">×</button>
            </div>
            <div class="modal-form">
              <div class="mf-group">
                <label class="mf-label">TITLE</label>
                <input class="mf-input" v-model="newAnnTitle" placeholder="Announcement title…" />
              </div>
              <div class="mf-group">
                <label class="mf-label">BODY</label>
                <textarea class="mf-input mf-textarea" rows="4" placeholder="Announcement body text…"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="closeModal()">Cancel</button>
              <button class="iso-btn iso-btn--fill" @click="addAnnouncement(); closeModal()">Save as Draft</button>
            </div>
          </template>

        </div>
      </div>
    </Teleport>

    <!-- Admin Reject Queue Question Modal -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modal.show && modal.type==='adminRejectQ'" @click.self="closeModal()">
        <div class="modal-box">
          <div class="modal-head">
            <span class="panel-title">REJECT QUESTION</span>
            <button class="modal-close" @click="closeModal()">×</button>
          </div>
          <div class="modal-form">
            <div class="mf-group">
              <label class="mf-label">QUESTION</label>
              <span style="font-size:0.82rem;color:var(--white);line-height:1.4">{{ modal.data?.text }}</span>
            </div>
            <div class="mf-group">
              <label class="mf-label">REJECTION REASON (sent to moderator)</label>
              <textarea v-model="rejectNote" class="mf-input mf-textarea" rows="3" placeholder="E.g. Answer key is incorrect, duplicate, out of scope…"></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="iso-btn iso-btn--ghost" @click="closeModal()">Cancel</button>
            <button class="iso-btn iso-btn--fill"  @click="adminRejectQ(modal.data); closeModal()">Confirm Reject</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Toast ─────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="toast-slide">
        <div class="admin-toast" :class="toast.type" v-if="toast.show">{{ toast.msg }}</div>
      </Transition>
    </Teleport>

  </div>

  <!-- ── Cropper modal ─────────────────────────────────────── -->
  <div v-if="cropperOpen" class="cropper-overlay">
    <div class="cropper-modal">
      <div class="cropper-head">
        <span class="panel-title">{{ cropperForStimulus ? 'CROP STIMULUS IMAGE' : 'CROP QUESTION IMAGE' }}</span>
        <button class="modal-close" @click="closeCropper">×</button>
      </div>
      <div class="cropper-body">
        <img
          id="cropper-img"
          :src="cropperImgSrc"
          style="max-width:100%; display:block"
        />
      </div>
      <div class="modal-actions">
        <button class="iso-btn iso-btn--ghost" @click="closeCropper">Cancel</button>
        <button
          class="iso-btn iso-btn--fill"
          :disabled="questionImageUploading"
          @click="confirmCrop"
        >
          <span v-if="questionImageUploading" class="img-spinner">◌</span>
          {{ questionImageUploading ? 'Uploading…' : 'Confirm Crop' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   SHELL & LAYOUT
   AdminSidebar is now position:sticky, so shell is plain flexbox.
   admin-main just needs flex:1 and overflow control.
═══════════════════════════════════════════════════════════════ */
.admin-shell {
  display: flex;
  min-height: 100vh;
  align-items: flex-start;
}

.admin-main {
  flex: 1;
  min-width: 0;          /* critical — prevents flex child overflow */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Mobile backdrop */
.mobile-backdrop {
  display: none;
  position: fixed; inset: 0; z-index: 199;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(2px);
}
@media (max-width: 768px) {
  .mobile-backdrop { display: block; }
}

/* ── Tab body ─────────────────────────────────────────────────── */
.tab-body {
  padding: 24px 28px;
  display: flex; flex-direction: column; gap: 20px;
  min-width: 0;
}

/* ── Panels ───────────────────────────────────────────────────── */
.panel {
  background: rgba(240,240,234,0.02);
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-bottom: 1px solid var(--border);
}
.panel-title {
  font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.16em;
  color: var(--white); opacity: 0.7;
}

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER  (matches leaderboard.vue exactly)
═══════════════════════════════════════════════════════════════ */
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 2rem; padding: 2rem;
  border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.page-header::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.055) 1px, transparent 1px);
  background-size: 24px 24px; pointer-events: none;
}
.header-left  { position: relative; flex: 1; min-width: 0; }
.header-right { position: relative; flex-shrink: 0; }

.page-chip {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border-bright);
  padding: 5px 12px; margin-bottom: 0.9rem;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--white); animation: blink 2s infinite;
}
@keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0.2 } }

.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.3rem, 2.5vw, 2rem);
  font-weight: 700; letter-spacing: -1px;
  color: var(--white); line-height: 1.1; margin-bottom: 0.5rem;
}
.page-sub { font-size: 0.83rem; color: var(--gray); max-width: 440px; }

.header-stat-card {
  display: flex; flex-direction: column; gap: 5px;
  padding: 1.4rem 1.8rem;
  border: 1px solid var(--border-bright); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06);
  min-width: 200px;
}
.hsc-label {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}
.hsc-value {
  font-family: var(--font-mono); font-size: 2rem; font-weight: 700;
  color: var(--white); letter-spacing: -1.5px; line-height: 1;
}
.hsc-value--warn  { color: rgba(255,200,80,0.9); }
.hsc-value--error { color: rgba(255,100,100,0.9); }
.hsc-row  { display: flex; align-items: center; gap: 7px; }
.hsc-meta { font-size: 0.7rem; color: var(--gray); }
.hsc-bar-wrap { height: 2px; background: var(--border); margin-top: 6px; }
.hsc-bar-fill { height: 100%; background: rgba(240,240,234,0.4); transition: width 0.6s ease; }
.hsc-bar--warn { background: rgba(255,200,80,0.6); }
.h-dot-inline {
  width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
  animation: blink 2s infinite;
}
.h-dot-inline.healthy { background: rgba(120,230,120,0.9); box-shadow: 0 0 5px rgba(120,230,120,0.5); }
.h-dot-inline.warn    { background: rgba(255,200,80,0.9);  box-shadow: 0 0 5px rgba(255,200,80,0.5);  animation: none; }
.h-dot-inline.error   { background: rgba(255,100,100,0.9); box-shadow: 0 0 5px rgba(255,100,100,0.5); animation: none; }

/* ═══════════════════════════════════════════════════════════════
   OVERVIEW GRIDS
═══════════════════════════════════════════════════════════════ */
.ov-row        { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
.ov-bottom-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

.activity-chart { padding: 16px 18px; }
.ac-bars { display: flex; align-items: flex-end; gap: 4px; height: 90px; }
.ac-bar  { flex: 1; display: flex; align-items: flex-end; min-height: 4px; }
.ac-bar-inner {
  width: 100%; height: 100%;
  background: rgba(240,240,234,0.15); border-top: 1px solid rgba(240,240,234,0.4);
  transition: background 0.2s;
}
.ac-bar:hover .ac-bar-inner { background: rgba(240,240,234,0.3); }
.ac-labels { display: flex; gap: 4px; margin-top: 6px; }
.ac-labels span { flex:1; font-family: var(--font-mono); font-size: 0.52rem; color: var(--gray); text-align: center; }

.stream-bars { padding: 14px 18px; display: flex; flex-direction: column; gap: 10px; }
.sbar-row  { display: flex; align-items: center; gap: 10px; }
.sbar-name { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); width: 52px; flex-shrink: 0; }
.sbar-track { flex: 1; height: 4px; background: rgba(240,240,234,0.07); min-width: 0; }
.sbar-fill  { height: 100%; background: rgba(240,240,234,0.35); transition: width 0.6s ease; }
.sbar-pct  { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); width: 30px; text-align: right; flex-shrink: 0; }

/* ═══════════════════════════════════════════════════════════════
   FILTER BAR
═══════════════════════════════════════════════════════════════ */
.filter-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; flex-wrap: wrap;
  background: rgba(240,240,234,0.02); border: 1px solid var(--border);
}
.fb-search {
  display: flex; align-items: center;
  border: 1px solid var(--border); background: rgba(240,240,234,0.03);
  padding: 0 10px; gap: 6px; flex: 1; min-width: 140px;
}
.fb-icon  { font-size: 1rem; color: var(--gray); flex-shrink: 0; }
.fb-input {
  background: none; border: none; outline: none;
  color: var(--white); font-family: var(--font-sans); font-size: 0.8rem;
  padding: 8px 0; flex: 1; min-width: 0;
}
.fb-input::placeholder { color: var(--gray); }
.fb-clear { background: none; border: none; color: var(--gray); cursor: pointer; font-size: 1rem; padding: 0; }
.fb-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.pill {
  padding: 5px 10px; font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.08em; background: none; border: 1px solid var(--border);
  color: var(--gray); cursor: pointer; text-transform: uppercase; transition: all 0.15s;
  white-space: nowrap;
}
.pill:hover  { border-color: var(--border-bright); color: var(--white); }
.pill.active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.06); }
.pill.diff-easy { color: rgba(120,230,120,0.7); border-color: rgba(120,230,120,0.2); }
.pill.diff-mid  { color: rgba(255,200,80,0.7);  border-color: rgba(255,200,80,0.2); }
.pill.diff-hard { color: rgba(255,100,100,0.7); border-color: rgba(255,100,100,0.2); }
.pill.diff-easy.active { background: rgba(120,230,120,0.08); }
.pill.diff-mid.active  { background: rgba(255,200,80,0.08); }
.pill.diff-hard.active { background: rgba(255,100,100,0.08); }
.fb-select {
  background: rgba(240,240,234,0.03); border: 1px solid var(--border);
  color: var(--white); font-family: var(--font-mono); font-size: 0.65rem;
  padding: 6px 10px; outline: none; cursor: pointer;
}
.fb-meta { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); white-space: nowrap; }
.add-btn { font-size: 0.7rem !important; padding: 7px 14px !important; white-space: nowrap; }

/* ═══════════════════════════════════════════════════════════════
   DATA TABLES  — overflow-x scroll on the wrapper, not fixed cols
═══════════════════════════════════════════════════════════════ */
.table-panel { overflow: hidden; }
.table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.data-table { width: 100%; min-width: 600px; }

.dt-head {
  display: grid; padding: 10px 16px; border-bottom: 1px solid var(--border);
  background: rgba(240,240,234,0.03);
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em;
  color: var(--gray); text-transform: uppercase; gap: 10px; align-items: center;
}
.users-table    .dt-head { grid-template-columns: 2fr 70px 50px 65px 85px 75px 55px 85px; }
.questions-table .dt-head { grid-template-columns: 30px 3fr 65px 75px 75px 85px 55px 85px; }
.results-table   .dt-head { grid-template-columns: 1.5fr 65px 65px 105px 55px 85px 75px; }

.dt-row {
  display: grid; padding: 10px 16px; gap: 10px; align-items: center;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.15s;
  border-left: 2px solid transparent;
}
.dt-row:hover { background: rgba(240,240,234,0.03); border-left-color: var(--border-bright); }
.users-table    .dt-row { grid-template-columns: 2fr 70px 50px 65px 85px 75px 55px 85px; }
.questions-table .dt-row { grid-template-columns: 30px 3fr 65px 75px 75px 85px 55px 85px; cursor: default; }
.results-table   .dt-row { grid-template-columns: 1.5fr 65px 65px 105px 55px 85px 75px; cursor: default; }

.dt-footer { padding: 10px 16px; font-size: 0.62rem; color: var(--gray); border-top: 1px solid var(--border); font-family: var(--font-mono); }

.dt-user { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dt-avatar {
  width: 28px; height: 28px; border: 1px solid var(--border); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.58rem; color: var(--white);
  background: rgba(240,240,234,0.06);
}
.dt-user-info { display: flex; flex-direction: column; min-width: 0; }
.dt-name  { font-family: var(--font-sans); font-size: 0.78rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dt-email { font-family: var(--font-mono); font-size: 0.58rem; color: var(--gray); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.mono { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); }
.dim  { color: var(--gray) !important; }

.stream-tag {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: var(--gray); border: 1px solid var(--border); padding: 2px 6px;
  text-transform: uppercase; white-space: nowrap;
  overflow: hidden;        /* 2. Hides the overflowing text */
  text-overflow: ellipsis;
}
.score-val { font-family: var(--font-mono); font-size: 0.76rem; white-space: nowrap; }
.score-val.high { color: rgba(120,230,120,0.9); }
.score-val.mid  { color: rgba(255,200,80,0.85); }
.score-val.low  { color: rgba(255,100,100,0.85); }

.status-badge {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  padding: 2px 7px; text-transform: uppercase; border: 1px solid; white-space: nowrap;
}
.status-badge.active    { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.07); }
.status-badge.banned    { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.07); }
.status-badge.unverified{ color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.07); }
.status-badge.published { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.07); }
.status-badge.draft     { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.07); }
.status-badge.flagged   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.07); }
.status-badge.passed    { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.07); }
.status-badge.failed    { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.07); }
.status-badge.live      { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.07); }

.role-badge { font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px; text-transform: uppercase; border: 1px solid; white-space: nowrap; }
.role-badge.admin { color: var(--white); border-color: var(--border-bright); background: rgba(240,240,234,0.1); }
.role-badge.user  { color: var(--gray); border-color: var(--border); }

.diff-badge { font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px; border: 1px solid; white-space: nowrap; }
.diff-easy  { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.2); }
.diff-mid   { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.2); }
.diff-hard  { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.2); }

.q-text {
  font-family: var(--font-sans); font-size: 0.76rem; color: var(--white);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.reports-count { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.reports-count.has-reports { color: rgba(255,100,100,0.9); }

.dt-actions { display: flex; gap: 4px; align-items: center; }
.act-btn {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  background: none; border: 1px solid var(--border); cursor: pointer;
  font-size: 0.72rem; color: var(--gray); transition: all 0.15s; flex-shrink: 0;
}
.act-btn:hover       { border-color: var(--border-bright); color: var(--white); }
.act-btn.ban:hover   { border-color: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); }
.act-btn.unban:hover { border-color: rgba(120,230,120,0.5); color: rgba(120,230,120,0.9); }

.score-cell { display: flex; align-items: center; gap: 6px; min-width: 0; }
.score-bar-mini { flex: 1; height: 3px; background: rgba(240,240,234,0.07); min-width: 20px; }
.sbm-fill { height: 100%; transition: width 0.4s ease; }
.sbm-fill.high { background: rgba(120,230,120,0.6); }
.sbm-fill.mid  { background: rgba(255,200,80,0.6);  }
.sbm-fill.low  { background: rgba(255,100,100,0.6); }

.pagination { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-top: 1px solid var(--border); }
.pg-btn  { font-size: 0.68rem !important; padding: 6px 12px !important; }
.pg-info { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); }

/* ═══════════════════════════════════════════════════════════════
   CONTENT TAB
═══════════════════════════════════════════════════════════════ */
.content-layout  { display: grid; grid-template-columns: 1fr 260px; gap: 20px; }
.content-sidebar { display: flex; flex-direction: column; gap: 20px; }
.ann-form { display: flex; gap: 10px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
.ann-input { padding: 8px 12px; border: 1px solid var(--border); background: rgba(240,240,234,0.03); flex: 1; min-width: 0; color: var(--white); font-family: var(--font-sans); font-size: 0.8rem; outline: none; }
.ann-input::placeholder { color: var(--gray); }
.ann-list  { display: flex; flex-direction: column; }
.ann-item {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  padding: 11px 16px; border-bottom: 1px solid var(--border);
  border-left: 2px solid transparent; transition: all 0.15s;
}
.ann-item:hover { border-left-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.ann-info  { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
.ann-title-text { font-family: var(--font-sans); font-size: 0.8rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ann-date  { font-size: 0.63rem; font-family: var(--font-mono); color: var(--gray); }
.ann-controls { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
.cstat-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.cstat-row  { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.cstat-label{ font-family: var(--font-sans); font-size: 0.75rem; color: var(--gray); }
.cstat-val  { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); }
.pack-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; }
.pack-row  { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pack-info { display: flex; flex-direction: column; min-width: 0; flex: 1; }
.pack-name { font-family: var(--font-sans); font-size: 0.77rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ═══════════════════════════════════════════════════════════════
   SYSTEM TAB
═══════════════════════════════════════════════════════════════ */
.system-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
.sys-main      { display: flex; flex-direction: column; gap: 20px; }
.sys-sidebar   { display: flex; flex-direction: column; gap: 20px; }
.log-list-full { display: flex; flex-direction: column; max-height: 280px; overflow-y: auto; }
.log-list-full::-webkit-scrollbar { width: 3px; }
.log-list-full::-webkit-scrollbar-thumb { background: var(--border-bright); }
.log-row-full {
  display: grid; grid-template-columns: 68px 50px 1fr;
  gap: 10px; padding: 6px 16px; font-size: 0.65rem;
  font-family: var(--font-mono); border-left: 2px solid transparent;
}
.log-row-full.log-error { border-left-color: rgba(255,100,100,0.5); background: rgba(255,100,100,0.04); }
.log-row-full.log-warn  { border-left-color: rgba(255,200,80,0.5);  background: rgba(255,200,80,0.04); }
.log-time  { color: var(--gray); }
.log-level { letter-spacing: 0.1em; }
.log-row-full.log-info  .log-level { color: rgba(240,240,234,0.3); }
.log-row-full.log-warn  .log-level { color: rgba(255,200,80,0.8); }
.log-row-full.log-error .log-level { color: rgba(255,100,100,0.8); }
.log-msg-text { color: var(--white); opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sys-actions { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.sys-act-btn { font-size: 0.7rem !important; padding: 10px 14px !important; text-align: left !important; display: flex !important; align-items: center !important; gap: 8px !important; }

/* ═══════════════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(8,8,8,0.88);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
  padding: 16px;
}
.modal-box {
  background: var(--black); border: 1px solid var(--border-bright);
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.06);
  width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto;
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid var(--border);
}
.modal-close { background: none; border: none; color: var(--gray); font-size: 1.3rem; cursor: pointer; line-height: 1; padding: 0; transition: color 0.15s; }
.modal-close:hover { color: var(--white); }
.modal-user-hero { display: flex; align-items: center; gap: 14px; padding: 18px; border-bottom: 1px solid var(--border); }
.big-avatar { width: 44px; height: 44px; font-size: 0.8rem; }
.modal-user-info { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.modal-name  { font-family: var(--font-mono); font-size: 0.95rem; color: var(--white); }
.modal-email { font-size: 0.68rem; color: var(--gray); font-family: var(--font-mono); }
.modal-badges { display: flex; gap: 6px; flex-wrap: wrap; }
.modal-stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 1px; background: var(--border); }
.mstat { padding: 14px; background: var(--black); display: flex; flex-direction: column; align-items: center; gap: 4px; text-align: center; }
.mstat-val   { font-family: var(--font-mono); font-size: 0.95rem; color: var(--white); }
.mstat-label { font-family: var(--font-sans); font-size: 0.66rem; color: var(--gray); }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; padding: 14px 18px; border-top: 1px solid var(--border); }
.modal-form { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.mf-group { display: flex; flex-direction: column; gap: 5px; }
.mf-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mf-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.14em; color: var(--gray); }
.mf-input {
  width: 100%; box-sizing: border-box;
  background: rgba(240,240,234,0.03); border: 1px solid var(--border);
  color: var(--white); font-family: var(--font-sans); font-size: 0.8rem;
  padding: 8px 12px; outline: none; transition: border-color 0.15s;
}
.mf-input:focus { border-color: var(--border-bright); }
.mf-input::placeholder { color: var(--gray); }
.mf-textarea { resize: vertical; }
.mf-select   { cursor: pointer; }
.mf-select option { background-color: #232222; color: var(--white); }
.mt4 { margin-top: 4px; }

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
.admin-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 2000;
  padding: 12px 20px;
  font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em;
  background: var(--black); color: var(--white);
  border: 1px solid var(--border-bright);
  border-left: 3px solid rgba(120,230,120,0.8);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06);
}
.admin-toast.error { border-left-color: rgba(255,100,100,0.8); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.25s ease; }
.toast-slide-enter-from { transform: translateX(20px); opacity: 0; }
.toast-slide-leave-to   { transform: translateX(20px); opacity: 0; }

.queue-cards { display: flex; flex-direction: column; gap: 12px; }
.queue-card {
  border: 1px solid var(--border); background: rgba(240,240,234,0.02);
  padding: 16px 18px; transition: border-color 0.15s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.queue-card:hover  { border-color: var(--border-bright); }
.qcard-pending     { border-left: 2px solid rgba(255,200,80,0.5); }
.qcard-fixed       { border-left: 2px solid rgba(120,200,255,0.5); }
.qcard-approved    { border-left: 2px solid rgba(120,230,120,0.4); }
.qcard-rejected    { border-left: 2px solid rgba(255,100,100,0.3); opacity: 0.7; }
.qcard-top    { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
.qcard-meta   { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.qcard-text   { font-family: var(--font-sans); font-size: 0.9rem; color: var(--white); margin-bottom: 12px; line-height: 1.4; }
.qcard-footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
.qcard-by     { font-size: 0.68rem; }
.qcard-note   { font-size: 0.72rem; color: rgba(255,100,100,0.8); font-style: italic; }
.qcard-actions{ display: flex; gap: 8px; }
.qcard-done   { display: flex; align-items: center; }
.qact-btn     { font-size: 0.68rem !important; padding: 6px 14px !important; }
.approve-btn:hover { border-color: rgba(120,230,120,0.5) !important; color: rgba(120,230,120,0.9) !important; }
.reject-btn:hover  { border-color: rgba(255,100,100,0.5) !important; color: rgba(255,100,100,0.9) !important; }
.fixed-tag {
  font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px;
  border: 1px solid rgba(120,200,255,0.3); color: rgba(120,200,255,0.8); background: rgba(120,200,255,0.06);
}
.empty-panel {
  padding: 2rem; text-align: center; border: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.72rem; color: var(--gray);
}

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════════════════ */

/* ── Tablet ≤ 1024px ──────────────────────────────────────── */
@media (max-width: 1024px) {
  .tab-body        { padding: 20px; gap: 16px; }
  .ov-row          { grid-template-columns: 1fr; }
  .ov-bottom-row   { grid-template-columns: 1fr 1fr; }
  .system-layout   { grid-template-columns: 1fr; }
  .content-layout  { grid-template-columns: 1fr; }
  .page-header     { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
  .header-stat-card{ min-width: unset; width: 100%; box-sizing: border-box; }
}

/* ── Mobile ≤ 768px ───────────────────────────────────────── */
@media (max-width: 768px) {
  /* Main needs no left offset — sidebar is now a fixed overlay */
  .tab-body     { padding: 14px; gap: 14px; }
  .page-header  { padding: 1.2rem; }
  .page-title   { font-size: 1.3rem; }

  /* Overview */
  .ov-bottom-row { grid-template-columns: 1fr; }

  /* Filter bar — horizontal scroll, no wrap */
  .filter-bar {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    gap: 6px;
  }
  .filter-bar::-webkit-scrollbar { display: none; }
  .fb-pills { flex-wrap: nowrap; }

  /* Modal */
  .modal-overlay  { align-items: flex-end; padding: 0; }
  .modal-box      { max-width: 100%; max-height: 85vh; border-bottom: none; }
  .modal-stats-grid { grid-template-columns: 1fr 1fr; }
  .mf-row         { grid-template-columns: 1fr; }

  /* Announcements */
  .ann-form { flex-direction: column; }

  /* Content sidebar stacks under main */
  .content-layout { grid-template-columns: 1fr; }

  /* System sidebar stacks */
  .system-layout { grid-template-columns: 1fr; }
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE EXTRACTOR PANEL (inside addQuestion modal)
═══════════════════════════════════════════════════════════════ */
.img-extract-panel {
  border: 1px solid var(--border);
  background: rgba(240,240,234,0.02);
}
.img-extract-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: none; border: none; cursor: pointer;
  color: var(--white); font-family: var(--font-mono); font-size: 0.7rem;
  letter-spacing: 0.1em; text-align: left;
  transition: background 0.15s;
}
.img-extract-toggle:hover { background: rgba(240,240,234,0.04); }
.img-extract-icon  { font-size: 0.85rem; opacity: 0.7; }
.img-extract-chevron { margin-left: auto; transition: transform 0.2s; display: inline-block; }
.img-extract-chevron.open { transform: rotate(180deg); }

.img-extract-body {
  padding: 12px 14px; border-top: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 10px;
}
.img-drop-zone {
  border: 1px dashed var(--border-bright); cursor: pointer;
  min-height: 110px; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s; overflow: hidden;
  position: relative;
}
.img-drop-zone:hover { border-color: rgba(240,240,234,0.5); }
.img-drop-zone.has-file { min-height: unset; }
.img-drop-hint {
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  color: var(--gray); font-family: var(--font-sans); font-size: 0.74rem;
  padding: 18px;
}
.img-drop-icon { font-size: 1.6rem; }
.img-preview   { max-width: 100%; max-height: 220px; display: block; object-fit: contain; }

.img-error {
  font-family: var(--font-mono); font-size: 0.66rem; color: rgba(255,100,100,0.85);
  border: 1px solid rgba(255,100,100,0.25); padding: 6px 10px;
}
.img-extract-actions { display: flex; gap: 8px; align-items: center; }
.img-extract-btn     { font-size: 0.72rem !important; padding: 8px 16px !important; }
.img-spinner {
  display: inline-block; animation: spin 0.9s linear infinite;
  margin-right: 4px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Small mobile ≤ 480px ─────────────────────────────────── */
@media (max-width: 480px) {
  .tab-body    { padding: 10px; gap: 10px; }
  .page-header { padding: 1rem; }
  .page-title  { font-size: 1.15rem; }
  .page-chip   { font-size: 0.55rem; padding: 4px 10px; }
  .hsc-value   { font-size: 1.6rem; }
  .modal-stats-grid { grid-template-columns: 1fr 1fr; }
}

/* ═══════════════════════════════════════════════════════════════
   ADD QUESTION MODAL TABS
═══════════════════════════════════════════════════════════════ */
.aq-tabs {
  display: flex; border-bottom: 1px solid var(--border);
}
.aq-tab {
  flex: 1; padding: 10px 0;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--gray); font-family: var(--font-mono); font-size: 0.68rem;
  letter-spacing: 0.1em; cursor: pointer; transition: all 0.15s;
  margin-bottom: -1px;
}
.aq-tab:hover  { color: var(--white); }
.aq-tab.active { color: var(--white); border-bottom-color: var(--white); }

/* ═══════════════════════════════════════════════════════════════
   BULK IMPORT
═══════════════════════════════════════════════════════════════ */
.bulk-form { gap: 14px; }

.bulk-drop-zone  { min-height: 130px; }
.bulk-img-preview { max-height: 160px; }

.bulk-mode-badge {
  font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em;
  padding: 3px 9px; border: 1px solid var(--border-bright);
  color: var(--gray); align-self: center;
}
.red-dot-badge { border-color: rgba(255,100,100,0.4); color: rgba(255,140,140,0.9); }

/* Review table */
.bulk-review { display: flex; flex-direction: column; gap: 0; margin-top: 4px; }

.bulk-review-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 0; margin-bottom: 4px; gap: 8px; flex-wrap: wrap;
}
.bulk-review-title {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.12em; color: var(--gray);
}
.bulk-review-controls { display: flex; gap: 6px; }

.bulk-table { border: 1px solid var(--border); }

.bulk-table-head {
  display: grid;
  grid-template-columns: 28px 36px 40px 1fr 160px 36px 60px 28px;
  gap: 0; padding: 6px 10px;
  background: rgba(240,240,234,0.04);
  border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.1em; color: var(--gray);
  align-items: center;
}

.bulk-row { border-bottom: 1px solid var(--border); transition: background 0.1s; }
.bulk-row:last-child { border-bottom: none; }
.bulk-row:hover { background: rgba(240,240,234,0.02); }
.bulk-row--unchecked { opacity: 0.4; }

.bulk-row-main {
  display: grid;
  grid-template-columns: 28px 36px 40px 1fr 160px 36px 60px 28px;
  gap: 0; padding: 8px 10px; align-items: center;
}

.btc-check { display: flex; align-items: center; }
.bulk-checkbox { accent-color: var(--white); cursor: pointer; width: 13px; height: 13px; }

.btc-num {
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--gray); display: flex; align-items: center; gap: 3px;
}
.reddot-badge { font-size: 0.55rem; }

.btc-q {}
.bulk-q-text {
  font-family: var(--font-sans); font-size: 0.76rem; color: var(--white);
  line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

.btc-meta {}
.bulk-meta-text {
  display: flex; flex-direction: column; gap: 2px; padding: 0 6px;
}
.bulk-subject {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: var(--white); letter-spacing: 0.05em;
}
.bulk-chapter {
  font-family: var(--font-sans); font-size: 0.62rem;
  color: var(--gray); line-height: 1.2;
  display: -webkit-box; -webkit-line-clamp: 1;
  -webkit-box-orient: vertical; overflow: hidden;
}

.btc-ans { display: flex; align-items: center; justify-content: center; }
.bulk-answer-badge {
  font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600;
  width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border-bright); color: var(--white);
}

.btc-diff { display: flex; align-items: center; }
.bulk-diff-badge {
  font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px;
  border: 1px solid var(--border);
}
.bulk-diff-badge.diff-easy   { border-color: rgba(120,230,120,0.3); color: rgba(120,230,120,0.8); }
.bulk-diff-badge.diff-medium { border-color: rgba(255,200,80,0.3);  color: rgba(255,200,80,0.8);  }
.bulk-diff-badge.diff-hard   { border-color: rgba(255,100,100,0.3); color: rgba(255,100,100,0.8); }

.btc-expand { display: flex; align-items: center; justify-content: center; }
.bulk-expand-btn {
  background: none; border: none; color: var(--gray); cursor: pointer;
  font-size: 0.6rem; padding: 2px 4px; transition: color 0.15s;
}
.bulk-expand-btn:hover { color: var(--white); }

/* Expanded detail */
.bulk-row-detail {
  padding: 10px 12px 14px 74px;
  border-top: 1px solid var(--border);
  background: rgba(240,240,234,0.02);
  display: flex; flex-direction: column; gap: 10px;
}
.brd-section { display: flex; flex-direction: column; gap: 4px; }
.brd-label {
  font-family: var(--font-mono); font-size: 0.56rem;
  letter-spacing: 0.12em; color: var(--gray);
}
.brd-text {
  font-family: var(--font-sans); font-size: 0.78rem;
  color: var(--white); line-height: 1.4;
}
.brd-options { display: flex; flex-direction: column; gap: 4px; }
.brd-option {
  font-family: var(--font-sans); font-size: 0.74rem;
  color: var(--gray); line-height: 1.3;
}
.brd-option--correct { color: rgba(120,230,120,0.9); }
.brd-option-bn { opacity: 0.7; }
.brd-meta-row {
  flex-direction: row; flex-wrap: wrap; gap: 12px;
  font-family: var(--font-sans); font-size: 0.7rem; color: var(--gray);
}
.bn-text { font-family: 'Noto Sans Bengali', sans-serif; }

/* Save bar */
.bulk-save-bar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 0 0; gap: 10px;
}
.bulk-save-info {
  font-family: var(--font-mono); font-size: 0.66rem; color: var(--gray);
}

.btc-flags { display: flex; align-items: center; gap: 3px; }
.flag-badge {
  font-family: var(--font-mono); font-size: 0.55rem;
  padding: 1px 5px; border: 1px solid;
  line-height: 1.4; white-space: nowrap;
}
.flag-warn { border-color: rgba(255,200,80,0.4);  color: rgba(255,200,80,0.9);  }
.flag-dup  { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }
/* ═══════════════════════════════════════════════════════════════
   QUESTION IMAGE FIELD
═══════════════════════════════════════════════════════════════ */
.qimg-field {
  border: 1px solid var(--border); min-height: 60px;
  display: flex; align-items: center;
}
.qimg-uploading {
  padding: 14px 16px; font-family: var(--font-mono); font-size: 0.68rem;
  color: var(--gray); display: flex; align-items: center; gap: 8px;
}
.qimg-preview-wrap {
  display: flex; flex-direction: column; gap: 8px; padding: 10px; width: 100%;
}
.qimg-preview {
  max-width: 100%; max-height: 200px; object-fit: contain; display: block;
}
.qimg-actions {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
}
.qimg-status {
  font-family: var(--font-mono); font-size: 0.62rem; color: var(--gray);
  margin-right: auto;
}
.qimg-reupload-btn { font-size: 0.68rem !important; cursor: pointer; }
.qimg-empty {
  padding: 14px 16px; width: 100%;
}
.qimg-upload-label {
  font-family: var(--font-mono); font-size: 0.68rem; color: var(--gray);
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: color 0.15s;
}
.qimg-upload-label:hover { color: var(--white); }

/* Bulk review image thumbnail */
.brd-qimg {
  max-width: 100%; max-height: 160px; object-fit: contain;
  border: 1px solid var(--border);
}

/* ── Cropper modal ──────────────────────────────────────────── */
.cropper-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
}
.cropper-modal {
  background: var(--bg-panel); border: 1px solid var(--border);
  width: 100%; max-width: 780px;
  display: flex; flex-direction: column; max-height: 90vh;
}
.cropper-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; border-bottom: 1px solid var(--border);
}
.cropper-body {
  flex: 1; overflow: hidden; padding: 12px;
  background: #111;
}
.cropper-body img { max-height: 60vh; }

/* Stimulus badge */
.brd-stimulus {
  border-left: 2px solid rgba(120,180,255,0.4);
  padding-left: 10px;
  background: rgba(120,180,255,0.04);
  padding: 8px 10px;
}
.stimulus-link-badge {
  font-size: 0.58rem; opacity: 0.6;
  margin-left: 6px; letter-spacing: 0.05em;
}
.stimulus-img-wrap {
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px;
}
.stimulus-auto-filled {
  font-family: var(--font-mono); font-size: 0.58rem;
  color: rgba(120, 230, 120, 0.8); letter-spacing: 0.05em;
}

/* Submitter row */
.qcard-submitter {
  display: flex; align-items: center; gap: 8px; flex: 1;
}
.qcard-avatar {
  width: 24px; height: 24px; border-radius: 50%;
  object-fit: cover; border: 1px solid var(--border);
  flex-shrink: 0;
}
.qcard-avatar--fallback {
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(240,240,234,0.08);
  font-family: var(--font-mono); font-size: 0.65rem; color: var(--white);
}

/* Expanded detail panel */
.qcard-details {
  border-top: 1px solid var(--border);
  margin-top: 10px; padding-top: 12px;
  display: flex; flex-direction: column; gap: 12px;
}
.qd-section { display: flex; flex-direction: column; gap: 4px; }
.qd-label {
  font-family: var(--font-mono); font-size: 0.56rem;
  letter-spacing: 0.12em; color: var(--gray);
}
.qd-text {
  font-family: var(--font-sans); font-size: 0.8rem;
  color: var(--white); line-height: 1.5;
}
.qd-options { display: flex; flex-direction: column; gap: 4px; }
.qd-option {
  font-family: var(--font-sans); font-size: 0.76rem;
  color: var(--gray); display: flex; align-items: center; gap: 6px;
}
.qd-option--correct { color: rgba(120,230,120,0.9); }
.qd-opt-letter {
  font-family: var(--font-mono); font-size: 0.65rem;
  width: 16px; flex-shrink: 0;
}
.qd-img {
  max-width: 100%; max-height: 180px; object-fit: contain;
  border: 1px solid var(--border); margin-top: 4px;
}
.qd-meta-row {
  display: flex; flex-wrap: wrap; gap: 12px;
  font-family: var(--font-mono); font-size: 0.62rem; color: var(--gray);
}

.mf-dropdown-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 220px;
  overflow-y: auto;
  background: #2e2d2d;
  border: 1px solid #313030;
  border-radius: 6px;
  margin-top: 2px;
  list-style: none;
  padding: 0;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
}
.mf-dropdown-list li {
  padding: 8px 12px;
  cursor: pointer;
}
.mf-dropdown-list li:hover {
  background: #3f3e3e;
}

@media (max-width: 600px) {
  .bulk-table-head,
  .bulk-row-main {
    grid-template-columns: 24px 28px 32px 1fr 36px 50px 24px;
  }
  .btc-meta { display: none; }
  .bulk-row-detail { padding-left: 12px; }
}
</style>
