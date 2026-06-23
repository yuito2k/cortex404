<template>
  <div class="textbook-page">

    <!-- ══ TOAST ══════════════════════════════════════════════════════ -->
    <Transition name="toast-slide">
      <div v-if="toast.show" class="admin-toast" :class="{ error: toast.isError }">
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- ══ HEADER (hidden during active exam) ════════════════════════ -->
    <template v-if="phase !== 'exam'">
      <div class="tb-header">
        <div class="header-left">
          <div class="page-chip"><span class="chip-dot" /> Textbook</div>
          <h1 class="page-title">Study from<br><span class="text-outline">Your Book.</span></h1>
          <p class="page-sub">Pick a textbook and practice questions from it — as a timed mock exam or an open question bank.</p>
        </div>
        <div class="header-right">
          <div class="tb-stat-card">
            <span class="tsc-label">Questions sourced from</span>
            <span class="tsc-value">{{ textBooks.length }}</span>
            <span class="tsc-sub">Bangladesh textbooks</span>
          </div>
        </div>
      </div>

      <!-- ══ SECTION 01 — MODE ══════════════════════════════════════ -->
      <div class="config-block">
        <div class="config-section-header">
          <span class="csec-tag">01</span>
          <span class="csec-label">Select Mode</span>
        </div>
        <div class="mode-grid">
          <button
            class="mode-card"
            :class="{ active: mode === 'mock' }"
            @click="mode = 'mock'"
          >
            <span class="mode-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </span>
            <span class="mode-name">Mock Test</span>
            <span class="mode-desc">Timed exam with score &amp; review</span>
            <span v-if="mode === 'mock'" class="mode-check">✓</span>
          </button>
          <button
            class="mode-card"
            :class="{ active: mode === 'qbank' }"
            @click="mode = 'qbank'"
          >
            <span class="mode-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="22" height="22">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </span>
            <span class="mode-name">Question Bank</span>
            <span class="mode-desc">Browse &amp; drill questions freely</span>
            <span v-if="mode === 'qbank'" class="mode-check">✓</span>
          </button>
        </div>
      </div>

      <!-- ══ SECTION 02 — STREAM ═══════════════════════════════════ -->
      <div class="config-block">
        <div class="config-section-header">
          <span class="csec-tag">02</span>
          <span class="csec-label">Select Stream</span>
          <span v-if="selectedStream" class="csec-hint">
            <span class="sh-dot" />{{ selectedStream }}
          </span>
        </div>
        <div class="stream-grid">
          <button
            v-for="s in examStreams"
            :key="s.id"
            class="stream-card"
            :class="{ active: selectedStream === s.id, 'no-books': !subjectsForStream(s.id).length }"
            @click="onStreamSelect(s.id)"
          >
            <span class="stream-icon" v-html="s.icon" />
            <span class="stream-name">{{ s.name }}</span>
            <span class="stream-desc">{{ s.desc }}</span>
            <span v-if="!subjectsForStream(s.id).length" class="stream-no-books">No textbooks</span>
            <span v-if="selectedStream === s.id" class="stream-check">✓</span>
          </button>
        </div>
      </div>

      <!-- ══ SECTION 03 — SUBJECT ═══════════════════════════════════ -->
      <div v-if="selectedStream && subjectsForStream(selectedStream).length" class="config-block">
        <div class="config-section-header">
          <span class="csec-tag">03</span>
          <span class="csec-label">Select Subject</span>
          <span v-if="selectedSubject" class="csec-hint">
            <span class="sh-dot" />{{ selectedSubject }}
          </span>
        </div>
        <div class="subject-pills-wrap">
          <button
            v-for="subj in subjectsForStream(selectedStream)"
            :key="subj"
            class="subject-pill"
            :class="{ active: selectedSubject === subj }"
            @click="onSubjectSelect(subj)"
          >
            <span class="sp-icon" v-html="subjectIcon(subj)" />
            <span class="sp-label">{{ subj }}</span>
            <span class="sp-count">{{ (subjectToBooks[subj] || []).length }} books</span>
            <span v-if="selectedSubject === subj" class="sp-check">✓</span>
          </button>
        </div>
      </div>

      <div v-else-if="selectedStream && !subjectsForStream(selectedStream).length" class="config-block no-books-block">
        <div class="config-section-header">
          <span class="csec-tag">03</span>
          <span class="csec-label">No Textbooks Available</span>
        </div>
        <div class="no-books-msg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="28" height="28">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>No textbook questions are available for <strong>{{ selectedStream }}</strong> yet.</p>
          <p class="nb-sub">Try HSC Science, BUET or Medical for the best coverage.</p>
        </div>
      </div>

      <!-- ══ SECTION 04 — TEXTBOOK ══════════════════════════════════ -->
      <div v-if="selectedSubject && booksForSelectedSubject.length" class="config-block">
        <div class="config-section-header">
          <span class="csec-tag">04</span>
          <span class="csec-label">Select Textbook</span>
          <span v-if="selectedBook" class="csec-hint selected-hint">
            <span class="sh-dot" />{{ selectedBook }}
          </span>
        </div>
        <div class="book-grid book-grid--standalone">
          <button
            v-for="book in booksForSelectedSubject"
            :key="book"
            class="book-card"
            :class="{ active: selectedBook === book }"
            @click="onBookSelect(book)"
          >
            <span class="book-subject-tag">{{ getSubjectPrefix(book) }}</span>
            <span v-if="book.includes('Paper')" class="book-paper">{{ getPaper(book) }}</span>
            <span class="book-author">{{ getAuthor(book) }}</span>
            <span v-if="selectedBook === book" class="book-check">✓</span>
          </button>
        </div>
      </div>

      <!-- ══ MOCK TEST SETUP (only when mock mode + book selected) ══ -->
      <template v-if="mode === 'mock' && selectedBook && phase === 'setup'">
        <div class="config-block">

          <!-- Chapter -->
          <div class="config-section" v-if="availableChapters.length > 1">
            <div class="config-section-header">
              <span class="csec-tag">05</span>
              <span class="csec-label">Chapter</span>
              <span class="csec-hint">Filter by chapter</span>
            </div>
            <div class="filter-pills chapter-pills">
              <button
                v-for="ch in availableChapters"
                :key="ch"
                class="filter-pill"
                :class="{ active: config.chapter === ch }"
                @click="config.chapter = ch"
              >{{ ch }}</button>
            </div>
          </div>

          <!-- Q Count + Duration -->
          <div class="config-section">
            <div class="config-section-header">
              <span class="csec-tag">{{ availableChapters.length > 1 ? '06' : '05' }}</span>
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

          <!-- Difficulty Mix -->
          <div class="config-section">
            <div class="config-section-header">
              <span class="csec-tag">{{ availableChapters.length > 1 ? '07' : '06' }}</span>
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
                  <div class="diff-bar easy" :style="{ height: d.easy + 'px' }" />
                  <div class="diff-bar med"  :style="{ height: d.med  + 'px' }" />
                  <div class="diff-bar hard" :style="{ height: d.hard + 'px' }" />
                </div>
              </button>
            </div>
          </div>

          <!-- Toggles -->
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
            <button class="iso-btn iso-btn--fill start-btn" @click="startExam" :disabled="isLoadingQuestions">
              {{ isLoadingQuestions ? 'Loading…' : 'Start Exam →' }}
            </button>
            <p v-if="questionLoadError" class="error-text">{{ questionLoadError }}</p>
            <div class="cta-meta">
              <span>{{ config.count }} questions</span>
              <span class="dot-sep">·</span>
              <span>{{ durationOptions.find(d => d.val === config.duration)?.label }}</span>
              <span class="dot-sep">·</span>
              <span>{{ selectedBook }}{{ config.chapter !== 'All' ? ' / ' + config.chapter : '' }}</span>
            </div>
          </div>
        </div>
      </template>

      <!-- ══ QBANK FILTERS (only when qbank mode + book selected) ══ -->
      <template v-if="mode === 'qbank' && selectedBook">
        <div class="filter-bar">
          <!-- Search -->
          <div class="filter-search">
            <span class="search-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </span>
            <input
              v-model="searchQuery"
              class="form-input search-input"
              placeholder="Search questions, topics, keywords..."
              @input="onSearch"
            />
            <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''; onSearch()">×</button>
          </div>

          <!-- Filters row -->
          <div class="filters-row">
            <!-- Chapter -->
            <div class="filter-group" v-if="qbChapters.length">
              <label class="form-label">Chapter</label>
              <div class="filter-pills">
                <button
                  class="filter-pill"
                  :class="{ active: qbSelectedChapter === '' }"
                  @click="qbFilterByChapter('')"
                >All</button>
                <button
                  v-for="ch in qbChapters"
                  :key="ch.name"
                  class="filter-pill"
                  :class="{ active: qbSelectedChapter === ch.name }"
                  @click="qbFilterByChapter(ch.name)"
                >{{ ch.name }} <span class="pill-count">{{ ch.count }}</span></button>
              </div>
            </div>

            <!-- Difficulty -->
            <div class="filter-group">
              <label class="form-label">Difficulty</label>
              <div class="filter-pills">
                <button
                  v-for="d in difficulties"
                  :key="d.val"
                  class="filter-pill diff-pill"
                  :class="{ active: qbSelectedDiff === d.val, [d.cls]: true }"
                  @click="qbSelectDiff(d.val)"
                >{{ d.label }}</button>
              </div>
            </div>

            <!-- Sort + Reset -->
            <div class="filter-group filter-actions">
              <label class="form-label">Sort</label>
              <div class="filter-pills">
                <button
                  v-for="s in sortOptions"
                  :key="s.val"
                  class="filter-pill"
                  :class="{ active: qbSortBy === s.val }"
                  @click="qbSortBy = s.val; qbApplyFilters()"
                >{{ s.label }}</button>
              </div>
              <button class="iso-btn iso-btn--ghost reset-btn" @click="qbResetFilters">Reset</button>
            </div>
          </div>

          <!-- Active filter tags + count -->
          <div class="filter-status">
            <span class="result-count">
              <span class="count-num">{{ qbFiltered.length }}</span>
              <span class="count-label">questions found</span>
            </span>
            <div class="active-tags">
              <span v-if="qbSelectedChapter" class="active-tag">
                {{ qbSelectedChapter }}
                <button @click="qbSelectedChapter = ''; qbApplyFilters()">×</button>
              </span>
              <span v-if="qbSelectedDiff !== 'all'" class="active-tag">
                {{ qbSelectedDiff }}
                <button @click="qbSelectedDiff = 'all'; qbApplyFilters()">×</button>
              </span>
              <span v-if="searchQuery" class="active-tag">
                "{{ searchQuery }}"
                <button @click="searchQuery = ''; qbApplyFilters()">×</button>
              </span>
            </div>
          </div>
        </div>

        <!-- Question Bank Body -->
        <div class="qbank-body">
          <div class="question-list">

            <!-- Loading skeleton -->
            <template v-if="qbLoading">
              <div v-for="i in 5" :key="i" class="question-skeleton" :style="{ animationDelay: i * 0.07 + 's' }" />
            </template>

            <template v-else>
              <!-- Empty state -->
              <div v-if="!qbPaginated.length" class="empty-state">
                <div class="empty-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" width="36" height="36">
                    <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                    <path d="M11 8v3M11 14h.01"/>
                  </svg>
                </div>
                <span class="empty-title">No questions found.</span>
                <span class="empty-sub">Try broadening your filters or selecting a different textbook.</span>
                <button class="iso-btn iso-btn--ghost" @click="qbResetFilters">Reset Filters</button>
              </div>

              <!-- Question cards -->
              <template v-for="group in qbPaginatedGroups" :key="group.questions[0].id">
                <div v-if="group.stimulus || group.stimulus_image" class="eq-stimulus-block">
                  <p v-if="group.stimulus" class="eq-stimulus-label" v-html="renderLatexText(group.stimulus[selectedLang])" />
                  <img v-if="group.stimulus_image" :src="group.stimulus_image" class="eq-img" alt="Stimulus" />
                </div>

                <div
                  v-for="(q, i) in group.questions"
                  :key="q.id"
                  class="question-card"
                  :id="`q-${q.id}`"
                  :class="{
                    expanded: qbExpandedId === q.id,
                    solved: qbSolvedIds.has(q.id),
                    wrong: qbWrongIds.has(q.id),
                    'card-stimulus-child': !!group.stimulus || !!group.stimulus_image
                  }"
                  :style="{ animationDelay: i * 0.04 + 's' }"
                >
                  <!-- Card header -->
                  <div class="qcard-header" @click="qbToggleExpand(q.id)">
                    <div class="qcard-meta">
                      <span class="q-index">#{{ (qbCurrentPage - 1) * qbPageSize + qbPaginated.indexOf(q) + 1 }}</span>
                      <span class="q-diff-badge" :class="q.difficulty_level">{{ q.difficulty[selectedLang] }}</span>
                      <span class="q-subject-tag">{{ q.subject[selectedLang] }}</span>
                      <span class="q-chapter-tag">{{ q.chapter[selectedLang] }}</span>
                      <span v-if="q.years?.length" class="q-year-tag">{{ q.years[0][selectedLang] }}</span>
                    </div>
                    <div class="qcard-actions">
                      <span v-if="qbSolvedIds.has(q.id) && !qbWrongIds.has(q.id)" class="solved-badge">✓ Solved</span>
                      <span v-if="qbWrongIds.has(q.id)" class="wrong-badge">✗ Wrong</span>
                      <span v-if="qbBookmarkedIds.has(q.id)" class="bookmark-active">
                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="14" height="14">
                          <path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3.5L6 21V4a1 1 0 0 1 1-1z"/>
                        </svg>
                      </span>
                      <button class="expand-toggle">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                          <polyline :points="qbExpandedId === q.id ? '18 15 12 9 6 15' : '6 9 12 15 18 9'" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Question text preview -->
                  <div class="qcard-body" @click="qbToggleExpand(q.id)">
                    <p class="q-preview" v-html="renderLatexText(q.question[selectedLang])" />
                  </div>

                  <!-- Expanded content -->
                  <div v-if="qbExpandedId === q.id" class="qcard-expanded">
                    <div v-if="q.stimulus || q.stimulus_image" class="eq-stimulus">
                      <span class="eq-stimulus-label">Context</span>
                      <p v-if="q.stimulus" v-html="renderLatexText(q.stimulus[selectedLang])" />
                      <img v-if="q.stimulus_image" :src="q.stimulus_image" class="eq-img" alt="Stimulus" />
                    </div>

                    <p class="q-full-text" v-html="renderLatexText(q.question[selectedLang])" />
                    <img v-if="q.question_image" :src="q.question_image" class="eq-img" alt="Question diagram" />

                    <div class="options-list">
                      <button
                        v-for="(opt, oi) in q.options[selectedLang]"
                        :key="oi"
                        class="option-btn"
                        :class="{
                          selected: qbSelectedAnswers[q.id] === oi,
                          correct: qbShowAnswer[q.id] && oi === q.correct_index,
                          wrong: qbShowAnswer[q.id] && qbSelectedAnswers[q.id] === oi && oi !== q.correct_index,
                        }"
                        @click="qbSelectAnswer(q.id, oi)"
                      >
                        <span class="opt-letter">{{ optLetters[oi] }}</span>
                        <span class="opt-text" v-html="renderLatexText(opt)" />
                        <span v-if="qbShowAnswer[q.id] && oi === q.correct_index" class="opt-check">✓</span>
                        <span v-if="qbShowAnswer[q.id] && qbSelectedAnswers[q.id] === oi && oi !== q.correct_index" class="opt-x">✗</span>
                      </button>
                    </div>

                    <div class="qcard-footer">
                      <div class="footer-left">
                        <div v-if="qbShowAnswer[q.id] && q.explanation" class="explanation-block">
                          <span class="exp-label">EXPLANATION</span>
                          <p class="exp-text" v-html="renderLatexText(q.explanation[selectedLang])" />
                        </div>
                      </div>
                      <div class="footer-right">
                        <button
                          class="action-icon-btn"
                          :class="{ active: qbBookmarkedIds.has(q.id) }"
                          @click="qbToggleBookmark(q.id)"
                          title="Bookmark"
                        >
                          <svg viewBox="0 0 24 24" :fill="qbBookmarkedIds.has(q.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.5" width="14" height="14">
                            <path d="M5 3h14a1 1 0 0 1 1 1v17l-7-3.5L6 21V4a1 1 0 0 1 1-1z"/>
                          </svg>
                        </button>
                        <button
                          v-if="!qbShowAnswer[q.id]"
                          class="iso-btn iso-btn--ghost reveal-btn"
                          @click="qbRevealAnswer(q.id)"
                        >Reveal Answer</button>
                        <button
                          class="iso-btn iso-btn--ghost next-btn"
                          @click="qbNextQuestion(qbPaginated.indexOf(q))"
                        >Next →</button>
                      </div>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Pagination -->
              <div v-if="qbTotalPages > 1" class="pagination">
                <button class="iso-btn iso-btn--ghost page-btn" :disabled="qbCurrentPage === 1" @click="qbGotoPage(qbCurrentPage - 1)">← Prev</button>
                <div class="page-numbers">
                  <button
                    v-for="p in qbVisiblePages"
                    :key="p"
                    class="page-num"
                    :class="{ active: p === qbCurrentPage, ellipsis: p === '…' }"
                    :disabled="p === '…'"
                    @click="typeof p === 'number' && qbGotoPage(p)"
                  >{{ p }}</button>
                </div>
                <button class="iso-btn iso-btn--ghost page-btn" :disabled="qbCurrentPage === qbTotalPages" @click="qbGotoPage(qbCurrentPage + 1)">Next →</button>
              </div>
            </template>
          </div>

          <!-- Sidebar -->
          <aside class="qbank-sidebar">
            <!-- Session stats -->
            <div class="side-panel">
              <div class="panel-header">
                <span class="panel-tag">Session Stats</span>
                <button class="iso-btn iso-btn--ghost mini-btn" @click="qbResetSession">Reset</button>
              </div>
              <div class="session-stats">
                <div class="sess-stat">
                  <span class="sess-val">{{ qbSessionStats.attempted }}</span>
                  <span class="sess-label">Attempted</span>
                </div>
                <div class="sess-stat">
                  <span class="sess-val correct-val">{{ qbSessionStats.correct }}</span>
                  <span class="sess-label">Correct</span>
                </div>
                <div class="sess-stat">
                  <span class="sess-val wrong-val">{{ qbSessionStats.wrong }}</span>
                  <span class="sess-label">Wrong</span>
                </div>
                <div class="sess-stat">
                  <span class="sess-val">{{ qbSessionAccuracy }}%</span>
                  <span class="sess-label">Accuracy</span>
                </div>
              </div>
              <div class="accuracy-bar-wrap">
                <div class="accuracy-bar-fill" :style="{ width: qbSessionAccuracy + '%' }" />
              </div>
            </div>

            <!-- Bookmarked -->
            <div class="side-panel">
              <div class="panel-header">
                <span class="panel-tag">Bookmarks</span>
                <span class="panel-count">{{ qbBookmarkedIds.size }}</span>
              </div>
              <div v-if="!qbBookmarkedIds.size" class="side-empty">No bookmarks yet.</div>
              <div v-else class="bookmark-list">
                <button
                  v-for="q in qbBookmarkedQuestions.slice(0, 5)"
                  :key="q.id"
                  class="bookmark-row"
                  @click="qbJumpToQuestion(q.id)"
                >
                  <span class="bm-hash">#{{ q.id }}</span>
                  <span class="bm-text">{{ typeof q.question === 'object' ? q.question[selectedLang] : q.question }}</span>
                </button>
                <div v-if="qbBookmarkedIds.size > 5" class="bm-more">+{{ qbBookmarkedIds.size - 5 }} more</div>
              </div>
            </div>

            <!-- Quick Actions -->
            <div class="side-panel">
              <div class="panel-header"><span class="panel-tag">Quick Actions</span></div>
              <div class="qa-list">
                <button class="qa-item" @click="mode = 'mock'; phase = 'setup'">
                  <span class="qa-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </span>
                  <div class="qa-text">
                    <span class="qa-title">Start Mock Test</span>
                    <span class="qa-sub">Switch to timed exam mode</span>
                  </div>
                  <span class="qa-arrow">→</span>
                </button>
                <button class="qa-item" @click="qbSelectedDiff = 'hard'; qbApplyFilters()">
                  <span class="qa-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                    </svg>
                  </span>
                  <div class="qa-text">
                    <span class="qa-title">Hard Questions</span>
                    <span class="qa-sub">Filter hardest only</span>
                  </div>
                  <span class="qa-arrow">→</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </template>
    </template>

    <!-- ══ PHASE: EXAM ════════════════════════════════════════════ -->
    <template v-if="mode === 'mock' && phase === 'exam'">

      <!-- Topbar -->
      <div class="exam-topbar">
        <div class="etb-left">
          <span class="etb-chip">{{ selectedBook }}{{ config.chapter !== 'All' ? ' / ' + config.chapter : '' }}</span>
          <span class="etb-progress">{{ answeredCount }} / {{ questions.length }} answered</span>
        </div>
        <div class="etb-center">
          <div class="etb-progbar">
            <div class="etb-progbar-fill" :style="{ width: (answeredCount / questions.length * 100) + '%' }" />
          </div>
        </div>
        <div class="etb-right">
          <div v-if="config.showTimer" class="timer-display" :class="{ warning: timeLeft < 120, critical: timeLeft < 30 }">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ formatTime(timeLeft) }}
          </div>
          <button class="iso-btn iso-btn--ghost end-btn" @click="confirmEndExam">End Exam</button>
        </div>
      </div>

      <!-- Question palette -->
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

      <!-- Exam body -->
      <div class="exam-body">
        <div class="exam-question-list">
          <template v-for="group in questionGroups" :key="group.questions[0].id">
            <div v-if="group.stimulus || group.stimulus_image" class="eq-stimulus-block">
              <p v-if="group.stimulus" v-html="renderLatexText(group.stimulus[selectedLang])" class="eq-stimulus-label" />
              <img v-if="group.stimulus_image" :src="group.stimulus_image" class="eq-img" alt="Stimulus" />
            </div>

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
                <p class="eq-text" v-html="renderLatexText(q.question[selectedLang])" />
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
                  <span class="opt-text" v-html="renderLatexText(opt)" />
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

        <!-- Exam sidebar -->
        <aside class="exam-sidebar">
          <div class="side-panel">
            <div class="panel-header"><span class="panel-tag">Progress</span></div>
            <div class="exam-progress-stats">
              <div class="ep-stat"><span class="ep-val">{{ answeredCount }}</span><span class="ep-label">Answered</span></div>
              <div class="ep-stat"><span class="ep-val">{{ questions.length - answeredCount }}</span><span class="ep-label">Remaining</span></div>
              <div class="ep-stat"><span class="ep-val">{{ flagged.size }}</span><span class="ep-label">Flagged</span></div>
            </div>
            <div class="ep-bar-wrap">
              <div class="ep-bar-fill" :style="{ width: (answeredCount / questions.length * 100) + '%' }" />
            </div>
          </div>

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
                <span class="fi-text">{{ getQText(questions.find(q => q.id === id)).slice(0, 50) }}…</span>
              </button>
            </div>
          </div>

          <div class="side-panel submit-panel">
            <div class="panel-header"><span class="panel-tag">Ready?</span></div>
            <div class="submit-info">
              <p class="submit-desc">
                {{ answeredCount }} of {{ questions.length }} answered.
                {{ questions.length - answeredCount > 0 ? (questions.length - answeredCount) + ' unanswered will be skipped.' : 'All answered!' }}
              </p>
              <div v-if="config.negativeMarking" class="nm-active-badge">⚠ Negative marking active · −0.25 per wrong</div>
              <button class="iso-btn iso-btn--fill iso-btn--full" @click="confirmEndExam">Submit Exam →</button>
            </div>
          </div>
        </aside>
      </div>

      <!-- End confirm modal -->
      <Transition name="modal-fade">
        <div v-if="showEndConfirm" class="modal-overlay" @click.self="showEndConfirm = false">
          <div class="modal-box">
            <div class="modal-header"><span class="modal-tag">Confirm Submission</span></div>
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
    <template v-if="mode === 'mock' && phase === 'results'">

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
          <p class="score-sub">{{ result.correct }} correct · {{ result.wrong }} wrong · {{ result.skipped }} skipped</p>
          <div v-if="config.negativeMarking && result.deducted > 0" class="neg-mark-notice">
            <span class="nm-icon">−</span>
            <span class="nm-text">{{ result.deducted }} marks deducted for {{ result.wrong }} wrong answer{{ result.wrong !== 1 ? 's' : '' }}</span>
          </div>
          <div class="results-book-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            {{ selectedBook }}
          </div>
        </div>
        <div class="rh-right">
          <div class="result-actions">
            <button class="iso-btn iso-btn--fill" @click="phase = 'setup'">New Exam →</button>
            <button class="iso-btn iso-btn--ghost" @click="mode = 'qbank'">Browse Questions</button>
          </div>
        </div>
      </div>

      <div class="result-stats-row">
        <div v-for="s in resultStats" :key="s.label" class="rstat">
          <span class="rstat-icon" v-html="s.icon" />
          <span class="rstat-value">{{ s.value }}</span>
          <span class="rstat-label">{{ s.label }}</span>
          <div class="rstat-bar"><div class="rstat-bar-fill" :style="{ width: s.percent + '%' }" /></div>
        </div>
      </div>

      <div class="results-body">
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

          <template v-for="group in filteredReviewGroups" :key="group.questions[0].id">
            <div v-if="group.stimulus || group.stimulus_image" class="eq-stimulus-block">
              <p v-if="group.stimulus" class="eq-stimulus-label" v-html="renderLatexText(group.stimulus[selectedLang])" />
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
                </div>
              </div>
              <p class="rc-question" v-html="renderLatexText(q.question[selectedLang])" />
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
                  <span class="rc-opt-text" v-html="renderLatexText(opt)" />
                  <span class="rc-opt-tag">
                    <template v-if="oi === q.correct_index">✓ Correct</template>
                    <template v-else-if="oi === answers[q.id]">✗ Your answer</template>
                  </span>
                </div>
                <div v-if="answers[q.id] === undefined" class="rc-skipped-note">— Skipped</div>
              </div>
              <div class="rc-explanation" v-if="q.explanation">
                <span class="exp-label">EXPLANATION</span>
                <p class="exp-text" v-html="renderLatexText(q.explanation[selectedLang])" />
              </div>
            </div>
          </template>
        </div>

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
              <div class="ts-row"><span class="ts-label">Duration Used</span><span class="ts-val">{{ formatTime(config.duration * 60 - timeLeft) }}</span></div>
              <div class="ts-row"><span class="ts-label">Avg per Question</span><span class="ts-val">{{ avgTimePerQ }}s</span></div>
              <div class="ts-row"><span class="ts-label">Time Remaining</span><span class="ts-val">{{ formatTime(timeLeft) }}</span></div>
            </div>
          </div>

          <!-- Next steps -->
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
                  <span class="qa-sub">Same book, new shuffle</span>
                </div>
                <span class="qa-arrow">→</span>
              </button>
              <button class="qa-item" @click="mode = 'qbank'">
                <span class="qa-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </span>
                <div class="qa-text">
                  <span class="qa-title">Browse Questions</span>
                  <span class="qa-sub">Same textbook, open drill</span>
                </div>
                <span class="qa-arrow">→</span>
              </button>
            </div>
          </div>
        </aside>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })
import { renderLatexText } from '~/utils/renderLatex'

const supabase = useSupabaseClient()
const session  = useSupabaseSession()
const userID   = useSupabaseUser()

const { isBn } = useI18n()
const selectedLang = computed(() => isBn.value ? 'bangla' : 'english')

// ── Types ──────────────────────────────────────────────────
interface Question {
  id: number
  question: { english: string; bangla: string }
  question_image?: string | null
  stimulus?: { english: string; bangla: string } | null
  stimulus_image?: string | null
  stimulus_hash?: string | null
  options: { english: string[]; bangla: string[] }
  correct_index: number
  explanation: { english: string; bangla: string }
  subject: { english: string; bangla: string }
  chapter: { english: string; bangla: string }
  exam: string
  text_book?: string | null
  difficulty: { english: string; bangla: string }
  difficulty_level: 'easy' | 'medium' | 'hard'
  years?: { english: string; bangla: string }[]
}

interface QuestionGroup {
  stimulus?: { english: string; bangla: string } | null
  stimulus_image?: string | null
  questions: Question[]
}

// ── Textbook data ──────────────────────────────────────────
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

// ── Exam streams ───────────────────────────────────────────
const examStreams = [
  {
    id: 'HSC Science',
    name: 'HSC Science',
    desc: 'Higher Secondary · Science',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>`,
  },
  {
    id: 'HSC Arts',
    name: 'HSC Arts',
    desc: 'Higher Secondary · Humanities',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>`,
  },
  {
    id: 'HSC Commerce',
    name: 'HSC Commerce',
    desc: 'Higher Secondary · Business',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  {
    id: 'SSC Science',
    name: 'SSC Science',
    desc: 'Secondary · Science',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/></svg>`,
  },
  {
    id: 'Medical',
    name: 'Medical',
    desc: 'MBBS · BDS Admission',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  },
  {
    id: 'BUET',
    name: 'BUET',
    desc: 'Engineering Admission',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`,
  },
  {
    id: 'DU',
    name: 'DU',
    desc: 'Dhaka University Admission',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  {
    id: 'BCS',
    name: 'BCS',
    desc: 'Civil Service Exam',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="18" height="18"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
  },
]

// ── Stream → Subject mapping ────────────────────────────────
const streamToSubjectsMap: Record<string, string[]> = {
  'HSC Science': [
    'Mathematics 1st Paper', 'Mathematics 2nd Paper',
    'Physics 1st Paper',     'Physics 2nd Paper',
    'Chemistry 1st Paper',   'Chemistry 2nd Paper',
    'Botany', 'Zoology', 'ICT',
  ],
  'HSC Arts':    [],
  'HSC Commerce':[],
  'SSC Science': [
    'Mathematics 1st Paper', 'Mathematics 2nd Paper',
    'Physics 1st Paper',     'Physics 2nd Paper',
    'Chemistry 1st Paper',   'Chemistry 2nd Paper',
    'Botany', 'Zoology', 'ICT',
  ],
  'Medical': [
    'Physics 1st Paper', 'Physics 2nd Paper',
    'Chemistry 1st Paper', 'Chemistry 2nd Paper',
    'Botany', 'Zoology',
  ],
  'BUET': [
    'Mathematics 1st Paper', 'Mathematics 2nd Paper',
    'Physics 1st Paper',     'Physics 2nd Paper',
    'Chemistry 1st Paper',   'Chemistry 2nd Paper',
  ],
  'DU': [
    'Mathematics 1st Paper', 'Mathematics 2nd Paper',
    'Physics 1st Paper',     'Physics 2nd Paper',
    'Chemistry 1st Paper',   'Chemistry 2nd Paper',
    'Botany', 'Zoology', 'ICT',
  ],
  'BCS': [],
}

// ── Subject → Books mapping ─────────────────────────────────
const subjectToBooks: Record<string, string[]> = {
  'Mathematics 1st Paper': textBooks.filter(b => b.startsWith('Mathematics 1st Paper')),
  'Mathematics 2nd Paper': textBooks.filter(b => b.startsWith('Mathematics 2nd Paper')),
  'Physics 1st Paper':     textBooks.filter(b => b.startsWith('Physics 1st Paper')),
  'Physics 2nd Paper':     textBooks.filter(b => b.startsWith('Physics 2nd Paper')),
  'Chemistry 1st Paper':   textBooks.filter(b => b.startsWith('Chemistry 1st Paper')),
  'Chemistry 2nd Paper':   textBooks.filter(b => b.startsWith('Chemistry 2nd Paper')),
  'Botany':                textBooks.filter(b => b.startsWith('Botany')),
  'Zoology':               textBooks.filter(b => b.startsWith('Zoology')),
  'ICT':                   textBooks.filter(b => b.startsWith('ICT')),
}

function subjectsForStream(streamId: string): string[] {
  return (streamToSubjectsMap[streamId] ?? []).filter(s => (subjectToBooks[s] ?? []).length > 0)
}

function subjectIcon(subj: string): string {
  if (subj.startsWith('Math'))     return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M12 4v16M4 12h16"/></svg>`
  if (subj.startsWith('Physics'))  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`
  if (subj.startsWith('Chem'))     return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M9 3h6M10 3v6l-5 9h14l-5-9V3"/></svg>`
  if (subj === 'Botany')           return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M12 22V12M12 12C12 7 7 3 7 3s2 6 5 9"/><path d="M12 12c0-5 5-9 5-9s-2 6-5 9"/></svg>`
  if (subj === 'Zoology')          return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>`
  if (subj.startsWith('ICT'))      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>`
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`
}

function getSubjectPrefix(book: string): string {
  const match = book.match(/^([A-Za-z]+(?:\s+[A-Za-z]+)?\s+(?:1st|2nd)\s+Paper|Botany|Zoology|ICT)/)
  return match ? match[1] : ''
}

function getPaper(book: string): string {
  if (book.includes('1st Paper')) return '1st Paper'
  if (book.includes('2nd Paper')) return '2nd Paper'
  const match = book.match(/^([^(]+)/)
  return match ? match[1].trim() : book
}
function getAuthor(book: string): string {
  const match = book.match(/\(([^)]+)\)/)
  return match ? match[1] : ''
}

// ── Global state ───────────────────────────────────────────
const mode            = ref<'mock' | 'qbank'>('mock')
const selectedStream  = ref<string | null>(null)
const selectedSubject = ref<string | null>(null)
const selectedBook    = ref<string | null>(null)
const phase           = ref<'setup' | 'exam' | 'results'>('setup')

const booksForSelectedSubject = computed<string[]>(() =>
  selectedSubject.value ? (subjectToBooks[selectedSubject.value] ?? []) : []
)

function onStreamSelect(streamId: string) {
  if (selectedStream.value === streamId) return
  selectedStream.value  = streamId
  selectedSubject.value = null
  selectedBook.value    = null
  availableChapters.value = []
  qbAllQuestions.value    = []
  qbFiltered.value        = []
  qbChapters.value        = []
}

function onSubjectSelect(subj: string) {
  if (selectedSubject.value === subj) return
  selectedSubject.value = subj
  selectedBook.value    = null
  availableChapters.value = []
  qbAllQuestions.value    = []
  qbFiltered.value        = []
  qbChapters.value        = []
}

async function onBookSelect(book: string) {
  selectedBook.value = book
  config.chapter = 'All'
  availableChapters.value = []
  qbSelectedChapter.value = ''
  qbChapters.value = []
  await loadChapters()
  if (mode.value === 'qbank') {
    await qbFetchQuestions()
  }
}

// ── Toast ──────────────────────────────────────────────────
const toast = reactive({ show: false, msg: '', isError: false })
function showToast(msg: string, isError = false) {
  toast.msg = msg; toast.isError = isError; toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

// ── Constants ──────────────────────────────────────────────
const optLetters = ['A', 'B', 'C', 'D', 'E']

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
  { val: 'balanced', label: 'Balanced',   desc: '30% easy · 50% med · 20% hard', easy: 14, med: 24, hard: 10 },
  { val: 'easy',     label: 'Easy Start', desc: '60% easy · 30% med · 10% hard', easy: 28, med: 14, hard: 6  },
  { val: 'hard',     label: 'Challenge',  desc: '10% easy · 30% med · 60% hard', easy: 6,  med: 14, hard: 28 },
  { val: 'mixed',    label: 'Full Random',desc: 'Random mix, no filter',          easy: 16, med: 18, hard: 16 },
]

const difficulties = [
  { val: 'all',    label: 'All',    cls: '' },
  { val: 'easy',   label: 'Easy',   cls: 'easy-pill' },
  { val: 'medium', label: 'Medium', cls: 'med-pill' },
  { val: 'hard',   label: 'Hard',   cls: 'hard-pill' },
]

const sortOptions = [
  { val: 'default',   label: 'Default'    },
  { val: 'easy-first',label: 'Easy First' },
  { val: 'hard-first',label: 'Hard First' },
  { val: 'year',      label: 'By Year'    },
]

// ══════════════════════════════════════════════════════════════
// MOCK EXAM LOGIC
// ══════════════════════════════════════════════════════════════

const config = reactive({
  chapter:        'All',
  count:          20,
  duration:       20,
  diffMode:       'balanced',
  shuffle:        true,
  showTimer:      true,
  negativeMarking:false,
})

const availableChapters = ref<string[]>([])
const questions          = ref<Question[]>([])
const currentIdx         = ref(0)
const answers            = ref<Record<number, number>>({})
const flagged            = ref<Set<number>>(new Set())
const showEndConfirm     = ref(false)
const timeLeft           = ref(0)
const reviewFilter       = ref('All')
const isLoadingQuestions = ref(false)
const questionLoadError  = ref('')
const questionBank       = ref<Question[]>([])

let timerInterval: ReturnType<typeof setInterval> | null = null
let observer: IntersectionObserver | null = null

async function loadChapters() {
  if (!selectedBook.value) return
  try {
    const data = await $fetch<string[]>('/api/chapters', {
      query: { text_book: selectedBook.value }
    })
    availableChapters.value = data?.length ? ['All', ...data] : ['All']
  } catch {
    availableChapters.value = ['All']
  }
}

function getSubjectStr(q: Question): string {
  return typeof q.subject === 'object' ? (q.subject as any).english : q.subject as string
}
function getChapterStr(q: Question): string {
  return typeof q.chapter === 'object' ? (q.chapter as any).english : q.chapter as string
}
function getQText(q?: Question): string {
  if (!q) return ''
  return typeof q.question === 'object' ? q.question[selectedLang.value] : q.question
}

function autoSetDuration(n: number) {
  if      (n <= 10) config.duration = 10
  else if (n <= 20) config.duration = 20
  else if (n <= 30) config.duration = 30
  else if (n <= 50) config.duration = 45
  else              config.duration = 60
}

function buildQuestions(): Question[] {
  let pool = [...questionBank.value]
  if (config.chapter !== 'All') pool = pool.filter(q => getChapterStr(q) === config.chapter)

  if (config.diffMode !== 'mixed') {
    const weights: Record<string, Record<string, number>> = {
      balanced: { easy: 0.3, medium: 0.5, hard: 0.2 },
      easy:     { easy: 0.6, medium: 0.3, hard: 0.1 },
      hard:     { easy: 0.1, medium: 0.3, hard: 0.6 },
    }
    const w = weights[config.diffMode]
    const easyPool = pool.filter(q => q.difficulty_level === 'easy')
    const medPool  = pool.filter(q => q.difficulty_level === 'medium')
    const hardPool = pool.filter(q => q.difficulty_level === 'hard')
    if (config.shuffle) { easyPool.sort(() => Math.random() - 0.5); medPool.sort(() => Math.random() - 0.5); hardPool.sort(() => Math.random() - 0.5) }
    const eCount = Math.round(config.count * w.easy)
    const mCount = Math.round(config.count * w.medium)
    const hCount = config.count - eCount - mCount
    const mixed = [...easyPool.slice(0, eCount), ...medPool.slice(0, mCount), ...hardPool.slice(0, hCount)]
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

async function startExam() {
  if (!selectedBook.value) return
  isLoadingQuestions.value = true
  questionLoadError.value = ''
  try {
    const data = await $fetch<Question[]>('/api/questions', {
      query: {
        text_book: selectedBook.value,
        chapter: config.chapter !== 'All' ? config.chapter : undefined,
        difficulty: config.diffMode !== 'mixed' ? config.diffMode : undefined,
        limit: config.count * 3,
      }
    })
    if (!data?.length) { questionLoadError.value = 'No questions found for this selection.'; return }
    questionBank.value = data
    questions.value = buildQuestions()
    if (!questions.value.length) { questionLoadError.value = 'Not enough questions for your filters.'; return }
  } catch {
    questionLoadError.value = 'Failed to load questions.'; return
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

function setupObserver() {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const idx = parseInt(e.target.id.split('-')[1])
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
    if (timeLeft.value <= 0) { clearInterval(timerInterval!); submitExam() }
    else timeLeft.value--
  }, 1000)
}
function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null }
}

function selectAnswer(qId: number, optIdx: number) {
  answers.value = { ...answers.value, [qId]: optIdx }
}
function clearAnswer(qId: number) {
  const a = { ...answers.value }; delete a[qId]; answers.value = a
}
function toggleFlag(qId: number) {
  const s = new Set(flagged.value)
  s.has(qId) ? s.delete(qId) : s.add(qId)
  flagged.value = s
}
function confirmEndExam() { showEndConfirm.value = true }
function scrollToQuestion(i: number) {
  document.getElementById(`question-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const answeredCount = computed(() => Object.keys(answers.value).length)

const result = computed(() => {
  let correct = 0, wrong = 0, skipped = 0
  questions.value.forEach(q => {
    const ans = answers.value[q.id]
    if (ans === undefined) skipped++
    else if (ans === q.correct_index) correct++
    else wrong++
  })
  const total    = questions.value.length
  const deducted = config.negativeMarking ? wrong * 0.25 : 0
  const raw      = correct - deducted
  const score    = total > 0 ? Math.max(0, Math.round((raw / total) * 100)) : 0
  return { correct, wrong, skipped, score, deducted: parseFloat(deducted.toFixed(2)), marksEarned: Math.max(0, parseFloat(raw.toFixed(2))), total }
})

const resultStats = computed(() => [
  { label: 'Correct',  value: result.value.correct,  percent: result.value.correct  / questions.value.length * 100, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><path d="M20 6L9 17l-5-5"/></svg>` },
  { label: 'Wrong',    value: result.value.wrong,    percent: result.value.wrong    / questions.value.length * 100, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>` },
  { label: 'Skipped',  value: result.value.skipped,  percent: result.value.skipped  / questions.value.length * 100, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/></svg>` },
  { label: 'Accuracy', value: (answeredCount.value ? Math.round(result.value.correct / answeredCount.value * 100) : 0) + '%', percent: answeredCount.value ? result.value.correct / answeredCount.value * 100 : 0, icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
])

const diffBreakdown = computed(() => {
  const diffs: Record<string, { correct: number; total: number }> = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, hard: { correct: 0, total: 0 } }
  questions.value.forEach(q => {
    diffs[q.difficulty_level].total++
    if (answers.value[q.id] === q.correct_index) diffs[q.difficulty_level].correct++
  })
  return [
    { label: 'Easy',   cls: 'easy',   ...diffs.easy   },
    { label: 'Medium', cls: 'medium', ...diffs.medium },
    { label: 'Hard',   cls: 'hard',   ...diffs.hard   },
  ]
})

const avgTimePerQ = computed(() => {
  const elapsed = config.duration * 60 - timeLeft.value
  return answeredCount.value ? Math.round(elapsed / answeredCount.value) : 0
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

function buildGroups(qs: Question[]): QuestionGroup[] {
  const groups: QuestionGroup[] = []
  const stimMap = new Map<string, QuestionGroup>()
  for (const q of qs) {
    if (q.stimulus_hash) {
      if (stimMap.has(q.stimulus_hash)) { stimMap.get(q.stimulus_hash)!.questions.push(q) }
      else { const g: QuestionGroup = { stimulus: q.stimulus, stimulus_image: q.stimulus_image, questions: [q] }; stimMap.set(q.stimulus_hash, g); groups.push(g) }
    } else { groups.push({ questions: [q] }) }
  }
  return groups
}

const questionGroups     = computed(() => buildGroups(questions.value))
const filteredReviewGroups = computed(() => buildGroups(filteredReview.value))

async function saveResult() {
  if (!session.value) return
  const userId = session.value.user.id
  await supabase.from('exam_results').insert({
    user_id:         userId,
    stream:          'Textbook',
    subject:         selectedBook.value,
    score:           result.value.score,
    correct:         result.value.correct,
    wrong:           result.value.wrong,
    skipped:         result.value.skipped,
    questions_count: questions.value.length,
    duration_mins:   config.duration,
    exam_type:       'textbook',
  })
  const attempts = questions.value.map(q => ({
    user_id:        userId,
    question_id:    q.id,
    selected_index: answers.value[q.id] ?? null,
    is_correct:     answers.value[q.id] === q.correct_index ? true : answers.value[q.id] === undefined ? null : false,
    correct_index:  q.correct_index,
    source_type:    'mock',
  }))
  await supabase.from('question_attempts').insert(attempts)
}

async function submitExam() {
  stopTimer()
  showEndConfirm.value = false
  phase.value = 'results'
  await saveResult()
  showToast('Result saved successfully ✓')
}

function formatTime(s: number) {
  const m = Math.floor(s / 60), sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}
function scoreClass(score: number) { return score >= 75 ? 'high' : score >= 50 ? 'mid' : 'low' }
function gradeLabel(score: number) {
  if (score >= 90) return 'A+'; if (score >= 80) return 'A'
  if (score >= 70) return 'B';  if (score >= 60) return 'C'
  if (score >= 50) return 'D';  return 'F'
}
function reviewClass(id: number) {
  const ans = answers.value[id], q = questions.value.find(x => x.id === id)
  if (!q || ans === undefined) return 'skipped'
  return ans === q.correct_index ? 'correct' : 'wrong'
}

// ══════════════════════════════════════════════════════════════
// QUESTION BANK LOGIC
// ══════════════════════════════════════════════════════════════

const qbLoading         = ref(false)
const searchQuery       = ref('')
const qbSelectedChapter = ref('')
const qbSelectedDiff    = ref('all')
const qbSortBy          = ref('default')
const qbCurrentPage     = ref(1)
const qbPageSize        = 10

const qbExpandedId       = ref<number | null>(null)
const qbSelectedAnswers  = ref<Record<number, number>>({})
const qbShowAnswer       = ref<Record<number, boolean>>({})
const qbBookmarkedIds    = ref<Set<number>>(new Set())
const qbBookmarkedQuestions = ref<any[]>([])
const qbSolvedIds        = ref<Set<number>>(new Set())
const qbWrongIds         = ref<Set<number>>(new Set())
const qbSessionStats     = ref({ attempted: 0, correct: 0, wrong: 0 })
const qbAllQuestions     = ref<Question[]>([])
const qbFiltered         = ref<Question[]>([])
const qbChapters         = ref<{ name: string; count: number }[]>([])

const qbTotalPages = computed(() => Math.ceil(qbFiltered.value.length / qbPageSize))

const qbPaginated = computed(() => {
  const start = (qbCurrentPage.value - 1) * qbPageSize
  return qbFiltered.value.slice(start, start + qbPageSize)
})

const qbPaginatedGroups = computed(() => buildGroups(qbPaginated.value))

const qbVisiblePages = computed(() => {
  const total = qbTotalPages.value, curr = qbCurrentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages: (number | string)[] = [1]
  if (curr > 3) pages.push('…')
  for (let p = Math.max(2, curr - 1); p <= Math.min(total - 1, curr + 1); p++) pages.push(p)
  if (curr < total - 2) pages.push('…')
  pages.push(total)
  return pages
})

const qbSessionAccuracy = computed(() => {
  if (!qbSessionStats.value.attempted) return 0
  return Math.round((qbSessionStats.value.correct / qbSessionStats.value.attempted) * 100)
})

async function qbFetchQuestions() {
  if (!selectedBook.value) return
  qbLoading.value = true
  try {
    const data = await $fetch<Question[]>('/api/qBank', {
      query: { text_book: selectedBook.value }
    })
    qbAllQuestions.value = data ?? []
    // Build chapter breakdown from fetched data
    const chMap: Record<string, number> = {}
    ;(data ?? []).forEach(q => {
      const ch = q.chapter[selectedLang.value]
      chMap[ch] = (chMap[ch] ?? 0) + 1
    })
    qbChapters.value = Object.entries(chMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
  } catch {
    console.error('Failed to load questions')
  } finally {
    qbLoading.value = false
  }
  qbApplyFilters()
}

function qbApplyFilters() {
  let qs = [...qbAllQuestions.value]
  if (qbSelectedDiff.value !== 'all')   qs = qs.filter(q => q.difficulty_level === qbSelectedDiff.value)
  if (qbSelectedChapter.value)          qs = qs.filter(q => q.chapter[selectedLang.value] === qbSelectedChapter.value)
  if (searchQuery.value.trim()) {
    const sq = searchQuery.value.toLowerCase()
    qs = qs.filter(x => x.question[selectedLang.value].toLowerCase().includes(sq) || x.chapter[selectedLang.value].toLowerCase().includes(sq))
  }
  if (qbSortBy.value === 'easy-first') qs.sort((a, b) => ['easy','medium','hard'].indexOf(a.difficulty_level) - ['easy','medium','hard'].indexOf(b.difficulty_level))
  else if (qbSortBy.value === 'hard-first') qs.sort((a, b) => ['hard','medium','easy'].indexOf(a.difficulty_level) - ['hard','medium','easy'].indexOf(b.difficulty_level))
  else if (qbSortBy.value === 'year') qs.sort((a, b) => (b.years?.[0]?.english ?? '0').localeCompare(a.years?.[0]?.english ?? '0'))
  qbFiltered.value = qs
  qbCurrentPage.value = 1
  qbExpandedId.value = null
}

function qbSelectDiff(d: string) { qbSelectedDiff.value = d; qbApplyFilters() }
function qbFilterByChapter(ch: string) { qbSelectedChapter.value = qbSelectedChapter.value === ch ? '' : ch; qbApplyFilters() }
function qbResetFilters() {
  searchQuery.value = ''; qbSelectedChapter.value = ''; qbSelectedDiff.value = 'all'; qbSortBy.value = 'default'; qbApplyFilters()
}

let searchTimer: ReturnType<typeof setTimeout>
function onSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(qbApplyFilters, 250) }

function qbToggleExpand(id: number) { qbExpandedId.value = qbExpandedId.value === id ? null : id }

function qbSelectAnswer(qId: number, optIdx: number) {
  if (qbShowAnswer.value[qId]) return
  qbSelectedAnswers.value = { ...qbSelectedAnswers.value, [qId]: optIdx }
}

async function qbRevealAnswer(qId: number) {
  const q = qbAllQuestions.value.find(x => x.id === qId)
  if (!q) return
  qbShowAnswer.value = { ...qbShowAnswer.value, [qId]: true }
  qbSolvedIds.value.add(qId)
  const chosen = qbSelectedAnswers.value[qId]
  const isCorrect = chosen !== undefined ? chosen === q.correct_index : null
  if (chosen !== undefined) {
    qbSessionStats.value.attempted++
    if (isCorrect) qbSessionStats.value.correct++
    else { qbSessionStats.value.wrong++; qbWrongIds.value.add(qId) }
  } else { qbSessionStats.value.attempted++; qbSessionStats.value.correct++ }
  if (session.value) {
    await supabase.from('question_attempts').insert({
      user_id: session.value.user.id, question_id: qId,
      selected_index: chosen ?? null, is_correct: isCorrect,
      correct_index: q.correct_index, source_type: 'qbank',
    })
  }
}

async function qbToggleBookmark(id: number) {
  if (!session.value) return
  const isBookmarked = qbBookmarkedIds.value.has(id)
  const s = new Set(qbBookmarkedIds.value)
  isBookmarked ? s.delete(id) : s.add(id)
  qbBookmarkedIds.value = s
  if (isBookmarked) {
    qbBookmarkedQuestions.value = qbBookmarkedQuestions.value.filter(q => q.id !== id)
    await supabase.from('bookmarks').delete().eq('user_id', session.value.user.id).eq('question_id', id)
  } else {
    const q = qbAllQuestions.value.find(x => x.id === id)
    if (q) qbBookmarkedQuestions.value.unshift(q)
    await supabase.from('bookmarks').insert({ user_id: session.value.user.id, question_id: id })
  }
}

function qbNextQuestion(currentIdx: number) {
  const nextIdx = currentIdx + 1
  if (nextIdx < qbPaginated.value.length) { qbExpandedId.value = qbPaginated.value[nextIdx].id }
  else if (qbCurrentPage.value < qbTotalPages.value) { qbGotoPage(qbCurrentPage.value + 1) }
}

function qbJumpToQuestion(id: number) {
  const idx = qbFiltered.value.findIndex(q => q.id === id)
  if (idx === -1) { qbResetFilters(); return }
  const page = Math.floor(idx / qbPageSize) + 1
  qbGotoPage(page)
  nextTick(() => {
    qbExpandedId.value = id
    nextTick(() => { document.getElementById(`q-${id}`)?.scrollIntoView({ behavior: 'smooth' }) })
  })
}

function qbGotoPage(p: number) { qbCurrentPage.value = p; qbExpandedId.value = null; window.scrollTo({ behavior: 'smooth' }) }

function qbResetSession() {
  qbSessionStats.value = { attempted: 0, correct: 0, wrong: 0 }
  qbSelectedAnswers.value = {}
  qbShowAnswer.value = {}
  qbSolvedIds.value = new Set()
  qbWrongIds.value = new Set()
}

// watch mode switch to load data
watch(mode, async (newMode) => {
  if (newMode === 'qbank' && selectedBook.value && !qbAllQuestions.value.length) {
    await qbFetchQuestions()
  }
  if (newMode === 'mock') {
    phase.value = 'setup'
  }
})

// When stream changes, reset cascade below
watch(selectedStream, () => {
  selectedSubject.value   = null
  selectedBook.value      = null
  availableChapters.value = []
  qbAllQuestions.value    = []
  qbFiltered.value        = []
})

// When subject changes, reset book + qbank data
watch(selectedSubject, () => {
  selectedBook.value      = null
  availableChapters.value = []
  qbAllQuestions.value    = []
  qbFiltered.value        = []
  qbChapters.value        = []
})

onMounted(async () => {
  if (!session.value) return
  // Load bookmarks
  const { data: bms } = await supabase.from('bookmarks').select('question_id').eq('user_id', session.value.user.id).order('created_at', { ascending: false })
  qbBookmarkedIds.value = new Set((bms ?? []).map((r: any) => r.question_id))
  // Load solved
  const { data: attempts } = await supabase.from('question_attempts').select('question_id, is_correct, selected_index').eq('user_id', session.value.user.id)
  qbSolvedIds.value = new Set((attempts ?? []).filter((r: any) => r.is_correct === true).map((r: any) => r.question_id))
  qbWrongIds.value  = new Set((attempts ?? []).filter((r: any) => r.is_correct === false).map((r: any) => r.question_id))
  const ans: Record<number, number> = {}, rev: Record<number, boolean> = {}
  ;(attempts ?? []).forEach((r: any) => { if (r.selected_index !== null) { ans[r.question_id] = r.selected_index; rev[r.question_id] = true } })
  qbSelectedAnswers.value = ans; qbShowAnswer.value = rev
})

onUnmounted(() => { stopTimer(); observer?.disconnect() })
</script>

<style scoped>
/* ══ Page ══════════════════════════════════════════════════════ */
.textbook-page { display: flex; flex-direction: column; gap: 1.5rem; width: 100%; min-width: 0; overflow-x: hidden; }

/* ══ Toast ════════════════════════════════════════════════════ */
.admin-toast {
  position: fixed; bottom: 24px; right: 24px; z-index: 2000;
  padding: 12px 20px; font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em;
  background: var(--black); color: var(--white);
  border: 1px solid var(--border-bright); border-left: 3px solid rgba(120,230,120,0.8);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.06);
}
.admin-toast.error { border-left-color: rgba(255,100,100,0.8); }
.toast-slide-enter-active, .toast-slide-leave-active { transition: all 0.25s ease; }
.toast-slide-enter-from, .toast-slide-leave-to { transform: translateX(20px); opacity: 0; }

/* ══ Header ════════════════════════════════════════════════════ */
.tb-header {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 2rem; padding: 2rem;
  border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.tb-header::before {
  content: ''; position: absolute; inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.06) 1px, transparent 1px);
  background-size: 24px 24px; pointer-events: none;
}

.page-chip {
  display: inline-flex; align-items: center; gap: 7px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.16em;
  text-transform: uppercase; color: var(--gray);
  border: 1px solid var(--border-bright); padding: 5px 12px; margin-bottom: 0.9rem; position: relative;
}
.chip-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--white); animation: blink 2s infinite; }
@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }

.page-title {
  font-family: var(--font-mono); font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-weight: 700; letter-spacing: -1px; color: var(--white); line-height: 1.1; margin-bottom: 0.5rem;
}
.text-outline { -webkit-text-stroke: 1px var(--white); color: transparent; }
.page-sub { font-size: 0.83rem; color: var(--gray); font-weight: 300; max-width: 360px; }

.tb-stat-card {
  display: flex; flex-direction: column; gap: 4px;
  padding: 1.2rem 1.6rem; border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); flex-shrink: 0; min-width: 160px; position: relative;
}
.tsc-label { font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--gray); }
.tsc-value { font-family: var(--font-mono); font-size: 2.2rem; font-weight: 700; letter-spacing: -1px; line-height: 1; color: var(--white); }
.tsc-sub   { font-size: 0.7rem; color: var(--gray); }

/* ══ Config block (shared wrapper for sections) ═══════════════ */
.config-block {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  display: flex; flex-direction: column;
}

.config-section-header {
  display: flex; align-items: center; gap: 10px;
  padding: 1.4rem 1.6rem 0;
}
.csec-tag {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--black); background: var(--white); padding: 3px 8px; font-weight: 700;
}
.csec-label { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600; color: var(--white); letter-spacing: 0.05em; }
.csec-hint { font-size: 0.72rem; color: var(--gray); margin-left: auto; }

.selected-hint {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.65rem; color: var(--white);
  max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.sh-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(120,230,120,0.8); flex-shrink: 0; }

/* ══ Mode selector ════════════════════════════════════════════ */
.mode-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;
  padding: 1.2rem 1.6rem 1.4rem;
}
.mode-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px;
  padding: 1.2rem 1.4rem; position: relative;
  border: 1px solid var(--border); background: transparent; cursor: pointer;
  text-align: left; transition: all 0.2s ease;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.mode-card:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.03); }
.mode-card.active { border-color: var(--white); background: rgba(240,240,234,0.06); box-shadow: 4px 4px 0 0 rgba(240,240,234,0.1); }
.mode-icon { color: var(--gray); }
.mode-card.active .mode-icon { color: var(--white); }
.mode-name { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white); letter-spacing: 0.04em; }
.mode-desc { font-size: 0.72rem; color: var(--gray); }
.mode-check {
  position: absolute; top: 10px; right: 12px;
  font-size: 0.65rem; font-family: var(--font-mono); color: var(--white);
  background: rgba(120,230,120,0.15); border: 1px solid rgba(120,230,120,0.4);
  padding: 2px 7px;
}

/* ══ Stream grid ══════════════════════════════════════════════ */
.stream-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 1px; background: var(--border);
  border-top: 1px solid var(--border);
}
.stream-card {
  display: flex; flex-direction: column; gap: 5px;
  padding: 1.1rem 1.2rem; position: relative;
  background: #0a0a0a; border: none; cursor: pointer;
  text-align: left; transition: all 0.18s ease;
}
.stream-card:hover:not(.no-books) { background: rgba(240,240,234,0.04); }
.stream-card.active { background: rgba(240,240,234,0.07); box-shadow: inset 0 0 0 1px var(--white); }
.stream-card.no-books { opacity: 0.4; cursor: not-allowed; }
.stream-icon { color: var(--gray); margin-bottom: 3px; }
.stream-card.active .stream-icon { color: var(--white); }
.stream-name { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); letter-spacing: 0.03em; }
.stream-desc { font-size: 0.65rem; color: var(--gray); }
.stream-no-books { font-family: var(--font-mono); font-size: 0.55rem; color: var(--gray); opacity: 0.6; border: 1px solid var(--border); padding: 2px 6px; align-self: flex-start; }
.stream-check {
  position: absolute; top: 10px; right: 12px;
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--white);
  background: rgba(120,230,120,0.15); border: 1px solid rgba(120,230,120,0.4);
  padding: 2px 7px;
}

/* ══ Subject pills ════════════════════════════════════════════ */
.subject-pills-wrap {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1px; background: var(--border); border-top: 1px solid var(--border);
}
.subject-pill {
  display: flex; align-items: center; gap: 10px;
  padding: 0.95rem 1.2rem; position: relative;
  background: #0a0a0a; border: none; cursor: pointer;
  text-align: left; transition: all 0.18s ease;
}
.subject-pill:hover { background: rgba(240,240,234,0.04); }
.subject-pill.active { background: rgba(240,240,234,0.08); box-shadow: inset 0 0 0 1px var(--white); }
.sp-icon { color: var(--gray); flex-shrink: 0; }
.subject-pill.active .sp-icon { color: var(--white); }
.sp-label { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 600; color: var(--white); flex: 1; }
.sp-count { font-family: var(--font-mono); font-size: 0.58rem; color: var(--gray); border: 1px solid var(--border); padding: 2px 6px; white-space: nowrap; }
.sp-check {
  font-family: var(--font-mono); font-size: 0.6rem; color: rgba(120,230,120,0.9);
  background: rgba(120,230,120,0.1); border: 1px solid rgba(120,230,120,0.3);
  padding: 2px 7px; flex-shrink: 0;
}

/* ══ No books block ═══════════════════════════════════════════ */
.no-books-block { }
.no-books-msg {
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  padding: 2rem 1.5rem; text-align: center; color: var(--gray); border-top: 1px solid var(--border);
}
.no-books-msg p { font-size: 0.82rem; color: var(--gray); line-height: 1.5; }
.no-books-msg strong { color: var(--white); }
.nb-sub { font-size: 0.72rem !important; color: var(--border-bright) !important; }

/* ══ Textbook picker (standalone, no groups) ══════════════════ */
.book-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px; padding: 0.8rem 1.6rem 1rem;
}
.book-grid--standalone {
  gap: 1px; background: var(--border); border-top: 1px solid var(--border);
  padding: 0;
}

.book-card {
  display: flex; flex-direction: column; gap: 5px;
  padding: 1rem 1.2rem; position: relative;
  border: none; background: #0a0a0a; cursor: pointer;
  text-align: left; transition: all 0.18s ease;
}
.book-card:hover { background: rgba(240,240,234,0.05); }
.book-card.active { background: rgba(240,240,234,0.09); box-shadow: inset 0 0 0 1px var(--white); }

.book-subject-tag {
  font-family: var(--font-mono); font-size: 0.58rem; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--gray);
}
.book-paper {
  font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700;
  color: var(--white); letter-spacing: 0.03em;
}
.book-author { font-size: 0.7rem; color: var(--gray); line-height: 1.35; }
.book-check {
  position: absolute; top: 10px; right: 12px;
  font-family: var(--font-mono); font-size: 0.6rem; color: rgba(120,230,120,0.9);
  background: rgba(120,230,120,0.1); border: 1px solid rgba(120,230,120,0.3); padding: 2px 7px;
}

/* ══ Filter pills (shared) ════════════════════════════════════ */
.filter-pills { display: flex; flex-wrap: wrap; gap: 6px; }

.filter-pill {
  font-family: var(--font-mono); font-size: 0.65rem; letter-spacing: 0.06em;
  padding: 5px 12px; border: 1px solid var(--border);
  background: transparent; cursor: pointer; color: var(--gray);
  transition: all 0.15s; white-space: nowrap;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.filter-pill:hover { color: var(--white); border-color: var(--border-bright); }
.filter-pill.active { background: var(--white); color: var(--black); border-color: var(--white); box-shadow: 2px 2px 0 0 rgba(240,240,234,0.15); }

.pill-count { font-size: 0.6rem; opacity: 0.6; }

.diff-pill.easy-pill.active { background: rgba(120,230,120,0.15); border-color: rgba(120,230,120,0.5); color: rgba(120,230,120,0.9); }
.diff-pill.med-pill.active  { background: rgba(255,200,80,0.12);  border-color: rgba(255,200,80,0.4);  color: rgba(255,200,80,0.9);  }
.diff-pill.hard-pill.active { background: rgba(255,100,100,0.12); border-color: rgba(255,100,100,0.4); color: rgba(255,100,100,0.8); }

/* ══ Config sections (mock setup) ════════════════════════════ */
.config-section {
  padding: 1.2rem 1.6rem; border-top: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 1rem;
}

.dual-config { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.dual-col { display: flex; flex-direction: column; gap: 0.6rem; }
.form-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gray); }
.num-pills { display: flex; flex-wrap: wrap; gap: 6px; }

.diff-options { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
.diff-card {
  padding: 1rem; border: 1px solid var(--border); background: transparent;
  cursor: pointer; text-align: left; display: flex; flex-direction: column; gap: 6px;
  transition: all 0.18s; box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.diff-card:hover { border-color: var(--border-bright); }
.diff-card.active { border-color: var(--white); background: rgba(240,240,234,0.05); box-shadow: 4px 4px 0 0 rgba(240,240,234,0.1); }
.diff-card-name { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); }
.diff-card-desc { font-size: 0.62rem; color: var(--gray); line-height: 1.4; }
.diff-bars { display: flex; align-items: flex-end; gap: 4px; height: 32px; margin-top: 6px; }
.diff-bar { width: 8px; border-radius: 2px 2px 0 0; }
.diff-bar.easy { background: rgba(120,230,120,0.5); }
.diff-bar.med  { background: rgba(255,200,80,0.5); }
.diff-bar.hard { background: rgba(255,100,100,0.5); }

.config-options-row { display: flex; flex-direction: column; gap: 0.75rem; }
.toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 1rem; cursor: pointer; }
.toggle-label { font-size: 0.8rem; color: var(--white); }
.toggle-btn {
  width: 38px; height: 20px; border-radius: 10px; position: relative;
  border: 1px solid var(--border); background: transparent; cursor: pointer; transition: all 0.2s;
  flex-shrink: 0;
}
.toggle-btn.on { background: rgba(120,230,120,0.2); border-color: rgba(120,230,120,0.5); }
.toggle-knob {
  position: absolute; top: 2px; left: 2px; width: 14px; height: 14px;
  border-radius: 50%; background: var(--gray); transition: all 0.2s;
}
.toggle-btn.on .toggle-knob { left: 20px; background: rgba(120,230,120,0.9); }

.setup-cta { padding: 1.4rem 1.6rem; display: flex; flex-direction: column; gap: 0.75rem; border-top: 1px solid var(--border); }
.cta-meta { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); display: flex; gap: 6px; flex-wrap: wrap; }
.dot-sep { color: var(--border-bright); }
.error-text { font-family: var(--font-mono); font-size: 0.7rem; color: rgba(255,100,100,0.8); }

/* Start / submit buttons */
.iso-btn {
  font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 10px 20px; border: 1px solid var(--border); background: transparent;
  cursor: pointer; color: var(--white); transition: all 0.18s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04); text-decoration: none; display: inline-flex; align-items: center;
}
.iso-btn:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.05); }
.iso-btn--fill { background: var(--white); color: var(--black); border-color: var(--white); box-shadow: 4px 4px 0 0 rgba(240,240,234,0.15); }
.iso-btn--fill:hover { background: rgba(240,240,234,0.88); }
.iso-btn--ghost { color: var(--gray); }
.iso-btn--ghost:hover { color: var(--white); border-color: var(--border-bright); }
.iso-btn--full { width: 100%; justify-content: center; }
.iso-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.start-btn { align-self: flex-start; }

/* ══ Filter bar (qbank) ════════════════════════════════════════ */
.filter-bar {
  border: 1px solid var(--border); background: #0a0a0a;
  display: flex; flex-direction: column;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.filter-search {
  display: flex; align-items: center; gap: 10px;
  padding: 0.8rem 1.2rem; border-bottom: 1px solid var(--border);
  position: relative;
}
.search-icon { color: var(--gray); flex-shrink: 0; }
.search-input {
  flex: 1; background: transparent; border: none; outline: none;
  color: var(--white); font-size: 0.85rem; font-family: inherit;
}
.search-input::placeholder { color: var(--gray); }
.search-clear {
  background: transparent; border: none; color: var(--gray);
  cursor: pointer; font-size: 1rem; padding: 0 4px;
}
.search-clear:hover { color: var(--white); }

.filters-row { display: flex; border-bottom: 1px solid var(--border); }
.filter-group {
  padding: 0.9rem 1.2rem; display: flex; flex-direction: column; gap: 0.6rem;
  border-right: 1px solid var(--border); flex: 1;
}
.filter-group:last-child { border-right: none; }
.filter-actions { flex-direction: row; align-items: flex-end; gap: 0.8rem; flex-wrap: wrap; }
.reset-btn { font-size: 0.6rem !important; padding: 5px 12px !important; flex-shrink: 0; }

.filter-status {
  display: flex; align-items: center; gap: 1rem; padding: 0.6rem 1.2rem;
  flex-wrap: wrap;
}
.result-count { display: flex; align-items: baseline; gap: 6px; }
.count-num { font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700; color: var(--white); }
.count-label { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }
.active-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-left: auto; }
.active-tag {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.62rem; color: var(--white);
  border: 1px solid var(--border-bright); padding: 3px 8px;
}
.active-tag button { background: none; border: none; cursor: pointer; color: var(--gray); font-size: 0.8rem; padding: 0; }
.active-tag button:hover { color: var(--white); }

/* ══ Question bank body ════════════════════════════════════════ */
.qbank-body { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }
.question-list { display: flex; flex-direction: column; gap: 0; border: 1px solid var(--border); }

/* Skeleton */
.question-skeleton {
  height: 72px; border-bottom: 1px solid var(--border);
  background: linear-gradient(90deg, rgba(240,240,234,0.04) 25%, rgba(240,240,234,0.08) 50%, rgba(240,240,234,0.04) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}
@keyframes shimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 3rem 1.5rem; }
.empty-icon { color: var(--gray); }
.empty-title { font-size: 0.9rem; font-weight: 600; color: var(--white); }
.empty-sub { font-size: 0.75rem; color: var(--gray); text-align: center; }

/* Question card */
.question-card {
  border-bottom: 1px solid var(--border); background: #0a0a0a;
  animation: fadeIn 0.3s ease both;
}
.question-card:last-child { border-bottom: none; }
.question-card.expanded { background: #0d0d0d; }
.question-card.solved .qcard-header { border-left: 2px solid rgba(120,230,120,0.5); }
.question-card.wrong  .qcard-header { border-left: 2px solid rgba(255,100,100,0.5); }

@keyframes fadeIn { from { opacity: 0; transform: translateY(4px) } to { opacity: 1; transform: none } }

.qcard-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 1.2rem; cursor: pointer; gap: 0.75rem;
  transition: background 0.15s;
}
.qcard-header:hover { background: rgba(240,240,234,0.03); }

.qcard-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.q-index { font-family: var(--font-mono); font-size: 0.68rem; color: var(--gray); min-width: 28px; }
.q-diff-badge {
  font-family: var(--font-mono); font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.06em;
  padding: 2px 7px; border: 1px solid;
}
.q-diff-badge.easy   { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.06); }
.q-diff-badge.medium { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.06);  }
.q-diff-badge.hard   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.06); }

.q-subject-tag, .q-chapter-tag {
  font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray);
  background: rgba(240,240,234,0.05); border: 1px solid var(--border);
  padding: 2px 7px; white-space: nowrap;
}
.q-year-tag { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }

.qcard-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.solved-badge { font-family: var(--font-mono); font-size: 0.58rem; color: rgba(120,230,120,0.8); padding: 2px 6px; border: 1px solid rgba(120,230,120,0.3); background: rgba(120,230,120,0.05); }
.wrong-badge  { font-family: var(--font-mono); font-size: 0.58rem; color: rgba(255,100,100,0.8); padding: 2px 6px; border: 1px solid rgba(255,100,100,0.3); background: rgba(255,100,100,0.05); }
.bookmark-active { color: rgba(255,200,80,0.8); }
.expand-toggle { background: transparent; border: none; cursor: pointer; color: var(--gray); padding: 4px; }

.qcard-body { padding: 0 1.2rem 12px; cursor: pointer; }
.q-preview { font-size: 0.85rem; color: var(--white); line-height: 1.5; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

.qcard-expanded { padding: 0 1.2rem 1.2rem; display: flex; flex-direction: column; gap: 1rem; border-top: 1px solid var(--border); }
.q-full-text { font-size: 0.9rem; line-height: 1.6; color: var(--white); }
.eq-img { max-width: 100%; border-radius: 6px; margin: 8px 0; border: 1px solid var(--border); }

.options-list { display: flex; flex-direction: column; gap: 6px; }
.option-btn {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border: 1px solid var(--border); background: rgba(240,240,234,0.02);
  cursor: pointer; text-align: left; transition: all 0.18s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.option-btn:hover:not(:disabled) { border-color: var(--border-bright); background: rgba(240,240,234,0.05); }
.option-btn.selected { border-color: var(--white); background: rgba(240,240,234,0.07); }
.option-btn.correct { border-color: rgba(120,230,120,0.6); background: rgba(120,230,120,0.08); }
.option-btn.wrong   { border-color: rgba(255,100,100,0.5); background: rgba(255,100,100,0.07); }
.opt-letter { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--gray); min-width: 20px; }
.opt-text   { flex: 1; font-size: 0.85rem; color: var(--white); }
.opt-check  { font-size: 0.8rem; color: rgba(120,230,120,0.9); }
.opt-x      { font-size: 0.8rem; color: rgba(255,100,100,0.8); }

.qcard-footer { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.footer-left { flex: 1; }
.footer-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.explanation-block { display: flex; flex-direction: column; gap: 6px; }
.exp-label { font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.18em; color: var(--gray); text-transform: uppercase; }
.exp-text  { font-size: 0.83rem; color: var(--dim, var(--gray)); line-height: 1.7; }

.action-icon-btn {
  width: 32px; height: 32px; border: 1px solid var(--border); background: transparent;
  cursor: pointer; color: var(--gray); display: flex; align-items: center; justify-content: center;
  transition: color 0.2s, border-color 0.2s; box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.action-icon-btn:hover, .action-icon-btn.active { color: var(--white); border-color: var(--border-bright); }
.reveal-btn { font-size: 0.65rem !important; padding: 8px 14px !important; }
.next-btn   { font-size: 0.65rem !important; padding: 8px 14px !important; }

/* Pagination */
.pagination { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 1.2rem; background: #0d0d0d; border-top: 1px solid var(--border); }
.page-btn { font-size: 0.65rem !important; padding: 8px 14px !important; }
.page-numbers { display: flex; align-items: center; gap: 4px; }
.page-num {
  font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; width: 32px; height: 32px;
  border: 1px solid var(--border); background: transparent; cursor: pointer; color: var(--gray);
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.03);
}
.page-num:hover:not(:disabled) { color: var(--white); border-color: var(--border-bright); }
.page-num.active { background: var(--white); color: var(--black); border-color: var(--white); box-shadow: 2px 2px 0 0 rgba(240,240,234,0.2); }
.page-num.ellipsis { cursor: default; border-color: transparent; box-shadow: none; }

/* ══ Sidebar ════════════════════════════════════════════════ */
.qbank-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
.side-panel { border: 1px solid var(--border); background: #0a0a0a; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); }
.panel-header {
  padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray); }
.panel-count { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); }
.mini-btn { font-size: 0.6rem !important; padding: 4px 10px !important; }

.session-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }
.sess-stat { display: flex; flex-direction: column; gap: 3px; padding: 0.9rem 1rem; background: #0a0a0a; }
.sess-val { font-family: var(--font-mono); font-size: 1.3rem; font-weight: 700; color: var(--white); letter-spacing: -0.5px; }
.correct-val { color: rgba(120,230,120,0.9); }
.wrong-val   { color: rgba(255,100,100,0.8); }
.sess-label  { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }
.accuracy-bar-wrap { height: 2px; background: var(--border); }
.accuracy-bar-fill { height: 100%; background: rgba(240,240,234,0.4); transition: width 0.5s ease; }

.side-empty { padding: 1.2rem; font-size: 0.75rem; color: var(--gray); font-family: var(--font-mono); text-align: center; }
.bookmark-list { display: flex; flex-direction: column; }
.bookmark-row { display: flex; align-items: center; gap: 8px; padding: 0.7rem 1.2rem; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; background: transparent; text-align: left; width: 100%; }
.bookmark-row:last-child { border-bottom: none; }
.bookmark-row:hover { background: rgba(240,240,234,0.03); }
.bm-hash { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); flex-shrink: 0; }
.bm-text { font-size: 0.72rem; color: var(--white); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bm-more { padding: 0.5rem 1.2rem; font-size: 0.65rem; color: var(--gray); font-family: var(--font-mono); }

.qa-list { display: flex; flex-direction: column; }
.qa-item { display: flex; align-items: center; gap: 12px; padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border); background: transparent; cursor: pointer; text-align: left; width: 100%; transition: background 0.15s; }
.qa-item:last-child { border-bottom: none; }
.qa-item:hover { background: rgba(240,240,234,0.03); }
.qa-icon { width: 32px; height: 32px; border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; color: var(--gray); flex-shrink: 0; box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04); }
.qa-text { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.qa-title { font-size: 0.8rem; font-weight: 600; color: var(--white); }
.qa-sub   { font-size: 0.65rem; color: var(--gray); }
.qa-arrow { font-family: var(--font-mono); font-size: 0.75rem; color: var(--gray); flex-shrink: 0; }

/* ══ Exam topbar ════════════════════════════════════════════ */
.exam-topbar {
  display: flex; align-items: center; gap: 1rem;
  padding: 0 1.5rem; height: 52px;
  border: 1px solid var(--border); background: #0d0d0d;
  box-shadow: 0 2px 0 0 rgba(240,240,234,0.04); position: sticky; top: 0; z-index: 100;
}
.etb-left  { display: flex; align-items: center; gap: 1rem; min-width: 0; }
.etb-center { flex: 1; }
.etb-right { display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0; }
.etb-chip  { font-family: var(--font-mono); font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); border: 1px solid var(--border); padding: 4px 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px; }
.etb-progress { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); white-space: nowrap; }
.etb-progbar { height: 2px; background: var(--border); border-radius: 1px; }
.etb-progbar-fill { height: 100%; background: rgba(240,240,234,0.5); transition: width 0.5s ease; border-radius: 1px; }
.timer-display {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white);
  padding: 5px 10px; border: 1px solid var(--border); background: rgba(240,240,234,0.04);
}
.timer-display.warning  { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3); }
.timer-display.critical { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); animation: pulse 0.5s infinite; }
@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.6 } }
.end-btn { font-size: 0.62rem !important; padding: 7px 14px !important; }

/* ══ Question palette ════════════════════════════════════════ */
.q-palette-wrap { display: flex; flex-direction: column; gap: 0.6rem; padding: 0.8rem 1.5rem; border: 1px solid var(--border); background: #0a0a0a; }
.q-palette { display: flex; flex-wrap: wrap; gap: 5px; }
.palette-dot {
  width: 30px; height: 30px; font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
  border: 1px solid var(--border); background: transparent; color: var(--gray); cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.palette-dot.current  { border-color: var(--white); color: var(--white); background: rgba(240,240,234,0.1); }
.palette-dot.answered { background: rgba(120,230,120,0.12); border-color: rgba(120,230,120,0.4); color: rgba(120,230,120,0.9); }
.palette-dot.flagged  { background: rgba(255,200,80,0.12);  border-color: rgba(255,200,80,0.4);  color: rgba(255,200,80,0.9);  }
.palette-legend { display: flex; gap: 1rem; }
.leg-item { display: flex; align-items: center; gap: 5px; font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }
.leg-dot { width: 10px; height: 10px; border: 1px solid var(--border); background: transparent; }
.leg-dot.answered { background: rgba(120,230,120,0.15); border-color: rgba(120,230,120,0.4); }
.leg-dot.flagged  { background: rgba(255,200,80,0.15);  border-color: rgba(255,200,80,0.4);  }

/* ══ Exam body ════════════════════════════════════════════════ */
.exam-body { display: grid; grid-template-columns: 1fr 260px; gap: 1.5rem; align-items: start; }
.exam-question-list { display: flex; flex-direction: column; gap: 1rem; }

.exam-question-card {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
  transition: border-color 0.2s;
}
.exam-question-card.card-flagged  { border-color: rgba(255,200,80,0.5); }
.exam-question-card.card-answered { border-left: 3px solid rgba(120,230,120,0.5); }
.card-stimulus-child { border-top: none; margin-top: -1rem; }

.eq-stimulus-block {
  background: var(--surface-2, #1a1a1a); border-left: 3px solid var(--accent, #fff);
  border-radius: 8px 8px 0 0; padding: 16px 20px;
  border: 1px solid var(--border); border-bottom: none;
}
.eq-stimulus-label { display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--gray, #888); margin-bottom: 8px; }

.eq-header { display: flex; align-items: center; justify-content: space-between; padding: 0.9rem 1.2rem 0; gap: 0.75rem; }
.eq-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.eq-num  { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); }
.eq-diff { font-family: var(--font-mono); font-size: 0.58rem; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 7px; border: 1px solid; }
.eq-diff.easy   { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.06); }
.eq-diff.medium { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.06);  }
.eq-diff.hard   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.06); }
.eq-subject, .eq-chapter { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); padding: 2px 6px; border: 1px solid var(--border); background: rgba(240,240,234,0.03); }

.flag-btn {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em;
  background: transparent; border: 1px solid var(--border); cursor: pointer;
  color: var(--gray); padding: 5px 10px; transition: all 0.18s; flex-shrink: 0;
}
.flag-btn:hover { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.4); }
.flag-btn.active { color: rgba(255,200,80,0.9); border-color: rgba(255,200,80,0.5); background: rgba(255,200,80,0.08); }

.eq-body { padding: 1rem 1.2rem 0.5rem; }
.eq-text { font-size: 0.95rem; line-height: 1.65; color: var(--white); }

.eq-options { display: flex; flex-direction: column; gap: 6px; padding: 0.5rem 1.2rem; }
.eq-option {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  border: 1px solid var(--border); background: rgba(240,240,234,0.02);
  cursor: pointer; text-align: left; transition: all 0.18s;
}
.eq-option:hover { border-color: var(--border-bright); background: rgba(240,240,234,0.05); }
.eq-option.selected { border-color: var(--white); background: rgba(240,240,234,0.08); box-shadow: 2px 2px 0 0 rgba(240,240,234,0.1); }
.opt-selected-mark { font-size: 0.8rem; color: rgba(120,230,120,0.8); margin-left: auto; }

.eq-footer { padding: 0.6rem 1.2rem 1rem; display: flex; align-items: center; gap: 1rem; }
.clear-btn { font-size: 0.6rem !important; padding: 6px 12px !important; }
.answered-badge { font-family: var(--font-mono); font-size: 0.6rem; color: rgba(120,230,120,0.7); }

/* Exam sidebar */
.exam-sidebar { display: flex; flex-direction: column; gap: 1rem; position: sticky; top: 64px; }
.exam-progress-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); }
.ep-stat { display: flex; flex-direction: column; gap: 3px; padding: 0.9rem 1rem; background: #0a0a0a; }
.ep-val { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--white); }
.ep-label { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }
.ep-bar-wrap { height: 2px; background: var(--border); }
.ep-bar-fill { height: 100%; background: rgba(120,230,120,0.6); transition: width 0.4s ease; }

.flagged-list { display: flex; flex-direction: column; }
.flagged-item { display: flex; align-items: center; gap: 8px; padding: 0.7rem 1.2rem; border-bottom: 1px solid var(--border); background: transparent; cursor: pointer; text-align: left; width: 100%; transition: background 0.15s; }
.flagged-item:last-child { border-bottom: none; }
.flagged-item:hover { background: rgba(240,240,234,0.03); }
.fi-num  { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: rgba(255,200,80,0.8); flex-shrink: 0; }
.fi-text { font-size: 0.72rem; color: var(--gray); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.submit-panel { }
.submit-info { padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 0.75rem; }
.submit-desc { font-size: 0.8rem; color: var(--gray); line-height: 1.5; }
.nm-active-badge { font-family: var(--font-mono); font-size: 0.62rem; color: rgba(255,200,80,0.8); padding: 5px 10px; border: 1px solid rgba(255,200,80,0.3); background: rgba(255,200,80,0.05); }

.exam-submit-bar { display: flex; align-items: center; justify-content: space-between; padding: 1.2rem; border: 1px solid var(--border); background: #0a0a0a; gap: 1rem; }
.submit-end-btn { }
.submit-bar-meta { font-family: var(--font-mono); font-size: 0.65rem; color: var(--gray); }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 200; backdrop-filter: blur(2px); }
.modal-box { background: #0d0d0d; border: 1px solid var(--border-bright); max-width: 400px; width: 90%; box-shadow: 8px 8px 0 0 rgba(240,240,234,0.06); }
.modal-header { padding: 1rem 1.4rem; border-bottom: 1px solid var(--border); }
.modal-tag { font-family: var(--font-mono); font-size: 0.62rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--white); }
.modal-body { padding: 1.2rem 1.4rem; display: flex; flex-direction: column; gap: 0.75rem; }
.modal-text { font-size: 0.85rem; color: var(--gray); line-height: 1.5; }
.modal-text strong { color: var(--white); }
.modal-warn { font-family: var(--font-mono); font-size: 0.7rem; color: rgba(255,200,80,0.8); }
.modal-footer { padding: 1rem 1.4rem; border-top: 1px solid var(--border); display: flex; gap: 0.75rem; justify-content: flex-end; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

/* ══ Results ════════════════════════════════════════════════ */
.results-hero {
  display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
  padding: 2rem; border: 1px solid var(--border); background: #0d0d0d;
  position: relative; overflow: hidden; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.results-hero::before { content: ''; position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(240,240,234,0.06) 1px, transparent 1px); background-size: 24px 24px; pointer-events: none; }
.rh-left { display: flex; flex-direction: column; gap: 0.75rem; position: relative; }
.rh-right { position: relative; }
.score-display { display: flex; align-items: center; gap: 1.2rem; }
.score-big { font-family: var(--font-mono); font-size: 4rem; font-weight: 700; letter-spacing: -2px; line-height: 1; }
.score-big.high { color: rgba(120,230,120,0.9); }
.score-big.mid  { color: rgba(255,200,80,0.9); }
.score-big.low  { color: rgba(255,100,100,0.8); }
.score-meta-col { display: flex; flex-direction: column; gap: 4px; }
.score-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gray); }
.score-grade { font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; }
.score-grade.high { color: rgba(120,230,120,0.9); }
.score-grade.mid  { color: rgba(255,200,80,0.9); }
.score-grade.low  { color: rgba(255,100,100,0.8); }
.score-marks { font-family: var(--font-mono); font-size: 0.7rem; color: var(--gray); }
.score-sub { font-size: 0.82rem; color: var(--gray); }
.neg-mark-notice { display: flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 0.65rem; color: rgba(255,200,80,0.8); }
.nm-icon { font-size: 1rem; }
.results-book-tag { display: flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); padding: 4px 10px; border: 1px solid var(--border); background: rgba(240,240,234,0.03); align-self: flex-start; }
.result-actions { display: flex; flex-direction: column; gap: 0.75rem; }

.result-stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); }
.rstat { display: flex; flex-direction: column; gap: 6px; padding: 1rem 1.2rem; background: #0a0a0a; }
.rstat-icon { color: var(--gray); }
.rstat-value { font-family: var(--font-mono); font-size: 1.6rem; font-weight: 700; color: var(--white); letter-spacing: -1px; }
.rstat-label { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--gray); }
.rstat-bar { height: 2px; background: var(--border); border-radius: 1px; margin-top: 4px; }
.rstat-bar-fill { height: 100%; background: rgba(240,240,234,0.4); transition: width 0.6s ease; border-radius: 1px; }

.results-body { display: grid; grid-template-columns: 1fr 280px; gap: 1.5rem; align-items: start; }

.review-list { border: 1px solid var(--border); background: #0a0a0a; display: flex; flex-direction: column; box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04); }
.review-list .panel-header { padding: 1rem 1.2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
.review-filters { display: flex; gap: 5px; }
.small-pill { font-size: 0.6rem !important; padding: 3px 8px !important; }

.review-card { padding: 1.2rem; border-bottom: 1px solid var(--border); display: flex; flex-direction: column; gap: 0.75rem; }
.review-card:last-child { border-bottom: none; }
.review-card.correct { border-left: 3px solid rgba(120,230,120,0.5); }
.review-card.wrong   { border-left: 3px solid rgba(255,100,100,0.5); }
.review-card.skipped { border-left: 3px solid var(--border); }

.rc-header { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rc-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rc-status-icon { font-size: 0.9rem; font-family: var(--font-mono); }
.review-card.correct .rc-status-icon { color: rgba(120,230,120,0.9); }
.review-card.wrong   .rc-status-icon { color: rgba(255,100,100,0.8); }
.review-card.skipped .rc-status-icon { color: var(--gray); }
.rc-num     { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--white); }
.rc-diff    { font-family: var(--font-mono); font-size: 0.58rem; text-transform: uppercase; padding: 2px 6px; border: 1px solid; }
.rc-diff.easy   { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.06); }
.rc-diff.medium { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.06);  }
.rc-diff.hard   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.06); }
.rc-subject { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }
.rc-question { font-size: 0.9rem; line-height: 1.6; color: var(--white); }
.rc-options { display: flex; flex-direction: column; gap: 5px; }
.rc-option { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border: 1px solid var(--border); background: rgba(240,240,234,0.02); }
.rc-option.rc-correct { background: rgba(120,230,120,0.08); border-color: rgba(120,230,120,0.4); }
.rc-option.rc-wrong   { background: rgba(255,100,100,0.07); border-color: rgba(255,100,100,0.4); }
.rc-option.rc-user    { }
.rc-opt-letter { font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; color: var(--gray); min-width: 20px; }
.rc-opt-text   { flex: 1; font-size: 0.83rem; color: var(--white); }
.rc-opt-tag    { font-family: var(--font-mono); font-size: 0.6rem; color: var(--gray); }
.rc-option.rc-correct .rc-opt-tag { color: rgba(120,230,120,0.9); }
.rc-option.rc-wrong   .rc-opt-tag { color: rgba(255,100,100,0.8); }
.rc-skipped-note { font-family: var(--font-mono); font-size: 0.75rem; color: var(--gray); padding: 4px 0; }
.rc-explanation { padding-top: 0.6rem; border-top: 1px solid var(--border); }

/* Results sidebar */
.results-sidebar { display: flex; flex-direction: column; gap: 1rem; }
.breakdown-list { display: flex; flex-direction: column; gap: 1px; background: var(--border); }
.breakdown-row { padding: 0.8rem 1.2rem; background: #0a0a0a; display: flex; flex-direction: column; gap: 6px; }
.bdr-left { display: flex; align-items: center; justify-content: space-between; }
.bdr-label { font-family: var(--font-mono); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.08em; }
.bdr-label.easy   { color: rgba(120,230,120,0.9); }
.bdr-label.medium { color: rgba(255,200,80,0.9); }
.bdr-label.hard   { color: rgba(255,100,100,0.8); }
.bdr-count { font-family: var(--font-mono); font-size: 0.72rem; color: var(--white); }
.bdr-bar-wrap { height: 3px; background: var(--border); border-radius: 1.5px; }
.bdr-bar-fill { height: 100%; border-radius: 1.5px; transition: width 0.6s ease; }
.bdr-bar-fill.easy   { background: rgba(120,230,120,0.6); }
.bdr-bar-fill.medium { background: rgba(255,200,80,0.6); }
.bdr-bar-fill.hard   { background: rgba(255,100,100,0.6); }

.time-stats { display: flex; flex-direction: column; }
.ts-row { display: flex; align-items: center; justify-content: space-between; padding: 0.6rem 1.2rem; border-bottom: 1px solid var(--border); }
.ts-row:last-child { border-bottom: none; }
.ts-label { font-size: 0.75rem; color: var(--gray); }
.ts-val   { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white); }

.next-steps { display: flex; flex-direction: column; }

/* ══ Stimulus ════════════════════════════════════════════════ */
.eq-stimulus { background: rgba(240,240,234,0.04); border-left: 3px solid var(--border-bright); padding: 12px 16px; border-radius: 4px; }

/* ══ Responsive ══════════════════════════════════════════════ */
@media (max-width: 1200px) {
  .stream-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1100px) {
  .exam-body     { grid-template-columns: 1fr; }
  .results-body  { grid-template-columns: 1fr; }
  .qbank-body    { grid-template-columns: 1fr; }
  .results-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); }
  .qbank-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); }
  .result-stats-row { grid-template-columns: repeat(2, 1fr); }
  .diff-options  { grid-template-columns: repeat(2, 1fr); }
  .stream-grid   { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 900px) {
  .stream-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 768px) {
  .tb-header { flex-direction: column; align-items: flex-start; }
  .mode-grid { grid-template-columns: 1fr 1fr; }
  .stream-grid { grid-template-columns: repeat(2, 1fr); }
  .subject-pills-wrap { grid-template-columns: repeat(2, 1fr); }
  .book-grid--standalone { grid-template-columns: repeat(2, 1fr); }
  .dual-config { grid-template-columns: 1fr; }
  .exam-topbar { padding: 0 0.75rem; gap: 0.5rem; }
  .etb-chip { display: none; }
  .results-hero { flex-direction: column; align-items: flex-start; }
  .q-palette-wrap { flex-direction: column; align-items: flex-start; }
  .results-sidebar { grid-template-columns: 1fr; }
  .qbank-sidebar { grid-template-columns: 1fr; }
  .filters-row { flex-direction: column; }
  .filter-group { border-right: none; border-bottom: 1px solid var(--border); width: 100%; box-sizing: border-box; }
  .filter-group:last-child { border-bottom: none; }
  .config-section-header { flex-wrap: wrap; }
  .selected-hint { max-width: 180px; }
}

@media (max-width: 480px) {
  .tb-header { padding: 1.2rem; }
  .page-title { font-size: 1.4rem; }
  .config-section-header { padding: 1rem 1.2rem 0; }
  .config-section { padding: 1rem 1.2rem; }
  .stream-grid { grid-template-columns: repeat(2, 1fr); }
  .subject-pills-wrap { grid-template-columns: 1fr; }
  .book-grid--standalone { grid-template-columns: 1fr 1fr; }
  .book-card { padding: 0.75rem 1rem; }
  .book-paper { font-size: 0.7rem; }
  .book-author { font-size: 0.65rem; }
  .stream-card { padding: 0.9rem 1rem; }
  .stream-name { font-size: 0.68rem; }
  .stream-desc { font-size: 0.6rem; }
  .mode-grid { grid-template-columns: 1fr; }
  .diff-options { grid-template-columns: 1fr 1fr; }
  .result-stats-row { grid-template-columns: 1fr 1fr; }
  .score-big { font-size: 2.8rem; }
  .exam-topbar { height: 48px; }
  .palette-dot { width: 26px; height: 26px; font-size: 0.55rem; }
  .qcard-header { flex-wrap: wrap; padding: 10px 1rem 0; gap: 6px; }
  .q-subject-tag, .q-chapter-tag { display: none; }
  .filter-pill { font-size: 0.6rem; padding: 4px 9px; }
  .pagination { gap: 5px; padding: 1rem; }
  .page-btn { font-size: 0.6rem !important; padding: 7px 10px !important; }
  .search-input { font-size: 0.82rem !important; }
  .filter-status { padding: 0.6rem 1rem; }
  .sp-label { font-size: 0.68rem; }
  .sp-count { display: none; }
}
</style>
