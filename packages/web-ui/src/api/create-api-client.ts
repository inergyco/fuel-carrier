import ky, { type KyInstance, type Options } from 'ky'

export type CreateApiClientOptions = {
  prefixUrl: string
} & Pick<Options, 'credentials' | 'hooks' | 'timeout'>

export function createApiClient({
  prefixUrl,
  credentials = 'include',
  timeout = 30_000,
  hooks,
}: CreateApiClientOptions): KyInstance {
  return ky.create({
    prefixUrl,
    credentials,
    timeout,
    headers: {
      Accept: 'application/json',
    },
    hooks,
  })
}
