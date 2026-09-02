<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <h2 class="login-title">面壁 OfferPilot</h2>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </div>
    </el-card>
    <div class="login-community">
      <span class="community-item">🔒 数据加密 · 用户隔离</span>
      <span class="community-sep">|</span>
      <a class="community-item" href="https://github.com/OneyTo7/offer-pilot" target="_blank">⭐ GitHub</a>
      <span class="community-sep">|</span>
      <span class="community-item">📱 加作者：Gonnatobeme</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref()
const loading = ref(false)

const form = reactive({
  email: '',
  password: '',
})

const rules = {
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    await authStore.login(form.email, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (e: unknown) {
    ElMessage.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, #1e293b 100%);
}
.login-card {
  width: 400px;
  border-radius: var(--radius-xl);
  margin: auto;
}
.login-title {
  text-align: center;
  margin-bottom: 0;
  font-family: var(--font-display);
  font-size: 24px;
  color: var(--color-text-primary);
}
.login-btn {
  width: 100%;
}
.login-footer {
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 13px;
}
.login-footer a {
  color: var(--color-primary);
}
.login-community {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 24px 32px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  flex-wrap: wrap;
}
.login-community .community-sep {
  opacity: 0.4;
  color: rgba(255, 255, 255, 0.4);
}
.login-community .community-item {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
}
.login-community a.community-item:hover {
  text-decoration: underline;
  color: #fff;
}
</style>