import request from './request'
import type { ApiResult } from '../types/api'

export interface AiInfoVO {
  api_key: {
    has_key: boolean
    key_masked: string | null
    updated_at: string | null
  }
  usage: {
    today: {
      total_tokens: number
      prompt_tokens: number
      completion_tokens: number
    }
    monthly_total: number
    daily: {
      date: string
      total_tokens: number
    }[]
  }
  plan: {
    type: string
    monthly_token_limit: number
    daily_report_limit: number
    daily_interview_limit: number
    remaining_tokens: number
    used_tokens: number
    usage_percent: number
  }
  community: {
    github_url: string
    wechat_qr_url: string
    author_wechat: string
  }
}

export function getAiInfo() {
  return request.get<ApiResult<AiInfoVO>>('/ai/info')
}