<template>
  <div class="mock-exam results-page">

    <!-- ══ PHASE: LIST ═══════════════════════════════════════════ -->
    <template v-if="phase === 'list'">

      <div class="setup-header">
        <div class="header-left">
          <div class="page-chip"><span class="chip-dot" /> Exam History</div>
          <h1 class="page-title">Your<br><span class="text-outline">Results.</span></h1>
          <p class="page-sub">Every mock exam and practice session you've completed, in one place.</p>
        </div>
        <div class="header-right">
          <div v-if="summary.total" class="past-exams-teaser">
            <span class="teaser-label">Average Score</span>
            <span class="teaser-score" :class="scoreClass(summary.avgScore)">{{ summary.avgScore }}%</span>
            <span class="teaser-meta">{{ summary.total }} exam{{ summary.total !== 1 ? 's' : '' }} taken</span>
          </div>
          <div v-else class="past-exams-teaser">
            <span class="teaser-label">No attempts yet</span>
          </div>
        </div>
      </div>

      <!-- Summary stat row -->
      <div class="result-stats-row" v-if="summary.total">
        <div class="rstat">
          <span class="rstat-icon" v-html="icons.list" />
          <span class="rstat-value">{{ summary.total }}</span>
          <span class="rstat-label">Total Exams</span>
          <div class="rstat-bar"><div class="rstat-bar-fill" style="width:100%" /></div>
        </div>
        <div class="rstat">
          <span class="rstat-icon" v-html="icons.target" />
          <span class="rstat-value">{{ summary.avgScore }}%</span>
          <span class="rstat-label">Avg Score</span>
          <div class="rstat-bar"><div class="rstat-bar-fill" :style="{ width: summary.avgScore + '%' }" /></div>
        </div>
        <div class="rstat">
          <span class="rstat-icon" v-html="icons.trophy" />
          <span class="rstat-value">{{ summary.bestScore }}%</span>
          <span class="rstat-label">Best Score</span>
          <div class="rstat-bar"><div class="rstat-bar-fill" :style="{ width: summary.bestScore + '%' }" /></div>
        </div>
        <div class="rstat">
          <span class="rstat-icon" v-html="icons.check" />
          <span class="rstat-value">{{ summary.passRate }}%</span>
          <span class="rstat-label">Pass Rate</span>
          <div class="rstat-bar"><div class="rstat-bar-fill" :style="{ width: summary.passRate + '%' }" /></div>
        </div>
      </div>

      <!-- Filter bar -->
      <div class="list-filter-bar">
        <div class="lf-row">
          <div class="filter-pills">
            <button
              v-for="s in streamFilterOptions" :key="s"
              class="filter-pill" :class="{ active: listFilters.stream === s }"
              @click="listFilters.stream = s"
            >{{ s }}</button>
          </div>
          <div class="lf-search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="listFilters.search" type="text" placeholder="Search by title or subject…" />
            <button v-if="listFilters.search" class="lf-clear" @click="listFilters.search = ''">×</button>
          </div>
        </div>
        <div class="lf-row">
          <div class="filter-pills">
            <button
              v-for="t in examTypeOptions" :key="t.val"
              class="filter-pill" :class="{ active: listFilters.examType === t.val }"
              @click="listFilters.examType = t.val"
            >{{ t.label }}</button>
          </div>
          <div class="filter-pills sort-pills">
            <button
              v-for="opt in sortOptions" :key="opt.val"
              class="filter-pill small-pill" :class="{ active: listFilters.sort === opt.val }"
              @click="listFilters.sort = opt.val"
            >{{ opt.label }}</button>
          </div>
        </div>
        <div class="lf-status" v-if="hasActiveFilters">
          <span class="lf-count">{{ filteredExams.length }} result{{ filteredExams.length !== 1 ? 's' : '' }}</span>
          <button class="lf-reset" @click="resetFilters">Clear filters ×</button>
        </div>
      </div>

      <!-- Exam list -->
      <div v-if="isLoadingList" class="list-empty-state">Loading your results…</div>
      <div v-else-if="!exams.length" class="list-empty-state">
        <span class="les-icon" v-html="icons.list" />
        <p>No exams taken yet.</p>
        <NuxtLink to="/dashboard/mock-exam" class="iso-btn iso-btn--fill">Start a Mock Exam →</NuxtLink>
      </div>
      <div v-else-if="!filteredExams.length" class="list-empty-state">
        <p>No results match your filters.</p>
        <button class="iso-btn iso-btn--ghost" @click="resetFilters">Clear filters</button>
      </div>
      <div v-else class="exam-card-grid">
        <button
          v-for="e in filteredExams" :key="e.id"
          class="exam-card"
          @click="openExam(e)"
        >
          <div class="ec-top">
            <span class="ec-type-tag">{{ examTypeLabel(e.exam_type) }}</span>
            <span class="ec-date">{{ timeAgo(e.created_at) }}</span>
          </div>
          <div class="ec-mid">
            <span class="ec-score" :class="scoreClass(e.score)">{{ e.score }}%</span>
            <div class="ec-info">
              <span class="ec-title">{{ e.title || `${e.stream} Exam` }}</span>
              <span class="ec-sub">{{ subjectLabel(e) }} · {{ e.stream }}</span>
            </div>
          </div>
          <div class="ec-bottom">
            <span class="ec-stat correct">{{ e.correct_count }}✓</span>
            <span class="ec-stat wrong">{{ e.wrong_count }}✗</span>
            <span class="ec-stat skipped">{{ e.skipped_count }}–</span>
            <span class="ec-qcount">{{ e.questions_count }}Q</span>
            <span class="ec-status" :class="e.status">{{ e.status }}</span>
          </div>
          <span class="ec-arrow">→</span>
        </button>
      </div>
    </template>

    <!-- ══ PHASE: DETAIL ═════════════════════════════════════════ -->
    <template v-else-if="phase === 'detail'">

      <button class="back-link" @click="phase = 'list'; selectedExam = null">← Back to All Results</button>

      <div v-if="isLoadingDetail" class="list-empty-state">Loading exam details…</div>

      <template v-else-if="selectedExam">
        <!-- Score hero -->
        <div class="results-hero">
          <div class="rh-left">
            <div class="page-chip"><span class="chip-dot" /> {{ examTypeLabel(selectedExam.exam_type) }} · {{ timeAgo(selectedExam.created_at) }}</div>
            <div class="score-display">
              <span class="score-big" :class="scoreClass(selectedExam.score)">{{ selectedExam.score }}%</span>
              <div class="score-meta-col">
                <span class="score-label">{{ selectedExam.title || `${selectedExam.stream} Exam` }}</span>
                <span class="score-grade" :class="scoreClass(selectedExam.score)">{{ gradeLabel(selectedExam.score) }}</span>
                <span class="score-marks">{{ selectedExam.marks_earned }} / {{ selectedExam.questions_count }} marks</span>
              </div>
            </div>
            <p class="score-sub">{{ selectedExam.correct_count }} correct · {{ selectedExam.wrong_count }} wrong · {{ selectedExam.skipped_count }} skipped out of {{ selectedExam.questions_count }}</p>
          </div>
          <div class="rh-right">
            <div class="result-actions">
              <NuxtLink to="/dashboard/mock-exam" class="iso-btn iso-btn--fill">Retake Similar →</NuxtLink>
              <NuxtLink to="/dashboard/question-bank" class="iso-btn iso-btn--ghost">Review Questions</NuxtLink>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="result-stats-row">
          <div v-for="s in detailStats" :key="s.label" class="rstat">
            <span class="rstat-icon" v-html="s.icon" />
            <span class="rstat-value">{{ s.value }}</span>
            <span class="rstat-label">{{ s.label }}</span>
            <div class="rstat-bar"><div class="rstat-bar-fill" :style="{ width: s.percent + '%' }" /></div>
          </div>
        </div>

        <!-- Review list + breakdown -->
        <div class="results-body">

          <!-- Question review -->
          <div class="review-list">
            <div class="panel-header">
              <span class="panel-tag">Question Review</span>
              <div class="review-filters">
                <button
                  v-for="f in ['All','Correct','Wrong','Skipped']" :key="f"
                  class="filter-pill small-pill" :class="{ active: reviewFilter === f }"
                  @click="reviewFilter = f"
                >{{ f }}</button>
              </div>
            </div>

            <!-- Subject filter system -->
            <div class="subject-filter-row" v-if="availableSubjects.length > 1">
              <span class="sfr-label">Subject</span>
              <div class="filter-pills">
                <button
                  v-for="sub in availableSubjects" :key="sub"
                  class="filter-pill small-pill" :class="{ active: subjectFilter === sub }"
                  @click="subjectFilter = sub"
                >{{ sub }}<span v-if="sub !== 'All'" class="pill-count">{{ subjectCounts[sub] || 0 }}</span></button>
              </div>
            </div>

            <div v-if="!questionsLoaded" class="review-note">
              Full question text isn't available for this exam (question bank record missing), but your stats above are accurate.
            </div>

            <div v-else-if="!filteredReviewGroups.length" class="review-note">
              No questions match this filter combination.
            </div>

            <template v-for="group in filteredReviewGroups" :key="group.questions[0].id">
              <div v-if="group.stimulus || group.stimulus_image" class="eq-stimulus-block">
                <p v-if="group.stimulus" class="eq-stimulus-label" v-html="renderLatexText(group.stimulus[selectedLang])" />
                <img v-if="group.stimulus_image" :src="group.stimulus_image" class="eq-img" alt="Stimulus" />
              </div>

              <div
                v-for="q in group.questions" :key="q.id"
                class="review-card"
                :class="[reviewClass(q.id), { 'card-stimulus-child': !!group.stimulus || !!group.stimulus_image }]"
              >
                <div class="rc-header">
                  <div class="rc-meta">
                    <span class="rc-status-icon">
                      {{ reviewClass(q.id) === 'correct' ? '✓' : reviewClass(q.id) === 'wrong' ? '✗' : '–' }}
                    </span>
                    <span class="rc-num">Q{{ reviewQuestions.indexOf(q) + 1 }}</span>
                    <span class="rc-diff" :class="q.difficulty_level">{{ q.difficulty?.[selectedLang] ?? q.difficulty_level }}</span>
                    <span class="rc-subject">{{ getSubjectStr(q) }}</span>
                    <span class="eq-chapter">{{ getChapterStr(q) }}</span>
                  </div>
                </div>

                <p class="rc-question" v-html="renderLatexText(q.question[selectedLang])" />
                <img v-if="q.question_image" :src="q.question_image" class="eq-img" alt="Question diagram" />

                <div class="rc-options">
                  <div
                    v-for="(opt, oi) in q.options[selectedLang]" :key="oi"
                    class="rc-option"
                    :class="{
                      'rc-correct': oi === attemptMap[q.id]?.correct_index,
                      'rc-wrong': oi === attemptMap[q.id]?.selected_index && oi !== attemptMap[q.id]?.correct_index,
                      'rc-user': oi === attemptMap[q.id]?.selected_index,
                    }"
                  >
                    <span class="rc-opt-letter">{{ optLetters[oi] }}</span>
                    <span class="rc-opt-text" v-html="renderLatexText(opt)" />
                    <span class="rc-opt-tag">
                      <template v-if="oi === attemptMap[q.id]?.correct_index">✓ Correct</template>
                      <template v-else-if="oi === attemptMap[q.id]?.selected_index">✗ Your answer</template>
                    </span>
                  </div>
                  <div v-if="attemptMap[q.id]?.selected_index == null" class="rc-skipped-note">— Skipped</div>
                </div>

                <div class="rc-explanation" v-if="q.explanation">
                  <span class="exp-label">EXPLANATION</span>
                  <p class="exp-text" v-html="renderLatexText(q.explanation[selectedLang])" />
                </div>
              </div>
            </template>
          </div>

          <!-- Right: breakdown sidebar -->
          <aside class="results-sidebar">

            <div class="side-panel" v-if="subjectBreakdown.length > 1">
              <div class="panel-header"><span class="panel-tag">By Subject</span></div>
              <div class="breakdown-list">
                <div v-for="d in subjectBreakdown" :key="d.label" class="breakdown-row">
                  <div class="bdr-left">
                    <span class="bdr-label">{{ d.label }}</span>
                    <span class="bdr-count">{{ d.correct }}/{{ d.total }}</span>
                  </div>
                  <div class="bdr-bar-wrap">
                    <div class="bdr-bar-fill" :style="{ width: (d.total ? d.correct/d.total*100 : 0) + '%' }" />
                  </div>
                </div>
              </div>
            </div>

            <div class="side-panel">
              <div class="panel-header"><span class="panel-tag">By Difficulty</span></div>
              <div class="breakdown-list">
                <div v-for="d in diffBreakdown" :key="d.label" class="breakdown-row">
                  <div class="bdr-left">
                    <span class="bdr-label" :class="d.cls">{{ d.label }}</span>
                    <span class="bdr-count">{{ d.correct }}/{{ d.total }}</span>
                  </div>
                  <div class="bdr-bar-wrap">
                    <div class="bdr-bar-fill" :class="d.cls" :style="{ width: (d.total ? d.correct/d.total*100 : 0) + '%' }" />
                  </div>
                </div>
              </div>
            </div>

            <div class="side-panel">
              <div class="panel-header"><span class="panel-tag">Time</span></div>
              <div class="time-stats">
                <div class="ts-row">
                  <span class="ts-label">Configured Duration</span>
                  <span class="ts-val">{{ selectedSession?.duration_mins ?? '—' }} min</span>
                </div>
                <div class="ts-row">
                  <span class="ts-label">Time Taken</span>
                  <span class="ts-val">{{ selectedSession?.duration_taken_mins ?? '—' }} min</span>
                </div>
                <div class="ts-row">
                  <span class="ts-label">Avg per Question</span>
                  <span class="ts-val">{{ avgTimePerQ }}s</span>
                </div>
              </div>
            </div>

            <div class="side-panel">
              <div class="panel-header"><span class="panel-tag">Next Steps</span></div>
              <div class="next-steps">
                <NuxtLink to="/dashboard/mock-exam" class="qa-item">
                  <span class="qa-icon" v-html="icons.retry" />
                  <div class="qa-text">
                    <span class="qa-title">Retake Exam</span>
                    <span class="qa-sub">New shuffle, same config</span>
                  </div>
                  <span class="qa-arrow">→</span>
                </NuxtLink>
                <NuxtLink to="/dashboard/question-bank" class="qa-item">
                  <span class="qa-icon" v-html="icons.drill" />
                  <div class="qa-text">
                    <span class="qa-title">Drill Weak Topics</span>
                    <span class="qa-sub">Practice wrong answers</span>
                  </div>
                  <span class="qa-arrow">→</span>
                </NuxtLink>
                <NuxtLink to="/dashboard/progress" class="qa-item">
                  <span class="qa-icon" v-html="icons.progress" />
                  <div class="qa-text">
                    <span class="qa-title">View Progress</span>
                    <span class="qa-sub">Full analytics</span>
                  </div>
                  <span class="qa-arrow">→</span>
                </NuxtLink>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </template>

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

/* ── Page ────────────────────────────────────────────────── */
.mock-exam { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── Setup header ────────────────────────────────────────── */
.setup-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 2rem; padding: 2rem;
  border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.setup-header::before {
  content: '';
  position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.page-chip {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.16em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border-bright);
  padding: 5px 12px; margin-bottom: 0.9rem; position: relative;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--white); animation: blink 2s infinite;
}

.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-weight: 700; letter-spacing: -1px;
  color: var(--white); line-height: 1.1; margin-bottom: 0.5rem;
  position: relative;
}
.page-sub {
  font-size: 0.83rem; color: var(--gray);
  font-weight: 300; max-width: 360px; position: relative;
}

.past-exams-teaser {
  display: flex; flex-direction: column; gap: 4px;
  padding: 1.2rem 1.6rem;
  border: 1px solid var(--border);
  background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  flex-shrink: 0; min-width: 160px;
  position: relative;
}
.teaser-label {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray);
}
.teaser-score {
  font-family: var(--font-mono); font-size: 2.2rem; font-weight: 700;
  letter-spacing: -1px; line-height: 1;
}
.teaser-score.high { color: rgba(120,230,120,0.9); }
.teaser-score.mid  { color: rgba(255,200,80,0.9); }
.teaser-score.low  { color: rgba(255,100,100,0.8); }
.teaser-meta { font-size: 0.7rem; color: var(--gray); }

/* ── Setup body ──────────────────────────────────────────── */
.setup-body {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  align-items: start;
}

/* ── Config panel ────────────────────────────────────────── */
.config-panel {
  border: 1px solid var(--border);
  background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  display: flex; flex-direction: column;
}

.config-section {
  padding: 1.4rem 1.6rem;
  border-bottom: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 1rem;
}
.config-section:last-child { border-bottom: none; }

.config-section-header {
  display: flex; align-items: center; gap: 10px;
}
.csec-tag {
  font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
  letter-spacing: 0.1em; color: var(--gray);
  border: 1px solid var(--border); padding: 2px 7px;
  box-shadow: 1px 1px 0 0 rgba(240,240,234,0.04);
}
.csec-label {
  font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
  color: var(--white); letter-spacing: 0.04em;
}
.csec-hint {
  font-size: 0.65rem; color: var(--gray); margin-left: auto;
  font-family: var(--font-sans);
}

/* Chapter section */
.chapter-section {
  background: rgba(240,240,234,0.015);
  border-left: 2px solid rgba(240,240,234,0.12) !important;
}
.chapter-pills {
  flex-wrap: wrap;
}

/* Stream grid */
.stream-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px; background: var(--border);
  border: 1px solid var(--border);
}

.stream-card {
  background: #0d0d0d;
  display: flex; flex-direction: column; align-items: flex-start;
  gap: 4px; padding: 1rem 1.1rem;
  cursor: pointer; text-align: left;
  transition: background 0.15s;
  border: none; position: relative;
  border-left: 2px solid transparent;
}
.stream-card:hover { background: #111; }
.stream-card.active {
  background: rgba(240,240,234,0.05);
  border-left-color: var(--white);
}
.stream-icon { color: var(--gray); margin-bottom: 2px; }
.stream-card.active .stream-icon { color: var(--white); }
.stream-name {
  font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700;
  color: var(--white);
}
.stream-desc { font-size: 0.66rem; color: var(--gray); }
.stream-check {
  position: absolute; top: 8px; right: 10px;
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--white);
}

/* Filter pills */
.filter-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.filter-pill {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 5px 12px;
  background: transparent; color: var(--gray);
  border: 1px solid var(--border); cursor: pointer;
  transition: all 0.15s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.filter-pill:hover { color: var(--white); border-color: var(--border-bright); }
.filter-pill.active {
  background: var(--white); color: var(--black);
  border-color: var(--white);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.2), 3px 3px 0 0 rgba(200,200,190,0.15);
}

/* Dual config */
.dual-config { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; }
.dual-col { display: flex; flex-direction: column; gap: 8px; }
.num-pills { display: flex; flex-wrap: wrap; gap: 6px; }

/* Difficulty cards */
.diff-options {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px; background: var(--border);
  border: 1px solid var(--border);
}
.diff-card {
  background: #0d0d0d; padding: 1rem 0.8rem;
  display: flex; flex-direction: column; gap: 6px;
  cursor: pointer; border: none; text-align: left;
  border-bottom: 2px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  align-items: flex-start;
}
.diff-card:hover { background: #111; }
.diff-card.active {
  background: rgba(240,240,234,0.04);
  border-bottom-color: var(--white);
}
.diff-card-name {
  font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
  color: var(--white);
}
.diff-card-desc { font-size: 0.62rem; color: var(--gray); line-height: 1.4; min-height: 30px; }

.diff-bars {
  display: flex; align-items: flex-end; gap: 4px;
  margin-top: 4px; height: 32px;
}
.diff-bar { width: 10px; border-radius: 0; }
.diff-bar.easy { background: rgba(120,230,120,0.5); }
.diff-bar.med  { background: rgba(255,200,80,0.5); }
.diff-bar.hard { background: rgba(255,100,100,0.5); }

/* Toggles */
.config-options-row { flex-direction: column; gap: 0.8rem; }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  cursor: pointer;
}
.toggle-label { font-size: 0.83rem; color: var(--white); }

.toggle-btn {
  width: 40px; height: 22px;
  background: #1a1a1a; border: 1px solid var(--border-bright);
  cursor: pointer; position: relative;
  transition: background 0.2s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.06);
}
.toggle-btn.on { background: rgba(240,240,234,0.15); border-color: var(--border-bright); }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 14px; height: 14px;
  background: var(--gray);
  transition: left 0.2s, background 0.2s;
  display: block;
}
.toggle-btn.on .toggle-knob {
  left: 21px;
  background: var(--white);
}
/* Disabled toggle row for N/A streams */
.toggle-row--disabled {
  cursor: default; opacity: 0.45;
}
.toggle-na {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border); padding: 2px 8px;
}

/* Negative marking active badge (exam sidebar) */
.nm-active-badge {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.08em; color: rgba(255,200,80,0.85);
  border: 1px solid rgba(255,200,80,0.2);
  background: rgba(255,200,80,0.04);
  padding: 6px 10px; margin-bottom: 4px;
}

/* Negative marking deduction notice (results hero) */
.neg-mark-notice {
  display: inline-flex; align-items: center; gap: 8px;
  margin-top: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(255,100,100,0.25);
  background: rgba(255,100,100,0.05);
}
.nm-icon {
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700;
  color: rgba(255,100,100,0.8);
}
.nm-text {
  font-size: 0.72rem; color: rgba(255,100,100,0.75);
}

/* Marks sub-label in score display */
.score-marks {
  font-family: var(--font-mono); font-size: 0.65rem;
  color: var(--gray); letter-spacing: 0.04em; margin-top: 2px;
}

/* CTA */
.setup-cta {
  padding: 1.4rem 1.6rem;
  display: flex; align-items: center; gap: 1.4rem;
  border-top: 1px solid var(--border);
}
.start-btn { font-size: 0.82rem !important; padding: 14px 32px !important; }
.cta-meta {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray);
}
.dot-sep { color: var(--border-bright); }

/* Setup sidebar */
.setup-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

.info-panel {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.panel-header {
  padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}

.tips-list { display: flex; flex-direction: column; }
.tip-row {
  display: flex; gap: 10px; padding: 0.65rem 1.2rem;
  border-bottom: 1px solid var(--border);
  align-items: flex-start;
}
.tip-row:last-child { border-bottom: none; }
.tip-bullet {
  font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray);
  flex-shrink: 0; margin-top: 2px;
}
.tip-text { font-size: 0.77rem; color: var(--dim); line-height: 1.5; }

.results-list { display: flex; flex-direction: column; }
.result-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.7rem 1.2rem; border-bottom: 1px solid var(--border);
}
.result-row:last-child { border-bottom: none; }
.result-left { display: flex; flex-direction: column; gap: 2px; }
.result-subject { font-size: 0.78rem; color: var(--white); }
.result-meta { font-size: 0.65rem; color: var(--gray); }
.result-score {
  font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700;
}
.result-score.high { color: rgba(120,230,120,0.9); }
.result-score.mid  { color: rgba(255,200,80,0.9); }
.result-score.low  { color: rgba(255,100,100,0.8); }

.result-empty {
  padding: 0.7rem 1.2rem;
  font-size: 0.7rem;
  color: var(--gray);
}

.rules-list { display: flex; flex-direction: column; }
.rule-row {
  display: flex; gap: 12px; padding: 0.8rem 1.2rem;
  border-bottom: 1px solid var(--border); align-items: flex-start;
}
.rule-row:last-child { border-bottom: none; }
.rule-icon { color: var(--gray); flex-shrink: 0; margin-top: 2px; }
.rule-text { display: flex; flex-direction: column; gap: 2px; }
.rule-label { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); }
.rule-desc { font-size: 0.7rem; color: var(--gray); line-height: 1.4; }

/* ═══════════════════════════════════════════════════════════
   EXAM PHASE
═══════════════════════════════════════════════════════════ */

.exam-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 1.6rem; height: 58px;
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  gap: 1.5rem;
  position: sticky; top: 60px; z-index: 50;
}

.etb-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.etb-chip {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border); padding: 4px 10px;
}
.etb-progress {
  font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white);
}

.etb-center { flex: 1; }
.etb-progbar { height: 2px; background: var(--border); }
.etb-progbar-fill { height: 100%; background: var(--white); transition: width 0.3s ease; }

.etb-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }

.timer-display {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.9rem; font-weight: 700;
  color: var(--white); padding: 6px 14px;
  border: 1px solid var(--border-bright);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.06);
}
.timer-display.warning { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.3); }
.timer-display.critical {
  color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.4);
  animation: blink 0.8s infinite;
}

.end-btn { font-size: 0.65rem !important; padding: 7px 14px !important; }

/* Q palette */
.q-palette-wrap {
  border: 1px solid var(--border); background: #0a0a0a;
  padding: 1rem 1.4rem;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  position: sticky; top: 120px; z-index: 40;
}
.q-palette {
  display: flex; flex-wrap: wrap; gap: 5px; flex: 1;
}
.palette-dot {
  width: 30px; height: 30px;
  font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
  border: 1px solid var(--border); background: #0d0d0d;
  cursor: pointer; color: var(--gray);
  transition: all 0.15s;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.palette-dot:hover { border-color: var(--border-bright); color: var(--white); }
.palette-dot.current { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.08); }
.palette-dot.answered { background: rgba(240,240,234,0.12); color: var(--white); border-color: var(--border-bright); }
.palette-dot.flagged { border-color: rgba(255,200,80,0.5); color: rgba(255,200,80,0.8); }
.palette-dot.current.answered { background: var(--white); color: var(--black); }

.palette-legend {
  display: flex; align-items: center; gap: 12px; flex-shrink: 0;
}
.leg-item {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--gray);
}
.leg-dot {
  width: 10px; height: 10px; border: 1px solid var(--border); background: #0d0d0d;
}
.leg-dot.answered { background: rgba(240,240,234,0.12); border-color: var(--border-bright); }
.leg-dot.flagged { border-color: rgba(255,200,80,0.5); }

/* Exam body */
.exam-body {
  display: grid; grid-template-columns: 1fr 280px;
  gap: 1.5rem; align-items: start;
}

/* Exam scrollable list */
.exam-question-list { display: flex; flex-direction: column; gap: 1.5rem; }

.exam-question-card {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  border-left: 3px solid transparent;
  transition: border-color 0.2s;
  scroll-margin-top: 80px;
}
.exam-question-card.card-answered { border-left-color: rgba(240,240,234,0.25); }
.exam-question-card.card-flagged  { border-left-color: rgba(255,200,80,0.5); }

.eq-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 1.6rem; border-bottom: 1px solid var(--border);
  gap: 1rem;
}
.eq-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.eq-num {
  font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white);
}
.eq-diff {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 2px 7px; border: 1px solid;
}
.eq-diff.easy   { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.25); }
.eq-diff.medium { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25); }
.eq-diff.hard   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }
.eq-subject, .eq-chapter {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  color: var(--gray); border: 1px solid var(--border); padding: 2px 7px;
}

.flag-btn {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--gray);
  background: transparent; border: 1px solid var(--border); padding: 5px 12px;
  cursor: pointer; transition: all 0.15s; flex-shrink: 0;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.flag-btn:hover { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); }
.flag-btn.active { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); background: rgba(255,200,80,0.06); }

.eq-body { padding: 1.8rem 1.6rem 1.2rem; }
.eq-text { font-size: 1rem; color: var(--white); line-height: 1.7; }

.eq-options { padding: 0 1.6rem 1.2rem; display: flex; flex-direction: column; gap: 8px; }

.eq-option {
  display: flex; align-items: center; gap: 14px;
  padding: 12px 16px;
  background: transparent; border: 1px solid var(--border);
  cursor: pointer; text-align: left; width: 100%;
  transition: background 0.12s, border-color 0.12s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.eq-option:hover { background: rgba(240,240,234,0.04); border-color: var(--border-bright); }
.eq-option.selected {
  border-color: var(--white);
  background: rgba(240,240,234,0.07);
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.12);
}
.opt-letter {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  width: 24px; height: 24px; flex-shrink: 0;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray); transition: all 0.12s;
}
.eq-option.selected .opt-letter { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.1); }
.opt-text { font-size: 0.88rem; color: var(--white); }
.opt-selected-mark { font-family: var(--font-mono); font-size: 0.65rem; color: var(--white); margin-left: auto; flex-shrink: 0; }

.eq-footer {
  display: flex; align-items: center; gap: 10px;
  padding: 0.9rem 1.6rem;
  border-top: 1px solid var(--border);
}
.clear-btn { font-size: 0.65rem !important; padding: 7px 14px !important; }
.answered-badge {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(120,230,120,0.8);
  border: 1px solid rgba(120,230,120,0.2); padding: 3px 10px;
  margin-left: auto;
}

.exam-submit-bar {
  display: flex; align-items: center; gap: 1.2rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.submit-end-btn { font-size: 0.82rem !important; padding: 14px 32px !important; }
.submit-bar-meta {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray);
}

/* Exam sidebar */
.exam-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
.side-panel {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.exam-progress-stats {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 1px; background: var(--border);
}
.ep-stat {
  background: #0a0a0a; padding: 0.9rem 0.8rem;
  display: flex; flex-direction: column; gap: 3px; align-items: center;
}
.ep-val {
  font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700;
  color: var(--white); letter-spacing: -0.5px;
}
.ep-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }
.ep-bar-wrap { height: 2px; background: var(--border); }
.ep-bar-fill { height: 100%; background: rgba(240,240,234,0.4); transition: width 0.3s ease; }

.flagged-list { display: flex; flex-direction: column; }
.flagged-item {
  display: flex; align-items: center; gap: 8px;
  padding: 0.7rem 1.2rem; border-bottom: 1px solid var(--border);
  background: transparent; cursor: pointer; width: 100%; text-align: left;
  transition: background 0.15s;
}
.flagged-item:last-child { border-bottom: none; }
.flagged-item:hover { background: rgba(240,240,234,0.03); }
.fi-num {
  font-family: var(--font-mono); font-size: 0.6rem;
  color: rgba(255,200,80,0.8); flex-shrink: 0;
}
.fi-text {
  font-size: 0.72rem; color: var(--white);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

.submit-panel .panel-header { border-bottom: 1px solid var(--border); }
.submit-info { padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem; }
.submit-desc { font-size: 0.78rem; color: var(--gray); line-height: 1.5; }

/* ═══════════════════════════════════════════════════════════
   MODAL
═══════════════════════════════════════════════════════════ */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(8,8,8,0.85);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem;
}

.modal-box {
  background: #0f0f0f;
  border: 1px solid var(--border-bright);
  box-shadow:
    8px 8px 0 0 rgba(240,240,234,0.06),
    6px 6px 0 0 rgba(240,240,234,0.04);
  width: 100%; max-width: 460px;
}

.modal-header {
  padding: 1.2rem 1.6rem; border-bottom: 1px solid var(--border);
}
.modal-tag {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}

.modal-body { padding: 1.6rem; display: flex; flex-direction: column; gap: 10px; }
.modal-text { font-size: 0.88rem; color: var(--white); line-height: 1.6; }
.modal-text strong { font-family: var(--font-mono); }
.modal-warn {
  font-family: var(--font-mono); font-size: 0.72rem;
  color: rgba(255,200,80,0.85); border: 1px solid rgba(255,200,80,0.2);
  padding: 8px 12px; background: rgba(255,200,80,0.05);
}

.modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 1.2rem 1.6rem; border-top: 1px solid var(--border);
}

/* ═══════════════════════════════════════════════════════════
   RESULTS PHASE
═══════════════════════════════════════════════════════════ */

.results-hero {
  display: flex; align-items: center; justify-content: space-between;
  gap: 2rem; padding: 2rem;
  border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.results-hero::before {
  content: 'RESULT';
  position: absolute; right: -10px; top: 50%; transform: translateY(-50%);
  font-family: var(--font-mono); font-weight: 700;
  font-size: 5.5rem; color: rgba(240,240,234,0.02);
  pointer-events: none; letter-spacing: -2px;
}

.score-display { display: flex; align-items: baseline; gap: 16px; margin-bottom: 0.6rem; }
.score-big {
  font-family: var(--font-mono); font-size: clamp(3rem, 5vw, 4.5rem);
  font-weight: 700; letter-spacing: -2px; line-height: 1;
}
.score-big.high { color: rgba(120,230,120,0.95); }
.score-big.mid  { color: rgba(255,200,80,0.95); }
.score-big.low  { color: rgba(255,100,100,0.9); }

.score-meta-col { display: flex; flex-direction: column; gap: 4px; }
.score-label {
  font-family: var(--font-mono); font-size: 0.58rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}
.score-grade {
  font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700;
}
.score-grade.high { color: rgba(120,230,120,0.9); }
.score-grade.mid  { color: rgba(255,200,80,0.9); }
.score-grade.low  { color: rgba(255,100,100,0.8); }

.score-sub { font-size: 0.8rem; color: var(--gray); }
.result-actions { display: flex; gap: 10px; flex-wrap: wrap; }

/* Result stats row */
.result-stats-row {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px; background: var(--border);
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.rstat {
  background: #0d0d0d; padding: 1.4rem 1.6rem;
  display: flex; flex-direction: column; gap: 5px;
  animation: fadeSlideUp 0.4s ease both;
  transition: background 0.15s;
}
.rstat:hover { background: #111; }
@keyframes fadeSlideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
.rstat-icon { color: var(--gray); }
.rstat-icon :deep(svg) { width: 16px; height: 16px; }
.rstat-value {
  font-family: var(--font-mono); font-size: 1.8rem; font-weight: 700;
  color: var(--white); letter-spacing: -1px; line-height: 1;
}
.rstat-label {
  font-size: 0.68rem; color: var(--gray);
  text-transform: uppercase; letter-spacing: 0.1em;
}
.rstat-bar { height: 1px; background: var(--border); margin-top: 8px; }
.rstat-bar-fill { height: 100%; background: rgba(240,240,234,0.35); transition: width 0.8s ease; }

/* Results body */
.results-body {
  display: grid; grid-template-columns: 1fr 280px;
  gap: 1.5rem; align-items: start;
}

.review-list {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  display: flex; flex-direction: column;
}
.review-filters { display: flex; gap: 5px; }
.small-pill { font-size: 0.58rem !important; padding: 3px 9px !important; }

.review-card {
  border-bottom: 1px solid var(--border);
  border-left: 3px solid transparent;
  padding: 1.2rem 1.4rem;
  display: flex; flex-direction: column; gap: 10px;
  margin: 10px;
}
.review-card:last-child { border-bottom: none; }
.review-card.correct { border-left-color: rgba(120,230,120,0.5); }
.review-card.wrong   { border-left-color: rgba(255,100,100,0.5); }
.review-card.skipped { border-left-color: rgba(240,240,234,0.1); }

.rc-header { }
.rc-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rc-status-icon {
  font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700; width: 18px;
}
.review-card.correct .rc-status-icon { color: rgba(120,230,120,0.9); }
.review-card.wrong   .rc-status-icon { color: rgba(255,100,100,0.9); }
.review-card.skipped .rc-status-icon { color: var(--gray); }

.rc-num {
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--white);
}
.rc-diff {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.1em;
  text-transform: uppercase; padding: 1px 6px; border: 1px solid;
}
.rc-diff.easy   { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.25); }
.rc-diff.medium { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.25); }
.rc-diff.hard   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }
.rc-subject {
  font-family: var(--font-mono); font-size: 0.58rem; color: var(--gray);
  border: 1px solid var(--border); padding: 1px 6px;
}

.rc-question { font-size: 0.87rem; color: var(--white); line-height: 1.6; }

.rc-options { display: flex; flex-direction: column; gap: 6px; }

.rc-option {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border: 1px solid var(--border);
  font-size: 0.83rem; color: var(--dim);
  transition: background 0.1s;
}
.rc-option.rc-correct {
  border-color: rgba(120,230,120,0.4);
  background: rgba(120,230,120,0.06);
  color: var(--white);
}
.rc-option.rc-wrong {
  border-color: rgba(255,100,100,0.4);
  background: rgba(255,100,100,0.06);
  color: var(--white);
}

.rc-opt-letter {
  font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700;
  width: 22px; height: 22px; flex-shrink: 0;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray);
}
.rc-option.rc-correct .rc-opt-letter { border-color: rgba(120,230,120,0.5); color: rgba(120,230,120,0.9); }
.rc-option.rc-wrong   .rc-opt-letter { border-color: rgba(255,100,100,0.5); color: rgba(255,100,100,0.9); }

.rc-opt-text { flex: 1; }

.rc-opt-tag {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.08em;
  flex-shrink: 0; padding: 2px 8px; border: 1px solid transparent;
}
.rc-option.rc-correct .rc-opt-tag { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.25); }
.rc-option.rc-wrong   .rc-opt-tag { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.25); }

.rc-skipped-note {
  font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray);
  padding: 8px 14px; border: 1px solid var(--border);
}

.rc-explanation { display: flex; flex-direction: column; gap: 5px; }
.exp-label {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.18em; color: var(--gray);
}
.exp-text { font-size: 0.8rem; color: var(--dim); line-height: 1.65; }

/* Results sidebar */
.results-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }

.breakdown-list { display: flex; flex-direction: column; gap: 12px; padding: 1.2rem; }
.breakdown-row { display: flex; flex-direction: column; gap: 6px; }
.bdr-left { display: flex; justify-content: space-between; align-items: center; }
.bdr-label {
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em;
}
.bdr-label.easy   { color: rgba(120,230,120,0.8); }
.bdr-label.medium { color: rgba(255,200,80,0.8); }
.bdr-label.hard   { color: rgba(255,100,100,0.8); }
.bdr-count { font-family: var(--font-mono); font-size: 0.72rem; color: var(--white); }
.bdr-bar-wrap { height: 2px; background: var(--border); }
.bdr-bar-fill { height: 100%; transition: width 0.8s ease; }
.bdr-bar-fill.easy   { background: rgba(120,230,120,0.6); }
.bdr-bar-fill.medium { background: rgba(255,200,80,0.6); }
.bdr-bar-fill.hard   { background: rgba(255,100,100,0.6); }

.time-stats { display: flex; flex-direction: column; }
.ts-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0.7rem 1.2rem; border-bottom: 1px solid var(--border);
}
.ts-row:last-child { border-bottom: none; }
.ts-label { font-size: 0.75rem; color: var(--gray); }
.ts-val { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white); }

.next-steps { display: flex; flex-direction: column; }
.qa-item {
  display: flex; align-items: center; gap: 12px;
  padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border);
  background: transparent; cursor: pointer; text-align: left; width: 100%;
  text-decoration: none; transition: background 0.15s;
}
.qa-item:last-child { border-bottom: none; }
.qa-item:hover { background: rgba(240,240,234,0.03); }
.qa-icon {
  width: 32px; height: 32px; border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--gray); flex-shrink: 0;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.qa-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.qa-title { font-size: 0.8rem; font-weight: 600; color: var(--white); }
.qa-sub   { font-size: 0.65rem; color: var(--gray); }
.qa-arrow { font-family: var(--font-mono); font-size: 0.75rem; color: var(--gray); flex-shrink: 0; }

/* ── Question card (review) ────────────────────────────── */
/* .rc-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.2rem 1.4rem;
  margin-bottom: 1.2rem;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}

.rc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.rc-qnum {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--gray);
  letter-spacing: 0.05em;
}

.rc-tags {
  display: flex;
  gap: 0.5rem;
}

.rc-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.rc-tag.subject {
  background: rgba(240,240,234,0.08);
  color: var(--white);
}

.rc-tag.difficulty {
  background: rgba(255,100,100,0.1);
  color: #ff6464;
}

.rc-question {
  margin-bottom: 1rem;
}

.rc-qtext {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--white);
  margin-bottom: 0.8rem;
}

.rc-qimage {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin-top: 0.8rem;
  border: 1px solid var(--border);
}

.rc-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rc-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: rgba(240,240,234,0.03);
  transition: all 0.2s ease;
}

.rc-option:hover {
  background: rgba(240,240,234,0.06);
  border-color: var(--accent);
}

.rc-option.rc-correct {
  background: rgba(120,230,120,0.1);
  border-color: #78e678;
}

.rc-option.rc-wrong {
  background: rgba(255,100,100,0.1);
  border-color: #ff6464;
}

.rc-option.rc-user {
  background: rgba(255,200,80,0.1);
  border-color: #ffc850;
}

.rc-opt-letter {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--gray);
  min-width: 24px;
  text-align: center;
}

.rc-opt-text {
  flex: 1;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--white);
}

.rc-opt-tag {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.rc-option.rc-correct .rc-opt-tag {
  background: #78e678;
  color: #000;
}

.rc-option.rc-wrong .rc-opt-tag {
  background: #ff6464;
  color: #fff;
}

.rc-option.rc-user .rc-opt-tag {
  background: #ffc850;
  color: #000;
}

.rc-skipped-note {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--gray);
  padding: 0.5rem 0;
}

.rc-explanation {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.exp-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
}

.exp-text {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--gray);
} */

.eq-img {
  max-width: 100%;
  border-radius: 8px;
  margin: 10px 0;
  border: 1px solid var(--border);
}

.eq-stimulus {
  background: var(--surface-2, #1a1a1a);
  border-left: 3px solid var(--accent);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 14px;
}

.eq-stimulus-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 8px;
}

.eq-stimulus p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
}

.eq-stimulus-block {
  background: var(--surface-2, #1a1a1a);
  border-left: 3px solid var(--accent);
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 0;           /* cards below will connect visually */
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}

.eq-stimulus-label {
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
  margin-bottom: 8px;
}

.eq-stimulus-block p { margin: 0; line-height: 1.7; }

.eq-img {
  max-width: 100%;
  border-radius: 6px;
  margin: 8px 0;
}

/* Indent connected questions slightly to show they belong to the stimulus */
.card-stimulus-child {
  border-top-left-radius: 0;
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1100px) {
  .setup-body    { grid-template-columns: 1fr; }
  .exam-body     { grid-template-columns: 1fr; }
  .results-body  { grid-template-columns: 1fr; }
  .results-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); }
  .stream-grid   { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 768px) {
  .setup-header  { flex-direction: column; align-items: flex-start; }
  .results-hero  { flex-direction: column; align-items: flex-start; }
  .stream-grid   { grid-template-columns: repeat(2, 1fr); }
  .diff-options  { grid-template-columns: repeat(2, 1fr); }
  .dual-config   { grid-template-columns: 1fr; }
  .result-stats-row { grid-template-columns: repeat(2, 1fr); }
  .exam-topbar   { padding: 0 1rem; gap: 0.8rem; }
  .etb-chip      { display: none; }
  .results-sidebar { grid-template-columns: 1fr; }
  .q-palette-wrap { flex-direction: column; align-items: flex-start; }
}

/* ============ RESULTS LIST PAGE ADDITIONS ============ */
.list-filter-bar { display: flex; flex-direction: column; gap: 0.8rem; margin-bottom: 1.5rem; }
.lf-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.lf-search { display: flex; align-items: center; gap: 0.5rem; border: 1px solid var(--border); border-radius: 6px; padding: 0.45rem 0.7rem; min-width: 240px; color: var(--gray); }
.lf-search input { background: transparent; border: none; outline: none; color: var(--white); font-family: var(--font-sans); font-size: 0.82rem; flex: 1; }
.lf-search input::placeholder { color: var(--dim); }
.lf-clear { background: none; border: none; color: var(--gray); font-size: 1rem; cursor: pointer; line-height: 1; }
.sort-pills { margin-left: auto; }
.lf-status { display: flex; align-items: center; gap: 0.8rem; font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.lf-count { color: var(--white); }
.lf-reset { background: none; border: none; color: var(--gray); cursor: pointer; font-family: var(--font-mono); font-size: 0.7rem; text-decoration: underline; }
.lf-reset:hover { color: var(--white); }
.list-empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem 1rem; color: var(--gray); font-family: var(--font-mono); font-size: 0.85rem; border: 1px solid var(--border); border-radius: 8px; }
.les-icon { opacity: 0.4; }
.exam-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1px; background: var(--border); }
.exam-card { position: relative; background: var(--black); border: none; text-align: left; cursor: pointer; padding: 1.1rem 1.2rem; display: flex; flex-direction: column; gap: 0.7rem; border-left: 2px solid transparent; transition: border-color 0.2s ease, background 0.2s ease; font-family: var(--font-sans); color: var(--white); }
.exam-card:hover { border-left-color: var(--border-bright); background: rgba(240,240,234,0.02); }
.ec-top { display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }
.ec-mid { display: flex; align-items: center; gap: 0.9rem; }
.ec-score { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; min-width: 64px; }
.ec-score.high { color: rgba(120,230,120,0.9); }
.ec-score.mid  { color: rgba(255,200,80,0.9); }
.ec-score.low  { color: rgba(255,100,100,0.85); }
.ec-info { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.ec-title { font-size: 0.92rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ec-sub { font-size: 0.72rem; color: var(--gray); }
.ec-bottom { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; font-family: var(--font-mono); font-size: 0.68rem; }
.ec-stat.correct { color: rgba(120,230,120,0.85); }
.ec-stat.wrong   { color: rgba(255,100,100,0.85); }
.ec-stat.skipped { color: var(--gray); }
.ec-qcount { color: var(--dim); margin-left: auto; }
.ec-status { padding: 0.15rem 0.5rem; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.6rem; }
.ec-status.passed { background: rgba(120,230,120,0.12); color: rgba(120,230,120,0.9); }
.ec-status.failed { background: rgba(255,100,100,0.12); color: rgba(255,100,100,0.85); }
.ec-arrow { position: absolute; right: 1rem; bottom: 1rem; color: var(--dim); font-size: 0.85rem; }
.back-link { background: none; border: none; cursor: pointer; font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.05em; color: var(--gray); margin-bottom: 1.2rem; padding: 0; }
.back-link:hover { color: var(--white); }
.subject-filter-row { display: flex; align-items: center; gap: 0.8rem; flex-wrap: wrap; padding: 0.8rem 0; margin-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
.sfr-label { font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--gray); }
.review-note { padding: 1.2rem; border: 1px dashed var(--border); border-radius: 8px; color: var(--gray); font-size: 0.85rem; text-align: center; }
</style>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const supabase = useSupabaseClient()
const session = useSupabaseSession()
import { renderLatexText } from '~/utils/renderLatex'

const HSC_supabase = useSupabaseHSC()
const Medical_supabase = useSupabaseMedical()

const { isBn } = useI18n()
const selectedLang = computed(() => isBn.value ? 'bangla' : 'english')
const optLetters = ['A', 'B', 'C', 'D', 'E']

// ─── Toast ────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', type: 'success' })
function showToast(msg: string, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3500)
}

const icons = {
  list:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M4 6h16M4 12h16M4 18h16"/></svg>`,
  target:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  trophy:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M7 5H4a3 3 0 0 0 3 4M17 5h3a3 3 0 0 1-3 4"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M20 6L9 17l-5-5"/></svg>`,
  retry:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  drill:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/></svg>`,
  progress: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

function scoreClass(score: number) {
  if (score >= 75) return 'high'
  if (score >= 50) return 'mid'
  return 'low'
}
function gradeLabel(score: number) {
  if (score >= 90) return 'A+'
  if (score >= 80) return 'A'
  if (score >= 70) return 'B'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}
function examTypeLabel(t: string) {
  const map: Record<string, string> = {
    mock: 'Mock Exam', practice: 'Practice', admission: 'Admission',
    hsc_ssc: 'HSC/SSC', engineering: 'Engineering',
  }
  return map[t] ?? t
}
function subjectLabel(e: any) {
  const s = e.subject?.[selectedLang.value] ?? e.subject?.english ?? e.subject
  return s === 'All' || !s ? 'All Subjects' : s
}
function getSubjectStr(q: any): string {
  return typeof q.subject === 'object' ? q.subject.english : q.subject
}
function getChapterStr(q: any): string {
  return typeof q.chapter === 'object' ? q.chapter.english : q.chapter
}

// ═══════════════ PHASE: LIST ═══════════════
const phase = ref<'list' | 'detail'>('list')
const exams = ref<any[]>([])
const isLoadingList = ref(false)

async function fetchExamList() {
  if (!session.value) return
  isLoadingList.value = true
  const { data, error } = await supabase
    .from('exam_results')
    .select('*')
    .eq('user_id', session.value.user.id)
    .order('created_at', { ascending: false })

  if (error) { console.error(error); isLoadingList.value = false; return }
  exams.value = data ?? []
  isLoadingList.value = false
}
onMounted(fetchExamList)

const listFilters = reactive({ stream: 'All', examType: 'All', search: '', sort: 'newest' })

const streamFilterOptions = computed(() => {
  const streams = new Set<string>(['All'])
  exams.value.forEach(e => { if (e.stream) streams.add(e.stream) })
  return Array.from(streams)
})

const examTypeOptions = computed(() => {
  const types = new Set<string>()
  exams.value.forEach(e => types.add(e.exam_type))
  return [{ val: 'All', label: 'All Types' }, ...Array.from(types).map(t => ({ val: t, label: examTypeLabel(t) }))]
})

const sortOptions = [
  { val: 'newest', label: 'Newest' },
  { val: 'oldest', label: 'Oldest' },
  { val: 'highest', label: 'Highest Score' },
  { val: 'lowest', label: 'Lowest Score' },
]

const hasActiveFilters = computed(() =>
  listFilters.stream !== 'All' || listFilters.examType !== 'All' || !!listFilters.search
)
function resetFilters() {
  listFilters.stream = 'All'; listFilters.examType = 'All'; listFilters.search = ''; listFilters.sort = 'newest'
}

const filteredExams = computed(() => {
  let list = [...exams.value]
  if (listFilters.stream !== 'All') list = list.filter(e => e.stream === listFilters.stream)
  if (listFilters.examType !== 'All') list = list.filter(e => e.exam_type === listFilters.examType)
  if (listFilters.search.trim()) {
    const q = listFilters.search.trim().toLowerCase()
    list = list.filter(e =>
      (e.title ?? '').toLowerCase().includes(q) ||
      subjectLabel(e).toLowerCase().includes(q) ||
      (e.stream ?? '').toLowerCase().includes(q)
    )
  }
  switch (listFilters.sort) {
    case 'oldest':  list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()); break
    case 'highest': list.sort((a, b) => b.score - a.score); break
    case 'lowest':  list.sort((a, b) => a.score - b.score); break
    default:        list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
  return list
})

const summary = computed(() => {
  const total = exams.value.length
  if (!total) return { total: 0, avgScore: 0, bestScore: 0, passRate: 0 }
  const avgScore = Math.round(exams.value.reduce((s, e) => s + e.score, 0) / total)
  const bestScore = Math.max(...exams.value.map(e => e.score))
  const passRate = Math.round((exams.value.filter(e => e.status === 'passed').length / total) * 100)
  return { total, avgScore, bestScore, passRate }
})

// ═══════════════ PHASE: DETAIL ═══════════════
const selectedExam = ref<any>(null)
const selectedSession = ref<any>(null)
const reviewQuestions = ref<any[]>([])   // full Question objects, ordered
const attemptMap = ref<Record<number, any>>({})
const isLoadingDetail = ref(false)
const questionsLoaded = ref(false)
const reviewFilter = ref('All')
const subjectFilter = ref('All')

async function openExam(exam: any) {
  phase.value = 'detail'
  selectedExam.value = exam
  reviewFilter.value = 'All'
  subjectFilter.value = 'All'
  reviewQuestions.value = []
  attemptMap.value = {}
  selectedSession.value = null
  questionsLoaded.value = false
  isLoadingDetail.value = true

  try {
    // 1. Full session detail (question_ids, config snapshot)
    if (exam.session_id) {
      const { data: sessionData } = await supabase
        .from('exam_sessions')
        .select('*')
        .eq('id', exam.session_id)
        .single()
      selectedSession.value = sessionData
    }

    // 2. Per-question attempts (selected_index / correct_index / is_correct)
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('question_id, selected_index, correct_index, is_correct')
      .eq('source_id', exam.session_id ?? '00000000-0000-0000-0000-000000000000')

    const aMap: Record<number, any> = {}
    ;(attempts ?? []).forEach(a => { aMap[a.question_id] = a })
    attemptMap.value = aMap

    // 3. Full question content, ordered by question_ids (or attempt order as fallback)
    const ids: number[] = selectedSession.value?.question_ids ?? (attempts ?? []).map(a => a.question_id)
    if (ids.length) {

      const supa = selectedSession.value?.stream.includes('HSC') ? HSC_supabase : Medical_supabase

      const { data: qData, error: qError } = await supa
        .from('questions')
        .select('*')
        .in('id', ids)

      console.log(qData)

      if (!qError && qData?.length) {
        const qMap = new Map(qData.map(q => [q.id, q]))
        reviewQuestions.value = ids.map(id => qMap.get(id)).filter(Boolean)
        questionsLoaded.value = true
      }
    }
  } catch (e) {
    console.error('Failed to load exam detail:', e)
    showToast('Could not load full question review', 'error')
  } finally {
    isLoadingDetail.value = false
  }
}

const detailStats = computed(() => {
  const e = selectedExam.value
  if (!e) return []
  const answered = e.correct_count + e.wrong_count
  return [
    { label: 'Correct', value: e.correct_count, percent: e.correct_count / e.questions_count * 100, icon: icons.check },
    { label: 'Wrong', value: e.wrong_count, percent: e.wrong_count / e.questions_count * 100,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` },
    { label: 'Skipped', value: e.skipped_count, percent: e.skipped_count / e.questions_count * 100,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/></svg>` },
    { label: 'Accuracy', value: (answered ? Math.round(e.correct_count / answered * 100) : 0) + '%',
      percent: answered ? e.correct_count / answered * 100 : 0,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  ]
})

const avgTimePerQ = computed(() => {
  const e = selectedExam.value, s = selectedSession.value
  if (!e || !s?.duration_taken_mins) return 0
  const answered = e.correct_count + e.wrong_count
  return answered ? Math.round((s.duration_taken_mins * 60) / answered) : 0
})

function reviewClass(id: number) {
  const a = attemptMap.value[id]
  if (!a || a.selected_index == null) return 'skipped'
  return a.is_correct ? 'correct' : 'wrong'
}

// ── Subject filter system ───────────────────────────────────
const availableSubjects = computed(() => {
  const set = new Set<string>()
  reviewQuestions.value.forEach(q => set.add(getSubjectStr(q)))
  return set.size > 1 ? ['All', ...Array.from(set).sort()] : []
})

const subjectCounts = computed(() => {
  const counts: Record<string, number> = {}
  reviewQuestions.value.forEach(q => {
    const s = getSubjectStr(q)
    counts[s] = (counts[s] ?? 0) + 1
  })
  return counts
})

const filteredReview = computed(() => {
  let list = reviewQuestions.value
  if (subjectFilter.value !== 'All') list = list.filter(q => getSubjectStr(q) === subjectFilter.value)
  if (reviewFilter.value !== 'All') {
    list = list.filter(q => {
      const cls = reviewClass(q.id)
      if (reviewFilter.value === 'Correct') return cls === 'correct'
      if (reviewFilter.value === 'Wrong') return cls === 'wrong'
      if (reviewFilter.value === 'Skipped') return cls === 'skipped'
      return true
    })
  }
  return list
})

const filteredReviewGroups = computed(() => {
  const groups: any[] = []
  const stimulusMap = new Map<string, any>()
  for (const q of filteredReview.value) {
    if (q.stimulus_hash) {
      if (stimulusMap.has(q.stimulus_hash)) {
        stimulusMap.get(q.stimulus_hash).questions.push(q)
      } else {
        const group = { stimulus: q.stimulus, stimulus_image: q.stimulus_image, questions: [q] }
        stimulusMap.set(q.stimulus_hash, group)
        groups.push(group)
      }
    } else {
      groups.push({ questions: [q] })
    }
  }
  return groups
})

// ── Breakdown panels (react to subject filter) ──────────────
const diffBreakdown = computed(() => {
  const diffs: Record<string, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 },
  }
  const pool = subjectFilter.value === 'All' ? reviewQuestions.value : reviewQuestions.value.filter(q => getSubjectStr(q) === subjectFilter.value)
  pool.forEach(q => {
    const lvl = q.difficulty_level ?? 'medium'
    if (!diffs[lvl]) diffs[lvl] = { correct: 0, total: 0 }
    diffs[lvl].total++
    if (reviewClass(q.id) === 'correct') diffs[lvl].correct++
  })
  return [
    { label: 'Easy', cls: 'easy', ...diffs.easy },
    { label: 'Medium', cls: 'medium', ...diffs.medium },
    { label: 'Hard', cls: 'hard', ...diffs.hard },
  ]
})

const subjectBreakdown = computed(() => {
  const map: Record<string, { correct: number; total: number }> = {}
  reviewQuestions.value.forEach(q => {
    const s = getSubjectStr(q)
    if (!map[s]) map[s] = { correct: 0, total: 0 }
    map[s].total++
    if (reviewClass(q.id) === 'correct') map[s].correct++
  })
  return Object.entries(map).map(([label, v]) => ({ label, ...v }))
})
</script>

