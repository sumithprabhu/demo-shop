import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Header } from "../components/Header";
import { ToastProvider } from "../components/Toasts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo shop",
  description: "A small shop that Intenzo verifies.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <Header />
          <main>{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
