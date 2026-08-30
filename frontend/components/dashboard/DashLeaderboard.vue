<template>
  <div class="leaderboard-panel">
    <div class="panel-header">
      <span class="panel-tag">Leaderboard</span>
      <a href="/dashboard/leaderboard" class="panel-link">Full board →</a>
    </div>

    <!-- User rank highlight -->
    <div class="your-rank">
      <span class="rank-label">Your National Rank</span>
      <span class="rank-value">#{{ userRank }}</span>
      <span class="rank-total">of {{ totalStudents }}</span>
    </div>

    <div class="lb-list">
      <div
        v-for="entry in entries"
        :key="entry.rank"
        class="lb-row"
        :class="{ 'is-you': entry.isYou }"
      >
        <span class="lb-rank" :class="{ top3: entry.rank <= 3 }">
          {{ entry.rank <= 3 ? medals[entry.rank - 1] : '#' + entry.rank }}
        </span>
        <div class="lb-avatar">{{ entry.initials }}</div>
        <span class="lb-name">{{ entry.name }}</span>
        <div class="lb-bar-wrap">
          <div class="lb-bar-fill" :style="{ width: (entry.score / entries[0].score * 100) + '%' }" />
        </div>
        <span class="lb-score">{{ entry.score.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userRank: number
  totalStudents: string
  entries: {
    rank: number
    name: string
    initials: string
    score: number
    isYou: boolean
  }[]
}>()

const medals = ['🥇', '🥈', '🥉']
</script>

<style scoped>
.leaderboard-panel {
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
.panel-link {
  font-family: var(--font-mono);
  font-size: 0.6rem; letter-spacing: 0.1em;
  text-transform: uppercase; color: var(--gray);
  transition: color 0.2s;
}
.panel-link:hover { color: var(--white); }

.your-rank {
  display: flex; align-items: baseline; gap: 8px;
  padding: 1.2rem 1.4rem;
  border-bottom: 1px solid var(--border);
  background: rgba(240,240,234,0.02);
}
.rank-label {
  font-family: var(--font-mono);
  font-size: 0.6rem; letter-spacing: 0.12em;
  text-transform: uppercase; color: var(--gray);
  flex: 1;
}
.rank-value {
  font-family: var(--font-mono);
  font-size: 1.4rem; font-weight: 700; color: var(--white);
}
.rank-total { font-size: 0.7rem; color: var(--gray); }

.lb-list { display: flex; flex-direction: column; }

.lb-row {
  display: flex; align-items: center; gap: 10px;
  padding: 0.85rem 1.4rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.lb-row:last-child { border-bottom: none; }
.lb-row:hover { background: rgba(240,240,234,0.02); }
.lb-row.is-you {
  background: rgba(240,240,234,0.04);
  border-left: 2px solid var(--white);
}

.lb-rank {
  font-family: var(--font-mono);
  font-size: 0.7rem; font-weight: 700;
  color: var(--gray); width: 32px; flex-shrink: 0;
}
.lb-rank.top3 { font-size: 0.9rem; }

.lb-avatar {
  width: 26px; height: 26px; flex-shrink: 0;
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono); font-size: 0.6rem; font-weight: 700;
  color: var(--white); background: #1a1a1a;
  box-shadow: 1px 1px 0 0 rgba(240,240,234,0.06);
}

.lb-name {
  font-size: 0.78rem; font-weight: 500; color: var(--white);
  flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

.lb-bar-wrap {
  width: 60px; height: 1px; background: var(--border);
  flex-shrink: 0;
}
.lb-bar-fill { height: 100%; background: rgba(240,240,234,0.35); }

.lb-score {
  font-family: var(--font-mono);
  font-size: 0.72rem; font-weight: 700; color: var(--white);
  flex-shrink: 0; width: 52px; text-align: right;
}
</style>
