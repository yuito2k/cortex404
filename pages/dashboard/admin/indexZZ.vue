<script setup>
definePageMeta({ middleware: 'auth', layout: 'admin' })
// NOTE: In production, also add an admin-role guard here:
const { data: profile } = await useSupabaseClient().from('profiles').select('role').single()
if (profile?.role !== 'admin') navigateTo('/dashboard')

import { ref, reactive, computed } from 'vue'
const supabaseHSC = useSupabaseHSC()
const supabaseMedical = useSupabaseMedical()

let questionEN = ref('')
let questionBN = ref('')

let subjectEN = ref('')
let subjectBN = ref('')

let chapterEN = ref('')
let chapterBN = ref('')

let yearEN = ref('')

let streamEN = ref('')

let difficultyEN = ref('')

let optionsEN = ref([])
let optionsBN = ref([])

let answerEN = ref('')

let explanationEN = ref('')
let explanationBN = ref('')

let statusQuestion = ref('')

// ─── Image extraction ─────────────────────────────────────────
const imgFile        = ref(null)
const imgPreview     = ref('')
const imgExtracting  = ref(false)
const imgError       = ref('')
const imgPanelOpen   = ref(false)

function onImgFileChange(e) {
  const f = e.target.files?.[0]
  if (!f) return
  imgFile.value    = f
  imgPreview.value = URL.createObjectURL(f)
  imgError.value   = ''
}

async function extractFromImage() {
  if (!imgFile.value) return
  imgExtracting.value = true
  imgError.value = ''

  try {
    // 1. Extract raw text from image via Nuxt API (Gemini)
    const formData = new FormData()
    formData.append('image', imgFile.value)
    const raw = await $fetch('/api/extract-text', { method: 'POST', body: formData })
    const rawText = raw.text || ''

    const res = await fetch('/api/parse-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: rawText })
    })
    const data = await res.json()
    const jsonStr = data.result || ''

    let parsed
    try { parsed = JSON.parse(jsonStr) }
    catch { throw new Error('Claude returned invalid JSON. Raw: ' + jsonStr.slice(0, 200)) }

    // 3. Auto-fill all form fields
    questionBN.value     = parsed.questionBN  || ''
    questionEN.value     = parsed.questionEN  || ''
    optionsBN.value      = parsed.optionsBN   || ['','','','']
    optionsEN.value      = parsed.optionsEN   || ['','','','']
    answerEN.value       = parsed.answerEN    || 'A'
    explanationBN.value  = parsed.explanationBN || ''
    explanationEN.value  = parsed.explanationEN || ''

    imgPanelOpen.value = false   // collapse the upload panel after success
    showToast('Fields auto-filled from image ✓')

  } catch (err) {
    console.error(err)
    imgError.value = err.message || 'Extraction failed. Check console.'
  } finally {
    imgExtracting.value = false
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
  { id:1,  name:'Tanvir Ahmed',    email:'tanvir@gmail.com',   stream:'HSC',     exams:34,  score:82, joined:'2024-11-01', status:'active',     role:'user'  },
  { id:2,  name:'Farida Khanam',   email:'farida@yahoo.com',   stream:'Medical', exams:61,  score:91, joined:'2024-10-14', status:'active',     role:'user'  },
  { id:3,  name:'Rafiq Islam',     email:'rafiq@gmail.com',    stream:'BUET',    exams:27,  score:74, joined:'2025-01-03', status:'banned',     role:'user'  },
  { id:4,  name:'Maliha Sultana',  email:'maliha@hotmail.com', stream:'BCS',     exams:88,  score:88, joined:'2024-09-22', status:'active',     role:'user'  },
  { id:5,  name:'Jahid Hasan',     email:'jahid@gmail.com',    stream:'SSC',     exams:12,  score:67, joined:'2025-02-11', status:'unverified', role:'user'  },
  { id:6,  name:'Nusrat Jahan',    email:'nusrat@gmail.com',   stream:'HSC',     exams:45,  score:79, joined:'2024-12-05', status:'active',     role:'user'  },
  { id:7,  name:'Sabbir Rahman',   email:'sabbir@gmail.com',   stream:'DU',      exams:19,  score:71, joined:'2025-01-19', status:'active',     role:'user'  },
  { id:8,  name:'Priya Roy',       email:'priya@gmail.com',    stream:'Medical', exams:53,  score:86, joined:'2024-08-30', status:'active',     role:'user'  },
  { id:9,  name:'Kamrul Islam',    email:'kamrul@gmail.com',   stream:'Bank',    exams:31,  score:73, joined:'2025-03-01', status:'active',     role:'user'  },
  { id:10, name:'Sadia Akter',     email:'sadia@gmail.com',    stream:'BCS',     exams:72,  score:84, joined:'2024-11-17', status:'active',     role:'user'  },
  { id:11, name:'Alamin Hossain',  email:'alamin@gmail.com',   stream:'BUET',    exams:9,   score:60, joined:'2025-04-02', status:'unverified', role:'user'  },
  { id:12, name:'Rima Begum',      email:'rima@gmail.com',     stream:'HSC',     exams:40,  score:77, joined:'2024-12-22', status:'active',     role:'user'  },
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

const reviewQueue = ref([
  { id:101, text:'What is the Krebs cycle?',                    stream:'Medical', subject:'Biology',   diff:'Medium', submittedBy:'Moderator A', status:'pending',  date:'2025-05-09' },
  { id:102, text:'Solve for x: 3x² + 5x - 2 = 0',             stream:'BUET',    subject:'Math',      diff:'Hard',   submittedBy:'Moderator B', status:'pending',  date:'2025-05-09' },
  { id:103, text:'Who was the first President of Bangladesh?',  stream:'BCS',     subject:'History',   diff:'Easy',   submittedBy:'Moderator A', status:'pending',  date:'2025-05-08' },
  { id:104, text:'What does RAM stand for?',                    stream:'SSC',     subject:'ICT',       diff:'Easy',   submittedBy:'Moderator C', status:'approved', date:'2025-05-08' },
  { id:105, text:"Define Newton's third law",                   stream:'HSC',     subject:'Physics',   diff:'Medium', submittedBy:'Moderator B', status:'pending',  date:'2025-05-07' },
  { id:106, text:'What is the capital of France?',             stream:'BCS',     subject:'GK',        diff:'Easy',   submittedBy:'Moderator A', status:'rejected', date:'2025-05-07', note:'Too generic' },
  { id:107, text:'Find derivative of sin²(x)',                 stream:'DU',      subject:'Math',      diff:'Medium', submittedBy:'Moderator C', status:'pending',  date:'2025-05-06' },
  { id:108, text:'What is the atomic number of gold?',         stream:'HSC',     subject:'Chemistry', diff:'Easy',   submittedBy:'Moderator A', status:'pending',  date:'2025-05-05' },
  { id:109, text:'Binary search time complexity?',             stream:'BUET',    subject:'CS',        diff:'Medium', submittedBy:'Moderator B', status:'approved', date:'2025-05-05' },
  { id:110, text:'What is photosynthesis?',                    stream:'SSC',     subject:'Biology',   diff:'Easy',   submittedBy:'Moderator C', status:'pending',  date:'2025-05-04' },
])

const filteredReviewQueue = computed(() => {
  let list = reviewQueue.value
  if (queueFilter.value !== 'all') list = list.filter(q => q.status === queueFilter.value)
  if (queueStream.value !== 'All') list = list.filter(q => q.stream === queueStream.value)
  if (queueSearch.value) { const s = queueSearch.value.toLowerCase(); list = list.filter(q => q.text.toLowerCase().includes(s)) }
  return list
})

function adminApproveQ(q) {
  q.status = 'approved'
  showToast('Question approved and published.')
}
function adminRejectQ(q) {
  q.status = 'rejected'
  showToast('Question rejected.', 'error')
}

// ─── Questions tab ────────────────────────────────────────────
const qSearch = ref('')
const qStream = ref('All')
const qDiff   = ref('All')
const qStatus = ref('All')
const streams     = ['All','SSC','HSC','BUET','Medical','DU','BCS','Bank']
const difficulties = ['All','Easy','Medium','Hard']
const qStatuses   = ['All','Published','Draft','Flagged']

function toBengaliDigits(str) {
  return str.replace(/[0-9]/g, d => '০১২৩৪৫৬৭৮৯'[d])
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

    question: {
      english: questionEN.value,
      bangla: questionBN.value || null,
    },

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

    year: yearEN.value
      ? { english: yearEN.value, bangla: toBengaliDigits(yearEN.value) }
      : null,

    correct_index: correctIndex,
    difficulty_level: difficultyEN.value?.toLowerCase() || 'medium',  // scalar col too
    status: statusQuestion.value?.toLowerCase() || 'published',
  }

  // Edit vs Add
  if (modal.type === 'editQuestion' && modal.data?.id) {
    const supabase = streamEN.value === 'HSC' ? supabaseHSC : supabaseMedical

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
    const supabase = streamEN.value === 'HSC' ? supabaseHSC : supabaseMedical

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
  { id:1,  text:'What is the SI unit of electric charge?',           stream:'HSC',    subject:'Physics',  diff:'Easy',   status:'Published', reports:0 },
  { id:2,  text:'Solve: lim(x→0) sin(x)/x',                        stream:'BUET',   subject:'Math',     diff:'Medium', status:'Published', reports:1 },
  { id:3,  text:'Which organelle is called the powerhouse of the cell?', stream:'Medical',subject:'Biology',diff:'Easy',status:'Published', reports:0 },
  { id:4,  text:'The Treaty of Westphalia was signed in which year?',stream:'BCS',    subject:'History',  diff:'Medium', status:'Draft',     reports:0 },
  { id:5,  text:'What is the valency of carbon?',                   stream:'SSC',    subject:'Chemistry',diff:'Easy',   status:'Published', reports:0 },
  { id:6,  text:'Binary representation of decimal 255 is?',         stream:'BUET',   subject:'CS',       diff:'Easy',   status:'Published', reports:0 },
  { id:7,  text:'Who wrote "Amar Sonar Bangla"?',                   stream:'BCS',    subject:'Bangla',   diff:'Easy',   status:'Flagged',   reports:3 },
  { id:8,  text:"What is Avogadro's number?",                       stream:'HSC',    subject:'Chemistry',diff:'Medium', status:'Published', reports:0 },
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
  { id:1,  user:'Tanvir Ahmed',   stream:'HSC',    subject:'Physics', score:88, qs:30, date:'2025-05-07', status:'passed'  },
  { id:2,  user:'Farida Khanam', stream:'Medical',subject:'Biology', score:94, qs:50, date:'2025-05-07', status:'passed'  },
  { id:3,  user:'Maliha Sultana',stream:'BCS',    subject:'General', score:62, qs:50, date:'2025-05-06', status:'passed'  },
  { id:4,  user:'Jahid Hasan',   stream:'SSC',    subject:'Math',    score:44, qs:20, date:'2025-05-06', status:'failed'  },
  { id:5,  user:'Nusrat Jahan',  stream:'HSC',    subject:'Bangla',  score:77, qs:30, date:'2025-05-05', status:'passed'  },
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

        <div class="queue-cards">
          <div class="queue-card" v-for="q in filteredReviewQueue" :key="q.id" :class="'qcard-'+q.status">
            <div class="qcard-top">
              <div class="qcard-meta">
                <span class="stream-tag">{{ q.stream }}</span>
                <span class="mono dim">{{ q.subject }}</span>
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
            <div class="modal-form">

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
                      :disabled="!imgFile || imgExtracting"
                      @click="extractFromImage"
                    >
                      <span v-if="imgExtracting" class="img-spinner">◌</span>
                      {{ imgExtracting ? 'Extracting & Translating…' : '⚡ Extract & Auto-fill Fields' }}
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
                <label class="mf-label">QUESTION TEXT (English)</label>
                <textarea v-model="questionEN" class="mf-input mf-textarea" placeholder="Enter question…" rows="3"></textarea>
                <label class="mf-label">QUESTION TEXT (Bengali)</label>
                <textarea v-model="questionBN" class="mf-input mf-textarea" placeholder="Enter question…" rows="3"></textarea>
              </div>
              <br>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">STREAM</label>
                  <select v-model="streamEN" class="mf-input mf-select">
                    <option v-for="s in ['SSC','HSC','BUET','Medical','DU','BCS','Bank']" :key="s">{{ s }}</option>
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
                <label class="mf-label">SOURCE</label>
                <input v-model="sourceEN" class="mf-input" placeholder="Source (e.g. Board or School name)" />
              </div>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">SUBJECT (English)</label>
                  <select v-model="subjectEN" class="mf-input mf-select">
                    <option v-for="s in ['Physics','Chemistry','Math','Biology','English','Bangla','General Knowledge']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">SUBJECT (Bangla)</label>
                  <select v-model="subjectBN" class="mf-input mf-select">
                    <option v-for="s in ['পদার্থবিজ্ঞান','রসায়ন','গণিত','জীববিজ্ঞান','ইংরেজি','বাংলা','সাধারণ জ্ঞান']" :key="s">{{ s }}</option>
                  </select>
                </div>
              </div>
              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">CHAPTER (English)</label>
                  <select v-model="chapterEN" class="mf-input mf-select">
                    <option v-for="s in ['Newtonian Mechanics','Thermodynamics','Waves','Optics','Modern Physics','Electricity and Magnetism','Modern Physics','Electricity and Magnetism']" :key="s">{{ s }}</option>
                  </select>
                </div>
                <div class="mf-group">
                  <label class="mf-label">CHAPTER (Bangla)</label>
                  <select v-model="chapterBN" class="mf-input mf-select">
                    <option v-for="s in ['নিউটনিয়ান মেকানিক্স','তাপগতিবিদ্যা','তরঙ্গ','আলোকবিজ্ঞান','আধুনিক পদার্থবিজ্ঞান','তড়িৎ ও চুম্বকত্ব','আধুনিক পদার্থবিজ্ঞান','তড়িৎ ও চুম্বকত্ব']" :key="s">{{ s }}</option>
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
            <div class="modal-actions">
              <button class="iso-btn iso-btn--ghost" @click="closeModal()">Cancel</button>
              <button class="iso-btn iso-btn--fill" @click="saveQuestion(); closeModal()">Save Question</button>
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
              <textarea class="mf-input mf-textarea" rows="3" placeholder="E.g. Answer key is incorrect, duplicate, out of scope…"></textarea>
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
</style>
