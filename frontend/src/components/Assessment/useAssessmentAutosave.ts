import { useEffect, useRef } from 'react'

import { axiosInstance } from '../../api/axios'
import { API_ROUTES } from '../../api/routes'
import type { AssessmentAnswerMap } from './assessment-types'

interface UseAssessmentAutosaveOptions {
  assessmentId: number
  attemptId?: number | null
  answers: AssessmentAnswerMap
  remainingTimeSeconds: number
  enabled: boolean
  onAttemptCreated?: (attemptId: number) => void
}

export function useAssessmentAutosave({ assessmentId, attemptId, answers, remainingTimeSeconds, enabled, onAttemptCreated }: UseAssessmentAutosaveOptions) {
  const lastSavedSnapshot = useRef<string>('')
  const isSaving = useRef(false)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const persist = async () => {
      if (isSaving.current) {
        return
      }

      const currentSnapshot = JSON.stringify({ assessmentId, attemptId, answers, remainingTimeSeconds })
      
      if (currentSnapshot === lastSavedSnapshot.current) {
        return
      }

      isSaving.current = true

      try {
        const response = await axiosInstance.post(API_ROUTES.ASSESSMENTS.AUTO_SAVE, {
          assessment_id: assessmentId,
          attempt_id: attemptId ?? undefined,
          answers,
          remaining_time_seconds: remainingTimeSeconds,
          status: 'in_progress',
        })

        // Notify parent if a new attempt was created
        if (!attemptId && response.data?.attempt?.id && onAttemptCreated) {
          onAttemptCreated(response.data.attempt.id)
        }

        lastSavedSnapshot.current = currentSnapshot
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        isSaving.current = false
      }
    }

    // Initial save
    void persist()

    // Periodic save every 30 seconds
    const timer = window.setInterval(() => {
      void persist()
    }, 30_000)

    return () => {
      window.clearInterval(timer)
    }
  }, [assessmentId, attemptId, answers, enabled, remainingTimeSeconds, onAttemptCreated])
}