/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: ['src/pages/**/*.tsx', 'src/components/**/*.tsx'],
  theme: {
    screens: {
      xs: '500px',
      ...defaultTheme.screens
    },
    extend: {
      fontFamily: {
        'twitter-chirp': ['TwitterChirp', 'sans-serif'],
        'twitter-chirp-extended': ['TwitterChirpExtendedHeavy', 'sans-serif'],
        'display': ['Nunito', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'publication': [
          '"Source Serif 4"',
          'Georgia',
          'Cambria',
          'Times New Roman',
          'serif'
        ]
      },
      // prettier-ignore
      colors: {
        'main-primary': 'rgb(var(--main-primary) / <alpha-value>)',
        'main-secondary': 'rgb(var(--main-secondary) / <alpha-value>)',
        'main-background': 'rgb(var(--main-background) / <alpha-value>)',
        'main-search-background': 'rgb(var(--main-search-background) / <alpha-value>)',
        'main-sidebar-background': 'rgb(var(--main-sidebar-background) / <alpha-value>)',
        'main-accent': 'rgb(var(--main-accent) / <alpha-value>)',
        'accent-yellow': 'rgb(var(--accent-yellow) / <alpha-value>)',
        'accent-blue': 'rgb(var(--accent-blue) / <alpha-value>)',
        'accent-pink': 'rgb(var(--accent-pink) / <alpha-value>)',
        'accent-purple': 'rgb(var(--accent-purple) / <alpha-value>)',
        'accent-orange': 'rgb(var(--accent-orange) / <alpha-value>)',
        'accent-green': 'rgb(var(--accent-green) / <alpha-value>)',
        'accent-red': '#F4212E',
        'dark-primary': '#E8F0F8',
        'dark-secondary': '#7A8FA3',
        'dark-background': 'rgb(var(--dark-background) / <alpha-value>)',
        'dark-surface': '#122033',
        'dark-elevated': '#1A2D44',
        'light-primary': '#0D1B2A',
        'light-secondary': '#3D5A78',
        'dark-border': '#1E3251',
        'light-border': '#C4D6E8',
        'dark-line-reply': '#333639',
        'light-line-reply': '#CFD9DE',
        'twitter-icon': '#D6D9DB',
        'image-preview-hover': '#272C30',
        // shadcn/ui design tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Nordic Platform Colors
        earth: '#3D5A78',
        sage: '#2E8B6E',
        sky: '#A8CDD8',
        terracotta: '#5BB8D4',
        cream: '#F0F5FA',
        charcoal: '#0D1B2A',
        hope: '#5BB8D4',
        action: '#3B82C4',
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px #111827',
        'brutal-lg': '6px 6px 0px #111827',
        'brutal-dark': '4px 4px 0px rgba(255,255,255,0.12)',
        'brutal-dark-lg': '6px 6px 0px rgba(255,255,255,0.12)',
      }
    }
  },
  plugins: [
    ({ addVariant }) => {
      addVariant('inner', '& > *');
    }
  ]
};
