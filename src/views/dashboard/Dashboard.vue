<template>
  <div class="dashboard">
    <h2>仪表盘</h2>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.resumeCount }}</div>
            <div class="stat-label">简历数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.positionCount }}</div>
            <div class="stat-label">目标职位</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.reportCount }}</div>
            <div class="stat-label">评估报告</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-card">
            <div class="stat-value">{{ stats.interviewCount }}</div>
            <div class="stat-label">模拟面试</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header><span>快速开始</span></template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/resumes')">上传简历</el-button>
            <el-button type="success" @click="$router.push('/positions')">添加目标职位</el-button>
            <el-button type="warning" @click="$router.push('/reports')">生成报告</el-button>
            <el-button type="danger" @click="$router.push('/interviews')">模拟面试</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header><span>使用流程</span></template>
          <el-steps direction="vertical" :active="3" align-center>
            <el-step title="上传简历" description="支持 PDF 格式" />
            <el-step title="设定目标职位" description="输入 JD 要求" />
            <el-step title="生成评估报告" description="AI 分析匹配度" />
            <el-step title="模拟面试" description="三面制 AI 面试" />
          </el-steps>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive } from 'vue'
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
.stat-card {
  text-align: center;
  padding: 10px 0;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}
.quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>