export const supportedLanguages = ['pt', 'en', 'es'] as const

export type Language = (typeof supportedLanguages)[number]

export type LanguageOption = {
  code: Language
  label: string
}

export const languageOptions: LanguageOption[] = [
  { code: 'pt', label: 'Português' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
]

export const DEFAULT_LANGUAGE: Language = 'pt'

export const LANGUAGE_STORAGE_KEY = 'aplikei.language'

export function isSupportedLanguage(value: string): value is Language {
  return supportedLanguages.includes(value as Language)
}
