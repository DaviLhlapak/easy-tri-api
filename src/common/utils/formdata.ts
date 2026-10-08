export function preprocessJsonFromFormData(val: unknown): unknown {
  if (typeof val === 'string') return JSON.parse(val);
  return null;
}
