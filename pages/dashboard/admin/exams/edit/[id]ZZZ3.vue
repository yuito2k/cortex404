<script setup>
definePageMeta({ middleware: 'auth', layout: 'admin' })

import { curriculum } from '~/utils/curriculum'
import { renderLatexText } from '~/utils/renderLatex'

const supabase        = useSupabaseClient()
const supabaseHSC     = useSupabaseHSC()
const supabaseMedical = useSupabaseMedical()
const user            = useSupabaseUser()
const router          = useRouter()
const route           = useRoute()
const examId          = route.params.id

// ─── Sidebar & layout ────────────────────────────────────────
const sidebarCollapsed = ref(
  typeof window !== 'undefined' && window.innerWidth <= 1024
)
const mobileDrawerOpen = ref(false)
const activeTab = ref('exams')

// Handle quick actions from topbar
function handleAction(type) {
  if (type === 'addQuestion') navigateTo('/dashboard/admin/questions?open=addQuestion')
  else if (type === 'announcement') navigateTo('/dashboard/admin/content?open=announcement')
}

// ─── System health (for topbar pill) ──────────────────────────
const systemStatus = ref('ok')

// ─── Toast ───────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', type: 'success' })
function showToast(msg, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3500)
}

// ─── Mode & Step ─────────────────────────────────────────────────
const mode       = ref('manual')   // 'manual' | 'ai'
const step       = ref(1)
const pageLoading = ref(true)
const originalExam = ref(null)     // raw DB record — used to detect changes

// ─── Stream / group maps (identical to create.vue) ───────────────
const streamOptions = [
  { id: 'hsc',         label: 'HSC',         groups: ['hsc_science','hsc_arts','hsc_commerce'] },
  { id: 'ssc',         label: 'SSC',         groups: ['ssc_science','ssc_arts','ssc_commerce'] },
  { id: 'engineering', label: 'Engineering', groups: ['buet','ruet','kuet','cuet'] },
  { id: 'medical',     label: 'Medical',     groups: ['mbbs','bds','afmc'] },
  { id: 'varsity',     label: 'Varsity',     groups: ['du','cu','ju','ru','ku','sust'] },
]
const groupLabels = {
  hsc_science:'HSC Science', hsc_arts:'HSC Arts', hsc_commerce:'HSC Commerce',
  ssc_science:'SSC Science', ssc_arts:'SSC Arts', ssc_commerce:'SSC Commerce',
  buet:'BUET', ruet:'RUET', kuet:'KUET', cuet:'CUET',
  mbbs:'MBBS', bds:'BDS', afmc:'AFMC',
  du:'DU', cu:'CU', ju:'JU', ru:'RU', ku:'KU', sust:'SUST',
}
const streamToCurriculumKey = {
  hsc_science:'HSC Science', hsc_arts:'HSC Arts', hsc_commerce:'HSC Commerce',
  ssc_science:'SSC Science', ssc_arts:'SSC Arts', ssc_commerce:'SSC Commerce',
  buet:'BUET', ruet:'BUET', kuet:'BUET', cuet:'BUET',
  mbbs:'Medical', bds:'Medical', afmc:'Medical',
  du:'DU', cu:'DU', ju:'DU', ru:'DU', ku:'DU', sust:'DU',
}
function getDb(streamId) {
  return (streamId === 'medical' || streamId === 'varsity') ? supabaseMedical : supabaseHSC
}

// ─── Form ─────────────────────────────────────────────────────────
const form = reactive({
  title:'', description:'', stream:'', group_key:'',
  subject:'All', chapter:'All', tags:[],
  source:'teacher', difficulty:'mixed',
  difficulty_distribution:{ easy:40, medium:40, hard:20 },
  question_count:20, duration_mins:20, negative_marking:0,
  is_dynamic:true, is_hot:false, is_featured:false,
})
const tagInput = ref('')

// Watch stream/group/subject for cascade resets
// BUT on initial load we populate form without triggering resets —
// we use `loadingForm` flag to suppress the watchers during hydration.
const loadingForm = ref(true)
watch(()=>form.stream,   ()=>{ if(!loadingForm.value){ form.group_key=''; form.subject='All'; form.chapter='All' } })
watch(()=>form.group_key,()=>{ if(!loadingForm.value){ form.subject='All'; form.chapter='All' } })
watch(()=>form.subject,  ()=>{ if(!loadingForm.value){ form.chapter='All' } })

const availableGroups   = computed(()=> streamOptions.find(s=>s.id===form.stream)?.groups||[])
const curriculumKey     = computed(()=> streamToCurriculumKey[form.group_key]||'')
const availableSubjects = computed(()=> curriculumKey.value ? (curriculum[curriculumKey.value]??[]) : [])
const availableChapters = computed(()=> availableSubjects.value.find(s=>s.en===form.subject)?.chapters??[])

const distSum = computed(()=>form.difficulty_distribution.easy+form.difficulty_distribution.medium+form.difficulty_distribution.hard)
function clampDist(changed) {
  const d = form.difficulty_distribution
  if (changed==='easy')   { const r=100-d.easy;   const rat=d.medium/(d.medium+d.hard)||.5;   d.medium=Math.round(r*rat); d.hard=r-d.medium }
  if (changed==='medium') { const r=100-d.medium; const rat=d.easy/(d.easy+d.hard)||.5;       d.easy=Math.round(r*rat);   d.hard=r-d.easy }
  if (changed==='hard')   { const r=100-d.hard;   const rat=d.easy/(d.easy+d.medium)||.5;     d.easy=Math.round(r*rat);   d.medium=r-d.easy }
}

function addTag()       { const t=tagInput.value.trim(); if(t&&!form.tags.includes(t)&&form.tags.length<10) form.tags.push(t); tagInput.value='' }
function removeTag(i)   { form.tags.splice(i,1) }
function onTagKeydown(e){
  if(e.key==='Enter'||e.key===',') { e.preventDefault(); addTag() }
  if(e.key==='Backspace'&&!tagInput.value&&form.tags.length) form.tags.splice(form.tags.length-1,1)
}

const step1Valid = computed(()=> form.title.trim()&&form.stream&&form.group_key&&form.question_count>0&&form.duration_mins>0)

// ─── LOAD EXAM ────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('preset_exams').select('*').eq('id', examId).single()
    if (error) throw error
    originalExam.value = data

    // Populate form — suppress cascade watchers during this
    loadingForm.value = true

    form.title       = data.title       || ''
    form.description = data.description || ''
    form.stream      = data.stream      || ''
    form.group_key   = data.group_key   || ''
    form.subject     = data.subject     || 'All'
    form.chapter     = data.chapter     || 'All'
    form.tags        = Array.isArray(data.tags) ? [...data.tags] : []
    form.source      = data.source      || 'teacher'
    form.difficulty  = data.difficulty  || 'mixed'
    form.difficulty_distribution = data.difficulty_distribution
      ? { ...data.difficulty_distribution }
      : { easy:40, medium:40, hard:20 }
    form.question_count  = data.question_count  || 20
    form.duration_mins   = data.duration_mins   || 20
    form.negative_marking = data.negative_marking ?? 0
    form.is_dynamic  = data.is_dynamic  ?? true
    form.is_hot      = data.is_hot      || false
    form.is_featured = data.is_featured || false

    // Set mode based on source
    mode.value = data.source === 'ai' ? 'ai' : 'manual'

    await nextTick()
    loadingForm.value = false

    // Pre-load curated questions if this is a curated exam
    if (!data.is_dynamic && data.question_ids?.length) {
      curatedIds.value = [...data.question_ids]
      // Pre-check picker selection
      data.question_ids.forEach(id => pickerSelected.value.add(id))
      // Load preview objects
      await loadCuratedPreview(data.question_ids, data.stream)
    }

  } catch(e) {
    showToast('Failed to load exam: ' + (e.message||'unknown error'), 'error')
  } finally {
    pageLoading.value = false
  }
})

// ─── CURATED PICKER ───────────────────────────────────────────────
const pickerOpen      = ref(false)
const pickerLoading   = ref(false)
const pickerQuestions = ref([])
const pickerSelected  = ref(new Set())
const pickerSearch    = ref('')
const pickerSubject   = ref('All')
const pickerChapter   = ref('All')
const pickerDiff      = ref('All')
const pickerPage      = ref(1)
const pickerPerPage   = 20
const pickerTotalCount = ref(0)
const expandedPickerId = ref(null)   // accordion state, same pattern as question-bank.vue
const curatedIds      = ref([])
const curatedPreview  = ref([])

async function loadCuratedPreview(ids, streamId) {
  if (!ids.length) { curatedPreview.value=[]; return }
  const db = getDb(streamId || form.stream)
  const { data } = await db.from('questions').select('*').in('id', ids)
  curatedPreview.value = data || []
}

async function openPicker() { pickerOpen.value=true; await loadPickerQs() }
function closePicker()       { pickerOpen.value=false }

async function loadPickerQs() {
  pickerLoading.value = true
  try {
    const db = getDb(form.stream)
    let q = db.from('questions')
      .select('*', { count: 'exact' })
      .eq('status','published')//.eq('exam',form.group_key)
      .range((pickerPage.value-1)*pickerPerPage, pickerPage.value*pickerPerPage-1)
    if (pickerSubject.value!=='All') q=q.eq('subject->>english', pickerSubject.value)
    if (pickerChapter.value!=='All') q=q.eq('chapter->>english', pickerChapter.value)
    if (pickerDiff.value!=='All')    q=q.eq('difficulty_level',  pickerDiff.value.toLowerCase())
    if (pickerSearch.value.trim())   q=q.ilike('question->>english', `%${pickerSearch.value.trim()}%`)
    const { data, error, count } = await q
    if (error) throw error
    pickerQuestions.value = data || []
    pickerTotalCount.value = count ?? 0
    expandedPickerId.value = null
  } catch(e) { showToast('Failed to load questions','error') }
  finally    { pickerLoading.value=false }
}

// Accordion expand/collapse for picker items (same pattern as question-bank.vue)
function togglePickerExpand(id) {
  expandedPickerId.value = expandedPickerId.value === id ? null : id
}

// Numbered pagination (mirrors question-bank.vue's visiblePages)
const pickerTotalPages = computed(() => Math.max(1, Math.ceil(pickerTotalCount.value / pickerPerPage)))
const pickerVisiblePages = computed(() => {
  const total = pickerTotalPages.value
  const curr = pickerPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = [1]
  if (curr > 3) pages.push('…')
  for (let p = Math.max(2, curr - 1); p <= Math.min(total - 1, curr + 1); p++) pages.push(p)
  if (curr < total - 2) pages.push('…')
  pages.push(total)
  return pages
})
function pickerGotoPage(p) {
  if (p === pickerPage.value || p === '…') return
  pickerPage.value = p
  loadPickerQs()
}

function togglePick(id) {
  if (pickerSelected.value.has(id)) pickerSelected.value.delete(id)
  else pickerSelected.value.add(id)
}
async function confirmPicker() {
  curatedIds.value = [...pickerSelected.value]
  await loadCuratedPreview(curatedIds.value, form.stream)
  closePicker()
  showToast(`${curatedIds.value.length} questions selected ✓`)
}

let pickerDebounce = null
watch([pickerSubject, pickerChapter, pickerDiff], ()=>{ pickerPage.value=1; loadPickerQs() })
function onPickerSearch() { clearTimeout(pickerDebounce); pickerDebounce=setTimeout(()=>{ pickerPage.value=1; loadPickerQs() },300) }

// ─── DYNAMIC MODE — QUESTION PREVIEW / REROLL ─────────────────────
// Dynamic exams don't persist fixed question_ids — the actual set is
// drawn at attempt-time from the pool matching this exam's settings.
// This modal just previews a random sample from that same pool so an
// admin can sanity-check what test-takers might see, and "reroll"
// simply re-draws a fresh random sample using the same settings.
const dynamicPreviewOpen        = ref(false)
const dynamicPreviewLoading     = ref(false)
const dynamicPreviewQuestions   = ref([])
const expandedDynamicPreviewId  = ref(null)

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

async function loadDynamicPreview() {
  dynamicPreviewLoading.value = true
  expandedDynamicPreviewId.value = null
  try {
    const db = getDb(form.stream)
    let q = db.from('questions')
      .select('*')
      .eq('status', 'published')
    if (form.subject !== 'All')      q = q.eq('subject->>english', form.subject)
    if (form.chapter !== 'All')      q = q.eq('chapter->>english', form.chapter)
    if (form.difficulty !== 'mixed') q = q.eq('difficulty_level', form.difficulty.toLowerCase())
    q = q.limit(300) // pull a generous pool, then sample client-side
    const { data, error } = await q
    if (error) throw error
    dynamicPreviewQuestions.value = shuffle(data || []).slice(0, form.question_count)
  } catch(e) {
    showToast('Failed to load question preview', 'error')
  } finally {
    dynamicPreviewLoading.value = false
  }
}

async function openDynamicPreview()  { dynamicPreviewOpen.value = true; await loadDynamicPreview() }
function closeDynamicPreview()        { dynamicPreviewOpen.value = false }
async function rerollDynamicPreview() { await loadDynamicPreview() }

function toggleDynamicPreviewExpand(id) {
  expandedDynamicPreviewId.value = expandedDynamicPreviewId.value === id ? null : id
}

// ─── MODE-CHANGE DETECTION (dynamic ↔ curated, vs what's in the DB) ─
// originalExam.is_dynamic reflects what's actually stored in the DB.
// form.is_dynamic reflects what the admin currently has configured.
// When these disagree, the save step needs to warn about data loss.
const modeChangingCuratedToDynamic = computed(() =>
  !!originalExam.value && originalExam.value.is_dynamic === false && form.is_dynamic === true
)
const modeChangingDynamicToCurated = computed(() =>
  !!originalExam.value && originalExam.value.is_dynamic === true && form.is_dynamic === false
)

// ─── AI RE-GENERATION ─────────────────────────────────────────────
const ai = reactive({ seed:'', count:20, generating:false, generated:[], accepted:new Set(), error:'' })

// Show confirmation before replacing — this is destructive
const showRegenConfirm = ref(false)

function requestRegen() {
  // If there are existing accepted questions, warn first
  if (ai.generated.length || (!form.is_dynamic && curatedIds.value.length)) {
    showRegenConfirm.value = true
  } else {
    generateWithAI()
  }
}

async function generateWithAI() {
  showRegenConfirm.value = false
  if (!form.stream||!form.group_key) { showToast('Select stream and group first','error'); return }
  ai.generating=true; ai.error=''; ai.generated=[]; ai.accepted=new Set()
  try {
    const raw = await $fetch('/api/generate-exam', {
      method:'POST',
      body:{
        stream:form.group_key,
        subject:form.subject!=='All'?form.subject:null,
        chapter:form.chapter!=='All'?form.chapter:null,
        difficulty:form.difficulty!=='mixed'?form.difficulty:null,
        count:ai.count, seed:ai.seed||null,
      }
    })
    const parsed = JSON.parse(raw.result)
    ai.generated = parsed.questions || []
    ai.accepted  = new Set(ai.generated.map((_,i)=>i))
    form.source  = 'ai'
    showToast(`${ai.generated.length} questions generated ✓`)
  } catch(e) { ai.error=e.message||'Generation failed'; showToast('AI generation failed','error') }
  finally    { ai.generating=false }
}

function toggleAIQ(idx) { if(ai.accepted.has(idx)) ai.accepted.delete(idx); else ai.accepted.add(idx) }

const step2Valid = computed(()=>{
  if (form.is_dynamic) return true
  if (mode.value==='ai') return ai.accepted.size>0
  return curatedIds.value.length>0
})

// ─── SAVE (UPDATE) ────────────────────────────────────────────────
const saving = ref(false)
const questionSetChanged = computed(()=>{
  if (form.is_dynamic) return false
  const orig = originalExam.value?.question_ids || []
  const curr = mode.value==='ai'
    ? (ai.generated.length ? 'pending-ai' : null)
    : curatedIds.value
  if (!curr || curr==='pending-ai') return ai.generated.length>0
  if (orig.length !== curr.length) return true
  return orig.some((id,i)=>id!==curr[i])
})

async function save(newStatus = null) {
  if (!step1Valid.value) { showToast('Fill all required fields','error'); return }
  saving.value = true

  try {
    let savedIds   = null
    const diffBNMap = {Easy:'সহজ',Medium:'মাধ্যম',Hard:'কঠিন'}
    const ansMap    = {A:0,B:1,C:2,D:3}
    let prevIds     = originalExam.value?.question_ids || null  // will shift to previous_question_ids

    // ── AI re-generate: save new questions ────────────────────────
    if (mode.value==='ai' && ai.generated.length) {
      const db = getDb(form.stream)
      const payloads = [...ai.accepted].map(i=>ai.generated[i]).map(q=>({
        exam:form.group_key,
        question:{english:q.questionEN||null,bangla:q.questionBN||null},
        options:{english:q.optionsEN||[],bangla:q.optionsBN||[]},
        explanation:(q.explanationEN||q.explanationBN)?{english:q.explanationEN||null,bangla:q.explanationBN||null}:null,
        subject:{english:q.subjectEN||null,bangla:q.subjectBN||null},
        chapter:{english:q.chapterEN||null,bangla:q.chapterBN||null},
        difficulty:{english:q.difficulty||null,bangla:diffBNMap[q.difficulty]||null},
        difficulty_level:(q.difficulty||'medium').toLowerCase(),
        correct_index:ansMap[q.answerEN]??0,
        source:{english:'AI Generated',bangla:'AI দ্বারা তৈরি'},
        is_verified:false, status:'draft',
      }))
      const { data:qs, error:qErr } = await db.from('questions').insert(payloads).select('id')
      if (qErr) throw qErr
      savedIds = qs.map(r=>r.id)
    }

    // ── Curated: use picker selection ─────────────────────────────
    if (!form.is_dynamic && mode.value==='manual') {
      savedIds = curatedIds.value
    }

    // ── Build update payload ───────────────────────────────────────
    const update = {
      title:          form.title.trim(),
      description:    form.description.trim()||null,
      stream:         form.stream,
      group_key:      form.group_key,
      subject:        form.subject,
      chapter:        form.chapter,
      tags:           form.tags,
      source:         form.source,
      difficulty:     form.difficulty,
      difficulty_distribution: form.difficulty==='mixed' ? form.difficulty_distribution : null,
      question_count: form.question_count,
      duration_mins:  form.duration_mins,
      negative_marking: form.negative_marking,
      is_dynamic:     form.is_dynamic,
      is_hot:         form.is_hot,
      is_featured:    form.is_featured,
      updated_at:     new Date().toISOString(),
    }

    // ── If question set changed: shift old → previous, write new ──
    if (!form.is_dynamic && savedIds) {
      if (prevIds?.length) update.previous_question_ids = prevIds
      update.question_ids = savedIds
    } else if (form.is_dynamic) {
      update.question_ids = null  // dynamic exams never store IDs
    }

    // ── Status change (optional — e.g. re-submit for review) ─────
    if (newStatus) update.status = newStatus

    const { error: updateErr } = await supabase
      .from('preset_exams').update(update).eq('id', examId)
    if (updateErr) throw updateErr

    // ── Log AI generation if applicable ──────────────────────────
    if (mode.value==='ai' && ai.generated.length) {
      await supabase.from('ai_generation_log').insert({
        preset_exam_id:      examId,
        prompt_stream:       form.group_key,
        prompt_subject:      form.subject!=='All'?form.subject:null,
        prompt_chapter:      form.chapter!=='All'?form.chapter:null,
        prompt_count:        ai.count,
        prompt_difficulty:   form.difficulty!=='mixed'?form.difficulty:null,
        prompt_seed:         ai.seed||null,
        model:               'gemini-3.1-flash-lite',
        questions_generated: ai.generated.length,
        questions_accepted:  ai.accepted.size,
        question_ids:        savedIds,
        status:              'success',
        created_by:          user.value?.id,
      })
    }

    showToast('Exam updated ✓')
    setTimeout(()=>router.push('/dashboard/admin/exams'), 1200)

  } catch(e) { showToast(e.message||'Save failed','error') }
  finally    { saving.value=false }
}

function cap(s)     { return s?s.charAt(0).toUpperCase()+s.slice(1):'' }
function diffClass(d) { if(!d) return ''; const dl=d.toLowerCase(); return dl==='easy'?'diff-easy':dl==='hard'?'diff-hard':'diff-mid' }
</script>

<template>
  <div class="admin-shell">

    <!-- ── Admin Sidebar ────────────────────────────────────── -->
    <AdminSidebar
      :collapsed="sidebarCollapsed"
      :mobileOpen="mobileDrawerOpen"
      :activeTab="activeTab"
      @toggle="sidebarCollapsed = !sidebarCollapsed"
      @closeMobile="mobileDrawerOpen = false"
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
        :alertCount="0"
        @action="handleAction"
        @openMobileMenu="mobileDrawerOpen = true"
      />

  <div class="tab-body">

    <!-- ── Page loading ────────────────────────────────────── -->
    <div v-if="pageLoading" class="panel" style="padding:60px;text-align:center">
      <span style="display:inline-block;animation:spin 0.8s linear infinite;font-size:1.4rem">◌</span>
      <p style="font-family:var(--font-mono);font-size:0.65rem;color:var(--gray);margin:10px 0 0">Loading exam…</p>
    </div>

    <template v-else>

      <!-- ── Page Header ───────────────────────────────────── -->
      <div class="page-header">
        <div class="header-left">
          <div class="page-chip"><span class="chip-dot" /> Edit Exam</div>
          <h1 class="page-title">{{ form.title || 'Edit Exam' }}<br><span class="text-outline">Update & Republish.</span></h1>
          <p class="page-sub">
            Status: <strong style="color:var(--white)">{{ cap(originalExam?.status) }}</strong>
            · Created {{ originalExam?.created_at ? new Date(originalExam.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—' }}
            · {{ originalExam?.attendees?.toLocaleString() || 0 }} attendees
          </p>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end">
          <div class="filter-bar" style="padding:6px 8px;gap:4px;width:fit-content">
            <button class="pill" :class="{active:mode==='manual'}" @click="mode='manual'">✏️ Manual</button>
            <button class="pill" :class="{active:mode==='ai'}"     @click="mode='ai'">✨ AI</button>
          </div>
          <NuxtLink to="/dashboard/admin/exams" class="iso-btn iso-btn--ghost" style="font-size:0.65rem">← Back to Exams</NuxtLink>
        </div>
      </div>

      <!-- ── Previous question IDs notice ─────────────────── -->
      <div v-if="originalExam?.previous_question_ids?.length" class="panel"
        style="display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-left:3px solid rgba(255,200,80,0.3)">
        <span style="font-size:1.2rem;flex-shrink:0">📦</span>
        <div>
          <p style="font-family:var(--font-mono);font-size:0.6rem;color:rgba(255,200,80,0.9);margin:0 0 3px;font-weight:600">Previous question set backed up</p>
          <p style="font-family:var(--font-sans);font-size:0.7rem;color:var(--gray);margin:0;line-height:1.5">
            {{ originalExam.previous_question_ids.length }} questions from the previous version are stored in <code style="font-family:var(--font-mono);font-size:0.65rem">previous_question_ids</code> and can be restored via Supabase if needed.
          </p>
        </div>
      </div>

      <!-- ── Step indicator ─────────────────────────────────── -->
      <div class="panel" style="display:flex;border-bottom:none">
        <div v-for="s in [{n:1,l:'Config'},{n:2,l:'Questions'},{n:3,l:'Save'}]" :key="s.n"
          class="step-indicator"
          style="flex:1;display:flex;align-items:center;gap:10px;padding:12px 18px;border-right:1px solid var(--border);cursor:pointer;transition:background 0.12s"
          :style="step===s.n?'background:rgba(240,240,234,0.05)':''"
          <!--@click="if(s.n<step||(s.n===2&&step1Valid)||(s.n===3&&step2Valid)) step=s.n"-->
          <span style="font-family:var(--font-mono);font-size:0.6rem;width:22px;height:22px;border:1px solid;display:flex;align-items:center;justify-content:center;flex-shrink:0"
            :style="step>s.n?'border-color:rgba(120,230,120,0.4);color:rgba(120,230,120,0.9)':step===s.n?'border-color:var(--white);color:var(--white)':'border-color:var(--border);color:var(--gray)'">
            {{ step>s.n?'✓':s.n }}
          </span>
          <span style="font-family:var(--font-mono);font-size:0.6rem;letter-spacing:0.1em;text-transform:uppercase"
            :style="step===s.n?'color:var(--white)':'color:var(--gray)'">{{ s.l }}</span>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════
           STEP 1 — CONFIG (identical to create.vue)
      ══════════════════════════════════════════════════════ -->
      <template v-if="step===1">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">

          <!-- Left: Exam details -->
          <div class="panel">
            <div class="panel-head"><span class="panel-title">EXAM DETAILS</span></div>
            <div class="modal-form">

              <div class="mf-group">
                <label class="mf-label">Title *</label>
                <input class="mf-input" v-model="form.title" placeholder="Exam title" maxlength="120" />
                <span style="font-family:var(--font-mono);font-size:0.46rem;color:var(--dim);align-self:flex-end">{{ form.title.length }}/120</span>
              </div>

              <div class="mf-group">
                <label class="mf-label">Description</label>
                <textarea class="mf-input mf-textarea" v-model="form.description" rows="3" maxlength="400" />
              </div>

              <div class="mf-group">
                <label class="mf-label">Tags</label>
                <div class="mf-input" style="display:flex;flex-wrap:wrap;gap:5px;min-height:38px;cursor:text;height:auto;padding:6px 10px">
                  <span v-for="(tag,i) in form.tags" :key="i"
                    style="display:inline-flex;align-items:center;gap:4px;font-family:var(--font-mono);font-size:0.5rem;padding:2px 7px;border:1px solid var(--border);color:var(--white)">
                    {{ tag }}
                    <button @click="removeTag(i)" style="background:none;border:none;color:var(--gray);cursor:pointer;font-size:0.55rem;padding:0;line-height:1">✕</button>
                  </span>
                  <input style="background:none;border:none;color:var(--white);font-family:var(--font-sans);font-size:0.78rem;outline:none;flex:1;min-width:60px"
                    v-model="tagInput" placeholder="Add tag…" @keydown="onTagKeydown" @blur="addTag" />
                </div>
              </div>

              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">Source</label>
                  <div class="fb-pills">
                    <button v-for="s in ['teacher','ai','mixed']" :key="s"
                      class="pill" :class="{active:form.source===s}" @click="form.source=s">{{ cap(s) }}</button>
                  </div>
                </div>
                <div class="mf-group">
                  <label class="mf-label">Flags</label>
                  <div class="fb-pills">
                    <button class="pill" :class="{active:form.is_hot}"      @click="form.is_hot=!form.is_hot">🔥 Hot</button>
                    <button class="pill" :class="{active:form.is_featured}" @click="form.is_featured=!form.is_featured">★ Featured</button>
                  </div>
                </div>
              </div>

            </div>
          </div>

          <!-- Right: Stream & Config -->
          <div class="panel">
            <div class="panel-head"><span class="panel-title">STREAM & CONFIG</span></div>
            <div class="modal-form">

              <div class="mf-group">
                <label class="mf-label">Stream *</label>
                <div class="fb-pills">
                  <button v-for="s in streamOptions" :key="s.id"
                    class="pill" :class="{active:form.stream===s.id}" @click="form.stream=s.id">{{ s.label }}</button>
                </div>
              </div>

              <div class="mf-group" v-if="availableGroups.length">
                <label class="mf-label">Institution / Group *</label>
                <div class="fb-pills">
                  <button v-for="g in availableGroups" :key="g"
                    class="pill" :class="{active:form.group_key===g}" @click="form.group_key=g">{{ groupLabels[g] }}</button>
                </div>
              </div>

              <div class="mf-group" v-if="availableSubjects.length">
                <label class="mf-label">Subject</label>
                <div class="fb-pills" style="flex-wrap:wrap;max-height:80px;overflow-y:auto">
                  <button class="pill" :class="{active:form.subject==='All'}" @click="form.subject='All'">All</button>
                  <button v-for="s in availableSubjects" :key="s.en"
                    class="pill" :class="{active:form.subject===s.en}" @click="form.subject=s.en">{{ s.en }}</button>
                </div>
              </div>

              <div class="mf-group" v-if="availableChapters.length&&form.subject!=='All'">
                <label class="mf-label">Chapter</label>
                <div class="fb-pills" style="flex-wrap:wrap;max-height:80px;overflow-y:auto">
                  <button class="pill" :class="{active:form.chapter==='All'}" @click="form.chapter='All'">All Chapters</button>
                  <button v-for="c in availableChapters" :key="c.en"
                    class="pill" :class="{active:form.chapter===c.en}" @click="form.chapter=c.en" style="font-size:0.54rem">{{ c.en }}</button>
                </div>
              </div>

              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">Questions: {{ form.question_count }}</label>
                  <div class="fb-pills" style="flex-wrap:wrap">
                    <button v-for="n in [10,15,20,25,30,40,50,100]" :key="n"
                      class="pill" :class="{active:form.question_count===n}" @click="form.question_count=n" style="font-size:0.54rem">{{ n }}</button>
                  </div>
                  <input type="range" min="5" max="100" step="5" v-model.number="form.question_count"
                    style="width:100%;margin-top:4px;accent-color:var(--white)" />
                </div>
                <div class="mf-group">
                  <label class="mf-label">Duration: {{ form.duration_mins }}min</label>
                  <div class="fb-pills" style="flex-wrap:wrap">
                    <button v-for="d in [10,15,20,30,45,60,90]" :key="d"
                      class="pill" :class="{active:form.duration_mins===d}" @click="form.duration_mins=d" style="font-size:0.54rem">{{ d }}m</button>
                  </div>
                  <input type="range" min="5" max="120" step="5" v-model.number="form.duration_mins"
                    style="width:100%;margin-top:4px;accent-color:var(--white)" />
                </div>
              </div>

              <div class="mf-group">
                <label class="mf-label">Negative Marking</label>
                <div class="fb-pills">
                  <button v-for="nm in [{l:'None',v:0},{l:'−0.25',v:0.25},{l:'−0.50',v:0.5}]" :key="nm.v"
                    class="pill" :class="{active:form.negative_marking===nm.v}"
                    :style="nm.v>0&&form.negative_marking===nm.v?'border-color:rgba(255,100,100,0.4);color:rgba(255,100,100,0.9)':''"
                    @click="form.negative_marking=nm.v">{{ nm.l }}</button>
                </div>
              </div>

              <div class="mf-group">
                <label class="mf-label">Difficulty</label>
                <div class="fb-pills">
                  <button v-for="d in ['easy','medium','hard','mixed']" :key="d"
                    class="pill" :class="{active:form.difficulty===d}" @click="form.difficulty=d">{{ cap(d) }}</button>
                </div>
              </div>

              <div class="mf-group" v-if="form.difficulty==='mixed'">
                <label class="mf-label">Distribution
                  <span :style="distSum!==100?'color:rgba(255,100,100,0.8)':'color:var(--gray)'"
                    style="font-family:var(--font-sans);text-transform:none;letter-spacing:0;font-size:0.65rem;margin-left:6px">
                    {{ distSum }}% total
                  </span>
                </label>
                <div v-for="d in ['easy','medium','hard']" :key="d"
                  style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                  <span :class="'diff-badge diff-'+(d==='medium'?'mid':d)" style="width:48px;text-align:center;font-size:0.5rem">{{ cap(d) }}</span>
                  <input type="range" min="0" max="100" step="5"
                    :value="form.difficulty_distribution[d]"
                    @input="form.difficulty_distribution[d]=+$event.target.value; clampDist(d)"
                    style="flex:1;accent-color:var(--white)" />
                  <span style="font-family:var(--font-mono);font-size:0.58rem;color:var(--white);width:32px;text-align:right">{{ form.difficulty_distribution[d] }}%</span>
                </div>
                <div style="height:4px;display:flex;overflow:hidden;border:1px solid var(--border);margin-top:2px">
                  <div :style="{width:form.difficulty_distribution.easy+'%',background:'rgba(120,230,120,0.5)',height:'100%',transition:'width 0.2s'}" />
                  <div :style="{width:form.difficulty_distribution.medium+'%',background:'rgba(255,200,80,0.5)',height:'100%',transition:'width 0.2s'}" />
                  <div :style="{width:form.difficulty_distribution.hard+'%',background:'rgba(255,100,100,0.5)',height:'100%',transition:'width 0.2s'}" />
                </div>
              </div>

              <div class="mf-group">
                <label class="mf-label">Question Mode</label>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                  <div v-for="m in [{v:true,icon:'🎲',t:'Dynamic',s:'Random each attempt'},{v:false,icon:'📌',t:'Curated',s:'Fixed question set'}]" :key="m.t"
                    @click="form.is_dynamic=m.v"
                    style="display:flex;gap:8px;align-items:flex-start;padding:10px;border:1px solid;cursor:pointer;transition:all 0.12s"
                    :style="form.is_dynamic===m.v?'border-color:var(--white);background:rgba(240,240,234,0.05)':'border-color:var(--border)'">
                    <span style="font-size:1.1rem">{{ m.icon }}</span>
                    <div>
                      <div style="font-family:var(--font-mono);font-size:0.58rem;color:var(--white);margin-bottom:2px">{{ m.t }}</div>
                      <div style="font-family:var(--font-sans);font-size:0.65rem;color:var(--gray)">{{ m.s }}</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;padding-top:4px">
          <button class="iso-btn iso-btn--fill" :disabled="!step1Valid" @click="step=2">Next: Questions →</button>
        </div>
      </template>

      <!-- ══════════════════════════════════════════════════════
           STEP 2 — QUESTIONS
      ══════════════════════════════════════════════════════ -->
      <template v-else-if="step===2">

        <!-- Dynamic shortcut -->
        <div v-if="form.is_dynamic" class="panel"
          style="display:flex;gap:16px;align-items:flex-start;padding:20px;border-left:3px solid rgba(140,180,255,0.3)">
          <span style="font-size:1.8rem;flex-shrink:0">🎲</span>
          <div style="flex:1;min-width:0">
            <p style="font-family:var(--font-mono);font-size:0.7rem;color:var(--white);margin:0 0 6px;font-weight:600">Dynamic mode — no question selection needed</p>
            <p style="font-family:var(--font-sans);font-size:0.75rem;color:var(--gray);margin:0 0 12px;line-height:1.6">
              {{ form.question_count }} questions drawn randomly from <strong style="color:var(--white)">{{ groupLabels[form.group_key]||form.group_key }}</strong>
              ({{ form.subject }} · {{ form.chapter }} · {{ form.difficulty }}).
            </p>

            <!-- Preview/reroll — only meaningful when this exam is ALSO dynamic in the DB,
                 i.e. we're not mid-transition from a curated exam (that case has nothing to preview yet) -->
            <div v-if="originalExam?.is_dynamic" style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem;padding:6px 14px" @click="openDynamicPreview">
                👁 Preview Questions
              </button>
              <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem;padding:6px 14px" @click="openDynamicPreview">
                🔁 Do you wanna reroll the questions?
              </button>
            </div>
            <p v-else style="font-family:var(--font-sans);font-size:0.7rem;color:rgba(255,200,80,0.85);margin:10px 0 0;line-height:1.5">
              ⚠ This exam is currently <strong>curated</strong> in the database. Saving with dynamic mode enabled will erase its stored question set.
            </p>
          </div>
        </div>

        <!-- Manual curated picker -->
        <template v-else-if="mode==='manual'">
          <div class="panel">
            <div class="panel-head">
              <span class="panel-title">CURATED — {{ curatedIds.length }} / {{ form.question_count }} SELECTED</span>
              <button class="iso-btn iso-btn--ghost" style="font-size:0.65rem;padding:5px 12px" @click="openPicker">Open Question Picker</button>
            </div>
            <div v-if="curatedPreview.length">
              <div v-for="(q,i) in curatedPreview" :key="q.id"
                style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-bottom:1px solid var(--border)">
                <span class="mono dim" style="width:24px;flex-shrink:0;font-size:0.6rem">{{ i+1 }}</span>
                <div style="flex:1;min-width:0">
                  <p style="font-family:var(--font-sans);font-size:0.76rem;color:var(--white);margin:0 0 4px;line-height:1.4">{{ q.question?.bangla||q.question?.english }}</p>
                  <div style="display:flex;gap:8px;flex-wrap:wrap">
                    <span class="stream-tag" style="font-size:0.48rem">{{ q.subject?.english }}</span>
                    <span class="mono dim" style="font-size:0.5rem">{{ q.chapter?.english }}</span>
                    <span class="diff-badge" :class="diffClass(q.difficulty_level)" style="font-size:0.5rem">{{ cap(q.difficulty_level) }}</span>
                  </div>
                </div>
                <button class="act-btn ban" @click="curatedIds=curatedIds.filter(id=>id!==q.id);pickerSelected.delete(q.id)">✕</button>
              </div>
            </div>
            <div v-else style="padding:48px;text-align:center;font-family:var(--font-sans);font-size:0.78rem;color:var(--gray)">
              Click "Open Question Picker" to browse and select questions.
            </div>
          </div>
        </template>

        <!-- AI re-generation -->
        <template v-else>
          <div class="panel">
            <div class="panel-head">
              <span class="panel-title">AI RE-GENERATION</span>
              <!-- Re-generate confirm banner -->
              <div v-if="showRegenConfirm"
                style="display:flex;align-items:center;gap:10px;padding:8px 14px;border:1px solid rgba(255,100,100,0.3);background:rgba(255,100,100,0.04)">
                <span style="font-family:var(--font-sans);font-size:0.7rem;color:rgba(255,100,100,0.9)">
                  This will replace the current question set. Old IDs will be backed up. Continue?
                </span>
                <button class="act-btn ban" @click="generateWithAI">Yes, Replace</button>
                <button class="act-btn" @click="showRegenConfirm=false">Cancel</button>
              </div>
            </div>
            <div class="modal-form">
              <p style="font-family:var(--font-sans);font-size:0.75rem;color:var(--gray);margin:0">
                Generate new bilingual MCQs for <strong style="color:var(--white)">{{ groupLabels[form.group_key]||form.group_key }}</strong>
                {{ form.subject!=='All'?`· ${form.subject}`:'' }} {{ form.chapter!=='All'?`· ${form.chapter}`:'' }}.
                The existing question set will be <strong style="color:rgba(255,200,80,0.9)">backed up</strong> before replacement.
              </p>

              <div class="mf-row">
                <div class="mf-group">
                  <label class="mf-label">Generate {{ ai.count }} questions</label>
                  <div class="fb-pills">
                    <button v-for="n in [10,15,20,25,30]" :key="n"
                      class="pill" :class="{active:ai.count===n}" @click="ai.count=n">{{ n }}</button>
                  </div>
                </div>
              </div>

              <div class="mf-group">
                <label class="mf-label">Topic seed / extra instructions <span style="font-weight:400;text-transform:none;letter-spacing:0;font-family:var(--font-sans);font-size:0.65rem;color:var(--dim)"> — optional</span></label>
                <textarea class="mf-input mf-textarea" v-model="ai.seed" rows="3"
                  placeholder="e.g. Focus on harder application-level problems. Avoid topics already covered." />
              </div>

              <div>
                <button class="iso-btn iso-btn--fill" :disabled="ai.generating" @click="requestRegen">
                  <span v-if="ai.generating" style="display:inline-block;animation:spin 0.8s linear infinite;margin-right:6px">◌</span>
                  {{ ai.generating ? 'Generating…' : '✨ Generate New Questions' }}
                </button>
              </div>

              <div v-if="ai.error" style="padding:10px 14px;border:1px solid rgba(255,100,100,0.3);background:rgba(255,100,100,0.04);font-family:var(--font-mono);font-size:0.6rem;color:rgba(255,100,100,0.9)">
                {{ ai.error }}
              </div>
            </div>
          </div>

          <!-- Generated review — identical to create.vue -->
          <div v-if="ai.generated.length" class="panel">
            <div class="panel-head">
              <span class="panel-title">REVIEW — {{ ai.generated.length }} GENERATED · {{ ai.accepted.size }} ACCEPTED</span>
              <div class="dt-actions">
                <button class="iso-btn iso-btn--ghost" style="font-size:0.6rem;padding:4px 10px" @click="ai.generated.forEach((_,i)=>ai.accepted.add(i))">Accept All</button>
                <button class="iso-btn iso-btn--ghost" style="font-size:0.6rem;padding:4px 10px" @click="ai.accepted=new Set()">Reject All</button>
              </div>
            </div>

            <div v-for="(q,i) in ai.generated" :key="i"
              style="border-bottom:1px solid var(--border);border-left:2px solid"
              :style="ai.accepted.has(i)?'border-left-color:rgba(120,230,120,0.3)':'border-left-color:transparent;opacity:0.45'">
              <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border)">
                <span class="mono dim" style="font-size:0.54rem">Q{{ i+1 }}</span>
                <span class="diff-badge" :class="diffClass(q.difficulty)" style="font-size:0.5rem">{{ q.difficulty }}</span>
                <span class="stream-tag" style="font-size:0.48rem">{{ q.subjectEN }}</span>
                <span class="mono dim" style="font-size:0.5rem">{{ q.chapterEN }}</span>
                <button class="act-btn" :class="ai.accepted.has(i)?'unban':'ban'"
                  style="margin-left:auto;width:auto;padding:0 10px;font-size:0.5rem;letter-spacing:0.08em"
                  @click="toggleAIQ(i)">{{ ai.accepted.has(i)?'✓ Accept':'✕ Reject' }}</button>
              </div>
              <div style="padding:12px 16px;display:flex;flex-direction:column;gap:8px">
                <p style="font-family:var(--font-sans);font-size:0.78rem;color:var(--white);margin:0;line-height:1.5">{{ q.questionBN }}</p>
                <p style="font-family:var(--font-sans);font-size:0.72rem;color:var(--gray);margin:0">{{ q.questionEN }}</p>
                <div style="display:flex;flex-direction:column;gap:3px">
                  <div v-for="(opt,oi) in q.optionsBN" :key="oi"
                    style="display:flex;gap:8px;padding:4px 8px;font-size:0.74rem"
                    :style="['A','B','C','D'][oi]===q.answerEN?'color:rgba(120,230,120,0.9);background:rgba(120,230,120,0.06)':'color:var(--gray)'">
                    <span style="font-family:var(--font-mono);font-size:0.5rem;width:14px;flex-shrink:0">{{ ['A','B','C','D'][oi] }}</span>
                    <span>{{ opt }} <span style="opacity:0.5;font-size:0.67rem"> / {{ q.optionsEN[oi] }}</span></span>
                    <span v-if="['A','B','C','D'][oi]===q.answerEN" style="margin-left:auto;font-family:var(--font-mono);font-size:0.5rem;color:rgba(120,230,120,0.7)">✓</span>
                  </div>
                </div>
                <p v-if="q.explanationBN" style="font-family:var(--font-sans);font-size:0.7rem;color:var(--dim);margin:0;border-top:1px solid var(--border);padding-top:8px;line-height:1.5">
                  <span style="font-family:var(--font-mono);font-size:0.46rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-right:8px">Explanation</span>
                  {{ q.explanationBN }}
                </p>
              </div>
            </div>
          </div>
        </template>

        <div style="display:flex;justify-content:space-between;padding-top:4px">
          <button class="iso-btn iso-btn--ghost" @click="step=1">← Back</button>
          <button class="iso-btn iso-btn--fill" :disabled="!step2Valid" @click="step=3">Next: Save →</button>
        </div>
      </template>

      <!-- ══════════════════════════════════════════════════════
           STEP 3 — SAVE
      ══════════════════════════════════════════════════════ -->
      <template v-else-if="step===3">
        <div style="display:grid;grid-template-columns:1fr 340px;gap:20px">

          <!-- Summary -->
          <div class="panel">
            <div class="panel-head"><span class="panel-title">CHANGES SUMMARY</span></div>
            <div style="padding:20px;display:flex;flex-direction:column;gap:0">
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px">
                <span class="stream-tag">{{ cap(form.stream) }}</span>
                <span v-if="form.is_hot"      style="font-family:var(--font-mono);font-size:0.46rem;padding:2px 7px;background:rgba(255,200,80,0.07);border:1px solid rgba(255,200,80,0.2);color:rgba(255,200,80,0.85)">🔥 Hot</span>
                <span v-if="form.is_featured" style="font-family:var(--font-mono);font-size:0.46rem;padding:2px 7px;background:rgba(200,160,255,0.07);border:1px solid rgba(200,160,255,0.2);color:rgba(200,160,255,0.85)">★ Featured</span>
                <span style="font-family:var(--font-mono);font-size:0.46rem;padding:2px 7px;border:1px solid var(--border);color:var(--gray)">{{ form.is_dynamic?'Dynamic':'Curated' }}</span>
                <!-- Question set changed indicator -->
                <span v-if="questionSetChanged"
                  style="font-family:var(--font-mono);font-size:0.46rem;padding:2px 7px;border:1px solid rgba(255,200,80,0.3);background:rgba(255,200,80,0.06);color:rgba(255,200,80,0.9)">
                  ⚠ Question set changed
                </span>
              </div>
              <h3 style="font-family:var(--font-mono);font-size:0.95rem;font-weight:600;color:var(--white);margin:0 0 8px">{{ form.title }}</h3>
              <p style="font-family:var(--font-sans);font-size:0.75rem;color:var(--dim);margin:0 0 16px;line-height:1.5">{{ form.description||'—' }}</p>
              <div v-for="row in [
                { l:'Group',       v: groupLabels[form.group_key]||form.group_key },
                { l:'Subject',     v: form.subject },
                { l:'Chapter',     v: form.chapter },
                { l:'Questions',   v: form.question_count },
                { l:'Duration',    v: form.duration_mins + ' min' },
                { l:'Difficulty',  v: cap(form.difficulty) },
                { l:'Neg. Marking',v: form.negative_marking===0?'None':'−'+form.negative_marking },
                { l:'Source',      v: cap(form.source) },
                { l:'Current status', v: cap(originalExam?.status) },
              ]" :key="row.l"
                style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">
                <span style="font-family:var(--font-mono);font-size:0.56rem;letter-spacing:0.1em;text-transform:uppercase;color:var(--gray)">{{ row.l }}</span>
                <span style="font-family:var(--font-mono);font-size:0.6rem;color:var(--white)">{{ row.v }}</span>
              </div>
            </div>
          </div>

          <!-- Save actions -->
          <div style="display:flex;flex-direction:column;gap:16px">
            <div class="panel">
              <div class="panel-head"><span class="panel-title">SAVE OPTIONS</span></div>
              <div class="modal-actions" style="flex-direction:column;align-items:stretch;gap:8px;padding:16px">

                <!-- Save without changing status -->
                <button class="iso-btn iso-btn--fill" :disabled="saving" @click="save()" style="font-size:0.65rem">
                  {{ saving?'Saving…':'Save Changes' }}
                </button>

                <!-- Re-submit for review (if published or archived) -->
                <button v-if="['published','archived'].includes(originalExam?.status)"
                  class="iso-btn iso-btn--ghost" :disabled="saving"
                  @click="save('review')" style="font-size:0.65rem">
                  Send Back for Review
                </button>

                <!-- Direct publish (if in review or draft) -->
                <button v-if="['draft','review'].includes(originalExam?.status)"
                  class="iso-btn iso-btn--ghost" :disabled="saving"
                  @click="save('published')" style="font-size:0.65rem">
                  Save &amp; Publish
                </button>

              </div>
            </div>

            <!-- Mode-change warning: curated in DB → dynamic in config -->
            <div v-if="modeChangingCuratedToDynamic" class="panel"
              style="padding:14px 16px;border-left:3px solid rgba(255,100,100,0.4)">
              <p style="font-family:var(--font-sans);font-size:0.7rem;color:rgba(255,100,100,0.9);margin:0 0 6px;font-weight:600">⚠ Switching to Dynamic mode</p>
              <p style="font-family:var(--font-sans);font-size:0.68rem;color:var(--gray);margin:0;line-height:1.5">
                This exam is currently <strong style="color:var(--white)">curated</strong> in the database.
                Saving with <strong style="color:var(--white)">Dynamic</strong> mode enabled will erase all curated
                question IDs stored for this exam — new ones will be assigned automatically at attempt-time instead.
              </p>
            </div>

            <!-- Question set change warning -->
            <div v-if="questionSetChanged" class="panel"
              style="padding:14px 16px;border-left:3px solid rgba(255,200,80,0.4)">
              <p style="font-family:var(--font-sans);font-size:0.7rem;color:rgba(255,200,80,0.9);margin:0 0 6px;font-weight:600">Question set will change</p>
              <p style="font-family:var(--font-sans);font-size:0.68rem;color:var(--gray);margin:0;line-height:1.5">
                The previous <code style="font-family:var(--font-mono)">question_ids</code> will be backed up
                to <code style="font-family:var(--font-mono)">previous_question_ids</code> before the new set is written.
              </p>
            </div>

            <!-- Back to exams -->
            <NuxtLink to="/dashboard/admin/exams" class="iso-btn iso-btn--ghost" style="font-size:0.65rem;text-align:center">
              Discard &amp; Back to Exams
            </NuxtLink>
          </div>

        </div>

        <div style="display:flex;justify-content:flex-start;padding-top:4px">
          <button class="iso-btn iso-btn--ghost" @click="step=2">← Back</button>
        </div>
      </template>

      <!-- ── Question Picker Modal (identical to create.vue) ──── -->
      <Teleport to="body">
        <div v-if="pickerOpen" class="modal-overlay" @click.self="closePicker">
          <div class="modal-box" style="max-width:820px;max-height:88vh;display:flex;flex-direction:column">

            <div class="modal-head">
              <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--white)">
                Question Picker
                <span style="color:var(--gray);font-size:0.56rem;margin-left:8px">{{ pickerSelected.size }} / {{ form.question_count }} questions selected</span>
              </span>
              <button class="modal-close" @click="closePicker">×</button>
            </div>

            <div class="filter-bar" style="flex-direction:column;align-items:stretch;gap:8px;border-left:none;border-right:none;border-top:none">
              <div class="fb-search">
                <span class="fb-icon">⌕</span>
                <input class="fb-input" placeholder="Search questions…" :value="pickerSearch"
                  @input="pickerSearch=$event.target.value;onPickerSearch()" />
              </div>
              <div class="fb-pills">
                <button class="pill" :class="{active:pickerSubject==='All'}" @click="pickerSubject='All'">All Subjects</button>
                <button v-for="s in availableSubjects" :key="s.en"
                  class="pill" :class="{active:pickerSubject===s.en}" @click="pickerSubject=s.en;pickerChapter='All'">{{ s.en }}</button>
              </div>
              <br>
              <div class="fb-pills" v-if="pickerSubject!=='All'">
                <button class="pill" :class="{active:pickerChapter==='All'}" @click="pickerChapter='All'">All Chapters</button>
                <button v-for="c in availableSubjects.find(s=>s.en===pickerSubject)?.chapters||[]"
                  :key="c.en" class="pill" :class="{active:pickerChapter===c.en}" @click="pickerChapter=c.en">{{ c.en }}</button>
              </div>
              <br>
              <div class="fb-pills">
                <button v-for="d in ['All','Easy','Medium','Hard']" :key="d"
                  class="pill" :class="{active:pickerDiff===d}" @click="pickerDiff=d"><span v-if="d !== 'All'">{{ d }}</span><span v-else>All Difficulty</span></button>
              </div>
            </div>

            <div style="flex:1;overflow-y:auto">
              <div v-if="pickerLoading" style="padding:40px;text-align:center;font-size:1.2rem;animation:spin 0.8s linear infinite">◌</div>
              <div v-else-if="!pickerQuestions.length" style="padding:40px;text-align:center;font-family:var(--font-sans);font-size:0.78rem;color:var(--gray)">No questions found.</div>
              <div v-else>
                <div v-for="q in pickerQuestions" :key="q.id"
                  style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer;transition:background 0.1s;border-left:2px solid"
                  :style="pickerSelected.has(q.id)?'background:rgba(120,230,120,0.04);border-left-color:rgba(120,230,120,0.3)':'border-left-color:transparent'"
                  @click="togglePickerExpand(q.id)">
                  <input type="checkbox" :checked="pickerSelected.has(q.id)" @click.stop="togglePick(q.id)"
                    style="flex-shrink:0;margin-top:3px;accent-color:rgba(120,230,120,0.8);cursor:pointer" />
                  <div style="flex:1;min-width:0">
                    <p v-html="renderLatexText(q.question?.bangla)" :style="`font-family:var(--font-sans);font-size:0.76rem;color:var(--white);margin:0 0 4px;line-height:1.4;${expandedPickerId===q.id?'':'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'}`">
                    </p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                      <span class="stream-tag" style="font-size:0.48rem">{{ q.subject?.bangla }}</span>
                      <span class="mono dim" style="font-size:0.65rem">{{ q.chapter?.bangla }}</span>
                      <span class="diff-badge" :class="diffClass(q.difficulty_level)" style="font-size:0.48rem">{{ cap(q.difficulty_level) }}</span>
                      <span class="mono dim" style="font-size:0.65rem">ID: #{{ q.id }}</span>
                      <span v-if="q.stimulus_hash" class="mono dim" style="font-size:0.65rem">📎 Stimulus</span>
                    </div>

                    <!-- Expanded preview — same accordion pattern as question-bank.vue -->
                    <Transition name="expand">
                      <div v-if="expandedPickerId===q.id" @click.stop
                        style="margin-top:8px;padding-top:10px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:10px;cursor:default">

                        <div v-if="q.stimulus?.english"
                          style="border:1px solid var(--border);padding:10px 12px;background:rgba(240,240,234,0.02);display:flex;flex-direction:column;gap:6px">
                          <span style="font-family:var(--font-mono);font-size:0.46rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray)"><b>Stimulus</b></span>
                          <span style="font-family:var(--font-sans);font-size:0.74rem;color:var(--dim);margin:0;line-height:1.5"><b>English:</b></span> <p v-if="q.stimulus?.english" style="font-family:var(--font-sans);font-size:0.74rem;color:var(--dim);margin:0;line-height:1.5" v-html="renderLatexText(q.stimulus.english)"></p>
                          <span style="font-family:var(--font-sans);font-size:0.74rem;color:var(--dim);margin:0;line-height:1.5"><b>Bangla:</b></span> <p v-if="q.stimulus?.bangla" style="font-family:var(--font-sans);font-size:0.74rem;color:var(--dim);margin:0;line-height:1.5" v-html="renderLatexText(q.stimulus.bangla)"></p>
                          <img v-if="q.stimulus_image" :src="q.stimulus_image" style="max-width:100%;border:1px solid var(--border);display:block" />
                        </div>

                        <p :style="`font-family:var(--font-sans);font-size:0.76rem;color:var(--white);margin:0 0 4px;line-height:1.4;${expandedPickerId===q.id?'':'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'}`">
                          <b>English:</b> <span v-html="renderLatexText(q.question?.english)" style="opacity: 0.5;"></span>
                        </p>
                        <div style="display:flex;gap:8px;flex-wrap:wrap">
                          <span class="stream-tag" style="font-size:0.48rem">{{ q.subject?.english }}</span>
                          <span class="mono dim" style="font-size:0.65rem">{{ q.chapter?.english }}</span>
                        </div>

                        <img v-if="q.question_image" :src="q.question_image" style="max-width:100%;border:1px solid var(--border);display:block" />

                        <div v-if="q.options?.english?.length" style="display:flex;flex-direction:column;gap:5px">
                          <div v-for="(opt,oi) in q.options.english" :key="oi"
                            style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--border);font-family:var(--font-sans);font-size:0.74rem;color:var(--gray)"
                            :style="oi===q.correct_index?'border-color:rgba(120,230,120,0.4);background:rgba(120,230,120,0.06);color:rgba(120,230,120,0.9)':''">
                            <span style="font-family:var(--font-mono);font-size:0.52rem;font-weight:700;width:16px;flex-shrink:0">{{ ['A','B','C','D','E'][oi] }}.</span>
                            <span v-html="renderLatexText(opt)"></span> / <span v-html="renderLatexText(q.options.bangla[oi])"></span>
                            <span v-if="oi===q.correct_index" style="margin-left:auto;color:rgba(120,230,120,0.8)">✓</span>
                          </div>
                        </div>

                        <p v-if="q.explanation?.english" style="font-family:var(--font-sans);font-size:0.72rem;color:var(--dim);margin:0;line-height:1.5">
                          <span style="font-family:var(--font-mono);font-size:0.46rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-right:8px">Explanation</span>
                          <b>English:</b> <span v-html="renderLatexText(q.explanation.english)"></span>
                        </p>

                        <p v-if="q.explanation?.bangla" style="font-family:var(--font-sans);font-size:0.72rem;color:var(--dim);margin:0;line-height:1.5">
                          <span style="font-family:var(--font-mono);font-size:0.46rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-right:8px">Explanation</span>
                          <b>Bangla:</b> <span v-html="renderLatexText(q.explanation.bangla)"></span>
                        </p>

                        <button class="iso-btn iso-btn--ghost" style="align-self:flex-start;font-size:0.6rem;padding:6px 14px"
                          @click.stop="togglePick(q.id)">
                          {{ pickerSelected.has(q.id) ? '✓ Selected — click to remove' : '+ Select this question' }}
                        </button>
                      </div>
                    </Transition>
                  </div>

                  <button class="act-btn" @click.stop="togglePickerExpand(q.id)" style="flex-shrink:0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                      <polyline :points="expandedPickerId===q.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div style="border-top:1px solid var(--border)">
              <div v-if="pickerTotalPages>1" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;flex-wrap:wrap">
                <button class="iso-btn iso-btn--ghost pg-btn" :disabled="pickerPage===1" @click="pickerGotoPage(pickerPage-1)">← Prev</button>
                <div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap">
                  <button v-for="p in pickerVisiblePages" :key="p"
                    style="font-family:var(--font-mono);font-size:0.62rem;font-weight:700;width:26px;height:26px;border:1px solid var(--border);background:transparent;cursor:pointer;color:var(--gray);display:flex;align-items:center;justify-content:center;transition:all 0.15s"
                    :style="p===pickerPage?'background:var(--white);color:var(--black);border-color:var(--white)':(p==='…'?'cursor:default;border-color:transparent':'')"
                    :disabled="p==='…'"
                    @click="pickerGotoPage(p)">{{ p }}</button>
                </div>
                <button class="iso-btn iso-btn--ghost pg-btn" :disabled="pickerPage===pickerTotalPages" @click="pickerGotoPage(pickerPage+1)">Next →</button>
              </div>
              <div class="modal-actions">
                <span class="mono dim" style="font-size:0.6rem;margin-right:auto">{{ pickerSelected.size }} / {{ form.question_count }} questions selected</span>
                <button class="iso-btn iso-btn--ghost" @click="closePicker">Cancel</button>
                <button class="iso-btn iso-btn--fill" @click="confirmPicker">Confirm Selection →</button>
              </div>
            </div>

          </div>
        </div>
      </Teleport>

      <!-- ── Dynamic Question Preview Modal ─────────────────────
           Read-only preview of a random sample matching this exam's
           settings — mirrors the picker modal's look, minus selection. -->
      <Teleport to="body">
        <div v-if="dynamicPreviewOpen" class="modal-overlay" @click.self="closeDynamicPreview">
          <div class="modal-box" style="max-width:820px;max-height:88vh;display:flex;flex-direction:column">

            <div class="modal-head">
              <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--white)">
                Question Preview (Dynamic)
                <span style="color:var(--gray);font-size:0.56rem;margin-left:8px">
                  {{ dynamicPreviewQuestions.length }} / {{ form.question_count }} sampled from the pool
                </span>
              </span>
              <button class="modal-close" @click="closeDynamicPreview">×</button>
            </div>

            <div style="padding:10px 18px;border-bottom:1px solid var(--border)">
              <p style="font-family:var(--font-sans);font-size:0.7rem;color:var(--gray);margin:0;line-height:1.5">
                This exam draws <strong style="color:var(--white)">{{ form.question_count }}</strong> random questions at attempt-time
                from <strong style="color:var(--white)">{{ groupLabels[form.group_key]||form.group_key }}</strong>
                ({{ form.subject }} · {{ form.chapter }} · {{ form.difficulty }}). Below is a random sample from that
                same pool — reroll for a different sample.
              </p>
            </div>

            <div style="flex:1;overflow-y:auto">
              <div v-if="dynamicPreviewLoading" style="padding:40px;text-align:center;font-size:1.2rem;animation:spin 0.8s linear infinite">◌</div>
              <div v-else-if="!dynamicPreviewQuestions.length" style="padding:40px;text-align:center;font-family:var(--font-sans);font-size:0.78rem;color:var(--gray)">
                No questions match these filters yet.
              </div>
              <div v-else>
                <div v-for="(q,i) in dynamicPreviewQuestions" :key="q.id"
                  style="display:flex;align-items:flex-start;gap:12px;padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer"
                  @click="toggleDynamicPreviewExpand(q.id)">
                  <span class="mono dim" style="width:24px;flex-shrink:0;font-size:0.6rem;margin-top:3px">{{ i+1 }}</span>
                  <div style="flex:1;min-width:0">
                    <p v-html="renderLatexText(q.question?.bangla)"
                      :style="`font-family:var(--font-sans);font-size:0.76rem;color:var(--white);margin:0 0 4px;line-height:1.4;${expandedDynamicPreviewId===q.id?'':'display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden'}`">
                    </p>
                    <div style="display:flex;gap:8px;flex-wrap:wrap">
                      <span class="stream-tag" style="font-size:0.48rem">{{ q.subject?.bangla }}</span>
                      <span class="mono dim" style="font-size:0.65rem">{{ q.chapter?.bangla }}</span>
                      <span class="diff-badge" :class="diffClass(q.difficulty_level)" style="font-size:0.48rem">{{ cap(q.difficulty_level) }}</span>
                      <span class="mono dim" style="font-size:0.65rem">ID: #{{ q.id }}</span>
                    </div>

                    <Transition name="expand">
                      <div v-if="expandedDynamicPreviewId===q.id" @click.stop
                        style="margin-top:8px;padding-top:10px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:10px;cursor:default">
                        <div v-if="q.options?.english?.length" style="display:flex;flex-direction:column;gap:5px">
                          <div v-for="(opt,oi) in q.options.english" :key="oi"
                            style="display:flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid var(--border);font-family:var(--font-sans);font-size:0.74rem;color:var(--gray)"
                            :style="oi===q.correct_index?'border-color:rgba(120,230,120,0.4);background:rgba(120,230,120,0.06);color:rgba(120,230,120,0.9)':''">
                            <span style="font-family:var(--font-mono);font-size:0.52rem;font-weight:700;width:16px;flex-shrink:0">{{ ['A','B','C','D','E'][oi] }}.</span>
                            <span v-html="renderLatexText(opt)"></span> / <span v-html="renderLatexText(q.options.bangla[oi])"></span>
                            <span v-if="oi===q.correct_index" style="margin-left:auto;color:rgba(120,230,120,0.8)">✓</span>
                          </div>
                        </div>
                        <p v-if="q.explanation?.bangla" style="font-family:var(--font-sans);font-size:0.72rem;color:var(--dim);margin:0;line-height:1.5">
                          <span style="font-family:var(--font-mono);font-size:0.46rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-right:8px">Explanation</span>
                          {{ q.explanation.bangla }}
                        </p>
                      </div>
                    </Transition>
                  </div>
                  <button class="act-btn" @click.stop="toggleDynamicPreviewExpand(q.id)" style="flex-shrink:0">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                      <polyline :points="expandedDynamicPreviewId===q.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <span class="mono dim" style="font-size:0.6rem;margin-right:auto">Read-only preview — the actual attempt draws fresh each time.</span>
              <button class="iso-btn iso-btn--ghost" @click="closeDynamicPreview">Close</button>
              <button class="iso-btn iso-btn--fill" :disabled="dynamicPreviewLoading" @click="rerollDynamicPreview">
                <span v-if="dynamicPreviewLoading" style="display:inline-block;animation:spin 0.8s linear infinite;margin-right:6px">◌</span>
                🔁 Reroll
              </button>
            </div>

          </div>
        </div>
      </Teleport>

    </template><!-- end v-else (page loaded) -->

    <!-- ── Toast ────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="toast.show" class="admin-toast" :class="toast.type">{{ toast.msg }}</div>
    </Teleport>

  </div>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════════════════
   SHELL & LAYOUT
   AdminSidebar is position:sticky, so shell is plain flexbox.
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
/*  overflow: hidden; */
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

/* ═══════════════════════════════════════════════════════════════
   The following rules are copied verbatim from questions.vue.
   Vue's scoped styles don't leak between components, and this page
   uses the same shared design-system classes (panel, modal, filter-bar,
   pill, etc.) — so they need to be defined here too.
═══════════════════════════════════════════════════════════════ */
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

/* ── Page header ──────────────────────────────────────────────── */
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

/* ── Filter bar / search / pills ──────────────────────────────── */
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

.mono { font-family: var(--font-mono); font-size: 0.7rem; color: var(--white); }
.dim  { color: var(--gray) !important; }

.stream-tag {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: var(--gray); border: 1px solid var(--border); padding: 2px 6px;
  text-transform: uppercase; white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dt-actions { display: flex; gap: 4px; align-items: center; }
.act-btn {
  width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;
  background: none; border: 1px solid var(--border); cursor: pointer;
  font-size: 0.72rem; color: var(--gray); transition: all 0.15s; flex-shrink: 0;
}
.act-btn:hover       { border-color: var(--border-bright); color: var(--white); }
.act-btn.ban:hover   { border-color: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); }
.act-btn.unban:hover { border-color: rgba(120,230,120,0.5); color: rgba(120,230,120,0.9); }

/* ── Modals ───────────────────────────────────────────────────── */
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

@keyframes spin { to { transform: rotate(360deg); } }

/* Accordion expand transition — same pattern as question-bank.vue */
.expand-enter-active, .expand-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-6px); }

.diff-badge { font-family:var(--font-mono);font-size:0.58rem;letter-spacing:0.08em;padding:2px 7px;text-transform:uppercase;border:1px solid; }
.diff-easy { color:rgba(120,230,120,0.9);border-color:rgba(120,230,120,0.3);background:rgba(120,230,120,0.07); }
.diff-mid  { color:rgba(255,200,80,0.9); border-color:rgba(255,200,80,0.3); background:rgba(255,200,80,0.07);  }
.diff-hard { color:rgba(255,100,100,0.9);border-color:rgba(255,100,100,0.3);background:rgba(255,100,100,0.07);}
.admin-toast { position:fixed;bottom:24px;right:24px;padding:12px 18px;font-family:var(--font-mono);font-size:0.65rem;letter-spacing:0.08em;border:1px solid var(--border);background:var(--black);color:var(--white);z-index:9999;box-shadow:4px 4px 0 0 rgba(240,240,234,0.06); }
.admin-toast.error { border-color:rgba(255,100,100,0.4);color:rgba(255,100,100,0.9); }
.pg-btn { font-size:0.65rem !important;padding:5px 12px !important; }
@media (max-width:900px) { .mf-row { flex-direction:column; } }
</style>
