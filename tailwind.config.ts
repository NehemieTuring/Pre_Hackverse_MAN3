import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        eisenhower: {
          q1: '#f87171', // Q1 - Urgent & Important
          q2: '#60a5fa', // Q2 - Non-Urgent & Important
          q3: '#fb923c', // Q3 - Urgent & Non-Important
          q4: '#9ca3af', // Q4 - Ni/Ni
        }
      }
    },
  },
  plugins: [],
};
export default config;
