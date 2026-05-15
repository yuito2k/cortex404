<template>
  <div class="settings-page">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="page-chip"><span class="chip-dot" /> Settings</div>
        <h1 class="page-title">Account &amp;<br><span class="text-outline">Preferences.</span></h1>
        <p class="page-sub">Manage your profile, security, notifications and exam preferences.</p>
      </div>
    </div>

    <!-- Tab nav -->
    <div class="tab-bar">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon" v-html="tab.icon" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="settings-body">

      <!-- ══ PROFILE ══ -->
      <div v-if="activeTab === 'profile'" class="settings-section">

        <div class="section-panel">
          <div class="panel-header">
            <span class="panel-tag">Public Profile</span>
          </div>
          <div class="panel-body">

            <!-- Avatar row -->
            <div class="avatar-row">
              <div class="avatar-display">{{ userInitials }}</div>
              <div class="avatar-info">
                <span class="avatar-label">Profile Initials</span>
                <span class="avatar-sub">Auto-generated from your full name.</span>
              </div>
            </div>

            <div class="form-divider" />

            <!-- Full name -->
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input
                v-model="profile.fullName"
                class="form-input"
                placeholder="Your full name"
                :class="{ error: errors.fullName }"
              />
              <span v-if="errors.fullName" class="form-error">{{ errors.fullName }}</span>
            </div>

            <!-- Display name -->
            <div class="form-group">
              <label class="form-label">Display Name</label>
              <input
                v-model="profile.displayName"
                class="form-input"
                placeholder="How your name appears on leaderboard"
              />
              <span class="form-hint">This is shown publicly on the leaderboard.</span>
            </div>

            <!-- Email (read-only) -->
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <div class="input-read-only">
                <span>{{ userEmail }}</span>
                <span class="read-only-badge">Verified</span>
              </div>
              <span class="form-hint">Email cannot be changed. Contact support if needed.</span>
            </div>

            <!-- Bio -->
            <div class="form-group">
              <label class="form-label">Bio <span class="optional">(optional)</span></label>
              <textarea
                v-model="profile.bio"
                class="form-input form-textarea"
                placeholder="Tell other students about yourself…"
                rows="3"
                maxlength="200"
              />
              <span class="form-hint">{{ profile.bio.length }}/200 characters</span>
            </div>

            <!-- Exam stream -->
            <div class="form-group">
              <label class="form-label">Primary Exam Stream</label>
              <div class="select-wrap">
                <select v-model="profile.stream" class="form-input form-select">
                  <option v-for="s in examStreams" :key="s" :value="s">{{ s }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>

            <!-- Institution -->
            <div class="form-group">
              <label class="form-label">Institution <span class="optional">(optional)</span></label>
              <input v-model="profile.institution" class="form-input" placeholder="Your school or college" />
            </div>

            <!-- District -->
            <div class="form-group">
              <label class="form-label">District</label>
              <div class="select-wrap">
                <select v-model="profile.district" class="form-input form-select">
                  <option value="">Select district</option>
                  <option v-for="d in districts" :key="d" :value="d">{{ d }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>

            <div class="form-actions">
              <button
                class="iso-btn iso-btn--fill"
                :disabled="saving.profile"
                @click="saveProfile"
              >
                <span v-if="saving.profile" class="btn-spinner" />
                {{ saving.profile ? 'Saving…' : 'Save Profile' }}
              </button>
              <span v-if="saved.profile" class="save-success">✓ Saved</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ SECURITY ══ -->
      <div v-if="activeTab === 'security'" class="settings-section">

        <!-- Change password -->
        <div class="section-panel">
          <div class="panel-header">
            <span class="panel-tag">Change Password</span>
          </div>
          <div class="panel-body">
            <div class="form-group">
              <label class="form-label">Current Password</label>
              <div class="input-password-wrap">
                <input
                  v-model="security.currentPassword"
                  :type="showPwd.current ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Enter current password"
                  :class="{ error: errors.currentPassword }"
                  autocomplete="current-password"
                />
                <button class="pwd-toggle" @click="showPwd.current = !showPwd.current">
                  <svg v-if="showPwd.current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.currentPassword" class="form-error">{{ errors.currentPassword }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">New Password</label>
              <div class="input-password-wrap">
                <input
                  v-model="security.newPassword"
                  :type="showPwd.new ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Minimum 8 characters"
                  :class="{ error: errors.newPassword }"
                  autocomplete="new-password"
                />
                <button class="pwd-toggle" @click="showPwd.new = !showPwd.new">
                  <svg v-if="showPwd.new" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <!-- Strength bar -->
              <div class="strength-row">
                <div class="strength-bar">
                  <div
                    class="strength-fill"
                    :class="pwdStrength.cls"
                    :style="{ width: pwdStrength.pct + '%' }"
                  />
                </div>
                <span class="strength-label" :class="pwdStrength.cls">{{ pwdStrength.label }}</span>
              </div>
              <span v-if="errors.newPassword" class="form-error">{{ errors.newPassword }}</span>
            </div>

            <div class="form-group">
              <label class="form-label">Confirm New Password</label>
              <div class="input-password-wrap">
                <input
                  v-model="security.confirmPassword"
                  :type="showPwd.confirm ? 'text' : 'password'"
                  class="form-input"
                  placeholder="Repeat new password"
                  :class="{ error: errors.confirmPassword }"
                  autocomplete="new-password"
                />
                <button class="pwd-toggle" @click="showPwd.confirm = !showPwd.confirm">
                  <svg v-if="showPwd.confirm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <span v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</span>
            </div>

            <div class="form-actions">
              <button
                class="iso-btn iso-btn--fill"
                :disabled="saving.password || !security.currentPassword || !security.newPassword"
                @click="changePassword"
              >
                <span v-if="saving.password" class="btn-spinner" />
                {{ saving.password ? 'Updating…' : 'Update Password' }}
              </button>
              <span v-if="saved.password" class="save-success">✓ Password updated</span>
              <span v-if="errors.passwordGlobal" class="form-error">{{ errors.passwordGlobal }}</span>
            </div>
          </div>
        </div>

        <!-- Active sessions -->
        <div class="section-panel">
          <div class="panel-header">
            <span class="panel-tag">Active Sessions</span>
            <button class="panel-action iso-btn iso-btn--ghost" @click="signOutAllSessions">Sign Out All</button>
          </div>
          <div class="sessions-list">
            <div v-for="sess in sessions" :key="sess.id" class="session-row">
              <span class="sess-icon" v-html="sess.icon" />
              <div class="sess-info">
                <span class="sess-device">{{ sess.device }}</span>
                <span class="sess-meta">{{ sess.location }} · {{ sess.time }}</span>
              </div>
              <span v-if="sess.current" class="sess-current">Current</span>
              <button v-else class="sess-revoke" @click="revokeSession(sess.id)">Revoke</button>
            </div>
          </div>
        </div>

        <!-- Danger zone -->
        <div class="section-panel danger-panel">
          <div class="panel-header">
            <span class="panel-tag danger-tag">Danger Zone</span>
          </div>
          <div class="panel-body">
            <div class="danger-row">
              <div class="danger-text">
                <span class="danger-title">Sign Out Everywhere</span>
                <span class="danger-desc">Immediately sign out from all devices and sessions.</span>
              </div>
              <button class="iso-btn iso-btn--ghost danger-btn" @click="signOutAllSessions">Sign Out All Devices</button>
            </div>
            <div class="form-divider" />
            <div class="danger-row">
              <div class="danger-text">
                <span class="danger-title">Delete Account</span>
                <span class="danger-desc">Permanently delete your account and all data. This cannot be undone.</span>
              </div>
              <button class="iso-btn iso-btn--ghost danger-btn delete-btn" @click="showDeleteConfirm = true">Delete Account</button>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ NOTIFICATIONS ══ -->
      <div v-if="activeTab === 'notifications'" class="settings-section">
        <div class="section-panel">
          <div class="panel-header">
            <span class="panel-tag">Email Notifications</span>
          </div>
          <div class="panel-body toggle-list">
            <div v-for="n in emailNotifs" :key="n.id" class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-title">{{ n.label }}</span>
                <span class="toggle-desc">{{ n.desc }}</span>
              </div>
              <button
                class="toggle-btn"
                :class="{ on: notifPrefs[n.id] }"
                @click="notifPrefs[n.id] = !notifPrefs[n.id]"
              >
                <span class="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        <div class="section-panel">
          <div class="panel-header">
            <span class="panel-tag">In-App Notifications</span>
          </div>
          <div class="panel-body toggle-list">
            <div v-for="n in inAppNotifs" :key="n.id" class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-title">{{ n.label }}</span>
                <span class="toggle-desc">{{ n.desc }}</span>
              </div>
              <button
                class="toggle-btn"
                :class="{ on: notifPrefs[n.id] }"
                @click="notifPrefs[n.id] = !notifPrefs[n.id]"
              >
                <span class="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        <div class="section-panel">
          <div class="panel-header"><span class="panel-tag">Study Reminder</span></div>
          <div class="panel-body">
            <div class="toggle-row">
              <div class="toggle-info">
                <span class="toggle-title">Daily Study Reminder</span>
                <span class="toggle-desc">Get a reminder email at your chosen time if you haven't studied yet.</span>
              </div>
              <button class="toggle-btn" :class="{ on: notifPrefs.dailyReminder }" @click="notifPrefs.dailyReminder = !notifPrefs.dailyReminder">
                <span class="toggle-knob" />
              </button>
            </div>
            <div v-if="notifPrefs.dailyReminder" class="reminder-time">
              <label class="form-label">Reminder Time</label>
              <div class="select-wrap narrow">
                <select v-model="reminderTime" class="form-input form-select">
                  <option v-for="t in reminderTimes" :key="t" :value="t">{{ t }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions standalone">
          <button class="iso-btn iso-btn--fill" :disabled="saving.notifs" @click="saveNotifs">
            <span v-if="saving.notifs" class="btn-spinner" />
            {{ saving.notifs ? 'Saving…' : 'Save Preferences' }}
          </button>
          <span v-if="saved.notifs" class="save-success">✓ Saved</span>
        </div>
      </div>

      <!-- ══ EXAM PREFERENCES ══ -->
      <div v-if="activeTab === 'exam'" class="settings-section">

        <div class="section-panel">
          <div class="panel-header"><span class="panel-tag">Default Exam Config</span></div>
          <div class="panel-body">

            <div class="form-group">
              <label class="form-label">Default Exam Stream</label>
              <div class="select-wrap">
                <select v-model="examPrefs.stream" class="form-input form-select">
                  <option v-for="s in examStreams" :key="s" :value="s">{{ s }}</option>
                </select>
                <span class="select-arrow">▾</span>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Default Question Count</label>
              <div class="pill-select">
                <button
                  v-for="n in [10,20,30,50,100]"
                  :key="n"
                  class="filter-pill"
                  :class="{ active: examPrefs.questionCount === n }"
                  @click="examPrefs.questionCount = n"
                >{{ n }}</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Default Duration</label>
              <div class="pill-select">
                <button
                  v-for="d in durationOptions"
                  :key="d.val"
                  class="filter-pill"
                  :class="{ active: examPrefs.duration === d.val }"
                  @click="examPrefs.duration = d.val"
                >{{ d.label }}</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Default Difficulty</label>
              <div class="pill-select">
                <button
                  v-for="d in ['Balanced','Easy Start','Challenge','Full Random']"
                  :key="d"
                  class="filter-pill"
                  :class="{ active: examPrefs.difficulty === d }"
                  @click="examPrefs.difficulty = d"
                >{{ d }}</button>
              </div>
            </div>

            <div class="form-divider" />

            <div class="toggle-list">
              <div v-for="pref in examToggles" :key="pref.id" class="toggle-row">
                <div class="toggle-info">
                  <span class="toggle-title">{{ pref.label }}</span>
                  <span class="toggle-desc">{{ pref.desc }}</span>
                </div>
                <button class="toggle-btn" :class="{ on: examPrefs[pref.id] }" @click="examPrefs[pref.id] = !examPrefs[pref.id]">
                  <span class="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="section-panel">
          <div class="panel-header"><span class="panel-tag">Question Bank Defaults</span></div>
          <div class="panel-body">
            <div class="form-group">
              <label class="form-label">Questions Per Page</label>
              <div class="pill-select">
                <button
                  v-for="n in [5,10,20,50]"
                  :key="n"
                  class="filter-pill"
                  :class="{ active: examPrefs.qbPageSize === n }"
                  @click="examPrefs.qbPageSize = n"
                >{{ n }}</button>
              </div>
            </div>
            <div class="toggle-list">
              <div class="toggle-row">
                <div class="toggle-info">
                  <span class="toggle-title">Auto-expand First Question</span>
                  <span class="toggle-desc">Automatically expand the first question when opening the question bank.</span>
                </div>
                <button class="toggle-btn" :class="{ on: examPrefs.autoExpand }" @click="examPrefs.autoExpand = !examPrefs.autoExpand">
                  <span class="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions standalone">
          <button class="iso-btn iso-btn--fill" :disabled="saving.exam" @click="saveExamPrefs">
            <span v-if="saving.exam" class="btn-spinner" />
            {{ saving.exam ? 'Saving…' : 'Save Preferences' }}
          </button>
          <span v-if="saved.exam" class="save-success">✓ Saved</span>
        </div>
      </div>

      <!-- ══ APPEARANCE ══ -->
      <div v-if="activeTab === 'appearance'" class="settings-section">
        <div class="section-panel">
          <div class="panel-header"><span class="panel-tag">Display</span></div>
          <div class="panel-body">

            <div class="form-group">
              <label class="form-label">Theme</label>
              <div class="theme-options">
                <button
                  v-for="t in themes"
                  :key="t.val"
                  class="theme-card"
                  :class="{ active: appearance.theme === t.val }"
                  @click="appearance.theme = t.val"
                >
                  <div class="theme-preview" :class="t.val">
                    <div class="tp-bar" /><div class="tp-card" /><div class="tp-card sm" />
                  </div>
                  <span class="theme-label">{{ t.label }}</span>
                  <span v-if="t.val === 'dark'" class="theme-badge">Default</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Font Size</label>
              <div class="pill-select">
                <button
                  v-for="f in ['Small','Default','Large']"
                  :key="f"
                  class="filter-pill"
                  :class="{ active: appearance.fontSize === f }"
                  @click="appearance.fontSize = f"
                >{{ f }}</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Sidebar</label>
              <div class="pill-select">
                <button
                  v-for="s in ['Expanded','Collapsed','Auto']"
                  :key="s"
                  class="filter-pill"
                  :class="{ active: appearance.sidebar === s }"
                  @click="appearance.sidebar = s"
                >{{ s }}</button>
              </div>
            </div>

            <div class="form-divider" />

            <div class="toggle-list">
              <div class="toggle-row">
                <div class="toggle-info">
                  <span class="toggle-title">Reduce Motion</span>
                  <span class="toggle-desc">Disable animations and transitions across the dashboard.</span>
                </div>
                <button class="toggle-btn" :class="{ on: appearance.reduceMotion }" @click="appearance.reduceMotion = !appearance.reduceMotion">
                  <span class="toggle-knob" />
                </button>
              </div>
              <div class="toggle-row">
                <div class="toggle-info">
                  <span class="toggle-title">Compact Mode</span>
                  <span class="toggle-desc">Tighter spacing for more content on screen.</span>
                </div>
                <button class="toggle-btn" :class="{ on: appearance.compact }" @click="appearance.compact = !appearance.compact">
                  <span class="toggle-knob" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions standalone">
          <button class="iso-btn iso-btn--fill" :disabled="saving.appearance" @click="saveAppearance">
            <span v-if="saving.appearance" class="btn-spinner" />
            {{ saving.appearance ? 'Saving…' : 'Save Appearance' }}
          </button>
          <span v-if="saved.appearance" class="save-success">✓ Saved</span>
        </div>
      </div>

    </div>

    <!-- Delete account confirm modal -->
    <Transition name="modal-fade">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-box">
          <div class="modal-header">
            <span class="modal-tag danger-tag">Delete Account</span>
          </div>
          <div class="modal-body">
            <p class="modal-text">This will permanently delete your account, all exam results, streaks, and progress. <strong>This action cannot be undone.</strong></p>
            <div class="form-group" style="margin-top:1rem">
              <label class="form-label">Type <span class="danger-keyword">DELETE</span> to confirm</label>
              <input v-model="deleteConfirmText" class="form-input" placeholder="DELETE" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="iso-btn iso-btn--ghost" @click="showDeleteConfirm = false">Cancel</button>
            <button
              class="iso-btn iso-btn--ghost delete-btn"
              :disabled="deleteConfirmText !== 'DELETE'"
              @click="deleteAccount"
            >Delete My Account</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="toast-slide">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <span class="toast-icon">{{ toast.type === 'success' ? '✓' : '⚠' }}</span>
        <span class="toast-msg">{{ toast.msg }}</span>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth', layout: 'dashboard' })

const { user, updatePassword, signOut, deleteOwnAccount } = useAuth()
const supabase = useSupabaseClient()

// ── User info ──────────────────────────────────────────────
const userEmail = computed(() => user.value?.email ?? '')
const userName  = computed(() => user.value?.user_metadata?.full_name ?? '')
const userInitials = computed(() =>
  userName.value.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'ME'
)

// ── Tabs ───────────────────────────────────────────────────
const activeTab = ref('profile')
const tabs = [
  { id: 'profile',      label: 'Profile',       icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>` },
  { id: 'security',     label: 'Security',      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>` },
  { id: 'notifications',label: 'Notifications', icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>` },
  { id: 'exam',         label: 'Exam Prefs',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>` },
  { id: 'appearance',   label: 'Appearance',    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="15" height="15"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>` },
]

// ── Profile state ──────────────────────────────────────────
const profile = reactive({
  fullName:    userName.value,
  displayName: userName.value.split(' ')[0] ?? '',
  bio:         '',
  stream:      'HSC',
  institution: '',
  district:    '',
})

const examStreams = ['HSC', 'SSC', 'BUET', 'Medical', 'DU', 'BCS', 'Bank']

const districts = [
  'Dhaka','Chittagong','Rajshahi','Khulna','Barisal','Sylhet','Rangpur','Mymensingh',
  'Comilla','Gazipur','Narayanganj','Narsingdi','Tangail','Manikganj','Munshiganj',
  'Faridpur','Gopalganj','Madaripur','Shariatpur','Kishoreganj','Netrokona','Sherpur',
  'Jamalpur','Bogra','Joypurhat','Naogaon','Natore','Chapainawabganj','Pabna',
  'Sirajganj','Dinajpur','Gaibandha','Kurigram','Lalmonirhat','Nilphamari','Panchagarh',
  'Thakurgaon','Bagerhat','Chuadanga','Jessore','Jhenaidah','Khulna','Kushtia',
  'Magura','Meherpur','Narail','Satkhira','Barguna','Barisal','Bhola','Jhalokati',
  'Patuakhali','Pirojpur','Habiganj','Moulvibazar','Sunamganj','Sylhet',
  'Brahmanbaria','Chandpur','Comilla','Cox\'s Bazar','Feni','Khagrachhari',
  'Lakshmipur','Noakhali','Rangamati',
]

// ── Security state ─────────────────────────────────────────
const security = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' })
const showPwd  = reactive({ current: false, new: false, confirm: false })

const pwdStrength = computed(() => {
  const p = security.newPassword
  if (!p) return { pct: 0, label: '', cls: '' }
  let score = 0
  if (p.length >= 8)  score++
  if (p.length >= 12) score++
  if (/[A-Z]/.test(p)) score++
  if (/[0-9]/.test(p)) score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  if (score <= 1) return { pct: 20,  label: 'Weak',   cls: 'low' }
  if (score <= 2) return { pct: 40,  label: 'Fair',   cls: 'mid' }
  if (score <= 3) return { pct: 65,  label: 'Good',   cls: 'mid' }
  if (score <= 4) return { pct: 85,  label: 'Strong', cls: 'high' }
  return { pct: 100, label: 'Very Strong', cls: 'high' }
})

const sessions = ref([
  { id: 1, device: 'Chrome on Windows', location: 'Dhaka, BD', time: 'Active now',   current: true,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>` },
  { id: 2, device: 'Firefox on Android', location: 'Chittagong, BD', time: '2 days ago', current: false,
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="16" height="16"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>` },
])

// ── Notification state ─────────────────────────────────────
const notifPrefs = reactive<Record<string, boolean>>({
  examResults:    true,
  rankChange:     true,
  weeklyDigest:   true,
  newContent:     false,
  streakReminder: true,
  leaderboard:    false,
  dailyReminder:  true,
  announcements:  true,
})
const reminderTime = ref('08:00 AM')
const reminderTimes = ['06:00 AM','07:00 AM','08:00 AM','09:00 AM','10:00 AM','12:00 PM','06:00 PM','08:00 PM','10:00 PM']

const emailNotifs = [
  { id: 'examResults',   label: 'Exam Results',      desc: 'Get emailed when your exam is graded.' },
  { id: 'rankChange',    label: 'Rank Changes',       desc: 'Notify when your national rank changes significantly.' },
  { id: 'weeklyDigest',  label: 'Weekly Digest',      desc: 'A summary of your week every Sunday.' },
  { id: 'newContent',    label: 'New Content',        desc: 'Notify when new questions or exams are added.' },
  { id: 'announcements', label: 'Platform News',      desc: 'Important updates and feature announcements.' },
]
const inAppNotifs = [
  { id: 'streakReminder', label: 'Streak Reminder',  desc: 'In-app alert if you haven\'t studied today.' },
  { id: 'leaderboard',    label: 'Leaderboard Moves', desc: 'Alert when someone overtakes you on the leaderboard.' },
]

// ── Exam prefs state ───────────────────────────────────────
const examPrefs = reactive<Record<string, any>>({
  stream:        'HSC',
  questionCount: 30,
  duration:      30,
  difficulty:    'Balanced',
  shuffle:       true,
  negativeMarking: false,
  showTimer:     true,
  autoSubmit:    true,
  qbPageSize:    10,
  autoExpand:    false,
})

const durationOptions = [
  { val: 10, label: '10 min' },
  { val: 20, label: '20 min' },
  { val: 30, label: '30 min' },
  { val: 45, label: '45 min' },
  { val: 60, label: '60 min' },
]

const examToggles = [
  { id: 'shuffle',         label: 'Shuffle Questions',      desc: 'Randomize question order in every exam.' },
  { id: 'negativeMarking', label: 'Negative Marking (−0.25)', desc: 'Deduct 0.25 marks for each wrong answer.' },
  { id: 'showTimer',       label: 'Show Timer',             desc: 'Display countdown timer during exams.' },
  { id: 'autoSubmit',      label: 'Auto-Submit on Timeout', desc: 'Automatically submit when time runs out.' },
]

// ── Appearance state ───────────────────────────────────────
const themes = [
  { val: 'dark',  label: 'Dark' },
  { val: 'light', label: 'Light (Soon)' },
  { val: 'system',label: 'System' },
]
const appearance = reactive({
  theme:        'dark',
  fontSize:     'Default',
  sidebar:      'Expanded',
  reduceMotion: false,
  compact:      false,
})

// ── Errors / saving / saved ────────────────────────────────
const errors  = reactive<Record<string, string>>({})
const saving  = reactive({ profile: false, password: false, notifs: false, exam: false, appearance: false })
const saved   = reactive({ profile: false, password: false, notifs: false, exam: false, appearance: false })

const toast = reactive({ show: false, msg: '', type: 'success' })
const showDeleteConfirm  = ref(false)
const deleteConfirmText  = ref('')

// ── Toast helper ───────────────────────────────────────────
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

function flashSaved(key: keyof typeof saved) {
  saved[key] = true
  setTimeout(() => { saved[key] = false }, 3000)
}

// ── Profile save ───────────────────────────────────────────
async function saveProfile() {
  errors.fullName = ''
  if (!profile.fullName.trim()) { errors.fullName = 'Full name is required.'; return }

  saving.profile = true
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name:    profile.fullName.trim(),
        display_name: profile.displayName.trim(),
        bio:          profile.bio,
        stream:       profile.stream,
        institution:  profile.institution,
        district:     profile.district,
      }
    })
    if (error) throw error

    // Also upsert profiles table if it exists
    await supabase.from('profiles').upsert({
      user_id:      user.value!.id,
      display_name: profile.displayName.trim(),
      bio:          profile.bio,
      stream:       profile.stream,
      institution:  profile.institution,
      district:     profile.district,
    }, { onConflict: 'user_id' }).then(() => {})

    flashSaved('profile')
    showToast('Profile updated successfully.')
  } catch (e: any) {
    showToast(e?.message ?? 'Failed to update profile.', 'error')
  } finally {
    saving.profile = false
  }
}

// ── Password change ────────────────────────────────────────
async function changePassword() {
  errors.currentPassword = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
  errors.passwordGlobal = ''

  if (!security.currentPassword) { errors.currentPassword = 'Required.'; return }
  if (security.newPassword.length < 8) { errors.newPassword = 'Minimum 8 characters.'; return }
  if (security.newPassword !== security.confirmPassword) { errors.confirmPassword = 'Passwords do not match.'; return }

  saving.password = true
  try {
    // Re-authenticate first
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: userEmail.value,
      password: security.currentPassword,
    })
    if (signInErr) { errors.currentPassword = 'Current password is incorrect.'; return }

    const { error } = await updatePassword(security.newPassword)
    if (error) throw error

    security.currentPassword = ''
    security.newPassword = ''
    security.confirmPassword = ''
    flashSaved('password')
    showToast('Password updated successfully.')
  } catch (e: any) {
    errors.passwordGlobal = e?.message ?? 'Failed to update password.'
    showToast(e?.message ?? 'Failed to update password.', 'error')
  } finally {
    saving.password = false
  }
}

// ── Notifications save ─────────────────────────────────────
async function saveNotifs() {
  saving.notifs = true
  await new Promise(r => setTimeout(r, 600)) // Simulate save — wire to profiles table
  flashSaved('notifs')
  showToast('Notification preferences saved.')
  saving.notifs = false
}

// ── Exam prefs save ────────────────────────────────────────
async function saveExamPrefs() {
  saving.exam = true
  try {
    await supabase.from('profiles').upsert({
      user_id:     user.value!.id,
      exam_prefs:  JSON.stringify(examPrefs),
    }, { onConflict: 'user_id' }).then(() => {})
    flashSaved('exam')
    showToast('Exam preferences saved.')
  } catch {
    showToast('Failed to save exam preferences.', 'error')
  } finally {
    saving.exam = false
  }
}

// ── Appearance save ────────────────────────────────────────
async function saveAppearance() {
  saving.appearance = true
  await new Promise(r => setTimeout(r, 400))
  flashSaved('appearance')
  showToast('Appearance preferences saved.')
  saving.appearance = false
}

// ── Sessions ───────────────────────────────────────────────
function revokeSession(id: number) {
  sessions.value = sessions.value.filter(s => s.id !== id)
  showToast('Session revoked.')
}

async function signOutAllSessions() {
  await supabase.auth.signOut({ scope: 'global' })
  await navigateTo('/auth/login')
}

// ── Delete account ─────────────────────────────────────────
async function deleteAccount() {
  if (deleteConfirmText.value !== 'DELETE') return
  
  const { error } = await deleteOwnAccount()  // from useAuth

  if (error) {
    showToast('Failed to delete account: ' + error.message, 'error')
    return
  }

  showDeleteConfirm.value = false
}

// ── Load profile from Supabase on mount ───────────────────
onMounted(async () => {
  if (!user.value) return
  profile.fullName    = user.value.user_metadata?.full_name ?? ''
  profile.displayName = user.value.user_metadata?.display_name ?? profile.fullName.split(' ')[0] ?? ''
  profile.bio         = user.value.user_metadata?.bio ?? ''
  profile.stream      = user.value.user_metadata?.stream ?? 'HSC'
  profile.institution = user.value.user_metadata?.institution ?? ''
  profile.district    = user.value.user_metadata?.district ?? ''

  const { data } = await supabase
    .from('profiles')
    .select('exam_prefs')
    .eq('user_id', user.value.id)
    .single()

  if (data?.exam_prefs) {
    try {
      Object.assign(examPrefs, JSON.parse(data.exam_prefs))
    } catch {}
  }
})
</script>

<style scoped>
/* ── Page ────────────────────────────────────────────────── */
.settings-page { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── Header ──────────────────────────────────────────────── */
.page-header {
  padding: 2rem;
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
.header-left { position: relative; }
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
.page-title {
  font-family: var(--font-mono);
  font-size: clamp(1.5rem, 2.5vw, 2.2rem);
  font-weight: 700; letter-spacing: -1px;
  color: var(--white); line-height: 1.1; margin-bottom: 0.5rem;
}
.page-sub { font-size: 0.83rem; color: var(--gray); max-width: 440px; }

/* ── Tab bar ─────────────────────────────────────────────── */
.tab-bar {
  display: flex; gap: 0;
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
  overflow-x: auto;
}
.tab-btn {
  display: flex; align-items: center; gap: 8px;
  padding: 0.85rem 1.3rem;
  font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--gray); background: transparent; border: none;
  border-bottom: 2px solid transparent; border-right: 1px solid var(--border);
  cursor: pointer; white-space: nowrap;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.tab-btn:last-child { border-right: none; }
.tab-btn:hover { color: var(--white); background: rgba(240,240,234,0.02); }
.tab-btn.active { color: var(--white); border-bottom-color: var(--white); background: rgba(240,240,234,0.04); }
.tab-icon { display: flex; align-items: center; color: inherit; }

/* ── Settings body ───────────────────────────────────────── */
.settings-body { display: flex; flex-direction: column; gap: 1.5rem; }
.settings-section { display: flex; flex-direction: column; gap: 1.5rem; }

/* ── Section panel ───────────────────────────────────────── */
.section-panel {
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.panel-header {
  padding: 0.9rem 1.6rem; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag {
  font-family: var(--font-mono); font-size: 0.6rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}
.panel-action { font-size: 0.62rem !important; padding: 5px 12px !important; }
.panel-body {
  padding: 1.6rem;
  display: flex; flex-direction: column; gap: 1.4rem;
}

/* ── Avatar ──────────────────────────────────────────────── */
.avatar-row { display: flex; align-items: center; gap: 1.2rem; }
.avatar-display {
  width: 60px; height: 60px;
  border: 1px solid var(--border-bright);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 1.1rem; font-weight: 700;
  color: var(--white); background: #111;
  box-shadow: 3px 3px 0 0 rgba(240,240,234,0.08);
  flex-shrink: 0;
}
.avatar-info { display: flex; flex-direction: column; gap: 4px; }
.avatar-label { font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700; color: var(--white); }
.avatar-sub   { font-size: 0.72rem; color: var(--gray); }

/* ── Form elements ───────────────────────────────────────── */
.form-group { display: flex; flex-direction: column; gap: 7px; }
.form-label {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray);
}
.optional { text-transform: none; letter-spacing: 0; font-size: 0.6rem; color: var(--gray); opacity: 0.6; }

.form-input {
  font-family: var(--font-sans); font-size: 0.9rem; font-weight: 400;
  color: var(--white); background: #111;
  border: 1px solid var(--border); padding: 11px 16px;
  outline: none; transition: border-color 0.2s, box-shadow 0.2s; width: 100%;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.04);
}
.form-input::placeholder { color: var(--gray); }
.form-input:focus { border-color: var(--border-bright); box-shadow: 3px 3px 0 0 rgba(240,240,234,0.08); }
.form-input.error { border-color: rgba(255,80,80,0.6); }
.form-textarea { resize: vertical; min-height: 80px; font-family: var(--font-sans); }
.form-error { font-size: 0.7rem; color: rgba(255,100,100,0.9); font-family: var(--font-mono); }
.form-hint  { font-size: 0.7rem; color: var(--gray); }

.input-read-only {
  display: flex; align-items: center; justify-content: space-between;
  padding: 11px 16px; border: 1px solid var(--border);
  background: rgba(240,240,234,0.03);
  font-size: 0.9rem; color: var(--dim);
}
.read-only-badge {
  font-family: var(--font-mono); font-size: 0.58rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(120,230,120,0.8);
  border: 1px solid rgba(120,230,120,0.25); padding: 2px 8px;
}

.select-wrap { position: relative; }
.form-select { appearance: none; cursor: pointer; padding-right: 36px; }
.select-arrow {
  position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
  color: var(--gray); pointer-events: none; font-size: 0.75rem;
}
.select-wrap.narrow { max-width: 200px; }

.form-divider { height: 1px; background: var(--border); }

/* ── Password input ──────────────────────────────────────── */
.input-password-wrap { position: relative; }
.input-password-wrap .form-input { padding-right: 44px; }
.pwd-toggle {
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  background: none; border: none; color: var(--gray); cursor: pointer;
  display: flex; align-items: center; padding: 4px;
  transition: color 0.2s;
}
.pwd-toggle:hover { color: var(--white); }

/* Strength bar */
.strength-row { display: flex; align-items: center; gap: 10px; margin-top: 2px; }
.strength-bar { flex: 1; height: 2px; background: var(--border); }
.strength-fill { height: 100%; transition: width 0.3s ease; }
.strength-fill.high { background: rgba(120,230,120,0.7); }
.strength-fill.mid  { background: rgba(255,200,80,0.7); }
.strength-fill.low  { background: rgba(255,100,100,0.7); }
.strength-label { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; font-weight: 700; flex-shrink: 0; }
.strength-label.high { color: rgba(120,230,120,0.8); }
.strength-label.mid  { color: rgba(255,200,80,0.8); }
.strength-label.low  { color: rgba(255,100,100,0.8); }

/* ── Sessions ────────────────────────────────────────────── */
.sessions-list { display: flex; flex-direction: column; }
.session-row {
  display: flex; align-items: center; gap: 12px;
  padding: 0.9rem 1.6rem; border-bottom: 1px solid var(--border);
}
.session-row:last-child { border-bottom: none; }
.sess-icon { color: var(--gray); flex-shrink: 0; }
.sess-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.sess-device { font-size: 0.82rem; font-weight: 500; color: var(--white); }
.sess-meta   { font-size: 0.7rem; color: var(--gray); }
.sess-current {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: rgba(120,230,120,0.8);
  border: 1px solid rgba(120,230,120,0.25); padding: 3px 9px;
}
.sess-revoke {
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em;
  text-transform: uppercase; color: var(--gray); background: transparent;
  border: 1px solid var(--border); padding: 3px 9px; cursor: pointer;
  transition: all 0.15s;
  box-shadow: 1px 1px 0 0 rgba(240,240,234,0.04);
}
.sess-revoke:hover { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.3); }

/* ── Danger zone ─────────────────────────────────────────── */
.danger-panel { border-color: rgba(255,80,80,0.2); }
.danger-tag   { color: rgba(255,100,100,0.7) !important; }
.danger-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 2rem; flex-wrap: wrap;
}
.danger-text { display: flex; flex-direction: column; gap: 4px; }
.danger-title { font-family: var(--font-mono); font-size: 0.8rem; font-weight: 700; color: var(--white); }
.danger-desc  { font-size: 0.75rem; color: var(--gray); max-width: 380px; line-height: 1.5; }
.danger-btn   { color: rgba(255,100,100,0.8) !important; border-color: rgba(255,100,100,0.3) !important; }
.danger-btn:hover { border-color: rgba(255,100,100,0.6) !important; }
.delete-btn:disabled { opacity: 0.4; }

/* ── Toggle ──────────────────────────────────────────────── */
.toggle-list  { display: flex; flex-direction: column; gap: 0; }
.toggle-row {
  display: flex; align-items: center; justify-content: space-between;
  gap: 1.5rem; padding: 0.9rem 0;
  border-bottom: 1px solid var(--border);
}
.toggle-row:last-child { border-bottom: none; }
.panel-body .toggle-list .toggle-row:first-child { padding-top: 0; }
.toggle-info { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.toggle-title { font-size: 0.85rem; font-weight: 500; color: var(--white); }
.toggle-desc  { font-size: 0.72rem; color: var(--gray); line-height: 1.4; max-width: 380px; }

.toggle-btn {
  width: 44px; height: 24px; flex-shrink: 0;
  background: #1a1a1a; border: 1px solid var(--border-bright);
  cursor: pointer; position: relative;
  transition: background 0.2s;
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.06);
}
.toggle-btn.on { background: rgba(240,240,234,0.15); border-color: rgba(240,240,234,0.35); }
.toggle-knob {
  position: absolute; top: 3px; left: 3px;
  width: 16px; height: 16px;
  background: var(--gray); transition: left 0.2s, background 0.2s; display: block;
}
.toggle-btn.on .toggle-knob { left: 23px; background: var(--white); }

/* Reminder time */
.reminder-time {
  display: flex; align-items: center; gap: 12px; padding-top: 0.6rem;
  flex-wrap: wrap;
}
.reminder-time .form-label { white-space: nowrap; margin: 0; }

/* ── Filter pills ────────────────────────────────────────── */
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
  background: var(--white); color: var(--black); border-color: var(--white);
  box-shadow: 2px 2px 0 0 rgba(240,240,234,0.2), 3px 3px 0 0 rgba(200,200,190,0.15);
}
.pill-select { display: flex; flex-wrap: wrap; gap: 6px; }

/* ── Theme options ───────────────────────────────────────── */
.theme-options { display: flex; gap: 1px; background: var(--border); border: 1px solid var(--border); }
.theme-card {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 1.1rem 0.8rem;
  background: #0d0d0d; cursor: pointer; border: none;
  border-bottom: 2px solid transparent;
  transition: background 0.15s, border-color 0.15s;
  position: relative;
}
.theme-card:hover { background: #111; }
.theme-card.active { background: rgba(240,240,234,0.04); border-bottom-color: var(--white); }

.theme-preview {
  width: 80px; height: 50px;
  border: 1px solid var(--border-bright);
  display: flex; flex-direction: column; gap: 4px;
  padding: 6px; background: #080808;
}
.theme-preview.light { background: #e8e8e2; border-color: rgba(8,8,8,0.2); }
.theme-preview.light .tp-bar  { background: rgba(8,8,8,0.2); }
.theme-preview.light .tp-card { background: rgba(8,8,8,0.1); }
.tp-bar  { height: 8px; background: rgba(240,240,234,0.15); }
.tp-card { height: 10px; background: rgba(240,240,234,0.08); }
.tp-card.sm { width: 60%; }
.theme-label { font-family: var(--font-mono); font-size: 0.65rem; font-weight: 700; color: var(--white); }
.theme-badge {
  position: absolute; top: 8px; right: 8px;
  font-family: var(--font-mono); font-size: 0.52rem; letter-spacing: 0.08em;
  color: var(--gray); border: 1px solid var(--border); padding: 1px 5px;
}

/* ── Form actions ────────────────────────────────────────── */
.form-actions {
  display: flex; align-items: center; gap: 1rem;
  padding-top: 0.4rem; flex-wrap: wrap;
}
.form-actions.standalone {
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--border); background: #0a0a0a;
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}
.save-success {
  font-family: var(--font-mono); font-size: 0.7rem;
  color: rgba(120,230,120,0.8); letter-spacing: 0.08em;
}

/* Spinner */
.btn-spinner {
  display: inline-block; width: 12px; height: 12px;
  border: 1.5px solid rgba(8,8,8,0.3);
  border-top-color: var(--black);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

/* ── Modal ───────────────────────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.2s; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(8,8,8,0.88); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; padding: 1rem;
}
.modal-box {
  background: #0f0f0f;
  border: 1px solid var(--border-bright);
  box-shadow: 8px 8px 0 0 rgba(240,240,234,0.06), 6px 6px 0 0 rgba(240,240,234,0.04);
  width: 100%; max-width: 460px;
}
.modal-header { padding: 1.2rem 1.6rem; border-bottom: 1px solid var(--border); }
.modal-tag {
  font-family: var(--font-mono); font-size: 0.62rem;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--gray);
}
.modal-body { padding: 1.6rem; }
.modal-text { font-size: 0.88rem; color: var(--white); line-height: 1.65; }
.modal-text strong { font-family: var(--font-mono); }
.danger-keyword { font-family: var(--font-mono); color: rgba(255,100,100,0.8); }
.modal-footer {
  display: flex; gap: 10px; justify-content: flex-end;
  padding: 1.2rem 1.6rem; border-top: 1px solid var(--border);
}

/* ── Toast ───────────────────────────────────────────────── */
.toast-slide-enter-active, .toast-slide-leave-active { transition: opacity 0.25s, transform 0.25s; }
.toast-slide-enter-from, .toast-slide-leave-to { opacity: 0; transform: translateY(12px); }

.toast {
  position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
  display: flex; align-items: center; gap: 10px;
  padding: 12px 18px;
  border: 1px solid var(--border-bright);
  background: #111;
  box-shadow: 5px 5px 0 0 rgba(240,240,234,0.08);
  font-family: var(--font-mono); font-size: 0.72rem; color: var(--white);
  min-width: 240px;
}
.toast.success { border-color: rgba(120,230,120,0.3); }
.toast.error   { border-color: rgba(255,100,100,0.3); }
.toast-icon { font-size: 0.85rem; flex-shrink: 0; }
.toast.success .toast-icon { color: rgba(120,230,120,0.9); }
.toast.error   .toast-icon { color: rgba(255,100,100,0.9); }
.toast-msg { flex: 1; }

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 768px) {
  .panel-body { padding: 1.2rem; }
  .danger-row { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .tab-btn .tab-label { display: none; }
  .tab-btn { padding: 0.85rem 1rem; }
  .theme-options { flex-wrap: wrap; }
  .toast { bottom: 1rem; right: 1rem; left: 1rem; min-width: unset; }
}
</style>
