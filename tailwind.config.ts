// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
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
          yellow: { from: '#FFCC00', to: '#FFA500' },
          blue: { from: '#60A5FA', to: '#2563EB' },
          green: { from: '#34D399', to: '#059669' },
          purple: { from: '#A855F7', to: '#6D28D9' },
          dark: { from: '#011502', to: '#01200F' },
          daisy: { from: '#EDEDE9', to: '#D6CCC2' },
          rose: { from: '#B5838D', to: '#6D6875' },
          slate: { from: '#5E5B52', to: '#3F3D39' },
        },
        'forest-brown': '#1A0F0A', // Darker brown
        'tree-brown': '#3B2A20', // Darker nav brown
        'navy-dark': '#1E3A8A',
        'daisy-yellow': '#FFE135', // More vibrant yellow
        'midnight-teal': '#587B7F',
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
  plugins: [],
};

export default config;
