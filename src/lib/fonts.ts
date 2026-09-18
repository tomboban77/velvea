import { Fraunces, Hanken_Grotesk } from "next/font/google";

// Display: a warm, slightly old-style serif with real presence at headline sizes.
export const display = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

// Text: a quiet grotesque for body copy, navigation, labels and forms.
export const sans = Hanken_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700"],
});

export const fontVars = `${display.variable} ${sans.variable}`;
