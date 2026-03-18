import type { Metadata } from "next";
import { Manrope } from "next/font/google";

import "@/app/globals.css";
import { DemoStateProvider } from "@/src/lib/demo-state";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Saga Demo",
  description:
    "Saga is fandom-native social and event infrastructure for turning ideas into staffed, funded, attended experiences."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} bg-app-bg text-app-text antialiased`}>
        <DemoStateProvider>{children}</DemoStateProvider>
      </body>
    </html>
  );
}
