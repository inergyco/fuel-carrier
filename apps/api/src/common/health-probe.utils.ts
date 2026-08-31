export function isHealthProbeRequest(url: string | undefined): boolean {
  return url?.startsWith('/api/health') ?? false;
}
