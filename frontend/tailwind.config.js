/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2a9d8f", // teal
          light: "#e9f5f3",
          dark: "#1e7168",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#e76f51", // coral
          light: "#f8d5cb",
          dark: "#c5553d",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "#e63946", // red
          foreground: "#ffffff",
        },
        accent: {
          DEFAULT: "#f4a261", // orange
          foreground: "#1f2937",
        },
        background: {
          DEFAULT: "#f8f9fa",
          dark: "#264653",
        },
        neutral: {
          DEFAULT: "#6d6875",
          light: "#f0efef",
          dark: "#4a4751",
        },
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 25px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};
