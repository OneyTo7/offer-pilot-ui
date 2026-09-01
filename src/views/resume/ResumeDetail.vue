<template>
  <div class="resume-detail">
    <!-- Loading -->
    <div v-if="loading" class="loading-area">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <template v-if="resume">
      <!-- Back button -->
      <button class="back-btn" @click="$router.push('/resumes')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回列表
      </button>

      <!-- Header -->
      <div class="resume-header">
        <div class="resume-header-left">
          <h1 class="resume-name">{{ resume.name }}</h1>
          <span class="status-tag" :class="statusClass(resume.status)">{{ statusLabel(resume.status) }}</span>
        </div>
        <div class="resume-header-meta">
          <span v-if="resume.basic_info?.expected_position" class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
            {{ resume.basic_info.expected_position }}
          </span>
          <span v-if="resume.basic_info?.work_years" class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            {{ resume.basic_info.work_years }}年经验
          </span>
          <span v-if="resume.basic_info?.location" class="meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {{ resume.basic_info.location }}
          </span>
        </div>
      </div>

      <!-- Basic Info -->
      <section v-if="resume.basic_info" class="section">
        <h2 class="section-title">基本信息</h2>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ resume.basic_info.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">手机</span>
            <span class="info-value">{{ resume.basic_info.phone }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ resume.basic_info.email }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">最高学历</span>
            <span class="info-value">{{ resume.basic_info.highest_degree }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">期望薪资</span>
            <span class="info-value">{{ resume.basic_info.expected_salary }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所在地</span>
            <span class="info-value">{{ resume.basic_info.location }}</span>
          </div>
        </div>
      </section>

      <!-- Education -->
      <section v-if="resume.education?.length" class="section">
        <h2 class="section-title">教育经历</h2>
        <div class="timeline">
          <div v-for="(edu, i) in resume.education" :key="i" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-date">{{ edu.start_date }} - {{ edu.end_date || '至今' }}</span>
              </div>
              <p class="timeline-title">
                <strong>{{ edu.school }}</strong>
                <span class="timeline-sub">· {{ edu.major }} · {{ edu.degree }}</span>
              </p>
              <p v-if="edu.description" class="timeline-desc">{{ edu.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Work Experience -->
      <section v-if="resume.work_experience?.length" class="section">
        <h2 class="section-title">工作经历</h2>
        <div class="timeline">
          <div v-for="(work, i) in resume.work_experience" :key="i" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-date">{{ work.start_date }} - {{ work.end_date || '至今' }}</span>
              </div>
              <p class="timeline-title">
                <strong>{{ work.company }}</strong>
                <span class="timeline-sub">· {{ work.position }}</span>
              </p>
              <p v-if="work.responsibilities" class="timeline-desc">{{ work.responsibilities }}</p>
              <div v-if="work.achievements?.length" class="timeline-tags">
                <span v-for="(a, j) in work.achievements" :key="j" class="tag tag-emerald">{{ a }}</span>
              </div>
              <div v-if="work.technologies?.length" class="timeline-techs">
                <span v-for="(t, j) in work.technologies" :key="j" class="tag tag-indigo">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Projects -->
      <section v-if="resume.projects?.length" class="section">
        <h2 class="section-title">项目经历</h2>
        <div class="timeline">
          <div v-for="(proj, i) in resume.projects" :key="i" class="timeline-item">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="timeline-header">
                <span class="timeline-date">{{ proj.start_date }} - {{ proj.end_date || '至今' }}</span>
              </div>
              <p class="timeline-title">
                <strong>{{ proj.name }}</strong>
                <span class="timeline-sub">· {{ proj.role }}</span>
              </p>
              <p v-if="proj.description" class="timeline-desc">{{ proj.description }}</p>
              <p v-if="proj.responsibilities" class="timeline-desc">
                <span class="desc-label">职责：</span>{{ proj.responsibilities }}
              </p>
              <p v-if="proj.highlights" class="timeline-desc timeline-highlight">
                <span class="desc-label">亮点：</span>{{ proj.highlights }}
              </p>
              <div v-if="proj.technologies?.length" class="timeline-techs">
                <span v-for="(t, j) in proj.technologies" :key="j" class="tag tag-indigo">{{ t }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Skills -->
      <section v-if="resume.skills?.length" class="section">
        <h2 class="section-title">技能</h2>
        <div class="skills-section">
          <div v-for="skill in resume.skills" :key="skill.category" class="skill-group">
            <span class="skill-category">{{ skill.category }}</span>
            <div class="skill-tags">
              <span v-for="s in skill.skills" :key="s" class="tag tag-indigo">{{ s }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Summary -->
      <section v-if="resume.summary" class="section">
        <h2 class="section-title">综合评价</h2>
        <div class="summary-body">{{ resume.summary }}</div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getResumeDetail } from '../../api/resume'
import type { ResumeDetailVO } from '../../types/api'

const route = useRoute()
const resume = ref<ResumeDetailVO | null>(null)
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await getResumeDetail(Number(route.params.id))
    resume.value = res.data.data
  } finally {
    loading.value = false
  }
})

function statusClass(status: number) {
  return status === 0 ? 'status-parsing' : status === 1 ? 'status-done' : 'status-failed'
}
function statusLabel(status: number) {
  return status === 0 ? '解析中' : status === 1 ? '已完成' : '失败'
}
</script>

<style scoped>
.resume-detail {
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

/* ===== Resume header ===== */
.resume-header {
  margin-bottom: 24px;
}
.resume-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.resume-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.status-tag {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 20px;
}
.status-parsing { background: #fef3c7; color: #b45309; }
.status-done { background: #d1fae5; color: #065f46; }
.status-failed { background: #fee2e2; color: #b91c1c; }

.resume-header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #64748b;
}
.meta-item svg { stroke: #94a3b8; flex-shrink: 0; }

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

/* ===== Info Grid ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  background: #f1f5f9;
  border: 1px solid #f1f5f9;
  border-radius: 10px;
  overflow: hidden;
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 16px;
  background: #fff;
}
.info-item:nth-child(odd):last-child {
  grid-column: 1 / -1;
}
.info-label {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.info-value {
  font-size: 14px;
  color: #1e293b;
}

/* ===== Timeline ===== */
.timeline {
  position: relative;
  padding-left: 20px;
}
.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  background: #e2e8f0;
}
.timeline-item {
  position: relative;
  padding: 0 0 20px 16px;
}
.timeline-item:last-child { padding-bottom: 0; }
.timeline-marker {
  position: absolute;
  left: -20px;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #6366f1;
  border: 2px solid #eef2ff;
  z-index: 1;
}
.timeline-content {
  min-height: 0;
}
.timeline-header {
  margin-bottom: 4px;
}
.timeline-date {
  font-size: 12px;
  color: #94a3b8;
}
.timeline-title {
  font-size: 14px;
  color: #0f172a;
  margin: 0 0 4px;
  line-height: 1.6;
}
.timeline-sub {
  font-size: 13px;
  color: #64748b;
}
.timeline-desc {
  font-size: 13px;
  color: #475569;
  margin: 4px 0;
  line-height: 1.7;
}
.desc-label {
  font-weight: 500;
  color: #6366f1;
}
.timeline-highlight {
  padding: 6px 10px;
  background: #faf5ff;
  border-radius: 6px;
  border-left: 2px solid #a855f7;
}
.timeline-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
}
.timeline-techs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 6px;
}

/* ===== Tags ===== */
.tag {
  display: inline-block;
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  line-height: 1.5;
}
.tag-indigo { background: #eef2ff; color: #4f46e5; }
.tag-emerald { background: #ecfdf5; color: #059669; }

/* ===== Skills ===== */
.skills-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.skill-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.skill-category {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  min-width: 64px;
  padding-top: 2px;
}
.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* ===== Summary ===== */
.summary-body {
  font-size: 14px;
  line-height: 1.9;
  color: #334155;
  white-space: pre-wrap;
  padding: 4px 0;
}

/* ===== Responsive ===== */
@media (max-width: 640px) {
  .resume-detail { padding: 16px 12px 32px; }
  .section { padding: 18px 16px; }
  .info-grid { grid-template-columns: 1fr; }
  .skill-group { flex-direction: column; gap: 6px; }
}
</style>