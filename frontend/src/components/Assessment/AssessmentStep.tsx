import { Button } from '../ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Checkbox } from '../ui/checkbox'
import { RadioGroup, RadioGroupItem } from '../ui/radio-group'
import type { AssessmentAnswerMap, AssessmentQuestion } from './assessment-types'

interface AssessmentStepProps {
  question: AssessmentQuestion
  answer?: AssessmentAnswerMap[string]
  onAnswerChange: (questionId: number, nextValue: AssessmentAnswerMap[string]) => void
}

export function AssessmentStep({ question, answer, onAnswerChange }: AssessmentStepProps) {
  return (
    <Card className="border-slate-200 bg-white text-slate-900">
      <CardHeader>
        <CardTitle className="text-xl">{question.prompt}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {question.question_type === 'multiple_choice' ? (
          <RadioGroup
            value={String(answer?.option_id ?? '')}
            onValueChange={(value) => {
              // Only allow changing if no answer is selected yet
              if (!answer?.option_id) {
                onAnswerChange(question.id, { option_id: Number(value) })
              }
            }}
            className="space-y-3"
          >
            {question.options?.map((option) => (
              <label
                key={option.id}
                className={`flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ${
                  answer?.option_id ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                }`}
              >
                <RadioGroupItem 
                  value={String(option.id)} 
                  disabled={!!answer?.option_id}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </RadioGroup>
        ) : null}

        {question.question_type === 'scenario_based' ? (
          <textarea
            value={answer?.text ?? ''}
            onChange={(event) => onAnswerChange(question.id, { text: event.target.value })}
            className="min-h-36 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
            placeholder="Describe the best response to the scenario"
          />
        ) : null}

        {question.question_type === 'simulation' ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">Simulation scoring is captured from rubric data in JSON payloads.</p>
            <input
              type="number"
              value={answer?.score ?? ''}
              onChange={(event) => onAnswerChange(question.id, { score: Number(event.target.value) })}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
              placeholder="Score"
            />
          </div>
        ) : null}

        {question.options?.length ? (
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Supplementary flags</p>
            {question.options.map((option) => (
              <label 
                key={option.id} 
                className={`flex items-center gap-3 text-sm text-slate-600 ${
                  (answer?.selected_option_ids ?? []).length > 0 ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <Checkbox
                  checked={(answer?.selected_option_ids ?? []).includes(option.id)}
                  disabled={(answer?.selected_option_ids ?? []).length > 0}
                  onChange={(e) => {
                    const checked = e.target.checked
                    const selected = new Set(answer?.selected_option_ids ?? [])
                    if (checked) {
                      selected.add(option.id)
                    } else {
                      selected.delete(option.id)
                    }
                    onAnswerChange(question.id, { selected_option_ids: Array.from(selected) })
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          className="border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
          onClick={() => onAnswerChange(question.id, answer ?? {})}
        >
          Mark for review
        </Button>
      </CardContent>
    </Card>
  )
}