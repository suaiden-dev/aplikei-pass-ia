import type { Language } from '../models/language'

export type Translation = {
  languageSwitcherLabel: string
  hero: {
    badge: string
    title: string
    description: string
    codeLabel: string
    codeValue: string
    counterLabel: string
  }
  sections: {
    docs: {
      title: string
      description: string
      links: {
        vite: string
        react: string
      }
    }
    community: {
      title: string
      description: string
      links: {
        github: string
        discord: string
        x: string
        bluesky: string
      }
    }
  }
  accessibility: {
    reactLogo: string
    viteLogo: string
  }
}

export const translations = {
  pt: {
    languageSwitcherLabel: 'Idioma',
    hero: {
      badge: 'Sistema multilíngue',
      title: 'Troque o idioma do projeto quando quiser',
      description:
        'O aplikei agora pode exibir a interface em português, inglês e espanhol, com troca manual e idioma salvo para os próximos acessos.',
      codeLabel: 'Arquivo inicial',
      codeValue: 'src/views/HomeView.tsx',
      counterLabel: 'Cliques',
    },
    sections: {
      docs: {
        title: 'Documentação',
        description: 'Use os guias oficiais para evoluir a base React e Vite.',
        links: {
          vite: 'Explorar Vite',
          react: 'Aprender React',
        },
      },
      community: {
        title: 'Comunidade',
        description: 'Acompanhe canais oficiais e referências úteis do ecossistema.',
        links: {
          github: 'GitHub',
          discord: 'Discord',
          x: 'X.com',
          bluesky: 'Bluesky',
        },
      },
    },
    accessibility: {
      reactLogo: 'Logo do React',
      viteLogo: 'Logo do Vite',
    },
  },
  en: {
    languageSwitcherLabel: 'Language',
    hero: {
      badge: 'Multilingual system',
      title: 'Switch the project language whenever you need',
      description:
        'Aplikei can now render the interface in Portuguese, English, and Spanish, with manual switching and saved preference for future visits.',
      codeLabel: 'Starting file',
      codeValue: 'src/views/HomeView.tsx',
      counterLabel: 'Clicks',
    },
    sections: {
      docs: {
        title: 'Documentation',
        description: 'Use the official guides to grow the React and Vite foundation.',
        links: {
          vite: 'Explore Vite',
          react: 'Learn React',
        },
      },
      community: {
        title: 'Community',
        description: 'Follow official channels and useful references from the ecosystem.',
        links: {
          github: 'GitHub',
          discord: 'Discord',
          x: 'X.com',
          bluesky: 'Bluesky',
        },
      },
    },
    accessibility: {
      reactLogo: 'React logo',
      viteLogo: 'Vite logo',
    },
  },
  es: {
    languageSwitcherLabel: 'Idioma',
    hero: {
      badge: 'Sistema multilingüe',
      title: 'Cambia el idioma del proyecto cuando lo necesites',
      description:
        'Aplikei ahora puede mostrar la interfaz en portugués, inglés y español, con cambio manual y preferencia guardada para los próximos accesos.',
      codeLabel: 'Archivo inicial',
      codeValue: 'src/views/HomeView.tsx',
      counterLabel: 'Clics',
    },
    sections: {
      docs: {
        title: 'Documentación',
        description: 'Usa las guías oficiales para evolucionar la base con React y Vite.',
        links: {
          vite: 'Explorar Vite',
          react: 'Aprender React',
        },
      },
      community: {
        title: 'Comunidad',
        description: 'Sigue canales oficiales y referencias útiles del ecosistema.',
        links: {
          github: 'GitHub',
          discord: 'Discord',
          x: 'X.com',
          bluesky: 'Bluesky',
        },
      },
    },
    accessibility: {
      reactLogo: 'Logo de React',
      viteLogo: 'Logo de Vite',
    },
  },
} satisfies Record<Language, Translation>
