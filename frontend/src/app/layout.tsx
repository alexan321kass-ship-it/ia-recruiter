import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IA Recruiter - Reclutamiento Inteligente",
  description: "Plataforma de reclutamiento impulsada por IA para una selección precisa de candidatos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full antialiased">
      <body className={`${inter.className} min-h-full flex flex-col bg-surface-900 bg-grid text-foreground`}>
        <Navbar />
        <main className="flex-1 flex flex-col relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
