import request from './request'
import type { ApiResult, TokenResponse, UserVO } from '../types/api'

export function register(data: { email: string; password: string; nickname: string }) {
  return request.post<ApiResult<TokenResponse>>('/auth/register', data)
}

export function login(data: { email: string; password: string }) {
  return request.post<ApiResult<TokenResponse>>('/auth/login', data)
}

export function getUserInfo() {
  return request.get<ApiResult<UserVO>>('/auth/me')
}

/** Call backend to invalidate the current session token. */
export function logout() {
  return request.post<ApiResult<null>>('/auth/logout')
}

/** Update the user's API key and provider config (pro mode). */
export function updateApiKey(data: { api_key: string; api_base_url?: string; api_model?: string }) {
  return request.put<ApiResult<UserVO>>('/auth/api-key', data)
}

/** Clear the user's API key to switch back to free mode. */
export function clearApiKey() {
  return request.delete<ApiResult<UserVO>>('/auth/api-key')
}