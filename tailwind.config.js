import tailwindcssAnimate from 'tailwindcss-animate';

export default {
  darkMode: 'class',
  content: [
  './app/**/*.{js,ts,jsx,tsx}',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: 'var(--c-canvas)',
        surface: {
          DEFAULT: 'var(--c-surface)',
          2: 'var(--c-surface-2)',
          3: 'var(--c-surface-3)',
        },
        line: {
          DEFAULT: 'var(--c-border)',
          strong: 'var(--c-border-strong)',
        },
        ink: {
          DEFAULT: 'var(--c-text)',
          muted: 'var(--c-text-muted)',
          subtle: 'var(--c-text-subtle)',
          inverse: 'var(--c-text-inverse)',
          control: 'var(--c-control-text)',
        },
        primary: {
          DEFAULT: 'var(--c-primary)',
          hover: 'var(--c-primary-hover)',
          soft: 'var(--c-primary-soft)',
          text: 'var(--c-primary-text)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        success: {
          DEFAULT: 'var(--c-success)',
          soft: 'var(--c-success-soft)',
        },
        warning: {
          DEFAULT: 'var(--c-warning)',
          soft: 'var(--c-warning-soft)',
        },
        danger: {
          DEFAULT: 'var(--c-danger)',
          soft: 'var(--c-danger-soft)',
        },
        info: {
          DEFAULT: 'var(--c-info)',
          soft: 'var(--c-info-soft)',
        },
        neutralsoft: 'var(--c-neutral-soft)',
        rail: {
          DEFAULT: 'var(--c-rail)',
          hover: 'var(--c-rail-hover)',
          text: 'var(--c-rail-text)',
        },
        focusring: 'var(--c-focus)',
        disabled: {
          DEFAULT: 'var(--c-disabled-surface)',
          text: 'var(--c-disabled-text)',
        },
        numeric: {
          negative: 'var(--c-numeric-negative)',
          positive: 'var(--c-numeric-positive)',
        },

        /* shadcn/ui semantic tokens — map to the shadcn compatibility layer in index.css */
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
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display: ['1.75rem', { lineHeight: '2.125rem', letterSpacing: '-0.02em', fontWeight: '600' }],
        h1: ['1.3125rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em', fontWeight: '600' }],
        h2: ['1.0625rem', { lineHeight: '1.5rem', letterSpacing: '-0.01em', fontWeight: '600' }],
        h3: ['0.9375rem', { lineHeight: '1.375rem', fontWeight: '600' }],
        h4: ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        body: ['0.8125rem', { lineHeight: '1.25rem' }],
        small: ['0.75rem', { lineHeight: '1.125rem' }],
        caption: ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        control: '6px',
        surface: '10px',
      },
      boxShadow: {
        pop: 'var(--shadow-pop)',
        overlay: 'var(--shadow-overlay)',
      },
      transitionTimingFunction: {
        exit: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
      transitionDuration: {
        // Named motion tokens so components don't use ambiguous arbitrary values.
        instant: '100ms',
        fast: '120ms',
        moderate: '150ms',
        slow: '200ms',
      },
      keyframes: {
        'overlay-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'drawer-in': {
          from: { transform: 'translateX(16px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'modal-in': {
          from: { transform: 'scale(0.97)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'pop-in': {
          from: { transform: 'translateY(-4px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { opacity: '0.55' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.55' },
        },
        /* shadcn: used by Accordion, Collapsible, etc. */
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'overlay-in': 'overlay-in 180ms cubic-bezier(0.23, 1, 0.32, 1)',
        'drawer-in': 'drawer-in 220ms cubic-bezier(0.23, 1, 0.32, 1)',
        'modal-in': 'modal-in 200ms cubic-bezier(0.23, 1, 0.32, 1)',
        'pop-in': 'pop-in 160ms cubic-bezier(0.23, 1, 0.32, 1)',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
