import type { Metadata } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { koho_bold, monserrat_medium, monserrat_bold } from "./fonts";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.scss";

export const metadata: Metadata = {
  title: "Dragon Fruit Classifier",
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
        <AuthProvider>
          <Navbar />
          <ToastContainer limit={2} />
          <QueryProvider>{children}</QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
