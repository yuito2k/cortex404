<template>
  <div class="download-section">
    <p class="section-tag centered">Get the App</p>
    <h2>Your Exam.<br />Your Pace.<br />Your Cortex.</h2>
    <p class="dl-sub">Download the app and start practicing for free today.</p>

    <div class="dl-btns">
      <a href="#" class="dl-btn">
        <span class="dl-icon">⬛</span>
        <div class="dl-text">
          <span class="dl-small">Download on the</span>
          <span class="dl-main">App Store</span>
        </div>
      </a>
      <a href="#" class="dl-btn">
        <span class="dl-icon">▶</span>
        <div class="dl-text">
          <span class="dl-small">Get it on</span>
          <span class="dl-main">Google Play</span>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.download-section {
  text-align: center;
  background: #0d0d0d;
  padding: 100px 6vw;
  position: relative;
  overflow: hidden;
}
.download-section::before {
  content: 'CORTEX404';
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-mono); font-weight: 700;
  font-size: clamp(5rem, 14vw, 11rem);
  color: rgba(255,255,255,0.022);
  white-space: nowrap; pointer-events: none;
  letter-spacing: -4px;
}

.section-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--gray); display: flex; align-items: center; gap: 10px;
  margin-bottom: 1.5rem;
}
.section-tag::before { content: ''; flex: 0 0 22px; height: 1px; background: var(--gray); }
.centered { justify-content: center; }

h2 {
  font-family: var(--font-mono); font-weight: 700;
  font-size: clamp(1.8rem, 2.8vw, 2.5rem);
  letter-spacing: -1px; line-height: 1.15;
  color: var(--white);
  margin: 0 auto 1rem; max-width: 600px;
}

.dl-sub { font-size: 0.93rem; color: var(--dim); margin-bottom: 2.5rem; }

.dl-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }

.dl-btn {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 22px;
  border: 1px solid var(--border-bright);
  background: transparent; color: var(--white);
  text-decoration: none; min-width: 165px;
  transition: background 0.2s, border-color 0.2s;
}
.dl-btn:hover { background: rgba(255,255,255,0.05); border-color: var(--white); }

.dl-icon { font-size: 1.4rem; line-height: 1; }
.dl-text { display: flex; flex-direction: column; gap: 1px; text-align: left; }
.dl-small { font-size: 0.6rem; color: var(--gray); text-transform: uppercase; letter-spacing: 0.1em; }
.dl-main { font-family: var(--font-mono); font-size: 0.82rem; font-weight: 700; }
</style>
