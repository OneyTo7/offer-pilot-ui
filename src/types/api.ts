/** API 统一响应类型 */
export interface ApiResult<T = unknown> {
  code: number
  message: string
  data: T
  trace_id: string
}

/** 分页响应 */
export interface PageResult<T> {
  records: T[]
  total: number
  page: number
  size: number
}

/** 用户信息 */
export interface UserVO {
  id: number
  email: string
  nickname: string
  avatar?: string
  /** 用户是否已配置自己的 DeepSeek API Key */
  has_api_key?: boolean
  created_at: string
}

/** Token 响应 */
export interface TokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: UserVO
}

/** 简历 VO */
export interface ResumeVO {
  id: number
  name: string
  file_url: string
  file_size: number
  page_count: number
  status: number // 0=解析中 1=完成 2=失败
  is_default: number
  created_at: string
  updated_at: string
}

/** 简历基本信息 */
export interface ResumeBasicInfo {
  name: string
  gender?: string
  birth_date?: string
  phone?: string
  email?: string
  location?: string
  expected_position?: string
  expected_salary?: string
  work_years?: number
  highest_degree?: string
  current_company?: string
  current_position?: string
}

/** 教育经历 */
export interface ResumeEducation {
  school: string
  major: string
  degree: string
  start_date: string
  end_date?: string
  is_full_time?: boolean
  description?: string
}

/** 工作经历 */
export interface ResumeWorkExperience {
  company: string
  position: string
  department?: string
  start_date: string
  end_date?: string
  is_current?: boolean
  responsibilities?: string
  achievements?: string[]
  technologies?: string[]
}

/** 项目经历 */
export interface ResumeProject {
  name: string
  role: string
  start_date?: string
  end_date?: string
  description?: string
  responsibilities?: string
  technologies?: string[]
  highlights?: string
}

/** 技能 */
export interface ResumeSkill {
  category: string
  skills: string[]
}

/** 证书 */
export interface ResumeCertificate {
  name: string
  date?: string
  issuer?: string
}

/** 简历详情 */
export interface ResumeDetailVO extends ResumeVO {
  parsed_text?: string
  summary?: string
  basic_info?: ResumeBasicInfo
  education?: ResumeEducation[]
  work_experience?: ResumeWorkExperience[]
  projects?: ResumeProject[]
  skills?: ResumeSkill[]
  certificates?: ResumeCertificate[]
  fail_reason?: string
}

/** 目标职位 */
export interface PositionVO {
  id: number
  resume_id?: number
  title: string
  company: string
  jd_text: string
  location?: string
  salary_range?: string
  is_default: number
  created_at: string
  updated_at?: string
}

/** 报告 */
export interface ReportVO {
  id: number
  resume_id: number
  position_id: number
  status: number
  content?: ReportContent
  created_at: string
  updated_at?: string
}

/** 报告内容 */
export interface ReportContent {
  match_score: number
  tech_stack_analysis: TechStackAnalysis
  highlights: string[]
  weaknesses: string[]
  full_report?: string
}

/** 技术栈分析 */
export interface TechStackAnalysis {
  matched: string
  missing: string
  recommendation: string
}

/** 面试会话 */
export interface SessionVO {
  id: number
  resume_id: number
  position_id: number
  current_round: number
  current_question: number
  status: number
  created_at: string
}

/** 面试问题 */
export interface InterviewQuestion {
  id: number
  text: string
  answer?: string
  feedback?: string
  score?: number
  status: string
}

/** 知识库文档 */
export interface KnowledgeDocumentVO {
  id: number
  title: string
  content_type: string
  status: number
  created_at: string
}

/** 面试轮次总结 */
export interface RoundSummary {
  round: number
  round_name: string
  total_questions: number
  answered_questions: number
  skipped_questions: number
  questions: QuestionSummary[]
}

/** 题目总结 */
export interface QuestionSummary {
  id: number
  question_index: number
  question_text: string
  user_answer?: string
  feedback?: string
  score?: number
  status: string
}

/** 面试总结 */
export interface InterviewSummaryVO {
  session_id: number
  total_rounds: number
  total_questions: number
  answered_questions: number
  skipped_questions: number
  duration_seconds: number
  summary?: string
  rounds: RoundSummary[]
}

/** 知识库文档详情 */
export interface KnowledgeDocumentDetailVO extends KnowledgeDocumentVO {
  content?: string
  file_url?: string
  chunk_count?: number
  fail_reason?: string
}