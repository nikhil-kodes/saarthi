import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Ink & neutrals
        ink: '#12151A',
        'ink-pressed': '#1E2228',
        'neutral-700': '#4B5563',
        'neutral-500': '#6B7280',
        'neutral-300': '#C7C4BC',

        // Canvas & surface
        canvas: '#F7F6F3',
        'surface-white': '#FFFFFF',
        'surface-soft': '#FBFAF8',
        'surface-faint': '#F1F0EC',

        // Dark band (big-moment surfaces)
        'surface-dark': '#14181F',
        'surface-dark-raised': '#1D2230',
        'on-dark': '#FFFFFF',
        'on-dark-muted': '#A6ACBB',

        // Hairlines
        hairline: '#E4E2DD',
        'hairline-on-dark': '#2B3040',

        // Brand primary (trust)
        'brand-navy': '#123A73',
        'brand-blue': '#2C6FE0',
        'brand-blue-deep': '#154FB0',
        'brand-blue-light': '#D6E4FA',

        // Status system — semantic, load-bearing
        'status-success': '#1E8A5F',
        'status-success-bg': '#E4F4EC',
        'status-warning': '#C87F12',
        'status-warning-bg': '#FBF0DC',
        'status-danger': '#B3362A',
        'status-danger-bg': '#F8E5E2',
        'status-info': '#2C6FE0',
        'status-info-bg': '#E7EFFC',
        'status-neutral': '#6B7280',
        'status-neutral-bg': '#F1F0EC',

        // Identity accent (India nod)
        saffron: '#E8871E',

        // Sandbox / demo indicator (mandatory for MockProvider screens)
        sandbox: '#8A4FD1',
        'sandbox-bg': '#F1E9FB',
      },
      spacing: {
        xxs: '4px',
        xs: '8px',
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '28px',
        xxl: '40px',
        xxxl: '64px',
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '14px',
        xxl: '20px',
        pill: '999px',
      },
      boxShadow: {
        hairline: 'inset 0 0 0 1px #E4E2DD',
        'soft-raised': '0 1px 2px rgba(18,21,26,.04), 0 4px 10px rgba(18,21,26,.04)',
        floating: '0 20px 48px -8px rgba(18,21,26,.14), 0 6px 16px -4px rgba(18,21,26,.08)',
        'dark-band-raised': 'inset 0 1px 0 rgba(255,255,255,.06)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'var(--font-noto-devanagari)', 'system-ui', 'sans-serif'],
        devanagari: ['var(--font-noto-devanagari)', 'var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '600' }],
        'title-lg': ['32px', { lineHeight: '1.15', letterSpacing: '-0.01em', fontWeight: '600' }],
        'title-md': ['24px', { lineHeight: '1.2', fontWeight: '600' }],
        'title-sm': ['18px', { lineHeight: '1.25', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['13px', { lineHeight: '1.45', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
        button: ['14px', { lineHeight: '1.0', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};

export default config;
