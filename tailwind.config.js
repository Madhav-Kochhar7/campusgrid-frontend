/**
 * CampusGrid Design System Configuration
 * =====================================
 * Defines the persistent visual tokens (colors, typography, spacing) 
 * for the Tailwind CSS framework.
 * 
 * Theme Identity:
 * - Base: Deep Zinc/Neutral dark mode (#09090B).
 * - Accents: Minimalistic monochrome (white/zinc).
 * - Semantic: Grayscale status mapping.
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Layout Backgrounds
        bg: {
          page: '#F8FAFC', // slate-50
          card: '#FFFFFF',
          hover: '#F1F5F9', // slate-100
          sidebar: '#FFFFFF',
          input: '#FFFFFF',
        },
        // Borders and Dividers
        border: {
          DEFAULT: '#E2E8F0', // slate-200
          accent: '#CBD5E1', // slate-300
        },
        'border-DEFAULT': '#E2E8F0',
        'border-accent': '#CBD5E1',
        // Primary Action Color
        primary: {
          DEFAULT: '#3B82F6', // Modern Vibrant Blue
          orange: '#FF7F50', // Soft Coral
          red: '#EF4444', // Modern Red
        },
        // Semantic Accents
        accent: {
          cyan: '#E4E4E7',
          mint: '#E4E4E7',
          amber: '#E4E4E7',
          red: '#E4E4E7',
          purple: '#E4E4E7',
          pink: '#E4E4E7',
        },
        // Typography Tokens
        text: {
          primary: '#0F172A', // slate-900
          secondary: '#64748B', // slate-500
          muted: '#94A3B8', // slate-400
          mono: '#334155', // slate-700
        },
        /**
         * Semantic Status Mapping
         * Logistics Dashboard mapping
         */
        status: {
          queuedBg: '#F1F5F9', // slate-100
          queuedText: '#64748B', // slate-500
          dispatchedBg: '#DBEAFE', // blue-100
          dispatchedText: '#1D4ED8', // blue-700
          runningBg: '#FFEDD5', // orange-100
          runningText: '#C2410C', // orange-700
          doneBg: '#D1FAE5', // green-100
          doneText: '#047857', // green-700
          failedBg: '#FEE2E2', // red-100
          failedText: '#B91C1C', // red-700
          expiredBg: '#FEE2E2', // red-100
          expiredText: '#B91C1C', // red-700
        }
      },
      fontFamily: {
        // System fonts for a minimal aesthetic
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
    },
  },
  plugins: [],
}
