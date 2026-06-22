import type { FormHTMLAttributes, ReactNode } from 'react'
import {
  FormProvider,
  type FieldValues,
  type SubmitHandler,
  type UseFormReturn,
} from 'react-hook-form'

interface FormComponentProps<
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues = TFieldValues,
> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  form: UseFormReturn<TFieldValues, unknown, TTransformedValues>
  onSubmit: SubmitHandler<TTransformedValues>
  children: ReactNode
}

export function Form<
  TFieldValues extends FieldValues,
  TTransformedValues extends FieldValues = TFieldValues,
>({
  form,
  onSubmit,
  children,
  ...props
}: FormComponentProps<TFieldValues, TTransformedValues>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  )
}
