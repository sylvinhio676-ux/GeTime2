module.exports = {
    darkMode: ['class'],
    content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx,html}'
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        surface: 'var(--surface)',
        border: 'var(--border)',
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)'
        },
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)'
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)'
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)'
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)'
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)'
        },
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        dark: 'var(--dark)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        'input-background': 'var(--input-background)',
        'switch-background': 'var(--switch-background)',
        chart: {
          '1': 'var(--chart-1)',
          '2': 'var(--chart-2)',
          '3': 'var(--chart-3)',
          '4': 'var(--chart-4)',
          '5': 'var(--chart-5)'
        },
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)'
        },
        'kpi-value': 'var(--kpi-value)',
        'delta-positive': 'var(--delta-positive)',
        'delta-negative': 'var(--delta-negative)',
        'grid-line': 'var(--grid-line)',
        'surface-elevated': 'var(--surface-elevated)',
        'surface-hover': 'var(--surface-hover)',
        'glow-primary': 'var(--glow-primary)',
        'glow-primary-soft': 'var(--glow-primary-soft)',
        success: 'var(--delta-positive)',
        slate: {
          50: 'color-mix(in srgb, var(--muted) 80%, var(--background))',
          100: 'var(--input-background)',
          200: 'var(--border)',
          300: 'color-mix(in srgb, var(--border) 70%, var(--muted-foreground))',
          400: 'color-mix(in srgb, var(--muted-foreground) 70%, var(--foreground))',
          500: 'var(--muted-foreground)',
          600: 'color-mix(in srgb, var(--muted-foreground) 60%, var(--foreground))',
          700: 'color-mix(in srgb, var(--foreground) 80%, var(--muted-foreground))',
          800: 'var(--foreground)',
          900: 'var(--foreground)'
        },
        gray: {
          50: 'color-mix(in srgb, var(--muted) 85%, var(--background))',
          100: 'var(--input-background)',
          200: 'var(--border)',
          300: 'color-mix(in srgb, var(--border) 70%, var(--muted-foreground))',
          400: 'color-mix(in srgb, var(--muted-foreground) 70%, var(--foreground))',
          500: 'var(--muted-foreground)',
          600: 'color-mix(in srgb, var(--muted-foreground) 60%, var(--foreground))',
          700: 'color-mix(in srgb, var(--foreground) 80%, var(--muted-foreground))',
          800: 'var(--foreground)',
          900: 'var(--foreground)'
        },
        blue: {
          50: 'color-mix(in srgb, var(--primary) 10%, var(--background))',
          100: 'color-mix(in srgb, var(--primary) 18%, var(--background))',
          200: 'color-mix(in srgb, var(--primary) 28%, var(--background))',
          300: 'color-mix(in srgb, var(--primary) 40%, var(--background))',
          400: 'color-mix(in srgb, var(--primary) 55%, var(--background))',
          500: 'color-mix(in srgb, var(--primary) 75%, var(--background))',
          600: 'var(--primary)',
          700: 'var(--primary)',
          800: 'color-mix(in srgb, var(--primary) 80%, var(--foreground))',
          900: 'color-mix(in srgb, var(--primary) 70%, var(--foreground))'
        },
        purple: {
          300: 'color-mix(in srgb, var(--secondary) 40%, var(--background))',
          400: 'color-mix(in srgb, var(--secondary) 55%, var(--background))',
          500: 'var(--secondary)',
          600: 'color-mix(in srgb, var(--secondary) 80%, var(--foreground))',
          700: 'color-mix(in srgb, var(--secondary) 70%, var(--foreground))'
        },
        emerald: {
          50: 'color-mix(in srgb, var(--delta-positive) 10%, var(--background))',
          100: 'color-mix(in srgb, var(--delta-positive) 18%, var(--background))',
          400: 'color-mix(in srgb, var(--delta-positive) 70%, var(--background))',
          500: 'var(--delta-positive)',
          600: 'color-mix(in srgb, var(--delta-positive) 80%, var(--foreground))',
          700: 'color-mix(in srgb, var(--delta-positive) 70%, var(--foreground))'
        },
        rose: {
          50: 'color-mix(in srgb, var(--delta-negative) 10%, var(--background))',
          100: 'color-mix(in srgb, var(--delta-negative) 18%, var(--background))',
          400: 'color-mix(in srgb, var(--delta-negative) 70%, var(--background))',
          500: 'var(--delta-negative)',
          600: 'color-mix(in srgb, var(--delta-negative) 80%, var(--foreground))',
          700: 'color-mix(in srgb, var(--delta-negative) 70%, var(--foreground))'
        },
        red: {
          500: 'var(--destructive)',
          600: 'color-mix(in srgb, var(--destructive) 85%, var(--foreground))'
        },
        yellow: {
          500: 'var(--accent)'
        }
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};
