<template>
  <div class="settings-page">
    <h2 class="page-title">设置</h2>

    <el-card shadow="never" class="section-card">
      <template #header>
        <div class="card-header">
          <span>DeepSeek API Key 配置</span>
          <el-tag v-if="hasApiKey" type="success" size="small">专业模式</el-tag>
          <el-tag v-else type="info" size="small">免费模式</el-tag>
        </div>
      </template>

      <div class="intro-text">
        <p>
          配置你自己的 DeepSeek API Key 后，即可解锁<strong>无限使用</strong>权限，不再受每日限额限制。
          你的 Key 仅用于你的请求，不会泄漏给其他用户。
        </p>
        <el-alert v-if="!hasApiKey" :closable="false" type="warning" show-icon class="tier-info">
          <template #title>
            当前为免费模式，每日限生成 {{ DAILY_REPORT_LIMIT }} 份报告、{{ DAILY_INTERVIEW_LIMIT }} 次面试
          </template>
        </el-alert>
        <el-alert v-else :closable="false" type="success" show-icon class="tier-info">
          <template #title>专业模式已启用，无使用限制</template>
        </el-alert>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="160px"
        class="api-key-form"
      >
        <el-form-item label="DeepSeek API Key" prop="apiKey">
          <el-input
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="输入你的 DeepSeek API Key（以 sk- 开头）"
            clearable
            style="max-width: 480px"
          />
        </el-form-item>

        <el-form-item>
          <div class="form-actions">
            <el-button type="primary" :loading="saving" @click="handleSave">
              保存
            </el-button>
            <el-button v-if="hasApiKey" type="danger" plain :loading="clearing" @click="handleClear">
              清除 API Key（切换回免费模式）
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <el-divider />

      <div class="how-to">
        <h4>如何获取 DeepSeek API Key？</h4>
        <ol>
          <li>访问 <a href="https://platform.deepseek.com" target="_blank" rel="noopener">DeepSeek 开放平台</a> 并登录</li>
          <li>进入「API Keys」页面，点击「创建 API Key」</li>
          <li>复制生成的 Key（以 <code>sk-</code> 开头）并粘贴到上方输入框</li>
          <li>点击「保存」即可启用专业模式</li>
        </ol>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { updateApiKey, clearApiKey as clearApiKeyApi } from '../../api/auth'
import type { FormInstance, FormRules } from 'element-plus'

const DAILY_REPORT_LIMIT = 3
const DAILY_INTERVIEW_LIMIT = 1

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const saving = ref(false)
const clearing = ref(false)

const form = ref({
  apiKey: '',
})

const rules: FormRules = {
  apiKey: [
    { required: true, message: '请输入 DeepSeek API Key', trigger: 'blur' },
    { pattern: /^sk-/, message: 'API Key 应以 sk- 开头', trigger: 'blur' },
    { max: 255, message: 'API Key 长度不能超过 255 个字符', trigger: 'blur' },
  ],
}

const hasApiKey = computed(() => {
  return !!authStore.user?.has_api_key
})

function handleSave() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return

    saving.value = true
    try {
      await updateApiKey(form.value.apiKey)
      await authStore.fetchUserInfo()
      ElMessage.success('API Key 保存成功，已启用专业模式')
      form.value.apiKey = ''
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '保存失败'
      ElMessage.error(msg)
    } finally {
      saving.value = false
    }
  })
}

function handleClear() {
  ElMessageBox.confirm('清除 API Key 后将切换回免费模式，每日报告和面试次数将受限制。确定继续？', '确认清除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    clearing.value = true
    try {
      await clearApiKeyApi()
      await authStore.fetchUserInfo()
      ElMessage.success('API Key 已清除，已切换至免费模式')
      form.value.apiKey = ''
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '清除失败'
      ElMessage.error(msg)
    } finally {
      clearing.value = false
    }
  }).catch(() => {
    // cancelled
  })
}

onMounted(() => {
  // Clear the form field if user already has an API key configured
  if (authStore.user?.has_api_key) {
    form.value.apiKey = ''
  }
})
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

.section-card {
  margin-bottom: 20px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.intro-text {
  margin-bottom: 20px;
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.tier-info {
  margin-top: 12px;
}

.api-key-form {
  margin-top: 16px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.how-to {
  line-height: 1.8;
  color: var(--color-text-secondary);
}

.how-to h4 {
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.how-to ol {
  padding-left: 20px;
}

.how-to code {
  background: var(--color-bg-subtle);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
  font-family: var(--font-mono);
}

.how-to a {
  color: var(--color-primary);
}
</style>