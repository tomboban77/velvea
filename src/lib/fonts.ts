import { Cormorant_Garamond, Cinzel, Hanken_Grotesk } from "next/font/google";

// Display: a Garamond-family serif with tall ascenders and a true italic.
export const display = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

// Caps: Roman inscriptional capitals that echo the VELVEA wordmark. Labels, nav, buttons.
export const caps = Cinzel({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cinzel",
  weight: ["400", "500", "600"],
});

// Text: a quiet grotesque for body copy and forms.
export const sans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
  weight: ["300", "400", "500", "600"],
});

export const fontVars = `${display.variable} ${caps.variable} ${sans.variable}`;
