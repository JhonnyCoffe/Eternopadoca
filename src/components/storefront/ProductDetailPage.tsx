"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Minus,
  Plus,
  ShoppingBag,
  X,
  Check,
  Loader2,
} from "lucide-react";
import type { Product, ProductVariant } from "@/lib/types";
import { brl } from "@/lib/format";
import { productImage } from "@/lib/image";
import { TextAnimate } from "@/components/ui/text-animate";

const CART_KEY = "brasa_cart_v1";

type SelectedVariant = {
  size?: string;
  flavor?: string;
};

interface ProductDetailPageProps {
  product: Product;
}

export function ProductDetailPage({ product }: ProductDetailPageProps) {
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedFlavor, setSelectedFlavor] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const hasVariants = Boolean(
    product.variants?.length && product.variants.some((v) => v.active !== false)
  );

  const activeVariants = useMemo(
    () =>
      product.variants?.filter((v) => v.active !== false) ?? [],
    [product.variants]
  );

  // Variação efetivamente selecionada (se houver variantes, exige tamanho e sabor)
  const selectedVariant = useMemo(() => {
    if (!hasVariants) return undefined;
    const v = activeVariants.find(
      (a) => a.size === selectedSize && a.flavor === selectedFlavor
    );
    return v;
  }, [activeVariants, selectedSize, selectedFlavor, hasVariants]);

  const unitPrice = selectedVariant?.price ?? product.price;
  const total = unitPrice * qty;

  // Pode adicionar: se tem variantes, exige tamanho+sabor escolhidos
  const canAdd = !hasVariants || Boolean(selectedVariant);

  const cartKey = useMemo(() => {
    const parts = [product.id];
    if (selectedSize) parts.push(`size:${selectedSize}`);
    if (selectedFlavor) parts.push(`flavor:${selectedFlavor}`);
    return parts.join("::");
  }, [product.id, selectedSize, selectedFlavor]);

  const cartQtyInCart = useMemo(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return 0;
      const cart = JSON.parse(raw) as Record<string, number>;
      return cart[cartKey] ?? 0;
    } catch {
      return 0;
    }
  }, [cartKey]);

  const addToCart = useCallback(() => {
    if (!canAdd) return;
    setAdding(true);
    try {
      const raw = localStorage.getItem(CART_KEY);
      const cart = raw ? (JSON.parse(raw) as Record<string, number>) : {};
      cart[cartKey] = (cart[cartKey] ?? 0) + 1;
      localStorage.setItem(CART_KEY, JSON.stringify(cart));

      // Notifica StoreFront montado em outra aba/rota via evento storage
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: CART_KEY,
          newValue: JSON.stringify(cart),
        })
      );

      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  }, [cartKey, canAdd]);

  const inc = () => setQty((q) => q + 1);
  const dec = () => setQty((q) => (q > 1 ? q - 1 : 1));

  const selectSize = (size: string) => {
    setSelectedSize(size);
    // mantém sabor compatível se ainda existir
  };
  const selectFlavor = (flavor: string) => {
    setSelectedFlavor(flavor);
  };

  const isSizeSelected = (size: string) => selectedSize === size;
  const isFlavorSelected = (flavor: string) => selectedFlavor === flavor;

  const variantDisabled = (v: ProductVariant) => v.active === false;

  return (
    <section className="min-h-screen flex flex-col text-zinc-100 bg-[#121215]">
      {/* VOLTAR */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#121215]/80 backdrop-blur px-4 sm:px-6">
        <div className="mx-auto max-w-6xl h-16 flex items-center justify-between px-4 sm:px-6">
          <button
            onClick={() => history.back()}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 hover:bg-white/10 transition"
            aria-label="Voltar"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-bold text-zinc-900">
            <ShoppingBag size={16} />
            <span>Carrinho</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 flex-grow">
        <article className="rounded-3xl border border-white/[0.1] bg-white/[0.03] overflow-hidden shadow-xl backdrop-blur-sm">
          {/* TERÇO SUPERIOR: FOTO */}
          <div className="relative h-[320px] md:h-[420px] bg-white/[0.05] overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={productImage(product.imageUrl)}
                alt={product.name}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-white/[0.05]">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white backdrop-blur">
                {product.badge}
              </span>
            )}
          </div>

          {/* CENTRO: NOME + DESCRIÇÃO */}
          <div className="p-6 md:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <TextAnimate
                text={product.name}
                type="fadeInUp"
                className="text-2xl sm:text-3xl font-black tracking-tight text-white"
                delay={0.05}
              />
              <span className="text-xl font-black text-white">
                {brl(unitPrice)}
              </span>
            </div>

            <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
              {product.description || "Produto preparado com ingredientes selecionados e muito sabor para o seu dia."}
            </p>

            {/* SELETOR DE VARIAÇÃO (tamanho / sabor) */}
            {hasVariants && (
              <div className="mt-2 space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500">
                  Escolha as opções
                </h3>

                {/* Tamanhos */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-400">Tamanho</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeVariants.map((v) => {
                      const sizes = [...new Set(activeVariants.map((a) => a.size).filter(Boolean))];
                      return (
                        sizes.includes(v.size) && (
                          <button
                            key={`size-${v.size}`}
                            onClick={() => selectSize(String(v.size ?? ""))}
                            disabled={variantDisabled(v)}
                            className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                              isSizeSelected(String(v.size ?? ""))
                                ? "border-[var(--brand)] bg-[var(--brand)]/20 text-white"
                                : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/15 hover:text-white disabled:opacity-40"
                            }`}
                          >
                            {v.size}
                          </button>
                        )
                      );
                    })}
                  </div>
                </div>

                {/* Sabores */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-zinc-400">Sabor</h4>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set(activeVariants.map((a) => a.flavor).filter(Boolean))].map(
                      (flavor) => (
                        <button
                          key={`flavor-${flavor}`}
                          onClick={() => selectFlavor(String(flavor ?? ""))}
                          disabled={!flavor}
                          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                            isFlavorSelected(flavor ?? "")
                              ? "border-[var(--brand)] bg-[var(--brand)]/20 text-white"
                              : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/15 hover:text-white disabled:opacity-40"
                          }`}
                        >
                          {flavor}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {!canAdd && (
                  <p className="text-xs text-rose-400 font-semibold">
                    Selecione o tamanho e o sabor para adicionar.
                  </p>
                )}
              </div>
            )}

            {/* TERÇO INFERIOR: QUANTIDADE + TOTAL */}
            <div className="mt-6 pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2">
                <button
                  onClick={dec}
                  disabled={qty <= 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-zinc-200 transition disabled:opacity-40"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={16} />
                </button>
                <span className="w-6 text-center text-lg font-black text-white">
                  {qty}
                </span>
                <button
                  onClick={inc}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand)] text-sm font-bold text-white shadow-md shadow-black/20 transition hover:brightness-110 active:scale-95"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="text-right">
                <span className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Total
                </span>
                <span className="text-2xl font-black text-white">
                  {brl(total)}
                </span>
              </div>

              <button
                onClick={addToCart}
                disabled={!canAdd || adding}
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : added ? (
                  <>
                    <Check size={16} />
                    Adicionado
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    Adicionar ao carrinho
                  </>
                )}
              </button>
            </div>
          </div>
        </article>
      </main>
    </section>
  );
}
