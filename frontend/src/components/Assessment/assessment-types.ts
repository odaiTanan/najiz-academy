export type QuestionType = 'multiple_choice' | 'scenario_based' | 'simulation'

export interface AssessmentOption {
  id: number
  code?: string | null
  label: string
  value?: unknown
  is_correct?: boolean
  score_value?: number
}

export interface AssessmentQuestion {
  id: number
  code: string
  question_type: QuestionType
  prompt: string
  max_score: number
  time_limit_seconds?: number | null
  metadata?: Record<string, unknown> | null
  options?: AssessmentOption[]
}

export interface AssessmentModel {
  id: number
  code: string
  title: string
  description?: string | null
  duration_minutes: number
  passing_score: number
  status: string
  questions: AssessmentQuestion[]
}

export interface AssessmentAnswerMap {
  [questionId: string]: {
    selected_option_ids?: number[]
    option_id?: number | number[]
    text?: string
    score?: number
    payload?: Record<string, unknown>
  }
}