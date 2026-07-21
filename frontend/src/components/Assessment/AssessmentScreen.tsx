import { useEffect, useMemo, useState } from 'react'

import { useMutation, useQuery } from '@tanstack/react-query'

import { axiosInstance } from '../../api/axios'
import { API_ROUTES } from '../../api/routes'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { AssessmentStep } from './AssessmentStep'
import { AssessmentTimer } from './AssessmentTimer'
import type { AssessmentAnswerMap, AssessmentModel } from './assessment-types'

interface AssessmentScreenProps {
  assessmentId: number
}

export function AssessmentScreen({ assessmentId }: AssessmentScreenProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [answers, setAnswers] = useState<AssessmentAnswerMap>({})
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const assessmentQuery = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      const response = await axiosInstance.get<{ data: AssessmentModel }>(API_ROUTES.ASSESSMENTS.BY_ID(assessmentId))
      return response.data.data ?? response.data
    },
  })

  useEffect(() => {
    if (!assessmentQuery.data) {
      return
    }

    setRemainingSeconds(assessmentQuery.data.duration_minutes * 60)
  }, [assessmentQuery.data])


  useEffect(() => {
    if (remainingSeconds <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [remainingSeconds])

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Create attempt and submit in one go
      const response = await axiosInstance.post(API_ROUTES.ASSESSMENTS.AUTO_SAVE, {
        assessment_id: assessmentId,
        attempt_id: undefined,
        answers,
        remaining_time_seconds: remainingSeconds,
        status: 'in_progress',
      })
      
      if (response.data?.attempt?.id) {
        const attemptId = response.data.attempt.id
        const submitResponse = await axiosInstance.post(API_ROUTES.ASSESSMENTS.SUBMIT(attemptId))
        return submitResponse.data
      }
      throw new Error('Failed to create attempt')
    },
    onSuccess: () => {
      window.location.href = '/dashboard/assessments'
    },
    onError: (error) => {
      console.error('Submit failed:', error)
      alert('فشل إرسال الاختبار. يرجى المحاولة مرة أخرى.')
    },
  })

  useEffect(() => {
    if (remainingSeconds === 0 && assessmentQuery.data?.questions?.length) {
      void submitMutation.mutateAsync()
    }
  }, [assessmentQuery.data?.questions?.length, remainingSeconds, submitMutation])

  const questions = assessmentQuery.data?.questions ?? []
  const currentQuestion = questions[activeStep]

  const progress = useMemo(() => {
    if (!questions.length) {
      return 0
    }

    return Math.round(((activeStep + 1) / questions.length) * 100)
  }, [activeStep, questions.length])

  const handleNext = () => {
    setActiveStep((current) => Math.min(questions.length - 1, current + 1))
  }

  if (assessmentQuery.isLoading) {
    return <div className="text-slate-600">Loading assessment...</div>
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white text-slate-900">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--najiz-accent)]">Assessment</p>
              <CardTitle className="mt-2 text-3xl">{assessmentQuery.data?.title}</CardTitle>
            </div>
            <AssessmentTimer remainingSeconds={remainingSeconds} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-[var(--najiz-accent)] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-slate-600">Step {activeStep + 1} of {questions.length}</p>
        </CardContent>
      </Card>

      {currentQuestion ? (
        <AssessmentStep
          question={currentQuestion}
          answer={answers[String(currentQuestion.id)]}
          onAnswerChange={(questionId, nextValue) => {
            setAnswers((current) => ({
              ...current,
              [String(questionId)]: nextValue,
            }))
          }}
        />
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <Button
          type="button"
          variant="outline"
          className="border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
          onClick={() => setActiveStep((current) => Math.max(0, current - 1))}
          disabled={activeStep === 0}
        >
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {activeStep < questions.length - 1 ? (
            <Button
              type="button"
              className="bg-[var(--najiz-accent)] text-slate-950 hover:opacity-90"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-[var(--najiz-accent)] text-slate-950 hover:opacity-90"
              onClick={() => void submitMutation.mutateAsync()}
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}