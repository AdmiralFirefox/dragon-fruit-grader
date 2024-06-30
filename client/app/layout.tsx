import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { koho_bold, monserrat_medium, monserrat_bold } from "./fonts";
import Navbar from "./components/Navbar";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Dragon Fruit Grader",
  description:
    "Grade dragon fruits into different classes and know what products you can make with each classes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${koho_bold.variable} ${monserrat_medium.variable} ${monserrat_bold.variable}`}
    >
      <body>
        <Navbar />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
