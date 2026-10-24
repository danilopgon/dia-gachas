/** Normaliza un texto para buscar sin tildes, mayúsculas ni espacios sobrantes. */
export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim().replace(/\s+/g, ' ');
}
