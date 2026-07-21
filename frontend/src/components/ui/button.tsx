import type { ButtonHTMLAttributes } from 'react'

export function Button({ className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default' | 'secondary' | 'outline' }) {
  return <button className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${className}`} {...props} />
}