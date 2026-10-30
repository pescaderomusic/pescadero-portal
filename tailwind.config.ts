import type { Config } from 'tailwindcss'

// Token set mirrors the Stitch "Midcentury Pacific Jazz Press" mockups so markup can be
// ported class-for-class. Brand-critical tokens (primary/secondary/tertiary/surface/
// background) are mapped to the site's real hex values rather than Stitch's auto-generated
// placeholders, so ported screens match the deployed brand exactly.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  corePlugins: {
    // globals.css already supplies a site-wide reset; skip Tailwind's own to avoid
    // double-resetting styles on the existing (non-Tailwind) pages.
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        // Core surfaces
        background: '#F5EFE0',
        'on-background': '#07111A',
        surface: '#F5EFE0',
        'surface-dim': '#dfdacb',
        'surface-bright': '#F5EFE0',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f9f3e4',
        'surface-container': '#f3edde',
        'surface-container-high': '#eee8d9',
        'surface-container-highest': '#e8e2d3',
        'on-surface': '#07111A',
        'on-surface-variant': '#44474b',
        'inverse-surface': '#333027',
        'inverse-on-surface': '#F5EFE0',
        outline: '#74777c',
        'outline-variant': '#c4c6cb',
        'surface-tint': '#555f6a',

        // Primary = deep ink navy (brand navy, not Stitch's placeholder black)
        primary: '#07111A',
        'on-primary': '#F5EFE0',
        'primary-container': '#0D1E2B',
        'on-primary-container': '#bdc7d4',
        'inverse-primary': '#bdc7d4',
        'primary-fixed': '#d9e3f1',
        'primary-fixed-dim': '#bdc7d4',
        'on-primary-fixed': '#0D1E2B',
        'on-primary-fixed-variant': '#3e4852',

        // Secondary = spot red ink (brand red, not Stitch's placeholder #b81021)
        secondary: '#C8202A',
        'on-secondary': '#F5EFE0',
        'secondary-container': '#dc3036',
        'on-secondary-container': '#fffbff',
        'secondary-fixed': '#ffdad7',
        'secondary-fixed-dim': '#ffb3ae',
        'on-secondary-fixed': '#410004',
        'on-secondary-fixed-variant': '#930014',

        // Tertiary = Pacific teal accent (brand teal, not Stitch's placeholder black/teal mix)
        tertiary: '#44BEC7',
        'on-tertiary': '#07111A',
        'tertiary-container': '#0D1E2B',
        'on-tertiary-container': '#44BEC7',
        'tertiary-fixed': '#81f4fd',
        'tertiary-fixed-dim': '#62d7e0',
        'on-tertiary-fixed': '#002022',
        'on-tertiary-fixed-variant': '#004f54',

        // Aged brass / ochre gold accent (curator notes, dividers, badge highlights)
        gold: '#C8A96E',

        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
      },
      fontFamily: {
        'display-xl': ['Newsreader', 'Georgia', 'serif'],
        'display-xl-mobile': ['Newsreader', 'Georgia', 'serif'],
        'headline-lg': ['Newsreader', 'Georgia', 'serif'],
        'headline-lg-mobile': ['Newsreader', 'Georgia', 'serif'],
        'headline-md': ['Newsreader', 'Georgia', 'serif'],
        'headline-sm': ['Newsreader', 'Georgia', 'serif'],
        'title-editorial': ['Newsreader', 'Georgia', 'serif'],
        'editorial-note': ['Newsreader', 'Georgia', 'serif'],
        'body-lg': ['inter', 'system-ui', 'sans-serif'],
        'body-md': ['inter', 'system-ui', 'sans-serif'],
        'body-sm': ['inter', 'system-ui', 'sans-serif'],
        'label-lg': ['futura-pt-condensed', 'Barlow Condensed', 'sans-serif'],
        'label-md': ['futura-pt-condensed', 'Barlow Condensed', 'sans-serif'],
        'label-sm': ['futura-pt-condensed', 'Barlow Condensed', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['64px', { lineHeight: '70px', letterSpacing: '-0.03em' }],
        'display-xl-mobile': ['40px', { lineHeight: '46px', letterSpacing: '-0.02em' }],
        'headline-lg': ['48px', { lineHeight: '54px', letterSpacing: '-0.02em' }],
        'headline-lg-mobile': ['32px', { lineHeight: '38px', letterSpacing: '-0.01em' }],
        'headline-md': ['32px', { lineHeight: '38px', letterSpacing: '-0.01em' }],
        'headline-sm': ['24px', { lineHeight: '30px' }],
        'title-editorial': ['20px', { lineHeight: '28px' }],
        'body-lg': ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        'body-md': ['15px', { lineHeight: '24px' }],
        'body-sm': ['13px', { lineHeight: '18px' }],
        'label-lg': ['16px', { lineHeight: '20px', letterSpacing: '0.12em' }],
        'label-md': ['13px', { lineHeight: '16px', letterSpacing: '0.15em' }],
        'label-sm': ['11px', { lineHeight: '14px', letterSpacing: '0.18em' }],
        'editorial-note': ['16px', { lineHeight: '24px', letterSpacing: '0.01em' }],
      },
      spacing: {
        gutter: '1.5rem',
        'gutter-mobile': '1rem',
        margin: '3rem',
        'margin-mobile': '1.25rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
      },
    },
  },
  plugins: [],
}

export default config
