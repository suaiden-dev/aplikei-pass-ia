import {
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  LANGUAGE_STORAGE_KEY,
  type Language,
} from '../models/language'
import { translations } from '../services/translations'
import { LanguageContext } from './language-context'

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE
  }

  const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)

  if (savedLanguage && isSupportedLanguage(savedLanguage)) {
    return savedLanguage
  }

  const browserLanguage = window.navigator.language.split('-')[0]

  if (isSupportedLanguage(browserLanguage)) {
    return browserLanguage
  }

  return DEFAULT_LANGUAGE
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage)

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: translations[language],
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
