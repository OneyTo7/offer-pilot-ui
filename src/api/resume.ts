import request from './request'
import type { ApiResult, ResumeVO, ResumeDetailVO } from '../types/api'

export function uploadResume(file: File, name?: string) {
  const formData = new FormData()
  formData.append('file', file)
  if (name) formData.append('name', name)
  return request.post<ApiResult<ResumeVO>>('/resumes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function getResumeList() {
  return request.get<ApiResult<ResumeVO[]>>('/resumes')
}

export function getResumeDetail(id: number) {
  return request.get<ApiResult<ResumeDetailVO>>(`/resumes/${id}`)
}

export function deleteResume(id: number) {
  return request.delete<ApiResult<null>>(`/resumes/${id}`)
}

export function setDefaultResume(id: number) {
  return request.put<ApiResult<null>>(`/resumes/${id}/default`)
}