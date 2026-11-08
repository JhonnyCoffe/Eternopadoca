import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { productImage } from "@/lib/image";

type Props = {
  product: Product;
  qty: number;
  onAdd: (p: Product) => void;
  onDec: (id: string) => void;
};

function ProductCard({ product, qty, onAdd, onDec }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-white/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.06)] backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/40 hover:border-white/[0.15]">
      <Link href={`/produto/${product.id}`} className="block h-full">
        <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.07] max-h-[240px]">
        <Image
          src={productImage(product.imageUrl)}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-100 shadow-sm backdrop-blur">
            {product.badge}
          </span>
        )}
        {product.trackStock && (product.stock ?? 0) <= 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500/80 px-2.5 py-1 text-[10px] font-black text-white shadow-sm backdrop-blur">
            Esgotado
          </span>
        )}
        {product.trackStock && (product.stock ?? 0) > 0 && (product.stock ?? 0) <= (product.lowStockAt ?? 5) && (
          <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-black text-amber-900 shadow-sm backdrop-blur">
            Estoque baixo
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-bold leading-tight text-white">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-[13px] leading-relaxed text-zinc-400">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-[15px] font-extrabold text-white">
            {brl(product.price)}
          </span>
          {qty === 0 ? (
            product.trackStock && (product.stock ?? 0) <= 0 ? (
              <button
                disabled
                className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3.5 py-2 text-xs font-bold text-zinc-500 cursor-not-allowed"
              >
                Esgotado
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(product);
                }}
                className="flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-black/20 transition hover:brightness-110 active:scale-95"
              >
                + Adicionar
              </button>
            )
          ) : (
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDec(product.id);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-zinc-200 shadow-sm transition hover:text-white"
                aria-label="Remover um"
              >
                −
              </button>
              <span className="w-5 text-center text-xs font-black">{qty}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(product);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white shadow-sm transition hover:brightness-110"
                aria-label="Adicionar um"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
      </Link>
    </article>
  );
}

export default memo(ProductCard);
