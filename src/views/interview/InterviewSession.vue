<template>
  <div class="interview-session">
    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">加载中...</p>
    </div>

    <template v-if="session">
      <!-- Back button -->
      <button class="back-btn" @click="$router.push('/interviews')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        返回列表
      </button>

      <!-- Progress header -->
      <div class="progress-header">
        <div class="progress-title">
          <span class="round-label">第 {{ session.current_round }} 轮</span>
          <span class="question-count">第 {{ session.current_question }} / 10 题</span>
        </div>
        <div class="progress-bar">
          <div
            v-for="r in 3"
            :key="r"
            class="progress-segment"
            :class="{
              'is-active': r === session.current_round,
              'is-done': r < session.current_round,
              'is-pending': r > session.current_round
            }"
          >
            <div class="segment-dots">
              <div
                v-for="q in 10"
                :key="q"
                class="segment-dot"
                :class="{
                  'is-active': r === session.current_round && q === session.current_question,
                  'is-done': r < session.current_round || (r === session.current_round && q < session.current_question),
                  'is-pending': r > session.current_round || (r === session.current_round && q > session.current_question)
                }"
              ></div>
            </div>
            <span class="segment-label">{{ r === 1 ? '基础' : r === 2 ? '深挖' : '系统' }}</span>
          </div>
        </div>
      </div>

      <!-- Question card -->
      <div v-if="currentQuestion && session.status === 0" class="question-card">
        <div class="question-header">
          <span class="question-number">Q{{ session.current_question }}</span>
          <span class="question-round-tag">第 {{ session.current_round }} 轮</span>
        </div>
        <p class="question-text">{{ currentQuestion.text }}</p>

        <div class="answer-area">
          <textarea
            v-model="answer"
            :rows="5"
            placeholder="在此输入你的回答..."
            :disabled="answering"
            class="answer-input"
            @keydown.meta.enter="handleAnswer"
            @keydown.ctrl.enter="handleAnswer"
          ></textarea>
          <div class="input-hint">⌘+Enter 快速提交</div>

          <div class="action-buttons">
            <button class="btn btn-primary" :class="{ 'is-loading': answering }" @click="handleAnswer" :disabled="answering || !answer.trim()">
              <span v-if="answering" class="btn-spinner"></span>
              <span v-else>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
              </span>
              提交回答
            </button>
            <button class="btn btn-ghost" @click="handleSkip" :disabled="answering">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4l14 8-14 8V4z"/></svg>
              跳过此题
            </button>
            <button class="btn btn-ghost btn-danger" @click="handleEnd">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18.36 6.64a9 9 0 11-12.73 0M12 2v10"/></svg>
              结束面试
            </button>
          </div>
        </div>
      </div>

      <!-- Feedback card -->
      <div v-if="streamingFeedback || latestFeedback || latestScore !== null" class="feedback-card">
        <div class="feedback-header">
          <h3 class="feedback-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            AI 评估反馈
          </h3>
          <div v-if="latestScore !== null" class="score-badge" :class="scoreClass(latestScore)">
            <span class="score-value">{{ latestScore }}</span>
            <span class="score-label">分</span>
          </div>
          <div v-else-if="streamingFeedback" class="score-badge score-pending">
            <span class="score-spinner"></span>
            <span class="score-label">评估中</span>
          </div>
        </div>
        <div class="feedback-body" v-html="renderedFeedback"></div>
      </div>

      <!-- No more questions placeholder -->
      <div v-if="!currentQuestion && session.status !== 0 && historyRounds.length === 0 && !loading" class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        <p>面试已结束</p>
        <button class="btn btn-primary" @click="$router.push('/interviews')">返回列表</button>
      </div>

      <!-- History -->
      <div v-if="historyRounds.length" class="history-section">
        <h3 class="history-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          问答记录
        </h3>

        <div v-for="round in historyRounds" :key="round.round" class="round-group">
          <div class="round-group-header" @click="toggleRound(round.round)">
            <div class="round-group-title">
              <span class="round-group-name">{{ round.round_name }}</span>
              <span class="round-group-stats">{{ round.answered_questions }}/{{ round.total_questions }} 题已答</span>
            </div>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              class="chevron"
              :class="{ 'is-open': expandedRounds.has(round.round) }"
            ><path d="M6 9l6 6 6-6"/></svg>
          </div>

          <div v-if="expandedRounds.has(round.round)" class="round-group-body">
            <div
              v-for="q in round.questions"
              :key="q.id"
              class="history-item"
              :class="{
                'is-answered': q.status === 'ANSWERED',
                'is-skipped': q.status === 'SKIPPED',
                'is-pending': q.status === 'PENDING'
              }"
            >
              <div class="history-item-header">
                <span class="history-q-num">Q{{ q.question_index }}</span>
                <span v-if="q.status === 'SKIPPED'" class="history-status skipped">已跳过</span>
                <span v-if="q.score !== undefined && q.score !== null" class="history-score" :class="scoreClass(q.score)">{{ q.score }}</span>
              </div>
              <p class="history-q-text">{{ q.question_text }}</p>
              <p v-if="q.user_answer" class="history-a-text">
                <span class="label">回答：</span>{{ q.user_answer }}
              </p>
              <div v-if="q.feedback" class="history-feedback">
                <div class="history-feedback-inner" v-html="renderMarkdown(q.feedback)"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getInterviewDetail, getCurrentQuestion, startRound, skipQuestion, endInterview, getInterviewSummary } from '../../api/interview'
import { getAccessToken } from '../../utils/token'
import type { SessionVO, InterviewQuestion, RoundSummary } from '../../types/api'

const route = useRoute()
const sessionId = computed(() => Number(route.params.id))
const session = ref<SessionVO | null>(null)
const currentQuestion = ref<InterviewQuestion | null>(null)
const historyRounds = ref<RoundSummary[]>([])
const answer = ref('')
const loading = ref(false)
const answering = ref(false)
const expandedRounds = ref(new Set<number>())

// Streaming feedback state
const streamingFeedback = ref('')
const latestFeedback = ref('')
const latestScore = ref<number | null>(null)

const renderedFeedback = computed(() => {
  const text = streamingFeedback.value || latestFeedback.value
  if (!text) return ''
  return renderMarkdown(text)
})

function scoreClass(score: number | null | undefined): string {
  if (score === null || score === undefined) return ''
  if (score >= 85) return 'score-excellent'
  if (score >= 70) return 'score-good'
  if (score >= 50) return 'score-fair'
  return 'score-poor'
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await getInterviewDetail(sessionId.value)
    session.value = res.data.data

    if (session.value.current_question === 0) {
      await handleStartRound()
    } else {
      await loadCurrentQuestion()
    }

    await loadHistory()
  } finally {
    loading.value = false
  }
})

function renderMarkdown(text: string): string {
  // Minimal markdown renderer for AI output (headings, bold, code, lists, links)
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

async function loadHistory() {
  try {
    const res = await getInterviewSummary(sessionId.value)
    if (res.data.data?.rounds) {
      historyRounds.value = res.data.data.rounds
      // Auto-expand the current round
      if (session.value) {
        expandedRounds.value.add(session.value.current_round)
      }
    }
  } catch {
    // silent
  }
}

function toggleRound(round: number) {
  const s = new Set(expandedRounds.value)
  if (s.has(round)) s.delete(round)
  else s.add(round)
  expandedRounds.value = s
}

async function handleStartRound() {
  try {
    const res = await startRound(sessionId.value)
    currentQuestion.value = res.data.data.question
    // Refresh session to reflect updated progress
    const sessionRes = await getInterviewDetail(sessionId.value)
    session.value = sessionRes.data.data
  } catch (e: unknown) {
    ElMessage.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || '开始失败')
  }
}

async function loadCurrentQuestion() {
  try {
    const res = await getCurrentQuestion(sessionId.value)
    if (res.data.data) {
      currentQuestion.value = res.data.data
    } else {
      ElMessage.info('当前没有待答题目')
    }
  } catch (e: unknown) {
    ElMessage.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || '加载题目失败')
  }
}

async function handleAnswer() {
  if (!answer.value.trim()) {
    ElMessage.warning('请输入回答')
    return
  }
  answering.value = true
  streamingFeedback.value = ''
  latestFeedback.value = ''
  latestScore.value = null

  try {
    const token = getAccessToken()
    const response = await fetch(`/api/v1/interviews/${sessionId.value}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        question_id: currentQuestion.value!.id,
        answer: answer.value,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      let errMsg = '提交失败'
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

    if (buffer.startsWith('data:')) {
      handleSseEvent('', buffer.slice(5).trim())
    }

    answer.value = ''
    // Refresh session to sync progress bar
    getInterviewDetail(sessionId.value).then(r => { session.value = r.data.data }).catch(() => {})
  } catch (e: unknown) {
    ElMessage.error(e instanceof Error ? e.message : '提交失败')
  } finally {
    answering.value = false
  }
}

function handleSseEvent(eventType: string, data: string) {
  switch (eventType) {
    case 'feedback_token':
      streamingFeedback.value += data
      break
    case 'feedback_done': {
      try {
        const parsed = JSON.parse(data)
        latestFeedback.value = parsed.feedback || streamingFeedback.value
        latestScore.value = parsed.score ?? null
      } catch {
        latestFeedback.value = streamingFeedback.value
      }
      streamingFeedback.value = ''
      break
    }
    case 'next_question': {
      try {
        const parsed = JSON.parse(data)
        currentQuestion.value = {
          id: parsed.id, text: parsed.text, answer: parsed.answer,
          feedback: parsed.feedback, score: parsed.score, status: parsed.status,
        }
        // Refresh session to update progress bar
        getInterviewDetail(sessionId.value).then(r => { session.value = r.data.data }).catch(() => {})
      } catch { loadCurrentQuestion() }
      loadHistory()
      break
    }
    case 'complete':
      currentQuestion.value = null
      ElMessage.success('面试已完成！')
      getInterviewDetail(sessionId.value).then(r => { session.value = r.data.data }).catch(() => {})
      loadHistory()
      break
    default:
      if (!eventType) {
        try {
          const parsed = JSON.parse(data)
          if (parsed.id && parsed.text) {
            currentQuestion.value = {
              id: parsed.id, text: parsed.text, answer: parsed.answer,
              feedback: parsed.feedback, score: parsed.score, status: parsed.status,
            }
            loadHistory()
          }
        } catch {}
      }
      break
  }
}

async function handleSkip() {
  try {
    const res = await skipQuestion(sessionId.value, {
      question_id: currentQuestion.value!.id,
    })
    if (res.data.data.question) {
      currentQuestion.value = res.data.data.question
    } else {
      currentQuestion.value = null
      ElMessage.success('面试已完成！')
    }
    // Refresh session for updated progress
    const sessionRes = await getInterviewDetail(sessionId.value)
    session.value = sessionRes.data.data
    await loadHistory()
  } catch (e: unknown) {
    ElMessage.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || '跳过失败')
  }
}

async function handleEnd() {
  try {
    await endInterview(sessionId.value)
    ElMessage.success('面试已结束')
    currentQuestion.value = null
    streamingFeedback.value = ''
    latestFeedback.value = ''
    latestScore.value = null

    const res = await getInterviewDetail(sessionId.value)
    session.value = res.data.data
    await loadHistory()
  } catch (e: unknown) {
    ElMessage.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || '结束失败')
  }
}
</script>

<style>
/* ========== Global font imports ========== */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Noto+Serif+SC:wght@600;700&family=Noto+Sans+SC:wght@400;500&display=swap');

/* ========== Base ========== */
.interview-session {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px 16px 48px;
  font-family: 'Inter', 'Noto Sans SC', -apple-system, sans-serif;
  color: #1e293b;
  position: relative;
  min-height: 60vh;
}

/* ========== Loading ========== */
.loading-overlay {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
  gap: 16px;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { color: #64748b; font-size: 14px; }

/* ========== Back button ========== */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  color: #475569;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}
.back-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}

/* ========== Progress header ========== */
.progress-header {
  margin-bottom: 24px;
}
.progress-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
}
.round-label {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: 0.02em;
}
.question-count {
  font-size: 14px;
  color: #64748b;
}

.progress-bar {
  display: flex;
  gap: 6px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 10px 14px;
}
.progress-segment {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}
.segment-dots {
  display: flex;
  gap: 4px;
  width: 100%;
  justify-content: center;
}
.segment-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #cbd5e1;
  transition: all 0.3s;
}
.segment-dot.is-done { background: #6366f1; }
.segment-dot.is-active {
  background: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2); }
  50% { box-shadow: 0 0 0 6px rgba(99, 102, 241, 0.08); }
}
.segment-label {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
  letter-spacing: 0.02em;
}
.progress-segment.is-active .segment-label { color: #6366f1; font-weight: 500; }
.progress-segment.is-done .segment-label { color: #475569; }

/* ========== Question card ========== */
.question-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 28px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.2s;
}
.question-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

.question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.question-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eef2ff;
  color: #4f46e5;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
}
.question-round-tag {
  font-size: 12px;
  color: #64748b;
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 20px;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: #0f172a;
  margin: 0 0 24px;
  padding: 16px 20px;
  background: #f8fafc;
  border-radius: 10px;
  border-left: 3px solid #6366f1;
}

/* ========== Answer area ========== */
.answer-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.answer-input {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-family: 'Inter', 'Noto Sans SC', sans-serif;
  font-size: 14px;
  line-height: 1.7;
  color: #1e293b;
  background: #fafbfc;
  resize: vertical;
  transition: border-color 0.2s, box-shadow 0.2s;
  outline: none;
  box-sizing: border-box;
}
.answer-input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  background: #fff;
}
.answer-input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
}
.input-hint {
  text-align: right;
  font-size: 12px;
  color: #94a3b8;
}

/* ========== Buttons ========== */
.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 4px;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  border: 1px solid transparent;
  border-radius: 9px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn svg { flex-shrink: 0; }

.btn-primary {
  background: #4f46e5;
  color: #fff;
  border-color: #4f46e5;
}
.btn-primary:hover:not(:disabled) {
  background: #4338ca;
  border-color: #4338ca;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}
.btn-primary.is-loading {
  opacity: 0.8;
}
.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.btn-ghost {
  background: #fff;
  color: #475569;
  border-color: #e2e8f0;
}
.btn-ghost:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: #1e293b;
}
.btn-ghost.btn-danger {
  color: #ef4444;
}
.btn-ghost.btn-danger:hover:not(:disabled) {
  background: #fef2f2;
  border-color: #fecaca;
}

/* ========== Feedback card ========== */
.feedback-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.feedback-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}
.feedback-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}
.feedback-title svg { color: #6366f1; }

.feedback-body {
  padding: 20px 24px;
  font-size: 14px;
  line-height: 1.8;
  color: #334155;
}

/* Score badge */
.score-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 14px 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}
.score-value { font-size: 18px; }
.score-label { font-size: 12px; font-weight: 400; }
.score-pending {
  background: #f1f5f9;
  color: #64748b;
}
.score-excellent { background: #ecfdf5; color: #059669; }
.score-good { background: #eef2ff; color: #4f46e5; }
.score-fair { background: #fffbeb; color: #d97706; }
.score-poor { background: #fef2f2; color: #dc2626; }

.score-spinner {
  width: 12px;
  height: 12px;
  border: 2px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ========== Feedback content (markdown) ========== */
.fp { margin: 4px 0; }
.fh {
  margin: 14px 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
  padding-left: 12px;
  border-left: 3px solid #cbd5e1;
}
.fh-strength { border-left-color: #22c55e; color: #15803d; }
.fh-warning { border-left-color: #f59e0b; color: #b45309; }
.fh-tip { border-left-color: #6366f1; color: #4338ca; }
.fh-summary { border-left-color: #64748b; color: #334155; }
.fli {
  display: block;
  margin-left: 20px;
  margin-bottom: 3px;
  position: relative;
}
.fli::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 9px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #cbd5e1;
}

/* ========== Empty state ========== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 60px 0;
  color: #64748b;
}
.empty-icon { color: #94a3b8; }
.empty-state p { font-size: 15px; margin: 0; }

/* ========== History section ========== */
.history-section {
  margin-top: 8px;
}
.history-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px;
}
.history-title svg { color: #6366f1; }

.round-group {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.round-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  transition: background 0.15s;
  user-select: none;
}
.round-group-header:hover { background: #f8fafc; }
.round-group-title {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.round-group-name {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}
.round-group-stats {
  font-size: 12px;
  color: #94a3b8;
}
.chevron {
  color: #94a3b8;
  transition: transform 0.25s;
}
.chevron.is-open { transform: rotate(180deg); }

.round-group-body {
  border-top: 1px solid #f1f5f9;
}

/* History items */
.history-item {
  padding: 16px 20px;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.15s;
}
.history-item:last-child { border-bottom: none; }
.history-item:hover { background: #fafbfc; }
.history-item.is-skipped { opacity: 0.7; }

.history-item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}
.history-q-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #eef2ff;
  color: #4f46e5;
  font-size: 12px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
}
.history-status {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  background: #f1f5f9;
  color: #64748b;
}
.history-score {
  margin-left: auto;
  font-size: 12px;
  font-weight: 600;
  padding: 1px 8px;
  border-radius: 6px;
}
.history-score.score-excellent { background: #ecfdf5; color: #059669; }
.history-score.score-good { background: #eef2ff; color: #4f46e5; }
.history-score.score-fair { background: #fffbeb; color: #d97706; }
.history-score.score-poor { background: #fef2f2; color: #dc2626; }

.history-q-text {
  font-size: 14px;
  line-height: 1.7;
  color: #1e293b;
  margin: 0 0 6px;
}
.history-a-text {
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
  margin: 0 0 8px;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
}
.history-a-text .label { color: #6366f1; font-weight: 500; }

.history-feedback {
  margin-top: 8px;
  font-size: 13px;
}
.history-feedback-inner {
  padding: 10px 14px;
  background: #fafbfc;
  border-radius: 8px;
  border-left: 3px solid #e2e8f0;
  line-height: 1.7;
}
.history-feedback-inner .fh {
  margin: 8px 0 4px;
  font-size: 13px;
}
.history-feedback-inner .fh:first-child { margin-top: 0; }
.history-feedback-inner .fli { margin-left: 16px; }
.history-feedback-inner .fli::before { top: 8px; width: 4px; height: 4px; }

/* ========== Responsive ========== */
@media (max-width: 640px) {
  .interview-session { padding: 16px 12px 32px; }
  .question-card { padding: 20px; }
  .feedback-body { padding: 16px 18px; }
  .feedback-header { padding: 12px 18px; flex-wrap: wrap; gap: 8px; }
  .action-buttons { flex-direction: column; }
  .btn { justify-content: center; }
  .progress-segment { gap: 4px; }
  .segment-dot { width: 4px; height: 4px; }
}
</style>