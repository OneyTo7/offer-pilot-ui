import request from './request'
import type { ApiResult, PositionVO } from '../types/api'

export function createPosition(data: {
  title: string
  company: string
  jd_text: string
  resume_id?: number | null
  city?: string
  salary_min?: number
  salary_max?: number
}) {
  // Map frontend field names to backend field names
  const body: Record<string, unknown> = {
    title: data.title,
    company: data.company,
    jd_text: data.jd_text,
    location: data.city || '',
    salary_range: data.salary_min && data.salary_max
      ? `${data.salary_min}k-${data.salary_max}k`
      : '',
  }
  if (data.resume_id) {
    body.resume_id = data.resume_id
  }
  return request.post<ApiResult<PositionVO>>('/positions', body)
}

export function getPositionList() {
  return request.get<ApiResult<PositionVO[]>>('/positions')
}

export function getPositionDetail(id: number) {
  return request.get<ApiResult<PositionVO>>(`/positions/${id}`)
}

export function deletePosition(id: number) {
  return request.delete<ApiResult<null>>(`/positions/${id}`)
}

export function setDefaultPosition(id: number) {
  return request.put<ApiResult<null>>(`/positions/${id}/default`)
}