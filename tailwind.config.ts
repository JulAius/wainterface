
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C7E',
          light: '#34D374',
          lighter: '#dcf8c6',
          glass: 'rgba(37, 211, 102, 0.15)'
        },
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'neon': '0 0 5px theme(colors.whatsapp.DEFAULT), 0 0 20px theme(colors.whatsapp.DEFAULT/30)',
				'glass': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
				'bubble': '0 2px 8px rgba(0, 0, 0, 0.3)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' },
				},
				'fade-in': {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
				'fade-out': {
					from: { opacity: '1' },
					to: { opacity: '0' },
				},
				'scale-in': {
					from: { transform: 'scale(0.95)', opacity: '0' },
					to: { transform: 'scale(1)', opacity: '1' },
				},
				'slide-in-right': {
					from: { transform: 'translateX(20px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-in-left': {
					from: { transform: 'translateX(-20px)', opacity: '0' },
					to: { transform: 'translateX(0)', opacity: '1' },
				},
				'slide-in-bottom': {
					from: { transform: 'translateY(20px)', opacity: '0' },
					to: { transform: 'translateY(0)', opacity: '1' },
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' },
				},
				'floating': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 5px rgba(37, 211, 102, 0.5), 0 0 15px rgba(37, 211, 102, 0.3)' },
					'50%': { boxShadow: '0 0 15px rgba(37, 211, 102, 0.8), 0 0 30px rgba(37, 211, 102, 0.5)' },
				},
				'typing': {
					'0%': { width: '0%' },
					'100%': { width: '100%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.2s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'slide-in-right': 'slide-in-right 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.3s ease-out',
				'slide-in-bottom': 'slide-in-bottom 0.3s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'floating': 'floating 3s ease-in-out infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'typing': 'typing 2s steps(40, end)'
			},
			backdropBlur: {
				xs: '2px',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
				'noise': "url('data:image/png;base64,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')",
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
