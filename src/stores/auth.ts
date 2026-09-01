import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setTokens, clearTokens, getAccessToken } from '../utils/token'
import * as authApi from '../api/auth'
import type { UserVO } from '../types/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserVO | null>(null)
  const isLoggedIn = ref(!!getAccessToken())

  async function login(email: string, password: string) {
    const res = await authApi.login({ email, password })
    const data = res.data.data
    setTokens(data.access_token, data.refresh_token)
    user.value = data.user
    isLoggedIn.value = true
  }

  async function register(email: string, password: string, nickname: string) {
    const res = await authApi.register({ email, password, nickname })
    const data = res.data.data
    setTokens(data.access_token, data.refresh_token)
    user.value = data.user
    isLoggedIn.value = true
  }

  async function fetchUserInfo() {
    try {
      const res = await authApi.getUserInfo()
      user.value = res.data.data
    } catch {
      user.value = null
      isLoggedIn.value = false
    }
  }

  async function logout() {
    try {
      // Notify backend to invalidate tokens
      await authApi.logout()
    } catch {
      // Backend logout is best-effort; always clear local state
    }
    clearTokens()
    user.value = null
    isLoggedIn.value = false
  }

  return { user, isLoggedIn, login, register, fetchUserInfo, logout }
})