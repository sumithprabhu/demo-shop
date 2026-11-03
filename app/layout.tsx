import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import type { ReactNode } from "react";

import { Header } from "../components/Header";
import { ToastProvider } from "../components/Toasts";
import "./globals.css";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display" });
const text = Figtree({ subsets: ["latin"], variable: "--font-text" });

export const metadata: Metadata = {
  title: "Kiln & Canvas",
  description: "Small-batch goods: the demo shop Intenzo verifies.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`}>
      <body>
        <ToastProvider>
          <Header />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
