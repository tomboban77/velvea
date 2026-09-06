import { Bodoni_Moda, Jost } from "next/font/google";

// Display: a high-contrast Didone that echoes the VELVÉA wordmark's lettering.
export const display = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

// Sans: refined geometric grotesque for UI and body — quiet, modern, legible.
export const sans = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jost",
  weight: ["300", "400", "500", "600"],
});

export const fontVars = `${display.variable} ${sans.variable}`;
