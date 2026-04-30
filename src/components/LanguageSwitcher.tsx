import {
  isSupportedLanguage,
  languageOptions,
  type Language,
} from '../models/language'

type LanguageSwitcherProps = {
  currentLanguage: Language
  label: string
  onChange: (language: Language) => void
}

export function LanguageSwitcher({
  currentLanguage,
  label,
  onChange,
}: LanguageSwitcherProps) {
  return (
    <label className="language-switcher">
      <span>{label}</span>
      <select
        value={currentLanguage}
        onChange={(event) => {
          const nextLanguage = event.target.value

          if (isSupportedLanguage(nextLanguage)) {
            onChange(nextLanguage)
          }
        }}
      >
        {languageOptions.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
