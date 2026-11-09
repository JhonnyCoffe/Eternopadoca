const FALLBACK = "/placeholder-food.svg";

/** URL de imagem segura: trata vazio, "N/A" e protocolos inválidos. */
export function productImage(url?: string | null): string {
  const value = (url ?? "").trim();
  if (!value) return FALLBACK;
  if (/^(n\/?a|na|null|undefined|-|sem imagem)$/i.test(value)) return FALLBACK;
  if (!/^(https?:\/\/|\/)/i.test(value)) return FALLBACK;
  return value;
}
