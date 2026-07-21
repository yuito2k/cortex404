<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'admin', title: 'Create Exam' })

import { curriculum } from '~/utils/curriculum'
import { renderLatexText } from '~/utils/renderLatex'

const supabase        = useSupabaseClient()
const supabaseHSC     = useSupabaseHSC()
const supabaseMedical = useSupabaseMedical()
const user            = useSupabaseUser()
const router          = useRouter()

// ─── Sidebar & layout ────────────────────────────────────────
const sidebarCollapsed = ref(
  typeof window !== 'undefined' && window.innerWidth <= 1024
)
const mobileDrawerOpen = ref(false)
const activeTab = ref('examBuilder')

// Handle quick actions from topbar
function handleAction(type) {
  if (type === 'addQuestion') navigateTo('/dashboard/admin/questions?open=addQuestion')
  else if (type === 'announcement') navigateTo('/dashboard/admin/content?open=announcement')
}

// ─── System health (for topbar pill) ──────────────────────────
const systemStatus = ref('ok')

// ─── TOAST ───────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', type: 'success' })
function showToast(msg, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3500)
}

// ─── MODE ─────────────────────────────────────────────────────────
// 'manual' = teacher builds it by hand
// 'ai'     = Gemini generates questions from a prompt
const mode = ref('manual') // 'manual' | 'ai'

// ─── STEP (wizard) ────────────────────────────────────────────────
// Step 1: Config  (stream, subject, chapter, counts, etc.)
// Step 2: Questions (question picker for curated / AI generation)
// Step 3: Preview & publish
const step = ref(1)

// ─── STREAM / SUBJECT / CHAPTER OPTIONS ──────────────────────────
const streamOptions = [
  { id: 'hsc',         label: 'HSC',         groups: ['hsc_science','hsc_arts','hsc_commerce'] },
  { id: 'ssc',         label: 'SSC',         groups: ['ssc_science','ssc_arts','ssc_commerce'] },
  { id: 'engineering', label: 'Engineering', groups: ['buet','ruet','kuet','cuet'] },
  { id: 'medical',     label: 'Medical',     groups: ['mbbs','bds','afmc'] },
  { id: 'varsity',     label: 'Varsity',     groups: ['du','cu','ju','ru','ku','sust'] },
]

const groupLabels = {
  hsc_science: 'HSC Science', hsc_arts: 'HSC Arts', hsc_commerce: 'HSC Commerce',
  ssc_science: 'SSC Science', ssc_arts: 'SSC Arts', ssc_commerce: 'SSC Commerce',
  buet: 'BUET', ruet: 'RUET', kuet: 'KUET', cuet: 'CUET',
  mbbs: 'MBBS', bds: 'BDS', afmc: 'AFMC',
  du: 'DU', cu: 'CU', ju: 'JU', ru: 'RU', ku: 'KU', sust: 'SUST',
}

// Maps stream → curriculum key for subject/chapter lookup
const streamToCurriculumKey = {
  hsc_science: 'HSC Science', hsc_arts: 'HSC Arts', hsc_commerce: 'HSC Commerce',
  ssc_science: 'SSC Science', ssc_arts: 'SSC Arts', ssc_commerce: 'SSC Commerce',
  buet: 'BUET', ruet: 'BUET', kuet: 'BUET', cuet: 'BUET',
  mbbs: 'Medical', bds: 'Medical', afmc: 'Medical',
  du: 'DU', cu: 'DU', ju: 'DU', ru: 'DU', ku: 'DU', sust: 'DU',
}

// Maps stream id → Supabase client
function getSupabaseForStream(streamId) {
  if (streamId === 'medical') return supabaseMedical
  if (streamId === 'varsity') return supabaseMedical  // adjust if varsity is on a different project
  return supabaseHSC
}

// ─── FORM STATE ───────────────────────────────────────────────────
const form = reactive({
  title:                  '',
  description:            '',
  stream:                 '',      // hsc | ssc | engineering | medical | varsity
  group_key:              '',      // hsc_science | buet | mbbs | du | etc.
  subject:                'All',
  chapter:                'All',
  tags:                   [],      // string[]
  source:                 'teacher',
  difficulty:             'mixed',
  difficulty_distribution: { easy: 40, medium: 40, hard: 20 },
  question_count:         20,
  duration_mins:          20,
  negative_marking:       0,
  is_dynamic:             true,
  is_hot:                 false,
  is_featured:            false,
})

const tagInput = ref('')

const availableGroups = computed(() =>
  streamOptions.find(s => s.id === form.stream)?.groups || []
)

const curriculumKey   = computed(() => streamToCurriculumKey[form.group_key] || '')
const availableSubjects = computed(() =>
  curriculumKey.value ? (curriculum[curriculumKey.value] ?? []) : []
)
//const availableChapters = computed(() =>
//  availableSubjects.value.find(s => s.en === form.subject)?.chapters ?? []
//)

const availableChapters = computed(() => {
  if (form.subject === 'All') return []

  if (Array.isArray(form.subject)) {
    // Merge + dedupe chapters across all selected subjects
    const allChapters = form.subject.flatMap(subj =>
      availableSubjects.value.find(s => s.en === subj)?.chapters ?? []
    )
    const seen = new Set()
    return allChapters.filter(c => {
      if (seen.has(c.en)) return false
      seen.add(c.en)
      return true
    })
  }

  return availableSubjects.value.find(s => s.en === form.subject)?.chapters ?? []
})

watch(() => form.stream, () => {
  form.group_key = ''
  form.subject   = 'All'
  form.chapter   = 'All'
})
watch(() => form.group_key, () => {
  form.subject = 'All'
  form.chapter = 'All'
})
watch(() => form.subject, () => { form.chapter = 'All' })

// Replaces the earlier separate subjectCounts/chapterCounts —
// now one flat map keyed by a composite string
const itemCounts = reactive({})

const autoDistributeCounts = ref(true)  // default: auto even-split

function itemKey(subject, chapter) {
  return chapter ? `${subject}|${chapter}` : subject
}

// Rebuild itemCounts whenever subject or chapter selection changes
watch([() => form.subject, () => form.chapter, () => form.question_count, autoDistributeCounts], () => {
  const subjects = Array.isArray(form.subject) ? form.subject : (form.subject === 'All' ? [] : [form.subject])
  const chapters = Array.isArray(form.chapter) ? form.chapter : (form.chapter === 'All' ? [] : [form.chapter])

  //const neededKeys = []
  //if (subjects.length === 0) {
  //  neededKeys.push(itemKey(null, null))
  //} else {
  //  subjects.forEach(s => {
  //    if (chapters.length === 0) neededKeys.push(itemKey(s, null))
  //    else chapters.forEach(c => neededKeys.push(itemKey(s, c)))
  //  })
  //}

  const neededKeys = []
  if (subjects.length === 0) {
    neededKeys.push(itemKey(null, null))
  } else {
    subjects.forEach(s => {
      const subjectChapters = (form.chapter && typeof form.chapter === 'object' && form.chapter[s]) || []
      if (subjectChapters.length === 0) {
        neededKeys.push(itemKey(s, null))
      } else {
        subjectChapters.forEach(c => neededKeys.push(itemKey(s, c)))
      }
    })
  }

  Object.keys(itemCounts).forEach(k => {
    if (!neededKeys.includes(k)) delete itemCounts[k]
  })

  if (autoDistributeCounts.value) {
    // Auto mode: always recompute even split, overwriting manual edits
    const base  = Math.floor(form.question_count / neededKeys.length) || 1
    const rem   = form.question_count - base * neededKeys.length
    neededKeys.forEach((k, i) => {
      itemCounts[k] = base + (i < rem ? 1 : 0)  // distribute remainder to first few items
    })
  } else {
    // Manual mode: only fill in defaults for brand-new keys, leave existing edits alone
    const perItemDefault = Math.floor(form.question_count / neededKeys.length) || 1
    neededKeys.forEach(k => {
      if (!(k in itemCounts)) itemCounts[k] = perItemDefault
    })
  }
}, { deep: true, immediate: true })

// Keep difficulty_distribution sum = 100 when sliders change
function clampDistribution(changed) {
  const d = form.difficulty_distribution
  if (changed === 'easy') {
    const rem = 100 - d.easy
    const ratio = d.medium / (d.medium + d.hard) || 0.5
    d.medium = Math.round(rem * ratio)
    d.hard   = rem - d.medium
  } else if (changed === 'medium') {
    const rem = 100 - d.medium
    const ratio = d.easy / (d.easy + d.hard) || 0.5
    d.easy = Math.round(rem * ratio)
    d.hard = rem - d.easy
  } else {
    const rem = 100 - d.hard
    const ratio = d.easy / (d.easy + d.medium) || 0.5
    d.easy   = Math.round(rem * ratio)
    d.medium = rem - d.easy
  }
}

// ─── TAGS ─────────────────────────────────────────────────────────
function addTag() {
  const t = tagInput.value.trim()
  if (t && !form.tags.includes(t) && form.tags.length < 10) {
    form.tags.push(t)
  }
  tagInput.value = ''
}
function removeTag(i) { form.tags.splice(i, 1) }
function onTagKeydown(e) {
  if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() }
  if (e.key === 'Backspace' && !tagInput.value && form.tags.length) {
    form.tags.splice(form.tags.length - 1, 1)
  }
}

// ─── STEP 1 VALIDATION ────────────────────────────────────────────
const step1Valid = computed(() =>
  form.title.trim() &&
  form.stream &&
  form.group_key &&
  form.question_count > 0 &&
  form.duration_mins > 0
)

// ─── CURATED QUESTION PICKER ──────────────────────────────────────
const pickerOpen        = ref(false)
const pickerLoading     = ref(false)
const pickerQuestions   = ref([])
const pickerSelected    = ref(new Set())   // Set of question ids
const pickerSearch      = ref('')
const pickerSubject     = ref('All')
const pickerChapter     = ref('All')
const pickerDiff        = ref('All')
const pickerPage        = ref(1)
const pickerPerPage     = 20
const pickerTotalCount  = ref(0)
const expandedPickerId  = ref(null)   // currently expanded picker item (accordion, same pattern as question-bank.vue)

async function openPicker() {
  pickerOpen.value = true
  await loadPickerQuestions()
}
function closePicker() { pickerOpen.value = false }

async function loadPickerQuestions() {
  pickerLoading.value = true
  try {
    const db = getSupabaseForStream(form.stream)
    let q = db.from('questions')
      .select('*', { count: 'exact' })
      .eq('status', 'published')
      //.eq('exam', form.group_key)
      .range((pickerPage.value - 1) * pickerPerPage, pickerPage.value * pickerPerPage - 1)

    if (pickerSubject.value !== 'All') q = q.eq('subject->>english', pickerSubject.value)
    if (pickerChapter.value !== 'All') q = q.eq('chapter->>english', pickerChapter.value)
    if (pickerDiff.value    !== 'All') q = q.eq('difficulty_level', pickerDiff.value.toLowerCase())
    if (pickerSearch.value.trim())     q = q.ilike('question->>english', `%${pickerSearch.value.trim()}%`)

    const { data, error, count } = await q
    if (error) throw error
    pickerQuestions.value = data || []
    pickerTotalCount.value = count ?? 0
    expandedPickerId.value = null
  } catch (e) {
    console.error(e)
    showToast('Failed to load questions', 'error')
  } finally {
    pickerLoading.value = false
  }
}

// ── Picker expand/collapse (accordion, mirrors question-bank.vue) ──
function togglePickerExpand(id) {
  expandedPickerId.value = expandedPickerId.value === id ? null : id
}

// ── Picker numbered pagination (mirrors question-bank.vue visiblePages) ──
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
  if (p === pickerPage.value) return
  pickerPage.value = p
  loadPickerQuestions()
}

function togglePickerQuestion(id) {
  if (pickerSelected.value.has(id)) {
    pickerSelected.value.delete(id)
  } else {
    pickerSelected.value.add(id)
  }
}

function confirmPickerSelection() {
  curatedQuestionIds.value = [...pickerSelected.value]
  closePicker()
  showToast(`${curatedQuestionIds.value.length} questions selected ✓`)
}

const curatedQuestionIds = ref([])          // final curated list
const curatedPreview     = ref([])          // full question objects for preview

watch(curatedQuestionIds, async (ids) => {
  if (!ids.length) { curatedPreview.value = []; return }
  const db = getSupabaseForStream(form.stream)
  const { data } = await db.from('questions').select('*').in('id', ids)
  curatedPreview.value = data || []
})

let pickerDebounce = null

watch([pickerSubject, pickerChapter, pickerDiff], ()=>{ pickerPage.value=1; loadPickerQuestions() })

function onPickerSearch() {
  clearTimeout(pickerDebounce)
  pickerDebounce = setTimeout(() => { pickerPage.value = 1; loadPickerQuestions() }, 300)
}

// ─── AI GENERATION ────────────────────────────────────────────────
const ai = reactive({
  seed:        '',       // free-form topic description / instructions for Gemini
  count:       20,
  generating:  false,
  generated:   [],       // raw generated question objects
  accepted:    new Set(), // indices the admin wants to keep
  error:       '',
})

async function generateWithAI() {
  if (!form.stream || !form.group_key) {
    showToast('Select stream and group first', 'error'); return
  }
  ai.generating = true
  ai.error      = ''
  ai.generated  = []
  ai.accepted   = new Set()

  try {
    const raw = await $fetch('/api/generate-exam', {
      method: 'POST',
      body: {
        stream:     form.group_key,
        subject:    form.subject !== 'All' ? form.subject : null,
        chapter:    form.chapter !== 'All' ? form.chapter : null,
        difficulty: form.difficulty !== 'mixed' ? form.difficulty : null,
        count:      ai.count,
        seed:       ai.seed || null,
      }
    })

    const parsed = JSON.parse(raw.result)
    ai.generated = parsed.questions || []

    // Auto-accept all by default — admin can deselect
    ai.accepted  = new Set(ai.generated.map((_, i) => i))
    form.source  = 'ai'
    showToast(`${ai.generated.length} questions generated ✓`)
  } catch (e) {
    console.error(e)
    ai.error = e.message || 'Generation failed. Check console.'
    showToast('AI generation failed', 'error')
  } finally {
    ai.generating = false
  }
}

function toggleSubject(s) {
  if (s === 'All') { form.subject = 'All'; return }
  if (form.subject === 'All') form.subject = []
  if (!Array.isArray(form.subject)) form.subject = [form.subject]

  const idx = form.subject.indexOf(s)
  if (idx > -1) form.subject.splice(idx, 1)
  else form.subject.push(s)

  if (form.subject.length === 0) form.subject = 'All'
}

//function toggleChapter(c) {
//  if (c === 'All') { form.chapter = 'All'; return }
//  if (form.chapter === 'All') form.chapter = []
//  if (!Array.isArray(form.chapter)) form.chapter = [form.chapter]
//
//  const idx = form.chapter.indexOf(c)
//  if (idx > -1) form.chapter.splice(idx, 1)
//  else form.chapter.push(c)
//
//  if (form.chapter.length === 0) form.chapter = 'All'
//}

function toggleChapter(subject, chapterName) {
  if (chapterName === 'All') {
    if (typeof form.chapter !== 'object' || Array.isArray(form.chapter)) form.chapter = {}
    delete form.chapter[subject]
    return
  }
  if (form.chapter === 'All' || Array.isArray(form.chapter)) form.chapter = {}
  if (!form.chapter[subject]) form.chapter[subject] = []

  const idx = form.chapter[subject].indexOf(chapterName)
  if (idx > -1) form.chapter[subject].splice(idx, 1)
  else form.chapter[subject].push(chapterName)

  if (form.chapter[subject].length === 0) delete form.chapter[subject]
}

function toggleAIQuestion(idx) {
  if (ai.accepted.has(idx)) ai.accepted.delete(idx)
  else                       ai.accepted.add(idx)
}

// ─── STEP 2 VALIDATION ────────────────────────────────────────────
const step2Valid = computed(() => {
  if (form.is_dynamic) return true
  if (mode.value === 'ai') return ai.accepted.size > 0
  return curatedQuestionIds.value.length > 0
})

// ─── SAVE ─────────────────────────────────────────────────────────
const saving = ref(false)

async function save(publishStatus = 'draft') {
  if (!step1Valid.value) { showToast('Fill in all required fields', 'error'); return }
  saving.value = true

  try {
    let savedQuestionIds = null

    // ── AI MODE: save accepted generated questions first ──────────
    if (mode.value === 'ai' && ai.generated.length) {
      const db = getSupabaseForStream(form.stream)
      const answerIndexMap = { A: 0, B: 1, C: 2, D: 3 }
      const diffBNMap      = { Easy: 'সহজ', Medium: 'মাধ্যম', Hard: 'কঠিন' }

      const acceptedQs = [...ai.accepted].map(i => ai.generated[i])
      const payloads   = acceptedQs.map(q => ({
        exam:           form.group_key,
        question:       { english: q.questionEN || null, bangla: q.questionBN || null },
        options:        { english: q.optionsEN  || [], bangla: q.optionsBN || [] },
        explanation:    (q.explanationEN || q.explanationBN)
                          ? { english: q.explanationEN || null, bangla: q.explanationBN || null }
                          : null,
        subject:        { english: q.subjectEN  || null, bangla: q.subjectBN || null },
        chapter:        { english: q.chapterEN  || null, bangla: q.chapterBN || null },
        difficulty:     { english: q.difficulty || null, bangla: diffBNMap[q.difficulty] || null },
        difficulty_level: (q.difficulty || 'medium').toLowerCase(),
        correct_index:  answerIndexMap[q.answerEN] ?? 0,
        years:          q.years?.length
                          ? q.years.map(y => ({ english: y, bangla: y }))
                          : null,
        source:         { english: 'AI Generated', bangla: 'AI দ্বারা তৈরি' },
        is_verified:    true,
        status:         'published',   // admin must explicitly publish questions too
      }))

      const { data: insertedQs, error: qErr } = await db
        .from('ai_generated_questions').insert(payloads).select('id')
      if (qErr) throw qErr

      savedQuestionIds = insertedQs.map(r => r.id)
      form.source = 'ai'
    }

    // ── CURATED MODE: use picker selection ────────────────────────
    if (!form.is_dynamic && mode.value === 'manual') {
      savedQuestionIds = curatedQuestionIds.value
    }

    // ── Build preset_exams payload ────────────────────────────────
    const payload = {
      title:          form.title.trim(),
      description:    form.description.trim() || null,
      stream:         form.stream,
      group_key:      form.group_key,
      subject:        form.subject,
      chapter:        form.chapter,
      tags:           form.tags,
      source:         form.source,
      difficulty:     form.difficulty,
      difficulty_distribution: form.difficulty !== 'mixed'
                        ? null
                        : form.difficulty_distribution,
      question_distribution: itemCounts,
      question_count: form.question_count,
      duration_mins:  form.duration_mins,
      negative_marking: form.negative_marking,
      is_dynamic:     form.is_dynamic,
      question_ids:   form.is_dynamic ? null : savedQuestionIds,
      is_hot:         form.is_hot,
      is_featured:    form.is_featured,
      status:         publishStatus,
      created_by:     user.value?.id,
    }

    // Use service role client for admin write
    const { data: examData, error: examErr } = await supabase
      .from('preset_exams').insert(payload).select('id').single()
    if (examErr) throw examErr

    // ── DYNAMIC MODE: use DB FETCH ────────────────────────
    if (form.is_dynamic && mode.value === 'manual') {
      //let sup = getSupabaseForStream(form.stream)
      //const { data: rows, error: rpcErr } = await sup
      //    .rpc('get_preset_exam_questions', { p_exam_id: examData.id })
      //savedQuestionIds = rows.map(r => r.id)
//
      //console.log(rows)
//
      //const { data: updateData } = await supabase.from('preset_exams').update({ question_ids: savedQuestionIds }).eq('id', examData.id)

      // ── DYNAMIC: call get_preset_exam_questions RPC ────────────────────────
      //const { data: rows, error: rpcErr } = await qDb
      //  .rpc('get_preset_exam_questions', { p_exam_id: presetExamId })
 
      if (true) {
        //console.warn('[usePresetQuestions] RPC failed, falling back to manual query:', rpcErr.message)
 
        // Manual fallback if RPC not available yet:
        // Apply difficulty distribution ourselves
        //const total  = form.question_count || 20
        //const dist   = form.difficulty_distribution
        const dist = form.difficulty !== 'mixed' ? null : form.difficulty_distribution
 
        let queryPool: any[] = []

        //if (dist) {
        for (const [key, count] of Object.entries(itemCounts)) {
          const [subj, chap] = key.includes('|') ? key.split('|') : [key, null]
        
          // Apply difficulty distribution WITHIN this item's count
          //const dist = form.difficulty_distribution
          let tiers = dist
            ? [
                { level: 'easy',   count: Math.round(count * (dist.easy   || 0) / 100) },
                { level: 'medium', count: Math.round(count * (dist.medium || 0) / 100) },
                { level: 'hard',   count: count - Math.round(count*(dist.easy||0)/100) - Math.round(count*(dist.medium||0)/100) },
              ].filter(t => t.count > 0)
            : [{ level: form.difficulty, count }]  // no distribution — flat count, no difficulty filter
        
          for (const tier of tiers) {
            let q = getSupabaseForStream(form.stream)
              .from('questions')
              .select('*')
              .eq('status', 'published')
          
            if (subj && subj !== 'null') q = q.eq('subject->>english', subj)
            if (chap && chap !== 'null') q = q.eq('chapter->>english', chap)
            if (tier.level)              q = q.eq('difficulty_level', tier.level)

            const { data } = await q
            if (data?.length) {
              const shuffled = [...data].sort(() => Math.random() - 0.5)
              queryPool.push(...shuffled.slice(0, tier.count))
            }
          }
        }
        
        //} else {
        //  // No distribution — pure random
        //  for (const [key, count] of Object.entries(itemCounts)) {
        //    const [subj, chap] = key.includes('|') ? key.split('|') : [key, null]
//
        //    let q = getSupabaseForStream(form.stream)
        //      .from('questions')
        //      .select('*')
        //      .eq('status', 'published')
        //      //.eq('exam', stream)
        //      //.limit(total)
        //    
        //    //if (form.subject && form.subject !== 'All')
        //    //  q = q.eq('subject->>english', form.subject)
        //    //if (form.chapter && form.chapter !== 'All')
        //    //  q = q.eq('chapter->>english', form.chapter)
//
        //    if (subj && subj !== 'null') q = q.eq('subject->>english', subj)
        //    if (chap && chap !== 'null') q = q.eq('chapter->>english', chap)
        //    
        //    const { data } = await q
        //    if (data?.length) {
        //      //queryPool = data
        //      const shuffled = [...data].sort(() => Math.random() - 0.5)
        //      queryPool = shuffled.slice(0, total)
        //    }
        //  }
        //}
 
        //if (dist) {
        //  // Fetch each difficulty tier separately then combine
        //  const tiers = [
        //    { level: 'easy',   count: Math.round(total * (dist.easy   || 0) / 100) },
        //    { level: 'medium', count: Math.round(total * (dist.medium || 0) / 100) },
        //    { level: 'hard',   count: total - Math.round(total * (dist.easy||0)/100) - Math.round(total * (dist.medium||0)/100) },
        //  ].filter(t => t.count > 0)
 //
        //  for (const tier of tiers) {
        //    let q = getSupabaseForStream(form.stream)
        //      .from('questions')
        //      .select('*')
        //      .eq('status', 'published')
        //      //.eq('exam', stream)
        //      .eq('difficulty_level', tier.level)
        //      //.limit(tier.count)
 //
        //    if (form.subject && form.subject !== 'All')
        //      //q = q.eq('subject->>english', form.subject)
        //      if (Array.isArray(form.subject)) {
        //        q = q.in('subject->>english', form.subject)
        //      } else {
        //        q = q.eq('subject->>english', form.subject)
        //      }
        //    if (form.chapter && form.chapter !== 'All')
        //      //q = q.eq('chapter->>english', form.chapter)
        //      if (Array.isArray(form.chapter)) {
        //        q = q.in('chapter->>english', form.chapter)
        //      } else {
        //        q = q.eq('chapter->>english', form.chapter)
        //      }
 //
        //    const { data } = await q
        //    if (data?.length) {
        //      //queryPool.push(...data)
        //      const shuffled = [...data].sort(() => Math.random() - 0.5)
        //      queryPool.push(...shuffled.slice(0, tier.count))
        //    }
        //  }
        //} else {
        //  // No distribution — pure random
        //  let q = getSupabaseForStream(form.stream)
        //    .from('questions')
        //    .select('*')
        //    .eq('status', 'published')
        //    //.eq('exam', stream)
        //    //.limit(total)
 //
        //if (form.subject && form.subject !== 'All')
        //    q = q.eq('subject->>english', form.subject)
        //if (form.chapter && form.chapter !== 'All')
        //    q = q.eq('chapter->>english', form.chapter)
 //
        //const { data } = await q
        //  if (data?.length) {
        //    //queryPool = data
        //    const shuffled = [...data].sort(() => Math.random() - 0.5)
        //    queryPool = shuffled.slice(0, total)
        //  }
        //}
 
        if (!queryPool.length) return []
        // Shuffle
        //queryPool
          //.sort(() => Math.random() - 0.5)
          //.map((row: any) => mapRow(row))

        const { data: updateData } = await supabase.from('preset_exams').update({ question_ids: queryPool.map(q => q.id) }).eq('id', examData.id)
      }
 
      //if (!rows?.length) {
      //  console.warn('[usePresetQuestions] RPC returned no questions')
      //  return []
      //}
 //
      //return (rows as any[]).map((row: any) => mapRow(row))
    }

    // ── Log AI generation if applicable ──────────────────────────
    if (mode.value === 'ai' && ai.generated.length) {
      await supabase.from('ai_generation_log').insert({
        preset_exam_id:       examData.id,
        prompt_stream:        form.group_key,
        prompt_subject:       form.subject !== 'All' ? form.subject : null,
        prompt_chapter:       form.chapter !== 'All' ? form.chapter : null,
        prompt_count:         ai.count,
        prompt_difficulty:    form.difficulty !== 'mixed' ? form.difficulty : null,
        prompt_seed:          ai.seed || null,
        model:                'gemini-3.1-flash-lite',
        questions_generated:  ai.generated.length,
        questions_accepted:   ai.accepted.size,
        question_ids:         savedQuestionIds,
        status:               'success',
        created_by:           user.value?.id,
      })
    }

    showToast(`Exam ${publishStatus === 'draft' ? 'saved as draft' : 'sent for review'} ✓`)
    setTimeout(() => router.push('/dashboard/admin/exams'), 1200)

  } catch (e) {
    console.error(e)
    showToast(e.message || 'Save failed', 'error')
  } finally {
    saving.value = false
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────
function diffCls(d) {
  if (!d) return ''
  const dl = d.toLowerCase()
  if (dl === 'easy')   return 'diff-easy'
  if (dl === 'hard')   return 'diff-hard'
  return 'diff-medium'
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }
const distSum = computed(() =>
  form.difficulty_distribution.easy +
  form.difficulty_distribution.medium +
  form.difficulty_distribution.hard
)
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

  <div class="cb-page">

    <!-- ── PAGE HEADER ──────────────────────────────────────── -->
    <div class="cb-header">
      <div class="cb-header-left">
        <NuxtLink to="/admin/exams" class="cb-back">← Exams</NuxtLink>
        <h1 class="cb-title">Create Exam</h1>
      </div>
      <!-- Mode toggle -->
      <div class="cb-mode-toggle">
        <button class="cb-mode-btn" :class="{ active: mode === 'manual' }" @click="mode = 'manual'">
          ✏️ Manual
        </button>
        <button class="cb-mode-btn" :class="{ active: mode === 'ai' }" @click="mode = 'ai'">
          ✨ AI Generate
        </button>
      </div>
    </div>

    <!-- ── STEP INDICATOR ──────────────────────────────────── -->
    <div class="cb-steps">
      <div v-for="s in [{ n:1, l:'Config' },{ n:2, l:'Questions' },{ n:3, l:'Preview' }]"
        :key="s.n" class="cb-step" :class="{ active: step === s.n, done: step > s.n }">
        <span class="cb-step-num">{{ step > s.n ? '✓' : s.n }}</span>
        <span class="cb-step-label">{{ s.l }}</span>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         STEP 1 — CONFIG
    ═════════════════════════════════════════════════════════ -->
    <div v-if="step === 1" class="cb-step-body">
      <div class="cb-two-col">

        <!-- Left: core fields -->
        <div class="cb-section">
          <h2 class="cb-section-title">Exam Details</h2>

          <div class="cb-field">
            <label class="cb-label">Title <span class="cb-req">*</span></label>
            <input class="cb-input" v-model="form.title" placeholder="e.g. HSC Physics — Waves & Optics Full Test" maxlength="120" />
            <span class="cb-char">{{ form.title.length }}/120</span>
          </div>

          <div class="cb-field">
            <label class="cb-label">Description</label>
            <textarea class="cb-textarea" v-model="form.description" rows="3"
              placeholder="What this exam covers, who it's for, any instructions…" maxlength="400" />
            <span class="cb-char">{{ form.description.length }}/400</span>
          </div>

          <div class="cb-field">
            <label class="cb-label">Tags <span class="cb-hint">— press Enter or comma to add</span></label>
            <div class="cb-tags-input">
              <span v-for="(tag, i) in form.tags" :key="i" class="cb-tag">
                {{ tag }} <button @click="removeTag(i)">✕</button>
              </span>
              <input class="cb-tag-input-inner" v-model="tagInput"
                placeholder="Add tag…" @keydown="onTagKeydown" @blur="addTag" />
            </div>
          </div>

          <div class="cb-row-2">
            <div class="cb-field">
              <label class="cb-label">Source</label>
              <div class="cb-pills">
                <button v-for="s in ['teacher','ai','mixed']" :key="s"
                  :disabled="s === 'mixed'" class="cb-pill" :class="{ active: form.source === s }"
                  @click="form.source = s">{{ cap(s) }}</button>
              </div>
            </div>
            <div class="cb-field">
              <label class="cb-label">Flags</label>
              <div class="cb-pills">
                <button class="cb-pill" :class="{ active: form.is_hot }" @click="form.is_hot = !form.is_hot">🔥 Hot</button>
                <button class="cb-pill" :class="{ active: form.is_featured }" @click="form.is_featured = !form.is_featured">★ Featured</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: stream / config -->
        <div class="cb-section">
          <h2 class="cb-section-title">Stream & Config</h2>

          <!-- Stream -->
          <div class="cb-field">
            <label class="cb-label">Stream <span class="cb-req">*</span></label>
            <div class="cb-pills">
              <button v-for="s in streamOptions" :key="s.id"
                class="cb-pill" :class="{ active: form.stream === s.id }"
                @click="form.stream = s.id">{{ s.label }}</button>
            </div>
          </div>

          <!-- Group -->
          <div class="cb-field" v-if="availableGroups.length">
            <label class="cb-label">Institution / Group <span class="cb-req">*</span></label>
            <div class="cb-pills">
              <button v-for="g in availableGroups" :key="g"
                class="cb-pill" :class="{ active: form.group_key === g }"
                @click="form.group_key = g">{{ groupLabels[g] || g }}</button>
            </div>
          </div>

          <!-- Subject -->
          <div class="cb-field" v-if="availableSubjects.length">
            <label class="cb-label">Subject</label>
            <div class="cb-pills cb-pills--wrap">
              <button class="cb-pill" :class="{ active: form.subject === 'All' }"
                @click="form.subject = 'All'">All</button>
              <button v-for="s in availableSubjects" :key="s.en"
                class="cb-pill" :class="{ active: form.subject === s.en || (Array.isArray(form.subject) && form.subject.includes(s.en)) }"
                @click="toggleSubject(s.en)">{{ s.en }}</button>
            </div>
          </div>

          <div v-if="Object.keys(itemCounts).length > 1" class="cb-field">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
              <label class="cb-label" style="margin:0">Questions per Subject/Chapter</label>
              <button class="cb-pill" :class="{ active: autoDistributeCounts }"
                @click="autoDistributeCounts = !autoDistributeCounts">
                {{ autoDistributeCounts ? '⚡ Auto Split' : '✋ Manual' }}
              </button>
            </div>
          
            <div v-for="key in Object.keys(itemCounts)" :key="key"
              style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
              <span style="width:180px;font-family:var(--font-mono);font-size:0.55rem">{{ key.replace('|', ' → ') }}</span>
              <input type="number" min="1" :max="form.question_count"
                v-model.number="itemCounts[key]"
                :disabled="autoDistributeCounts"
                :style="autoDistributeCounts ? 'opacity:0.5;cursor:not-allowed' : ''"
                style="width:60px;background:rgba(240,240,234,0.03);border:1px solid var(--border);color:var(--white);padding:4px 8px;font-family:var(--font-mono);font-size:0.6rem" />
            </div>
          
            <span style="font-family:var(--font-mono);font-size:0.5rem;color:var(--gray)">
              Total: {{ Object.values(itemCounts).reduce((a,b)=>a+b,0) }} / {{ form.question_count }}
            </span>
          </div>

          <!-- Chapter -->
          <div v-for="s in form.subject" :key="s" class="cb-field" v-if="availableChapters.length && form.subject !== 'All'">
            <label class="cb-label">{{ s }} — Chapters</label>
            <div class="cb-pills cb-pills--wrap">
              <button class="cb-pill" :class="{ active: !form.chapter?.[s]?.length }"
                @click="toggleChapter(s, 'All')">All Chapters</button>
              <button v-for="c in availableSubjects.find(su=>su.en===s)?.chapters||[]" :key="c.en"
                class="cb-pill cb-pill--sm"
                :class="{ active: form.chapter?.[s]?.includes(c.en) }"
                @click="toggleChapter(s, c.en)">{{ c.en }}</button>
            </div>
          </div>

          <!-- Chapter -->
          <!--<div class="cb-field" v-if="availableChapters.length && form.subject !== 'All'">
            <label class="cb-label">Chapter</label>
            <div class="cb-pills cb-pills--wrap">
              <button class="cb-pill" :class="{ active: form.chapter === 'All' }"
                @click="form.chapter = 'All'">All Chapters</button>
              <button v-for="c in availableChapters" :key="c.en"
                class="cb-pill cb-pill--sm" :class="{ active: form.chapter === c.en || (Array.isArray(form.chapter) && form.chapter.includes(c.en)) }"
                @click="toggleChapter(c.en)">{{ c.en }}</button>
            </div>
          </div>-->

          <!-- Count + Duration -->
          <div class="cb-row-2">
            <div class="cb-field">
              <label class="cb-label">
                Questions <span class="cb-val">{{ form.question_count }}</span>
              </label>
              <div class="cb-pills">
                <button v-for="n in [10,15,20,25,30,40,50,60,80,100]" :key="n"
                  class="cb-pill cb-pill--sm" :class="{ active: form.question_count === n }"
                  @click="form.question_count = n">{{ n }}</button>
              </div>
              <input type="range" class="cb-slider" min="5" max="100" step="5"
                v-model.number="form.question_count" />
            </div>
            <div class="cb-field">
              <label class="cb-label">
                Duration <span class="cb-val">{{ form.duration_mins }} min</span>
              </label>
              <div class="cb-pills">
                <button v-for="d in [10,15,20,25,30,45,60,90]" :key="d"
                  class="cb-pill cb-pill--sm" :class="{ active: form.duration_mins === d }"
                  @click="form.duration_mins = d">{{ d }}m</button>
              </div>
              <input type="range" class="cb-slider" min="5" max="120" step="5"
                v-model.number="form.duration_mins" />
            </div>
          </div>

          <!-- Negative marking -->
          <div class="cb-field">
            <label class="cb-label">Negative Marking</label>
            <div class="cb-pills">
              <button v-for="nm in [{ l:'None (0)', v: 0 },{ l:'−0.25', v: 0.25 },{ l:'−0.50', v: 0.5 }]"
                :key="nm.v" class="cb-pill"
                :class="{ active: form.negative_marking === nm.v, 'cb-pill--red': nm.v > 0 && form.negative_marking === nm.v }"
                @click="form.negative_marking = nm.v">{{ nm.l }}</button>
            </div>
          </div>

          <!-- Difficulty -->
          <div class="cb-field">
            <label class="cb-label">Difficulty</label>
            <div class="cb-pills">
              <button v-for="d in ['easy','medium','hard','mixed']" :key="d"
                class="cb-pill" :class="[{ active: form.difficulty === d }, diffCls(d)]"
                @click="form.difficulty = d">{{ cap(d) }}</button>
            </div>
          </div>

          <!-- Difficulty distribution (only when mixed) -->
          <div v-if="form.difficulty === 'mixed'" class="cb-field">
            <label class="cb-label">
              Distribution
              <span class="cb-val" :class="{ 'cb-val--warn': distSum !== 100 }">
                {{ distSum }}% total
              </span>
            </label>
            <div class="cb-dist">
              <div class="cb-dist-row" v-for="d in ['easy','medium','hard']" :key="d">
                <span class="cb-dist-label" :class="diffCls(d)">{{ cap(d) }}</span>
                <input type="range" class="cb-slider cb-slider--dist"
                  min="0" max="100" step="1"
                  :value="form.difficulty_distribution[d]"
                  @input="form.difficulty_distribution[d] = +$event.target.value; clampDistribution(d)" />
                <span class="cb-dist-val">{{ form.difficulty_distribution[d] }}%</span>
              </div>
              <div class="cb-dist-bar">
                <div class="cb-dist-seg diff-easy"  :style="{ width: form.difficulty_distribution.easy   + '%' }" />
                <div class="cb-dist-seg diff-medium" :style="{ width: form.difficulty_distribution.medium + '%' }" />
                <div class="cb-dist-seg diff-hard"   :style="{ width: form.difficulty_distribution.hard   + '%' }" />
              </div>
            </div>
          </div>

          <!-- Dynamic vs Curated -->
          <div class="cb-field">
            <label class="cb-label">Question Mode</label>
            <div class="cb-mode-cards">
              <div class="cb-mode-card" :class="{ active: form.is_dynamic }" @click="form.is_dynamic = true">
                <span class="cb-mode-card-icon">🎲</span>
                <div>
                  <div class="cb-mode-card-title">Dynamic</div>
                  <div class="cb-mode-card-sub">Questions pulled randomly from the question bank</div>
                </div>
              </div>
              <div class="cb-mode-card" :class="{ active: !form.is_dynamic }" @click="form.is_dynamic = false">
                <span class="cb-mode-card-icon">📌</span>
                <div>
                  <div class="cb-mode-card-title">Curated</div>
                  <div class="cb-mode-card-sub">Teachers handpicked questions from the question bank</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div class="cb-step-footer">
        <div />
        <button class="iso-btn iso-btn--fill" :disabled="!step1Valid" @click="step = 2">
          Next: Questions →
        </button>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         STEP 2 — QUESTIONS
    ═════════════════════════════════════════════════════════ -->
    <div v-else-if="step === 2" class="cb-step-body">

      <!-- DYNAMIC shortcut -->
      <div v-if="form.is_dynamic" class="cb-dynamic-notice">
        <div class="cb-notice-icon">🎲</div>
        <div>
          <p class="cb-notice-title">Dynamic mode — no question selection needed</p>
          <p class="cb-notice-sub">
            When a student starts this exam, the system will automatically pick
            <strong>{{ form.question_count }} questions</strong> from the
            <strong>{{ form.stream }}</strong> question bank matching the filters you configured
            ({{ form.subject }} · {{ form.chapter }} · {{ form.difficulty }}).
            <span v-if="form.difficulty === 'mixed'">
              Distribution: {{ form.difficulty_distribution.easy }}% easy /
              {{ form.difficulty_distribution.medium }}% medium /
              {{ form.difficulty_distribution.hard }}% hard.
            </span>
          </p>
        </div>
      </div>

      <!-- MANUAL CURATED: question picker -->
      <div v-else-if="mode === 'manual'" class="cb-curated-section">
        <div class="cb-curated-header">
          <div>
            <h2 class="cb-section-title">Pick Questions</h2>
            <p class="cb-section-sub">
              {{ curatedQuestionIds.length }} / {{ form.question_count }} selected
            </p>
          </div>
          <button class="iso-btn iso-btn--ghost" @click="openPicker">
            Open Question Picker
          </button>
        </div>

        <div v-if="curatedPreview.length" class="cb-curated-preview">
          <div v-for="(q, i) in curatedPreview" :key="q.id" class="cb-pq">
            <span class="cb-pq-num">{{ i + 1 }}</span>
            <div class="cb-pq-body">
              <p class="cb-pq-text">{{ q.question?.bangla || q.question?.english }}</p>
              <div class="cb-pq-meta">
                <span>{{ q.subject?.english }}</span>
                <span>{{ q.chapter?.english }}</span>
                <span :class="diffCls(q.difficulty_level)">{{ cap(q.difficulty_level) }}</span>
              </div>
            </div>
            <button class="cb-pq-remove" @click="
              curatedQuestionIds = curatedQuestionIds.filter(id => id !== q.id);
              pickerSelected.delete(q.id)
            ">✕</button>
          </div>
        </div>
        <div v-else class="cb-curated-empty">
          Click "Open Question Picker" to browse and select questions.
        </div>
      </div>

      <!-- AI MODE: generation UI -->
      <div v-else class="cb-ai-section">
        <h2 class="cb-section-title">AI Question Generation</h2>
        <p class="cb-section-sub">
          Gemini will generate bilingual (English + Bangla) MCQ questions
          for <strong>{{ groupLabels[form.group_key] }}</strong>
          {{ form.subject !== 'All' ? `· ${form.subject}` : '' }}
          {{ form.chapter !== 'All' ? `· ${form.chapter}` : '' }}.
        </p>

        <div class="cb-ai-config">
          <div class="cb-field">
            <label class="cb-label">
              Number to generate <span class="cb-val">{{ ai.count }}</span>
            </label>
            <div class="cb-pills">
              <button v-for="n in [10,15,20,25,30]" :key="n"
                class="cb-pill cb-pill--sm" :class="{ active: ai.count === n }"
                @click="ai.count = n">{{ n }}</button>
            </div>
          </div>

          <div class="cb-field">
            <label class="cb-label">
              Topic seed / extra instructions
              <span class="cb-hint">— optional, helps Gemini focus</span>
            </label>
            <textarea class="cb-textarea" v-model="ai.seed" rows="3"
              placeholder="e.g. Focus on application-level questions about electromagnetic induction. Avoid basic definitions." />
          </div>

          <button class="iso-btn iso-btn--fill cb-generate-btn"
            :disabled="ai.generating" @click="generateWithAI">
            {{ ai.generating ? 'Generating…' : '✨ Generate Questions' }}
          </button>

          <div v-if="ai.error" class="cb-ai-error">{{ ai.error }}</div>
        </div>

        <!-- Generated questions review -->
        <div v-if="ai.generated.length" class="cb-ai-results">
          <div class="cb-ai-results-header">
            <span class="cb-section-title">Review Generated Questions</span>
            <span class="cb-section-sub">{{ ai.accepted.size }} of {{ ai.generated.length }} accepted</span>
            <div class="cb-ai-bulk-btns">
              <button class="cb-pill active" @click="ai.generated.forEach((_,i) => ai.accepted.add(i))">Accept All</button>
              <button class="cb-pill" @click="ai.accepted.clear()">Reject All</button>
            </div>
          </div>

          <div v-for="(q, i) in ai.generated" :key="i" class="cb-aiq"
            :class="{ 'cb-aiq--accepted': ai.accepted.has(i), 'cb-aiq--rejected': !ai.accepted.has(i) }">
            <div class="cb-aiq-header">
              <span class="cb-aiq-num">Q{{ i + 1 }}</span>
              <div class="cb-aiq-meta">
                <span :class="diffCls(q.difficulty)">{{ q.difficulty }}</span>
                <span>{{ q.subjectEN }}</span>
                <span>{{ q.chapterEN }}</span>
              </div>
              <button class="cb-aiq-toggle" @click="toggleAIQuestion(i)">
                {{ ai.accepted.has(i) ? '✓ Accepted' : '✕ Rejected' }}
              </button>
            </div>

            <div class="cb-aiq-body">
              <p class="cb-aiq-text cb-aiq-text--bn">{{ q.questionBN }}</p>
              <p class="cb-aiq-text cb-aiq-text--en">{{ q.questionEN }}</p>
              <div class="cb-aiq-options">
                <div v-for="(opt, oi) in q.optionsBN" :key="oi"
                  class="cb-aiq-opt"
                  :class="{ 'cb-aiq-opt--correct': ['A','B','C','D'][oi] === q.answerEN }">
                  <span class="cb-aiq-opt-letter">{{ ['A','B','C','D'][oi] }}</span>
                  <div>
                    <span>{{ opt }}</span>
                    <span class="cb-aiq-opt-en"> / {{ q.optionsEN[oi] }}</span>
                  </div>
                  <span v-if="['A','B','C','D'][oi] === q.answerEN" class="cb-aiq-correct-tag">✓</span>
                </div>
              </div>
              <p v-if="q.explanationBN" class="cb-aiq-explanation">
                <span class="cb-aiq-exp-label">Explanation</span>
                {{ q.explanationBN }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="cb-step-footer">
        <button class="iso-btn iso-btn--ghost" @click="step = 1">← Back</button>
        <button class="iso-btn iso-btn--fill"
          :disabled="!step2Valid" @click="step = 3">
          Next: Preview →
        </button>
      </div>
    </div>

    <!-- ════════════════════════════════════════════════════════
         STEP 3 — PREVIEW & PUBLISH
    ═════════════════════════════════════════════════════════ -->
    <div v-else-if="step === 3" class="cb-step-body">
      <div class="cb-two-col">

        <!-- Exam summary card -->
        <div class="cb-section">
          <h2 class="cb-section-title">Exam Summary</h2>
          <div class="cb-summary-card">
            <div class="cb-sc-top">
              <span class="cb-sc-stream">{{ cap(form.stream) }}</span>
              <span v-if="form.is_hot" class="cb-sc-hot">🔥 Hot</span>
              <span v-if="form.is_featured" class="cb-sc-feat">★ Featured</span>
            </div>
            <h3 class="cb-sc-title">{{ form.title }}</h3>
            <p class="cb-sc-desc">{{ form.description || '—' }}</p>
            <div class="cb-sc-meta">
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Group</span>
                <span class="cb-sc-val">{{ groupLabels[form.group_key] }}</span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Subject</span>
                <span class="cb-sc-val">{{ Array.isArray(form.subject) ? form.subject.join(', ') : form.subject }}</span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Chapter</span>
                <span class="cb-sc-val">{{ Array.isArray(form.chapter) ? form.chapter.join(', ') : form.chapter }}</span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Questions</span>
                <span class="cb-sc-val">{{ form.question_count }}</span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Duration</span>
                <span class="cb-sc-val">{{ form.duration_mins }} min</span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Difficulty</span>
                <span class="cb-sc-val" :class="diffCls(form.difficulty)">{{ cap(form.difficulty) }}</span>
              </div>
              <div v-if="form.difficulty === 'mixed'" class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Distribution</span>
                <span class="cb-sc-val">
                  {{ form.difficulty_distribution.easy }}E /
                  {{ form.difficulty_distribution.medium }}M /
                  {{ form.difficulty_distribution.hard }}H
                </span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Neg. Marking</span>
                <span class="cb-sc-val">{{ form.negative_marking === 0 ? 'None' : `−${form.negative_marking}` }}</span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Mode</span>
                <span class="cb-sc-val">{{ form.is_dynamic ? 'Dynamic' : 'Curated' }}</span>
              </div>
              <div class="cb-sc-meta-row">
                <span class="cb-sc-lbl">Source</span>
                <span class="cb-sc-val">{{ cap(form.source) }}</span>
              </div>
            </div>
            <div v-if="form.tags.length" class="cb-sc-tags">
              <span v-for="t in form.tags" :key="t" class="cb-tag">{{ t }}</span>
            </div>
          </div>
        </div>

        <!-- Publish panel -->
        <div class="cb-section">
          <h2 class="cb-section-title">Publish</h2>

          <div class="cb-publish-flow">
            <div class="cb-pf-step" :class="{ active: true }">
              <span class="cb-pf-icon">1</span>
              <div>
                <div class="cb-pf-title">Save as Draft</div>
                <div class="cb-pf-sub">Only visible to admins. You can keep editing.</div>
              </div>
            </div>
            <div class="cb-pf-line" />
            <div class="cb-pf-step">
              <span class="cb-pf-icon">2</span>
              <div>
                <div class="cb-pf-title">Submit for Review</div>
                <div class="cb-pf-sub">Marks it for another admin to approve before going live.</div>
              </div>
            </div>
            <div class="cb-pf-line" />
            <div class="cb-pf-step">
              <span class="cb-pf-icon">3</span>
              <div>
                <div class="cb-pf-title">Published</div>
                <div class="cb-pf-sub">Live for all students on the exams page.</div>
              </div>
            </div>
          </div>

          <div class="cb-publish-actions">
            <button class="iso-btn iso-btn--ghost cb-save-btn"
              :disabled="saving" @click="save('draft')">
              {{ saving ? 'Saving…' : 'Save as Draft' }}
            </button>
            <button class="iso-btn iso-btn--fill cb-save-btn"
              :disabled="saving" @click="save('review')">
              {{ saving ? 'Saving…' : 'Submit for Review →' }}
            </button>
          </div>

          <p class="cb-publish-note">
            After review, an admin can publish from the Exam Library.
            AI-generated questions are saved as <strong>draft</strong> in the question bank
            and must be published separately from the Questions tab.
          </p>
        </div>
      </div>

      <div class="cb-step-footer">
        <button class="iso-btn iso-btn--ghost" @click="step = 2">← Back</button>
      </div>
    </div>

    <!-- ── QUESTION PICKER MODAL ──────────────────────────── -->
    <Teleport to="body">
      <div v-if="pickerOpen" class="qp-backdrop" @click.self="closePicker">
        <div class="qp-modal">

          <div class="qp-header">
            <div>
              <span class="qp-title">Question Picker</span>
              <span class="qp-sub">{{ pickerSelected.size }} / {{ form.question_count }} questions selected</span>
            </div>
            <button class="qp-close" @click="closePicker">✕</button>
          </div>

          <!-- Picker filters -->
          <div class="qp-filters">
            <input class="qp-search" placeholder="Search questions…"
              :value="pickerSearch"
              @input="pickerSearch = $event.target.value; onPickerSearch()" />

            <div class="qp-filter-row">
              <div class="qp-pills">
                <button class="qp-pill" :class="{ active: pickerSubject === 'All' }"
                  @click="pickerSubject = 'All'">All Subjects</button>
                <button v-for="s in availableSubjects" :key="s.en"
                  class="qp-pill" :class="{ active: pickerSubject === s.en }"
                  @click="pickerSubject = s.en; pickerChapter = 'All'">{{ s.en }}</button>
              </div>
              <br>
              <div class="qp-pills">
                <button class="qp-pill" :class="{ active: pickerChapter === 'All' }"
                  @click="pickerChapter = 'All'">All Chapters</button>
                <template v-if="pickerSubject !== 'All'">
                  <button v-for="c in availableSubjects.find(s=>s.en===pickerSubject)?.chapters||[]"
                    :key="c.en" class="qp-pill" :class="{ active: pickerChapter === c.en }"
                    @click="pickerChapter = c.en">{{ c.en }}</button>
                </template>
              </div>
              <br>
              <div class="qp-pills">
                <button v-for="d in ['All','Easy','Medium','Hard']" :key="d"
                  class="qp-pill" :class="[{ active: pickerDiff === d }, d !== 'All' ? diffCls(d) : '']"
                  @click="pickerDiff = d"><span v-if="d !== 'All'">{{ d }}</span> <span v-else>All Difficulty</span></button>
              </div>
            </div>
          </div>

          <!-- Question list -->
          <div class="qp-list">
            <div v-if="pickerLoading" class="qp-loading">
              <div class="el-spinner" />Loading…
            </div>
            <div v-else-if="!pickerQuestions.length" class="qp-empty">
              No questions found for these filters.
            </div>
            <div v-else>
              <div v-for="q in pickerQuestions" :key="q.id"
                class="qp-item"
                :class="{ 'qp-item--selected': pickerSelected.has(q.id), 'qp-item--expanded': expandedPickerId === q.id }"
                @click="togglePickerExpand(q.id)">
                <input type="checkbox" class="qp-check"
                  :checked="pickerSelected.has(q.id)"
                  @click.stop="togglePickerQuestion(q.id)" />
                <div class="qp-item-body">
                  <p v-html="renderLatexText(q.question?.bangla)" class="qp-item-text" :class="{ 'qp-item-text--full': expandedPickerId === q.id }">
                  </p>
                  <div class="qp-item-meta">
                    <b>Subject:</b> <span>{{ q.subject?.bangla }}</span>
                    <b>Chapter:</b> <span>{{ q.chapter?.bangla }}</span>
                    <b>Difficulty:</b> <span :class="diffCls(q.difficulty_level)">{{ cap(q.difficulty_level) }}</span>
                    <span class="qp-item-id"><b>ID:</b> #{{ q.id }}</span>
                    <span v-if="q.stimulus_hash" class="qp-item-stimulus-tag">📎 Shared stimulus</span>
                  </div>

                  <!-- Expanded preview: options + answer, same accordion pattern as question-bank.vue -->
                  <Transition name="expand">
                    <div v-if="expandedPickerId === q.id" class="qp-item-expanded" @click.stop>

                      <!-- Stimulus (shared passage/context, if any) -->
                      <div v-if="q.stimulus?.english || q.stimulus_image" class="qp-stimulus">
                        <span class="qp-stimulus-label"><b>Stimulus</b></span>
                        <p v-if="q.stimulus?.english" class="qp-stimulus-text"><b>English:</b> <span v-html="renderLatexText(q.stimulus.english)"></span></p>
                        <p v-if="q.stimulus?.bangla" class="qp-stimulus-text"><b>Bangla:</b> <span v-html="renderLatexText(q.stimulus.bangla)"></span></p>
                        <img v-if="q.stimulus_image" :src="q.stimulus_image" class="qp-stimulus-img" />
                      </div>

                      <!-- Question image, if any -->
                      <img v-if="q.question_image" :src="q.question_image" class="qp-question-img" />

                      <p class="qp-item-text" :class="{ 'qp-item-text--full': expandedPickerId === q.id }">
                        <b>English:</b> <span v-html="renderLatexText(q.question?.english)" style="opacity: 0.7;"></span>
                      </p>

                      <div class="qp-item-meta">
                        <b>Subject:</b> <span>{{ q.subject?.english }}</span>
                        <b>Chapter:</b> <span>{{ q.chapter?.english }}</span>
                      </div>

                      <div v-if="q.options?.english?.length" class="qp-opt-list">
                        <div v-for="(opt, oi) in q.options.english" :key="oi"
                          class="qp-opt" :class="{ 'qp-opt--correct': oi === q.correct_index }">
                          <span class="qp-opt-letter">{{ ['A','B','C','D','E'][oi] }}.</span>
                          <span v-html="renderLatexText(opt)"></span>/<span v-html="renderLatexText(q.options.bangla[oi])"></span>
                          <span v-if="oi === q.correct_index" class="qp-opt-check">✓</span>
                        </div>
                      </div>
                      <p v-if="q.explanation?.bangla" class="qp-item-explanation">
                        <span class="qp-item-exp-label"><b>BN Explanation: </b></span>
                        <span v-html="renderLatexText(q.explanation.bangla)"></span>
                      </p>
                      <p v-if="q.explanation?.english" class="qp-item-explanation">
                        <span class="qp-item-exp-label"><b>EN Explanation: </b></span>
                        <span v-html="renderLatexText(q.explanation.english)"></span>
                      </p>
                      <button class="iso-btn iso-btn--ghost qp-select-btn"
                        @click.stop="togglePickerQuestion(q.id)">
                        {{ pickerSelected.has(q.id) ? '✓ Selected — click to remove' : '+ Select this question' }}
                      </button>
                    </div>
                  </Transition>
                </div>

                <button class="qp-expand-toggle" @click.stop="togglePickerExpand(q.id)">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                    <polyline :points="expandedPickerId === q.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Picker pagination — numbered, same pattern as question-bank.vue -->
          <div v-if="pickerTotalPages > 1" class="qp-pagination">
            <button class="el-pg-btn" :disabled="pickerPage === 1"
              @click="pickerGotoPage(pickerPage - 1)">← Prev</button>

            <div class="qp-page-numbers">
              <button
                v-for="p in pickerVisiblePages"
                :key="p"
                class="qp-page-num"
                :class="{ active: p === pickerPage, ellipsis: p === '…' }"
                :disabled="p === '…'"
                @click="typeof p === 'number' && pickerGotoPage(p)"
              >{{ p }}</button>
            </div>

            <button class="el-pg-btn" :disabled="pickerPage === pickerTotalPages"
              @click="pickerGotoPage(pickerPage + 1)">Next →</button>
          </div>

          <div class="qp-footer">
            <span class="qp-selected-count">{{ pickerSelected.size }} / {{ form.question_count }} questions selected</span>
            <div style="display:flex;gap:8px">
              <button class="iso-btn iso-btn--ghost" @click="closePicker">Cancel</button>
              <button class="iso-btn iso-btn--fill" @click="confirmPickerSelection">
                Confirm Selection →
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

    <!-- ── TOAST ─────────────────────────────────────────────── -->
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

.cb-page { padding: 28px; max-width: 1200px; display: flex; flex-direction: column; gap: 24px; }

/* Header */
.cb-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
.cb-header-left { display: flex; flex-direction: column; gap: 4px; }
.cb-back { font-family: var(--font-mono); font-size: 0.58rem; color: var(--gray); text-decoration: none; letter-spacing: 0.1em; transition: color 0.12s; }
.cb-back:hover { color: var(--white); }
.cb-title { font-family: var(--font-mono); font-size: 1.5rem; font-weight: 700; color: var(--white); margin: 0; }

/* Mode toggle */
.cb-mode-toggle { display: flex; gap: 0; border: 1px solid var(--border); }
.cb-mode-btn { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; padding: 9px 18px; background: transparent; border: none; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.cb-mode-btn.active { background: rgba(240,240,234,0.08); color: var(--white); }
.cb-mode-btn:first-child { border-right: 1px solid var(--border); }

/* Steps */
.cb-steps { display: flex; align-items: center; gap: 0; border: 1px solid var(--border); background: rgba(240,240,234,0.01); }
.cb-step { flex: 1; display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-right: 1px solid var(--border); transition: background 0.12s; }
.cb-step:last-child { border-right: none; }
.cb-step.active { background: rgba(240,240,234,0.06); }
.cb-step.done .cb-step-num { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); }
.cb-step-num { font-family: var(--font-mono); font-size: 0.6rem; width: 22px; height: 22px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--gray); flex-shrink: 0; }
.cb-step.active .cb-step-num { border-color: var(--white); color: var(--white); }
.cb-step-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray); }
.cb-step.active .cb-step-label { color: var(--white); }

/* Step body */
.cb-step-body { display: flex; flex-direction: column; gap: 20px; }
.cb-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); border: 1px solid var(--border); box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); }
.cb-section { background: var(--black); padding: 24px; display: flex; flex-direction: column; gap: 18px; }
.cb-section-title { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--white); margin: 0; }
.cb-section-sub { font-family: var(--font-sans); font-size: 0.75rem; color: var(--gray); margin: 0; line-height: 1.5; }

/* Fields */
.cb-field { display: flex; flex-direction: column; gap: 8px; }
.cb-label { font-family: var(--font-mono); font-size: 0.56rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--white); display: flex; align-items: center; gap: 8px; }
.cb-req { color: rgba(255,100,100,0.8); }
.cb-hint { font-family: var(--font-sans); font-size: 0.68rem; text-transform: none; letter-spacing: 0; color: var(--gray); font-weight: 400; }
.cb-val { margin-left: auto; font-size: 0.7rem; color: var(--white); }
.cb-val--warn { color: rgba(255,100,100,0.8); }
.cb-char { font-family: var(--font-mono); font-size: 0.46rem; color: var(--dim); align-self: flex-end; }
.cb-input, .cb-textarea { background: rgba(240,240,234,0.03); border: 1px solid var(--border); color: var(--white); font-family: var(--font-sans); font-size: 0.8rem; padding: 10px 12px; outline: none; resize: vertical; transition: border-color 0.12s; width: 100%; box-sizing: border-box; }
.cb-input:focus, .cb-textarea:focus { border-color: var(--border-bright); }
.cb-input::placeholder, .cb-textarea::placeholder { color: var(--dim); }
.cb-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.cb-slider { width: 100%; appearance: none; height: 2px; background: var(--border); outline: none; accent-color: var(--white); margin-top: 4px; }
.cb-slider::-webkit-slider-thumb { appearance: none; width: 12px; height: 12px; background: var(--white); cursor: pointer; }
.cb-slider--dist { margin-top: 2px; }

/* Pills */
.cb-pills { display: flex; gap: 5px; flex-wrap: wrap; }
.cb-pills--wrap { max-height: 120px; overflow-y: auto; }
.cb-pill { font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.08em; padding: 5px 10px; border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.cb-pill:hover { border-color: var(--border-bright); color: var(--white); }
.cb-pill.active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.07); }
.cb-pill--sm { padding: 4px 8px; font-size: 0.48rem; }
.cb-pill--red.active { border-color: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); background: rgba(255,100,100,0.07); }
.diff-easy.active  { border-color: rgba(120,230,120,0.5) !important; color: rgba(120,230,120,0.9) !important; background: rgba(120,230,120,0.07) !important; }
.diff-medium.active{ border-color: rgba(255,200,80,0.5)  !important; color: rgba(255,200,80,0.9)  !important; background: rgba(255,200,80,0.07)  !important; }
.diff-hard.active  { border-color: rgba(255,100,100,0.5) !important; color: rgba(255,100,100,0.9) !important; background: rgba(255,100,100,0.07) !important; }

/* Tags input */
.cb-tags-input { display: flex; flex-wrap: wrap; gap: 5px; padding: 8px 10px; border: 1px solid var(--border); background: rgba(240,240,234,0.02); min-height: 40px; cursor: text; }
.cb-tags-input:focus-within { border-color: var(--border-bright); }
.cb-tag { display: inline-flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 0.52rem; padding: 3px 8px; border: 1px solid var(--border); color: var(--white); }
.cb-tag button { background: none; border: none; color: var(--gray); cursor: pointer; font-size: 0.55rem; padding: 0; line-height: 1; }
.cb-tag-input-inner { background: none; border: none; color: var(--white); font-family: var(--font-sans); font-size: 0.78rem; outline: none; flex: 1; min-width: 80px; }

/* Mode cards */
.cb-mode-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.cb-mode-card { display: flex; gap: 10px; align-items: flex-start; padding: 12px; border: 1px solid var(--border); cursor: pointer; transition: all 0.12s; }
.cb-mode-card:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.cb-mode-card.active { border-color: var(--white); background: rgba(240,240,234,0.05); }
.cb-mode-card-icon { font-size: 1.2rem; flex-shrink: 0; }
.cb-mode-card-title { font-family: var(--font-mono); font-size: 0.6rem; font-weight: 600; color: var(--white); letter-spacing: 0.08em; }
.cb-mode-card-sub { font-family: var(--font-sans); font-size: 0.68rem; color: var(--gray); margin-top: 2px; line-height: 1.4; }

/* Difficulty distribution */
.cb-dist { display: flex; flex-direction: column; gap: 10px; }
.cb-dist-row { display: flex; align-items: center; gap: 10px; }
.cb-dist-label { font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.08em; width: 52px; flex-shrink: 0; }
.cb-dist-val { font-family: var(--font-mono); font-size: 0.56rem; color: var(--white); width: 36px; text-align: right; flex-shrink: 0; }
.cb-dist-bar { height: 6px; display: flex; border: 1px solid var(--border); overflow: hidden; margin-top: 2px; }
.cb-dist-seg { height: 100%; transition: width 0.2s; }
.diff-easy  .cb-dist-seg, .cb-dist-seg.diff-easy  { background: rgba(120,230,120,0.5); }
.diff-medium.cb-dist-seg, .cb-dist-seg.diff-medium { background: rgba(255,200,80,0.5); }
.diff-hard  .cb-dist-seg, .cb-dist-seg.diff-hard   { background: rgba(255,100,100,0.5); }

/* Step footer */
.cb-step-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 8px; border-top: 1px solid var(--border); }

/* Dynamic notice */
.cb-dynamic-notice { display: flex; gap: 16px; align-items: flex-start; border: 1px solid rgba(140,180,255,0.2); background: rgba(140,180,255,0.04); padding: 20px; }
.cb-notice-icon { font-size: 1.8rem; flex-shrink: 0; }
.cb-notice-title { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 600; color: var(--white); margin: 0 0 6px; }
.cb-notice-sub { font-family: var(--font-sans); font-size: 0.76rem; color: var(--gray); margin: 0; line-height: 1.6; }

/* Curated section */
.cb-curated-section { display: flex; flex-direction: column; gap: 14px; }
.cb-curated-header { display: flex; justify-content: space-between; align-items: center; }
.cb-curated-preview { display: flex; flex-direction: column; gap: 1px; background: var(--border); border: 1px solid var(--border); }
.cb-pq { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: var(--black); }
.cb-pq-num { font-family: var(--font-mono); font-size: 0.52rem; color: var(--gray); width: 24px; flex-shrink: 0; padding-top: 2px; }
.cb-pq-body { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.cb-pq-text { font-family: var(--font-sans); font-size: 0.76rem; color: var(--white); margin: 0; line-height: 1.4; }
.cb-pq-meta { display: flex; gap: 8px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.46rem; color: var(--gray); letter-spacing: 0.08em; }
.cb-pq-remove { background: none; border: none; color: var(--dim); cursor: pointer; font-size: 0.6rem; flex-shrink: 0; padding: 2px 4px; transition: color 0.12s; }
.cb-pq-remove:hover { color: rgba(255,100,100,0.8); }
.cb-curated-empty { padding: 40px; text-align: center; font-family: var(--font-sans); font-size: 0.78rem; color: var(--gray); border: 1px solid var(--border); }

/* AI section */
.cb-ai-section { display: flex; flex-direction: column; gap: 20px; }
.cb-ai-config { display: flex; flex-direction: column; gap: 16px; border: 1px solid var(--border); padding: 20px; background: rgba(240,240,234,0.01); }
.cb-generate-btn { align-self: flex-start; }
.cb-ai-error { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(255,100,100,0.9); border: 1px solid rgba(255,100,100,0.2); padding: 10px 14px; background: rgba(255,100,100,0.04); }

/* AI results */
.cb-ai-results { display: flex; flex-direction: column; gap: 12px; }
.cb-ai-results-header { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.cb-ai-bulk-btns { display: flex; gap: 6px; margin-left: auto; }

.cb-aiq { border: 1px solid var(--border); transition: border-color 0.12s; }
.cb-aiq--accepted { border-color: rgba(120,230,120,0.25); }
.cb-aiq--rejected { opacity: 0.45; }
.cb-aiq-header { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
.cb-aiq-num { font-family: var(--font-mono); font-size: 0.54rem; color: var(--gray); }
.cb-aiq-meta { display: flex; gap: 8px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.48rem; color: var(--gray); }
.cb-aiq-toggle { margin-left: auto; font-family: var(--font-mono); font-size: 0.5rem; letter-spacing: 0.08em; padding: 4px 10px; border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.cb-aiq--accepted .cb-aiq-toggle { border-color: rgba(120,230,120,0.3); color: rgba(120,230,120,0.9); }
.cb-aiq-body { padding: 14px; display: flex; flex-direction: column; gap: 8px; }
.cb-aiq-text { font-family: var(--font-sans); font-size: 0.78rem; color: var(--white); margin: 0; line-height: 1.5; }
.cb-aiq-text--en { color: var(--gray); font-size: 0.72rem; }
.cb-aiq-text--bn { }
.cb-aiq-options { display: flex; flex-direction: column; gap: 4px; }
.cb-aiq-opt { display: flex; align-items: flex-start; gap: 8px; padding: 5px 8px; font-family: var(--font-sans); font-size: 0.74rem; color: var(--gray); }
.cb-aiq-opt--correct { background: rgba(120,230,120,0.06); color: rgba(120,230,120,0.9); }
.cb-aiq-opt-letter { font-family: var(--font-mono); font-size: 0.52rem; width: 16px; flex-shrink: 0; padding-top: 1px; }
.cb-aiq-opt-en { opacity: 0.6; font-size: 0.68rem; }
.cb-aiq-correct-tag { margin-left: auto; font-family: var(--font-mono); font-size: 0.5rem; color: rgba(120,230,120,0.7); flex-shrink: 0; }
.cb-aiq-explanation { font-family: var(--font-sans); font-size: 0.72rem; color: var(--dim); margin: 0; border-top: 1px solid var(--border); padding-top: 8px; line-height: 1.5; }
.cb-aiq-exp-label { font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray); margin-right: 8px; }

/* Summary card */
.cb-summary-card { border: 1px solid var(--border); padding: 20px; display: flex; flex-direction: column; gap: 14px; background: rgba(240,240,234,0.02); }
.cb-sc-top { display: flex; gap: 6px; flex-wrap: wrap; }
.cb-sc-stream { font-family: var(--font-mono); font-size: 0.48rem; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid var(--border); padding: 2px 7px; color: var(--gray); }
.cb-sc-hot { font-family: var(--font-mono); font-size: 0.46rem; padding: 2px 7px; background: rgba(255,200,80,0.07); border: 1px solid rgba(255,200,80,0.2); color: rgba(255,200,80,0.85); }
.cb-sc-feat { font-family: var(--font-mono); font-size: 0.46rem; padding: 2px 7px; background: rgba(200,160,255,0.07); border: 1px solid rgba(200,160,255,0.2); color: rgba(200,160,255,0.85); }
.cb-sc-title { font-family: var(--font-mono); font-size: 0.9rem; font-weight: 600; color: var(--white); margin: 0; }
.cb-sc-desc { font-family: var(--font-sans); font-size: 0.75rem; color: var(--dim); margin: 0; line-height: 1.5; }
.cb-sc-meta { display: flex; flex-direction: column; gap: 6px; }
.cb-sc-meta-row { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.56rem; padding: 5px 0; border-bottom: 1px solid var(--border); }
.cb-sc-meta-row:last-child { border-bottom: none; }
.cb-sc-lbl { color: var(--gray); letter-spacing: 0.1em; text-transform: uppercase; }
.cb-sc-val { color: var(--white); }
.cb-sc-tags { display: flex; gap: 5px; flex-wrap: wrap; }

/* Publish flow */
.cb-publish-flow { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); }
.cb-pf-step { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; }
.cb-pf-step.active { background: rgba(240,240,234,0.04); }
.cb-pf-line { height: 1px; background: var(--border); }
.cb-pf-icon { font-family: var(--font-mono); font-size: 0.56rem; width: 22px; height: 22px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--gray); flex-shrink: 0; margin-top: 2px; }
.cb-pf-title { font-family: var(--font-mono); font-size: 0.6rem; font-weight: 600; color: var(--white); letter-spacing: 0.06em; margin-bottom: 3px; }
.cb-pf-sub { font-family: var(--font-sans); font-size: 0.7rem; color: var(--gray); line-height: 1.4; }
.cb-publish-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.cb-save-btn { font-size: 0.62rem; padding: 11px 20px; }
.cb-publish-note { font-family: var(--font-sans); font-size: 0.7rem; color: var(--dim); margin: 0; line-height: 1.6; border-top: 1px solid var(--border); padding-top: 12px; }

/* Question Picker Modal */
.qp-backdrop { position: fixed; inset: 0; z-index: 200; background: rgba(8,8,8,0.88); display: flex; align-items: center; justify-content: center; padding: 20px; }
.qp-modal { background: var(--black); border: 1px solid var(--border-bright); box-shadow: 8px 8px 0 0 rgba(240,240,234,0.06); width: 100%; max-width: 780px; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; }
.qp-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
.qp-title { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600; color: var(--white); letter-spacing: 0.08em; }
.qp-sub { font-family: var(--font-mono); font-size: 0.54rem; color: var(--gray); margin-left: 10px; }
.qp-close { background: none; border: 1px solid var(--border); color: var(--gray); width: 26px; height: 26px; cursor: pointer; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; transition: all 0.12s; }
.qp-close:hover { border-color: var(--border-bright); color: var(--white); }
.qp-filters { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
.qp-search { width: 100%; padding: 8px 12px; background: rgba(240,240,234,0.03); border: 1px solid var(--border); color: var(--white); font-family: var(--font-sans); font-size: 0.76rem; outline: none; box-sizing: border-box; }
.qp-search:focus { border-color: var(--border-bright); }
.qp-filter-row { display: flex; flex-direction: column; gap: 6px; }
.qp-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.qp-pill { font-family: var(--font-mono); font-size: 0.48rem; letter-spacing: 0.08em; padding: 4px 9px; border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.qp-pill:hover { border-color: var(--border-bright); color: var(--white); }
.qp-pill.active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.07); }
.qp-list { flex: 1; overflow-y: auto; }
.qp-loading, .qp-empty { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 40px; font-family: var(--font-mono); font-size: 0.62rem; color: var(--gray); }
.el-spinner { width: 16px; height: 16px; border: 2px solid var(--border); border-top-color: var(--white); border-radius: 50%; animation: spin 0.8s linear infinite; flex-shrink: 0; }
@keyframes spin { to { transform: rotate(360deg); } }
.qp-item { display: flex; align-items: flex-start; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.1s; }
.qp-item:hover { background: rgba(240,240,234,0.03); }
.qp-item--selected { background: rgba(120,230,120,0.04); border-left: 2px solid rgba(120,230,120,0.3); }
.qp-item--expanded { background: rgba(240,240,234,0.03); }
.qp-check { flex-shrink: 0; accent-color: rgba(120,230,120,0.8); margin-top: 3px; cursor: pointer; }
.qp-item-body { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.qp-item-text { font-family: var(--font-sans); font-size: 0.76rem; color: var(--white); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.qp-item-text--full { -webkit-line-clamp: unset; display: block; }
.qp-item-meta { display: flex; gap: 8px; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }
.qp-item-id { color: var(--dim); }

.qp-stimulus { border: 1px solid var(--border); padding: 10px 12px; background: rgba(240,240,234,0.02); display: flex; flex-direction: column; gap: 6px; }
.qp-stimulus-label { font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray); }
.qp-stimulus-text { font-family: var(--font-sans); font-size: 0.74rem; color: var(--dim); margin: 0; line-height: 1.5; }
.qp-stimulus-img, .qp-question-img { max-width: 100%; border: 1px solid var(--border); display: block; }
.qp-item-stimulus-tag { color: var(--gray); }

.diff-easy   { background: rgba(120,230,120,0.07); border-color: rgba(120,230,120,0.25) !important; color: rgba(120,230,120,0.8) !important; }
.diff-medium { background: rgba(255,200,80,0.07);  border-color: rgba(255,200,80,0.25)  !important; color: rgba(255,200,80,0.8)  !important; }
.diff-hard   { background: rgba(255,100,100,0.07); border-color: rgba(255,100,100,0.25) !important; color: rgba(255,100,100,0.8) !important; }

.qp-expand-toggle { background: none; border: none; cursor: pointer; color: var(--gray); display: flex; align-items: center; padding: 4px; flex-shrink: 0; transition: color 0.15s; }
.qp-expand-toggle:hover { color: var(--white); }

/* Picker expanded preview — same transition pattern as question-bank.vue's .expand-* */
.expand-enter-active, .expand-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.expand-enter-from, .expand-leave-to { opacity: 0; transform: translateY(-6px); }

.qp-item-expanded { margin-top: 8px; padding-top: 10px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 10px; cursor: default; }
.qp-opt-list { display: flex; flex-direction: column; gap: 5px; }
.qp-opt { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border: 1px solid var(--border); font-family: var(--font-sans); font-size: 0.74rem; color: var(--gray); }
.qp-opt--correct { border-color: rgba(120,230,120,0.4); background: rgba(120,230,120,0.06); color: rgba(120,230,120,0.9); }
.qp-opt-letter { font-family: var(--font-mono); font-size: 0.52rem; font-weight: 700; width: 16px; flex-shrink: 0; }
.qp-opt-check { margin-left: auto; color: rgba(120,230,120,0.8); flex-shrink: 0; }
.qp-item-explanation { font-family: var(--font-sans); font-size: 0.72rem; color: var(--dim); margin: 0; line-height: 1.5; }
.qp-item-exp-label { font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray); margin-right: 8px; }
.qp-select-btn { align-self: flex-start; font-size: 0.6rem !important; padding: 6px 14px !important; }

.qp-pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border-top: 1px solid var(--border); flex-shrink: 0; flex-wrap: wrap; }
.el-pg-btn { font-family: var(--font-mono); font-size: 0.62rem; padding: 6px 12px; border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.el-pg-btn:hover:not(:disabled) { border-color: var(--border-bright); color: var(--white); }
.el-pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.el-pg-info { font-family: var(--font-mono); font-size: 0.56rem; color: var(--gray); }

.qp-page-numbers { display: flex; align-items: center; gap: 4px; flex-wrap: wrap; }
.qp-page-num {
  font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700;
  width: 26px; height: 26px;
  border: 1px solid var(--border);
  background: transparent; cursor: pointer; color: var(--gray);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.qp-page-num:hover:not(:disabled) { color: var(--white); border-color: var(--border-bright); }
.qp-page-num.active { background: var(--white); color: var(--black); border-color: var(--white); }
.qp-page-num.ellipsis { cursor: default; border-color: transparent; }
.qp-footer { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-top: 1px solid var(--border); flex-shrink: 0; }
.qp-selected-count { font-family: var(--font-mono); font-size: 0.56rem; color: var(--gray); }

/* Toast */
.admin-toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px; font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.08em; border: 1px solid var(--border); background: var(--black); color: var(--white); z-index: 9999; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06); }
.admin-toast.error { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }

@media (max-width: 900px) {
  .cb-two-col { grid-template-columns: 1fr; }
  .cb-row-2 { grid-template-columns: 1fr; }
  .cb-page { padding: 16px 14px; }
}
@media (max-width: 600px) {
  .cb-mode-cards { grid-template-columns: 1fr; }
  .cb-steps { flex-direction: column; }
  .cb-step { border-right: none; border-bottom: 1px solid var(--border); }
}
</style>
