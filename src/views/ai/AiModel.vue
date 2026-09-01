<template>
  <div class="ai-model">
    <div class="page-header">
      <h2>大模型配置</h2>
    </div>

    <!-- 1. API Key 配置 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><Key /></el-icon>
          <span>API Key 配置</span>
        </div>
      </template>

      <div v-if="info?.api_key.has_key" class="key-configured">
        <div class="key-status">
          <el-tag type="success" effect="dark">● 已配置自定义 Key</el-tag>
        </div>
        <div class="key-value">
          <el-input :model-value="info.api_key.key_masked" readonly disabled>
            <template #suffix>
              <el-tooltip content="清除 Key" placement="top">
                <el-button text type="danger" @click="handleClearKey">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-input>
        </div>
        <div class="key-hint">
          <el-icon><InfoFilled /></el-icon>
          配置自己的 DeepSeek API Key 可解锁无限使用，用量不计入平台限制
        </div>
      </div>

      <div v-else class="key-empty">
        <div class="key-status">
          <el-tag type="info">○ 使用平台默认 Key（免费额度）</el-tag>
        </div>
        <div class="key-form">
          <el-input
            v-model="apiKeyInput"
            placeholder="输入你的 DeepSeek API Key (sk-...)"
            show-password
            clearable
          >
            <template #append>
              <el-button type="primary" :loading="savingKey" @click="handleSaveKey">保存</el-button>
            </template>
          </el-input>
        </div>
        <div class="key-hint">
          <el-icon><InfoFilled /></el-icon>
          配置后即使用你自己的 DeepSeek 账户，无限制使用所有功能
        </div>
      </div>
    </el-card>

    <!-- 2. Token 用量看板 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>用量统计</span>
        </div>
      </template>

      <!-- 月度用量进度 -->
      <div class="usage-section">
        <div class="usage-label">本月用量</div>
        <div class="usage-progress">
          <el-progress
            :percentage="Math.min(info?.plan.usage_percent ?? 0, 100)"
            :format="() => `${formatNumber(info?.plan.used_tokens ?? 0)} / ${formatNumber(info?.plan.monthly_token_limit ?? 0)} tokens`"
            :status="usageStatus"
            :stroke-width="20"
          />
        </div>
      </div>

      <!-- 今日用量 -->
      <div class="today-section">
        <div class="usage-label">今日用量</div>
        <div class="today-stats">
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(info?.usage.today.total_tokens ?? 0) }}</span>
            <span class="stat-label">总 tokens</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(info?.usage.today.prompt_tokens ?? 0) }}</span>
            <span class="stat-label">输入</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-value">{{ formatNumber(info?.usage.today.completion_tokens ?? 0) }}</span>
            <span class="stat-label">输出</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-value">{{ info?.plan.daily_report_limit ?? 3 }}</span>
            <span class="stat-label">报告/日</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-value">{{ info?.plan.daily_interview_limit ?? 1 }}</span>
            <span class="stat-label">面试/日</span>
          </div>
        </div>
      </div>

      <!-- 每日趋势（最近 7 天柱状图） -->
      <div class="trend-section" v-if="dailyData.length > 0">
        <div class="usage-label">每日趋势（最近 7 天）</div>
        <div class="bar-chart">
          <div class="bar-container">
            <div class="y-axis">
              <span>{{ maxDaily }}</span>
              <span>{{ Math.round(maxDaily / 2) }}</span>
              <span>0</span>
            </div>
            <div class="bars">
              <div v-for="(item, i) in dailyData" :key="i" class="bar-wrapper">
                <div class="bar-value">{{ item.total_tokens > 0 ? formatNumber(item.total_tokens) : '' }}</div>
                <div
                  class="bar"
                  :style="{ height: barHeight(item.total_tokens) + '%' }"
                  :class="{ 'bar-zero': item.total_tokens === 0 }"
                />
                <div class="bar-label">{{ formatDate(item.date) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 3. 套餐对比 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><Coin /></el-icon>
          <span>选择套餐</span>
        </div>
      </template>

      <div class="plans">
        <div class="plan-card plan-current">
          <div class="plan-icon">🆓</div>
          <div class="plan-name">免费版</div>
          <div class="plan-badge current">当前套餐</div>
          <div class="plan-price">¥0</div>
          <ul class="plan-features">
            <li>10 万 tokens / 月</li>
            <li>{{ info?.plan.daily_report_limit ?? 3 }} 次报告 / 日</li>
            <li>{{ info?.plan.daily_interview_limit ?? 1 }} 次面试 / 日</li>
            <li>基础支持</li>
          </ul>
        </div>

        <div class="plan-card">
          <div class="plan-icon">🔥</div>
          <div class="plan-name">个人版</div>
          <div class="plan-badge">即将上线</div>
          <div class="plan-price">¥9.9<small>/月</small></div>
          <ul class="plan-features">
            <li>100 万 tokens / 月</li>
            <li>无限报告</li>
            <li>无限面试</li>
            <li>邮件支持</li>
          </ul>
        </div>

        <div class="plan-card">
          <div class="plan-icon">👑</div>
          <div class="plan-name">专业版</div>
          <div class="plan-badge">即将上线</div>
          <div class="plan-price">¥29.9<small>/月</small></div>
          <ul class="plan-features">
            <li>无限 tokens</li>
            <li>无限报告</li>
            <li>无限面试</li>
            <li>专属微信群支持</li>
          </ul>
        </div>
      </div>

      <div class="plans-footer">
        ⚡ 付费功能开发中，敬请期待...
      </div>
    </el-card>

    <!-- 4. 社区 -->
    <el-card class="section-card">
      <template #header>
        <div class="section-title">
          <el-icon><ChatDotSquare /></el-icon>
          <span>加入社区</span>
        </div>
      </template>

      <div class="community">
        <div class="community-item">
          <el-icon class="community-icon" color="#409eff"><Star /></el-icon>
          <div class="community-text">
            <div class="community-title">GitHub Star</div>
            <div class="community-desc">觉得有用？在 GitHub 给个 Star 支持我们！</div>
          </div>
          <el-button type="primary" @click="openGithub">
            <el-icon><Star /></el-icon> Star on GitHub
          </el-button>
        </div>

        <div class="community-item">
          <el-icon class="community-icon" color="#67c23a"><ChatLineSquare /></el-icon>
          <div class="community-text">
            <div class="community-title">微信群</div>
            <div class="community-desc">扫码加入微信群，交流面试经验、获取更新提醒</div>
          </div>
          <el-button @click="showQrCode = true">
            <el-icon><Picture /></el-icon> 查看二维码
          </el-button>
        </div>

        <div class="community-item">
          <el-icon class="community-icon" color="#e6a23c"><User /></el-icon>
          <div class="community-text">
            <div class="community-title">作者微信</div>
            <div class="community-desc">添加作者微信，反馈问题或咨询合作</div>
          </div>
          <el-tag>{{ info?.community.author_wechat || 'lidaoqi_dev' }}</el-tag>
        </div>
      </div>
    </el-card>

    <!-- 微信群二维码弹窗 -->
    <el-dialog v-model="showQrCode" title="扫码加入微信群" width="360px" align-center>
      <div class="qr-code">
        <el-image
          :src="info?.community.wechat_qr_url || ''"
          style="width: 280px; height: 280px"
          fit="contain"
        >
          <template #error>
            <div class="qr-placeholder">
              <el-icon :size="48"><Picture /></el-icon>
              <p>二维码加载中...</p>
              <p style="font-size: 12px; color: #999">或添加作者微信：{{ info?.community.author_wechat || 'lidaoqi_dev' }}</p>
            </div>
          </template>
        </el-image>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAiInfo } from '../../api/ai'
import { updateApiKey, clearApiKey } from '../../api/auth'
import type { AiInfoVO } from '../../api/ai'

const info = ref<AiInfoVO | null>(null)
const apiKeyInput = ref('')
const savingKey = ref(false)
const showQrCode = ref(false)

onMounted(() => {
  fetchInfo()
})

async function fetchInfo() {
  try {
    const res = await getAiInfo()
    info.value = res.data.data
  } catch {
    ElMessage.error('加载大模型信息失败')
  }
}

async function handleSaveKey() {
  if (!apiKeyInput.value.trim()) {
    ElMessage.warning('请输入 API Key')
    return
  }
  savingKey.value = true
  try {
    await updateApiKey(apiKeyInput.value.trim())
    ElMessage.success('API Key 保存成功！已切换至自定义 Key 模式')
    apiKeyInput.value = ''
    await fetchInfo()
  } catch {
    ElMessage.error('保存失败')
  } finally {
    savingKey.value = false
  }
}

async function handleClearKey() {
  try {
    await clearApiKey()
    ElMessage.success('API Key 已清除，已切换至免费模式')
    await fetchInfo()
  } catch {
    ElMessage.error('清除失败')
  }
}

function openGithub() {
  window.open(info.value?.community.github_url || 'https://github.com/lidaoqi/offer-pilot', '_blank')
}

// 每日趋势数据（最近 7 天）
const dailyData = computed(() => {
  const all = info.value?.usage.daily ?? []
  return all.slice(-7)
})

const maxDaily = computed(() => {
  const max = Math.max(...dailyData.value.map(d => d.total_tokens), 1)
  return max
})

function barHeight(tokens: number) {
  if (tokens === 0) return 5
  return Math.max(10, (tokens / maxDaily.value) * 100)
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n.toLocaleString()
}

function formatDate(dateStr: string) {
  const parts = dateStr.split('-')
  return parts[1] + '/' + parts[2]
}

const usageStatus = computed(() => {
  const pct = info.value?.plan.usage_percent ?? 0
  if (pct >= 90) return 'exception'
  if (pct >= 70) return 'warning'
  return 'success'
})
</script>

<style scoped>
.ai-model {
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

/* API Key */
.key-status {
  margin-bottom: 12px;
}

.key-value {
  margin-bottom: 8px;
}

.key-form {
  margin-bottom: 8px;
}

.key-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

/* 用量 */
.usage-section {
  margin-bottom: 24px;
}

.usage-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.today-section {
  margin-bottom: 24px;
}

.today-stats {
  display: flex;
  align-items: center;
  gap: 0;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px 24px;
}

.stat-item {
  flex: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
}

.stat-label {
  font-size: 12px;
  color: #909399;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: #dcdfe6;
}

/* 柱状图 */
.trend-section {
  margin-top: 20px;
}

.bar-chart {
  padding: 16px 0;
}

.bar-container {
  display: flex;
  gap: 8px;
  height: 180px;
  align-items: stretch;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #909399;
  font-size: 11px;
  width: 40px;
  text-align: right;
  padding-right: 8px;
}

.bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border-bottom: 1px solid #dcdfe6;
  border-left: 1px solid #dcdfe6;
  padding-left: 8px;
  padding-bottom: 4px;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  justify-content: flex-end;
}

.bar-value {
  font-size: 10px;
  color: #909399;
  margin-bottom: 2px;
  white-space: nowrap;
}

.bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(180deg, #409eff, #79bbff);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
  min-height: 4px;
}

.bar-zero {
  background: #dcdfe6;
  height: 4px !important;
}

.bar-label {
  font-size: 11px;
  color: #909399;
  margin-top: 4px;
}

/* 套餐 */
.plans {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.plan-card {
  flex: 1;
  max-width: 260px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s;
  position: relative;
}

.plan-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
}

.plan-current {
  border-color: #409eff;
  background: #ecf5ff;
}

.plan-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.plan-name {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.plan-badge {
  display: inline-block;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.plan-badge.current {
  background: #409eff;
  color: #fff;
}

.plan-card:not(.plan-current) .plan-badge {
  background: #f5f7fa;
  color: #909399;
}

.plan-price {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
}

.plan-price small {
  font-size: 14px;
  font-weight: 400;
  color: #909399;
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.plan-features li {
  padding: 6px 0;
  color: #606266;
  font-size: 14px;
}

.plan-features li::before {
  content: '✓ ';
  color: #67c23a;
  font-weight: 700;
}

.plans-footer {
  text-align: center;
  margin-top: 20px;
  color: #909399;
  font-size: 13px;
}

/* 社区 */
.community {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.community-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.community-icon {
  font-size: 28px;
}

.community-text {
  flex: 1;
}

.community-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.community-desc {
  font-size: 13px;
  color: #909399;
}

/* 二维码弹窗 */
.qr-code {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.qr-placeholder {
  text-align: center;
  color: #909399;
  padding: 40px 0;
}
</style>