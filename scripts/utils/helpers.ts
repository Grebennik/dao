export function generateEnsName(prefix: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `${prefix}-${timestamp}`;
}