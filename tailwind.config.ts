// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFCC00',
          black: '#000000',
        },
        theme: {
          yellow: {
            from: '#FFCC00',
            to: '#FFA500',
          },
          blue: {
            from: '#60A5FA',
            to: '#2563EB',
          },
          green: {
            from: '#34D399',
            to: '#059669',
          },
          purple: {
            from: '#A855F7',
            to: '#6D28D9',
          },
          dark: {
            from: '#011502',
            to: '#01200F',
          },
          daisy: {
            from: '#EDEDE9',
            to: '#D6CCC2',
          },
          rose: {
            from: '#B5838D',
            to: '#6D6875',
          },
          slate: {
            from: '#5E5B52',
            to: '#3F3D39',
          },
        },
        'forest-brown': '#1A0F0A',
        'tree-brown': '#3B2A20',
        'navy-dark': '#1E3A8A',
        'daisy-yellow': '#FFE135',
        'midnight-teal': '#587B7F',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  safelist: [
    'text-forest-brown',
    'text-tree-brown',
    'text-navy-dark',
    'text-purple-700',
    'border-forest-brown',
    'border-navy-dark',
    'border-daisy-yellow',
    'border-black',
    'border-midnight-teal',
  ],
  plugins: [require('tailwindcss-animate')],
};

export default config;
