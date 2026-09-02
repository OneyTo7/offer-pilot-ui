import axios, { AxiosError } from 'axios'
import type { InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../utils/token'
import type { ApiResult, TokenResponse } from '../types/api'

const request = axios.create({
  baseURL: '/api/v1',
  timeout: 30000,
})

// 请求拦截器：自动带 Token
request.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器：统一错误处理 + Token 自动刷新
let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

request.interceptors.response.use(
  (response) => {
    const data = response.data as ApiResult
    if (data.code !== 200) {
      // 401 → 未登录或登录过期，清除 token 并跳转登录页
      if (data.code === 401) {
        clearTokens()
        window.location.href = '/login'
        return Promise.reject(new Error(data.message))
      }
      ElMessage.error(data.message || '请求失败')
      return Promise.reject(new Error(data.message))
    }
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 401 且不是刷新 Token 接口 -> 尝试刷新
    if (error.response?.status === 401 && !config.url?.includes('/auth/refresh') && !config._retry) {
      if (isRefreshing) {
        // 等待刷新完成
        return new Promise(resolve => {
          refreshSubscribers.push((token: string) => {
            config.headers.Authorization = `Bearer ${token}`
            resolve(request(config))
          })
        })
      }

      config._retry = true
      isRefreshing = true

      const refreshToken = getRefreshToken()
      if (!refreshToken) {
        clearTokens()
        ElMessage.error('登录已过期，请重新登录')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post<ApiResult<TokenResponse>>('/api/v1/auth/refresh', {
          refresh_token: refreshToken,
        })
        // 后端返回了业务错误（如刷新令牌无效）
        if (res.data.code !== 200 || !res.data.data) {
          throw new Error(res.data.message || '刷新令牌失败')
        }
        const { access_token, refresh_token } = res.data.data
        setTokens(access_token, refresh_token)
        onRefreshed(access_token)
        config.headers.Authorization = `Bearer ${access_token}`
        return request(config)
      } catch (refreshError: any) {
        clearTokens()
        const msg = refreshError?.response?.data?.message || refreshError?.message || '登录已过期，请重新登录'
        ElMessage.error(msg)
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    // 非 401 错误，优先显示后端返回的错误消息
    const msg = (error.response?.data as ApiResult)?.message || error.message || '网络错误'
    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request