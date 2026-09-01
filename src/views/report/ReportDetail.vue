<template>
  <div class="report-detail">
    <!-- Loading -->
    <div v-if="loading" class="loading-area">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <template v-if="report">
      <!-- Back button -->
      <button class="back-btn" @click="$router.push('/reports')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回列表
      </button>

      <!-- Header -->
      <div class="report-header">
        <div class="report-header-left">
          <h1 class="report-title">评估报告</h1>
          <p class="report-meta">
            <span class="meta-label">报告编号</span> #{{ report.id }}
            <span class="meta-sep">·</span>
            <span class="meta-label">创建时间</span> {{ formatDate(report.created_at) }}
          </p>
        </div>
        <div v-if="report.content" class="score-hero" :class="matchScoreClass(report.content.match_score)">
          <span class="score-hero-value">{{ report.content.match_score }}</span>
          <span class="score-hero-label">匹配度</span>
        </div>
      </div>

      <div v-if="report.content" class="report-body">
        <!-- Tech Stack Analysis -->
        <section class="section">
          <h2 class="section-title">技术栈分析</h2>
          <div class="tech-stack-grid">
            <div class="tech-card tech-matched">
              <div class="tech-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                匹配技术
              </div>
              <p class="tech-card-body">{{ report.content.tech_stack_analysis.matched }}</p>
            </div>
            <div class="tech-card tech-missing">
              <div class="tech-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                缺失技术
              </div>
              <p class="tech-card-body">{{ report.content.tech_stack_analysis.missing }}</p>
            </div>
            <div class="tech-card tech-recommend">
              <div class="tech-card-header">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                建议补充
              </div>
              <p class="tech-card-body">{{ report.content.tech_stack_analysis.recommendation }}</p>
            </div>
          </div>
        </section>

        <!-- Highlights -->
        <section class="section">
          <h2 class="section-title">亮点</h2>
          <ul class="item-list highlight-list">
            <li v-for="(h, i) in report.content.highlights" :key="i" class="item-row highlight-row">
              <span class="item-bullet"></span>
              {{ h }}
            </li>
          </ul>
          <div v-if="!report.content.highlights?.length" class="empty-hint">暂无亮点数据</div>
        </section>

        <!-- Weaknesses -->
        <section class="section">
          <h2 class="section-title">短板与改进</h2>
          <ul class="item-list weakness-list">
            <li v-for="(w, i) in report.content.weaknesses" :key="i" class="item-row weakness-row">
              <span class="item-bullet"></span>
              {{ w }}
            </li>
          </ul>
          <div v-if="!report.content.weaknesses?.length" class="empty-hint">暂无短板数据</div>
        </section>

        <!-- Full Report -->
        <section v-if="report.content.full_report" class="section">
          <h2 class="section-title">详细报告</h2>
          <div class="full-report-body">{{ report.content.full_report }}</div>
        </section>
      </div>

      <!-- Empty state -->
      <div v-else-if="report.status === 0" class="status-card generating">
        <div class="status-spinner"></div>
        <p class="status-text">报告正在生成中，请稍候...</p>
      </div>
      <div v-else-if="report.status === 2" class="status-card failed">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <p class="status-text">报告生成失败</p>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getReportDetail } from '../../api/report'
import type { ReportVO } from '../../types/api'

const route = useRoute()
const report = ref<ReportVO | null>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getReportDetail(Number(route.params.id))
    report.value = res.data.data
  } finally {
    loading.value = false
  }
})

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function matchScoreClass(score: number) {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}
</script>

<style scoped>
.report-detail {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  color: #1e293b;
  min-height: 60vh;
}

/* ===== Loading ===== */
.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;
  gap: 16px;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { color: #64748b; font-size: 14px; }

/* ===== Back button ===== */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}
.back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

/* ===== Report header ===== */
.report-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 28px;
}
.report-header-left {
  flex: 1;
}
.report-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
}
.report-meta {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
.meta-label { color: #cbd5e1; }
.meta-sep { margin: 0 6px; color: #e2e8f0; }

/* ===== Score hero ===== */
.score-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 88px;
  height: 88px;
  border-radius: 50%;
  flex-shrink: 0;
  line-height: 1;
}
.score-hero-value {
  font-size: 28px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}
.score-hero-label {
  font-size: 11px;
  margin-top: 2px;
  opacity: 0.8;
}
.score-high { background: #ecfdf5; color: #059669; }
.score-mid { background: #eef2ff; color: #4f46e5; }
.score-low { background: #fef2f2; color: #dc2626; }

/* ===== Sections ===== */
.section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px 28px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f1f5f9;
}

/* ===== Tech stack grid ===== */
.tech-stack-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
.tech-card {
  padding: 14px 16px;
  border-radius: 10px;
  border-left: 3px solid;
}
.tech-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}
.tech-card-header svg { width: 16px; height: 16px; }
.tech-card-body {
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
  margin: 0;
}
.tech-matched { background: #f0fdf4; border-left-color: #22c55e; }
.tech-matched .tech-card-header { color: #15803d; }
.tech-matched .tech-card-header svg { stroke: #22c55e; }
.tech-missing { background: #fef2f2; border-left-color: #ef4444; }
.tech-missing .tech-card-header { color: #b91c1c; }
.tech-missing .tech-card-header svg { stroke: #ef4444; }
.tech-recommend { background: #eef2ff; border-left-color: #6366f1; }
.tech-recommend .tech-card-header { color: #4338ca; }
.tech-recommend .tech-card-header svg { stroke: #6366f1; }

/* ===== Item lists ===== */
.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.item-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 8px 0;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
}
.item-row + .item-row { border-top: 1px solid #f8fafc; }
.item-bullet {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: 9px;
}
.highlight-row .item-bullet { background: #22c55e; }
.weakness-row .item-bullet { background: #f59e0b; }

.empty-hint {
  font-size: 13px;
  color: #94a3b8;
  text-align: center;
  padding: 12px 0;
}

/* ===== Full report ===== */
.full-report-body {
  font-size: 14px;
  line-height: 1.9;
  color: #334155;
  white-space: pre-wrap;
}

/* ===== Status cards ===== */
.status-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 48px 24px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  text-align: center;
}
.status-card.generating { color: #6366f1; }
.status-card.failed { color: #ef4444; }
.status-spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
.status-text { font-size: 14px; margin: 0; color: #64748b; }

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .report-detail { padding: 16px 12px 32px; }
  .report-header { flex-direction: column; align-items: flex-start; }
  .section { padding: 18px 16px; }
}
</style>