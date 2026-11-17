/**
 * Numeric input helpers that prevent the sticky leading-zero ("044") bug in
 * controlled React inputs while allowing temporary empty strings ("") during editing.
 */

export function sanitizeUnsignedIntInput(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, '');
  if (digits === '') return '';
  return digits.replace(/^0+(?=\d)/, '');
}

export function sanitizeSignedIntInput(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed === '') return '';
  const isNegative = trimmed.startsWith('-');
  const digits = trimmed.replace(/[^0-9]/g, '');
  if (digits === '') return isNegative ? '-' : '';
  const normalized = digits.replace(/^0+(?=\d)/, '');
  return isNegative ? `-${normalized}` : normalized;
}

export function toSafeNumber(value: string | number, fallback = 0): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-') return fallback;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : fallback;
}
