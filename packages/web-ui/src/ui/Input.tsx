import { useState, type InputHTMLAttributes, type Ref } from 'react'
import { useI18nContext } from '@fuel-carrier/i18n/react'
import { Eye, EyeOff } from '../icons'
import { cn } from '../utils'
import { Field } from './Field'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

function isUsernameField(name?: string, autoComplete?: string): boolean {
  if (autoComplete?.includes('username')) {
    return true
  }

  return name === 'username'
}

export function Input({
  label,
  error,
  className,
  ref,
  type,
  name,
  autoComplete,
  ...props
}: InputProps) {
  const { LL } = useI18nContext()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const isPassword = type === 'password'
  const isLtr = isPassword || isUsernameField(name, autoComplete)
  const inputType = isPassword && passwordVisible ? 'text' : type
  const toggleLabel = passwordVisible
    ? LL.common.hidePassword()
    : LL.common.showPassword()

  function handleTogglePasswordVisibility() {
    setPasswordVisible(function toggleVisible(current) {
      return !current
    })
  }

  const input = (
    <input
      ref={ref}
      name={name}
      autoComplete={autoComplete}
      type={inputType}
      dir={isLtr ? 'ltr' : undefined}
      className={cn(
        'input input-sm h-10 w-full rounded-lg border bg-base-100/60 text-sm tracking-wide placeholder:text-base-content/20 focus:outline-none focus:ring-1',
        error
          ? 'border-error/60 focus:ring-error/40'
          : 'border-base-content/10 focus:ring-primary/40',
        isLtr ? 'px-3 text-left placeholder:text-left' : 'px-3',
        isPassword && 'pr-10',
        className,
      )}
      {...props}
    />
  )

  const fieldContent = isLtr ? (
    <div dir="ltr" className={cn(isPassword && 'relative')}>
      {input}
      {isPassword ? (
        <button
          type="button"
          tabIndex={-1}
          aria-label={toggleLabel}
          onClick={handleTogglePasswordVisibility}
          className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-base-content/45 transition-colors hover:bg-base-content/5 hover:text-base-content/70"
        >
          {passwordVisible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </button>
      ) : null}
    </div>
  ) : (
    input
  )

  return <Field label={label} error={error}>{fieldContent}</Field>
}
