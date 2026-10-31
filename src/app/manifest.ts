import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Brasa & Burger — Cardápio digital",
    short_name: "Brasa & Burger",
    description:
      "Peça seus hambúrgueres artesanais favoritos direto pelo cardápio digital. Entrega rápida e retirada na loja.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08080a",
    theme_color: "#e11d48",
    lang: "pt-BR",
    dir: "ltr",
    categories: ["food", "shopping"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
