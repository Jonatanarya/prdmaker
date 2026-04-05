import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRD Maker",
  description: "AI-assisted PRD generation (configurable LLM)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        {children}
      </body>
    </html>
  );
}
