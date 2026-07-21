import type { InputHTMLAttributes } from 'react'

export function Checkbox(props: InputHTMLAttributes<HTMLInputElement>) {
  const { checked, onChange, ...rest } = props
  return (
    <input 
      type="checkbox" 
      className="h-4 w-4 rounded border-slate-300 bg-white text-[var(--najiz-accent)]" 
      checked={checked}
      onChange={onChange}
      {...rest} 
    />
  )
}