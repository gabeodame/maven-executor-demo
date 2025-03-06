import { type Config } from "tailwindcss";
import animate from "tailwindcss-animate"; // ✅ Import plugin

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [animate], // ✅ Add here
};

export default config;
