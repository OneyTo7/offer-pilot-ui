import request from './request'
import type { ApiResult, KnowledgeDocumentVO, KnowledgeDocumentDetailVO, KnowledgeChunkVO } from '../types/api'

export function createKnowledge(data: {
  title: string
  content_type: string
  content?: string
  scope?: string
}) {
  return request.post<ApiResult<KnowledgeDocumentVO>>('/knowledge', data)
}

export function uploadKnowledge(formData: FormData) {
  return request.post<ApiResult<KnowledgeDocumentVO>>('/knowledge/upload', formData)
}

export function getKnowledgeList() {
  return request.get<ApiResult<KnowledgeDocumentVO[]>>('/knowledge')
}

export function getSystemKnowledgeList() {
  return request.get<ApiResult<KnowledgeDocumentVO[]>>('/knowledge/system')
}

export function getKnowledgeDetail(id: number) {
  return request.get<ApiResult<KnowledgeDocumentDetailVO>>(`/knowledge/${id}`)
}

export function getKnowledgeChunks(id: number) {
  return request.get<ApiResult<KnowledgeChunkVO[]>>(`/knowledge/${id}/chunks`)
}

export function deleteKnowledge(id: number) {
  return request.delete<ApiResult<null>>(`/knowledge/${id}`)
}

export function searchKnowledge(data: { query: string; limit?: number }) {
  return request.post<ApiResult<KnowledgeDocumentDetailVO[]>>('/knowledge/search', data)
}