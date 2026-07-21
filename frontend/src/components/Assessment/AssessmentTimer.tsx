interface AssessmentTimerProps {
  remainingSeconds: number
}

export function AssessmentTimer({ remainingSeconds }: AssessmentTimerProps) {
  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Remaining time</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
    </div>
  )
}