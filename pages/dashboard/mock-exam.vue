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
          <!--<div class="past-exams-teaser">
            <span class="teaser-label">Last Attempt</span>
            <span class="teaser-score" :class="scoreClass(lastResult.score)">{{ lastResult.score }}%</span>
            <span class="teaser-meta">{{ lastResult.subject }} · {{ lastResult.date }}</span>
          </div>-->
          <div v-if="lastResult" class="past-exams-teaser">
            <span class="teaser-label">Last Attempt</span>
            <span class="teaser-score" :class="scoreClass(lastResult.score)">{{ lastResult.score }}%</span>
            <span class="teaser-meta">{{ lastResult.subject }} · {{ lastResult.date }}</span>
          </div>

          <div v-else class="past-exams-teaser">
            <span class="teaser-label">No attempts yet</span>
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
                @click="config.stream = s.id; config.subject = 'All'; config.chapter = 'All'; if (['HSC Science','HSC Arts','HSC Commerce','SSC Science', 'SSC Arts', 'SSC Commerce'].includes(s.id)) config.negativeMarking = false"
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
                @click="config.subject = sub; config.chapter = 'All'"
              >{{ sub }}</button>
            </div>
          </div>

          <!-- Chapter — only shown when a specific subject is selected -->
          <div class="config-section chapter-section" v-if="availableChapters.length > 1">
            <div class="config-section-header">
              <span class="csec-tag">03</span>
              <span class="csec-label">Chapter</span>
              <span class="csec-hint">Filter by chapter within {{ config.subject }}</span>
            </div>
            <div class="filter-pills chapter-pills">
              <button
                v-for="ch in availableChapters"
                :key="ch"
                class="filter-pill"
                :class="{ active: config.chapter === ch }"
                @click="config.chapter = ch"
              ><span v-if="ch.name">{{ ch.name }}</span><span v-else>{{ ch }}</span></button>
            </div>
          </div>

          <!-- Question count + Duration -->
          <div class="config-section">
            <div class="config-section-header">
              <span class="csec-tag">{{ availableChapters.length > 1 ? '04' : availableSubjects.length > 1 ? '03' : '02' }}</span>
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
              <span class="csec-tag">{{ availableChapters.length > 1 ? '05' : availableSubjects.length > 1 ? '04' : '03' }}</span>
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
            <label class="toggle-row" v-if="!['HSC','SSC'].includes(config.stream)">
              <span class="toggle-label">Negative Marking (−0.25)</span>
              <button class="toggle-btn" :class="{ on: config.negativeMarking }" @click="config.negativeMarking = !config.negativeMarking">
                <span class="toggle-knob" />
              </button>
            </label>
            <div class="toggle-row toggle-row--disabled" v-else>
              <span class="toggle-label">Negative Marking</span>
              <span class="toggle-na">N/A for {{ config.stream }}</span>
            </div>
          </div>

          <!-- Start CTA -->
          <div class="setup-cta">
            <!--<button class="iso-btn iso-btn--fill start-btn" @click="startExam">
              Start Exam →
            </button>-->
            <button class="iso-btn iso-btn--fill start-btn" @click="startExam" :disabled="isLoadingQuestions">
              {{ isLoadingQuestions ? 'Loading…' : 'Start Exam →' }}
            </button>
            <p v-if="questionLoadError" class="error-text">{{ questionLoadError }}</p>
            <div class="cta-meta">
              <span>{{ config.count }} questions</span>
              <span class="dot-sep">·</span>
              <span>{{ durationOptions.find(d => d.val === config.duration)?.label }}</span>
              <span class="dot-sep">·</span>
              <span>{{ config.stream }}{{ config.subject !== 'All' ? ' / ' + config.subject : '' }}{{ config.chapter !== 'All' ? ' / ' + config.chapter : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Right: info sidebar -->
        <aside class="setup-sidebar">
          <!-- Past results -->
          <div class="info-panel">
            <div class="panel-header">
              <span class="panel-tag">Recent Results</span>
            </div>
            <div class="results-list">
              <!--<div v-for="r in pastResults" :key="r.id" class="result-row">
                <div class="result-left">
                  <span class="result-subject">{{ r.subject }}</span>
                  <span class="result-meta">{{ r.count }}Q · {{ r.date }}</span>
                </div>
                <div class="result-score" :class="scoreClass(r.score)">{{ r.score }}%</div>
              </div>-->

              <div v-if="!pastResults.length" class="result-empty">
                No past exams yet.
              </div>

              <div v-for="r in pastResults" :key="r.id" class="result-row">
                <div class="result-left">
                  <span class="result-subject">{{ r.subject }}</span>
                  <span class="result-meta">{{ r.count }}Q · {{ r.date }}</span>
                </div>
                <div class="result-score" :class="scoreClass(r.score)">{{ r.score }}%</div>
              </div>
            </div>
          </div>

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
          <span class="etb-chip">{{ config.stream }}{{ config.subject !== 'All' ? ' / ' + config.subject : '' }}{{ config.chapter !== 'All' ? ' / ' + config.chapter : '' }}</span>
          <span class="etb-progress">{{ answeredCount }} / {{ questions.length }} answered</span>
        </div>

        <div class="etb-center">
          <!-- Progress bar -->
          <div class="etb-progbar">
            <div class="etb-progbar-fill" :style="{ width: (answeredCount / questions.length * 100) + '%' }" />
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
            @click="scrollToQuestion(i)"
          >{{ i + 1 }}</button>
        </div>
        <div class="palette-legend">
          <span class="leg-item"><span class="leg-dot answered" />Answered</span>
          <span class="leg-item"><span class="leg-dot flagged" />Flagged</span>
          <span class="leg-item"><span class="leg-dot" />Unanswered</span>
        </div>
      </div>

      <!-- Question list (scrollable) -->
      <div class="exam-body">
        <div class="exam-question-list">
          <!-- <div
            v-for="(q, i) in questions"
            :key="q.id"
            :id="`question-${i}`"
            class="exam-question-card"
            :class="{ 'card-flagged': flagged.has(q.id), 'card-answered': answers[q.id] !== undefined }"
          > -->
          <template v-for="group in questionGroups" :key="group.questions[0].id">

          <!-- Stimulus block (shown once for the group) -->
          <div v-if="group.stimulus || group.stimulus_image" class="eq-stimulus-block">
            <p v-if="group.stimulus" class="eq-stimulus-label">{{ group.stimulus[selectedLang] }}</p>
            <img v-if="group.stimulus_image" :src="group.stimulus_image" class="eq-img" alt="Stimulus" />
          </div>
        
          <!-- Questions in this group -->
          <div
            v-for="(q, i) in group.questions"
            :key="q.id"
            :id="`question-${questions.indexOf(q)}`"
            class="exam-question-card"
            :class="{
              'card-flagged': flagged.has(q.id),
              'card-answered': answers[q.id] !== undefined,
              'card-stimulus-child': !!group.stimulus || !!group.stimulus_image
            }"
          >
            <div class="eq-header">
              <div class="eq-meta">
                <span class="eq-num">Q{{ questions.indexOf(q) + 1 }}</span>
                <span class="eq-diff" :class="q.difficulty_level">{{ q.difficulty[selectedLang] }}</span>
                <span class="eq-subject">{{ q.subject[selectedLang] }}</span>
                <span class="eq-chapter">{{ q.chapter[selectedLang] }}</span>
                <span class="eq-chapter">{{ q.years?.[0]?.[selectedLang] }}</span>
              </div>
              <button class="flag-btn" :class="{ active: flagged.has(q.id) }" @click="toggleFlag(q.id)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
                {{ flagged.has(q.id) ? 'Flagged' : 'Flag' }}
              </button>
            </div>
            <div class="eq-body">
              <!-- Stimulus (context passage shown above the question) -->
              <!--<div v-if="q.stimulus || q.stimulus_image" class="eq-stimulus">
                <p class="eq-stimulus-label" v-if="q.stimulus">{{ q.stimulus[selectedLang] }}</p>
                <img v-if="q.stimulus_image" :src="q.stimulus_image" class="eq-img" alt="Stimulus" />
              </div>-->

              <!-- Question text -->
              <p class="eq-text">{{ q.question[selectedLang] }}</p>

              <!-- Question image -->
              <img v-if="q.question_image" :src="q.question_image" class="eq-img" alt="Question diagram" />
            </div>
            <div class="eq-options">
              <button
                v-for="(opt, oi) in q.options[selectedLang]"
                :key="oi"
                class="eq-option"
                :class="{ selected: answers[q.id] === oi }"
                @click="selectAnswer(q.id, oi)"
              >
                <span class="opt-letter">{{ optLetters[oi] }}</span>
                <span class="opt-text">{{ opt }}</span>
                <span v-if="answers[q.id] === oi" class="opt-selected-mark">✓</span>
              </button>
            </div>
            <div class="eq-footer">
              <button class="iso-btn iso-btn--ghost clear-btn" :disabled="answers[q.id] === undefined" @click="clearAnswer(q.id)">Clear Selection</button>
              <span v-if="answers[q.id] !== undefined" class="answered-badge">Answered</span>
            </div>
          </div>
          </template>

          <div class="exam-submit-bar">
            <button class="iso-btn iso-btn--fill submit-end-btn" @click="confirmEndExam">Submit Exam →</button>
            <span class="submit-bar-meta">{{ answeredCount }} / {{ questions.length }} answered</span>
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
                @click="scrollToQuestion(questions.findIndex(q => q.id === id))"
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
              <div v-if="config.negativeMarking" class="nm-active-badge">
                ⚠ Negative marking active · −0.25 per wrong
              </div>
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
              <span class="score-marks">{{ result.marksEarned }} / {{ result.total }} marks</span>
            </div>
          </div>
          <p class="score-sub">{{ result.correct }} correct · {{ result.wrong }} wrong · {{ result.skipped }} skipped out of {{ questions.length }}</p>
          <div v-if="config.negativeMarking && result.deducted > 0" class="neg-mark-notice">
            <span class="nm-icon">−</span>
            <span class="nm-text">{{ result.deducted }} marks deducted for {{ result.wrong }} wrong answer{{ result.wrong !== 1 ? 's' : '' }} (−0.25 each)</span>
          </div>
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

          <!--<div
            v-for="(q, i) in filteredReview"
            :key="q.id"
            class="review-card"
            :class="reviewClass(q.id)"
          >-->
          <template v-for="group in filteredReviewGroups" :key="group.questions[0].id">
          <!-- Stimulus shown once per group -->
          <div v-if="group.stimulus || group.stimulus_image" class="eq-stimulus-block">
            <p v-if="group.stimulus" class="eq-stimulus-label">{{ group.stimulus[selectedLang] }}</p>
            <img v-if="group.stimulus_image" :src="group.stimulus_image" class="eq-img" alt="Stimulus" />
          </div>
        
          <div
            v-for="q in group.questions"
            :key="q.id"
            class="review-card"
            :class="[reviewClass(q.id), { 'card-stimulus-child': !!group.stimulus || !!group.stimulus_image }]"
          >
            <div class="rc-header">
              <div class="rc-meta">
                <span class="rc-status-icon">
                  {{ reviewClass(q.id) === 'correct' ? '✓' : reviewClass(q.id) === 'wrong' ? '✗' : '–' }}
                </span>
                <span class="rc-num">Q{{ questions.indexOf(q) + 1 }}</span>
                <span class="rc-diff" :class="q.difficulty_level">{{ q.difficulty[selectedLang] }}</span>
                <span class="rc-subject">{{ q.subject[selectedLang] }}</span>
                <span class="eq-chapter">{{ q.chapter[selectedLang] }}</span>
                <span class="eq-chapter">{{ q.years?.[0]?.[selectedLang] }}</span>
              </div>
            </div>
            <!-- Stimulus (context passage shown above the question) -->
            <!--<div v-if="q.stimulus || q.stimulus_image" class="eq-stimulus">
              <p class="eq-stimulus-label" v-if="q.stimulus">{{ q.stimulus[selectedLang] }}</p>
              <img v-if="q.stimulus_image" :src="q.stimulus_image" class="eq-img" alt="Stimulus" />
            </div>-->

            <!-- Question text -->
            <p class="rc-question">{{ q.question[selectedLang] }}</p>

            <!-- Question image -->
            <img v-if="q.question_image" :src="q.question_image" class="eq-img" alt="Question diagram" />
            <div class="rc-options">
              <div
                v-for="(opt, oi) in q.options[selectedLang]"
                :key="oi"
                class="rc-option"
                :class="{
                  'rc-correct': oi === q.correct_index,
                  'rc-wrong': oi === answers[q.id] && oi !== q.correct_index,
                  'rc-user': oi === answers[q.id],
                }"
              >
                <span class="rc-opt-letter">{{ optLetters[oi] }}</span>
                <span class="rc-opt-text">{{ opt }}</span>
                <span class="rc-opt-tag">
                  <template v-if="oi === q.correct_index">✓ Correct</template>
                  <template v-else-if="oi === answers[q.id]">✗ Your answer</template>
                </span>
              </div>
              <div v-if="answers[q.id] === undefined" class="rc-skipped-note">— Skipped</div>
            </div>
            <div class="rc-explanation">
              <span class="exp-label">EXPLANATION</span>
              <p class="exp-text">{{ q.explanation[selectedLang] }}</p>
            </div>
          </div>
          </template>
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

  <!-- ── Toast ─────────────────────────────────────────────── -->
  <Teleport to="body">
    <Transition name="toast-slide">
      <div class="admin-toast" :class="toast.type" v-if="toast.show">{{ toast.msg }}</div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
const supabase = useSupabaseClient()
const session = useSupabaseSession()

const { data: profile } = await supabase.from('profiles').select('primary_stream').single()

// ─── Toast ────────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', type: 'success' })
function showToast(msg, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3500)
}

interface Question {
  id: number
  question: string | { english: string; bangla: string }
  question_image?: string | null        // ADD
  stimulus?: { english: string; bangla: string } | null   // ADD
  stimulus_image?: string | null        // ADD
  stimulus_hash?: string | null   // ADD — links questions sharing same stimulus
  options: string[] | { english: string[]; bangla: string[] }
  correct_index: number  // unchanged — index is language-agnostic
  explanation: string | { english: string; bangla: string }
  subject: string | { english: string; bangla: string }
  chapter: string | { english: string; bangla: string }
  exam: string
  difficulty: string | { english: string; bangla: string }
  difficulty_level: 'easy' | 'medium' | 'hard'
  years?: { english: string; bangla: string }[]
}

interface QuestionGroup {
  stimulus?: { english: string; bangla: string } | null
  stimulus_image?: string | null
  questions: Question[]
}

const questionGroups = computed<QuestionGroup[]>(() => {
  const groups: QuestionGroup[] = []
  const stimulusMap = new Map<string, QuestionGroup>()

  for (const q of questions.value) {
    if (q.stimulus_hash) {
      if (stimulusMap.has(q.stimulus_hash)) {
        stimulusMap.get(q.stimulus_hash)!.questions.push(q)
      } else {
        const group: QuestionGroup = {
          stimulus: q.stimulus,
          stimulus_image: q.stimulus_image,
          questions: [q],
        }
        stimulusMap.set(q.stimulus_hash, group)
        groups.push(group)
      }
    } else {
      groups.push({ questions: [q] })
    }
  }

  return groups
})

const filteredReviewGroups = computed(() => {
  const groups: QuestionGroup[] = []
  const stimulusMap = new Map<string, QuestionGroup>()

  for (const q of filteredReview.value) {
    if (q.stimulus_hash) {
      if (stimulusMap.has(q.stimulus_hash)) {
        stimulusMap.get(q.stimulus_hash)!.questions.push(q)
      } else {
        const group: QuestionGroup = {
          stimulus: q.stimulus,
          stimulus_image: q.stimulus_image,
          questions: [q],
        }
        stimulusMap.set(q.stimulus_hash, group)
        groups.push(group)
      }
    } else {
      groups.push({ questions: [q] })
    }
  }

  return groups
})

const { isBn } = useI18n()
let selectedLang = computed(() => isBn.value ? 'bangla' : 'english')

// ── Constants ──────────────────────────────────────────────
const optLetters = ['A', 'B', 'C', 'D', 'E']
let examStreams = []

if (profile?.primary_stream.startsWith('HSC')) {
  examStreams = [
    { id: 'HSC Science', name: 'HSC Science', desc: 'Higher Secondary Science', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="M5.6 5.6l2.1 2.1"/><path d="M16.3 16.3l2.1 2.1"/><path d="M5.6 18.4l2.1-2.1"/><path d="M16.3 7.7l2.1-2.1"/></svg>` },
    { id: 'HSC Arts', name: 'HSC Arts', desc: 'Higher Secondary Arts', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2 4-2 14 0 18"/><path d="M3 12c4-2 14-2 18 0"/><path d="M5 6.5c3 1 11 1 14 0"/><path d="M5 17.5c3-1 11-1 14 0"/></svg>` },
    { id: 'HSC Commerce', name: 'HSC Commerce', desc: 'Higher Secondary Commerce', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8h2v5H7z"/><path d="M11 6h2v7h-2z"/><path d="M15 10h2v3h-2z"/></svg>` },
    { id: 'BUET', name: 'BUET', desc: 'Engineering Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
    { id: 'Medical', name: 'Medical', desc: 'MBBS Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
    { id: 'DU', name: 'DU', desc: 'DU Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/><rect x="9" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/></svg>` },
  ]
} else if (profile?.primary_stream.startsWith('SSC')) {
  examStreams = [
    { id: 'SSC Science', name: 'SSC Science', desc: 'Secondary Certificate Science', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M9 3h6"/><path d="M10 3v6l-5 9a1 1 0 0 0 .9 1.5h12.2a1 1 0 0 0 .9-1.5L14 9V3"/><path d="M8.5 16h7"/></svg>` },
    { id: 'SSC Arts', name: 'SSC Arts', desc: 'Secondary Certificate Arts', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2 4-2 14 0 18"/><path d="M3 12c4-2 14-2 18 0"/><path d="M5 6.5c3 1 11 1 14 0"/><path d="M5 17.5c3-1 11-1 14 0"/></svg>` },
    { id: 'SSC Commerce', name: 'SSC Commerce', desc: 'Secondary Certificate Commerce', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8h2v5H7z"/><path d="M11 6h2v7h-2z"/><path d="M15 10h2v3h-2z"/></svg>` },
  ]
} else if (profile?.primary_stream.startsWith('Admission')) {
  examStreams = [
    { id: 'BUET', name: 'BUET', desc: 'Engineering Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
    { id: 'Medical', name: 'Medical', desc: 'MBBS Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
    { id: 'DU', name: 'DU', desc: 'DU Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/><rect x="9" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/></svg>` },
  ]
} else if (profile?.primary_stream === 'Jobs') {
  examStreams = [
    { id: 'BCS', name: 'BCS', desc: 'Civil Service Exam', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
    { id: 'Bank', name: 'Bank', desc: 'Bank & Govt Jobs', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
    { id: 'NTRCA', name: 'NTRCA', desc: 'Teacher Registration', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="1"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 7h10"/><path d="M7 11h6"/></svg>` },
    { id: 'PSC', name: 'PSC', desc: 'Primary School Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 9v6"/><path d="M22 9v6"/><path d="M6 11.5v5l6 3 6-3v-5"/></svg>` },
    { id: 'POLICE', name: 'Police', desc: 'Police Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 2l2 4h5l-4 3 1.5 5L12 11l-4.5 3L9 9 5 6h5z"/><path d="M12 11v9"/><path d="M9 17h6"/></svg>` },
    { id: 'ARMY', name: 'Army/Defence', desc: 'Defence Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>` },
    { id: 'NAVY', name: 'Navy', desc: 'Navy Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 17l9-14 9 14"/><path d="M3 17c0 0 4 2 9 2s9-2 9-2"/><path d="M12 3v14"/><path d="M7 10h10"/></svg>` },
    { id: 'AIRFORCE', name: 'Air Force', desc: 'Air Force Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M2 12c0 0 4-7 10-7s10 7 10 7"/><path d="M5 12l-3 4h6l4-4"/><path d="M19 12l3 4h-6l-4-4"/><circle cx="12" cy="12" r="2"/></svg>` },
    { id: 'FIRE', name: 'Fire Service', desc: 'Fire Service & Civil Defence', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-4-4-5-4-9z"/><path d="M12 12c0 2-2 2.5-2 4.5a2 2 0 0 0 4 0c0-2-2-2.5-2-4.5z"/></svg>` },
    { id: 'CUSTOMS', name: 'Customs/Tax', desc: 'Customs & Tax Cadre', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M7 15h2"/><path d="M11 15h6"/></svg>` },
    { id: 'RAILWAY', name: 'Railway', desc: 'Railway Job', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="6" y="2" width="12" height="17" rx="2"/><path d="M6 8h12"/><path d="M6 13h12"/><circle cx="9" cy="17" r="1"/><circle cx="15" cy="17" r="1"/><path d="M4 21l2-2"/><path d="M20 21l-2-2"/></svg>` },
    { id: 'TELETALK', name: 'Govt Job', desc: 'General Govt Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>` },
  ]
} else {
  examStreams = [
    { id: 'HSC Science', name: 'HSC Science', desc: 'Higher Secondary Science', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="3"/><path d="M12 2v3"/><path d="M12 19v3"/><path d="M2 12h3"/><path d="M19 12h3"/><path d="M5.6 5.6l2.1 2.1"/><path d="M16.3 16.3l2.1 2.1"/><path d="M5.6 18.4l2.1-2.1"/><path d="M16.3 7.7l2.1-2.1"/></svg>` },
    { id: 'HSC Arts', name: 'HSC Arts', desc: 'Higher Secondary Arts', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2 4-2 14 0 18"/><path d="M3 12c4-2 14-2 18 0"/><path d="M5 6.5c3 1 11 1 14 0"/><path d="M5 17.5c3-1 11-1 14 0"/></svg>` },
    { id: 'HSC Commerce', name: 'HSC Commerce', desc: 'Higher Secondary Commerce', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8h2v5H7z"/><path d="M11 6h2v7h-2z"/><path d="M15 10h2v3h-2z"/></svg>` },
    { id: 'SSC Science', name: 'SSC Science', desc: 'Secondary Certificate Science', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M9 3h6"/><path d="M10 3v6l-5 9a1 1 0 0 0 .9 1.5h12.2a1 1 0 0 0 .9-1.5L14 9V3"/><path d="M8.5 16h7"/></svg>` },
    { id: 'SSC Arts', name: 'SSC Arts', desc: 'Secondary Certificate Arts', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><circle cx="12" cy="12" r="9"/><path d="M12 3c-2 4-2 14 0 18"/><path d="M3 12c4-2 14-2 18 0"/><path d="M5 6.5c3 1 11 1 14 0"/><path d="M5 17.5c3-1 11-1 14 0"/></svg>` },
    { id: 'SSC Commerce', name: 'SSC Commerce', desc: 'Secondary Certificate Commerce', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 8h2v5H7z"/><path d="M11 6h2v7h-2z"/><path d="M15 10h2v3h-2z"/></svg>` },
    { id: 'BUET', name: 'BUET', desc: 'Engineering Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
    { id: 'Medical', name: 'Medical', desc: 'MBBS Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
    { id: 'DU', name: 'DU', desc: 'DU Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/><rect x="9" y="9" width="2" height="2"/><rect x="13" y="9" width="2" height="2"/></svg>` },
    { id: 'BCS', name: 'BCS', desc: 'Civil Service Exam', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
    { id: 'Bank', name: 'Bank', desc: 'Bank & Govt Jobs', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
    { id: 'NTRCA', name: 'NTRCA', desc: 'Teacher Registration', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="3" width="20" height="14" rx="1"/><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 7h10"/><path d="M7 11h6"/></svg>` },
    { id: 'PSC', name: 'PSC', desc: 'Primary School Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 3L2 9l10 6 10-6-10-6z"/><path d="M2 9v6"/><path d="M22 9v6"/><path d="M6 11.5v5l6 3 6-3v-5"/></svg>` },
    { id: 'POLICE', name: 'Police', desc: 'Police Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 2l2 4h5l-4 3 1.5 5L12 11l-4.5 3L9 9 5 6h5z"/><path d="M12 11v9"/><path d="M9 17h6"/></svg>` },
    { id: 'ARMY', name: 'Army/Defence', desc: 'Defence Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z"/></svg>` },
    { id: 'NAVY', name: 'Navy', desc: 'Navy Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M3 17l9-14 9 14"/><path d="M3 17c0 0 4 2 9 2s9-2 9-2"/><path d="M12 3v14"/><path d="M7 10h10"/></svg>` },
    { id: 'AIRFORCE', name: 'Air Force', desc: 'Air Force Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M2 12c0 0 4-7 10-7s10 7 10 7"/><path d="M5 12l-3 4h6l4-4"/><path d="M19 12l3 4h-6l-4-4"/><circle cx="12" cy="12" r="2"/></svg>` },
    { id: 'FIRE', name: 'Fire Service', desc: 'Fire Service & Civil Defence', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M12 2c0 4-4 5-4 9a4 4 0 0 0 8 0c0-4-4-5-4-9z"/><path d="M12 12c0 2-2 2.5-2 4.5a2 2 0 0 0 4 0c0-2-2-2.5-2-4.5z"/></svg>` },
    { id: 'CUSTOMS', name: 'Customs/Tax', desc: 'Customs & Tax Cadre', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M7 15h2"/><path d="M11 15h6"/></svg>` },
    { id: 'RAILWAY', name: 'Railway', desc: 'Railway Job', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="6" y="2" width="12" height="17" rx="2"/><path d="M6 8h12"/><path d="M6 13h12"/><circle cx="9" cy="17" r="1"/><circle cx="15" cy="17" r="1"/><path d="M4 21l2-2"/><path d="M20 21l-2-2"/></svg>` },
    { id: 'TELETALK', name: 'Govt Job', desc: 'General Govt Recruitment', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h10"/><rect x="2" y="3" width="20" height="18" rx="2"/></svg>` },
]
}
//const examStreams = [
//  { id: 'HSC Science', name: 'HSC Science', desc: 'Higher Secondary Science', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
//  { id: 'HSC Arts', name: 'HSC Arts', desc: 'Higher Secondary Arts', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
//  { id: 'HSC Commerce', name: 'HSC Commerce', desc: 'Higher Secondary Commerce', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>` },
//  { id: 'SSC Science', name: 'SSC Science', desc: 'Secondary Certificate Science', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>` },
//  { id: 'SSC Arts', name: 'SSC Arts', desc: 'Secondary Certificate Arts', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>` },
//  { id: 'SSC Commerce', name: 'SSC Commerce', desc: 'Secondary Certificate Commerce', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>` },
//  { id: 'BUET', name: 'BUET', desc: 'Engineering Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>` },
//  { id: 'Medical', name: 'Medical', desc: 'MBBS Admission', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>` },
//  { id: 'BCS', name: 'BCS', desc: 'Civil Service Exam', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>` },
//  //{ id: 'Bank', name: 'Bank', desc: 'Bank & Govt Jobs', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>` },
//]

const subjectMap: Record<string, string[]> = {
  "HSC Science":     ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'English', 'ICT'],
  "HSC Arts":     ['All', 'Bangla', 'English', 'History', 'Geography', 'ICT'],
  "HSC Commerce":     ['All', 'Accounting', 'Finance', 'Business Studies', 'English', 'ICT'],
  "SSC Science":     ['All', 'Physics', 'Chemistry', 'Math', 'Biology', 'English', 'ICT'],
  "SSC Arts":     ['All', 'Bangla', 'English', 'History', 'Geography', 'ICT'],
  "SSC Commerce":     ['All', 'Accounting', 'Finance', 'Business Studies', 'English', 'ICT'],
  BUET:    ['All', 'Physics', 'Chemistry', 'Higher Math'],
  Medical: ['All', 'Biology', 'Chemistry', 'Physics'],
  BCS:     ['All', 'Bangla', 'English', 'Math', 'Bangladesh Affairs', 'General Knowledge'],
  //Bank:    ['All', 'English', 'Math', 'General Knowledge'],
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
//const pastResults = [
//  { id: 1, subject: 'Physics · HSC',    score: 88, count: 30, date: '2h ago' },
//  { id: 2, subject: 'BCS General',      score: 72, count: 50, date: 'Yesterday' },
//  { id: 3, subject: 'Chemistry · HSC',  score: 65, count: 30, date: '2 days ago' },
//  { id: 4, subject: 'Math · HSC',       score: 91, count: 20, date: '4 days ago' },
//]
//
//const lastResult = pastResults[0]

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

// ── Past Results ───────────────────────────────────────────
const pastResults = ref<any[]>([])
const lastResult = computed(() => pastResults.value[0] ?? null)

async function fetchPastResults() {
  if (!session.value) return

  const { data } = await supabase
    .from('exam_results')
    .select('id, subject, stream, score, questions_count, created_at, exam_type')
    .eq('user_id', session.value.user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  pastResults.value = (data ?? []).map(r => ({
    id:      r.id,
    subject: `${r.subject?.english ?? r.subject} · ${r.stream}`,
    score:   r.score,
    count:   r.questions_count,
    date:    timeAgo(r.created_at),
  }))
}

onMounted(fetchPastResults)

// ── State ──────────────────────────────────────────────────
const questionBank = ref<Question[]>([])
const isLoadingQuestions = ref(false)
const questionLoadError = ref('')

// ── State ──────────────────────────────────────────────────
const phase = ref<'setup' | 'exam' | 'results'>('setup')

let streamConfig = ''

if (profile?.primary_stream.startsWith('HSC')) {
  streamConfig = 'HSC Science'
} else if (profile?.primary_stream.startsWith('SSC')) {
  streamConfig = 'SSC Science'
} else if (profile?.primary_stream.startsWith('Admission')) {
  streamConfig = 'BUET'
} else if (profile?.primary_stream === 'Jobs') {
  streamConfig = 'BCS'
} else {
  streamConfig = 'HSC Science'
}

const config = reactive({
  stream: streamConfig,
  subject: 'All',
  chapter: 'All',
  count: 20,
  duration: 20,
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

// Chapters only available when a specific subject is selected (not 'All')
const availableChapters = ref<string[]>([])

//watch([() => config.stream, () => config.subject], async ([stream, subject]) => {
//  if (!stream) return
//  availableChapters.value = []
//
//  const data = await $fetch<string[]>('/api/chapters', {
//    query: {
//      stream,
//      ...(subject !== 'All' && { subject }),
//    }
//  })
//
//  availableChapters.value = data.length ? ['All', ...data] : []
//}, { immediate: false })

watch([() => config.stream, () => config.subject], async ([stream, subject]) => {
  if (!stream) return
  availableChapters.value = []

  try {
    const data = await $fetch<string[]>('/api/chapters', {
      query: {
        stream,
        ...(subject !== 'All' && { subject }),
      }
    })
    availableChapters.value = data.length ? ['All', ...data] : []
  } catch (e) {
    console.error('Failed to load chapters:', e)
    availableChapters.value = []
  }
}, { immediate: false })

//const availableChapters = computed(() => {
//  if (config.subject === 'All') return []
//  const chapters = new Set<string>()
//  questionBank.forEach(q => {
//    if (q.exam === config.stream && getSubjectStr(q) === config.subject) {
//      chapters.add(getChapterStr(q))
//    }
//  })
//  return ['All', ...Array.from(chapters).sort()]
//})

const currentQ = computed(() => questions.value[currentIdx.value])

const answeredCount = computed(() => Object.keys(answers.value).length)

const result = computed(() => {
  let correct = 0, wrong = 0, skipped = 0
  questions.value.forEach(q => {
    const ans = answers.value[q.id]
    if (ans === undefined) skipped++
    else if (ans === q.correct_index) correct++
    else wrong++
  })
  const total = questions.value.length
  const deducted = config.negativeMarking ? wrong * 0.25 : 0
  const raw = correct - deducted
  // Score = (marks earned / total possible marks) * 100
  const score = total > 0 ? Math.max(0, Math.round((raw / total) * 100)) : 0
  // Marks display: show as X.XX out of total
  const marksEarned = Math.max(0, parseFloat(raw.toFixed(2)))
  return { correct, wrong, skipped, score, deducted: parseFloat(deducted.toFixed(2)), marksEarned, total }
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
    diffs[q.difficulty_level].total++
    if (answers.value[q.id] === q.correct_index) diffs[q.difficulty_level].correct++
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
    if (reviewFilter.value === 'Correct') return ans === q.correct_index
    if (reviewFilter.value === 'Wrong')   return ans !== undefined && ans !== q.correct_index
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

function getSubjectStr(q: Question): string {
  return typeof q.subject === 'object' ? (q.subject as any).english : q.subject as string
}
function getChapterStr(q: Question): string {
  return typeof q.chapter === 'object' ? (q.chapter as any).english : q.chapter as string
}

function buildQuestions(): Question[] {
  let pool = [...questionBank.value]
  if (config.stream !== 'All') pool = pool.filter(q => q.exam === config.stream)
  if (config.subject !== 'All') pool = pool.filter(q => getSubjectStr(q) === config.subject)
  if (config.chapter !== 'All') pool = pool.filter(q => getChapterStr(q) === config.chapter)

  // Difficulty mix — actually slice by ratios
  if (config.diffMode !== 'mixed') {
    const weights: Record<string, Record<string, number>> = {
      balanced: { easy: 0.3, medium: 0.5, hard: 0.2 },
      easy:     { easy: 0.6, medium: 0.3, hard: 0.1 },
      hard:     { easy: 0.1, medium: 0.3, hard: 0.6 },
    }
    const w = weights[config.diffMode]
    const easyPool   = pool.filter(q => q.difficultyLevel === 'easy')
    const medPool    = pool.filter(q => q.difficultyLevel === 'medium')
    const hardPool   = pool.filter(q => q.difficultyLevel === 'hard')

    if (config.shuffle) {
      easyPool.sort(() => Math.random() - 0.5)
      medPool.sort(() => Math.random() - 0.5)
      hardPool.sort(() => Math.random() - 0.5)
    }

    const eCount = Math.round(config.count * w.easy)
    const mCount = Math.round(config.count * w.medium)
    const hCount = config.count - eCount - mCount

    const mixed = [
      ...easyPool.slice(0, eCount),
      ...medPool.slice(0, mCount),
      ...hardPool.slice(0, hCount),
    ]
    // If we don't have enough questions from a bucket, fill from the rest
    if (mixed.length < config.count) {
      const usedIds = new Set(mixed.map(q => q.id))
      const remaining = pool.filter(q => !usedIds.has(q.id))
      if (config.shuffle) remaining.sort(() => Math.random() - 0.5)
      mixed.push(...remaining.slice(0, config.count - mixed.length))
    }
    if (config.shuffle) mixed.sort(() => Math.random() - 0.5)
    return mixed.slice(0, config.count)
  }

  if (config.shuffle) pool = pool.sort(() => Math.random() - 0.5)
  return pool.slice(0, config.count)
}

let observer: IntersectionObserver | null = null

async function startExam() {
  isLoadingQuestions.value = true
  questionLoadError.value = ''

  try {
    const data = await $fetch<Question[]>('/api/questions', {
      query: {
        stream: config.stream,
        subject: config.subject !== 'All' ? config.subject : undefined,
        chapter: config.chapter !== 'All' ? config.chapter : undefined,
        difficulty: config.diffMode !== 'mixed' ? config.diffMode : undefined,
        limit: config.count * 3, // fetch 3× so difficulty bucketing has room
      }
    })

    if (!data?.length) {
      questionLoadError.value = 'No questions found for this selection.'
      return
    }

    questionBank.value = data
    questions.value = buildQuestions()       // same buildQuestions(), no other changes needed
    if (!questions.value.length) {
      questionLoadError.value = 'Not enough questions for your filters.'
      return
    }
  } catch (e) {
    questionLoadError.value = 'Failed to load questions.'
    return
  } finally {
    isLoadingQuestions.value = false
  }

  answers.value = {}
  flagged.value = new Set()
  currentIdx.value = 0
  timeLeft.value = config.duration * 60
  showEndConfirm.value = false
  phase.value = 'exam'
  startTimer()
  nextTick(setupObserver)
}

//function startExam() {
//  questions.value = buildQuestions()
//  if (!questions.value.length) return
//  answers.value = {}
//  flagged.value = new Set()
//  currentIdx.value = 0
//  timeLeft.value = config.duration * 60
//  showEndConfirm.value = false
//  phase.value = 'exam'
//  startTimer()
//  nextTick(setupObserver)
//}

function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id // "question-N"
        const idx = parseInt(id.split('-')[1])
        if (!isNaN(idx)) currentIdx.value = idx
      }
    })
  }, { threshold: 0.4 })
  questions.value.forEach((_, i) => {
    const el = document.getElementById(`question-${i}`)
    if (el) observer!.observe(el)
  })
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

function scrollToQuestion(i: number) {
  currentIdx.value = i
  nextTick(() => {
    const el = document.getElementById(`question-${i}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function jumpTo(i: number) { scrollToQuestion(i) }

function confirmEndExam() { showEndConfirm.value = true }

async function saveResult() {
  if (!session.value) return

  const userId = session.value.user.id

  const timeTakenSecs = config.duration * 60 - timeLeft.value

  // 1. Insert into exam_sessions (full detail)
  const { data: sessiond, error: sessionError } = await supabase
    .from('exam_sessions')
    .insert({
      user_id:          userId,
      exam_type:        'mock',
      stream:           config.stream,
      subject:          { english: config.subject, bangla: '' },
      chapter:          { english: config.chapter, bangla: '' },
      diff_mode:        config.diffMode,
      questions_count:  questions.value.length,
      duration_mins:    config.duration,
      shuffle:          config.shuffle,
      negative_marking: config.negativeMarking,
      correct_count:    result.value.correct,
      wrong_count:      result.value.wrong,
      skipped_count:    result.value.skipped,
      score:            result.value.score,
      marks_earned:     result.value.marksEarned,
      duration_taken_mins: Math.max(1, Math.round(timeTakenSecs / 60)),
      question_ids:     questions.value.map(q => q.id),
      submitted_at:     new Date().toISOString(),
      completed_at:     new Date().toISOString(),
    })
    .select('id')
    .single()

  if (sessionError) { console.error(sessionError); return }

  // 2. Insert into exam_results (summary for progress.vue + leaderboard)
  await supabase.from('exam_results').insert({
    user_id:       userId,
    session_id:    sessiond.id,
    title:         `${config.stream} ${config.subject} Mock`,
    subject:       { english: config.subject, bangla: '' },
    chapter:       { english: config.chapter, bangla: '' },
    stream:        config.stream,
    exam_type:     'mock',
    score:         result.value.score,
    marks_earned:  result.value.marksEarned,
    questions_count: questions.value.length,
    correct_count: result.value.correct,
    wrong_count:   result.value.wrong,
    skipped_count: result.value.skipped,
    duration_mins: Math.max(1, Math.round(timeTakenSecs / 60)),
    status:        result.value.score >= 50 ? 'passed' : 'failed',
    difficulty_breakdown: {
      easy:   diffBreakdown.value.find(d => d.cls === 'easy'),
      medium: diffBreakdown.value.find(d => d.cls === 'medium'),
      hard:   diffBreakdown.value.find(d => d.cls === 'hard'),
    },
  })

  // 3. Insert into question_attempts (per-question tracking for question-bank solved badges)
  const attempts = questions.value.map(q => ({
    user_id:        userId,
    question_id:    q.id,
    selected_index: answers.value[q.id] ?? null,
    is_correct:     answers.value[q.id] === q.correct_index ? true
                    : answers.value[q.id] === undefined ? null : false,
    correct_index:  q.correct_index,
    source_type:    'mock',
    source_id:      sessiond.id,
  }))

  await supabase.from('question_attempts').insert(attempts)
}

async function submitExam() {
  stopTimer()
  showEndConfirm.value = false
  phase.value = 'results'
  saveResult()
  showToast("Result saved successfully ✓")
  await fetchPastResults()
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
  return ans === q.correct_index ? 'correct' : 'wrong'
}

onUnmounted(() => { stopTimer(); observer?.disconnect() })
</script>

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
</style>
