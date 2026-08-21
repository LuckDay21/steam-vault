import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Steam Vault — Multi-Account Steam Library & Credential Manager",
  description: "Unified Steam game library and 1-click credential switcher across multiple Steam accounts.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="min-h-full flex flex-col bg-[#0b0f17] text-slate-100 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        {children}
      </body>
    </html>
  );
}
