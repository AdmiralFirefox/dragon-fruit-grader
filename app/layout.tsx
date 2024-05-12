import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import "./globals.scss";

export const metadata: Metadata = {
  title: "Dragon Fruit Grader",
  description: "A dragon fruit grader application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
