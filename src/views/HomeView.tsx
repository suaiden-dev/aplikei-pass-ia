import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useLanguage } from '../controllers/useLanguage'

export function HomeView() {
  const [count, setCount] = useState(0)
  const { language, setLanguage, t } = useLanguage()

  return (
    <main className="app-shell">
      <section id="center">
        <header className="hero-header">
          <span className="hero-badge">{t.hero.badge}</span>
          <LanguageSwitcher
            currentLanguage={language}
            label={t.languageSwitcherLabel}
            onChange={setLanguage}
          />
        </header>

        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img
            src={reactLogo}
            className="framework"
            alt={t.accessibility.reactLogo}
          />
          <img src={viteLogo} className="vite" alt={t.accessibility.viteLogo} />
        </div>

        <div className="hero-copy">
          <h1>{t.hero.title}</h1>
          <p>{t.hero.description}</p>
          <div className="code-pill">
            <span>{t.hero.codeLabel}</span>
            <code>{t.hero.codeValue}</code>
          </div>
        </div>

        <button
          type="button"
          className="counter"
          onClick={() => setCount((currentCount) => currentCount + 1)}
        >
          {t.hero.counterLabel}: {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>{t.sections.docs.title}</h2>
          <p>{t.sections.docs.description}</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank" rel="noreferrer">
                <img className="logo" src={viteLogo} alt="" />
                {t.sections.docs.links.vite}
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank" rel="noreferrer">
                <img className="button-icon" src={reactLogo} alt="" />
                {t.sections.docs.links.react}
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>{t.sections.community.title}</h2>
          <p>{t.sections.community.description}</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank" rel="noreferrer">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                {t.sections.community.links.github}
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank" rel="noreferrer">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                {t.sections.community.links.discord}
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank" rel="noreferrer">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                {t.sections.community.links.x}
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank" rel="noreferrer">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                {t.sections.community.links.bluesky}
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </main>
  )
}
