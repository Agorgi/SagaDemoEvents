import type { Metadata } from "next";

import "@/app/globals.css";
import { AppStateProvider } from "@/src/lib/app-state";
import { DemoStateProvider } from "@/src/lib/demo-state";

export const metadata: Metadata = {
  title: "Saga Demo",
  description:
    "Saga is a fandom social app where events, people, and identity shape what you discover next."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-app-bg text-app-text antialiased">
        <DemoStateProvider>
          <AppStateProvider>{children}</AppStateProvider>
        </DemoStateProvider>
      </body>
    </html>
  );
}
