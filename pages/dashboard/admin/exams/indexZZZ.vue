<script setup>
definePageMeta({ middleware: 'auth', layout: 'admin', title: 'Exams' })

const supabase = useSupabaseClient()
const user     = useSupabaseUser()

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

// ─── STATE ───────────────────────────────────────────────────────
const exams       = ref([])
const loading     = ref(true)
const filterStatus  = ref('all')   // all | draft | review | published | archived
const filterStream  = ref('all')
const filterSource  = ref('all')
const searchQuery   = ref('')
const sortBy        = ref('newest')
const page          = ref(1)
const perPage       = 12

const toast = reactive({ show: false, msg: '', type: 'success' })
function showToast(msg, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3500)
}

// ─── FETCH ───────────────────────────────────────────────────────
async function fetchExams() {
  loading.value = true
  try {
    // Admin uses service role — reads all statuses
    // In production, this call should go through a server route that uses service_role key
    // For now, we use the anon client (make sure you have an admin RLS policy or service key setup)
    let q = supabase.from('preset_exams').select('*')
    if (filterStatus.value !== 'all')  q = q.eq('status', filterStatus.value)
    if (filterStream.value !== 'all')  q = q.eq('stream', filterStream.value)
    if (filterSource.value !== 'all')  q = q.eq('source', filterSource.value)
    if (searchQuery.value.trim())       q = q.ilike('title', `%${searchQuery.value.trim()}%`)
    if (sortBy.value === 'newest')     q = q.order('created_at', { ascending: false })
    if (sortBy.value === 'popular')    q = q.order('attendees', { ascending: false })
    if (sortBy.value === 'az')         q = q.order('title', { ascending: true })

    const { data, error } = await q
    if (error) throw error
    exams.value = data || []
  } catch (e) {
    console.error(e)
    showToast('Failed to load exams', 'error')
  } finally {
    loading.value = false
  }
}

onMounted(fetchExams)
watch([filterStatus, filterStream, filterSource, sortBy], fetchExams)

let searchDebounce = null
function onSearch(e) {
  searchQuery.value = e.target.value
  clearTimeout(searchDebounce)
  searchDebounce = setTimeout(fetchExams, 300)
}
function clearSearch() {
  searchQuery.value = ''
  fetchExams()
}

// ─── PAGINATION ───────────────────────────────────────────────────
const totalPages   = computed(() => Math.ceil(exams.value.length / perPage))
const pagedExams   = computed(() => {
  const start = (page.value - 1) * perPage
  return exams.value.slice(start, start + perPage)
})

// ─── ACTIONS ─────────────────────────────────────────────────────
async function updateStatus(exam, newStatus) {
  try {
    const update = { status: newStatus }
    if (newStatus === 'published') {
      update.published_at  = new Date().toISOString()
      update.reviewed_by   = user.value?.id
      update.reviewed_at   = new Date().toISOString()
    }
    const { error } = await supabase
      .from('preset_exams').update(update).eq('id', exam.id)
    if (error) throw error
    exam.status = newStatus
    showToast(`Exam ${newStatus === 'published' ? 'published' : newStatus + 'd'} ✓`)
  } catch (e) {
    console.error(e)
    showToast('Status update failed', 'error')
  }
}

async function toggleHot(exam) {
  try {
    const { error } = await supabase
      .from('preset_exams').update({ is_hot: !exam.is_hot }).eq('id', exam.id)
    if (error) throw error
    exam.is_hot = !exam.is_hot
    showToast(exam.is_hot ? '🔥 Marked as Hot' : 'Removed from Hot')
  } catch (e) {
    showToast('Update failed', 'error')
  }
}

async function deleteExam(exam) {
  if (!confirm(`Delete "${exam.title}"? This cannot be undone.`)) return
  try {
    const { error } = await supabase.from('preset_exams').delete().eq('id', exam.id)
    if (error) throw error
    exams.value = exams.value.filter(e => e.id !== exam.id)
    showToast('Exam deleted')
  } catch (e) {
    showToast('Delete failed', 'error')
  }
}

// ─── HELPERS ─────────────────────────────────────────────────────
const streamOptions = ['all','hsc','ssc','engineering','medical','varsity']
const statusOptions = ['all','draft','review','published','archived']
const sourceOptions = ['all','ai','teacher','mixed']

function statusCls(s) {
  if (s === 'published') return 'st-published'
  if (s === 'review')    return 'st-review'
  if (s === 'draft')     return 'st-draft'
  return 'st-archived'
}
function sourceCls(s) {
  if (s === 'ai')      return 'src-ai'
  if (s === 'teacher') return 'src-teacher'
  return 'src-mixed'
}
function diffCls(d) {
  if (d === 'easy') return 'diff-easy'
  if (d === 'hard') return 'diff-hard'
  return 'diff-medium'
}
function fmtDate(d) {
  return d ? new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' }) : '—'
}
function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : '' }
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

  <div class="el-page">

    <!-- ── PAGE HEADER ─────────────────────────────────────── -->
    <div class="el-header">
      <div class="el-header-left">
        <div class="page-chip"><span class="chip-dot" />Exam Library</div>
        <h1 class="el-title">Preset Exams</h1>
        <p class="el-sub">Manage, publish, and monitor all preset exam configurations.</p>
      </div>
      <div class="el-header-actions">
        <NuxtLink to="/dashboard/admin/exams/create" class="iso-btn iso-btn--fill">
          + Create Exam
        </NuxtLink>
      </div>
    </div>

    <!-- ── STATS ROW ──────────────────────────────────────── -->
    <div class="el-stats">
      <div class="el-stat" v-for="s in [
        { label: 'Total',     val: exams.length },
        { label: 'Published', val: exams.filter(e=>e.status==='published').length },
        { label: 'In Review', val: exams.filter(e=>e.status==='review').length },
        { label: 'Drafts',    val: exams.filter(e=>e.status==='draft').length },
      ]" :key="s.label">
        <span class="el-stat-val">{{ s.val }}</span>
        <span class="el-stat-lbl">{{ s.label }}</span>
      </div>
    </div>

    <!-- ── FILTERS ──────────────────────────────────────────── -->
    <div class="el-filters">
      <div class="el-search-wrap">
        <svg viewBox="0 0 16 16" fill="none" width="13" height="13" class="el-search-icon">
          <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
          <path d="M11 11l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <input class="el-search" placeholder="Search exams…" :value="searchQuery" @input="onSearch" />
        <button v-if="searchQuery" class="el-search-clear" @click="clearSearch">✕</button>
      </div>

      <div class="el-filter-pills">
        <div class="el-filter-group">
          <span class="el-filter-lbl">Status</span>
          <div class="el-pills">
            <button v-for="s in statusOptions" :key="s"
              class="el-pill" :class="{ active: filterStatus === s }"
              @click="filterStatus = s; page = 1">
              {{ s === 'all' ? 'All' : cap(s) }}
            </button>
          </div>
        </div>
        <div class="el-filter-group">
          <span class="el-filter-lbl">Stream</span>
          <div class="el-pills">
            <button v-for="s in streamOptions" :key="s"
              class="el-pill" :class="{ active: filterStream === s }"
              @click="filterStream = s; page = 1">
              {{ s === 'all' ? 'All' : cap(s) }}
            </button>
          </div>
        </div>
        <div class="el-filter-group">
          <span class="el-filter-lbl">Source</span>
          <div class="el-pills">
            <button v-for="s in sourceOptions" :key="s"
              class="el-pill" :class="{ active: filterSource === s }"
              @click="filterSource = s; page = 1">
              {{ s === 'all' ? 'All' : cap(s) }}
            </button>
          </div>
        </div>
        <div class="el-filter-group">
          <span class="el-filter-lbl">Sort</span>
          <div class="el-pills">
            <button v-for="s in [{ v:'newest', l:'Newest' },{ v:'popular', l:'Popular' },{ v:'az', l:'A–Z' }]"
              :key="s.v" class="el-pill" :class="{ active: sortBy === s.v }"
              @click="sortBy = s.v">{{ s.l }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── LOADING ───────────────────────────────────────────── -->
    <div v-if="loading" class="el-loading">
      <div class="el-spinner" />
      <span>Loading exams…</span>
    </div>

    <!-- ── EMPTY ─────────────────────────────────────────────── -->
    <div v-else-if="!exams.length" class="el-empty">
      <div class="el-empty-icon">📋</div>
      <p class="el-empty-title">No exams yet</p>
      <p class="el-empty-sub">Create your first preset exam to get started.</p>
      <NuxtLink to="/dashboard/admin/exams/create" class="iso-btn iso-btn--fill">+ Create Exam</NuxtLink>
    </div>

    <!-- ── EXAM GRID ─────────────────────────────────────────── -->
    <div v-else class="el-grid">
      <div v-for="exam in pagedExams" :key="exam.id" class="ec">

        <!-- Card top -->
        <div class="ec-top">
          <div class="ec-badges">
            <span class="ec-stream-badge">{{ cap(exam.stream) }}</span>
            <span v-if="exam.is_hot" class="ec-hot-badge">🔥 Hot</span>
            <span v-if="exam.is_featured" class="ec-feat-badge">★ Featured</span>
          </div>
          <div class="ec-actions-top">
            <button class="ec-icon-btn" :class="{ 'hot-active': exam.is_hot }"
              :title="exam.is_hot ? 'Remove from Hot' : 'Mark as Hot'"
              @click="toggleHot(exam)">🔥</button>
            <NuxtLink :to="`/dashboard/admin/exams/edit/${exam.id}`" class="ec-icon-btn" title="Edit">
              <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10z"/>
              </svg>
            </NuxtLink>
          </div>
        </div>

        <!-- Title + desc -->
        <h3 class="ec-title">{{ exam.title }}</h3>
        <p class="ec-desc">{{ exam.description || '—' }}</p>

        <!-- Meta -->
        <div class="ec-meta">
          <span class="ec-meta-pill">{{ exam.question_count }}Q</span>
          <span class="ec-meta-pill">{{ exam.duration_mins }}min</span>
          <span class="ec-meta-pill" :class="diffCls(exam.difficulty)">{{ cap(exam.difficulty) }}</span>
          <span class="ec-meta-pill" :class="sourceCls(exam.source)">{{ cap(exam.source) }}</span>
          <span class="ec-meta-pill" v-if="!exam.is_dynamic">Curated</span>
          <span class="ec-meta-pill" v-else>Dynamic</span>
        </div>

        <!-- Stats row -->
        <div class="ec-stats">
          <span class="ec-stat-item">👥 {{ exam.attendees.toLocaleString() }}</span>
          <span class="ec-stat-item">★ {{ exam.rating || '—' }}</span>
          <span class="ec-stat-item">{{ fmtDate(exam.created_at) }}</span>
        </div>

        <!-- Footer: status + actions -->
        <div class="ec-footer">
          <span class="ec-status" :class="statusCls(exam.status)">{{ cap(exam.status) }}</span>
          <div class="ec-footer-actions">
            <!-- Status transitions -->
            <button v-if="exam.status === 'draft'" class="ec-action-btn"
              @click="updateStatus(exam, 'review')">→ Review</button>
            <button v-if="exam.status === 'review'" class="ec-action-btn ec-action-btn--green"
              @click="updateStatus(exam, 'published')">Publish</button>
            <button v-if="exam.status === 'review'" class="ec-action-btn"
              @click="updateStatus(exam, 'draft')">← Draft</button>
            <button v-if="exam.status === 'published'" class="ec-action-btn"
              @click="updateStatus(exam, 'archived')">Archive</button>
            <button v-if="exam.status === 'archived'" class="ec-action-btn"
              @click="updateStatus(exam, 'published')">Restore</button>
            <button class="ec-action-btn ec-action-btn--red"
              @click="deleteExam(exam)">Delete</button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── PAGINATION ────────────────────────────────────────── -->
    <div v-if="totalPages > 1" class="el-pagination">
      <button class="el-pg-btn" :disabled="page === 1" @click="page--">←</button>
      <span class="el-pg-info">{{ page }} / {{ totalPages }}</span>
      <button class="el-pg-btn" :disabled="page === totalPages" @click="page++">→</button>
    </div>

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

.el-page { padding: 28px 28px 80px; max-width: 1200px; display: flex; flex-direction: column; gap: 24px; }

/* Header */
.el-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.el-header-left { display: flex; flex-direction: column; gap: 6px; }
.page-chip { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 0.5rem; letter-spacing: 0.16em; text-transform: uppercase; border: 1px solid var(--border); padding: 4px 10px; color: var(--gray); width: fit-content; }
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
.el-title { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--white); margin: 0; }
.el-sub { font-family: var(--font-sans); font-size: 0.78rem; color: var(--gray); margin: 0; }

/* Stats */
.el-stats { display: flex; gap: 1px; background: var(--border); border: 1px solid var(--border); box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); }
.el-stat { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 14px; background: var(--black); }
.el-stat-val { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.el-stat-lbl { font-family: var(--font-mono); font-size: 0.48rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gray); }

/* Filters */
.el-filters { display: flex; flex-direction: column; gap: 12px; border: 1px solid var(--border); padding: 16px; background: rgba(240,240,234,0.01); }
.el-search-wrap { position: relative; }
.el-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: var(--gray); pointer-events: none; }
.el-search { width: 100%; padding: 9px 32px 9px 30px; background: rgba(240,240,234,0.03); border: 1px solid var(--border); color: var(--white); font-family: var(--font-sans); font-size: 0.78rem; outline: none; box-sizing: border-box; }
.el-search:focus { border-color: var(--border-bright); }
.el-search::placeholder { color: var(--dim); }
.el-search-clear { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--gray); cursor: pointer; font-size: 0.65rem; }
.el-filter-pills { display: flex; gap: 16px; flex-wrap: wrap; }
.el-filter-group { display: flex; flex-direction: column; gap: 6px; }
.el-filter-lbl { font-family: var(--font-mono); font-size: 0.48rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gray); }
.el-pills { display: flex; gap: 4px; flex-wrap: wrap; }
.el-pill { font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.08em; padding: 5px 10px; border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.el-pill:hover { border-color: var(--border-bright); color: var(--white); }
.el-pill.active { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.07); }

/* Loading / empty */
.el-loading { display: flex; align-items: center; gap: 10px; justify-content: center; padding: 60px; color: var(--gray); font-family: var(--font-mono); font-size: 0.65rem; }
.el-spinner { width: 18px; height: 18px; border: 2px solid var(--border); border-top-color: var(--white); border-radius: 50%; animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.el-empty { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 60px; text-align: center; }
.el-empty-icon { font-size: 2.5rem; }
.el-empty-title { font-family: var(--font-mono); font-size: 0.85rem; color: var(--white); margin: 0; }
.el-empty-sub { font-family: var(--font-sans); font-size: 0.78rem; color: var(--gray); margin: 0; }

/* Exam grid */
.el-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); box-shadow: 6px 6px 0 0 rgba(240,240,234,0.04); }
.ec { background: var(--black); padding: 18px; display: flex; flex-direction: column; gap: 10px; border-left: 2px solid transparent; transition: border-color 0.12s, background 0.12s; }
.ec:hover { border-left-color: var(--border-bright); background: rgba(240,240,234,0.02); }

.ec-top { display: flex; justify-content: space-between; align-items: flex-start; }
.ec-badges { display: flex; gap: 5px; flex-wrap: wrap; }
.ec-stream-badge { font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.12em; text-transform: uppercase; border: 1px solid var(--border); padding: 2px 6px; color: var(--gray); }
.ec-hot-badge { font-family: var(--font-mono); font-size: 0.44rem; padding: 2px 6px; background: rgba(255,200,80,0.07); border: 1px solid rgba(255,200,80,0.2); color: rgba(255,200,80,0.85); }
.ec-feat-badge { font-family: var(--font-mono); font-size: 0.44px; padding: 2px 6px; background: rgba(200,160,255,0.07); border: 1px solid rgba(200,160,255,0.2); color: rgba(200,160,255,0.85); }
.ec-actions-top { display: flex; gap: 5px; }
.ec-icon-btn { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: none; border: 1px solid var(--border); color: var(--gray); cursor: pointer; font-size: 0.65rem; text-decoration: none; transition: all 0.12s; }
.ec-icon-btn:hover { border-color: var(--border-bright); color: var(--white); }
.ec-icon-btn.hot-active { border-color: rgba(255,200,80,0.4); background: rgba(255,200,80,0.06); }

.ec-title { font-family: var(--font-mono); font-size: 0.75rem; font-weight: 600; color: var(--white); margin: 0; line-height: 1.3; }
.ec-desc { font-family: var(--font-sans); font-size: 0.72rem; color: var(--dim); margin: 0; line-height: 1.4; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.ec-meta { display: flex; gap: 5px; flex-wrap: wrap; }
.ec-meta-pill { font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.08em; padding: 2px 7px; border: 1px solid var(--border); color: var(--gray); }
.diff-easy   { background: rgba(120,230,120,0.07); border-color: rgba(120,230,120,0.25) !important; color: rgba(120,230,120,0.8) !important; }
.diff-medium { background: rgba(255,200,80,0.07);  border-color: rgba(255,200,80,0.25)  !important; color: rgba(255,200,80,0.8)  !important; }
.diff-hard   { background: rgba(255,100,100,0.07); border-color: rgba(255,100,100,0.25) !important; color: rgba(255,100,100,0.8) !important; }
.src-ai      { color: rgba(140,180,255,0.8) !important; border-color: rgba(140,180,255,0.2) !important; background: rgba(140,180,255,0.06) !important; }
.src-teacher { color: rgba(200,160,255,0.8) !important; border-color: rgba(200,160,255,0.2) !important; background: rgba(200,160,255,0.06) !important; }

.ec-stats { display: flex; gap: 12px; font-family: var(--font-mono); font-size: 0.5rem; color: var(--gray); padding-top: 4px; border-top: 1px solid var(--border); }
.ec-stat-item { display: flex; align-items: center; gap: 4px; }

.ec-footer { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.ec-status { font-family: var(--font-mono); font-size: 0.46rem; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 8px; border: 1px solid var(--border); }
.st-published { border-color: rgba(120,230,120,0.3) !important; color: rgba(120,230,120,0.9) !important; background: rgba(120,230,120,0.06) !important; }
.st-review    { border-color: rgba(255,200,80,0.3)  !important; color: rgba(255,200,80,0.9)  !important; background: rgba(255,200,80,0.06)  !important; }
.st-draft     { color: var(--gray); }
.st-archived  { color: var(--dim); }

.ec-footer-actions { display: flex; gap: 4px; flex-wrap: wrap; }
.ec-action-btn { font-family: var(--font-mono); font-size: 0.5rem; letter-spacing: 0.08em; padding: 4px 10px; border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.ec-action-btn:hover { border-color: var(--border-bright); color: var(--white); }
.ec-action-btn--green:hover { border-color: rgba(120,230,120,0.4) !important; color: rgba(120,230,120,0.9) !important; }
.ec-action-btn--red { color: rgba(255,100,100,0.6) !important; border-color: rgba(255,100,100,0.2) !important; }
.ec-action-btn--red:hover { background: rgba(255,100,100,0.06) !important; color: rgba(255,100,100,0.9) !important; }

/* Pagination */
.el-pagination { display: flex; align-items: center; gap: 12px; justify-content: center; padding: 8px; }
.el-pg-btn { font-family: var(--font-mono); font-size: 0.65rem; padding: 7px 14px; border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer; transition: all 0.12s; }
.el-pg-btn:hover:not(:disabled) { border-color: var(--border-bright); color: var(--white); }
.el-pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.el-pg-info { font-family: var(--font-mono); font-size: 0.58rem; color: var(--gray); }

/* Toast */
.admin-toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 18px; font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.08em; border: 1px solid var(--border); background: var(--black); color: var(--white); z-index: 9999; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06); }
.admin-toast.error { border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.9); }

@media (max-width: 600px) {
  .el-page { padding: 16px 12px 60px; }
  .el-grid { grid-template-columns: 1fr; }
  .el-stats { flex-wrap: wrap; }
  .el-stat { min-width: 50%; }
  .el-filter-pills { flex-direction: column; }
}
</style>
