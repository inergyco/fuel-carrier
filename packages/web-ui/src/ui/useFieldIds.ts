import { useId } from 'react'

export function useFieldIds({
  id: idProp,
  error,
}: {
  id?: string
  error?: string
}): { id: string; errorId: string | undefined } {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = error ? `${id}-error` : undefined

  return { id, errorId }
}
