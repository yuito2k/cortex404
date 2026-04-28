<template>
  <section class="hero">
    <!-- Top-left corner bracket -->
    <div class="corner-tl" aria-hidden="true" />

    <div class="hero-left">
      <div class="chip">
        <span class="chip-dot" />
        {{ t('hero.chip') }}
      </div>

      <h1>
        {{ t('hero.headline1') }}<br />
        <span class="text-outline">{{ t('hero.headline2') }}</span><br />
        {{ t('hero.headline3') }}
      </h1>

      <p class="hero-desc">
        {{ t('hero.subheadline') }}
      </p>

      <div class="hero-btns">
        <NuxtLink to="/auth/register" class="iso-btn iso-btn--fill">{{ t('hero.ctaPrimary') }}</NuxtLink>
        <a href="#features" class="iso-btn iso-btn--ghost">{{ t('hero.ctaSecondary') }}</a>
      </div>

      <div class="hero-stats">
        <div v-for="s in stats" :key="s.label" class="stat">
          <span class="stat-n">{{ s.value }}</span>
          <span class="stat-l">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <div class="hero-right">
      <canvas ref="canvasRef" class="neural-canvas" />
    </div>

    <!-- Bottom-right corner bracket -->
    <div class="corner-br" aria-hidden="true" />
  </section>
</template>

<script setup>
const { t, ta } = useI18n()

const stats = computed(() => ta('hero.stats'))
const canvasRef = ref(null)

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = 460, H = 460
  canvas.width = W
  canvas.height = H

  const layers = [
    [0.18, 0.35, 0.52, 0.69, 0.86],
    [0.25, 0.42, 0.59, 0.76],
    [0.25, 0.42, 0.59, 0.76],
    [0.18, 0.35, 0.52, 0.69, 0.86],
  ]
  const lx = [0.14, 0.38, 0.62, 0.86]
  let t = 0
  let raf

  function draw() {
    ctx.clearRect(0, 0, W, H)
    t += 0.011

    const nodes = layers.map((ys, li) =>
      ys.map(y => ({ x: lx[li] * W, y: y * H }))
    )

    // Connections
    for (let li = 0; li < nodes.length - 1; li++) {
      for (const ni of nodes[li]) {
        for (const nj of nodes[li + 1]) {
          const pulse = (Math.sin(t + ni.y * 0.025 + nj.y * 0.018) + 1) / 2
          ctx.strokeStyle = `rgba(210,210,200,${0.04 + pulse * 0.12})`
          ctx.lineWidth = 0.9
          ctx.beginPath()
          ctx.moveTo(ni.x, ni.y)
          ctx.lineTo(nj.x, nj.y)
          ctx.stroke()
        }
      }
    }

    // Input / output connector lines
    ctx.strokeStyle = 'rgba(210,210,200,0.18)'
    ctx.lineWidth = 1
    nodes[0].forEach(n => {
      ctx.beginPath(); ctx.moveTo(0, n.y); ctx.lineTo(n.x, n.y); ctx.stroke()
    })
    nodes[3].forEach(n => {
      ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(W, n.y); ctx.stroke()
    })

    // Nodes
    nodes.forEach((layer, li) => {
      layer.forEach((n, ni) => {
        const glow = (Math.sin(t * 1.2 + li * 1.3 + ni * 0.9) + 1) / 2

        ctx.shadowColor = `rgba(255,255,255,${0.25 + glow * 0.5})`
        ctx.shadowBlur = 10 + glow * 18

        ctx.strokeStyle = `rgba(210,210,200,${0.35 + glow * 0.55})`
        ctx.lineWidth = 1.3
        ctx.beginPath(); ctx.arc(n.x, n.y, 12, 0, Math.PI * 2); ctx.stroke()

        ctx.strokeStyle = `rgba(180,180,170,${0.2 + glow * 0.3})`
        ctx.lineWidth = 0.8
        ctx.beginPath(); ctx.arc(n.x, n.y, 7, 0, Math.PI * 2); ctx.stroke()

        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 10)
        grad.addColorStop(0, `rgba(255,255,255,${0.55 + glow * 0.45})`)
        grad.addColorStop(1, `rgba(60,60,60,${0.15 + glow * 0.25})`)
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(n.x, n.y, 10, 0, Math.PI * 2); ctx.fill()

        ctx.shadowBlur = 0
      })
    })

    // Corner brackets
    const m = 16, s = 30
    ctx.strokeStyle = 'rgba(200,200,190,0.28)'
    ctx.lineWidth = 1.2
    ;[[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, dx, dy]) => {
      ctx.beginPath()
      ctx.moveTo(x, y + dy * s); ctx.lineTo(x, y); ctx.lineTo(x + dx * s, y)
      ctx.stroke()
    })

    // Faint science symbols
    ctx.font = '12px "Space Mono", monospace'
    ctx.fillStyle = 'rgba(180,180,170,0.12)'
    ctx.fillText('E = mc²', 20, 34)
    ctx.fillText('∫π', W * 0.35, 32)
    ctx.fillText('IFx = 0', W - 88, H * 0.6)
    ctx.fillText('i = Id', W - 76, H * 0.82)
    ctx.fillText('F△', W * 0.38, 56)

    raf = requestAnimationFrame(draw)
  }

  draw()

  onUnmounted(() => cancelAnimationFrame(raf))
})
</script>

<style scoped>
/* ── Base (desktop ≥ 1024px) ─────────────────────────────── */
.hero {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 3rem;
  padding: 120px 6vw 80px;
  position: relative;
  overflow: hidden;
}

/* Corner brackets */
.corner-tl {
  position: absolute; top: 88px; left: 4vw;
  width: 50px; height: 50px;
  border-top: 1px solid var(--border-bright);
  border-left: 1px solid var(--border-bright);
  pointer-events: none;
}
.corner-br {
  position: absolute; bottom: 40px; right: 4vw;
  width: 50px; height: 50px;
  border-bottom: 1px solid var(--border-bright);
  border-right: 1px solid var(--border-bright);
  pointer-events: none;
}

.hero-left {
  position: relative; z-index: 2;
  max-width: 580px;
}

/* Chip */
.chip {
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--gray); border: 1px solid var(--border-bright);
  padding: 6px 14px; margin-bottom: 1.8rem;
}
.chip-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: var(--white); flex-shrink: 0;
  animation: blink 2s infinite;
}

h1 {
  margin-bottom: 1.4rem;
  /* h1 size comes from global.css — no override needed */
}

.hero-desc {
  font-size: 1rem; font-weight: 300; line-height: 1.75;
  color: var(--dim); max-width: 480px; margin-bottom: 2.4rem;
}

/* Buttons */
.hero-btns {
  display: flex; gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

/* Stats row */
.hero-stats {
  display: flex;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}
.stat {
  display: flex; flex-direction: column; gap: 3px;
  padding: 0 2.2rem 0 0;
  border-right: 1px solid var(--border);
  margin-right: 2.2rem;
}
.stat:last-child { border-right: none; margin-right: 0; padding-right: 0; }
.stat-n {
  font-family: var(--font-mono);
  font-weight: 700; font-size: 1.6rem; color: var(--white);
  letter-spacing: -0.5px; line-height: 1;
}
.stat-l {
  font-size: 0.65rem; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--gray);
  margin-top: 4px;
}

/* Canvas */
.hero-right {
  display: flex; justify-content: center; align-items: center;
}
.neural-canvas {
  width: 100%; max-width: 460px;
  filter: drop-shadow(0 0 30px rgba(255,255,255,0.05));
  animation: floatY 5s ease-in-out infinite;
}

/* ── Tablet landscape (≤ 1100px) ─────────────────────────── */
@media (max-width: 1100px) {
  .hero {
    gap: 2rem;
    padding: 110px 5vw 70px;
  }
  .neural-canvas { max-width: 380px; }
}

/* ── Tablet portrait (≤ 900px) ───────────────────────────── */
@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 110px 6vw 60px;
    gap: 0;
  }

  .hero-left { max-width: 100%; }

  /* Show canvas below content at tablet, smaller size */
  .hero-right {
    display: flex;
    margin-top: 2.5rem;
    justify-content: center;
  }
  .neural-canvas {
    max-width: 320px;
    opacity: 0.7;
    animation: none; /* reduce motion on smaller screens */
  }

  .hero-desc { max-width: 100%; }

  .corner-br { display: none; }
}

/* ── Mobile (≤ 640px) ────────────────────────────────────── */
@media (max-width: 640px) {
  .hero {
    padding: 100px 5vw 50px;
  }

  .chip {
    font-size: 0.6rem;
    padding: 5px 12px;
    margin-bottom: 1.4rem;
  }

  .hero-desc {
    font-size: 0.92rem;
    margin-bottom: 2rem;
  }

  /* Stack buttons vertically */
  .hero-btns {
    flex-direction: column;
    gap: 10px;
    margin-bottom: 2.5rem;
  }
  .hero-btns :deep(.iso-btn),
  .hero-btns a,
  .hero-btns button {
    width: 100%;
    text-align: center;
    justify-content: center;
  }

  /* Compress stats */
  .hero-stats { padding-top: 1.6rem; }
  .stat {
    padding-right: 1.4rem;
    margin-right: 1.4rem;
  }
  .stat-n { font-size: 1.3rem; }
  .stat-l { font-size: 0.6rem; }

  /* Hide canvas on small phones */
  .hero-right { display: none; }

  .corner-tl { top: 72px; left: 3vw; }
  .corner-br { display: none; }
}

/* ── Very small (≤ 380px) ────────────────────────────────── */
@media (max-width: 380px) {
  .hero { padding: 90px 4vw 40px; }

  .chip { font-size: 0.55rem; letter-spacing: 0.12em; }

  .hero-desc { font-size: 0.88rem; line-height: 1.65; }

  .stat-n { font-size: 1.1rem; }

  /* When stats get too cramped, stack them */
  .hero-stats {
    flex-direction: column;
    gap: 1rem;
    border-top: 1px solid var(--border);
  }
  .stat {
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 0;
    border-right: none;
    margin-right: 0;
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }
  .stat:last-child { border-bottom: none; padding-bottom: 0; }
  .stat-n { font-size: 1.2rem; min-width: 60px; }
}
</style>
