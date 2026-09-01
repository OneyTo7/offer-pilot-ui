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
          <div class="report-badge">评估报告</div>
          <p class="report-meta">
            <span>编号 #{{ report.id }}</span>
            <span class="meta-sep">·</span>
            <span>{{ formatDate(report.created_at) }}</span>
          </p>
        </div>
      </div>

      <!-- Empty state: generating / failed -->
      <div v-if="report.status === 0" class="status-card generating">
        <div class="status-spinner"></div>
        <p class="status-text">报告正在生成中，请稍候...</p>
      </div>
      <div v-else-if="report.status === 2" class="status-card failed">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <p class="status-text">报告生成失败</p>
        <p v-if="report.error_message" class="status-detail">{{ report.error_message }}</p>
      </div>

      <!-- ===== NEW RICH REPORT ===== -->
      <template v-else-if="analysisData">
        <!-- Score Dashboard -->
        <section class="score-section">
          <div class="score-main">
            <div class="score-ring" :class="scoreRingClass(analysisData.match_score)">
              <span class="score-value">{{ analysisData.match_score }}</span>
              <span class="score-label">综合匹配度</span>
            </div>
            <div class="score-breakdown">
              <div class="breakdown-item" v-for="item in scoreBreakdownItems" :key="item.key">
                <div class="breakdown-header">
                  <span class="breakdown-label">{{ item.label }}</span>
                  <span class="breakdown-value" :class="breakdownClass(item.value)">{{ item.value }}</span>
                </div>
                <div class="breakdown-bar">
                  <div class="breakdown-fill" :style="{ width: item.value + '%', background: breakdownColor(item.value) }"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Skill Analysis -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">技能深度分析</h2>
            <span class="section-desc">逐项评估候选人的技术栈掌握程度与岗位匹配情况</span>
          </div>

          <div v-if="analysisData.skill_analysis.matched?.length" class="skill-group">
            <h3 class="skill-group-title">
              <span class="skill-group-icon matched-icon"></span>
              匹配技能
              <span class="skill-count">{{ analysisData.skill_analysis.matched.length }}</span>
            </h3>
            <div class="skill-grid">
              <div v-for="skill in analysisData.skill_analysis.matched" :key="skill.name" class="skill-card matched">
                <div class="skill-top">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-level" :class="levelClass(skill.level)">{{ skill.level }}</span>
                  <span class="skill-relevance relevance-core" v-if="skill.relevance === '核心'">核心</span>
                  <span class="skill-relevance relevance-important" v-else-if="skill.relevance === '重要'">重要</span>
                  <span class="skill-relevance relevance-plus" v-else>{{ skill.relevance }}</span>
                </div>
                <p class="skill-assessment">{{ skill.assessment }}</p>
              </div>
            </div>
          </div>

          <div v-if="analysisData.skill_analysis.partial?.length" class="skill-group">
            <h3 class="skill-group-title">
              <span class="skill-group-icon partial-icon"></span>
              部分匹配
              <span class="skill-count">{{ analysisData.skill_analysis.partial.length }}</span>
            </h3>
            <div class="skill-grid">
              <div v-for="skill in analysisData.skill_analysis.partial" :key="skill.name" class="skill-card partial">
                <div class="skill-top">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-level level-basic">{{ skill.level }}</span>
                  <span class="priority-tag" :class="priorityClass(skill.priority)">{{ skill.priority }}</span>
                </div>
                <p class="skill-gap"><span class="label">差距：</span>{{ skill.gap }}</p>
                <p class="skill-suggestion">{{ skill.suggestion }}</p>
              </div>
            </div>
          </div>

          <div v-if="analysisData.skill_analysis.missing?.length" class="skill-group">
            <h3 class="skill-group-title">
              <span class="skill-group-icon missing-icon"></span>
              缺失技能
              <span class="skill-count">{{ analysisData.skill_analysis.missing.length }}</span>
            </h3>
            <div class="skill-grid">
              <div v-for="skill in analysisData.skill_analysis.missing" :key="skill.name" class="skill-card missing">
                <div class="skill-top">
                  <span class="skill-name">{{ skill.name }}</span>
                  <span class="skill-relevance" :class="relevanceClass(skill.relevance)">{{ skill.relevance }}</span>
                  <span class="priority-tag" :class="priorityClass(skill.priority)">{{ skill.priority }}</span>
                </div>
                <p class="skill-gap"><span class="label">影响：</span>{{ skill.impact }}</p>
                <p class="skill-suggestion">{{ skill.suggestion }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Project Analysis -->
        <section v-if="analysisData.project_analysis?.length" class="section">
          <div class="section-header">
            <h2 class="section-title">项目经验分析</h2>
            <span class="section-desc">评估项目复杂度、岗位相关性及候选人贡献</span>
          </div>
          <div class="project-list">
            <div v-for="proj in analysisData.project_analysis" :key="proj.name" class="project-card">
              <div class="project-top">
                <h3 class="project-name">{{ proj.name }}</h3>
                <div class="project-tags">
                  <span class="project-tag" :class="relevanceTagClass(proj.relevance)">相关性: {{ proj.relevance }}</span>
                  <span class="project-tag" :class="complexityTagClass(proj.complexity)">复杂度: {{ proj.complexity }}</span>
                </div>
              </div>
              <div class="project-detail">
                <div class="project-field">
                  <span class="field-label">技术栈</span>
                  <span class="field-value">{{ proj.tech_stack }}</span>
                </div>
                <div class="project-field">
                  <span class="field-label">角色贡献</span>
                  <span class="field-value">{{ proj.role_assessment }}</span>
                </div>
                <div class="project-field">
                  <span class="field-label">综合评估</span>
                  <span class="field-value">{{ proj.assessment }}</span>
                </div>
                <div class="project-field suggestion">
                  <span class="field-label">面试建议</span>
                  <span class="field-value">{{ proj.suggestion }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Experience Assessment -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">工作经历评估</h2>
            <span class="section-desc">职业发展轨迹与岗位匹配度分析</span>
          </div>
          <div class="exp-grid">
            <div class="exp-item">
              <span class="exp-label">年限匹配</span>
              <span class="exp-value" :class="matchLevelClass(analysisData.experience_assessment?.years_match)">{{ analysisData.experience_assessment?.years_match || '—' }}</span>
            </div>
            <div class="exp-item">
              <span class="exp-label">职业发展</span>
              <span class="exp-value">{{ analysisData.experience_assessment?.career_progression || '—' }}</span>
            </div>
            <div class="exp-item">
              <span class="exp-label">行业经验</span>
              <span class="exp-value">{{ analysisData.experience_assessment?.industry_relevance || '—' }}</span>
            </div>
          </div>
          <div class="exp-assessment">
            <p>{{ analysisData.experience_assessment?.assessment }}</p>
          </div>
        </section>

        <!-- Education Assessment -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">学历背景评估</h2>
            <span class="section-desc">学历层次与专业相关性分析</span>
          </div>
          <div class="edu-grid">
            <div class="edu-item">
              <span class="edu-label">学历</span>
              <span class="edu-value">{{ analysisData.education_assessment?.degree || '—' }}</span>
            </div>
            <div class="edu-item">
              <span class="edu-label">学校层次</span>
              <span class="edu-value">{{ analysisData.education_assessment?.school_tier || '—' }}</span>
            </div>
            <div class="edu-item">
              <span class="edu-label">专业相关性</span>
              <span class="edu-value">{{ analysisData.education_assessment?.major_relevance || '—' }}</span>
            </div>
          </div>
          <div class="exp-assessment">
            <p>{{ analysisData.education_assessment?.assessment }}</p>
          </div>
        </section>

        <!-- Competitive Advantages -->
        <section v-if="analysisData.competitive_advantages?.length" class="section">
          <div class="section-header">
            <h2 class="section-title">核心竞争优势</h2>
            <span class="section-desc">候选人在该岗位上的差异化优势</span>
          </div>
          <ul class="advantage-list">
            <li v-for="(adv, i) in analysisData.competitive_advantages" :key="i" class="advantage-item">
              <span class="advantage-icon">✦</span>
              <span>{{ adv }}</span>
            </li>
          </ul>
        </section>

        <!-- Weaknesses -->
        <section v-if="analysisData.weaknesses?.length" class="section">
          <div class="section-header">
            <h2 class="section-title">短板与改进</h2>
            <span class="section-desc">需要关注和提升的关键领域</span>
          </div>
          <ul class="weakness-list">
            <li v-for="(w, i) in analysisData.weaknesses" :key="i" class="weakness-item">
              <span class="weakness-icon">!</span>
              <span>{{ w }}</span>
            </li>
          </ul>
        </section>

        <!-- Improvement Roadmap -->
        <section class="section">
          <div class="section-header">
            <h2 class="section-title">提升路线图</h2>
            <span class="section-desc">分阶段行动建议，助力面试准备</span>
          </div>
          <div class="roadmap">
            <div class="roadmap-phase">
              <div class="phase-header short-term">
                <span class="phase-badge">短期</span>
                <span class="phase-time">1-2 周</span>
              </div>
              <ul class="phase-list">
                <li v-for="(item, i) in analysisData.improvement_roadmap?.short_term" :key="i" class="phase-item">{{ item }}</li>
                <li v-if="!analysisData.improvement_roadmap?.short_term?.length" class="phase-item empty">暂无建议</li>
              </ul>
            </div>
            <div class="roadmap-phase">
              <div class="phase-header mid-term">
                <span class="phase-badge">中期</span>
                <span class="phase-time">1-3 个月</span>
              </div>
              <ul class="phase-list">
                <li v-for="(item, i) in analysisData.improvement_roadmap?.mid_term" :key="i" class="phase-item">{{ item }}</li>
                <li v-if="!analysisData.improvement_roadmap?.mid_term?.length" class="phase-item empty">暂无建议</li>
              </ul>
            </div>
            <div class="roadmap-phase">
              <div class="phase-header long-term">
                <span class="phase-badge">长期</span>
                <span class="phase-time">3-6 个月</span>
              </div>
              <ul class="phase-list">
                <li v-for="(item, i) in analysisData.improvement_roadmap?.long_term" :key="i" class="phase-item">{{ item }}</li>
                <li v-if="!analysisData.improvement_roadmap?.long_term?.length" class="phase-item empty">暂无建议</li>
              </ul>
            </div>
          </div>
        </section>

        <!-- Interview Tips -->
        <section v-if="analysisData.interview_tips?.length" class="section">
          <div class="section-header">
            <h2 class="section-title">面试准备建议</h2>
            <span class="section-desc">针对该岗位的面试重点和准备方向</span>
          </div>
          <ul class="tips-list">
            <li v-for="(tip, i) in analysisData.interview_tips" :key="i" class="tip-item">
              <span class="tip-num">{{ i + 1 }}</span>
              <span>{{ tip }}</span>
            </li>
          </ul>
        </section>

        <!-- Full Report -->
        <section v-if="analysisData.full_report" class="section">
          <div class="section-header">
            <h2 class="section-title">综合评估报告</h2>
            <span class="section-desc">完整的多维度详细分析</span>
          </div>
          <div class="full-report-body">{{ analysisData.full_report }}</div>
        </section>
      </template>

      <!-- ===== LEGACY FALLBACK ===== -->
      <template v-else-if="report.content">
        <div class="report-body legacy">
          <!-- Score -->
          <div class="score-hero" :class="scoreRingClass(report.content.match_score)">
            <span class="score-hero-value">{{ report.content.match_score }}</span>
            <span class="score-hero-label">匹配度</span>
          </div>

          <!-- Tech Stack -->
          <section class="section">
            <h2 class="section-title">技术栈分析</h2>
            <div class="tech-stack-grid">
              <div class="tech-card tech-matched">
                <div class="tech-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                  匹配技术
                </div>
                <p class="tech-card-body">{{ report.content.tech_stack_analysis?.matched }}</p>
              </div>
              <div class="tech-card tech-missing">
                <div class="tech-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  缺失技术
                </div>
                <p class="tech-card-body">{{ report.content.tech_stack_analysis?.missing }}</p>
              </div>
              <div class="tech-card tech-recommend">
                <div class="tech-card-header">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                  建议补充
                </div>
                <p class="tech-card-body">{{ report.content.tech_stack_analysis?.recommendation }}</p>
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
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getReportDetail } from '../../api/report'
import type { ReportVO, AnalysisData } from '../../types/api'

const route = useRoute()
const report = ref<ReportVO | null>(null)
const loading = ref(false)

const analysisData = computed<AnalysisData | null>(() => {
  if (!report.value?.content?.analysis_data) return null
  try {
    return JSON.parse(report.value.content.analysis_data) as AnalysisData
  } catch {
    return null
  }
})

const scoreBreakdownItems = computed(() => {
  const ad = analysisData.value
  if (!ad?.score_breakdown) return []
  return [
    { key: 'skill', label: '技能匹配', value: ad.score_breakdown.skill_match },
    { key: 'experience', label: '经验匹配', value: ad.score_breakdown.experience_match },
    { key: 'project', label: '项目匹配', value: ad.score_breakdown.project_match },
    { key: 'education', label: '学历匹配', value: ad.score_breakdown.education_match },
  ]
})

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

function scoreRingClass(score: number) {
  if (score >= 80) return 'score-high'
  if (score >= 60) return 'score-mid'
  return 'score-low'
}

function breakdownClass(value: number) {
  if (value >= 80) return 'bv-high'
  if (value >= 60) return 'bv-mid'
  return 'bv-low'
}

function breakdownColor(value: number) {
  if (value >= 80) return '#059669'
  if (value >= 60) return '#6366f1'
  return '#dc2626'
}

function levelClass(level: string) {
  if (level?.includes('精通')) return 'level-expert'
  if (level?.includes('熟练')) return 'level-advanced'
  return 'level-basic'
}

function priorityClass(priority: string) {
  if (priority === '紧急') return 'priority-urgent'
  if (priority === '重要') return 'priority-important'
  return 'priority-nice'
}

function relevanceClass(relevance: string) {
  if (relevance === '核心') return 'relevance-core'
  if (relevance === '重要') return 'relevance-important'
  return 'relevance-plus'
}

function relevanceTagClass(relevance: string) {
  if (relevance === '高') return 'tag-high'
  if (relevance === '中') return 'tag-mid'
  return 'tag-low'
}

function complexityTagClass(complexity: string) {
  if (complexity === '高') return 'tag-complex'
  if (complexity === '中') return 'tag-mid'
  return 'tag-low'
}

function matchLevelClass(match: string) {
  if (match?.includes('完全匹配') || match?.includes('超出')) return 'match-great'
  if (match?.includes('匹配')) return 'match-good'
  return 'match-low'
}
</script>

<style scoped>
.report-detail {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 16px 64px;
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
  margin-bottom: 24px;
}
.report-badge {
  display: inline-block;
  padding: 4px 14px;
  background: linear-gradient(135deg, #1e40af, #1d4ed8);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.report-meta {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}
.meta-sep { margin: 0 6px; color: #e2e8f0; }

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
.status-detail { font-size: 13px; color: #94a3b8; margin: 0; }

/* ===== Score Section ===== */
.score-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.score-main {
  display: flex;
  align-items: center;
  gap: 40px;
}
.score-ring {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  flex-shrink: 0;
  line-height: 1;
  position: relative;
}
.score-ring::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #fff;
}
.score-value {
  position: relative;
  z-index: 1;
  font-size: 36px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}
.score-label {
  position: relative;
  z-index: 1;
  font-size: 11px;
  margin-top: 2px;
  opacity: 0.8;
}
.score-high { background: conic-gradient(#059669 0deg, #059669 288deg, #e2e8f0 288deg); color: #059669; }
.score-mid { background: conic-gradient(#6366f1 0deg, #6366f1 216deg, #e2e8f0 216deg); color: #4f46e5; }
.score-low { background: conic-gradient(#dc2626 0deg, #dc2626 144deg, #e2e8f0 144deg); color: #dc2626; }

.score-breakdown {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.breakdown-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.breakdown-label {
  font-size: 13px;
  color: #475569;
  font-weight: 500;
}
.breakdown-value {
  font-size: 14px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}
.breakdown-value.bv-high { color: #059669; }
.breakdown-value.bv-mid { color: #4f46e5; }
.breakdown-value.bv-low { color: #dc2626; }
.breakdown-bar {
  height: 6px;
  background: #f1f5f9;
  border-radius: 3px;
  overflow: hidden;
}
.breakdown-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.6s ease;
}

/* ===== Sections ===== */
.section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.section-header {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}
.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 17px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px;
}
.section-desc {
  font-size: 13px;
  color: #94a3b8;
}

/* ===== Skill Analysis ===== */
.skill-group {
  margin-bottom: 20px;
}
.skill-group:last-child { margin-bottom: 0; }
.skill-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 12px;
}
.skill-group-icon {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.matched-icon { background: #22c55e; }
.partial-icon { background: #f59e0b; }
.missing-icon { background: #ef4444; }
.skill-count {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  background: #f1f5f9;
  color: #64748b;
}

.skill-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 640px) {
  .skill-grid { grid-template-columns: 1fr; }
}

.skill-card {
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid;
}
.skill-card.matched {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.skill-card.partial {
  background: #fffbeb;
  border-color: #fde68a;
}
.skill-card.missing {
  background: #fef2f2;
  border-color: #fecaca;
}

.skill-top {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}
.skill-name {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}
.skill-level {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.level-expert {
  background: #d1fae5;
  color: #065f46;
}
.level-advanced {
  background: #dbeafe;
  color: #1e40af;
}
.level-basic {
  background: #fef3c7;
  color: #92400e;
}

.skill-relevance {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 500;
}
.relevance-core {
  background: #dcfce7;
  color: #166534;
}
.relevance-important {
  background: #dbeafe;
  color: #1e40af;
}
.relevance-plus {
  background: #f3e8ff;
  color: #6b21a8;
}

.priority-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 600;
}
.priority-urgent {
  background: #fee2e2;
  color: #991b1b;
}
.priority-important {
  background: #fef3c7;
  color: #92400e;
}
.priority-nice {
  background: #f3e8ff;
  color: #6b21a8;
}

.skill-assessment {
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
  margin: 0;
}
.skill-gap {
  font-size: 13px;
  line-height: 1.6;
  color: #dc2626;
  margin: 0 0 4px;
}
.skill-gap .label {
  color: #64748b;
  font-weight: 500;
}
.skill-suggestion {
  font-size: 13px;
  line-height: 1.6;
  color: #6366f1;
  margin: 0;
}

/* ===== Project Analysis ===== */
.project-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.project-card {
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  background: #fafbfc;
}
.project-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}
.project-name {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}
.project-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.project-tag {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 4px;
  font-weight: 500;
}
.tag-high { background: #d1fae5; color: #065f46; }
.tag-complex { background: #fce7f3; color: #9d174d; }
.tag-mid { background: #dbeafe; color: #1e40af; }
.tag-low { background: #f1f5f9; color: #64748b; }

.project-detail {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.project-field {
  display: flex;
  gap: 8px;
  font-size: 13px;
  line-height: 1.6;
}
.project-field.suggestion {
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}
.field-label {
  flex-shrink: 0;
  width: 64px;
  color: #94a3b8;
  font-weight: 500;
}
.field-value {
  color: #334155;
  flex: 1;
}
.project-field.suggestion .field-label { color: #6366f1; }
.project-field.suggestion .field-value { color: #4338ca; }

/* ===== Experience & Education ===== */
.exp-grid, .edu-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
@media (max-width: 640px) {
  .exp-grid, .edu-grid { grid-template-columns: 1fr; }
}
.exp-item, .edu-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}
.exp-label, .edu-label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}
.exp-value, .edu-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}
.match-great { color: #059669; }
.match-good { color: #6366f1; }
.match-low { color: #dc2626; }

.exp-assessment, .edu-assessment {
  font-size: 14px;
  line-height: 1.7;
  color: #475569;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
}
.exp-assessment p, .edu-assessment p { margin: 0; }

/* ===== Advantages ===== */
.advantage-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.advantage-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
}
.advantage-item + .advantage-item { border-top: 1px solid #f8fafc; }
.advantage-icon {
  flex-shrink: 0;
  color: #f59e0b;
  font-size: 16px;
  margin-top: 2px;
}

/* ===== Weaknesses ===== */
.weakness-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.weakness-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
}
.weakness-item + .weakness-item { border-top: 1px solid #f8fafc; }
.weakness-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #fef2f2;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
}

/* ===== Roadmap ===== */
.roadmap {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}
@media (max-width: 640px) {
  .roadmap { grid-template-columns: 1fr; }
}
.roadmap-phase {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}
.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}
.phase-header.short-term { background: #f0fdf4; }
.phase-header.mid-term { background: #eef2ff; }
.phase-header.long-term { background: #faf5ff; }
.phase-badge {
  font-size: 14px;
  font-weight: 700;
}
.short-term .phase-badge { color: #059669; }
.mid-term .phase-badge { color: #4f46e5; }
.long-term .phase-badge { color: #7c3aed; }
.phase-time {
  font-size: 12px;
  color: #94a3b8;
}
.phase-list {
  list-style: none;
  margin: 0;
  padding: 12px 16px;
}
.phase-item {
  position: relative;
  padding: 6px 0 6px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
}
.phase-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 13px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
}
.phase-item.empty {
  color: #cbd5e1;
  font-style: italic;
}
.phase-item.empty::before { background: #e2e8f0; }

/* ===== Interview Tips ===== */
.tips-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
  font-size: 14px;
  line-height: 1.7;
  color: #334155;
}
.tip-item + .tip-item { border-top: 1px solid #f8fafc; }
.tip-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 700;
  margin-top: 2px;
}

/* ===== Full report ===== */
.full-report-body {
  font-size: 14px;
  line-height: 1.9;
  color: #334155;
  white-space: pre-wrap;
}

/* ===== Legacy fallback ===== */
.legacy .score-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin: 0 auto 24px;
  line-height: 1;
  position: relative;
}
.legacy .score-hero::before {
  content: '';
  position: absolute;
  inset: 4px;
  border-radius: 50%;
  background: #fff;
}
.score-hero-value {
  position: relative;
  z-index: 1;
  font-size: 32px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
}
.score-hero-label {
  position: relative;
  z-index: 1;
  font-size: 11px;
  margin-top: 2px;
  opacity: 0.8;
}
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

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .report-detail { padding: 16px 12px 32px; }
  .report-header { flex-direction: column; align-items: flex-start; }
  .section { padding: 20px 16px; }
  .score-main { flex-direction: column; align-items: center; gap: 24px; }
  .score-breakdown { width: 100%; }
}
</style>