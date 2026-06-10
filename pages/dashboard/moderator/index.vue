<script setup>
definePageMeta({ middleware: 'auth', layout: 'admin' })
// Guard: profile.role must be 'moderator' or 'admin'
const { data: profile } = await useSupabaseClient().from('profiles').select('role').single()
if (profile?.role !== 'admin' || profile?.role !== 'moderator') navigateTo('/dashboard')

const supabase = useSupabaseClient()
const { data: { user } } = await supabase.auth.getUser()

import { ref, reactive, computed, watch, nextTick } from 'vue'
import { curriculum } from '~/utils/curriculum'
import { hashText } from '~/utils/hashQuestion'

const supabaseHSC     = useSupabaseHSC()
const supabaseMedical = useSupabaseMedical()

// ─── Bengali digit helper ─────────────────────────────────────
function toBengaliDigits(str) {
  const map = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' }
  return String(str).replace(/[0-9]/g, d => map[d] ?? d)
}

// ─── Sidebar & layout ─────────────────────────────────────────
const sidebarCollapsed = ref(
  typeof window !== 'undefined' && window.innerWidth <= 1024
)
const mobileDrawerOpen = ref(false)
const activeTab = ref('overview')

function handleTabChange(tab) {
  activeTab.value = tab
  mobileDrawerOpen.value = false
}

function handleTopBarAction(type) {
  if (type === 'viewreports')     { activeTab.value = 'reports'; mobileDrawerOpen.value = false }
  else if (type === 'viewqueue')  { activeTab.value = 'queue';   mobileDrawerOpen.value = false }
}

function handleAction(type) {
  if      (type === 'viewreports')     { activeTab.value = 'reports' }
  else if (type === 'viewqueue')       { activeTab.value = 'queue' }
  else if (type === 'viewusers')       { activeTab.value = 'users' }
  else if (type === 'viewdiscussions') { activeTab.value = 'discussions' }
  else if (type === 'viewactivity')    { activeTab.value = 'activity' }
  else if (type === 'escalate')        { showToast('Escalation sent to admin.') }
  else if (type === 'submitquestion')  { openModal('submitQuestion') }
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
function closeModal() { modal.type = null; modal.data = null; modal.show = false }

// ─── Mod action log ───────────────────────────────────────────
const modLog = ref([
  { id:1, type:'approve', title:'Approved question #112 (Physics)',      actor:'You',  time:'8m ago'  },
  { id:2, type:'reject',  title:'Rejected question #98 — wrong answer',  actor:'You',  time:'22m ago' },
  { id:3, type:'warn',    title:'Warned user: Nasrin Khatun',            actor:'You',  time:'1h ago'  },
  { id:4, type:'dismiss', title:'Dismissed report #34 — not a violation',actor:'You',  time:'2h ago'  },
  { id:5, type:'approve', title:'Approved question #77 (History)',       actor:'You',  time:'3h ago'  },
  { id:6, type:'flag',    title:'Flagged question #201 for admin review', actor:'You', time:'4h ago'  },
])
function logMod(type, title) {
  modLog.value.unshift({ id: Date.now(), type, title, actor: 'You', time: 'just now' })
}

// ─── Overview stats ───────────────────────────────────────────
const overviewStats = [
  { label:'Pending Reports',  value:'7',   delta:'+3 today',      up:false, percent:35,
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` },
  { label:'Review Queue',     value:'23',  delta:'-5 resolved',   up:true,  percent:23,
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>` },
  { label:'Warned Users',     value:'4',   delta:'+1 this week',  up:false, percent:12,
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>` },
  { label:'Resolved Today',   value:'18',  delta:'+18 today',     up:true,  percent:80,
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="17" height="17"><polyline points="20 6 9 17 4 12"/></svg>` },
]

// ─── REPORTS tab ─────────────────────────────────────────────
const reportFilter  = ref('all')  // all | open | resolved | dismissed
const reportSearch  = ref('')
const reportPage    = ref(1)
const reportsPerPage = 8

const reports = ref([
  { id:1,  type:'question', target:'Q#7 — "Who wrote Amar Sonar Bangla?"', reporter:'Tanvir Ahmed',   reason:'Wrong answer listed as correct', status:'open',      severity:'high',   date:'2025-05-09' },
  { id:2,  type:'question', target:'Q#34 — "Avogadro number value"',       reporter:'Farida Khanam',  reason:'Outdated information',           status:'open',      severity:'medium', date:'2025-05-09' },
  { id:3,  type:'user',     target:'Nasrin Khatun',                        reporter:'Sabbir Rahman',  reason:'Abusive comments in discussion', status:'open',      severity:'high',   date:'2025-05-08' },
  { id:4,  type:'question', target:'Q#102 — "Treaty of Westphalia year"',  reporter:'Maliha Sultana', reason:'Misleading explanation',         status:'open',      severity:'low',    date:'2025-05-08' },
  { id:5,  type:'user',     target:'Rafiq Islam',                          reporter:'Nusrat Jahan',   reason:'Spam in question comments',      status:'open',      severity:'medium', date:'2025-05-07' },
  { id:6,  type:'question', target:'Q#55 — "Valency of nitrogen"',         reporter:'Kamrul Islam',   reason:'Answer key is incorrect',        status:'resolved',  severity:'high',   date:'2025-05-07' },
  { id:7,  type:'question', target:'Q#88 — "Speed of light value"',        reporter:'Priya Roy',      reason:'Wrong unit in options',          status:'resolved',  severity:'medium', date:'2025-05-06' },
  { id:8,  type:'user',     target:'Alamin Hossain',                       reporter:'Touhid Bhuiyan', reason:'Suspected account sharing',      status:'dismissed', severity:'low',    date:'2025-05-06' },
  { id:9,  type:'question', target:'Q#201 — "Bangladesh capital city"',    reporter:'Rima Begum',     reason:'Duplicate question',             status:'open',      severity:'low',    date:'2025-05-05' },
  { id:10, type:'user',     target:'Jahid Hasan',                          reporter:'Sadia Akter',    reason:'Using offensive username',       status:'open',      severity:'medium', date:'2025-05-05' },
])

const filteredReports = computed(() => {
  let list = reports.value
  if (reportFilter.value !== 'all') list = list.filter(r => r.status === reportFilter.value)
  if (reportSearch.value) {
    const q = reportSearch.value.toLowerCase()
    list = list.filter(r => r.target.toLowerCase().includes(q) || r.reason.toLowerCase().includes(q))
  }
  return list
})
const paginatedReports = computed(() => {
  const s = (reportPage.value - 1) * reportsPerPage
  return filteredReports.value.slice(s, s + reportsPerPage)
})
const totalReportPages = computed(() => Math.ceil(filteredReports.value.length / reportsPerPage))

function resolveReport(r) {
  r.status = 'resolved'
  logMod('approve', `Resolved report #${r.id} — ${r.target}`)
  showToast('Report resolved.')
}
function dismissReport(r) {
  r.status = 'dismissed'
  logMod('dismiss', `Dismissed report #${r.id} — not a violation`)
  showToast('Report dismissed.')
}
function escalateReport(r) {
  logMod('flag', `Escalated report #${r.id} to admin`)
  showToast('Escalated to admin.')
}

// ─── My Submission Queue (read-only — admin reviews these) ──────
const myQueueFilter = ref('all')  // all | pending | approved | rejected
const myQueueSearch = ref('')

//const myQueue = ref([
//  { id:101, text:'What is the Krebs cycle?',                    stream:'Medical', subject:'Biology',   diff:'Medium', date:'2025-05-09', status:'pending',  adminNote:'' },
//  { id:102, text:'Solve for x: 3x² + 5x - 2 = 0',             stream:'BUET',    subject:'Math',      diff:'Hard',   date:'2025-05-09', status:'pending',  adminNote:'' },
//  { id:103, text:'Who was the first President of Bangladesh?',  stream:'BCS',     subject:'History',   diff:'Easy',   date:'2025-05-08', status:'approved', adminNote:'' },
//  { id:104, text:'What does RAM stand for?',                    stream:'SSC',     subject:'ICT',       diff:'Easy',   date:'2025-05-07', status:'rejected', adminNote:'Too basic — already covered in Q#44' },
//  { id:105, text:"Define Newton's third law of motion",         stream:'HSC',     subject:'Physics',   diff:'Medium', date:'2025-05-07', status:'pending',  adminNote:'' },
//  { id:106, text:'Find derivative of sin²(x)',                  stream:'DU',      subject:'Math',      diff:'Medium', date:'2025-05-06', status:'pending',  adminNote:'' },
//  { id:107, text:'What is the atomic number of gold?',          stream:'HSC',     subject:'Chemistry', diff:'Easy',   date:'2025-05-06', status:'approved', adminNote:'' },
//  { id:108, text:'Binary search time complexity?',              stream:'BUET',    subject:'CS',        diff:'Medium', date:'2025-05-05', status:'approved', adminNote:'' },
//  { id:109, text:'What is photosynthesis?',                     stream:'SSC',     subject:'Biology',   diff:'Easy',   date:'2025-05-04', status:'pending',  adminNote:'' },
//  { id:110, text:'Who wrote "Gitanjali"?',                      stream:'BCS',     subject:'Bangla',    diff:'Easy',   date:'2025-05-03', status:'rejected', adminNote:'Duplicate of Q#12 — already in bank' },
//])

const myQueue      = ref([])
const myQueueLoading = ref(false)

async function loadMyQueue() {
  myQueueLoading.value = true
  const supabase = useSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { myQueueLoading.value = false; return }

  const [hscRes, medRes] = await Promise.all([
    supabaseHSC.from('question_submissions')
      .select('*')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false }),
    supabaseMedical.from('question_submissions')
      .select('*')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false }),
  ])

  const rows = [...(hscRes.data ?? []), ...(medRes.data ?? [])]
  myQueue.value = rows.map(r => ({
    ...r,
    id:        r.id,
    stream:    r.stream,
    text:      r.question?.english || r.question?.bangla || '',
    subj:      r.subject?.english  || '',
    diff:      r.difficulty?.english || r.difficulty_level || '',
    adminNote: r.admin_note ?? '',
    status:    r.status,
    date:      r.created_at?.slice(0, 10) ?? '',
  }))
  myQueueLoading.value = false
}

loadMyQueue()

const filteredMyQueue = computed(() => {
  let list = myQueue.value
  if (myQueueFilter.value !== 'all') list = list.filter(q => q.status === myQueueFilter.value)
  if (myQueueSearch.value) {
    const s = myQueueSearch.value.toLowerCase()
    list = list.filter(q => q.text.toLowerCase().includes(s) || q.subj.toLowerCase().includes(s))
  }
  //return list
  return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
})

const myQueueStats = computed(() => ({
  pending:  myQueue.value.filter(q => q.status === 'pending').length,
  approved: myQueue.value.filter(q => q.status === 'approved').length,
  rejected: myQueue.value.filter(q => q.status === 'rejected').length,
}))

// ─── Fix reported question & publish directly (no admin review) ──
const fixedQ = reactive({
  text: '', optA: '', optB: '', optC: '', optD: '',
  answer: 'A', explanation: ''
})

function openFixModal(report) {
  Object.assign(fixedQ, { text:'', optA:'', optB:'', optC:'', optD:'', answer:'A', explanation:'' })
  openModal('fixQuestion', report)
}

function fixAndPublish() {
  if (!fixedQ.text.trim() || !fixedQ.optA.trim() || !fixedQ.optB.trim()) {
    showToast('Question text and at least options A & B are required.', 'error')
    return
  }
  const r = modal.data
  if (r) { r.status = 'resolved'; logMod('approve', `Fixed & published ${r.target}`) }
  showToast('Question fixed and published directly.')
  Object.assign(fixedQ, { text:'', optA:'', optB:'', optC:'', optD:'', answer:'A', explanation:'' })
  closeModal()
}

// ─── Submit new question to queue ─────────────────────────────
// Bilingual question form fields
let questionEN   = ref('')
let questionBN   = ref('')
let subjectEN    = ref('')
let subjectBN    = ref('')
let chapterEN    = ref('')
let chapterBN    = ref('')
let streamEN     = ref('HSC Science')
let sourceEN     = ref('')
let sourceBN     = ref('')
let yearEN       = ref('')
let difficultyEN = ref('Medium')
let optionsEN    = ref(['', '', '', ''])
let optionsBN    = ref(['', '', '', ''])
let answerEN     = ref('A')
let explanationEN = ref('')
let explanationBN = ref('')
let stimulusBN   = ref('')
let stimulusEN   = ref('')

// ─── Question image (cropped from sheet) ──────────────────────
const questionImageUrl       = ref('')
const questionImagePreview   = ref('')
const questionImageUploading = ref(false)

// ─── Cropper state ────────────────────────────────────────────
const cropperOpen        = ref(false)
const cropperImgFile     = ref(null)
const cropperInstance    = ref(null)
const cropperForBulkIdx  = ref(null)   // null = single, number = bulk row index
const cropperForStimulus = ref(false)  // true = cropping stimulus image

const cropperImgSrc = computed(() =>
  cropperImgFile.value ? URL.createObjectURL(cropperImgFile.value) : ''
)

// Curriculum-driven subject / chapter selects
const availableSubjects = computed(() =>
  streamEN.value ? (curriculum[streamEN.value] ?? []) : []
)
const availableChapters = computed(() =>
  availableSubjects.value.find(s => s.en === subjectEN.value)?.chapters ?? []
)
watch(subjectEN, () => { chapterEN.value = ''; chapterBN.value = '' })
watch(streamEN,  () => { subjectEN.value = ''; subjectBN.value = ''; chapterEN.value = ''; chapterBN.value = '' })

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
      viewMode:     1,
      dragMode:     'move',
      autoCropArea: 0.5,
      movable:      true,
      zoomable:     true,
      scalable:     false,
      responsive:   true,
      background:   false,
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
    const canvas  = cropperInstance.value.getCroppedCanvas({ maxWidth: 1200, imageSmoothingQuality: 'high' })
    const subject = (cropperForBulkIdx.value !== null ? bulkResults.value[cropperForBulkIdx.value]?.subjectEN : subjectEN.value) || 'unknown'
    const chapter = (cropperForBulkIdx.value !== null ? bulkResults.value[cropperForBulkIdx.value]?.chapterEN : chapterEN.value) || 'unknown'
    const blob    = await new Promise(res => canvas.toBlob(res, 'image/jpeg', 0.92))
    const path    = `${streamEN.value}/${subject.replace(/[^a-zA-Z0-9]/g,'_')}/${chapter.replace(/[^a-zA-Z0-9]/g,'_')}/${Date.now()}.jpg`
    const supabase = streamEN.value.startsWith('HSC') ? supabaseHSC : supabaseMedical

    const { error } = await supabase.storage.from('question-images').upload(path, blob, { contentType: 'image/jpeg', upsert: false })
    if (error) throw new Error(error.message)

    const { data }  = supabase.storage.from('question-images').getPublicUrl(path)
    const url       = data.publicUrl
    const preview   = canvas.toDataURL('image/jpeg', 0.92)

    if (cropperForBulkIdx.value !== null) {
      if (cropperForStimulus.value) {
        // Auto-fill ALL questions sharing the same stimulus
        const stimulusText = bulkResults.value[cropperForBulkIdx.value]?.stimulusBN
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

function resetQuestionForm() {
  questionEN.value = ''; questionBN.value = ''
  subjectEN.value  = ''; subjectBN.value  = ''
  chapterEN.value  = ''; chapterBN.value  = ''
  streamEN.value   = 'HSC Science'
  sourceEN.value   = ''; sourceBN.value   = ''
  yearEN.value     = ''
  difficultyEN.value = 'Medium'
  optionsEN.value  = ['', '', '', '']
  optionsBN.value  = ['', '', '', '']
  answerEN.value   = 'A'
  explanationEN.value = ''; explanationBN.value = ''
  stimulusBN.value = ''; stimulusEN.value = ''
  singleIsDuplicate.value = false; singleLowConfidence.value = false
  imgFile.value = null; imgPreview.value = ''; imgError.value = ''
  imgPanelOpen.value = false
  questionImageUrl.value     = ''
  questionImagePreview.value = ''
  resetBulk()
}

// ─── Duplicate check ─────────────────────────────────────────
async function checkDuplicates(questions) {
  try {
    const raw = await $fetch('/api/check-duplicates', {
      method: 'POST',
      body: { questions, stream: streamEN.value }
    })
    return new Set((raw.results ?? []).filter(r => r.isDuplicate).map(r => r.questionBN))
  } catch { return new Set() }
}

// ─── Single image extraction ─────────────────────────────────
const imgFile         = ref(null)
const imgPreview      = ref('')
const imgExtracting   = ref(false)
const imgError        = ref('')
const imgPanelOpen    = ref(false)
const singleIsDuplicate   = ref(false)
const singleLowConfidence = ref(false)

// Sub-tab inside the submitQuestion modal
const submitQuestionTab = ref('single') // 'single' | 'bulk'

function onImgFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return
  imgFile.value = f
  imgPreview.value = URL.createObjectURL(f)
  imgError.value = ''
}

async function extractFromImage() {
  if (!imgFile.value || !streamEN.value) return
  imgExtracting.value = true
  imgError.value = ''
  try {
    const formData = new FormData()
    formData.append('image', imgFile.value)
    formData.append('stream', streamEN.value)
    const raw    = await $fetch('/api/analyze-question', { method: 'POST', body: formData })
    const parsed = JSON.parse(raw.result)

    questionBN.value    = parsed.questionBN    || ''
    questionEN.value    = parsed.questionEN    || ''
    optionsBN.value     = parsed.optionsBN     || ['', '', '', '']
    optionsEN.value     = parsed.optionsEN     || ['', '', '', '']
    answerEN.value      = parsed.answerEN      || 'A'
    explanationBN.value = parsed.explanationBN || ''
    explanationEN.value = parsed.explanationEN || ''
    yearEN.value        = parsed.year          || ''
    difficultyEN.value  = parsed.difficulty    || 'Medium'
    if (parsed.sourceEN) sourceEN.value = parsed.sourceEN
    if (parsed.sourceBN) sourceBN.value = parsed.sourceBN
    subjectEN.value = parsed.subjectEN || ''
    subjectBN.value = parsed.subjectBN || ''
    await nextTick()
    chapterEN.value = parsed.chapterEN || ''
    chapterBN.value = parsed.chapterBN || ''
    imgPanelOpen.value = false

    if (parsed.hasQuestionImage && imgFile.value) {
      openCropper(imgFile.value, null)
    }

    singleLowConfidence.value = parsed.lowConfidence ?? false
    singleIsDuplicate.value   = (await checkDuplicates([parsed])).has(parsed.questionBN)
    if (singleIsDuplicate.value)   showToast('⚠ Possible duplicate detected', 'warning')
    if (singleLowConfidence.value) showToast('⚠ Low confidence — review carefully', 'warning')
    showToast('Fields auto-filled from image ✓')
  } catch (err) {
    console.error(err)
    imgError.value = err.message || 'Extraction failed.'
  } finally {
    imgExtracting.value = false
  }
}

// ─── Bulk extraction ─────────────────────────────────────────
const bulkImgFile        = ref(null)
const bulkImgPreview     = ref('')
const bulkParsing        = ref(false)
const bulkError          = ref('')
const bulkResults        = ref([])
const bulkSelected       = ref([])
const bulkExpanded       = ref([])
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
}

const bulkSelectedCount = computed(() => bulkSelected.value.filter(Boolean).length)
function toggleBulkAll(val) { bulkSelected.value = bulkSelected.value.map(() => val) }

async function parseBulk() {
  if (!bulkImgFile.value || !streamEN.value) return
  bulkParsing.value = true
  bulkError.value   = ''
  bulkResults.value = []
  try {
    const formData = new FormData()
    formData.append('image', bulkImgFile.value)
    formData.append('stream', streamEN.value)
    const raw    = await $fetch('/api/analyze-question-bulk', { method: 'POST', body: formData })
    const parsed = JSON.parse(raw.result)

    bulkRedDotDetected.value = parsed.redDotDetected ?? false
    bulkTotalFound.value     = parsed.totalFound     ?? parsed.questions?.length ?? 0

    const questions  = parsed.questions ?? []
    const duplicates = await checkDuplicates(questions)
    bulkResults.value = questions.map(q => ({
      ...q,
      isDuplicate:          duplicates.has(q.questionBN),
      questionImageUrl:     null,
      questionImagePreview: null,
      stimulusImageUrl:     null,
      stimulusImagePreview: null,
    }))
    bulkSelected.value  = bulkResults.value.map(q => !q.isDuplicate)
    bulkExpanded.value  = bulkResults.value.map(() => false)
  } catch (err) {
    console.error(err)
    bulkError.value = err.message || 'Bulk parse failed.'
  } finally {
    bulkParsing.value = false
  }
}

// ─── Submit single question to question_submissions ───────────
async function submitNewQuestion() {
  if (!questionBN.value.trim() && !questionEN.value.trim()) {
    showToast('Question text is required.', 'error')
    return
  }
  if (!subjectEN.value || !streamEN.value) {
    showToast('Stream and subject are required.', 'error')
    return
  }

  const answerIndexMap      = { A: 0, B: 1, C: 2, D: 3 }
  const difficultyBanglaMap = { Easy: 'সহজ', Medium: 'মাধ্যম', Hard: 'কঠিন' }

  const payload = {
    stream:          streamEN.value,
    question:        { english: questionEN.value || null, bangla: questionBN.value || null },
    question_hash:   questionBN.value ? await hashText(questionBN.value) : null,
    question_image:  questionImageUrl.value || null,
    options:         { english: optionsEN.value, bangla: optionsBN.value },
    explanation:     (explanationEN.value || explanationBN.value)
                       ? { english: explanationEN.value || null, bangla: explanationBN.value || null }
                       : null,
    subject:         { english: subjectEN.value || null,   bangla: subjectBN.value   || null },
    chapter:         { english: chapterEN.value || null,   bangla: chapterBN.value   || null },
    difficulty:      { english: difficultyEN.value || null, bangla: difficultyBanglaMap[difficultyEN.value] || null },
    difficulty_level: (difficultyEN.value || 'medium').toLowerCase(),
    // year:            yearEN.value
    //                    ? { english: yearEN.value, bangla: toBengaliDigits(yearEN.value) }
    //                    : null,
    years: yearEN.value
      ? [{ english: yearEN.value, bangla: toBengaliDigits(yearEN.value) }]
      : null, // TODO: seems a little wrong here (maybe)
    source:          (sourceEN.value || sourceBN.value)
                       ? { english: sourceEN.value || null, bangla: sourceBN.value || null }
                       : null,
    stimulus:        (stimulusBN.value || stimulusEN.value)
                       ? { bangla: stimulusBN.value || null, english: stimulusEN.value || null }
                       : null,
    stimulus_hash:   stimulusBN.value ? await hashText(stimulusBN.value) : null,
    //stimulus_image:  stimulusImageUrl.value || null,
    correct_index:   answerIndexMap[answerEN.value] ?? 0,
    status:          'pending',
    submitted_by:    user?.id ?? null,
  }

  try {
    const supabase = streamEN.value.startsWith('HSC') ? supabaseHSC : supabaseMedical
    const { error } = await supabase.from('question_submissions').insert(payload)
    if (error) throw new Error(error.message)

    myQueue.value.unshift({
      id: Date.now(),
      text: questionEN.value || questionBN.value,
      stream: streamEN.value,
      subject: subjectEN.value,
      diff: difficultyEN.value,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      adminNote: ''
    })
    logMod('approve', `Submitted question for review: "${(questionEN.value || questionBN.value).slice(0, 40)}…"`)
    showToast('Question submitted for admin review ✓')
    resetQuestionForm()
    closeModal()
  } catch (err) {
    console.error(err)
    showToast(err.message || 'Submission failed.', 'error')
  }
}

// ─── Bulk submit to question_submissions ─────────────────────
async function submitBulk() {
  const toSave = bulkResults.value.filter((_, i) => bulkSelected.value[i])
  if (!toSave.length) return
  bulkSaving.value = true

  const answerIndexMap      = { A: 0, B: 1, C: 2, D: 3 }
  const difficultyBanglaMap = { Easy: 'সহজ', Medium: 'মাধ্যম', Hard: 'কঠিন' }

  const payloads = await Promise.all(toSave.map(async q => ({
    stream:          streamEN.value,
    question:        { english: q.questionEN || null, bangla: q.questionBN || null },
    question_hash:   q.questionBN ? await hashText(q.questionBN) : null,
    question_image:  q.questionImageUrl  || null,
    stimulus_image:  q.stimulusImageUrl  || null,
    options:         { english: q.optionsEN || [],    bangla: q.optionsBN  || [] },
    explanation:     (q.explanationEN || q.explanationBN)
                       ? { english: q.explanationEN || null, bangla: q.explanationBN || null }
                       : null,
    subject:         { english: q.subjectEN || null,  bangla: q.subjectBN  || null },
    chapter:         { english: q.chapterEN || null,  bangla: q.chapterBN  || null },
    difficulty:      { english: q.difficulty || null, bangla: difficultyBanglaMap[q.difficulty] || null },
    difficulty_level: (q.difficulty || 'medium').toLowerCase(),
    // year:            q.years?.length
    //                    ? { english: q.years[0], bangla: toBengaliDigits(q.years[0]) }
    //                    : null,
    years: q.years?.length
                      ? q.years.map(y => ({ english: y, bangla: toBengaliDigits(y) }))
                      : null,
    source:          (q.sourceEN?.length || q.sourceBN?.length)
                       ? { english: q.sourceEN || null, bangla: q.sourceBN || null }
                       : null,
    stimulus:        (q.stimulusBN || q.stimulusEN)
                       ? { bangla: q.stimulusBN || null, english: q.stimulusEN || null }
                       : null,
    stimulus_hash:   q.stimulusBN ? await hashText(q.stimulusBN) : null,
    correct_index:   answerIndexMap[q.answerEN] ?? 0,
    status:          'pending',
    submitted_by:    user?.id ?? null,
  })))

  try {
    const supabase = streamEN.value.startsWith('HSC') ? supabaseHSC : supabaseMedical
    const { error } = await supabase.from('question_submissions').insert(payloads)
    if (error) throw new Error(error.message)
    payloads.forEach((p, i) => {
      myQueue.value.unshift({
        id: Date.now() + i,
        text: toSave[i].questionEN || toSave[i].questionBN || '',
        stream: streamEN.value,
        subject: toSave[i].subjectEN || '',
        diff: toSave[i].difficulty || 'Medium',
        date: new Date().toISOString().slice(0, 10),
        status: 'pending',
        adminNote: ''
      })
    })
    logMod('approve', `Bulk submitted ${payloads.length} question(s) for admin review`)
    showToast(`${payloads.length} question${payloads.length > 1 ? 's' : ''} submitted ✓`)
    resetQuestionForm()
    closeModal()
  } catch (err) {
    console.error(err)
    bulkError.value = err.message || 'Bulk submit failed.'
  } finally {
    bulkSaving.value = false
  }
}

// ─── USER WARNINGS tab ────────────────────────────────────────
const warnSearch  = ref('')
const warnFilter  = ref('all')  // all | warned | watched | clear

const warnedUsers = ref([
  { id:3,  name:'Nasrin Khatun',   email:'nasrin@gmail.com',   stream:'SSC',  warnings:2, lastWarn:'2025-05-09', status:'warned',  reason:'Abusive comments' },
  { id:5,  name:'Jahid Hasan',     email:'jahid@gmail.com',    stream:'SSC',  warnings:1, lastWarn:'2025-05-05', status:'warned',  reason:'Offensive username' },
  { id:10, name:'Alamin Hossain',  email:'alamin@gmail.com',   stream:'BUET', warnings:0, lastWarn:'—',          status:'watched', reason:'Suspected account sharing' },
  { id:7,  name:'Sabbir Rahman',   email:'sabbir@gmail.com',   stream:'DU',   warnings:1, lastWarn:'2025-04-20', status:'warned',  reason:'Spam in comments' },
  { id:2,  name:'Farida Khanam',   email:'farida@yahoo.com',   stream:'Medical',warnings:0,lastWarn:'—',         status:'watched', reason:'Multiple flagged questions' },
  { id:9,  name:'Kamrul Islam',    email:'kamrul@gmail.com',   stream:'Bank', warnings:0, lastWarn:'—',          status:'clear',   reason:'—' },
  { id:6,  name:'Nusrat Jahan',    email:'nusrat@gmail.com',   stream:'HSC Science',  warnings:0, lastWarn:'—',          status:'clear',   reason:'—' },
])

const filteredWarned = computed(() => {
  let list = warnedUsers.value
  if (warnFilter.value !== 'all') list = list.filter(u => u.status === warnFilter.value)
  if (warnSearch.value) { const q = warnSearch.value.toLowerCase(); list = list.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) }
  return list
})

function issueWarning(u) {
  u.warnings++
  u.status = 'warned'
  u.lastWarn = new Date().toISOString().slice(0,10)
  logMod('warn', `Issued warning to ${u.name}`)
  showToast(`Warning issued to ${u.name}.`, 'error')
}
function clearWarning(u) {
  u.warnings = 0
  u.status = 'clear'
  logMod('approve', `Cleared warnings for ${u.name}`)
  showToast(`Warnings cleared for ${u.name}.`)
}
function watchUser(u) {
  u.status = 'watched'
  logMod('flag', `Placed ${u.name} on watch`)
  showToast(`${u.name} placed on watch.`)
}

// ─── DISCUSSIONS tab ──────────────────────────────────────────
const discFilter = ref('all')  // all | flagged | locked | open
const discussions = ref([
  { id:1,  title:'HSC Physics MCQ Tips',          stream:'HSC Science',    replies:34, flags:0, status:'open',    lastActive:'2m ago'  },
  { id:2,  title:'BUET 2024 Math Doubt Thread',   stream:'BUET',   replies:89, flags:3, status:'flagged', lastActive:'15m ago' },
  { id:3,  title:'BCS General Discussion',        stream:'BCS',    replies:12, flags:0, status:'open',    lastActive:'1h ago'  },
  { id:4,  title:'SSC Board Question Sharing',    stream:'SSC',    replies:201,flags:7, status:'locked',  lastActive:'3h ago'  },
  { id:5,  title:'Medical Admission Strategies',  stream:'Medical',replies:56, flags:1, status:'flagged', lastActive:'4h ago'  },
  { id:6,  title:'DU Admission Question Bank',    stream:'DU',     replies:44, flags:0, status:'open',    lastActive:'6h ago'  },
  { id:7,  title:'Bank Job Math Practice',        stream:'Bank',   replies:28, flags:0, status:'open',    lastActive:'1d ago'  },
  { id:8,  title:'Off-topic Chat Thread',         stream:'—',      replies:312,flags:11,status:'locked',  lastActive:'2d ago'  },
])

const filteredDisc = computed(() => {
  if (discFilter.value === 'all') return discussions.value
  return discussions.value.filter(d => d.status === discFilter.value)
})
function lockDisc(d) {
  d.status = 'locked'
  logMod('reject', `Locked discussion: "${d.title}"`)
  showToast(`"${d.title}" locked.`, 'error')
}
function unlockDisc(d) {
  d.status = 'open'
  logMod('approve', `Unlocked discussion: "${d.title}"`)
  showToast(`"${d.title}" unlocked.`)
}
function clearFlags(d) {
  d.flags = 0
  d.status = 'open'
  logMod('dismiss', `Cleared flags on "${d.title}"`)
  showToast('Flags cleared.')
}

// ─── ACTIVITY tab ─────────────────────────────────────────────
const activityRange = ref('today')  // today | week | month

const activityStats = computed(() => ({
  approved: modLog.value.filter(l => l.type === 'approve').length,
  rejected: modLog.value.filter(l => l.type === 'reject').length,
  warned:   modLog.value.filter(l => l.type === 'warn').length,
  dismissed:modLog.value.filter(l => l.type === 'dismiss').length,
  flagged:  modLog.value.filter(l => l.type === 'flag').length,
}))

// ─── Helpers ──────────────────────────────────────────────────
function severityClass(s) { return s === 'high' ? 'sev-high' : s === 'medium' ? 'sev-med' : 'sev-low' }
function diffClass(d)     { return d === 'Easy' ? 'diff-easy' : d === 'Medium' ? 'diff-mid' : 'diff-hard' }
function initials(name)   { return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase() }
function logIcon(type) {
  const m = { approve:'✓', reject:'✕', warn:'⚠', dismiss:'—', flag:'⚑' }
  return m[type] ?? '·'
}
function logColor(type) {
  const m = { approve:'green', reject:'red', warn:'amber', dismiss:'gray', flag:'amber' }
  return m[type] ?? 'gray'
}
</script>

<template>
  <div class="mod-shell">

    <!-- Sidebar -->
    <ModeratorSidebar
      :collapsed="sidebarCollapsed"
      :mobileOpen="mobileDrawerOpen"
      :activeTab="activeTab"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @tab="handleTabChange"
    />

    <!-- Mobile backdrop -->
    <div v-if="mobileDrawerOpen" class="mobile-backdrop" @click="mobileDrawerOpen = false" />

    <!-- Main -->
    <div class="mod-main">

      <!-- TopBar -->
      <ModeratorTopBar
        :activeTab="activeTab"
        :alertCount="reports.filter(r=>r.status==='open' && r.severity==='high').length"
        :openReports="reports.filter(r=>r.status==='open').length"
        @openMobileMenu="mobileDrawerOpen = true"
        @action="handleTopBarAction"
      />

      <!-- ═════════════════════════════════════════════════════
           OVERVIEW TAB
      ═════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'overview'" class="tab-body">

        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Moderator Panel</div>
            <h1 class="page-title">Moderation Overview.<br><span class="text-outline">Keep It Clean.</span></h1>
            <p class="page-sub">Review reports, approve submitted questions, and monitor user conduct.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Pending Actions</span>
              <span class="hsc-value hsc-value--amber">{{ reports.filter(r=>r.status==='open').length }}</span>
              <div class="hsc-row">
                <span class="hsc-meta">{{ reports.filter(r=>r.type==='question'&&r.status==='open').length }} questions · {{ reports.filter(r=>r.type==='user'&&r.status==='open').length }} users</span>
              </div>
              <div class="hsc-bar-wrap">
                <div class="hsc-bar-fill hsc-bar--amber" :style="{width: (reports.filter(r=>r.status==='open').length / reports.length * 100) + '%'}" />
              </div>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <ModeratorStats :stats="overviewStats" />

        <div class="ov-row">
          <!-- Left: urgent reports (main) -->
          <div class="ov-main">
            <div class="panel">
              <div class="panel-head">
                <span class="panel-title">URGENT REPORTS</span>
                <span class="badge-crit-pill">{{ reports.filter(r=>r.severity==='high'&&r.status==='open').length }} critical</span>
              </div>
              <div class="urgent-list">
                <div class="urgent-item" v-for="r in reports.filter(r=>r.severity==='high'&&r.status==='open').slice(0,4)" :key="r.id" @click="activeTab='reports'">
                  <span class="urg-type-dot" :class="r.type === 'user' ? 'dot-user' : 'dot-q'" />
                  <div class="urg-body">
                    <span class="urg-target">{{ r.target }}</span>
                    <span class="urg-reason">{{ r.reason }}</span>
                  </div>
                  <span class="sev-badge sev-high">HIGH</span>
                </div>
                <div v-if="!reports.filter(r=>r.severity==='high'&&r.status==='open').length" class="empty-state">No critical reports. All clear.</div>
              </div>
            </div>

            <!-- Recent actions below urgent on the left -->
            <ModeratorRecentActions :actions="modLog.slice(0,6)" />
          </div>

          <!-- Right: quick actions sidebar -->
          <div class="ov-sidebar">
            <ModeratorQuickActions @action="handleAction" />
          </div>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════
           REPORTS TAB
      ═════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'reports'" class="tab-body">

        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Reports</div>
            <h1 class="page-title">User Reports.<br><span class="text-outline">Review & Resolve.</span></h1>
            <p class="page-sub">Investigate flagged questions and reported users. Resolve, dismiss, or escalate to admin.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Open Reports</span>
              <span class="hsc-value hsc-value--amber">{{ reports.filter(r=>r.status==='open').length }}</span>
              <div class="hsc-row"><span class="hsc-meta">{{ reports.filter(r=>r.severity==='high'&&r.status==='open').length }} critical · {{ reports.filter(r=>r.severity==='medium'&&r.status==='open').length }} medium</span></div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill hsc-bar--amber" :style="{width: (reports.filter(r=>r.status==='open').length / reports.length * 100)+'%'}" /></div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="fb-search">
            <span class="fb-icon">⌕</span>
            <input v-model="reportSearch" class="fb-input" placeholder="Search reports…" />
            <button v-if="reportSearch" class="fb-clear" @click="reportSearch=''">×</button>
          </div>
          <div class="fb-pills">
            <button v-for="f in ['all','open','resolved','dismissed']" :key="f"
              class="pill" :class="{active: reportFilter===f}" @click="reportFilter=f; reportPage=1">
              {{ f.charAt(0).toUpperCase()+f.slice(1) }}
            </button>
          </div>
          <div class="fb-meta">{{ filteredReports.length }} reports</div>
        </div>

        <div class="panel table-panel">
          <div class="table-scroll">
            <div class="data-table reports-table">
              <div class="dt-head">
                <span>Target</span><span>Type</span><span>Reporter</span>
                <span>Reason</span><span>Severity</span><span>Status</span><span>Actions</span>
              </div>
              <div class="dt-row" v-for="r in paginatedReports" :key="r.id" @click="openModal('reportDetail', r)">
                <span class="dt-target">{{ r.target }}</span>
                <span class="type-badge" :class="'type-'+r.type">{{ r.type }}</span>
                <span class="mono dim">{{ r.reporter }}</span>
                <span class="reason-text">{{ r.reason }}</span>
                <span class="sev-badge" :class="severityClass(r.severity)">{{ r.severity }}</span>
                <span class="status-badge" :class="r.status">{{ r.status }}</span>
                <div class="dt-actions" @click.stop>
                  <button v-if="r.status==='open' && r.type==='question'"
                    class="act-btn fix-btn" @click="openFixModal(r)" title="Fix & Publish">✎</button>
                  <button v-if="r.status==='open'" class="act-btn unban" @click="resolveReport(r)" title="Resolve">✓</button>
                  <button v-if="r.status==='open'" class="act-btn"       @click="dismissReport(r)" title="Dismiss">—</button>
                  <button class="act-btn flag-btn"                         @click="escalateReport(r)" title="Escalate to Admin">⚑</button>
                </div>
              </div>
            </div>
          </div>
          <div class="pagination" v-if="totalReportPages > 1">
            <button class="iso-btn iso-btn--ghost pg-btn" :disabled="reportPage===1" @click="reportPage--">← Prev</button>
            <span class="pg-info">{{ reportPage }} / {{ totalReportPages }}</span>
            <button class="iso-btn iso-btn--ghost pg-btn" :disabled="reportPage===totalReportPages" @click="reportPage++">Next →</button>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════
           REVIEW QUEUE TAB  (read-only — mod tracks submissions)
      ═════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'queue'" class="tab-body">

        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> My Submissions</div>
            <h1 class="page-title">Review Queue.<br><span class="text-outline">Track Your Submissions.</span></h1>
            <p class="page-sub">Questions you submitted are reviewed by admins. Track their status here and resubmit if rejected.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Pending Admin Review</span>
              <span class="hsc-value hsc-value--amber">{{ myQueueStats.pending }}</span>
              <div class="hsc-row">
                <span class="hsc-meta">{{ myQueueStats.approved }} approved · {{ myQueueStats.rejected }} rejected</span>
              </div>
              <div class="hsc-bar-wrap">
                <div class="hsc-bar-fill hsc-bar--amber" :style="{width: myQueue.length ? (myQueueStats.pending/myQueue.length*100)+'%' : '0%'}" />
              </div>
            </div>
          </div>
        </div>

        <!-- Summary stat row -->
        <div class="queue-stat-row">
          <div class="qsr-card" v-for="item in [
            { label:'Total Submitted', val: myQueue.length,              color:'neutral' },
            { label:'Pending Review',  val: myQueueStats.pending,        color:'amber'   },
            { label:'Approved',        val: myQueueStats.approved,       color:'green'   },
            { label:'Rejected',        val: myQueueStats.rejected,       color:'red'     },
          ]" :key="item.label">
            <span class="qsr-val" :class="'qsr-'+item.color">{{ item.val }}</span>
            <span class="qsr-label">{{ item.label }}</span>
          </div>
        </div>

        <!-- Filter bar -->
        <div class="filter-bar">
          <div class="fb-search">
            <span class="fb-icon">⌕</span>
            <input v-model="myQueueSearch" class="fb-input" placeholder="Search your submissions…" />
            <button v-if="myQueueSearch" class="fb-clear" @click="myQueueSearch=''">×</button>
          </div>
          <div class="fb-pills">
            <button v-for="f in ['all','pending','approved','rejected']" :key="f"
              class="pill" :class="{active: myQueueFilter===f}" @click="myQueueFilter=f">
              {{ f.charAt(0).toUpperCase()+f.slice(1) }}
              <span class="pill-count" v-if="f!=='all'">
                {{ f==='pending' ? myQueueStats.pending : f==='approved' ? myQueueStats.approved : myQueueStats.rejected }}
              </span>
            </button>
          </div>
          <div class="fb-meta">{{ filteredMyQueue.length }} questions</div>
          <button class="iso-btn iso-btn--fill add-q-btn" @click="openModal('submitQuestion')">+ Submit New</button>
        </div>

        <!-- Question cards -->
        <div v-if="myQueueLoading" class="empty-panel">Loading your submissions…</div>
        <div class="my-queue-list">
          <div
            class="mq-card"
            v-for="q in filteredMyQueue"
            :key="q.id"
            :class="'mq-'+q.status"
          >
            <div class="mq-top">
              <div class="mq-meta">
                <span class="stream-tag">{{ q.stream }}</span>
                <span class="mono dim">{{ q.subj }}</span>
                <span class="diff-badge" :class="diffClass(q.diff)">{{ q.diff }}</span>
              </div>
              <div class="mq-status-group">
                <span class="mq-date mono dim">{{ q.date }}</span>
                <span class="status-badge" :class="q.status">{{ q.status }}</span>
              </div>
            </div>

            <p class="mq-text">{{ q.text }}</p>

            <!-- Admin note shown only on rejection -->
            <div class="mq-admin-note" v-if="q.status === 'rejected' && q.adminNote">
              <span class="man-label">Admin note</span>
              <span class="man-text">{{ q.adminNote }}</span>
            </div>

            <!-- Status-specific footer -->
            <div class="mq-footer">
              <template v-if="q.status === 'pending'">
                <div class="mq-pending-info">
                  <span class="mq-spinner" />
                  <span class="mono dim" style="font-size:0.65rem">Awaiting admin review</span>
                </div>
              </template>

              <template v-else-if="q.status === 'approved'">
                <div class="mq-approved-info">
                  <span style="color:rgba(120,230,120,0.8);font-size:0.75rem">✓ Published to question bank</span>
                </div>
              </template>

              <template v-else-if="q.status === 'rejected'">
                <div class="mq-rejected-info">
                  <span style="color:rgba(255,100,100,0.8);font-size:0.75rem">✕ Rejected by admin</span>
                  <button class="iso-btn iso-btn--ghost mq-resubmit-btn" @click="openModal('resubmitQ', q)">
                    ↺ Resubmit with edits
                  </button>
                </div>
              </template>
            </div>
          </div>

          <div v-if="!filteredMyQueue.length" class="mq-empty">
            <span class="mono dim">No submissions match this filter.</span>
            <button class="iso-btn iso-btn--fill" @click="openModal('submitQuestion')">+ Submit Your First Question</button>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════
           USER WARNINGS TAB
      ═════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'users'" class="tab-body">

        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> User Warnings</div>
            <h1 class="page-title">User Conduct.<br><span class="text-outline">Warn, Watch, Clear.</span></h1>
            <p class="page-sub">Issue warnings for misconduct, place users on watch, or clear their record.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Active Warnings</span>
              <span class="hsc-value hsc-value--amber">{{ warnedUsers.filter(u=>u.status==='warned').length }}</span>
              <div class="hsc-row"><span class="hsc-meta">{{ warnedUsers.filter(u=>u.status==='watched').length }} on watch · {{ warnedUsers.filter(u=>u.status==='clear').length }} clear</span></div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill hsc-bar--amber" :style="{width: (warnedUsers.filter(u=>u.status==='warned').length/warnedUsers.length*100)+'%'}" /></div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="fb-search">
            <span class="fb-icon">⌕</span>
            <input v-model="warnSearch" class="fb-input" placeholder="Search users…" />
          </div>
          <div class="fb-pills">
            <button v-for="f in ['all','warned','watched','clear']" :key="f"
              class="pill" :class="{active:warnFilter===f}" @click="warnFilter=f">
              {{ f.charAt(0).toUpperCase()+f.slice(1) }}
            </button>
          </div>
          <div class="fb-meta">{{ filteredWarned.length }} users</div>
        </div>

        <div class="panel table-panel">
          <div class="table-scroll">
            <div class="data-table warn-table">
              <div class="dt-head">
                <span>User</span><span>Stream</span><span>Warnings</span>
                <span>Last Warned</span><span>Reason</span><span>Status</span><span>Actions</span>
              </div>
              <div class="dt-row" v-for="u in filteredWarned" :key="u.id" @click="openModal('userWarn', u)">
                <div class="dt-user">
                  <div class="dt-avatar" :class="u.status==='warned'?'avatar-warn':''">{{ initials(u.name) }}</div>
                  <div class="dt-user-info">
                    <span class="dt-name">{{ u.name }}</span>
                    <span class="dt-email">{{ u.email }}</span>
                  </div>
                </div>
                <span class="stream-tag">{{ u.stream }}</span>
                <span class="warn-count" :class="u.warnings>1?'warn-high':u.warnings===1?'warn-med':''">{{ u.warnings }}</span>
                <span class="mono dim">{{ u.lastWarn }}</span>
                <span class="reason-text">{{ u.reason }}</span>
                <span class="status-badge" :class="u.status">{{ u.status }}</span>
                <div class="dt-actions" @click.stop>
                  <button class="act-btn ban"   @click="issueWarning(u)"  title="Issue Warning">⚠</button>
                  <button class="act-btn"        @click="watchUser(u)"    title="Watch">◎</button>
                  <button class="act-btn unban"  @click="clearWarning(u)" title="Clear">✓</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════
           DISCUSSIONS TAB
      ═════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'discussions'" class="tab-body">

        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Discussions</div>
            <h1 class="page-title">Discussion Threads.<br><span class="text-outline">Lock, Unlock, Clear Flags.</span></h1>
            <p class="page-sub">Monitor student discussion threads and take action on flagged or problematic content.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Flagged Threads</span>
              <span class="hsc-value hsc-value--amber">{{ discussions.filter(d=>d.flags>0).length }}</span>
              <div class="hsc-row"><span class="hsc-meta">{{ discussions.filter(d=>d.status==='locked').length }} locked · {{ discussions.filter(d=>d.status==='open').length }} open</span></div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill hsc-bar--amber" :style="{width:(discussions.filter(d=>d.flags>0).length/discussions.length*100)+'%'}" /></div>
            </div>
          </div>
        </div>

        <div class="filter-bar">
          <div class="fb-pills">
            <button v-for="f in ['all','flagged','locked','open']" :key="f"
              class="pill" :class="{active:discFilter===f}" @click="discFilter=f">
              {{ f.charAt(0).toUpperCase()+f.slice(1) }}
            </button>
          </div>
          <div class="fb-meta">{{ filteredDisc.length }} threads</div>
        </div>

        <div class="panel table-panel">
          <div class="table-scroll">
            <div class="data-table disc-table">
              <div class="dt-head">
                <span>Thread</span><span>Stream</span><span>Replies</span>
                <span>Flags</span><span>Status</span><span>Last Active</span><span>Actions</span>
              </div>
              <div class="dt-row" v-for="d in filteredDisc" :key="d.id">
                <span class="disc-title">{{ d.title }}</span>
                <span class="stream-tag">{{ d.stream }}</span>
                <span class="mono">{{ d.replies }}</span>
                <span class="flag-count" :class="d.flags>5?'flag-high':d.flags>0?'flag-med':''">
                  {{ d.flags > 0 ? '⚑ '+d.flags : '—' }}
                </span>
                <span class="status-badge" :class="d.status">{{ d.status }}</span>
                <span class="mono dim">{{ d.lastActive }}</span>
                <div class="dt-actions">
                  <button v-if="d.status!=='locked'" class="act-btn ban"   @click="lockDisc(d)"  title="Lock">🔒</button>
                  <button v-if="d.status==='locked'"  class="act-btn unban" @click="unlockDisc(d)" title="Unlock">🔓</button>
                  <button v-if="d.flags>0"             class="act-btn"      @click="clearFlags(d)" title="Clear flags">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════
           MOD ACTIVITY TAB
      ═════════════════════════════════════════════════════ -->
      <div v-if="activeTab === 'activity'" class="tab-body">

        <div class="page-header">
          <div class="header-left">
            <div class="page-chip"><span class="chip-dot" /> Mod Activity</div>
            <h1 class="page-title">Your Actions.<br><span class="text-outline">Full Audit Trail.</span></h1>
            <p class="page-sub">A complete log of every moderation action taken during this session.</p>
          </div>
          <div class="header-right">
            <div class="header-stat-card">
              <span class="hsc-label">Actions This Session</span>
              <span class="hsc-value">{{ modLog.length }}</span>
              <div class="hsc-row"><span class="hsc-meta">{{ activityStats.approved }} approved · {{ activityStats.rejected }} rejected</span></div>
              <div class="hsc-bar-wrap"><div class="hsc-bar-fill" style="width:100%" /></div>
            </div>
          </div>
        </div>

        <div class="activity-layout">
          <!-- Full log -->
          <div class="panel act-log-panel">
            <div class="panel-head">
              <span class="panel-title">FULL ACTION LOG</span>
              <span class="live-dot-wrap"><span class="live-dot" /></span>
            </div>
            <div class="act-log-list">
              <div class="act-log-item" v-for="l in modLog" :key="l.id" :class="'log-type-'+l.type">
                <span class="log-icon-box" :class="'icon-'+logColor(l.type)">{{ logIcon(l.type) }}</span>
                <div class="log-body">
                  <span class="log-title">{{ l.title }}</span>
                  <span class="log-meta mono dim">{{ l.actor }} · {{ l.time }}</span>
                </div>
                <span class="log-type-badge" :class="'lbadge-'+l.type">{{ l.type }}</span>
              </div>
              <div v-if="!modLog.length" class="empty-state">No actions recorded yet this session.</div>
            </div>
          </div>

          <!-- Summary sidebar -->
          <div class="act-sidebar">
            <div class="panel">
              <div class="panel-head"><span class="panel-title">SESSION SUMMARY</span></div>
              <div class="act-summary">
                <div class="act-sum-row" v-for="item in [
                  {label:'Approved',  val:activityStats.approved,  color:'green'},
                  {label:'Rejected',  val:activityStats.rejected,  color:'red'},
                  {label:'Warned',    val:activityStats.warned,     color:'amber'},
                  {label:'Dismissed', val:activityStats.dismissed,  color:'gray'},
                  {label:'Escalated', val:activityStats.flagged,    color:'amber'},
                ]" :key="item.label">
                  <span class="sum-label">{{ item.label }}</span>
                  <div class="sum-bar-wrap">
                    <div class="sum-bar" :class="'sum-bar--'+item.color" :style="{width: modLog.length ? (item.val/modLog.length*100)+'%' : '0%'}" />
                  </div>
                  <span class="sum-val mono">{{ item.val }}</span>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head"><span class="panel-title">QUICK ACTIONS</span></div>
              <div class="quick-links">
                <button class="iso-btn iso-btn--ghost iso-btn--full ql-btn" @click="activeTab='reports'">
                  View Open Reports →
                </button>
                <button class="iso-btn iso-btn--ghost iso-btn--full ql-btn" @click="activeTab='discussions'">
                  Flagged Threads →
                </button>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head"><span class="panel-title">MODERATOR SCOPE</span></div>
              <div class="scope-list">
                <div class="scope-item allowed" v-for="a in ['Approve/reject questions','Issue user warnings','Lock discussions','Resolve reports','Dismiss false reports','Escalate to admin']" :key="a">
                  <span class="scope-icon">✓</span>{{ a }}
                </div>
                <div class="scope-item denied" v-for="d in ['Permanently delete questions','Ban users','Access system logs','Modify announcements']" :key="d">
                  <span class="scope-icon">✕</span>{{ d }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div><!-- /mod-main -->

    <!-- ═══════════════════════════════════════════════════════
         MODALS
    ═══════════════════════════════════════════════════════ -->
    <Teleport to="body">
      <div class="modal-overlay" v-if="modal.show && modal.type" @click.self="closeModal()">
        <div class="modal-box" v-if="modal.type">

          <!-- Report Detail -->
          <!-- Report Detail — question: Fix & Publish | user: Resolve/Dismiss -->
          <template v-if="modal.type === 'reportDetail' && modal.data">
            <div class="modal-head">
              <span class="panel-title">{{ modal.data.type === 'question' ? 'FIX REPORTED QUESTION' : 'REPORT DETAIL' }}</span>
              <button class="modal-close" @click="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-field">
                <span class="mf-label">TARGET</span>
                <span class="mf-val">{{ modal.data.target }}</span>
              </div>
              <div class="modal-field">
                <span class="mf-label">TYPE</span>
                <span class="type-badge" :class="'type-'+modal.data.type">{{ modal.data.type }}</span>
              </div>
              <div class="modal-field">
                <span class="mf-label">REPORTED BY</span>
                <span class="mf-val">{{ modal.data.reporter }}</span>
              </div>
              <div class="modal-field">
                <span class="mf-label">REASON</span>
                <span class="mf-val">{{ modal.data.reason }}</span>
              </div>
              <div class="modal-field">
                <span class="mf-label">SEVERITY</span>
                <span class="sev-badge" :class="severityClass(modal.data.severity)">{{ modal.data.severity }}</span>
              </div>

              <!-- Question report: full fix form, publishes immediately -->
              <template v-if="modal.data.type === 'question'">
                <div class="fix-divider"><span class="fix-divider-label">CORRECTED QUESTION</span></div>
                <div class="fix-note">
                  <span>✓</span>
                  Fix the question below. It will publish <strong>immediately</strong> — no admin review needed.
                </div>
                <div class="mf-group">
                  <label class="mf-label">QUESTION TEXT *</label>
                  <textarea class="mf-input mf-textarea" v-model="fixedQ.text" rows="3" placeholder="Corrected question text…" />
                </div>
                <div class="mf-group">
                  <label class="mf-label">OPTIONS *</label>
                  <input class="mf-input"     v-model="fixedQ.optA" placeholder="A — Option A" />
                  <input class="mf-input mt4" v-model="fixedQ.optB" placeholder="B — Option B" />
                  <input class="mf-input mt4" v-model="fixedQ.optC" placeholder="C — Option C (optional)" />
                  <input class="mf-input mt4" v-model="fixedQ.optD" placeholder="D — Option D (optional)" />
                </div>
                <div class="mf-row">
                  <div class="mf-group">
                    <label class="mf-label">CORRECT ANSWER *</label>
                    <select class="mf-input mf-select" v-model="fixedQ.answer">
                      <option>A</option><option>B</option><option>C</option><option>D</option>
                    </select>
                  </div>
                </div>
                <div class="mf-group">
                  <label class="mf-label">EXPLANATION (optional)</label>
                  <textarea class="mf-input mf-textarea" v-model="fixedQ.explanation" rows="2" placeholder="Explain the correct answer…" />
                </div>
              </template>

              <!-- User report: just a note -->
              <template v-else>
                <div class="modal-field">
                  <span class="mf-label">STATUS</span>
                  <span class="status-badge" :class="modal.data.status">{{ modal.data.status }}</span>
                </div>
                <div class="mf-group">
                  <label class="mf-label">MOD NOTE (optional)</label>
                  <textarea class="mf-input mf-textarea" rows="2" placeholder="Add a note for this action…"></textarea>
                </div>
              </template>
            </div>

            <div class="modal-actions" v-if="modal.data.type === 'question'">
              <button class="iso-btn iso-btn--ghost" @click="escalateReport(modal.data); closeModal()">⚑ Escalate</button>
              <button class="iso-btn iso-btn--ghost" @click="dismissReport(modal.data); closeModal()">— Dismiss</button>
              <button class="iso-btn iso-btn--fill"  @click="fixAndPublish()">✓ Fix & Publish</button>
            </div>
            <div class="modal-actions" v-else>
              <button class="iso-btn iso-btn--ghost" @click="escalateReport(modal.data); closeModal()">⚑ Escalate</button>
              <button class="iso-btn iso-btn--ghost" @click="dismissReport(modal.data); closeModal()">— Dismiss</button>
              <button class="iso-btn iso-btn--fill"  @click="resolveReport(modal.data); closeModal()">✓ Resolve</button>
            </div>
          </template>

          <!-- User Warning -->
          <template v-if="modal.type === 'userWarn' && modal.data">
            <div class="modal-head">
              <span class="panel-title">USER CONDUCT</span>
              <button class="modal-close" @click="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <div class="modal-user-hero">
                <div class="dt-avatar big-avatar" :class="modal.data.status==='warned'?'avatar-warn':''">{{ initials(modal.data.name) }}</div>
                <div>
                  <div class="modal-name">{{ modal.data.name }}</div>
                  <div class="modal-email mono dim">{{ modal.data.email }}</div>
                  <div class="modal-badges">
                    <span class="status-badge" :class="modal.data.status">{{ modal.data.status }}</span>
                    <span class="warn-count" :class="modal.data.warnings>1?'warn-high':modal.data.warnings===1?'warn-med':''">{{ modal.data.warnings }} warnings</span>
                  </div>
                </div>
              </div>
              <div class="modal-field">
                <span class="mf-label">REASON ON FILE</span>
                <span class="mf-val">{{ modal.data.reason }}</span>
              </div>
              <div class="modal-field">
                <span class="mf-label">LAST WARNED</span>
                <span class="mf-val mono">{{ modal.data.lastWarn }}</span>
              </div>
              <div class="mf-group">
                <label class="mf-label">WARNING MESSAGE</label>
                <textarea class="mf-input mf-textarea" rows="3" placeholder="Describe the violation and expected conduct…"></textarea>
              </div>
            </div>
            <div class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="clearWarning(modal.data); closeModal()">Clear Record</button>
              <button class="iso-btn iso-btn--ghost" @click="watchUser(modal.data); closeModal()">Place on Watch</button>
              <button class="iso-btn iso-btn--fill"  @click="issueWarning(modal.data); closeModal()">Issue Warning</button>
            </div>
          </template>

          <!-- Submit New Question -->
          <template v-if="modal.type === 'submitQuestion'">
            <div class="modal-head">
              <span class="panel-title">SUBMIT QUESTION FOR REVIEW</span>
              <button class="modal-close" @click="closeModal()">×</button>
            </div>

            <!-- Tab switcher -->
            <div class="add-q-tabs">
              <button
                class="add-q-tab" :class="{ 'add-q-tab--active': submitQuestionTab === 'single' }"
                @click="submitQuestionTab = 'single'"
              >Single Question</button>
              <button
                class="add-q-tab" :class="{ 'add-q-tab--active': submitQuestionTab === 'bulk' }"
                @click="submitQuestionTab = 'bulk'"
              >Bulk Import</button>
            </div>

            <!-- ══════════════════ SINGLE TAB ══════════════════ -->
            <div v-if="submitQuestionTab === 'single'" class="modal-form">

              <!-- Image Extractor panel -->
              <div class="img-extract-panel">
                <button
                  class="img-extract-toggle"
                  :class="{ 'img-extract-toggle--open': imgPanelOpen }"
                  @click="imgPanelOpen = !imgPanelOpen"
                >
                  <span>⚡ AI Extract from Image</span>
                  <span class="img-extract-arrow">{{ imgPanelOpen ? '▲' : '▼' }}</span>
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
                    <input ref="imgInput" type="file" accept="image/*" style="display:none" @change="onImgFileChange" />
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
                    <button v-if="imgFile" class="iso-btn iso-btn--ghost" @click="imgFile = null; imgPreview = ''; imgError = ''" style="font-size:0.72rem">Clear</button>
                  </div>
                </div>
              </div>

              <div class="mf-group">
                <div class="single-flags" v-if="singleIsDuplicate || singleLowConfidence">
                  <span v-if="singleLowConfidence" class="flag-badge flag-warn">⚠ Low Confidence — review carefully</span>
                  <span v-if="singleIsDuplicate"   class="flag-badge flag-dup">DUP — possible duplicate in database</span>
                </div>
                <label class="mf-label">QUESTION TEXT (English)</label>
                <textarea class="mf-input mf-textarea" v-model="questionEN" rows="3" placeholder="Write the full question…" />
                <label class="mf-label">QUESTION TEXT (Bengali)</label>
                <textarea class="mf-input mf-textarea" v-model="questionBN" rows="3" placeholder="প্রশ্ন লিখুন…" />
              </div>
              <br>

              <!-- Stimulus -->
              <div class="mf-group">
                <label class="mf-label">STIMULUS / উদ্দীপক (English) <span style="opacity:0.5;font-size:0.6rem">optional</span></label>
                <textarea class="mf-input mf-textarea" v-model="stimulusEN" rows="2" placeholder="Shared passage if any…" />
                <label class="mf-label">STIMULUS / উদ্দীপক (Bengali)</label>
                <textarea class="mf-input mf-textarea" v-model="stimulusBN" rows="2" placeholder="উদ্দীপক থাকলে লিখুন…" />
              </div>
              <br>

              <!-- ── Question Image ──────────────────────────────── -->
              <div class="mf-group">
                <label class="mf-label">QUESTION IMAGE <span style="opacity:0.5;font-size:0.6rem">(auto-cropped if detected · optional)</span></label>
                <div class="qimg-field">
                  <div v-if="questionImageUploading" class="qimg-uploading">
                    <span class="img-spinner">◌</span> Cropping &amp; uploading…
                  </div>
                  <div v-else-if="questionImagePreview || questionImageUrl" class="qimg-preview-wrap">
                    <img :src="questionImagePreview || questionImageUrl" class="qimg-preview" />
                    <div class="qimg-actions">
                      <span class="qimg-status">{{ questionImageUrl ? '✓ Uploaded' : '⏳ Preview only' }}</span>
                      <button class="iso-btn iso-btn--ghost qimg-reupload-btn" @click="openCropper(imgFile, null)">Re-crop</button>
                      <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem" @click="questionImageUrl = ''; questionImagePreview = ''">Remove</button>
                    </div>
                  </div>
                  <div v-else class="qimg-empty">
                    <span class="dim" style="font-size:0.7rem">No image — will be auto-cropped after extraction if detected</span>
                  </div>
                </div>
              </div>

              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">STREAM</label>
                  <select class="mf-input mf-select" style="background: lightblack;" v-model="streamEN">
                    <option v-for="s in ['SSC Science','SSC Arts','SSC Commerce','HSC Science','HSC Arts','HSC Commerce','BUET','Medical','DU','BCS']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">DIFFICULTY</label>
                  <select class="mf-input mf-select" v-model="difficultyEN">
                    <option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
              </div>
              <div class="mf-group">
                <label class="mf-label">YEAR</label>
                <input class="mf-input" v-model="yearEN" placeholder="e.g. 2023" />
              </div>
              <div class="mf-group">
                <label class="mf-label">SOURCE (English)</label>
                <input class="mf-input" v-model="sourceEN" placeholder="e.g. Dhaka Board" />
              </div>
              <div class="mf-group">
                <label class="mf-label">SOURCE (Bengali)</label>
                <input class="mf-input" v-model="sourceBN" placeholder="যেমন: ঢাকা বোর্ড" />
              </div>

              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">SUBJECT (English)</label>
                  <select
                    v-model="subjectEN" class="mf-input mf-select"
                    :disabled="!availableSubjects.length"
                    @change="() => { const m = availableSubjects.find(x => x.en === subjectEN); subjectBN = m?.bn ?? '' }"
                  >
                    <option value="" disabled>{{ streamEN ? 'Select subject…' : 'Select stream first' }}</option>
                    <option v-for="s in availableSubjects" :key="s.en" :value="s.en">{{ s.en }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">SUBJECT (Bengali)</label>
                  <select
                    v-model="subjectBN" class="mf-input mf-select"
                    :disabled="!availableSubjects.length"
                    @change="() => { const m = availableSubjects.find(x => x.bn === subjectBN); subjectEN = m?.en ?? '' }"
                  >
                    <option value="" disabled>{{ streamEN ? 'বিষয় বেছে নিন…' : 'স্ট্রিম বেছে নিন' }}</option>
                    <option v-for="s in availableSubjects" :key="s.bn" :value="s.bn">{{ s.bn }}</option>
                  </select>
                </div>
              </div>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">CHAPTER (English)</label>
                  <select
                    v-model="chapterEN" class="mf-input mf-select"
                    :disabled="!availableChapters.length"
                    @change="() => { const m = availableChapters.find(c => c.en === chapterEN); chapterBN = m?.bn ?? '' }"
                  >
                    <option value="" disabled>{{ subjectEN ? 'Select chapter…' : 'Select subject first' }}</option>
                    <option v-for="c in availableChapters" :key="c.en" :value="c.en">{{ c.en }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">CHAPTER (Bengali)</label>
                  <select
                    v-model="chapterBN" class="mf-input mf-select"
                    :disabled="!availableChapters.length"
                    @change="() => { const m = availableChapters.find(c => c.bn === chapterBN); chapterEN = m?.en ?? '' }"
                  >
                    <option value="" disabled>{{ subjectEN ? 'অধ্যায় বেছে নিন…' : 'বিষয় বেছে নিন' }}</option>
                    <option v-for="c in availableChapters" :key="c.bn" :value="c.bn">{{ c.bn }}</option>
                  </select>
                </div>
              </div>
              <br>

              <div class="mf-group">
                <label class="mf-label">OPTIONS (A / B / C / D)</label>
                <input v-model="optionsEN[0]" class="mf-input"    placeholder="Option A (English)" /><input v-model="optionsBN[0]" class="mf-input"    placeholder="বিকল্প A (Bengali)" /><br>
                <input v-model="optionsEN[1]" class="mf-input mt4" placeholder="Option B (English)" /><input v-model="optionsBN[1]" class="mf-input mt4" placeholder="বিকল্প B (Bengali)" /><br>
                <input v-model="optionsEN[2]" class="mf-input mt4" placeholder="Option C (English)" /><input v-model="optionsBN[2]" class="mf-input mt4" placeholder="বিকল্প C (Bengali)" /><br>
                <input v-model="optionsEN[3]" class="mf-input mt4" placeholder="Option D (English)" /><input v-model="optionsBN[3]" class="mf-input mt4" placeholder="বিকল্প D (Bengali)" /><br>
              </div>

              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">CORRECT ANSWER</label>
                  <select class="mf-input mf-select" v-model="answerEN">
                    <option>A</option><option>B</option><option>C</option><option>D</option>
                  </select>
                </div>
              </div>
              <br>
              <div class="mf-group">
                <label class="mf-label">EXPLANATION (optional) (English)</label>
                <textarea class="mf-input mf-textarea" v-model="explanationEN" rows="2" placeholder="Explain why the answer is correct…" />
                <label class="mf-label">EXPLANATION (optional) (Bengali)</label>
                <textarea class="mf-input mf-textarea" v-model="explanationBN" rows="2" placeholder="উত্তর কেন সঠিক তা ব্যাখ্যা করুন…" />
              </div>

              <div class="submit-note">
                <span class="submit-note-icon">⚑</span>
                This question will be submitted as <strong>pending</strong> and requires admin approval before going live.
              </div>
            </div>
            <div v-if="submitQuestionTab === 'single'" class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="closeModal()">Cancel</button>
              <button class="iso-btn iso-btn--fill"  @click="submitNewQuestion()">Submit for Review</button>
            </div>

            <!-- ══════════════════ BULK TAB ══════════════════ -->
            <div v-if="submitQuestionTab === 'bulk'" class="modal-form bulk-form">

              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">STREAM (required)</label>
                  <select v-model="streamEN" class="mf-input mf-select">
                    <option value="" disabled>Select stream…</option>
                    <option v-for="s in ['SSC Science','SSC Arts','SSC Commerce','HSC Science','HSC Arts','HSC Commerce','BUET','Medical','DU','BCS']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="mf-group" style="justify-content:flex-end; padding-top:18px;">
                  <span v-if="bulkRedDotDetected" class="bulk-mode-badge red-dot-badge">🔴 Red-dot mode</span>
                  <span v-else-if="bulkResults.length" class="bulk-mode-badge">All questions mode</span>
                </div>
              </div>

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

                  <div
                    v-for="(q, i) in bulkResults"
                    :key="i"
                    class="bulk-row"
                    :class="{ 'bulk-row--unchecked': !bulkSelected[i], 'bulk-row--expanded': bulkExpanded[i] }"
                  >
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
                      <span class="btc-q bulk-q-text">{{ q.questionEN }}</span>
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
                      <!-- <div class="brd-section">
                        <span class="brd-label">BN Question</span>
                        <span class="brd-text">{{ q.questionBN }}</span>
                      </div>
                      <div v-if="q.stimulusBN || q.stimulusEN" class="brd-section">
                        <span class="brd-label">Stimulus</span>
                        <span class="brd-text">{{ q.stimulusBN || q.stimulusEN }}</span>
                      </div> -->
                      <!-- Stimulus with crop button -->
                      <!-- <div v-if="q.stimulusBN || q.stimulusEN" class="brd-section">
                        <span class="brd-label">STIMULUS</span>
                        <div v-if="q.hasStimulusImage" style="display:flex;flex-direction:column;gap:6px;margin-bottom:6px">
                          <img v-if="q.stimulusImagePreview || q.stimulusImageUrl"
                               :src="q.stimulusImagePreview || q.stimulusImageUrl" class="brd-qimg" />
                          <button class="iso-btn iso-btn--ghost" style="font-size:0.68rem;width:fit-content"
                                  @click="openCropper(bulkImgFile, i, true)">
                            {{ q.stimulusImageUrl ? '✎ Re-crop stimulus' : '✂ Crop stimulus image' }}
                          </button>
                          <span v-if="q.stimulusImageUrl" style="font-size:0.6rem;color:rgba(120,200,120,0.8)">✓ auto-filled on linked questions</span>
                        </div>
                        <span class="brd-text">{{ q.stimulusEN || q.stimulusBN }}</span>
                      </div> -->

                      <!-- Question image with crop button -->
                      <!--      ///////////////      -->
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
                      
                        <span v-if="q.stimulusEN" class="brd-text bn-text">{{ q.stimulusEN }}</span>
                        <span v-if="q.stimulusBN" class="brd-text" style="opacity:0.7; font-size:0.72rem">({{ q.stimulusBN }})</span>
                      </div>
                      <div class="brd-section">
                        <span class="brd-label">English Question</span>
                        <span class="brd-text">{{ q.questionEN || '—' }} <span class="brd-text" style="font-size:0.7rem; opacity:0.7">({{ q.questionBN || '—' }})</span></span>
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
                            <b>{{ opt }}.</b> {{ q.optionsEN[oi] || '—' }}
                            <span v-if="q.optionsBN[oi]" class="brd-option-bn bn-text"> / {{ q.optionsBN[oi] }}</span>
                          </span>
                        </div>
                      </div>
                      <div v-if="q.explanationEN || q.explanationBN" class="brd-section">
                        <span class="brd-label">Explanation</span>
                        <span v-if="q.explanationEN" class="brd-text">{{ q.explanationEN }} <span v-if="q.explanationBN" class="brd-text" style="font-size:0.7rem; opacity:0.7">({{ q.explanationBN }})</span></span>
                      </div>
                      <div class="brd-section brd-meta-row">
                        <span v-if="q.years?.length"><span class="brd-label">Year:</span> <span class="brd-text" style="font-size:0.65rem; opacity:0.5">{{ q.years.join(' · ') }}</span></span>
                        <span v-if="q.sourceEN?.length">
                          <span class="brd-label">Source: </span>
                          <span v-for="(s, si) in q.sourceEN" :key="si" class="brd-text bn-text" style="font-size:0.65rem; opacity:0.4">{{ s }}{{ si < q.sourceEN.length - 1 ? ' · ' : '' }}</span>
                        </span>
                        <span v-if="q.sourceBN?.length" style="font-size:0.65rem; opacity:0.7">
                          ({{ q.sourceBN.join(' · ') }})
                        </span>
                        <span v-if="q.subjectEN" class="bn-text"><span class="brd-label">Subject:</span> {{ q.subjectEN }} <span v-if="q.subjectBN" style="font-size:0.65rem; opacity:0.7">({{ q.subjectBN }})</span></span>
                        <span v-if="q.chapterEN" class="bn-text"><span class="brd-label">Chapter:</span> {{ q.chapterEN }} <span v-if="q.chapterBN" style="font-size:0.65rem; opacity:0.7">({{ q.chapterBN }})</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="submit-note" style="margin-top:12px">
                  <span class="submit-note-icon">⚑</span>
                  {{ bulkSelectedCount }} question{{ bulkSelectedCount !== 1 ? 's' : '' }} selected — all will be submitted as <strong>pending</strong> for admin approval.
                </div>
              </div>
            </div>

            <div v-if="submitQuestionTab === 'bulk' && bulkResults.length" class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="closeModal()">Cancel</button>
              <button
                class="iso-btn iso-btn--fill"
                :disabled="!bulkSelectedCount || bulkSaving"
                @click="submitBulk"
              >
                <span v-if="bulkSaving" class="img-spinner">◌</span>
                {{ bulkSaving ? 'Submitting…' : `Submit ${bulkSelectedCount} Question${bulkSelectedCount !== 1 ? 's' : ''} for Review` }}
              </button>
            </div>
          </template>



        </div>
      </div>
    </Teleport>

    <!-- Toast -->
    <Teleport to="body">
      <Transition name="toast-slide">
        <div class="mod-toast" :class="toast.type" v-if="toast.show">{{ toast.msg }}</div>
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
        <img id="cropper-img" :src="cropperImgSrc" style="max-width:100%;display:block" />
      </div>
      <div class="modal-actions">
        <button class="iso-btn iso-btn--ghost" @click="closeCropper">Cancel</button>
        <button class="iso-btn iso-btn--fill" :disabled="questionImageUploading" @click="confirmCrop">
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
═══════════════════════════════════════════════════════════════ */
.mod-shell { display: flex; min-height: 100vh; align-items: flex-start; }

.mod-main {
  flex: 1; min-width: 0; min-height: 100vh;
  display: flex; flex-direction: column; overflow: hidden;
}

.mobile-backdrop {
  display: none; position: fixed; inset: 0; z-index: 199;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(2px);
}
@media (max-width: 768px) { .mobile-backdrop { display: block; } }

/* ═══════════════════════════════════════════════════════════════
   TOPBAR
═══════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════
   TAB BODY
═══════════════════════════════════════════════════════════════ */
.tab-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; min-width: 0; }

/* ═══════════════════════════════════════════════════════════════
   PAGE HEADER
═══════════════════════════════════════════════════════════════ */
.page-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 2rem; padding: 2rem;
  border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.page-header::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.055) 1px, transparent 1px);
  background-size: 24px 24px; pointer-events: none;
}
.header-left  { position: relative; flex: 1; min-width: 0; }
.header-right { position: relative; flex-shrink: 0; }
.page-chip {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--gray);
  border: 1px solid var(--border-bright); padding: 5px 12px; margin-bottom: 0.9rem;
}
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,200,80,0.9); animation: blink 2s infinite; }
@keyframes blink { 0%,100%{ opacity:1 } 50%{ opacity:0.2 } }
.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.3rem, 2.5vw, 2rem);
  font-weight: 700; letter-spacing: -1px; color: var(--white); line-height: 1.1; margin-bottom: 0.5rem;
}
.page-sub { font-size: 0.83rem; color: var(--gray); max-width: 440px; }
.header-stat-card {
  display: flex; flex-direction: column; gap: 5px;
  padding: 1.4rem 1.8rem; border: 1px solid var(--border-bright); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06); min-width: 200px;
}
.hsc-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray); }
.hsc-value { font-family: var(--font-mono); font-size: 2rem; font-weight: 700; color: var(--white); letter-spacing: -1.5px; line-height: 1; }
.hsc-value--amber { color: rgba(255,200,80,0.9); }
.hsc-row  { display: flex; align-items: center; gap: 7px; }
.hsc-meta { font-size: 0.7rem; color: var(--gray); }
.hsc-bar-wrap { height: 2px; background: var(--border); margin-top: 6px; }
.hsc-bar-fill { height: 100%; background: rgba(240,240,234,0.4); transition: width 0.6s ease; }
.hsc-bar--amber { background: rgba(255,200,80,0.6); }

/* ═══════════════════════════════════════════════════════════════
   PANELS
═══════════════════════════════════════════════════════════════ */
.panel {
  background: rgba(240,240,234,0.02); border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.panel-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 18px; border-bottom: 1px solid var(--border);
}
.panel-title { font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.16em; color: var(--white); opacity: 0.7; }
.live-dot-wrap { display: flex; align-items: center; }
.live-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(120,230,120,0.9); box-shadow: 0 0 5px rgba(120,230,120,0.5); animation: blink 2s infinite; }



.ov-row {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;
  align-items: flex-start;
}
.ov-main    { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.ov-sidebar { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.badge-crit-pill {
  font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 8px;
  border: 1px solid rgba(255,100,100,0.35); color: rgba(255,100,100,0.9);
  background: rgba(255,100,100,0.06);
}
.urgent-list { display: flex; flex-direction: column; }
.urgent-item {
  display: flex; align-items: center; gap: 10px;
  padding: 11px 16px; border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.15s;
  border-left: 2px solid rgba(255,100,100,0.4);
}
.urgent-item:hover { background: rgba(255,100,100,0.04); }
.urg-type-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
.dot-user { background: rgba(255,200,80,0.8); }
.dot-q    { background: rgba(255,100,100,0.8); }
.urg-body { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.urg-target { font-size: 0.78rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.urg-reason { font-size: 0.68rem; color: var(--gray); }





/* ═══════════════════════════════════════════════════════════════
   FILTER BAR
═══════════════════════════════════════════════════════════════ */
.filter-bar {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px; flex-wrap: wrap;
  background: rgba(240,240,234,0.02); border: 1px solid var(--border);
}
.fb-search {
  display: flex; align-items: center; border: 1px solid var(--border);
  background: rgba(240,240,234,0.03); padding: 0 10px; gap: 6px; flex: 1; min-width: 140px;
}
.fb-icon { font-size: 1rem; color: var(--gray); flex-shrink: 0; }
.fb-input {
  background: none; border: none; outline: none; color: var(--white);
  font-family: var(--font-sans); font-size: 0.8rem; padding: 8px 0; flex: 1; min-width: 0;
}
.fb-input::placeholder { color: var(--gray); }
.fb-clear { background: none; border: none; color: var(--gray); cursor: pointer; font-size: 1rem; padding: 0; }
.fb-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.pill {
  padding: 5px 10px; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em;
  background: none; border: 1px solid var(--border); color: var(--gray);
  cursor: pointer; text-transform: uppercase; transition: all 0.15s; white-space: nowrap;
}
.pill:hover  { border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.9); }
.pill.active { border-color: rgba(255,200,80,0.7); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.06); }
.fb-meta { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); white-space: nowrap; }

/* ═══════════════════════════════════════════════════════════════
   DATA TABLES
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
.reports-table .dt-head { grid-template-columns: 2fr 65px 1fr 1.5fr 70px 80px 100px; }
.warn-table    .dt-head { grid-template-columns: 1.8fr 65px 70px 90px 1.5fr 75px 95px; }
.disc-table    .dt-head { grid-template-columns: 2fr 70px 65px 60px 80px 90px 90px; }
.dt-row {
  display: grid; padding: 10px 16px; gap: 10px; align-items: center;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.15s;
  border-left: 2px solid transparent;
}
.dt-row:hover { background: rgba(240,240,234,0.03); border-left-color: rgba(255,200,80,0.35); }
.reports-table .dt-row { grid-template-columns: 2fr 65px 1fr 1.5fr 70px 80px 100px; }
.warn-table    .dt-row { grid-template-columns: 1.8fr 65px 70px 90px 1.5fr 75px 95px; }
.disc-table    .dt-row { grid-template-columns: 2fr 70px 65px 60px 80px 90px 90px; cursor: default; }
.dt-user { display: flex; align-items: center; gap: 8px; min-width: 0; }
.dt-avatar {
  width: 28px; height: 28px; border: 1px solid var(--border); flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.58rem; color: var(--white);
  background: rgba(240,240,234,0.06);
}
.dt-avatar.avatar-warn { border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.9); background: rgba(255,200,80,0.06); }
.dt-user-info { display: flex; flex-direction: column; min-width: 0; }
.dt-name  { font-size: 0.78rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dt-email { font-family: var(--font-mono); font-size: 0.58rem; color: var(--gray); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mono { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); }
.dim  { color: var(--gray) !important; }
.stream-tag {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: var(--gray); border: 1px solid var(--border); padding: 2px 6px; white-space: nowrap;
}
.reason-text { font-size: 0.76rem; color: var(--gray); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.dt-target   { font-size: 0.76rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.disc-title  { font-size: 0.78rem; color: var(--white); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.type-badge {
  font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px; border: 1px solid; white-space: nowrap;
}
.type-question { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.25); }
.type-user     { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25); }

.sev-badge {
  font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px; border: 1px solid; white-space: nowrap; text-transform: uppercase;
}
.sev-high { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.07); }
.sev-med  { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.07);  }
.sev-low  { color: var(--gray);            border-color: var(--border); }

.status-badge {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  padding: 2px 7px; text-transform: uppercase; border: 1px solid; white-space: nowrap;
}
.status-badge.open      { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.07); }
.status-badge.resolved  { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.07); }
.status-badge.dismissed { color: var(--gray);            border-color: var(--border); }
.status-badge.pending   { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.07); }
.status-badge.approved  { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.07); }
.status-badge.rejected  { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.07); }
.status-badge.warned    { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.07); }
.status-badge.watched   { color: rgba(255,200,80,0.7);  border-color: rgba(255,200,80,0.2); }
.status-badge.clear     { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.2); }
.status-badge.flagged   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.07); }
.status-badge.locked    { color: var(--gray);            border-color: var(--border); background: rgba(240,240,234,0.04); }

.warn-count { font-family: var(--font-mono); font-size: 1rem; font-weight: 700; color: var(--gray); }
.warn-high  { color: rgba(255,100,100,0.9); }
.warn-med   { color: rgba(255,200,80,0.9); }

.flag-count { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.flag-high  { color: rgba(255,100,100,0.9); }
.flag-med   { color: rgba(255,200,80,0.9); }

.diff-badge { font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px; border: 1px solid; white-space: nowrap; }
.diff-easy  { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.2); }
.diff-mid   { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.2); }
.diff-hard  { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.2); }

.dt-actions { display: flex; gap: 4px; align-items: center; }
.act-btn {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  background: none; border: 1px solid var(--border); cursor: pointer;
  font-size: 0.72rem; color: var(--gray); transition: all 0.15s; flex-shrink: 0;
}
.act-btn:hover       { border-color: rgba(255,200,80,0.4); color: rgba(255,200,80,0.9); }
.act-btn.ban:hover   { border-color: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); }
.act-btn.unban:hover { border-color: rgba(120,230,120,0.5); color: rgba(120,230,120,0.9); }
.flag-btn:hover      { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.9); }
.fix-btn:hover       { border-color: rgba(120,230,120,0.5); color: rgba(120,230,120,0.9); }

.fix-divider {
  display: flex; align-items: center; gap: 12px; margin: 4px 0;
}
.fix-divider::before, .fix-divider::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}
.fix-divider-label {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.18em; color: var(--gray); white-space: nowrap;
}
.fix-note {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(120,230,120,0.25);
  background: rgba(120,230,120,0.04);
  font-size: 0.76rem; color: var(--gray); line-height: 1.5;
}
.fix-note span:first-child { color: rgba(120,230,120,0.8); flex-shrink: 0; }
.fix-note strong            { color: rgba(120,230,120,0.9); }

.pagination { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-top: 1px solid var(--border); }
.pg-btn  { font-size: 0.68rem !important; padding: 6px 12px !important; }
.pg-info { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); }

/* ═══════════════════════════════════════════════════════════════
   QUEUE CARDS
═══════════════════════════════════════════════════════════════ */

.queue-card:hover { border-color: rgba(255,200,80,0.3); }

.add-q-btn {
  font-family: var(--font-mono) !important;
  font-size: 0.65rem !important;
  padding: 7px 14px !important;
  white-space: nowrap;
  margin-left: auto;
}

.submit-note {
  display: flex; align-items: flex-start; gap: 8px;
  padding: 10px 14px;
  border: 1px solid rgba(255,200,80,0.25);
  background: rgba(255,200,80,0.04);
  font-size: 0.76rem; color: var(--gray); line-height: 1.5;
}
.submit-note strong { color: rgba(255,200,80,0.9); }
.submit-note-icon   { color: rgba(255,200,80,0.7); flex-shrink: 0; font-size: 0.8rem; margin-top: 1px; }
.mt4 { margin-top: 4px; }

/* ═══════════════════════════════════════════════════════════════
   ACTIVITY TAB
═══════════════════════════════════════════════════════════════ */
.activity-layout { display: grid; grid-template-columns: 1fr 280px; gap: 20px; }
.act-log-panel   {}
.act-log-list    { display: flex; flex-direction: column; max-height: 460px; overflow-y: auto; }
.act-log-list::-webkit-scrollbar { width: 2px; }
.act-log-list::-webkit-scrollbar-thumb { background: var(--border-bright); }
.act-log-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 16px; border-bottom: 1px solid var(--border);
  border-left: 2px solid transparent; transition: background 0.15s;
}
.act-log-item:hover { background: rgba(240,240,234,0.02); }
.log-type-badge {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.08em;
  padding: 2px 7px; border: 1px solid var(--border); color: var(--gray); flex-shrink: 0;
}
.lbadge-approve { border-color: rgba(120,230,120,0.25); color: rgba(120,230,120,0.7); }
.lbadge-reject  { border-color: rgba(255,100,100,0.25); color: rgba(255,100,100,0.7); }
.lbadge-warn    { border-color: rgba(255,200,80,0.25);  color: rgba(255,200,80,0.7); }

.act-sidebar { display: flex; flex-direction: column; gap: 20px; }
.act-summary { padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.act-sum-row { display: flex; align-items: center; gap: 10px; }
.sum-label   { font-family: var(--font-mono); font-size: 0.62rem; color: var(--gray); width: 70px; flex-shrink: 0; }
.sum-bar-wrap{ flex: 1; height: 3px; background: var(--border); }
.sum-bar { height: 100%; transition: width 0.8s ease; }
.sum-bar--green { background: rgba(120,230,120,0.6); }
.sum-bar--red   { background: rgba(255,100,100,0.6); }
.sum-bar--amber { background: rgba(255,200,80,0.6); }
.sum-bar--gray  { background: rgba(240,240,234,0.2); }
.sum-val { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); width: 24px; text-align: right; flex-shrink: 0; }

.quick-links { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
.ql-btn { font-size: 0.68rem !important; padding: 9px 14px !important; text-align: left !important; }

.scope-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 6px; }
.scope-item { display: flex; align-items: center; gap: 8px; font-size: 0.76rem; }
.scope-item.allowed { color: var(--white); }
.scope-item.denied  { color: var(--gray); text-decoration: line-through; opacity: 0.5; }
.scope-icon { font-size: 0.7rem; flex-shrink: 0; width: 14px; }
.scope-item.allowed .scope-icon { color: rgba(120,230,120,0.8); }
.scope-item.denied  .scope-icon { color: rgba(255,100,100,0.6); }

/* ═══════════════════════════════════════════════════════════════
   MISC
═══════════════════════════════════════════════════════════════ */
.empty-state {
  padding: 2rem; text-align: center;
  font-family: var(--font-mono); font-size: 0.72rem; color: var(--gray);
}

/* ═══════════════════════════════════════════════════════════════
   MODALS
═══════════════════════════════════════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 1000;
  background: rgba(8,8,8,0.88);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px); padding: 16px;
}
.modal-box {
  background: var(--black); border: 1px solid var(--border-bright);
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.06);
  width: 100%; max-width: 520px; max-height: 90vh; overflow-y: auto;
}
.modal-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 18px; border-bottom: 1px solid var(--border);
}
.modal-close { background: none; border: none; color: var(--gray); font-size: 1.3rem; cursor: pointer; line-height: 1; padding: 0; transition: color 0.15s; }
.modal-close:hover { color: var(--white); }
.modal-body { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; }
.modal-field { display: flex; align-items: center; gap: 12px; }
.mf-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.14em; color: var(--gray); width: 100px; flex-shrink: 0; white-space: nowrap; }
.mf-val   { font-size: 0.8rem; color: var(--white); }
.mf-group { display: flex; flex-direction: column; gap: 5px; }
.mf-input {
  width: 100%; box-sizing: border-box;
  /*background: rgba(240,240,234,0.03); border: 1px solid var(--border);*/
  background: #191818; border: 1px solid var(--border);
  color: var(--white); font-family: var(--font-sans); font-size: 0.8rem;
  padding: 8px 12px; outline: none; transition: border-color 0.15s;
}
.mf-input:focus { border-color: rgba(255,200,80,0.4); }
.mf-input::placeholder { color: var(--gray); }
.mf-textarea { resize: vertical; }
.modal-user-hero { display: flex; align-items: center; gap: 14px; padding-bottom: 14px; border-bottom: 1px solid var(--border); margin-bottom: 4px; }
.big-avatar { width: 44px; height: 44px; font-size: 0.8rem; }
.modal-name  { font-family: var(--font-mono); font-size: 0.95rem; color: var(--white); }
.modal-email { font-size: 0.68rem; margin-bottom: 6px; }
.modal-badges { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.modal-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; padding: 14px 18px; border-top: 1px solid var(--border); }

/* ═══════════════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════════════ */
.mod-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 2000;
  padding: 12px 20px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em;
  background: var(--black); color: var(--white);
  border: 1px solid var(--border-bright);
  border-left: 3px solid rgba(255,200,80,0.8);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06);
}
.mod-toast.error { border-left-color: rgba(255,100,100,0.8); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.25s ease; }
.toast-slide-enter-from { transform: translateX(20px); opacity: 0; }
.toast-slide-leave-to   { transform: translateX(20px); opacity: 0; }

/* ═══════════════════════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════════════════════ */
.queue-stat-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px; background: var(--border);
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.qsr-card {
  background: #0d0d0d; padding: 1.2rem 1.4rem;
  display: flex; flex-direction: column; gap: 4px;
  border-left: 2px solid transparent; transition: border-color 0.2s, background 0.2s;
}
.qsr-card:hover { background: #111; }
.qsr-val {
  font-family: var(--font-mono); font-size: 1.6rem;
  font-weight: 700; line-height: 1; letter-spacing: -0.5px;
}
.qsr-neutral { color: var(--white); }
.qsr-amber   { color: rgba(255,200,80,0.9); }
.qsr-green   { color: rgba(120,230,120,0.9); }
.qsr-red     { color: rgba(255,100,100,0.9); }
.qsr-label {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray);
}

.pill-count {
  display: inline-flex; align-items: center; justify-content: center;
  min-width: 16px; height: 16px; padding: 0 4px;
  font-size: 0.5rem; background: rgba(255,200,80,0.12);
  color: rgba(255,200,80,0.9); margin-left: 4px; font-family: var(--font-mono);
}

.my-queue-list { display: flex; flex-direction: column; gap: 12px; }

.mq-card {
  border: 1px solid var(--border);
  background: rgba(240,240,234,0.02);
  padding: 16px 18px;
  transition: border-color 0.15s;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.03);
}
.mq-card:hover { border-color: var(--border-bright); }
.mq-pending  { border-left: 2px solid rgba(255,200,80,0.5); }
.mq-approved { border-left: 2px solid rgba(120,230,120,0.45); }
.mq-rejected { border-left: 2px solid rgba(255,100,100,0.4); }

.mq-top {
  display: flex; align-items: center;
  justify-content: space-between; gap: 12px;
  margin-bottom: 10px; flex-wrap: wrap;
}
.mq-meta         { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mq-status-group { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.mq-date         { font-size: 0.63rem; }
.mq-text {
  font-family: var(--font-sans); font-size: 0.9rem;
  color: var(--white); line-height: 1.4; margin-bottom: 12px;
}
.mq-admin-note {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 9px 12px; margin-bottom: 12px;
  border: 1px solid rgba(255,100,100,0.2);
  background: rgba(255,100,100,0.04);
}
.man-label {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,100,100,0.7); flex-shrink: 0; padding-top: 2px;
}
.man-text { font-size: 0.78rem; color: rgba(255,100,100,0.85); line-height: 1.4; }

.mq-footer        { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.mq-pending-info  { display: flex; align-items: center; gap: 8px; }
.mq-approved-info { display: flex; align-items: center; }
.mq-rejected-info { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px; flex-wrap: wrap; }

.mq-spinner {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1.5px solid rgba(255,200,80,0.2);
  border-top-color: rgba(255,200,80,0.8);
  animation: spin 1s linear infinite; flex-shrink: 0;
}
@keyframes spin { to { transform: rotate(360deg); } }

.mq-resubmit-btn {
  font-size: 0.65rem !important; padding: 5px 12px !important;
  border-color: rgba(255,200,80,0.3) !important;
  color: rgba(255,200,80,0.8) !important;
}
.mq-resubmit-btn:hover {
  border-color: rgba(255,200,80,0.7) !important;
  color: rgba(255,200,80,1) !important;
}

.mq-empty {
  display: flex; flex-direction: column; align-items: center;
  gap: 14px; padding: 3rem 1rem;
  border: 1px solid var(--border); text-align: center;
}

@media (max-width: 1024px) {
  .ov-row          { grid-template-columns: 1fr 320px; }
  .activity-layout { grid-template-columns: 1fr; }
  .page-header     { flex-direction: column; align-items: flex-start; gap: 1.2rem; }
  .header-stat-card{ min-width: unset; width: 100%; box-sizing: border-box; }
  .queue-stat-row  { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .ov-row       { grid-template-columns: 1fr; }
  .ov-sidebar   { display: contents; }
  .queue-stat-row { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .tab-body     { padding: 14px; gap: 14px; }
  .page-header  { padding: 1.2rem; }
  .page-title   { font-size: 1.3rem; }
  .filter-bar   { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; gap: 6px; }
  .filter-bar::-webkit-scrollbar { display: none; }
  .fb-pills     { flex-wrap: nowrap; }
  .modal-overlay{ align-items: flex-end; padding: 0; }
  .modal-box    { max-width: 100%; max-height: 85vh; }
  .mq-rejected-info { flex-direction: column; align-items: flex-start; }
  .mq-top       { flex-direction: column; align-items: flex-start; }
}

@media (max-width: 480px) {
  .tab-body       { padding: 10px; gap: 10px; }
  .page-header    { padding: 1rem; }
  .page-title     { font-size: 1.15rem; }
  .hsc-value      { font-size: 1.6rem; }
  .queue-stat-row { grid-template-columns: 1fr 1fr; }
  .qsr-val        { font-size: 1.3rem; }
  .mq-card        { padding: 12px; }
}
/* ═══════════════════════════════════════════════════════════════
   SUBMIT QUESTION MODAL — TABS & EXTRACTOR
═══════════════════════════════════════════════════════════════ */
.add-q-tabs {
  display: flex; border-bottom: 1px solid var(--border);
}
.add-q-tab {
  flex: 1; padding: 10px 0;
  background: none; border: none; border-bottom: 2px solid transparent;
  color: var(--gray); font-family: var(--font-mono); font-size: 0.68rem;
  letter-spacing: 0.1em; cursor: pointer; transition: all 0.15s;
  margin-bottom: -1px;
}
.add-q-tab:hover { color: var(--white); }
.add-q-tab--active { color: var(--white); border-bottom-color: var(--white); }

/* Modal form layout (used by submitQuestion) */
.modal-form { padding: 16px 18px; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 70vh; }
.mf-row   { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.mt4 { margin-top: 4px !important; }

/* Image Extractor */
.img-extract-panel { border: 1px solid var(--border); background: rgba(240,240,234,0.02); }
.img-extract-toggle {
  width: 100%; display: flex; align-items: center; gap: 8px;
  padding: 10px 14px; background: none; border: none; cursor: pointer;
  color: var(--white); font-family: var(--font-mono); font-size: 0.7rem;
  letter-spacing: 0.1em; text-align: left; transition: background 0.15s;
}
.img-extract-toggle:hover { background: rgba(240,240,234,0.04); }
.img-extract-arrow { margin-left: auto; font-size: 0.55rem; color: var(--gray); }
.img-extract-body { padding: 12px 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; }

.img-drop-zone {
  border: 1px dashed var(--border-bright); cursor: pointer;
  min-height: 110px; display: flex; align-items: center; justify-content: center;
  transition: border-color 0.15s; overflow: hidden; position: relative;
}
.img-drop-zone:hover { border-color: rgba(240,240,234,0.5); }
.img-drop-zone.has-file { min-height: unset; }
.img-drop-hint { display: flex; flex-direction: column; align-items: center; gap: 5px; color: var(--gray); font-family: var(--font-sans); font-size: 0.74rem; padding: 18px; }
.img-drop-icon { font-size: 1.6rem; }
.img-preview   { max-width: 100%; max-height: 220px; display: block; object-fit: contain; }

.img-error { font-family: var(--font-mono); font-size: 0.66rem; color: rgba(255,100,100,0.85); border: 1px solid rgba(255,100,100,0.25); padding: 6px 10px; }
.img-extract-actions { display: flex; gap: 8px; align-items: center; }
.img-extract-btn     { font-size: 0.72rem !important; padding: 8px 16px !important; }
.img-spinner { display: inline-block; animation: spin 0.9s linear infinite; margin-right: 4px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Single form flags */
.single-flags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 4px; }
.flag-badge   { font-family: var(--font-mono); font-size: 0.55rem; padding: 1px 5px; border: 1px solid; line-height: 1.4; white-space: nowrap; }
.flag-warn    { border-color: rgba(255,200,80,0.4);  color: rgba(255,200,80,0.9);  }
.flag-dup     { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }

/* ── Bulk import ─────────────────────────────────────────── */
.bulk-form { gap: 14px; }
.bulk-drop-zone   { min-height: 130px; }
.bulk-img-preview { max-height: 160px; }

.bulk-mode-badge { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em; padding: 3px 9px; border: 1px solid var(--border-bright); color: var(--gray); align-self: center; }
.red-dot-badge { border-color: rgba(255,100,100,0.4); color: rgba(255,140,140,0.9); }

.bulk-review { display: flex; flex-direction: column; gap: 0; margin-top: 4px; }
.bulk-review-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; margin-bottom: 4px; gap: 8px; flex-wrap: wrap; }
.bulk-review-title  { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.12em; color: var(--gray); }
.bulk-review-controls { display: flex; gap: 6px; }

.bulk-table { border: 1px solid var(--border); }
.bulk-table-head {
  display: grid;
  grid-template-columns: 28px 36px 40px 1fr 160px 36px 60px 28px;
  gap: 0; padding: 6px 10px;
  background: rgba(240,240,234,0.04); border-bottom: 1px solid var(--border);
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; color: var(--gray); align-items: center;
}
.bulk-row { border-bottom: 1px solid var(--border); transition: background 0.1s; }
.bulk-row:last-child { border-bottom: none; }
.bulk-row:hover { background: rgba(240,240,234,0.02); }
.bulk-row--unchecked { opacity: 0.4; }
.bulk-row-main { display: grid; grid-template-columns: 28px 36px 40px 1fr 160px 36px 60px 28px; gap: 0; padding: 8px 10px; align-items: center; }

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

.btc-check { display: flex; align-items: center; }
.btc-flags { display: flex; align-items: center; gap: 3px; }
.bulk-checkbox { accent-color: var(--white); cursor: pointer; width: 13px; height: 13px; }
.btc-num { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); display: flex; align-items: center; gap: 3px; }
.reddot-badge { font-size: 0.55rem; }
.bulk-q-text { font-family: var(--font-sans); font-size: 0.76rem; color: var(--white); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bulk-meta-text { display: flex; flex-direction: column; gap: 2px; padding: 0 6px; }
.bulk-subject { font-family: var(--font-mono); font-size: 0.6rem; color: var(--white); letter-spacing: 0.05em; }
.bulk-chapter { font-family: var(--font-sans); font-size: 0.62rem; color: var(--gray); line-height: 1.2; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
.btc-ans { display: flex; align-items: center; justify-content: center; }
.bulk-answer-badge { font-family: var(--font-mono); font-size: 0.68rem; font-weight: 600; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border-bright); color: var(--white); }
.btc-diff { display: flex; align-items: center; }
.bulk-diff-badge { font-family: var(--font-mono); font-size: 0.58rem; padding: 2px 7px; border: 1px solid var(--border); }
.bulk-diff-badge.diff-easy   { border-color: rgba(120,230,120,0.3); color: rgba(120,230,120,0.8); }
.bulk-diff-badge.diff-medium { border-color: rgba(255,200,80,0.3);  color: rgba(255,200,80,0.8);  }
.bulk-diff-badge.diff-hard   { border-color: rgba(255,100,100,0.3); color: rgba(255,100,100,0.8); }
.btc-expand { display: flex; align-items: center; justify-content: center; }
.bulk-expand-btn { background: none; border: none; color: var(--gray); cursor: pointer; font-size: 0.6rem; padding: 2px 4px; transition: color 0.15s; }
.bulk-expand-btn:hover { color: var(--white); }

/* ── Question image field ─────────────────────────────────── */
.qimg-field { border: 1px solid var(--border); padding: 10px 12px; min-height: 52px; }
.qimg-uploading { font-family: var(--font-mono); font-size: 0.68rem; color: var(--gray); display: flex; align-items: center; gap: 6px; }
.qimg-preview-wrap { display: flex; flex-direction: column; gap: 8px; }
.qimg-preview { max-width: 100%; max-height: 160px; object-fit: contain; border: 1px solid var(--border); }
.qimg-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.qimg-status { font-family: var(--font-mono); font-size: 0.62rem; color: var(--gray); }
.qimg-reupload-btn { font-size: 0.65rem !important; padding: 4px 10px !important; }
.qimg-empty { font-family: var(--font-sans); font-size: 0.72rem; color: var(--gray); }
.brd-qimg { max-width: 100%; max-height: 160px; object-fit: contain; border: 1px solid var(--border); }

/* ── Cropper modal ────────────────────────────────────────── */
.cropper-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.85);
  display: flex; align-items: center; justify-content: center; padding: 20px;
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
.cropper-body { flex: 1; overflow: hidden; padding: 12px; background: #111; }
.cropper-body img { max-height: 60vh; }
</style>
