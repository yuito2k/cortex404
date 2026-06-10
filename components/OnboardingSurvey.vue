<template>
  <Teleport to="body">
    <Transition name="survey-fade">
      <div v-if="visible" class="survey-overlay">
        <!-- Dot-grid bg -->
        <div class="survey-dotgrid" />

        <div class="survey-modal">
          <!-- Corner brackets -->
          <div class="corner corner-tl" />
          <div class="corner corner-tr" />
          <div class="corner corner-bl" />
          <div class="corner corner-br" />

          <!-- Header -->
          <div class="survey-header">
            <div class="survey-chip">
              <span class="chip-dot" />
              ONBOARDING
            </div>
            <div class="survey-progress-track">
              <div
                v-for="n in 4"
                :key="n"
                class="prog-seg"
                :class="{ active: n <= currentStep, done: n < currentStep }"
              />
            </div>
            <span class="survey-step-label">{{ currentStep }} / 4</span>
          </div>

          <!-- ── STEP 1: Level + Stream ── -->
          <Transition name="step-slide" mode="out-in">
            <div v-if="currentStep === 1" key="step1" class="survey-body">
              <h2 class="survey-title">Tell us about yourself</h2>
              <p class="survey-sub">We'll personalise your question bank and mock exams around your goals.</p>

              <!-- Level -->
              <div class="field-group">
                <label class="field-label">YOUR LEVEL</label>
                <div class="pill-row">
                  <button
                    v-for="lv in levels"
                    :key="lv.value"
                    class="survey-pill"
                    :class="{ selected: form.level === lv.value }"
                    @click="form.level = lv.value"
                  >{{ lv.label }}</button>
                </div>
                <span v-if="errors.level" class="field-error">{{ errors.level }}</span>
              </div>

              <!-- Stream (only show if relevant) -->
              <div class="field-group" v-if="showStreamPicker">
                <label class="field-label">YOUR STREAM</label>
                <div class="pill-row">
                  <button
                    v-for="st in streams"
                    :key="st.value"
                    class="survey-pill"
                    :class="{ selected: form.stream === st.value }"
                    @click="form.stream = st.value"
                  >{{ st.label }}</button>
                </div>
                <span v-if="errors.stream" class="field-error">{{ errors.stream }}</span>
              </div>
            </div>
          </Transition>

          <!-- ── STEP 2: District ── -->
          <Transition name="step-slide" mode="out-in">
            <div v-if="currentStep === 2" key="step2" class="survey-body">
              <h2 class="survey-title">Where are you from?</h2>
              <p class="survey-sub">Helps us surface region-specific board questions.</p>

              <div class="field-group">
                <label class="field-label">YOUR DISTRICT</label>
                <div class="district-combo">
                  <input
                    ref="districtInput"
                    v-model="districtQuery"
                    class="survey-input"
                    type="text"
                    placeholder="Type or select your district…"
                    autocomplete="off"
                    @focus="districtOpen = true"
                    @blur="onDistrictBlur"
                    @input="onDistrictType"
                  />
                  <span class="input-arrow">{{ districtOpen ? '↑' : '↓' }}</span>
                  <Transition name="dropdown-fade">
                    <ul v-if="districtOpen && filteredDistricts.length" class="district-dropdown">
                      <li
                        v-for="d in filteredDistricts"
                        :key="d"
                        class="district-option"
                        :class="{ highlighted: form.district === d }"
                        @mousedown.prevent="selectDistrict(d)"
                      >{{ d }}</li>
                    </ul>
                  </Transition>
                  <Transition name="dropdown-fade">
                    <ul v-if="districtOpen && districtQuery && !filteredDistricts.length" class="district-dropdown">
                      <li class="district-option no-result">No match — check spelling</li>
                    </ul>
                  </Transition>
                </div>
                <span v-if="form.district" class="district-selected">
                  ✓ {{ form.district }}
                </span>
                <span v-if="errors.district" class="field-error">{{ errors.district }}</span>
              </div>
            </div>
          </Transition>

          <!-- ── STEP 3: School/Institution ── -->
          <Transition name="step-slide" mode="out-in">
            <div v-if="currentStep === 3" key="step3" class="survey-body">
              <h2 class="survey-title">Your institution</h2>
              <p class="survey-sub">Your school or college name. This stays private.</p>

              <div class="field-group">
                <label class="field-label">SCHOOL / COLLEGE / INSTITUTION</label>
                <input
                  v-model="form.institution"
                  class="survey-input"
                  type="text"
                  placeholder="e.g. Dhaka College, BUET, Notre Dame College…"
                  maxlength="120"
                />
                <span class="field-hint">Optional — you can skip this step.</span>
                <span v-if="errors.institution" class="field-error">{{ errors.institution }}</span>
              </div>
            </div>
          </Transition>

          <!-- ── STEP 4: Heard from ── -->
          <Transition name="step-slide" mode="out-in">
            <div v-if="currentStep === 4" key="step4" class="survey-body">
              <h2 class="survey-title">How did you find us?</h2>
              <p class="survey-sub">Helps us understand where students are coming from.</p>

              <div class="field-group">
                <label class="field-label">I HEARD ABOUT CORTEX404 FROM</label>
                <div class="pill-row pill-row--wrap">
                  <button
                    v-for="src in heardFromOptions"
                    :key="src.value"
                    class="survey-pill"
                    :class="{ selected: form.heardFrom === src.value }"
                    @click="form.heardFrom = src.value; if (src.value !== 'other') form.heardFromOther = ''"
                  >
                    <span class="pill-icon">{{ src.icon }}</span>
                    {{ src.label }}
                  </button>
                </div>
                <Transition name="dropdown-fade">
                  <div v-if="form.heardFrom === 'other'" class="other-field">
                    <label class="field-label">TELL US MORE</label>
                    <input
                      v-model="form.heardFromOther"
                      class="survey-input"
                      type="text"
                      placeholder="Where did you hear about us?"
                      maxlength="100"
                    />
                  </div>
                </Transition>
                <span v-if="errors.heardFrom" class="field-error">{{ errors.heardFrom }}</span>
              </div>
            </div>
          </Transition>

          <!-- Footer -->
          <div class="survey-footer">
            <button
              v-if="currentStep > 1"
              class="iso-btn iso-btn--ghost"
              @click="prevStep"
              :disabled="saving"
            >← Back</button>
            <div class="footer-right">
              <button
                class="skip-link"
                @click="skipSurvey"
                :disabled="saving"
              >Skip for now</button>
              <button
                v-if="currentStep < 4"
                class="iso-btn iso-btn--fill"
                @click="nextStep"
              >Continue →</button>
              <button
                v-else
                class="iso-btn iso-btn--fill"
                @click="submitSurvey"
                :disabled="saving"
              >
                <span v-if="saving" class="btn-spinner" />
                {{ saving ? 'Saving…' : 'Get Started →' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

// ── Visibility ────────────────────────────────────────────────
const visible = ref(false)

onMounted(async () => {
  if (!user.value) return
  const { data } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('user_id', user.value.id)
    .single()
  if (data && !data.onboarding_completed) {
    visible.value = true
  }
})

// ── Step state ────────────────────────────────────────────────
const currentStep = ref(1)
const saving = ref(false)
const errors = reactive<Record<string, string>>({})

// ── Form data ─────────────────────────────────────────────────
const form = reactive({
  level: '',        // SSC | HSC | University | BCS | Bank | Other
  stream: '',       // Science | Arts | Commerce | General
  district: '',
  institution: '',
  heardFrom: '',
  heardFromOther: '',
})

// ── Options ───────────────────────────────────────────────────
const levels = [
  { value: 'SSC',        label: 'SSC' },
  { value: 'HSC',        label: 'HSC' },
  { value: 'University', label: 'University Admission' },
  { value: 'BCS',        label: 'BCS' },
  { value: 'Bank',       label: 'Bank / Govt Job' },
  { value: 'Other',      label: 'Other' },
]

const streams = [
  { value: 'Science',   label: 'Science' },
  { value: 'Arts',      label: 'Arts / Humanities' },
  { value: 'Commerce',  label: 'Commerce' },
]

// Only show stream picker for levels where it's relevant
const showStreamPicker = computed(() =>
  ['SSC', 'HSC', 'University'].includes(form.level)
)

const heardFromOptions = [
  { value: 'facebook',  label: 'Facebook',      icon: '📘' },
  { value: 'friend',    label: 'Friend / Family', icon: '👥' },
  { value: 'google',    label: 'Google Search',  icon: '🔍' },
  { value: 'youtube',   label: 'YouTube',        icon: '▶️' },
  { value: 'teacher',   label: 'Teacher',        icon: '🏫' },
  { value: 'twitter',   label: 'X / Twitter',    icon: '𝕏' },
  { value: 'other',     label: 'Other',          icon: '💬' },
]

// ── District combo ────────────────────────────────────────────
const districtQuery = ref('')
const districtOpen = ref(false)

const allDistricts = [
  'Bagerhat','Bandarban','Barguna','Barishal','Bhola','Bogura',
  'Brahmanbaria','Chandpur','Chapai Nawabganj','Chattogram','Chuadanga',
  'Cox\'s Bazar','Cumilla','Dhaka','Dinajpur','Faridpur','Feni',
  'Gaibandha','Gazipur','Gopalganj','Habiganj','Jamalpur','Jashore',
  'Jhalokati','Jhenaidah','Joypurhat','Khagrachhari','Khulna','Kishoreganj',
  'Kurigram','Kushtia','Lakshmipur','Lalmonirhat','Madaripur','Magura',
  'Manikganj','Meherpur','Moulvibazar','Munshiganj','Mymensingh','Naogaon',
  'Narail','Narayanganj','Narsingdi','Natore','Netrokona','Nilphamari',
  'Noakhali','Pabna','Panchagarh','Patuakhali','Pirojpur','Rajbari',
  'Rajshahi','Rangamati','Rangpur','Satkhira','Shariatpur','Sherpur',
  'Sirajganj','Sunamganj','Sylhet','Tangail','Thakurgaon',
]

const filteredDistricts = computed(() => {
  const q = districtQuery.value.toLowerCase().trim()
  if (!q) return allDistricts
  return allDistricts.filter(d => d.toLowerCase().includes(q))
})

function onDistrictType() {
  districtOpen.value = true
  // If user clears the input, also clear the selected value
  if (!districtQuery.value) form.district = ''
}

function selectDistrict(d: string) {
  form.district = d
  districtQuery.value = d
  districtOpen.value = false
}

function onDistrictBlur() {
  setTimeout(() => {
    districtOpen.value = false
    // If what they typed exactly matches a district (case-insensitive), accept it
    const match = allDistricts.find(
      d => d.toLowerCase() === districtQuery.value.toLowerCase()
    )
    if (match) {
      form.district = match
      districtQuery.value = match
    } else if (!form.district) {
      districtQuery.value = ''
    }
  }, 150)
}

// ── Validation ────────────────────────────────────────────────
function validateStep(step: number): boolean {
  Object.keys(errors).forEach(k => delete errors[k])

  if (step === 1) {
    if (!form.level) { errors.level = 'Please select your level.'; return false }
    if (showStreamPicker.value && !form.stream) { errors.stream = 'Please select your stream.'; return false }
  }
  if (step === 2) {
    if (!form.district) { errors.district = 'Please select or type your district.'; return false }
  }
  // Step 3 (institution) is optional
  if (step === 4) {
    if (!form.heardFrom) { errors.heardFrom = 'Please pick at least one option.'; return false }
  }
  return true
}

// ── Navigation ────────────────────────────────────────────────
function nextStep() {
  if (!validateStep(currentStep.value)) return
  currentStep.value++
}

function prevStep() {
  Object.keys(errors).forEach(k => delete errors[k])
  currentStep.value--
}

// ── Submit ────────────────────────────────────────────────────
async function submitSurvey() {
  if (!validateStep(4)) return
  if (!user.value) return
  saving.value = true

  const heardFromFinal = form.heardFrom === 'other'
    ? (form.heardFromOther.trim() || 'other')
    : form.heardFrom

  // Map level → primary_stream (existing column)
  const primaryStream = form.level === 'University'
    ? (form.stream === 'Science' || form.stream === 'Arts' || form.stream === 'Commerce' ? 'Admission' : form.level)
    : form.level

  const finalStream = form.stream ? primaryStream + ' ' + form.stream : primaryStream

  const { error } = await supabase
    .from('profiles')
    .update({
      primary_stream:       finalStream,
      institution:          form.institution.trim() || null,
      district:             form.district,
      onboarding_completed: true,
      heard_from:           heardFromFinal,
      // Store full level+stream detail in exam_prefs stream field
      //exam_prefs: supabase.rpc ? undefined : undefined, // handled separately below
    })
    .eq('user_id', user.value.id)

  if (!error) {
    // Also update exam_prefs.stream to match selected level
    //await supabase.rpc('update_exam_prefs_stream', {
    //  p_user_id: user.value.id,
    //  p_stream: primaryStream,
    //}).then(() => {}).catch(() => {})
    // ^ best-effort — don't block close if this fails

    visible.value = false
  } else {
    console.error('Onboarding save error:', error)
    // Still close — don't trap user
    visible.value = false
  }

  saving.value = false
}

// ── Skip (session-only) ───────────────────────────────────────
function skipSurvey() {
  // Mark in sessionStorage so it doesn't re-show this session
  sessionStorage.setItem('onboarding_skipped', '1')
  visible.value = false
}
</script>

<style scoped>
/* ── Overlay ─────────────────────────────────────────────────── */
.survey-overlay {
  position: fixed;
  inset: 0;
  z-index: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(8, 8, 8, 0.88);
  backdrop-filter: blur(6px);
  padding: 1rem;
}

.survey-dotgrid {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(240,240,234,0.05) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

/* ── Modal shell ─────────────────────────────────────────────── */
.survey-modal {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: var(--black);
  border: 1px solid var(--border-bright);
  box-shadow: 6px 6px 0 0 rgba(240,240,234,0.06);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Corner brackets */
.corner {
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
}
.corner-tl { top: -1px; left: -1px; border-top: 2px solid var(--white); border-left: 2px solid var(--white); }
.corner-tr { top: -1px; right: -1px; border-top: 2px solid var(--white); border-right: 2px solid var(--white); }
.corner-bl { bottom: -1px; left: -1px; border-bottom: 2px solid var(--white); border-left: 2px solid var(--white); }
.corner-br { bottom: -1px; right: -1px; border-bottom: 2px solid var(--white); border-right: 2px solid var(--white); }

/* ── Header ─────────────────────────────────────────────────── */
.survey-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.75rem;
}

.survey-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.16em;
  color: var(--gray);
  border: 1px solid var(--border);
  padding: 3px 8px;
  white-space: nowrap;
}

.chip-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--white);
  opacity: 0.5;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.survey-progress-track {
  flex: 1;
  display: flex;
  gap: 4px;
}

.prog-seg {
  flex: 1;
  height: 2px;
  background: var(--border);
  transition: background 0.3s ease;
}

.prog-seg.active { background: var(--white); }
.prog-seg.done   { background: rgba(240,240,234,0.4); }

.survey-step-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--gray);
  white-space: nowrap;
}

/* ── Body ───────────────────────────────────────────────────── */
.survey-body {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.survey-title {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  color: var(--white);
  margin: 0;
  letter-spacing: -0.01em;
}

.survey-sub {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--gray);
  margin: -1rem 0 0;
  line-height: 1.5;
}

/* ── Field groups ───────────────────────────────────────────── */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.field-label {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  letter-spacing: 0.14em;
  color: var(--gray);
}

.field-hint {
  font-family: var(--font-sans);
  font-size: 0.75rem;
  color: var(--dim);
}

.field-error {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: rgba(255,100,100,0.9);
}

/* ── Pills ──────────────────────────────────────────────────── */
.pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.survey-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--gray);
  cursor: pointer;
  transition: all 0.15s ease;
}

.survey-pill:hover {
  border-color: var(--border-bright);
  color: var(--white);
}

.survey-pill.selected {
  background: var(--white);
  color: var(--black);
  border-color: var(--white);
}

.pill-icon { font-size: 0.9em; }

/* ── District combo ─────────────────────────────────────────── */
.district-combo {
  position: relative;
}

.survey-input {
  width: 100%;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--white);
  font-family: var(--font-sans);
  font-size: 0.875rem;
  padding: 10px 36px 10px 12px;
  outline: none;
  transition: border-color 0.15s ease;
  box-sizing: border-box;
}

.survey-input:focus {
  border-color: var(--border-bright);
}

.survey-input::placeholder {
  color: var(--dim);
}

.input-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--gray);
  pointer-events: none;
}

.district-dropdown {
  position: absolute;
  top: calc(100% + 2px);
  left: 0;
  right: 0;
  background: #111;
  border: 1px solid var(--border-bright);
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  margin: 0;
  padding: 4px 0;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.district-option {
  font-family: var(--font-sans);
  font-size: 0.825rem;
  padding: 8px 12px;
  color: var(--gray);
  cursor: pointer;
  transition: background 0.1s ease, color 0.1s ease;
}

.district-option:hover,
.district-option.highlighted {
  background: rgba(240,240,234,0.06);
  color: var(--white);
}

.district-option.no-result {
  color: var(--dim);
  cursor: default;
  font-style: italic;
}

/* Scrollbar */
.district-dropdown::-webkit-scrollbar { width: 4px; }
.district-dropdown::-webkit-scrollbar-track { background: transparent; }
.district-dropdown::-webkit-scrollbar-thumb { background: var(--border); }

.district-selected {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.08em;
  color: rgba(120,230,120,0.8);
}

/* ── Other field ─────────────────────────────────────────────── */
.other-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

/* ── Footer ─────────────────────────────────────────────────── */
.survey-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border);
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skip-link {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  color: var(--dim);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.15s ease;
}

.skip-link:hover { color: var(--gray); }
.skip-link:disabled { opacity: 0.4; cursor: not-allowed; }

/* Spinner inside button */
.btn-spinner {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1.5px solid rgba(8,8,8,0.4);
  border-top-color: var(--black);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 6px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Transitions ─────────────────────────────────────────────── */
.survey-fade-enter-active,
.survey-fade-leave-active {
  transition: opacity 0.3s ease;
}
.survey-fade-enter-from,
.survey-fade-leave-to {
  opacity: 0;
}

.step-slide-enter-active,
.step-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.step-slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Responsive ─────────────────────────────────────────────── */
@media (max-width: 600px) {
  .survey-modal { padding: 1.5rem 1.25rem; }
  .survey-title { font-size: 1.05rem; }
  .survey-body  { min-height: 220px; }
}
</style>
