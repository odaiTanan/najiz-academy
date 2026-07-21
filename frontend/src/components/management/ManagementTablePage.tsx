import type { ReactNode } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'

export interface ManagementColumn<T> {
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface ManagementTablePageProps<T extends { id: number | string }> {
  eyebrow: string
  title: string
  description: string
  rows: T[]
  columns: Array<ManagementColumn<T>>
  isLoading: boolean
  emptyMessage: string
  totalCount?: number
  actions?: ReactNode
  canManage?: boolean
}

export function ManagementTablePage<T extends { id: number | string }>({
  eyebrow,
  title,
  description,
  rows,
  columns,
  isLoading,
  emptyMessage,
  totalCount,
  actions,
}: ManagementTablePageProps<T>) {
  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-gradient-to-br from-[var(--najiz-surface)] to-slate-100 text-slate-900 shadow-lg shadow-slate-200/50">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-[var(--najiz-accent)]">{eyebrow}</p>
            <CardTitle className="mt-3 text-3xl">{title}</CardTitle>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">الصفوف المعروضة</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{rows.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">إجمالي السجلات</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{totalCount ?? rows.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs text-slate-500">الحالة</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{isLoading ? 'جاري التحميل' : 'جاهز'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.header} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length ? (
            rows.map((row) => (
              <TableRow key={row.id}>
                {columns.map((column) => (
                  <TableCell key={column.header} className={column.className}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-16 text-center text-slate-500">
                {isLoading ? 'جاري تحميل السجلات...' : emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
