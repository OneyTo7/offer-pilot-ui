import request from './request'
import type { ApiResult, ConversationVO, MessageVO } from '../types/api'

export function createConversation() {
  return request.post<ApiResult<ConversationVO>>('/assistant/conversations')
}

export function getConversationList() {
  return request.get<ApiResult<ConversationVO[]>>('/assistant/conversations')
}

export function deleteConversation(id: number) {
  return request.delete<ApiResult<null>>(`/assistant/conversations/${id}`)
}

export function getMessages(id: number) {
  return request.get<ApiResult<MessageVO[]>>(`/assistant/${id}/messages`)
}