import request from './request'
import type { ApiResult, KnowledgeDocumentVO, KnowledgeDocumentDetailVO } from '../types/api'

export function createKnowledge(data: {
  title: string
  content_type: string
  content?: string
  url?: string
}) {
  return request.post<ApiResult<KnowledgeDocumentVO>>('/knowledge', data)
}

export function getKnowledgeList() {
  return request.get<ApiResult<KnowledgeDocumentVO[]>>('/knowledge')
}

export function getKnowledgeDetail(id: number) {
  return request.get<ApiResult<KnowledgeDocumentDetailVO>>(`/knowledge/${id}`)
}

export function deleteKnowledge(id: number) {
  return request.delete<ApiResult<null>>(`/knowledge/${id}`)
}

export function searchKnowledge(data: { query: string; limit?: number }) {
  return request.post<ApiResult<KnowledgeDocumentDetailVO[]>>('/knowledge/search', data)
}