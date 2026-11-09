"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart,
  AlertTriangle,
  Plus,
  Check,
  RefreshCw,
} from "lucide-react";
import type { Product } from "@/lib/types";
import { restockProduct } from "@/app/admin/actions";

type Props = {
  products: Product[];
};

export default function ListaCompras({ products }: Props) {
  const router = useRouter();
  const [restocking, setRestocking] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const lowStockProducts = products.filter(
    (p) => p.trackStock && (p.stock ?? 0) <= (p.lowStockAt ?? 5),
  );

  const handleQuantityChange = (id: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num > 0) {
      setQuantities((prev) => ({ ...prev, [id]: num }));
    }
  };

  const handleRestock = async (product: Product) => {
    const qty = quantities[product.id] || 1;
    setError(null);
    setRestocking((prev) => new Set([...prev, product.id]));
    try {
      const result = await restockProduct(product.id, qty);
      if (!result.ok) {
        setError(result.error ?? "Não foi possível repor o estoque.");
        return;
      }
      setQuantities((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
      router.refresh();
    } catch {
      setError("Falha ao repor o estoque. Tente novamente.");
    } finally {
      setRestocking((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  if (lowStockProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 text-center">
        <ShoppingCart size={32} className="mx-auto mb-3 text-emerald-400" />
        <h3 className="font-black text-white">Estoque em dia</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Nenhum item abaixo do estoque mínimo.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6">
      <div className="mb-4 flex items-center gap-2">
        <AlertTriangle size={20} className="text-rose-400" />
        <h3 className="font-black text-rose-300">
          {lowStockProducts.length} item(ns) com estoque baixo
        </h3>
      </div>

      {error && (
        <p className="mb-3 rounded-lg bg-red-500/15 px-3 py-2 text-xs font-bold text-red-300">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {lowStockProducts.map((product) => (
          <div
            key={product.id}
            className="flex flex-wrap items-center gap-3 border-b border-white/10 py-2 last:border-0"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {product.name}
              </p>
              <p className="text-xs font-semibold text-rose-300">
                {product.name} item com estoque baixo
              </p>
              <p className="text-xs text-zinc-500">
                Estoque:{" "}
                <span className="font-bold text-rose-400">
                  {product.stock ?? 0}
                </span>{" "}
                | Mínimo: {product.lowStockAt ?? 5}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor={`qty-${product.id}`}
                className="text-xs font-bold text-zinc-300"
              >
                Selecione a quantidade:
              </label>
              <input
                id={`qty-${product.id}`}
                type="number"
                value={quantities[product.id] || 1}
                onChange={(e) =>
                  handleQuantityChange(product.id, e.target.value)
                }
                min="1"
                className="w-16 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center text-xs text-white outline-none focus:border-rose-400"
                placeholder="1"
              />
              <button
                type="button"
                onClick={() => handleRestock(product)}
                disabled={restocking.has(product.id)}
                aria-label={`Repor ${product.name}`}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {restocking.has(product.id) ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
        <Check size={16} className="text-emerald-400" />
        <span className="text-xs font-bold text-emerald-300">
          O item sai da lista quando o estoque volta ao mínimo
        </span>
      </div>
    </div>
  );
}
