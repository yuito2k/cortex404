<template>
  <div class="mock-exam">

    <!-- ══ PHASE: SETUP ══════════════════════════════════════════ -->
    <template v-if="phase === 'setup'">

      <div class="setup-header">
        <div class="header-left">
          <div class="page-chip"><span class="chip-dot" /> Mock Exam</div>
          <h1 class="page-title">Configure Your<br><span class="text-outline">Exam.</span></h1>
          <p class="page-sub">Set the exam type, subject, duration and question count. Then go.</p>
        </div>
        <div class="header-right">
          <div class="past-exams-teaser">
            <span class="teaser-label">Last Attempt</span>
            <span class="teaser-score" :class="scoreClass(lastResult.score)">{{ lastResult.score }}%</span>
            <span class="teaser-meta">{{ lastResult.subject }} · {{ lastResult.date }}</span>
          </div>
        </div>
      </div>

      <div class="setup-body">

        <!-- Config form -->
        <div class="config-panel">

          <!-- Exam stream -->
          <div class="config-section">
            <div class="config-section-header">
              <span class="csec-tag">01</span>
              <span class="csec-label">Select Exam Stream</span>
            </div>
            <div class="stream-grid">
              <button
                v-for="s in examStreams"
                :key="s.id"
                class="stream-card"
                :class="{ active: config.stream === s.id }"
                @click="config.stream = s.id; config.subject = 'All'"
              >
                <span class="stream-icon" v-html="s.icon" />
                <span class="stream-name">{{ s.name }}</span>
                <span class="stream-desc">{{ s.desc }}</span>
                <span v-if="config.stream === s.id" class="stream-check">✓</span>
              </button>
            </div>
          </div>

          <!-- Subject -->
          <div class="config-section" v-if="availableSubjects.length > 1">
            <div class="config-section-header">
              <span class="csec-tag">02</span>
              <span class="csec-label">Subject</span>
            </div>
            <div class="filter-pills">
              <button
                v-for="sub in availableSubjects"
                :key="sub"
                class="filter-pill"
                :class="{ active: config.subject === sub }"
                @click="config.subject = sub"
              >{{ sub }}</button>
            </div>
          </div>

          <!-- Question count + Duration -->
          <div class="config-section">
            <div class="config-section-header">
              <span class="csec-tag">{{ availableSubjects.length > 1 ? '03' : '02' }}</span>
              <span class="csec-label">Questions &amp; Duration</span>
            </div>
            <div class="dual-config">
              <div class="dual-col">
                <label class="form-label">Number of Questions</label>
                <div class="num-pills">
                  <button
                    v-for="n in questionCounts"
                    :key="n"
                    class="filter-pill"
                    :class="{ active: config.count === n }"
                    @click="config.count = n; autoSetDuration(n)"
                  >{{ n }}</button>
                </div>
              </div>
              <div class="dual-col">
                <label class="form-label">Duration</label>
                <div class="num-pills">
                  <button
                    v-for="d in durationOptions"
                    :key="d.val"
                    class="filter-pill"
                    :class="{ active: config.duration === d.val }"
                    @click="config.duration = d.val"
                  >{{ d.label }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Difficulty mix -->
          <div class="config-section">
            <div class="config-section-header">
              <span class="csec-tag">{{ availableSubjects.length > 1 ? '04' : '03' }}</span>
              <span class="csec-label">Difficulty Mix</span>
            </div>
            <div class="diff-options">
              <button
                v-for="d in diffModes"
                :key="d.val"
                class="diff-card"
                :class="{ active: config.diffMode === d.val }"
                @click="config.diffMode = d.val"
              >
                <span class="diff-card-name">{{ d.label }}</span>
                <span class="diff-card-desc">{{ d.desc }}</span>
                <div class="diff-bars">
                  <div class="diff-bar easy"  :style="{ height: d.easy  + 'px' }" />
                  <div class="diff-bar med"   :style="{ height: d.med   + 'px' }" />
                  <div class="diff-bar hard"  :style="{ height: d.hard  + 'px' }" />
                </div>
              </button>
            </div>
          </div>

          <!-- Options row -->
          <div class="config-section config-options-row">
            <label class="toggle-row">
              <span class="toggle-label">Shuffle Questions</span>
              <button class="toggle-btn" :class="{ on: config.shuffle }" @click="config.shuffle = !config.shuffle">
                <span class="toggle-knob" />
              </button>
            </label>
            <label class="toggle-row">
              <span class="toggle-label">Show Timer</span>
              <button class="toggle-btn" :class="{ on: config.showTimer }" @click="config.showTimer = !config.showTimer">
                <span class="toggle-knob" />
              </button>
            </label>
            <label class="toggle-row">
              <span class="toggle-label">Negative Marking (−0.25)</span>
              <button class="toggle-btn" :class="{ on: config.negativeMarking }" @click="config.negativeMarking = !config.negativeMarking">
                <span class="toggle-knob" />
              </button>
            </label>
          </div>

          <!-- Start CTA -->
          <div class="setup-cta">
            <button class="iso-btn iso-btn--fill start-btn" @click="startExam">
              Start Exam →
            </button>
            <div class="cta-meta">
              <span>{{ config.count }} questions</span>
              <span class="dot-sep">·</span>
              <span>{{ durationOptions.find(d => d.val === config.duration)?.label }}</span>
              <span class="dot-sep">·</span>
              <span>{{ config.stream }}{{ config.subject !== 'All' ? ' / ' + config.subject : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Right: info sidebar -->
        <aside class="setup-sidebar">
          <!-- Tips -->
          <div class="info-panel">
            <div class="panel-header">
              <span class="panel-tag">Exam Tips</span>
            </div>
            <div class="tips-list">
              <div v-for="tip in examTips" :key="tip" class="tip-row">
                <span class="tip-bullet">→</span>
                <span class="tip-text">{{ tip }}</span>
              </div>
            </div>
          </div>

          <!-- Past results -->
          <div class="info-panel">
            <div class="panel-header">
              <span class="panel-tag">Recent Results</span>
            </div>
            <div class="results-list">
              <div v-for="r in pastResults" :key="r.id" class="result-row">
                <div class="result-left">
                  <span class="result-subject">{{ r.subject }}</span>
                  <span class="result-meta">{{ r.count }}Q · {{ r.date }}</span>
                </div>
                <div class="result-score" :class="scoreClass(r.score)">{{ r.score }}%</div>
              </div>
            </div>
          </div>

          <!-- Rules -->
          <div class="info-panel">
            <div class="panel-header">
              <span class="panel-tag">Rules</span>
            </div>
            <div class="rules-list">
              <div v-for="rule in examRules" :key="rule.label" class="rule-row">
                <span class="rule-icon" v-html="rule.icon" />
                <div class="rule-text">
                  <span class="rule-label">{{ rule.label }}</span>
                  <span class="rule-desc">{{ rule.desc }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </template>

    <!-- ══ PHASE: EXAM ════════════════════════════════════════════ -->
    <template v-else-if="phase === 'exam'">

      <!-- Exam top bar -->
      <div class="exam-topbar">
        <div class="etb-left">
          <span class="etb-chip">{{ config.stream }}{{ config.subject !== 'All' ? ' / ' + config.subject : '' }}</span>
          <span class="etb-progress">{{ currentIdx + 1 }} / {{ questions.length }}</span>
        </div>

        <div class="etb-center">
          <!-- Progress bar -->
          <div class="etb-progbar">
            <div class="etb-progbar-fill" :style="{ width: ((currentIdx + 1) / questions.length * 100) + '%' }" />
          </div>
        </div>

        <div class="etb-right">
          <div class="timer-display" :class="{ warning: timeLeft < 120, critical: timeLeft < 30 }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ formatTime(timeLeft) }}
          </div>
          <button class="iso-btn iso-btn--ghost end-btn" @click="confirmEndExam">
            End Exam
          </button>
        </div>
      </div>

      <!-- Question navigation palette -->
      <div class="q-palette-wrap">
        <div class="q-palette">
          <button
            v-for="(q, i) in questions"
            :key="q.id"
            class="palette-dot"
            :class="{
              current: i === currentIdx,
              answered: answers[q.id] !== undefined,
              flagged: flagged.has(q.id),
            }"
            @click="jumpTo(i)"
          >{{ i + 1 }}</button>
        </div>
        <div class="palette-legend">
          <span class="leg-item"><span class="leg-dot answered" />Answered</span>
          <span class="leg-item"><span class="leg-dot flagged" />Flagged</span>
          <span class="leg-item"><span class="leg-dot" />Unanswered</span>
        </div>
      </div>

      <!-- Question card -->
      <div class="exam-body">
        <div class="exam-question-card">

          <!-- Q header -->
          <div class="eq-header">
            <div class="eq-meta">
              <span class="eq-num">Q{{ currentIdx + 1 }}</span>
              <span class="eq-diff" :class="currentQ.difficulty">{{ currentQ.difficulty }}</span>
              <span class="eq-subject">{{ currentQ.subject }}</span>
              <span class="eq-chapter">{{ currentQ.chapter }}</span>
            </div>
            <button
              class="flag-btn"
              :class="{ active: flagged.has(currentQ.id) }"
              @click="toggleFlag(currentQ.id)"
              title="Flag for review"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                <line x1="4" y1="22" x2="4" y2="15"/>
              </svg>
              {{ flagged.has(currentQ.id) ? 'Flagged' : 'Flag' }}
            </button>
          </div>

          <!-- Question text -->
          <div class="eq-body">
            <p class="eq-text">{{ currentQ.question }}</p>
          </div>

          <!-- Options -->
          <div class="eq-options">
            <button
              v-for="(opt, oi) in currentQ.options"
              :key="oi"
              class="eq-option"
              :class="{ selected: answers[currentQ.id] === oi }"
              @click="selectAnswer(currentQ.id, oi)"
            >
              <span class="opt-letter">{{ optLetters[oi] }}</span>
              <span class="opt-text">{{ opt }}</span>
            </button>
          </div>

          <!-- Nav footer -->
          <div class="eq-footer">
            <button
              class="iso-btn iso-btn--ghost nav-btn"
              :disabled="currentIdx === 0"
              @click="currentIdx--"
            >← Previous</button>

            <button
              class="iso-btn iso-btn--ghost clear-btn"
              :disabled="answers[currentQ.id] === undefined"
              @click="clearAnswer(currentQ.id)"
            >Clear</button>

            <button
              v-if="currentIdx < questions.length - 1"
              class="iso-btn iso-btn--fill nav-btn"
              @click="currentIdx++"
            >Next →</button>
            <button
              v-else
              class="iso-btn iso-btn--fill nav-btn submit-btn"
              @click="confirmEndExam"
            >Submit Exam →</button>
          </div>
        </div>

        <!-- Right: stats panel -->
        <aside class="exam-sidebar">
          <div class="side-panel">
            <div class="panel-header"><span class="panel-tag">Progress</span></div>
            <div class="exam-progress-stats">
              <div class="ep-stat">
                <span class="ep-val">{{ answeredCount }}</span>
                <span class="ep-label">Answered</span>
              </div>
              <div class="ep-stat">
                <span class="ep-val">{{ questions.length - answeredCount }}</span>
                <span class="ep-label">Remaining</span>
              </div>
              <div class="ep-stat">
                <span class="ep-val">{{ flagged.size }}</span>
                <span class="ep-label">Flagged</span>
              </div>
            </div>
            <div class="ep-bar-wrap">
              <div class="ep-bar-fill" :style="{ width: (answeredCount / questions.length * 100) + '%' }" />
            </div>
          </div>

          <!-- Flagged list -->
          <div class="side-panel" v-if="flagged.size">
            <div class="panel-header"><span class="panel-tag">Flagged ({{ flagged.size }})</span></div>
            <div class="flagged-list">
              <button
                v-for="id in [...flagged]"
                :key="id"
                class="flagged-item"
                @click="jumpTo(questions.findIndex(q => q.id === id))"
              >
                <span class="fi-num">Q{{ questions.findIndex(q => q.id === id) + 1 }}</span>
                <span class="fi-text">{{ questions.find(q => q.id === id)?.question.slice(0, 50) }}…</span>
              </button>
            </div>
          </div>

          <!-- Submit panel -->
          <div class="side-panel submit-panel">
            <div class="panel-header"><span class="panel-tag">Ready?</span></div>
            <div class="submit-info">
              <p class="submit-desc">
                {{ answeredCount }} of {{ questions.length }} answered.
                {{ questions.length - answeredCount > 0 ? (questions.length - answeredCount) + ' unanswered will be skipped.' : 'All answered!' }}
              </p>
              <button class="iso-btn iso-btn--fill iso-btn--full" @click="confirmEndExam">
                Submit Exam →
              </button>
            </div>
          </div>
        </aside>
      </div>

      <!-- End exam confirm modal -->
      <Transition name="modal-fade">
        <div v-if="showEndConfirm" class="modal-overlay" @click.self="showEndConfirm = false">
          <div class="modal-box">
            <div class="modal-header">
              <span class="modal-tag">Confirm Submission</span>
            </div>
            <div class="modal-body">
              <p class="modal-text">
                You've answered <strong>{{ answeredCount }}</strong> of <strong>{{ questions.length }}</strong> questions.
                <span v-if="questions.length - answeredCount > 0"> {{ questions.length - answeredCount }} will be marked as skipped.</span>
              </p>
              <p v-if="flagged.size" class="modal-warn">
                ⚠ {{ flagged.size }} flagged question{{ flagged.size > 1 ? 's' : '' }} not yet reviewed.
              </p>
            </div>
            <div class="modal-footer">
              <button class="iso-btn iso-btn--ghost" @click="showEndConfirm = false">Keep Going</button>
              <button class="iso-btn iso-btn--fill" @click="submitExam">Submit Now →</button>
            </div>
          </div>
        </div>
      </Transition>
    </template>

    <!-- ══ PHASE: RESULTS ═════════════════════════════════════════ -->
    <template v-else-if="phase === 'results'">

      <!-- Score hero -->
      <div class="results-hero">
        <div class="rh-left">
          <div class="page-chip"><span class="chip-dot" /> Exam Complete</div>
          <div class="score-display">
            <span class="score-big" :class="scoreClass(result.score)">{{ result.score }}%</span>
            <div class="score-meta-col">
              <span class="score-label">Final Score</span>
              <span class="score-grade" :class="scoreClass(result.score)">{{ gradeLabel(result.score) }}</span>
            </div>
          </div>
          <p class="score-sub">{{ result.correct }} correct · {{ result.wrong }} wrong · {{ result.skipped }} skipped out of {{ questions.length }}</p>
        </div>
        <div class="rh-right">
          <div class="result-actions">
            <button class="iso-btn iso-btn--fill" @click="phase = 'setup'">New Exam →</button>
            <NuxtLink to="/dashboard/question-bank" class="iso-btn iso-btn--ghost">Review Questions</NuxtLink>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="result-stats-row">
        <div v-for="s in resultStats" :key="s.label" class="rstat">
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
                v-for="f in ['All','Correct','Wrong','Skipped']"
                :key="f"
                class="filter-pill small-pill"
                :class="{ active: reviewFilter === f }"
                @click="reviewFilter = f"
              >{{ f }}</button>
            </div>
          </div>

          <div
            v-for="(q, i) in filteredReview"
            :key="q.id"
            class="review-card"
            :class="reviewClass(q.id)"
          >
            <div class="rc-header">
              <div class="rc-meta">
                <span class="rc-status-icon">
                  {{ reviewClass(q.id) === 'correct' ? '✓' : reviewClass(q.id) === 'wrong' ? '✗' : '–' }}
                </span>
                <span class="rc-num">Q{{ i + 1 }}</span>
                <span class="rc-diff" :class="q.difficulty">{{ q.difficulty }}</span>
                <span class="rc-subject">{{ q.subject }}</span>
              </div>
            </div>
            <p class="rc-question">{{ q.question }}</p>
            <div class="rc-answers">
              <div v-if="answers[q.id] !== undefined" class="rc-answer" :class="answers[q.id] === q.correctIndex ? 'correct' : 'wrong'">
                <span class="rca-label">Your answer:</span>
                <span class="rca-text">{{ optLetters[answers[q.id]] }}. {{ q.options?.[answers[q.id]] }}</span>
              </div>
              <div v-else class="rc-answer skipped">
                <span class="rca-label">Skipped</span>
              </div>
              <div v-if="answers[q.id] !== q.correctIndex" class="rc-answer correct">
                <span class="rca-label">Correct answer:</span>
                <span class="rca-text">{{ optLetters[q.correctIndex!] }}. {{ q.options?.[q.correctIndex!] }}</span>
              </div>
            </div>
            <div class="rc-explanation">
              <span class="exp-label">EXPLANATION</span>
              <p class="exp-text">{{ q.explanation }}</p>
            </div>
          </div>
        </div>

        <!-- Right: breakdown sidebar -->
        <aside class="results-sidebar">

          <!-- Difficulty breakdown -->
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

          <!-- Time stats -->
          <div class="side-panel">
            <div class="panel-header"><span class="panel-tag">Time</span></div>
            <div class="time-stats">
              <div class="ts-row">
                <span class="ts-label">Total Duration</span>
                <span class="ts-val">{{ formatTime(config.duration * 60 - timeLeft) }}</span>
              </div>
              <div class="ts-row">
                <span class="ts-label">Avg per Question</span>
                <span class="ts-val">{{ avgTimePerQ }}s</span>
              </div>
              <div class="ts-row">
                <span class="ts-label">Time Remaining</span>
                <span class="ts-val">{{ formatTime(timeLeft) }}</span>
              </div>
            </div>
          </div>

          <!-- Share / retry -->
          <div class="side-panel">
            <div class="panel-header"><span class="panel-tag">Next Steps</span></div>
            <div class="next-steps">
              <button class="qa-item" @click="phase = 'setup'">
                <span class="qa-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                  </svg>
                </span>
                <div class="qa-text">
                  <span class="qa-title">Retake Exam</span>
                  <span class="qa-sub">Same config, new shuffle</span>
                </div>
                <span class="qa-arrow">→</span>
              </button>
              <NuxtLink to="/dashboard/question-bank" class="qa-item">
                <span class="qa-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                    <path d="M4 4h16v16H4z"/><path d="M4 9h16M9 4v16"/>
                  </svg>
                </span>
                <div class="qa-text">
                  <span class="qa-title">Drill Weak Topics</span>
                  <span class="qa-sub">Practice wrong answers</span>
                </div>
                <span class="qa-arrow">→</span>
              </NuxtLink>
              <NuxtLink to="/dashboard/progress" class="qa-item">
                <span class="qa-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                </span>
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

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

// ── Types ──────────────────────────────────────────────────
interface Question {
  id: number
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  subject: string
  chapter: string
  exam: string
  difficulty: 'easy' | 'medium' | 'hard'
  year?: string
}

// ── Constants ──────────────────────────────────────────────
const optLetters = ['A', 'B', 'C', 'D', 'E']

const examStreams = [
  { id: 'HSC', name: 'HSC', desc: 'Higher Secondary', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
  { id: 'SSC', name: 'SSC', desc: 'Secondary Certificate', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>` },
  { id: 'BUET', name: 'BUET', desc: 'Engineering Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
  { id: 'Medical', name: 'Medical', desc: 'MBBS Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
  { id: 'BCS', name: 'BCS', desc: 'Civil Service Exam', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
  { id: 'Bank', name: 'Bank', desc: 'Bank & Govt Jobs', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
]

const subjectMap: Record<string, string[]> = {
  HSC:     ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'English', 'ICT'],
  SSC:     ['All', 'Science', 'Math', 'English', 'Bangla'],
  BUET:    ['All', 'Physics', 'Chemistry', 'Higher Math'],
  Medical: ['All', 'Biology', 'Chemistry', 'Physics'],
  BCS:     ['All', 'Bangla', 'English', 'Math', 'Bangladesh Affairs', 'General Knowledge'],
  Bank:    ['All', 'English', 'Math', 'General Knowledge'],
}

const questionCounts = [10, 20, 30, 50, 100]

const durationOptions = [
  { val: 10,  label: '10 min' },
  { val: 20,  label: '20 min' },
  { val: 30,  label: '30 min' },
  { val: 45,  label: '45 min' },
  { val: 60,  label: '60 min' },
  { val: 90,  label: '90 min' },
]

const diffModes = [
  { val: 'balanced', label: 'Balanced',    desc: '30% easy · 50% med · 20% hard', easy: 14, med: 24, hard: 10 },
  { val: 'easy',     label: 'Easy Start',  desc: '60% easy · 30% med · 10% hard', easy: 28, med: 14, hard: 6  },
  { val: 'hard',     label: 'Challenge',   desc: '10% easy · 30% med · 60% hard', easy: 6,  med: 14, hard: 28 },
  { val: 'mixed',    label: 'Full Random', desc: 'Random mix, no filter',          easy: 16, med: 18, hard: 16 },
]

const examTips = [
  'Read each question fully before selecting.',
  'Flag uncertain questions and return later.',
  'Manage time — don\'t dwell too long on one Q.',
  'Eliminate clearly wrong options first.',
  'Use negative marking strategy if enabled.',
]

const examRules = [
  { label: 'One attempt only', desc: 'Each exam session is final once submitted.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>` },
  { label: 'Auto-submit', desc: 'Exam submits automatically when timer hits 0.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
  { label: 'No tab switch', desc: 'Changing tabs may trigger auto-submission.', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>` },
]

// ── Demo data ──────────────────────────────────────────────
const pastResults = [
  { id: 1, subject: 'Physics · HSC',    score: 88, count: 30, date: '2h ago' },
  { id: 2, subject: 'BCS General',      score: 72, count: 50, date: 'Yesterday' },
  { id: 3, subject: 'Chemistry · HSC',  score: 65, count: 30, date: '2 days ago' },
  { id: 4, subject: 'Math · HSC',       score: 91, count: 20, date: '4 days ago' },
]

const lastResult = pastResults[0]

const questionBank: Question[] = [
  { id: 1, exam:'HSC', subject:'Physics', chapter:'Optics', difficulty:'hard', year:'2023',
    question: 'A convex lens of focal length 20 cm is placed coaxially with a concave lens of focal length 40 cm. The combination behaves as:',
    options: ['Converging lens of f = 40 cm','Diverging lens of f = 40 cm','Converging lens of f = 20 cm','Plane glass'],
    correctIndex: 0, explanation: '1/f = 1/20 + 1/(−40) = 1/40. So f = 40 cm converging.' },

  { id: 2, exam:'HSC', subject:'Physics', chapter:'Electricity', difficulty:'medium', year:'2022',
    question: 'Two resistors of 4Ω and 6Ω are connected in parallel. The equivalent resistance is:',
    options: ['10Ω','2.4Ω','5Ω','1.67Ω'], correctIndex: 1,
    explanation: '1/R = 1/4 + 1/6 = 5/12. So R = 2.4Ω.' },

  { id: 3, exam:'HSC', subject:'Physics', chapter:'Motion', difficulty:'easy', year:'2021',
    question: 'A body remains at rest unless acted on by an external force. This is Newton\'s:',
    options: ['Second Law','Third Law','First Law','Law of Gravitation'], correctIndex: 2,
    explanation: 'Newton\'s First Law (Inertia) — a body at rest stays at rest unless acted upon by a net external force.' },

  { id: 4, exam:'HSC', subject:'Chemistry', chapter:'Electrochemistry', difficulty:'hard', year:'2023',
    question: 'During electrolysis of dilute H₂SO₄, which gas is liberated at the anode?',
    options: ['Hydrogen','Oxygen','Sulphur dioxide','Ozone'], correctIndex: 1,
    explanation: 'At the anode (oxidation): 2H₂O → O₂ + 4H⁺ + 4e⁻. Oxygen is liberated.' },

  { id: 5, exam:'HSC', subject:'Chemistry', chapter:'Periodic Table', difficulty:'easy',
    question: 'Which element has the highest electronegativity?',
    options: ['Chlorine','Fluorine','Oxygen','Nitrogen'], correctIndex: 1,
    explanation: 'Fluorine (3.98 Pauling scale) has the highest electronegativity of all elements.' },

  { id: 6, exam:'HSC', subject:'Math', chapter:'Integration', difficulty:'hard', year:'2022',
    question: 'Evaluate ∫(x² + 3x + 2)dx from 0 to 1:',
    options: ['23/6','11/6','5/2','7/3'], correctIndex: 0,
    explanation: '[x³/3 + 3x²/2 + 2x] from 0 to 1 = 1/3 + 3/2 + 2 = 2/6 + 9/6 + 12/6 = 23/6.' },

  { id: 7, exam:'HSC', subject:'Math', chapter:'Trigonometry', difficulty:'medium',
    question: 'If sin θ = 3/5, what is cos θ (first quadrant)?',
    options: ['4/5','3/4','5/4','1/2'], correctIndex: 0,
    explanation: 'cos²θ = 1 − 9/25 = 16/25, so cosθ = 4/5.' },

  { id: 8, exam:'HSC', subject:'Biology', chapter:'Cell Biology', difficulty:'easy',
    question: 'The "powerhouse" of the cell that produces ATP is:',
    options: ['Ribosome','Mitochondria','Chloroplast','Golgi apparatus'], correctIndex: 1,
    explanation: 'Mitochondria perform aerobic respiration and produce ATP via oxidative phosphorylation.' },

  { id: 9, exam:'BCS', subject:'Bangladesh Affairs', chapter:'Liberation War', difficulty:'medium', year:'2023',
    question: 'Which country first recognized Bangladesh as independent?',
    options: ['India','Soviet Union','Bhutan','Nepal'], correctIndex: 2,
    explanation: 'Bhutan recognized Bangladesh on December 6, 1971 — the first country to do so.' },

  { id: 10, exam:'BCS', subject:'English', chapter:'Grammar', difficulty:'easy', year:'2022',
    question: 'Choose the correct sentence:',
    options: [
      'Neither the students nor the teacher were present.',
      'Neither the students nor the teacher was present.',
      'Neither the students nor the teacher are present.',
      'Neither the students nor the teacher be present.'
    ], correctIndex: 1,
    explanation: 'With "neither…nor", the verb agrees with the nearest subject. "Teacher" is singular → "was".' },

  { id: 11, exam:'HSC', subject:'Physics', chapter:'Waves', difficulty:'medium',
    question: 'The speed of sound in air at 0°C is approximately:',
    options: ['300 m/s','331 m/s','343 m/s','360 m/s'], correctIndex: 1,
    explanation: 'Speed of sound in air at 0°C is approximately 331 m/s. At 20°C it is ~343 m/s.' },

  { id: 12, exam:'HSC', subject:'Chemistry', chapter:'Organic Chemistry', difficulty:'medium',
    question: 'Which functional group is present in ethanol?',
    options: ['Aldehyde –CHO','Carboxyl –COOH','Hydroxyl –OH','Ketone C=O'], correctIndex: 2,
    explanation: 'Ethanol (C₂H₅OH) is an alcohol containing the hydroxyl (–OH) functional group.' },

  { id: 13, exam:'BCS', subject:'Math', chapter:'Percentage', difficulty:'easy',
    question: 'A product sold at 20% profit. Cost price = Tk. 500. Selling price?',
    options: ['Tk. 580','Tk. 600','Tk. 520','Tk. 620'], correctIndex: 1,
    explanation: 'SP = 500 × 1.20 = 600.' },

  { id: 14, exam:'HSC', subject:'Physics', chapter:'Thermodynamics', difficulty:'hard',
    question: 'In an adiabatic process for an ideal gas, which quantity remains constant?',
    options: ['Temperature','Pressure','Volume','PVγ'], correctIndex: 3,
    explanation: 'In an adiabatic process Q = 0. The relation PVγ = constant holds.' },

  { id: 15, exam:'HSC', subject:'Math', chapter:'Complex Numbers', difficulty:'hard',
    question: 'The modulus of (1 + i)⁸ is:',
    options: ['4','8','16','32'], correctIndex: 2,
    explanation: '|1+i| = √2, so |(1+i)⁸| = (√2)⁸ = 2⁴ = 16.' },
]

// ── State ──────────────────────────────────────────────────
const phase = ref<'setup' | 'exam' | 'results'>('setup')

const config = reactive({
  stream: 'HSC',
  subject: 'All',
  count: 20,
  duration: 30,
  diffMode: 'balanced',
  shuffle: true,
  showTimer: true,
  negativeMarking: false,
})

const questions = ref<Question[]>([])
const currentIdx = ref(0)
const answers = ref<Record<number, number>>({})
const flagged = ref<Set<number>>(new Set())
const showEndConfirm = ref(false)
const timeLeft = ref(0)
const reviewFilter = ref('All')

let timerInterval: ReturnType<typeof setInterval> | null = null

// ── Computed ───────────────────────────────────────────────
const availableSubjects = computed(() => subjectMap[config.stream] ?? ['All'])

const currentQ = computed(() => questions.value[currentIdx.value])

const answeredCount = computed(() => Object.keys(answers.value).length)

const result = computed(() => {
  let correct = 0, wrong = 0, skipped = 0
  questions.value.forEach(q => {
    const ans = answers.value[q.id]
    if (ans === undefined) skipped++
    else if (ans === q.correctIndex) correct++
    else wrong++
  })
  const total = questions.value.length
  const raw = correct - (config.negativeMarking ? wrong * 0.25 : 0)
  const score = Math.max(0, Math.round((raw / total) * 100))
  return { correct, wrong, skipped, score }
})

const resultStats = computed(() => [
  { label: 'Correct',  value: result.value.correct,  percent: result.value.correct  / questions.value.length * 100,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M20 6L9 17l-5-5"/></svg>` },
  { label: 'Wrong',    value: result.value.wrong,    percent: result.value.wrong    / questions.value.length * 100,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` },
  { label: 'Skipped',  value: result.value.skipped,  percent: result.value.skipped  / questions.value.length * 100,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/></svg>` },
  { label: 'Accuracy', value: (answeredCount.value ? Math.round(result.value.correct / answeredCount.value * 100) : 0) + '%',
    percent: answeredCount.value ? result.value.correct / answeredCount.value * 100 : 0,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
])

const diffBreakdown = computed(() => {
  const diffs: Record<string, { correct: number; total: number }> = {
    easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 },
  }
  questions.value.forEach(q => {
    diffs[q.difficulty].total++
    if (answers.value[q.id] === q.correctIndex) diffs[q.difficulty].correct++
  })
  return [
    { label: 'Easy',   cls: 'easy',   ...diffs.easy },
    { label: 'Medium', cls: 'medium', ...diffs.medium },
    { label: 'Hard',   cls: 'hard',   ...diffs.hard },
  ]
})

const filteredReview = computed(() => {
  if (reviewFilter.value === 'All') return questions.value
  return questions.value.filter(q => {
    const ans = answers.value[q.id]
    if (reviewFilter.value === 'Correct') return ans === q.correctIndex
    if (reviewFilter.value === 'Wrong')   return ans !== undefined && ans !== q.correctIndex
    if (reviewFilter.value === 'Skipped') return ans === undefined
    return true
  })
})

const avgTimePerQ = computed(() => {
  const elapsed = config.duration * 60 - timeLeft.value
  return answeredCount.value ? Math.round(elapsed / answeredCount.value) : 0
})

// ── Methods ────────────────────────────────────────────────
function autoSetDuration(n: number) {
  if (n <= 10)  config.duration = 10
  else if (n <= 20) config.duration = 20
  else if (n <= 30) config.duration = 30
  else if (n <= 50) config.duration = 45
  else config.duration = 60
}

function buildQuestions(): Question[] {
  let pool = [...questionBank]
  if (config.stream !== 'All') pool = pool.filter(q => q.exam === config.stream)
  if (config.subject !== 'All') pool = pool.filter(q => q.subject === config.subject)

  // Difficulty filter
  if (config.diffMode !== 'mixed') {
    const weights: Record<string, Record<string, number>> = {
      balanced: { easy: 0.3, medium: 0.5, hard: 0.2 },
      easy:     { easy: 0.6, medium: 0.3, hard: 0.1 },
      hard:     { easy: 0.1, medium: 0.3, hard: 0.6 },
    }
  }

  if (config.shuffle) pool = pool.sort(() => Math.random() - 0.5)
  return pool.slice(0, config.count)
}

function startExam() {
  questions.value = buildQuestions()
  if (!questions.value.length) return // no questions for filter
  answers.value = {}
  flagged.value = new Set()
  currentIdx.value = 0
  timeLeft.value = config.duration * 60
  showEndConfirm.value = false
  phase.value = 'exam'
  startTimer()
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timeLeft.value <= 0) {
      clearInterval(timerInterval!)
      submitExam()
    } else {
      timeLeft.value--
    }
  }, 1000)
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function selectAnswer(qId: number, optIdx: number) {
  answers.value = { ...answers.value, [qId]: optIdx }
}

function clearAnswer(qId: number) {
  const a = { ...answers.value }
  delete a[qId]
  answers.value = a
}

function toggleFlag(id: number) {
  const s = new Set(flagged.value)
  s.has(id) ? s.delete(id) : s.add(id)
  flagged.value = s
}

function jumpTo(i: number) { currentIdx.value = i }

function confirmEndExam() { showEndConfirm.value = true }

function submitExam() {
  stopTimer()
  showEndConfirm.value = false
  phase.value = 'results'
}

function formatTime(s: number) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
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

function reviewClass(id: number) {
  const ans = answers.value[id]
  const q = questions.value.find(x => x.id === id)
  if (!q || ans === undefined) return 'skipped'
  return ans === q.correctIndex ? 'correct' : 'wrong'
}

onUnmounted(stopTimer)
</script>

<style scoped>
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

.exam-question-card {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

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

.eq-footer {
  display: flex; align-items: center; gap: 10px;
  padding: 1.2rem 1.6rem;
  border-top: 1px solid var(--border);
}
.nav-btn { font-size: 0.7rem !important; padding: 10px 18px !important; }
.clear-btn {
  font-size: 0.65rem !important; padding: 9px 14px !important;
  margin-left: auto;
}
.submit-btn { font-size: 0.7rem !important; padding: 10px 18px !important; }

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

.rc-answers { display: flex; flex-direction: column; gap: 6px; }
.rc-answer {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 12px; border: 1px solid var(--border);
  font-size: 0.8rem;
}
.rc-answer.correct { border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.05); }
.rc-answer.wrong   { border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.05); }
.rc-answer.skipped { color: var(--gray); }
.rca-label {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--gray); flex-shrink: 0;
}
.rca-text { color: var(--white); }

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
</style>
