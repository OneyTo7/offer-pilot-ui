import request from './request'
import type { ApiResult, ReportVO } from '../types/api'

export function createReport(data: { resume_id: number; position_id: number }) {
  return request.post<ApiResult<ReportVO>>('/reports', data)
}

export function getReportList() {
  return request.get<ApiResult<ReportVO[]>>('/reports')
}

export function getReportDetail(id: number) {
  return request.get<ApiResult<ReportVO>>(`/reports/${id}`)
}

export function deleteReport(id: number) {
  return request.delete<ApiResult<null>>(`/reports/${id}`)
}