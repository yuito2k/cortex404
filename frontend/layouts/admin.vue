<template>
  <div class="admin-layout">
    <slot />
  </div>
</template>

<style>
/* Reset any dashboard layout margins the slot might inherit */
.admin-layout {
  min-height: 100vh;
  background: var(--black);
  display: flex;
  flex-direction: column;
}
</style>
