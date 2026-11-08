import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import CookieBanner from "@/components/ui/cookie-banner";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Padoca Eterno — Cardápio digital",
  description:
    "Padaria artesanal com o sabor de sempre e a qualidade que você merece. Peça direto pelo cardápio digital.",
  applicationName: "Padoca Eterno",
  appleWebApp: {
    capable: true,
    title: "Padoca Eterno",
    statusBarStyle: "black-translucent",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" data-scroll-behavior="smooth" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRegister />
        <CookieBanner />
        <footer className="mt-auto border-t border-white/[0.08] bg-[#0a0a0a]/60 py-8 px-6 text-center text-xs text-zinc-500">
          <p>
            Padoca Eterno · CNPJ 00.000.000/0001-00 ·{" "}
            <a href="https://www.google.com/maps/search/?api=1&query=Av.+Paulista,+1000,+Sao+Paulo/SP" className="text-zinc-400 underline underline-offset-2 hover:text-white" target="_blank" rel="noopener noreferrer">
              Av. Paulista, 1000 — Bela Vista, São Paulo/SP
            </a>
          </p>
          <p>
            contato@padocaeterno.com.br · (11) 99999-9999 ·
            <Link href="/privacidade" className="text-zinc-400 underline underline-offset-2 hover:text-white">
              Privacidade
            </Link>
            ·
            <Link href="/termos-de-uso" className="text-zinc-400 underline underline-offset-2 hover:text-white">
              Termos
            </Link>
          </p>
          <p className="mt-1 text-[10px] text-zinc-600">
            Substitua CNPJ, endereço e contato pelos dados reais da sua loja
            antes de publicar.
          </p>
        </footer>
      </body>
    </html>
  );
}
