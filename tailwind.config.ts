import type { Config } from "tailwindcss"
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", ...fontFamily.sans],
      },
      colors: {
        brand: {
          25: "#F7FAFD",
          50: "#F0F5FA",
          100: "#E1EBF5",
          200: "#C7D7EB",
          300: "#A9C3DE",
          400: "#8BAECF",
          500: "#6D99BF",
          600: "#5483A3",
          700: "#426A86",
          800: "#335269",
          900: "#273E4F",
          950: "#1C2D3A",
        },
      },
    },
  },
  plugins: [],
}
export default config
