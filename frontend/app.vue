<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Global onboarding survey — renders on top of any layout/page -->
    <!-- Only mounts when user is logged in; component handles DB check internally -->
    <OnboardingSurvey v-if="user && !skippedThisSession" />
  </div>
</template>

<script setup lang="ts">
import 'katex/dist/katex.min.css'
const user = useSupabaseUser()
 
// If the user clicked "Skip for now" earlier in this browser session,
// don't remount the modal until they navigate away and come back next session.
const skippedThisSession = ref(false)
 
onMounted(() => {
  skippedThisSession.value = sessionStorage.getItem('onboarding_skipped') === '1'
})
 
// Watch: if user logs out mid-session, clear the skip flag so it can show again on next login
watch(user, (newUser) => {
  if (!newUser) {
    sessionStorage.removeItem('onboarding_skipped')
    skippedThisSession.value = false
  }
})
</script>
