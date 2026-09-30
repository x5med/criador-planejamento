import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import { AppPreloader } from "@/components/AppPreloader";

import "./globals.css";
import "./journey.css";
import "./results.css";
import "./agenda.css";
import "./preloader.css";

const sora = Sora({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "X5 Planejamento | Estratégia com IA",
  description:
    "Construa um planejamento estratégico mensurável e executável com uma entrevista guiada por IA.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E7EBE4",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={sora.variable}>
        <AppPreloader>{children}</AppPreloader>
      </body>
    </html>
  );
}
