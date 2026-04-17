export function getImportPathStatErrorMessage(targetPath: string, err: unknown): string {
  if (
    err &&
    typeof err === 'object' &&
    'code' in err &&
    (err as { code?: string }).code
  ) {
    const code = (err as { code: string }).code;
    if (code === 'ENOENT') {
      return `Path not found: "${targetPath}". Please check the path and try again.`;
    }
    if (code === 'EACCES' || code === 'EPERM') {
      return `Permission denied for path: "${targetPath}". Check file permissions and try again.`;
    }
  }

  const message = err instanceof Error ? err.message : String(err);
  return `Failed to access path "${targetPath}": ${message}`;
}
