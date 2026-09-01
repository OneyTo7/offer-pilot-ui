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

/** Update the user's DeepSeek API key (pro mode). */
export function updateApiKey(apiKey: string) {
  return request.put<ApiResult<UserVO>>('/auth/api-key', { api_key: apiKey })
}

/** Clear the user's API key to switch back to free mode. */
export function clearApiKey() {
  return request.delete<ApiResult<UserVO>>('/auth/api-key')
}