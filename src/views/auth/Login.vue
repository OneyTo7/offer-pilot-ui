<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <h2 class="login-title">面壁 OfferPilot</h2>
      <p class="login-subtitle">AI 简历智能平台</p>
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
      <span>🔒 数据加密 · 用户隔离</span>
      <span class="sep">|</span>
      <a href="https://github.com/lidaoqi/offer-pilot" target="_blank">⭐ GitHub</a>
      <span class="sep">|</span>
      <span>📱 加群：lidaoqi_dev</span>
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
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.login-card {
  width: 400px;
}
.login-title {
  text-align: center;
  margin-bottom: 0;
}
.login-subtitle {
  text-align: center;
  color: #999;
  margin-bottom: 24px;
}
.login-btn {
  width: 100%;
}
.login-footer {
  text-align: center;
  color: #666;
}
.login-community {
  margin-top: 16px;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
}
.login-community .sep {
  margin: 0 8px;
  opacity: 0.4;
}
.login-community a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
}
.login-community a:hover {
  text-decoration: underline;
  color: #fff;
}
</style>