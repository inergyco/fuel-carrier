import type { FormHTMLAttributes, ReactNode } from 'react'
import { FormProvider, type FieldValues, type UseFormReturn } from 'react-hook-form'

interface FormComponentProps<T extends UseFormReturn<FieldValues>>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: T
  onSubmit: Parameters<T['handleSubmit']>[0]
  children: ReactNode
}

export function Form<T extends UseFormReturn<FieldValues>>({
  form,
  onSubmit,
  children,
  ...props
}: FormComponentProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  )
}
