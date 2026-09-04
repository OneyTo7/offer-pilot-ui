<template>
  <div class="ai-model">
    <PageContainer title="大模型配置" subtitle="管理 AI 模型接入、查看用量统计">
      <template #action>
        <el-button @click="fetchInfo">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </template>
    </PageContainer>

    <!-- 1. API Key 配置 -->
    <section class="section-card">
      <div class="section-header">
        <el-icon class="section-icon"><Key /></el-icon>
        <div class="section-header-text">
          <h3 class="section-title">API Key 配置</h3>
          <p class="section-desc">配置自己的 DeepSeek API Key 可解锁无限使用</p>
        </div>
      </div>

      <div class="section-body">
        <div v-if="info?.api_key.has_key" class="key-configured">
          <div class="key-status">
            <el-tag type="success" effect="dark" size="small">● 已配置自定义 Key</el-tag>
          </div>
          <div class="key-value-row">
            <el-input :model-value="info.api_key.key_masked" readonly disabled class="key-input">
              <template #suffix>
                <el-tooltip content="清除 Key" placement="top">
                  <el-button text type="danger" @click="handleClearKey">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
            </el-input>
          </div>
          <p class="key-hint">
            <el-icon><InfoFilled /></el-icon>
            配置自己的 DeepSeek API Key 可解锁无限使用，用量不计入平台限制
          </p>
        </div>

        <div v-else class="key-empty">
          <div class="key-status">
            <el-tag type="info" effect="plain" size="small">○ 使用平台默认 Key（免费额度）</el-tag>
          </div>
          <div class="key-form-row">
            <el-input
              v-model="apiKeyInput"
              placeholder="输入你的 DeepSeek API Key (sk-...)"
              show-password
              clearable
              class="key-input"
            >
              <template #append>
                <el-button type="primary" :loading="savingKey" @click="handleSaveKey">保存</el-button>
              </template>
            </el-input>
          </div>
          <p class="key-hint">
            <el-icon><InfoFilled /></el-icon>
            配置后即使用你自己的 DeepSeek 账户，无限制使用所有功能
          </p>
        </div>
      </div>
    </section>

    <!-- 2. Token 用量看板 -->
    <section class="section-card">
      <div class="section-header">
        <el-icon class="section-icon"><DataAnalysis /></el-icon>
        <div class="section-header-text">
          <h3 class="section-title">用量统计</h3>
          <p class="section-desc">查看 Token 消耗情况，透明可控</p>
        </div>
      </div>

      <div class="section-body">
        <!-- 月度用量进度 -->
        <div class="usage-section">
          <div class="usage-label">本月用量</div>
          <div class="usage-progress-row">
            <el-progress
              :percentage="Math.min(info?.plan.usage_percent ?? 0, 100)"
              :format="() => `${formatNumber(info?.plan.used_tokens ?? 0)} / ${formatNumber(info?.plan.monthly_token_limit ?? 0)} tokens`"
              :status="usageStatus"
              :stroke-width="16"
            />
          </div>
        </div>

        <!-- 今日统计 -->
        <div class="today-section">
          <div class="usage-label">今日用量</div>
          <div class="today-stats">
            <div class="stat-item">
              <span class="stat-value mono">{{ formatNumber(info?.usage.today.total_tokens ?? 0) }}</span>
              <span class="stat-label">总 tokens</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <span class="stat-value mono">{{ formatNumber(info?.usage.today.prompt_tokens ?? 0) }}</span>
              <span class="stat-label">输入</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <span class="stat-value mono">{{ formatNumber(info?.usage.today.completion_tokens ?? 0) }}</span>
              <span class="stat-label">输出</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <span class="stat-value mono">{{ info?.plan.daily_report_limit ?? 3 }}</span>
              <span class="stat-label">报告/日</span>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <span class="stat-value mono">{{ info?.plan.daily_interview_limit ?? 1 }}</span>
              <span class="stat-label">面试/日</span>
            </div>
          </div>
        </div>

        <!-- 每日趋势 -->
        <div v-if="dailyData.length > 0" class="trend-section">
          <div class="usage-label">每日趋势（最近 7 天）</div>
          <div class="bar-chart">
            <div class="bar-container">
              <div class="y-axis">
                <span class="mono">{{ maxDaily }}</span>
                <span class="mono">{{ Math.round(maxDaily / 2) }}</span>
                <span class="mono">0</span>
              </div>
              <div class="bars">
                <div v-for="(item, i) in dailyData" :key="i" class="bar-wrapper">
                  <div class="bar-value mono">{{ item.total_tokens > 0 ? formatNumber(item.total_tokens) : '' }}</div>
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
      </div>
    </section>

    <!-- 3. 套餐对比 -->
    <section class="section-card">
      <div class="section-header">
        <el-icon class="section-icon"><Coin /></el-icon>
        <div class="section-header-text">
          <h3 class="section-title">选择套餐</h3>
          <p class="section-desc">按需选择，灵活升级</p>
        </div>
      </div>

      <div class="section-body">
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

          <div class="plan-card plan-coming">
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

          <div class="plan-card plan-coming">
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

        <p class="plans-footer">⚡ 付费功能开发中，敬请期待...</p>
      </div>
    </section>

    <!-- 4. 社区 -->
    <section class="section-card">
      <div class="section-header">
        <el-icon class="section-icon"><ChatDotSquare /></el-icon>
        <div class="section-header-text">
          <h3 class="section-title">加入社区</h3>
          <p class="section-desc">与更多开发者交流面试经验</p>
        </div>
      </div>

      <div class="section-body">
        <div class="community">
          <div class="community-item">
            <el-icon class="community-icon" color="#4f46e5"><Star /></el-icon>
            <div class="community-text">
              <div class="community-title">GitHub Star</div>
              <div class="community-desc">觉得有用？在 GitHub 给个 Star 支持我们！</div>
            </div>
            <el-button size="small" type="primary" @click="openGithub">
              <el-icon><Star /></el-icon> Star
            </el-button>
          </div>

          <div class="community-item">
            <el-icon class="community-icon" color="#059669"><ChatLineSquare /></el-icon>
            <div class="community-text">
              <div class="community-title">作者微信</div>
              <div class="community-desc">添加作者微信，拉你进交流群、反馈问题</div>
            </div>
            <el-button size="small" @click="showQrCode = true">
              <el-icon><Picture /></el-icon> 二维码
            </el-button>
            <el-tag size="small" type="warning" effect="plain" style="margin-left: 8px;">{{ info?.community.author_wechat || 'Gonnatobeme' }}</el-tag>
          </div>
        </div>
      </div>
    </section>

    <!-- 微信群二维码弹窗 -->
    <el-dialog v-model="showQrCode" title="扫码添加作者微信" width="360px" align-center>
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
              <p class="qr-hint">或添加作者微信：{{ info?.community.author_wechat || 'Gonnatobeme' }}</p>
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
import PageContainer from '../../components/PageContainer.vue'

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
  window.open(info.value?.community.github_url || 'https://github.com/OneyTo7/offer-pilot', '_blank')
}

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

/* ===== 卡片区块 ===== */
.section-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  margin-bottom: 20px;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px 0;
}

.section-icon {
  font-size: 20px;
  color: var(--color-primary);
  margin-top: 2px;
}

.section-header-text {
  flex: 1;
}

.section-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.4;
}

.section-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 2px 0 0;
}

.section-body {
  padding: 16px 24px 24px;
}

/* ===== API Key ===== */
.key-status {
  margin-bottom: 12px;
}

.key-value-row,
.key-form-row {
  margin-bottom: 8px;
}

.key-input {
  max-width: 520px;
}

.key-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ===== 用量 ===== */
.usage-section {
  margin-bottom: 24px;
}

.usage-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.usage-progress-row {
  max-width: 500px;
}

.today-section {
  margin-bottom: 24px;
}

.today-stats {
  display: flex;
  align-items: center;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
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
  color: var(--color-text-primary);
}

.stat-value.mono {
  font-family: var(--font-mono);
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

/* ===== 柱状图 ===== */
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
  color: var(--color-text-muted);
  font-size: 11px;
  width: 48px;
  text-align: right;
  padding-right: 8px;
}

.y-axis .mono {
  font-family: var(--font-mono);
}

.bars {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border-bottom: 1px solid var(--color-border);
  border-left: 1px solid var(--color-border);
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
  color: var(--color-text-muted);
  margin-bottom: 2px;
  white-space: nowrap;
}

.bar-value.mono {
  font-family: var(--font-mono);
}

.bar {
  width: 100%;
  max-width: 40px;
  background: linear-gradient(180deg, var(--color-primary), #818cf8);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
  min-height: 4px;
}

.bar-zero {
  background: var(--color-border);
  height: 4px !important;
}

.bar-label {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}

/* ===== 套餐 ===== */
.plans {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.plan-card {
  flex: 1;
  max-width: 260px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
  transition: all 0.25s ease;
  position: relative;
}

.plan-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.12);
}

.plan-card.plan-current {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.plan-card.plan-coming:hover {
  border-color: var(--color-primary);
}

.plan-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.plan-name {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-text-primary);
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
  background: var(--color-primary);
  color: #fff;
}

.plan-card:not(.plan-current) .plan-badge {
  background: var(--color-bg-subtle);
  color: var(--color-text-muted);
}

.plan-price {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 16px;
}

.plan-price small {
  font-size: 14px;
  font-weight: 400;
  color: var(--color-text-muted);
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.plan-features li {
  padding: 6px 0;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.plan-features li::before {
  content: '✓ ';
  color: var(--color-success);
  font-weight: 700;
}

.plans-footer {
  text-align: center;
  margin-top: 20px;
  color: var(--color-text-muted);
  font-size: 13px;
}

/* ===== 社区 ===== */
.community {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.community-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--color-bg-subtle);
  border: 1px solid var(--color-border-light);
  border-radius: var(--radius-md);
  transition: border-color 0.2s ease;
}

.community-item:hover {
  border-color: var(--color-border);
}

.community-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.community-text {
  flex: 1;
  min-width: 0;
}

.community-title {
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.community-desc {
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ===== 二维码弹窗 ===== */
.qr-code {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.qr-placeholder {
  text-align: center;
  color: var(--color-text-muted);
  padding: 40px 0;
}

.qr-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 8px;
}
</style>