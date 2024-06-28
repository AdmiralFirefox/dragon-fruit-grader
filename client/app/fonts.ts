import { KoHo, Montserrat } from "next/font/google";

export const koho_bold = KoHo({
  subsets: ["latin"],
  variable: "--koho-bold",
  weight: "700",
});

export const monserrat_medium = Montserrat({
  subsets: ["latin"],
  variable: "--monserrat-medium",
  weight: "500",
});

export const monserrat_bold = Montserrat({
  subsets: ["latin"],
  variable: "--monserrat-bold",
  weight: "700",
});
