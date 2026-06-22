import type { ReactNode } from 'react'

interface FieldProps {
  label?: string
  error?: string
  children: ReactNode
}

export function Field({ label, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium tracking-widest text-base-content/40 uppercase">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-error/80">{error}</p>}
    </div>
  )
}
