<template>
  <nav class="nav">
    <NuxtLink to="/" class="logo">
      CORTEX<span class="logo-gray">404</span>
      <span class="logo-sub">Learn · Build · Engineer</span>
    </NuxtLink>

    <div class="nav-right">
      <a href="#features" class="nav-link">Features</a>
      <a href="#exams" class="nav-link">Exams</a>
      <a href="#testimonials" class="nav-link">Stories</a>

      <template v-if="user">
        <NuxtLink to="/dashboard" class="nav-link">Dashboard</NuxtLink>
        <button class="nav-cta nav-cta--ghost" @click="handleSignOut">Logout</button>
      </template>
      <template v-else>
        <NuxtLink to="/auth/login" class="nav-link">Login</NuxtLink>
        <NuxtLink to="/auth/register" class="nav-cta">Start Free →</NuxtLink>
      </template>
    </div>

    <!-- Mobile hamburger -->
    <button class="hamburger" @click="menuOpen = !menuOpen" aria-label="Menu">
      <span :class="{ open: menuOpen }"></span>
      <span :class="{ open: menuOpen }"></span>
      <span :class="{ open: menuOpen }"></span>
    </button>

    <!-- Mobile menu -->
    <div class="mobile-menu" :class="{ active: menuOpen }">
      <a href="#features" class="mobile-link" @click="menuOpen = false">Features</a>
      <a href="#exams" class="mobile-link" @click="menuOpen = false">Exams</a>
      <a href="#testimonials" class="mobile-link" @click="menuOpen = false">Stories</a>

      <template v-if="user">
        <NuxtLink to="/dashboard" class="mobile-link" @click="menuOpen = false">Dashboard</NuxtLink>
        <button class="mobile-cta" @click="handleSignOut">Logout</button>
      </template>
      <template v-else>
        <NuxtLink to="/auth/login" class="mobile-link" @click="menuOpen = false">Login</NuxtLink>
        <NuxtLink to="/auth/register" class="mobile-cta" @click="menuOpen = false">Start Free →</NuxtLink>
      </template>
    </div>
  </nav>
</template>

<script setup>
const { user, signOut } = useAuth()
const menuOpen = ref(false)

async function handleSignOut() {
  menuOpen.value = false
  await signOut()
}
</script>

<style scoped>
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 500;
  height: 62px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 6vw;
  background: rgba(8, 8, 8, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

.logo {
  font-family: var(--font-mono);
  font-weight: 700; font-size: 1.15rem; letter-spacing: -0.5px;
  color: var(--white);
  display: flex; align-items: center; gap: 10px;
}
.logo-gray { color: var(--gray); }
.logo-sub {
  color: var(--gray); font-weight: 400;
  font-size: 0.62rem; letter-spacing: 0.14em; text-transform: uppercase;
}

.nav-right { display: flex; align-items: center; gap: 28px; }

.nav-link {
  font-size: 0.78rem; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--dim); transition: color 0.2s;
}
.nav-link:hover { color: var(--white); }

.nav-cta {
  font-family: var(--font-mono);
  font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  padding: 9px 20px;
  background: var(--white); color: var(--black);
  transition: background 0.15s, transform 0.15s;
  display: inline-block;
}
.nav-cta:hover { background: #d4d4ce; transform: translateY(-1px); }

.nav-cta--ghost {
  background: transparent; color: var(--dim);
  border: 1px solid var(--border);
  cursor: pointer;
}
.nav-cta--ghost:hover { color: var(--white); border-color: var(--white); background: transparent; }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column; gap: 5px;
  background: none; border: none; cursor: pointer; padding: 4px;
}
.hamburger span {
  display: block; width: 22px; height: 1px;
  background: var(--white); transition: all 0.25s;
}
.hamburger span.open:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.hamburger span.open:nth-child(2) { opacity: 0; }
.hamburger span.open:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* Mobile menu */
.mobile-menu {
  display: none;
  position: fixed; top: 62px; left: 0; right: 0;
  background: rgba(8,8,8,0.97);
  border-bottom: 1px solid var(--border);
  flex-direction: column; padding: 1.5rem 6vw 2rem;
  gap: 1.2rem;
  backdrop-filter: blur(16px);
  transform: translateY(-10px); opacity: 0;
  transition: opacity 0.2s, transform 0.2s;
  pointer-events: none;
}
.mobile-menu.active {
  opacity: 1; transform: translateY(0); pointer-events: all;
}
.mobile-link {
  font-size: 0.9rem; font-weight: 500;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--dim);
}
.mobile-link:hover { color: var(--white); }
.mobile-cta {
  font-family: var(--font-mono);
  font-size: 0.8rem; font-weight: 700;
  text-transform: uppercase;
  padding: 12px 0; color: var(--black);
  background: var(--white); text-align: center;
}

@media (max-width: 700px) {
  .nav-right { display: none; }
  .hamburger { display: flex; }
  .mobile-menu { display: flex; }
  .logo-sub { display: none; }
}
</style>
