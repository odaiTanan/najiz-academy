import type { InputHTMLAttributes, ReactNode } from 'react'

interface RadioGroupProps {
  children: ReactNode
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export function RadioGroup({ children, value, onValueChange, className }: RadioGroupProps) {
  return <div className={className}>{children}</div>
}

export function RadioGroupItem(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input type="radio" className="h-4 w-4 border-slate-300 bg-white text-[var(--najiz-accent)]" {...props} />
}