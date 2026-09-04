<template>
  <div class="assistant-layout">
    <!-- Sidebar: conversation list -->
    <aside class="conv-sidebar" :class="{ collapsed: !sidebarOpen }">
      <div class="sidebar-header">
        <button class="btn-new" @click="handleNewConversation">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          新建对话
        </button>
      </div>
      <div class="conv-list" v-loading="loadingConversations">
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="conv-item"
          :class="{ active: conv.id === currentConversationId }"
          @click="switchConversation(conv.id)"
        >
          <div class="conv-title">{{ conv.title }}</div>
          <div class="conv-meta">
            <span>AI 对话</span>
            <button class="btn-delete" @click.stop="handleDelete(conv.id)" title="删除对话">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
          </div>
        </div>
        <div v-if="!conversations.length && !loadingConversations" class="conv-empty">
          暂无对话，点击上方新建
        </div>
      </div>
    </aside>

    <!-- Main chat area -->
    <main class="chat-main">
      <!-- Empty state -->
      <div v-if="!currentConversationId" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        </div>
        <h2 class="empty-title">AI 小助手</h2>
        <p class="empty-desc">我可以帮你回答问题、搜索网络信息，让你的求职之路更顺畅</p>
        <button class="btn-start" @click="handleNewConversation">开始对话</button>
      </div>

      <!-- Active conversation -->
      <template v-else>
        <!-- Messages -->
        <div class="messages" ref="messagesRef">
          <div v-for="(msg, i) in messages" :key="i" class="message" :class="msg.role">
            <div class="msg-avatar" :class="msg.role">
              {{ msg.role === 'user' ? 'U' : 'AI' }}
            </div>
            <div class="msg-bubble">
              <div class="msg-content" v-html="renderMarkdown(msg.content)"></div>
            </div>
          </div>
          <!-- Streaming placeholder -->
          <div v-if="streaming" class="message assistant">
            <div class="msg-avatar ai">AI</div>
            <div class="msg-bubble">
              <div class="msg-content" v-html="renderMarkdown(streamingContent)"></div>
              <div class="streaming-cursor" v-if="!streamingDone">▍</div>
            </div>
          </div>
          <div v-if="loadingMessages" class="msg-loading">
            <div class="loading-dots"><span></span><span></span><span></span></div>
          </div>
        </div>

        <!-- Input area -->
        <div class="input-area">
          <div class="input-toolbar">
            <label class="search-toggle" :class="{ active: searchEnabled }">
              <input type="checkbox" v-model="searchEnabled" />
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
              <span class="toggle-label">联网搜索</span>
            </label>
            <span v-if="searchEnabled" class="search-hint">AI 将自动搜索网络获取最新信息</span>
          </div>
          <div class="input-row">
            <textarea
              ref="inputRef"
              v-model="input"
              class="msg-input"
              :rows="1"
              placeholder="输入消息，Enter 发送，Shift+Enter 换行"
              :disabled="sending"
              @keydown.enter.exact.prevent="sendMessage"
              @keydown.shift.enter="handleShiftEnter"
              @input="autoResize"
            ></textarea>
            <button class="btn-send" :disabled="sending || !input.trim()" @click="sendMessage" :title="sending ? '发送中...' : '发送'">
              <svg v-if="!sending" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              <span v-else class="btn-spinner"></span>
            </button>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createConversation, getConversationList, deleteConversation, getMessages } from '../../api/assistant'
import { getAccessToken } from '../../utils/token'
import type { ConversationVO, MessageVO } from '../../types/api'

// ===== State =====
const conversations = ref<ConversationVO[]>([])
const currentConversationId = ref<number | null>(null)
const messages = ref<MessageVO[]>([])
const input = ref('')
const searchEnabled = ref(false)
const streaming = ref(false)
const streamingContent = ref('')
const streamingDone = ref(false)
const sending = ref(false)
const loadingConversations = ref(false)
const loadingMessages = ref(false)
const sidebarOpen = ref(true)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const messagesRef = ref<HTMLDivElement | null>(null)
let abortController: AbortController | null = null

// ===== Lifecycle =====
onMounted(async () => {
  await fetchConversations()
  // Auto-select the most recent conversation
  if (conversations.value.length > 0) {
    await switchConversation(conversations.value[0].id)
  }
})

// ===== Conversation management =====
async function fetchConversations() {
  loadingConversations.value = true
  try {
    const res = await getConversationList()
    conversations.value = res.data.data || []
  } catch {
    // silent
  } finally {
    loadingConversations.value = false
  }
}

async function handleNewConversation() {
  try {
    const res = await createConversation()
    const conv = res.data.data
    conversations.value.unshift(conv)
    await switchConversation(conv.id)
  } catch (e: unknown) {
    ElMessage.error('创建对话失败')
  }
}

async function switchConversation(id: number) {
  // Cancel any ongoing streaming
  if (abortController) {
    abortController.abort()
    abortController = null
  }
  streaming.value = false
  streamingContent.value = ''
  streamingDone.value = false
  sending.value = false

  currentConversationId.value = id
  await loadMessages(id)
}

async function loadMessages(id: number) {
  loadingMessages.value = true
  messages.value = []
  try {
    const res = await getMessages(id)
    messages.value = res.data.data || []
    await nextTick()
    scrollToBottom()
  } catch {
    // silent
  } finally {
    loadingMessages.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await ElMessageBox.confirm('确定要删除这个对话吗？', '确认删除', {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteConversation(id)
    conversations.value = conversations.value.filter(c => c.id !== id)
    if (currentConversationId.value === id) {
      currentConversationId.value = null
      messages.value = []
    }
    ElMessage.success('对话已删除')
  } catch {
    // cancelled or error
  }
}

// ===== SSE Streaming =====
async function sendMessage() {
  const message = input.value.trim()
  if (!message || sending.value || !currentConversationId.value) return

  // Add user message to UI immediately
  messages.value.push({
    role: 'user',
    content: message,
    created_at: new Date().toISOString(),
  })
  input.value = ''
  resetTextareaHeight()
  await nextTick()
  scrollToBottom()

  // Prepare for streaming
  sending.value = true
  streaming.value = true
  streamingContent.value = ''
  streamingDone.value = false
  abortController = new AbortController()

  try {
    const token = getAccessToken()
    const convId = currentConversationId.value
    const response = await fetch(`/api/v1/assistant/${convId}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        message,
        search_enabled: searchEnabled.value,
      }),
      signal: abortController.signal,
    })

    if (!response.ok) {
      const errBody = await response.text()
      let errMsg = '发送失败'
      try { const errJson = JSON.parse(errBody); errMsg = errJson.message || errMsg } catch {}
      throw new Error(errMsg)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      let currentEvent = ''
      for (const line of lines) {
        if (line === '') continue
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim()
        } else if (line.startsWith('data:')) {
          handleSseEvent(currentEvent, line.slice(5).trim())
        }
      }
    }

    // Flush remaining buffer
    if (buffer.startsWith('data:')) {
      handleSseEvent('', buffer.slice(5).trim())
    }

    // Save the complete response to messages
    if (streamingContent.value) {
      messages.value.push({
        role: 'assistant',
        content: streamingContent.value,
        created_at: new Date().toISOString(),
      })
    }
    streamingContent.value = ''
    streaming.value = false
    streamingDone.value = true
    await nextTick()
    scrollToBottom()

    // Refresh conversation list to update title/message count
    await fetchConversations()

  } catch (e: unknown) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      // User switched conversation, don't show error
      return
    }
    ElMessage.error(e instanceof Error ? e.message : '发送失败')
    // Show partial content if any
    if (streamingContent.value) {
      messages.value.push({
        role: 'assistant',
        content: streamingContent.value + '\n\n> ⚠️ 响应未完成，请检查网络后重试',
        created_at: new Date().toISOString(),
      })
    }
  } finally {
    sending.value = false
    streaming.value = false
    abortController = null
    await nextTick()
    scrollToBottom()
  }
}

function handleSseEvent(eventType: string, data: string) {
  switch (eventType) {
    case 'text':
      streamingContent.value += data
      break
    case 'done':
      streamingDone.value = true
      break
    case 'error':
      ElMessage.error(data || 'AI 响应出错')
      break
    default:
      // Ignore unknown events
      break
  }
}

// ===== Utilities =====
function renderMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  html = html
    .replace(/### ✅ (.+)/g, '<h4 class="fh fh-strength">$1</h4>')
    .replace(/### ⚠️ (.+)/g, '<h4 class="fh fh-warning">$1</h4>')
    .replace(/### 💡 (.+)/g, '<h4 class="fh fh-tip">$1</h4>')
    .replace(/### 📝 (.+)/g, '<h4 class="fh fh-summary">$1</h4>')
    .replace(/### (.+)/g, '<h4 class="fh">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<span class="fli">$1</span>')
    .replace(/\n\n/g, '</p><p class="fp">')
    .replace(/\n/g, '<br>')

  return `<p class="fp">${html}</p>`
}

function scrollToBottom() {
  if (messagesRef.value) {
    messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  }
}

function autoResize() {
  const el = inputRef.value
  if (el) {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }
}

function resetTextareaHeight() {
  const el = inputRef.value
  if (el) {
    el.style.height = 'auto'
  }
}

function handleShiftEnter(_e: KeyboardEvent) {
  // Allow Shift+Enter to insert newline, handled by default behavior
  // The @keydown.enter.exact.prevent prevents regular Enter from inserting newline
}
</script>

<style scoped>
/* ============================================
   Layout
   ============================================ */
.assistant-layout {
  display: flex;
  height: calc(100vh - 56px - 48px); /* header + main padding */
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

/* ============================================
   Sidebar
   ============================================ */
.conv-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.btn-new {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 16px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-new:hover {
  background: #4338ca;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}

.conv-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.conv-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  margin-bottom: 2px;
}
.conv-item:hover {
  background: #f1f5f9;
}
.conv-item.active {
  background: #eef2ff;
}

.conv-title {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 2px;
}
.conv-item.active .conv-title {
  color: #4f46e5;
}

.conv-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #94a3b8;
}

.btn-delete {
  display: inline-flex;
  align-items: center;
  padding: 2px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.15s;
}
.conv-item:hover .btn-delete {
  opacity: 1;
}
.btn-delete:hover {
  color: #ef4444;
  background: #fef2f2;
}

.conv-empty {
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
  padding: 24px 16px;
}

/* ============================================
   Main chat area
   ============================================ */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

/* ============================================
   Empty state
   ============================================ */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  padding: 40px;
}
.empty-icon {
  color: #cbd5e1;
  margin-bottom: 8px;
}
.empty-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}
.empty-desc {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
  max-width: 320px;
  text-align: center;
  line-height: 1.6;
}
.btn-start {
  margin-top: 8px;
  padding: 10px 24px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-start:hover {
  background: #4338ca;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}

/* ============================================
   Messages
   ============================================ */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  max-width: 85%;
  animation: fadeIn 0.2s ease;
}
.message.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.msg-avatar.user {
  background: #4f46e5;
  color: #fff;
}
.msg-avatar.ai {
  background: #f1f5f9;
  color: #475569;
}

.msg-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  min-width: 0;
}
.message.user .msg-bubble {
  background: #4f46e5;
  color: #fff;
  border-bottom-right-radius: 4px;
}
.message.assistant .msg-bubble {
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #f1f5f9;
  border-bottom-left-radius: 4px;
}

.msg-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.message.user .msg-content :deep(.fp) {
  margin: 2px 0;
  color: #fff;
}
.message.assistant .msg-content :deep(.fp) {
  margin: 4px 0;
  color: #334155;
}
.message.assistant .msg-content :deep(.fh) {
  margin: 12px 0 6px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  padding-left: 12px;
  border-left: 3px solid #cbd5e1;
}
.message.assistant .msg-content :deep(.fh-strength) { border-left-color: #22c55e; color: #15803d; }
.message.assistant .msg-content :deep(.fh-warning) { border-left-color: #f59e0b; color: #b45309; }
.message.assistant .msg-content :deep(.fh-tip) { border-left-color: #6366f1; color: #4338ca; }
.message.assistant .msg-content :deep(.fh-summary) { border-left-color: #64748b; color: #334155; }
.message.assistant .msg-content :deep(.fli) {
  display: block;
  margin-left: 20px;
  margin-bottom: 3px;
  position: relative;
}
.message.assistant .msg-content :deep(.fli::before) {
  content: '';
  position: absolute;
  left: -14px;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cbd5e1;
}

.streaming-cursor {
  display: inline;
  animation: blink 1s step-end infinite;
  color: #6366f1;
}
@keyframes blink {
  50% { opacity: 0; }
}

.msg-loading {
  display: flex;
  justify-content: center;
  padding: 20px;
}
.loading-dots {
  display: flex;
  gap: 4px;
}
.loading-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  animation: dotPulse 1.4s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.2s; }
.loading-dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dotPulse {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* ============================================
   Input area
   ============================================ */
.input-area {
  border-top: 1px solid #e2e8f0;
  padding: 12px 24px 16px;
  background: #fff;
}

.input-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding-left: 4px;
}

.search-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  font-size: 13px;
  color: #64748b;
  transition: color 0.2s;
}
.search-toggle.active {
  color: #4f46e5;
}
.search-toggle input {
  display: none;
}
.toggle-track {
  width: 34px;
  height: 20px;
  border-radius: 10px;
  background: #e2e8f0;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}
.search-toggle.active .toggle-track {
  background: #4f46e5;
}
.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.search-toggle.active .toggle-thumb {
  transform: translateX(14px);
}
.toggle-label {
  font-weight: 500;
}
.search-hint {
  font-size: 11px;
  color: #94a3b8;
}

.input-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.msg-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.6;
  color: #1e293b;
  resize: none;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  max-height: 200px;
  box-sizing: border-box;
}
.msg-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
.msg-input:disabled {
  background: #f8fafc;
  color: #94a3b8;
}

.btn-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #4f46e5;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}
.btn-send:hover:not(:disabled) {
  background: #4338ca;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}
.btn-send:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: block;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   Responsive
   ============================================ */
@media (max-width: 768px) {
  .assistant-layout {
    height: calc(100vh - 56px - 24px);
    border-radius: 0;
    border: none;
  }
  .conv-sidebar {
    width: 200px;
  }
  .message {
    max-width: 95%;
  }
  .messages {
    padding: 16px 16px 8px;
  }
  .input-area {
    padding: 8px 16px 12px;
  }
}
</style>