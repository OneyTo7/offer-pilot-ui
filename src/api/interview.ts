import request from './request'
import type { ApiResult, SessionVO, InterviewQuestion, InterviewSummaryVO } from '../types/api'

export function createInterview(data: { resume_id: number; position_id: number }) {
  return request.post<ApiResult<SessionVO>>('/interviews', data)
}

export function getInterviewList() {
  return request.get<ApiResult<SessionVO[]>>('/interviews')
}

export function getInterviewDetail(id: number) {
  return request.get<ApiResult<SessionVO>>(`/interviews/${id}`)
}

export function getCurrentQuestion(id: number) {
  return request.get<ApiResult<InterviewQuestion | null>>(`/interviews/${id}/current-question`)
}

export function startRound(id: number) {
  return request.post<ApiResult<{ question: InterviewQuestion }>>(`/interviews/${id}/start-round`)
}

export function skipQuestion(id: number, data: { question_id: number }) {
  return request.post<ApiResult<{ question: InterviewQuestion }>>(`/interviews/${id}/skip`, data)
}

export function endInterview(id: number) {
  return request.post<ApiResult<null>>(`/interviews/${id}/end`)
}

export function getInterviewSummary(id: number) {
  return request.get<ApiResult<InterviewSummaryVO>>(`/interviews/${id}/summary`)
}