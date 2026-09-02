<template>
  <div class="dashboard">
    <h2 class="page-title">仪表盘</h2>

    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon stat-icon-resume">
              <Document />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.resumeCount }}</div>
              <div class="stat-label">简历数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon stat-icon-position">
              <Briefcase />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.positionCount }}</div>
              <div class="stat-label">目标职位</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon stat-icon-report">
              <DataAnalysis />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.reportCount }}</div>
              <div class="stat-label">评估报告</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6">
        <el-card shadow="never" class="stat-card">
          <div class="stat-inner">
            <div class="stat-icon stat-icon-interview">
              <ChatDotSquare />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.interviewCount }}</div>
              <div class="stat-label">模拟面试</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速入口 + 使用流程 -->
    <el-row :gutter="16" class="row-margin">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><Lightning /></el-icon>
              <span>快速入口</span>
            </div>
          </template>
          <div class="quick-grid">
            <div class="quick-item" @click="$router.push('/resumes')">
              <div class="quick-icon quick-icon-upload">
                <Upload />
              </div>
              <div class="quick-text">
                <span class="quick-title">上传简历</span>
                <span class="quick-desc">支持 PDF 格式</span>
              </div>
            </div>
            <div class="quick-item" @click="$router.push('/positions')">
              <div class="quick-icon quick-icon-target">
                <Aim />
              </div>
              <div class="quick-text">
                <span class="quick-title">添加目标职位</span>
                <span class="quick-desc">输入 JD 要求</span>
              </div>
            </div>
            <div class="quick-item" @click="$router.push('/reports')">
              <div class="quick-icon quick-icon-report">
                <DataAnalysis />
              </div>
              <div class="quick-text">
                <span class="quick-title">生成评估报告</span>
                <span class="quick-desc">AI 分析匹配度</span>
              </div>
            </div>
            <div class="quick-item" @click="$router.push('/interviews')">
              <div class="quick-icon quick-icon-interview">
                <ChatDotSquare />
              </div>
              <div class="quick-text">
                <span class="quick-title">模拟面试</span>
                <span class="quick-desc">三面制 AI 面试</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><TrendCharts /></el-icon>
              <span>使用流程</span>
            </div>
          </template>
          <el-steps direction="vertical" :active="3" align-center class="dashboard-steps">
            <el-step title="上传简历" description="支持 PDF 格式，AI 自动解析" />
            <el-step title="设定目标职位" description="输入公司、职位和 JD 要求" />
            <el-step title="生成评估报告" description="AI 综合评估匹配度" />
            <el-step title="模拟面试" description="三面制 AI 面试，逐题反馈评分" />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>

    <!-- 安全隐私 + 社区 -->
    <el-row :gutter="16" class="row-margin">
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><Lock /></el-icon>
              <span>安全与隐私</span>
            </div>
          </template>
          <div class="info-list">
            <div class="info-item">
              <el-tag size="small" type="success">已加密</el-tag>
              <span>API Key 使用 AES-256-GCM 加密存储</span>
            </div>
            <div class="info-item">
              <el-tag size="small" type="success">已隔离</el-tag>
              <span>所有用户数据按 user_id 严格隔离</span>
            </div>
            <div class="info-item">
              <el-tag size="small" type="warning">透明</el-tag>
              <span>Token 用量实时统计，详情见 <el-link type="primary" @click="$router.push('/ai')">大模型配置</el-link></span>
            </div>
            <div class="info-item">
              <el-tag size="small" type="info">BCrypt</el-tag>
              <span>密码经 BCrypt 哈希存储，不可逆</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card shadow="never" class="content-card">
          <template #header>
            <div class="card-header">
              <el-icon><ChatDotSquare /></el-icon>
              <span>加入社区</span>
            </div>
          </template>
          <div class="info-list">
            <div class="info-item">
              <el-icon class="icon-star"><Star /></el-icon>
              <a href="https://github.com/OneyTo7/offer-pilot" target="_blank" class="community-link">GitHub 给个 Star ⭐</a>
            </div>
            <div class="info-item">
              <el-icon class="icon-wechat"><ChatDotSquare /></el-icon>
              <span>加作者微信：<el-tag size="small">Gonnatobeme</el-tag>（拉你进群）</span>
            </div>
            <div class="info-item">
              <el-icon class="icon-mit"><Reading /></el-icon>
              <span>本项目基于 <a href="https://github.com/OneyTo7/offer-pilot/blob/main/LICENSE" target="_blank">MIT 协议</a> 开源</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
import {
  Document, Briefcase, DataAnalysis, ChatDotSquare,
  Lock, Star, Reading, Lightning, Upload, Aim, TrendCharts,
} from '@element-plus/icons-vue'
import { getResumeList } from '../../api/resume'
import { getPositionList } from '../../api/position'
import { getReportList } from '../../api/report'
import { getInterviewList } from '../../api/interview'

const stats = reactive({
  resumeCount: 0,
  positionCount: 0,
  reportCount: 0,
  interviewCount: 0,
})

onMounted(async () => {
  try {
    const [resumes, positions, reports, interviews] = await Promise.all([
      getResumeList(),
      getPositionList(),
      getReportList(),
      getInterviewList(),
    ])
    stats.resumeCount = resumes.data.data.length
    stats.positionCount = positions.data.data.length
    stats.reportCount = reports.data.data.length
    stats.interviewCount = interviews.data.data.length
  } catch {
    console.warn('Dashboard: failed to load some stats')
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.row-margin {
  margin-top: 16px;
}

/* ===== 统计卡片 ===== */
.stat-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  margin-bottom: 0;
}

.stat-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card-hover);
}

.stat-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 22px;
  flex-shrink: 0;
}

.stat-icon-resume {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.stat-icon-position {
  background: #ecfdf5;
  color: var(--color-success);
}
.stat-icon-report {
  background: #fffbeb;
  color: var(--color-warning);
}
.stat-icon-interview {
  background: #fef2f2;
  color: var(--color-danger);
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  font-family: var(--font-mono);
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 2px;
}

/* ===== 内容卡片 ===== */
.content-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  margin-bottom: 0;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 15px;
  color: var(--color-text-primary);
}

/* ===== 快速入口网格 ===== */
.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.quick-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  background: var(--color-bg-subtle);
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.quick-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

.quick-icon-upload {
  background: var(--color-primary-light);
  color: var(--color-primary);
}
.quick-icon-target {
  background: #ecfdf5;
  color: var(--color-success);
}
.quick-icon-report {
  background: #fffbeb;
  color: var(--color-warning);
}
.quick-icon-interview {
  background: #fef2f2;
  color: var(--color-danger);
}

.quick-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.quick-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.quick-desc {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ===== 使用流程 ===== */
.dashboard-steps {
  padding: 4px 0;
}

.dashboard-steps :deep(.el-step__title) {
  font-size: 14px;
}

.dashboard-steps :deep(.el-step__description) {
  font-size: 13px;
}

/* ===== 信息列表 ===== */
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--color-text-secondary);
}

.icon-star {
  color: #f59e0b;
  font-size: 18px;
}

.icon-wechat {
  color: #10b981;
  font-size: 18px;
}

.icon-mit {
  color: #f59e0b;
  font-size: 18px;
}

.community-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.community-link:hover {
  text-decoration: underline;
}

/* ===== 全局卡片覆盖 ===== */
:deep(.el-card__header) {
  border-bottom: 1px solid var(--color-border-light);
  padding: 16px 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }
}
</style>