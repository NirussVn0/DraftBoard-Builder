import { vi } from './vi';
import type { LocaleStrings, LocaleKey } from './types';

const LOCALES: Record<LocaleKey, LocaleStrings> = { vi, en: vi };

let currentLocale: LocaleKey = 'vi';

export function setLocale(key: LocaleKey): void {
  currentLocale = key;
}

export function getLocale(): LocaleKey {
  return currentLocale;
}

export function t(): LocaleStrings {
  return LOCALES[currentLocale];
}
