import { axiosInstance } from './axios'
import { API_ROUTES } from './routes'

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface AcademyRecord {
  id: number
  code: string
  name: string
  description: string | null
  status: string
  departments_count?: number
  courses_count?: number
  updated_at?: string
}

export interface DepartmentRecord {
  id: number
  academy_id: number
  code: string
  name: string
  description: string | null
  sort_order: number
  is_active: boolean
  academy?: { id: number; name: string }
  competencies_count?: number
  updated_at?: string
}

export interface CompetencyRecord {
  id: number
  department_id: number
  code: string
  name: string
  description: string | null
  weight: string | number
  success_threshold: string | number
  sort_order: number
  is_active: boolean
  department?: { id: number; name: string }
  questions_count?: number
  courses_count?: number
  updated_at?: string
}

export interface QuestionOptionRecord {
  id?: number
  code?: string | null
  label: string
  is_correct: boolean
  score_value?: string | number
  sort_order?: number
}

export interface QuestionRecord {
  id: number
  department_id?: number | null
  competency_id?: number | null
  code: string
  question_type: string
  prompt: string
  max_score: string | number
  time_limit_seconds: number | null
  sort_order: number
  is_active: boolean
  department?: { id: number; name: string }
  competency?: { id: number; name: string }
  options?: QuestionOptionRecord[]
  options_count?: number
  updated_at?: string
}

export interface AssessmentRecord {
  id: number
  academy_id?: number | null
  department_id?: number | null
  code: string
  title: string
  description: string | null
  duration_minutes: number
  passing_score: string | number
  status: string
  published_at?: string | null
  academy?: { id: number; name: string }
  department?: { id: number; name: string }
  items?: Array<{ id: number; code: string; prompt: string; question_type: string }>
  items_count?: number
  attempts_count?: number
  updated_at?: string
}

export interface CourseRecord {
  id: number
  academy_id?: number | null
  code: string
  name: string
  description: string | null
  duration_minutes: number | null
  difficulty: string
  is_active: boolean
  academy?: { id: number; name: string }
  competencies_count?: number
  updated_at?: string
}

export interface TrainingPlanRecord {
  id: number
  status: string
  generated_at: string | null
  started_at: string | null
  completed_at: string | null
  user?: { id: number; name: string; email: string }
  items_count: number
  items?: Array<{
    id: number
    status: string
    priority: number | null
    competency?: { id: number; name: string }
    course?: { id: number; name: string }
  }>
}

export interface CertificateRecord {
  id: number
  certificate_number: string
  issued_at: string | null
  expires_at: string | null
  user?: { id: number; name: string; email: string }
  updated_at: string
}

export interface AuditLogRecord {
  id: number
  action: string
  event: string | null
  auditable_type: string
  auditable_id: number
  ip_address: string | null
  created_at: string
  user?: { id: number; name: string; email: string }
}

export interface LookupsResponse {
  academies: Array<{ id: number; name: string; code: string }>
  departments: Array<{ id: number; academy_id: number; name: string; code: string }>
  competencies: Array<{ id: number; department_id: number; name: string; code: string }>
  questions: Array<{ id: number; code: string; prompt: string; question_type: string; is_active: boolean }>
}

async function fetchPaginated<T>(url: string): Promise<PaginatedResponse<T>> {
  const response = await axiosInstance.get<PaginatedResponse<T>>(url)
  return response.data
}

export function fetchAcademies() {
  return fetchPaginated<AcademyRecord>(API_ROUTES.MANAGEMENT.ACADEMIES)
}

export function createAcademy(payload: Partial<AcademyRecord>) {
  return axiosInstance.post<AcademyRecord>(API_ROUTES.MANAGEMENT.ACADEMIES, payload).then((r) => r.data)
}

export function updateAcademy(id: number, payload: Partial<AcademyRecord>) {
  return axiosInstance.put<AcademyRecord>(`${API_ROUTES.MANAGEMENT.ACADEMIES}/${id}`, payload).then((r) => r.data)
}

export function deleteAcademy(id: number) {
  return axiosInstance.delete(`${API_ROUTES.MANAGEMENT.ACADEMIES}/${id}`)
}

export function fetchDepartments() {
  return fetchPaginated<DepartmentRecord>(API_ROUTES.MANAGEMENT.DEPARTMENTS)
}

export function createDepartment(payload: Partial<DepartmentRecord>) {
  return axiosInstance.post<DepartmentRecord>(API_ROUTES.MANAGEMENT.DEPARTMENTS, payload).then((r) => r.data)
}

export function updateDepartment(id: number, payload: Partial<DepartmentRecord>) {
  return axiosInstance.put<DepartmentRecord>(`${API_ROUTES.MANAGEMENT.DEPARTMENTS}/${id}`, payload).then((r) => r.data)
}

export function deleteDepartment(id: number) {
  return axiosInstance.delete(`${API_ROUTES.MANAGEMENT.DEPARTMENTS}/${id}`)
}

export function fetchCompetencies() {
  return fetchPaginated<CompetencyRecord>(API_ROUTES.MANAGEMENT.COMPETENCIES)
}

export function createCompetency(payload: Partial<CompetencyRecord>) {
  return axiosInstance.post<CompetencyRecord>(API_ROUTES.MANAGEMENT.COMPETENCIES, payload).then((r) => r.data)
}

export function updateCompetency(id: number, payload: Partial<CompetencyRecord>) {
  return axiosInstance.put<CompetencyRecord>(`${API_ROUTES.MANAGEMENT.COMPETENCIES}/${id}`, payload).then((r) => r.data)
}

export function deleteCompetency(id: number) {
  return axiosInstance.delete(`${API_ROUTES.MANAGEMENT.COMPETENCIES}/${id}`)
}

export function fetchQuestions() {
  return fetchPaginated<QuestionRecord>(API_ROUTES.MANAGEMENT.QUESTIONS)
}

export function createQuestion(payload: Record<string, unknown>) {
  return axiosInstance.post<QuestionRecord>(API_ROUTES.MANAGEMENT.QUESTIONS, payload).then((r) => r.data)
}

export function updateQuestion(id: number, payload: Record<string, unknown>) {
  return axiosInstance.put<QuestionRecord>(`${API_ROUTES.MANAGEMENT.QUESTIONS}/${id}`, payload).then((r) => r.data)
}

export function deleteQuestion(id: number) {
  return axiosInstance.delete(`${API_ROUTES.MANAGEMENT.QUESTIONS}/${id}`)
}

export function fetchAssessments() {
  return fetchPaginated<AssessmentRecord>(API_ROUTES.MANAGEMENT.ASSESSMENTS)
}

export function fetchAssessment(id: number) {
  return axiosInstance.get<AssessmentRecord>(`${API_ROUTES.MANAGEMENT.ASSESSMENTS}/${id}`).then((r) => r.data)
}

export function createAssessment(payload: Record<string, unknown>) {
  return axiosInstance.post<AssessmentRecord>(API_ROUTES.MANAGEMENT.ASSESSMENTS, payload).then((r) => r.data)
}

export function updateAssessment(id: number, payload: Record<string, unknown>) {
  return axiosInstance.put<AssessmentRecord>(`${API_ROUTES.MANAGEMENT.ASSESSMENTS}/${id}`, payload).then((r) => r.data)
}

export function deleteAssessment(id: number) {
  return axiosInstance.delete(`${API_ROUTES.MANAGEMENT.ASSESSMENTS}/${id}`)
}

export function fetchTrainingPlans() {
  return fetchPaginated<TrainingPlanRecord>(API_ROUTES.MANAGEMENT.TRAINING_PLANS)
}

export function fetchCourses() {
  return fetchPaginated<CourseRecord>(API_ROUTES.MANAGEMENT.COURSES)
}

export function createCourse(payload: Partial<CourseRecord>) {
  return axiosInstance.post<CourseRecord>(API_ROUTES.MANAGEMENT.COURSES, payload).then((r) => r.data)
}

export function updateCourse(id: number, payload: Partial<CourseRecord>) {
  return axiosInstance.put<CourseRecord>(`${API_ROUTES.MANAGEMENT.COURSES}/${id}`, payload).then((r) => r.data)
}

export function deleteCourse(id: number) {
  return axiosInstance.delete(`${API_ROUTES.MANAGEMENT.COURSES}/${id}`)
}

export function fetchCertificates() {
  return fetchPaginated<CertificateRecord>(API_ROUTES.MANAGEMENT.CERTIFICATES)
}

export function fetchAuditLogs() {
  return fetchPaginated<AuditLogRecord>(API_ROUTES.MANAGEMENT.AUDIT_LOGS)
}

export function fetchLookups() {
  return axiosInstance.get<LookupsResponse>(API_ROUTES.MANAGEMENT.LOOKUPS).then((r) => r.data)
}
