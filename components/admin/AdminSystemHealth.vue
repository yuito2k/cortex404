<template>
  <div class="system-health-panel">
    <div class="panel-header">
      <span class="panel-tag">System Health</span>
      <div class="overall-status" :class="overallStatus">
        <span class="os-dot" />
        <span class="os-label">{{ overallStatus === 'healthy' ? 'Operational' : overallStatus === 'warn' ? 'Degraded' : 'Incident' }}</span>
      </div>
    </div>

    <!-- Service rows -->
    <div class="service-list">
      <div
        v-for="svc in services"
        :key="svc.name"
        class="service-row"
        :class="'svc-' + svc.status"
      >
        <span class="svc-indicator" :class="svc.status" />
        <span class="svc-name">{{ svc.name }}</span>
        <span class="svc-ping mono-sm">{{ svc.ping }}</span>
        <span class="svc-status-label" :class="svc.status">{{ svc.status.toUpperCase() }}</span>
      </div>
    </div>

    <!-- Mini log tail -->
    <div class="log-tail">
      <div class="log-tail-head">
        <span class="panel-tag">Last Log Entries</span>
      </div>
      <div class="log-entries">
        <div
          v-for="(log, i) in logs"
          :key="i"
          class="log-entry"
          :class="'log-' + log.level.toLowerCase()"
        >
          <span class="log-time">{{ log.time }}</span>
          <span class="log-lvl">{{ log.level }}</span>
          <span class="log-msg">{{ log.msg }}</span>
        </div>
      </div>
    </div>

    <!-- Storage bar -->
    <div class="storage-summary">
      <div class="storage-header">
        <span class="panel-tag">DB Storage</span>
        <span class="mono-sm">{{ dbUsed }} / {{ dbTotal }} GB</span>
      </div>
      <div class="storage-track">
        <div
          class="storage-fill"
          :class="(dbUsed / dbTotal) > 0.8 ? 'warn' : 'ok'"
          :style="{ width: (dbUsed / dbTotal * 100) + '%' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  services: { name: string; status: 'healthy' | 'warn' | 'error'; ping: string }[]
  logs: { time: string; level: 'INFO' | 'WARN' | 'ERROR'; msg: string }[]
  dbUsed: number
  dbTotal: number
}>()

const overallStatus = computed(() => {
  if (props.services.some(s => s.status === 'error'))   return 'error'
  if (props.services.some(s => s.status === 'warn'))    return 'warn'
  return 'healthy'
})
</script>

<style scoped>
.system-health-panel {
  border: 1px solid var(--border);
  box-shadow: 4px 4px 0 0 rgba(240,240,234,0.04);
}

.panel-header {
  padding: 1rem 1.4rem;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: center; justify-content: space-between;
}
.panel-tag {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.18em;
  text-transform: uppercase; color: var(--gray);
}

.overall-status {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.12em;
  padding: 3px 10px; border: 1px solid;
}
.overall-status.healthy { color: rgba(120,230,120,0.9); border-color: rgba(120,230,120,0.3); background: rgba(120,230,120,0.05); }
.overall-status.warn    { color: rgba(255,200,80,0.9);  border-color: rgba(255,200,80,0.3);  background: rgba(255,200,80,0.05);  }
.overall-status.error   { color: rgba(255,100,100,0.9); border-color: rgba(255,100,100,0.3); background: rgba(255,100,100,0.05); }

.os-dot { width: 5px; height: 5px; border-radius: 50%; }
.healthy .os-dot { background: rgba(120,230,120,0.9); box-shadow: 0 0 5px rgba(120,230,120,0.5); animation: blink 2s ease-in-out infinite; }
.warn    .os-dot { background: rgba(255,200,80,0.9); }
.error   .os-dot { background: rgba(255,100,100,0.9); }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
.os-label { text-transform: uppercase; }

/* Services */
.service-list { display: flex; flex-direction: column; }

.service-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 1.4rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.service-row:last-child { border-bottom: none; }
.service-row:hover { background: rgba(240,240,234,0.02); }

.svc-indicator {
  width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
}
.svc-indicator.healthy { background: rgba(120,230,120,0.8); box-shadow: 0 0 5px rgba(120,230,120,0.4); }
.svc-indicator.warn    { background: rgba(255,200,80,0.8);  box-shadow: 0 0 5px rgba(255,200,80,0.4);  }
.svc-indicator.error   { background: rgba(255,100,100,0.8); box-shadow: 0 0 5px rgba(255,100,100,0.4); }

.svc-name { flex: 1; font-size: 0.78rem; color: var(--white); }

.mono-sm { font-family: var(--font-mono); font-size: 0.63rem; color: var(--gray); }

.svc-status-label {
  font-family: var(--font-mono); font-size: 0.55rem; letter-spacing: 0.1em;
  padding: 2px 6px; border: 1px solid var(--border);
}
.svc-status-label.healthy { color: rgba(120,230,120,0.8); border-color: rgba(120,230,120,0.2); }
.svc-status-label.warn    { color: rgba(255,200,80,0.8);  border-color: rgba(255,200,80,0.2);  }
.svc-status-label.error   { color: rgba(255,100,100,0.8); border-color: rgba(255,100,100,0.2); }

/* Log tail */
.log-tail { border-top: 1px solid var(--border); }
.log-tail-head { padding: 8px 1.4rem; border-bottom: 1px solid var(--border); }

.log-entries { display: flex; flex-direction: column; max-height: 120px; overflow-y: auto; overflow-x: hidden; }
.log-entries::-webkit-scrollbar { width: 2px; }
.log-entries::-webkit-scrollbar-thumb { background: var(--border-bright); }

.log-entry {
  display: grid; grid-template-columns: 64px 46px 1fr;
  gap: 8px; padding: 5px 1.4rem;
  border-left: 2px solid transparent;
  font-family: var(--font-mono); font-size: 0.62rem;
}
.log-entry.log-error { border-left-color: rgba(255,100,100,0.5); background: rgba(255,100,100,0.03); }
.log-entry.log-warn  { border-left-color: rgba(255,200,80,0.5);  background: rgba(255,200,80,0.03);  }
.log-time { color: var(--gray); }
.log-lvl  { }
.log-entry.log-info  .log-lvl { color: rgba(240,240,234,0.3); }
.log-entry.log-warn  .log-lvl { color: rgba(255,200,80,0.8);  }
.log-entry.log-error .log-lvl { color: rgba(255,100,100,0.8); }
.log-msg  { color: var(--white); opacity: 0.75; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Storage */
.storage-summary { padding: 12px 1.4rem; border-top: 1px solid var(--border); }
.storage-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.storage-track { height: 3px; background: rgba(240,240,234,0.07); }
.storage-fill  { height: 100%; transition: width 0.8s ease; }
.storage-fill.ok   { background: rgba(240,240,234,0.35); }
.storage-fill.warn { background: rgba(255,200,80,0.7); }

@media (max-width: 768px) {
  .service-row   { padding: 7px 1rem; gap: 8px; }
  .svc-name      { font-size: 0.75rem; }
  .mono-sm       { font-size: 0.6rem; }
  /* health-ping hidden — dot color is enough */
  .svc-ping      { display: none; }
  .log-entry     { grid-template-columns: 56px 40px 1fr; gap: 6px; padding: 5px 1rem; font-size: 0.6rem; }
  .log-msg       { font-size: 0.6rem; }
  .storage-summary { padding: 10px 1rem; }
  .panel-header  { padding: 0.8rem 1rem; }
  .log-tail-head { padding: 6px 1rem; }
}

@media (max-width: 480px) {
  .log-entry     { grid-template-columns: 42px 1fr; }
  .log-time      { display: none; }
  .os-label      { display: none; }
  .overall-status{ padding: 3px 8px; }
}
</style>