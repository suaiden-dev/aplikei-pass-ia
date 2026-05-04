---
name: Modern Tech Framework
colors:
  surface: '#10131a'
  surface-dim: '#10131a'
  surface-bright: '#363941'
  surface-container-lowest: '#0b0e15'
  surface-container-low: '#191b23'
  surface-container: '#1d2027'
  surface-container-high: '#272a31'
  surface-container-highest: '#32353c'
  on-surface: '#e1e2ec'
  on-surface-variant: '#c2c6d6'
  inverse-surface: '#e1e2ec'
  inverse-on-surface: '#2e3038'
  outline: '#8c909f'
  outline-variant: '#424754'
  surface-tint: '#adc6ff'
  primary: '#adc6ff'
  on-primary: '#002e6a'
  primary-container: '#4d8eff'
  on-primary-container: '#00285d'
  inverse-primary: '#005ac2'
  secondary: '#a4c9ff'
  on-secondary: '#00315d'
  secondary-container: '#0267b8'
  on-secondary-container: '#d6e5ff'
  tertiary: '#ffb786'
  on-tertiary: '#502400'
  tertiary-container: '#df7412'
  on-tertiary-container: '#461f00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#adc6ff'
  on-primary-fixed: '#001a42'
  on-primary-fixed-variant: '#004395'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#ffdcc6'
  tertiary-fixed-dim: '#ffb786'
  on-tertiary-fixed: '#311400'
  on-tertiary-fixed-variant: '#723600'
  background: '#10131a'
  on-background: '#e1e2ec'
  surface-variant: '#32353c'
typography:
  h1:
    fontFamily: Manrope
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Manrope
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  h3:
    fontFamily: Manrope
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: '0'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  gutter: 24px
---

## Brand & Style

This design system is engineered for high-trust technology platforms that require a balance between cutting-edge innovation and professional reliability. The visual language evokes a sense of security and clarity, utilizing a "Modern Corporate" aesthetic infused with subtle "Glassmorphism" elements to prevent the dark interface from feeling flat.

The target audience consists of professionals and tech-savvy users who value efficiency and precision. The UI should feel responsive, expansive, and premium, using light and depth to guide the user's focus toward critical actions and data points.

## Colors

The palette is anchored by a deep, midnight navy background that provides a high-contrast foundation for vibrant blue accents. 

- **Primary & Secondary:** Use the vibrant blue (#3b82f6) for primary call-to-actions, active states, and highlights. Use the lighter secondary blue for hover states or illustrative accents.
- **Neutrals:** The background is the darkest tier. Surface colors (used for cards and navigation bars) use a slightly lighter navy to create architectural hierarchy.
- **Text:** Maintain high legibility by using near-white for headings and muted slate-gray for secondary information and metadata.

## Typography

The typography strategy pairs **Manrope** for headlines with **Inter** for functional UI elements. 

Manrope provides a refined, geometric touch to large titles, ensuring the brand feels modern and sophisticated. Inter is used for all body text, inputs, and labels to maximize legibility and maintain a systematic, "tech-first" appearance. Tighten letter spacing on large headlines to maintain visual density, while allowing body text enough line-height to breathe against the dark background.

## Layout & Spacing

The design system utilizes a **fixed-grid** model within a maximum container width of 1280px. For internal layouts, a 12-column grid is standard, providing flexibility for diverse content blocks.

The spacing rhythm follows an 8px linear scale. Generous vertical padding (lg and xl units) should be used between major sections to emphasize clarity and prevent cognitive overload. Gutters are kept consistent at 24px to ensure a structured, aligned aesthetic across all viewport sizes.

## Elevation & Depth

Hierarchy in this design system is established through **Tonal Layers** and **Subtle Glows**.

1.  **Level 0 (Background):** The deepest navy (#0f172a), used for the main canvas.
2.  **Level 1 (Surface):** A lighter navy (#1e293b) with a 1px border (#334155). Used for cards, sections, and containers.
3.  **Level 2 (Interaction):** Elements that require focus (like active cards or buttons) receive a subtle outer glow using the primary blue color at 15% opacity with a large blur radius (20px+).

Shadows should be avoided in their traditional "black" form; instead, use tinted translucent layers or "inner glows" to simulate light reflecting off tech-focused surfaces.

## Shapes

The shape language is defined by a "Rounded" philosophy to soften the technical nature of the dark mode palette. 

Standard UI components like buttons and inputs use a **0.5rem (8px)** radius. Larger containers, such as feature cards or modal windows, should use **1rem (16px)** to create a distinct visual container. This consistent rounding communicates approachability while the sharp internal grid and high-contrast borders maintain the professional tone.

## Components

- **Buttons:** Primary buttons are solid #3b82f6 with white text. Use a subtle gradient (top-to-bottom) for added depth. Secondary buttons should use a ghost style with a 1px border.
- **Cards:** Use a tonal background (#1e293b) with a clean 1px border (#334155). Ensure cards have generous internal padding (min 24px) to maintain the "clean" attribute.
- **Inputs:** Input fields should be darker than the surface they sit on to create a "recessed" look. On focus, the border must transition to the primary blue with a soft outer glow.
- **Chips/Badges:** Small, pill-shaped elements with low-opacity primary blue backgrounds and high-opacity blue text for status or categories.
- **Lists & Accordions:** Use clean horizontal dividers (#334155). Accordion headers should feature a subtle hover state transition to indicate interactivity.
- **Section Dividers:** Instead of simple lines, use slight tonal shifts in background color or high-contrast borders to separate major landing page sections.