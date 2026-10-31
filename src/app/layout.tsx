import type { Metadata, Viewport } from "next";
import PwaRegister from "@/components/PwaRegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brasa & Burger — Cardápio digital",
  description:
    "Peça seus hambúrgueres artesanais favoritos direto pelo cardápio digital. Entrega rápida e retirada na loja.",
  applicationName: "Brasa & Burger",
  appleWebApp: {
    capable: true,
    title: "Brasa & Burger",
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
    <html lang="pt-BR" data-scroll-behavior="smooth" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
