export function isMissingTableError(error: unknown, tableName: string) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as { code?: string; message?: string }

  return (
    maybeError.code === 'PGRST205' &&
    typeof maybeError.message === 'string' &&
    maybeError.message.includes(`'public.${tableName}'`)
  )
}
