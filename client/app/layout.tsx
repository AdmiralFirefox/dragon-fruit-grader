import type { Metadata, Viewport } from "next";
import { QueryProvider } from "@/providers/QueryProvider";
import { koho_bold, monserrat_medium, monserrat_bold } from "./fonts";
import Navbar from "./components/Navbar";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/styles/globals.scss";

const APP_NAME = "Dragon Fruit Classifier";
const APP_DEFAULT_TITLE = "Dragon Fruit Classifier";
const APP_TITLE_TEMPLATE = "%s - Dragon Fruit Classifier";
const APP_DESCRIPTION =
  "Classify dragon fruits into different classes and know what products you can make with each classes.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#db537c",
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
