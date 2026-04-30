import { createContext } from 'react'
import type { Language } from '../models/language'
import type { Translation } from '../services/translations'

export type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: Translation
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)
