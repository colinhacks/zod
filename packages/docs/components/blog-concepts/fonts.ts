import { Instrument_Serif, JetBrains_Mono } from "next/font/google";

export const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-concept-serif",
});

export const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-concept-mono",
});
