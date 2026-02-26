/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.tsx",
        "./components/**/*.{ts,tsx}",
        "./contexts/**/*.{ts,tsx}",
        "./hooks/**/*.{ts,tsx}",
        "./utils/**/*.{ts,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#0B3D2E',
                accent: '#C8A762',
            },
            fontFamily: {
                tajawal: ['Tajawal', 'sans-serif'],
            },
        },
    },
    plugins: [],
};
