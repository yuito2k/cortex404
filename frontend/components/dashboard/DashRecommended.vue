<template>
  <div class="recommend-panel">
    <div class="panel-header">
      <span class="panel-tag">Recommended for You</span>
      <span class="panel-ai-badge">AI Powered</span>
    </div>

    <div class="topic-list">
      <div v-for="topic in topics" :key="topic.name" class="topic-row">
        <div class="topic-left">
          <div class="topic-name-row">
            <span class="topic-name">{{ topic.name }}</span>
            <span class="topic-subject">{{ topic.subject }}</span>
          </div>
          <div class="topic-bar-wrap">
            <div class="topic-bar-fill" :style="{ width: topic.mastery + '%' }" :class="masteryClass(topic.mastery)" />
          </div>
          <div class="topic-meta-row">
            <span class="topic-mastery" :class="masteryClass(topic.mastery)">{{ topic.mastery }}% mastery</span>
            <span class="topic-qs">{{ topic.questions }} questions</span>
          </div>
        </div>
        <a :href="topic.to" class="iso-btn iso-btn--ghost topic-btn">
          Practice
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  topics: {
    name: string
    subject: string
    mastery: number
    questions: number
    to: string
  }[]
}>()

function masteryClass(m: number) {
  if (m >= 75) return 'high'
  if (m >= 45) return 'mid'
  return 'low'
}
</script>

<style scoped>
.recommend-panel {
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
.panel-ai-badge {
  font-family: var(--font-mono);
  font-size: 0.55rem; letter-spacing: 0.14em; text-transform: uppercase;
  padding: 3px 8px; border: 1px solid var(--border-bright); color: var(--gray);
  box-shadow: 1px 1px 0 0 rgba(240,240,234,0.06);
}

.topic-list { display: flex; flex-direction: column; }

.topic-row {
  display: flex; align-items: center; gap: 1.2rem;
  padding: 1.1rem 1.4rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.topic-row:last-child { border-bottom: none; }
.topic-row:hover { background: rgba(240,240,234,0.02); }

.topic-left { flex: 1; display: flex; flex-direction: column; gap: 6px; }

.topic-name-row { display: flex; align-items: baseline; gap: 8px; }
.topic-name {
  font-family: var(--font-mono);
  font-size: 0.8rem; font-weight: 700; color: var(--white);
}
.topic-subject { font-size: 0.68rem; color: var(--gray); }

.topic-bar-wrap { height: 2px; background: var(--border); }
.topic-bar-fill { height: 100%; transition: width 0.8s ease; }
.topic-bar-fill.high { background: rgba(120,230,120,0.6); }
.topic-bar-fill.mid  { background: rgba(255,200,80,0.6); }
.topic-bar-fill.low  { background: rgba(255,100,100,0.6); }

.topic-meta-row { display: flex; justify-content: space-between; }
.topic-mastery { font-size: 0.68rem; font-family: var(--font-mono); }
.topic-mastery.high { color: rgba(120,230,120,0.8); }
.topic-mastery.mid  { color: rgba(255,200,80,0.8); }
.topic-mastery.low  { color: rgba(255,100,100,0.8); }
.topic-qs { font-size: 0.68rem; color: var(--gray); }

.topic-btn {
  font-size: 0.65rem !important;
  padding: 8px 14px !important;
  white-space: nowrap; flex-shrink: 0;
}
</style>
