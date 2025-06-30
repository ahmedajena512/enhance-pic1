/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{ts,tsx}',
		'./components/**/*.{ts,tsx}',
		'./app/**/*.{ts,tsx}',
		'./src/**/*.{ts,tsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				'geist': ['Geist', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#4f46e5',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: '#3b82f6',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				accent: {
					DEFAULT: '#8b5cf6',
					foreground: 'hsl(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				glass: {
					'primary': 'rgba(255, 255, 255, 0.05)',
					'secondary': 'rgba(255, 255, 255, 0.1)',
					'border': 'rgba(255, 255, 255, 0.1)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'data-stream': {
					'0%': { strokeDashoffset: '20' },
					'100%': { strokeDashoffset: '0' }
				},
				'schema-pulse': {
					'0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
					'50%': { transform: 'scale(1.02)', opacity: '1' }
				},
				'shimmer': {
					to: { transform: 'translate(-50%, -50%) rotate(360deg)' }
				},
				'breathe': {
					'0%, 100%': { transform: 'translate(-50%, -50%) scale(1)' },
					'50%': { transform: 'translate(-50%, -50%) scale(1.20)' }
				},
				'fadeInUp': {
					'0%': { opacity: '0', transform: 'translateY(30px)', filter: 'blur(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0px)' }
				},
				'slideInLeft': {
					'0%': { opacity: '0', transform: 'translateX(-30px)', filter: 'blur(5px)' },
					'100%': { opacity: '1', transform: 'translateX(0)', filter: 'blur(0px)' }
				},
				'slideInRight': {
					'0%': { opacity: '0', transform: 'translateX(30px)', filter: 'blur(5px)' },
					'100%': { opacity: '1', transform: 'translateX(0)', filter: 'blur(0px)' }
				},
				'typewriter': {
					to: { left: '100%' }
				},
				'gradient-shift': {
					'0%, 100%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'float': 'float 6s ease-in-out infinite',
				'data-stream': 'data-stream 3s linear infinite',
				'schema-pulse': 'schema-pulse 4s ease-in-out infinite',
				'shimmer': 'shimmer 4s linear infinite',
				'breathe': 'breathe 4.5s linear infinite',
				'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
				'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
				'slide-in-right': 'slideInRight 0.8s ease-out forwards',
				'typewriter': 'typewriter 2s steps(40) infinite',
				'gradient-shift': 'gradient-shift 3s ease-in-out infinite'
			},
			backdropBlur: {
				'3xl': '64px',
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			}
		},
	},
	plugins: [require('tailwindcss-animate')],
}