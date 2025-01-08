import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
    content: ['./src/**/*.{html,js,svelte,ts,md}'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        p: {
                            fontSize: {
                                base: '1rem',
                                lg: '1.175rem'
                            },
                        },
                    },
                },
                invert: {
                    css: {
                        '--tw-prose-headings': 'rgb(52 211 153)', // emerald-400
                        p: {
                            fontSize: {
                                base: '1rem',
                                lg: '1.175rem'
                            },
                        },
                    }
                }
            },
        }
    },
    plugins: [typography]
} satisfies Config;
