import type { HTMLAttributes } from 'react'

function classNames(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(' ')
}

export function Table({ className = '', ...props }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <table className={classNames('w-full border-collapse text-left text-sm text-slate-700', className)} {...props} />
    </div>
  )
}

export function TableHeader({ className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className={classNames('bg-slate-50 text-xs uppercase tracking-[0.28em] text-slate-500', className)} {...props} />
}

export function TableBody({ className = '', ...props }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={classNames('divide-y divide-slate-200', className)} {...props} />
}

export function TableRow({ className = '', ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={classNames('transition hover:bg-slate-50', className)} {...props} />
}

export function TableHead({ className = '', ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <th className={classNames('px-5 py-4 font-medium', className)} {...props} />
}

export function TableCell({ className = '', ...props }: HTMLAttributes<HTMLTableCellElement>) {
  return <td className={classNames('px-5 py-4 align-top text-slate-700', className)} {...props} />
}