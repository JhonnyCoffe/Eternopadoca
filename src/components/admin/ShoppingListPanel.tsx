"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { brl } from "@/lib/format";
import { isLowStock } from "@/lib/store-utils";
import { restockProduct } from "@/app/admin/actions";

type Filter = "baixo" | "esgotado" | "todos";

export default function ShoppingListPanel({
  products,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);
  const [filter, setFilter] = useState<Filter>("baixo");
  const [restocking, setRestocking] = useState<Set<string>>(new Set());
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  const tracked = useMemo(
    () => products.filter((p) => p.trackStock),
    [products],
  );
  const lowStock = useMemo(() => tracked.filter(isLowStock), [tracked]);
  const outOfStock = useMemo(
    () => tracked.filter((p) => (p.stock ?? 0) <= 0),
    [tracked],
  );
  const okCount = tracked.length - lowStock.length;

  const visible = useMemo(() => {
    let list = tracked;
    if (filter === "baixo") list = lowStock;
    else if (filter === "esgotado") list = outOfStock;

    const q = debouncedSearch.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const cat = categories.find((c) => c.id === p.categoryId);
        return (
          p.name.toLowerCase().includes(q) ||
          (cat?.name ?? "").toLowerCase().includes(q)
        );
      });
    }
    return [...list].sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  }, [tracked, lowStock, outOfStock, filter, debouncedSearch, categories]);

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

  const categoryName = (id: string) =>
    categories.find((c) => c.id === id)?.name ?? "Sem categoria";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-[var(--brand-soft)]" />
            <h1 className="text-2xl font-black tracking-tight text-white">
              Lista de Compras
            </h1>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Itens com estoque abaixo do mínimo. Reponha direto daqui.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-zinc-400">
            <Package size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Monitorados
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">{tracked.length}</p>
        </div>
        <div className="panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-rose-300">
            <AlertTriangle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Estoque baixo
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-rose-300">
            {lowStock.length}
          </p>
        </div>
        <div className="panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-amber-300">
            <XCircle size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Esgotados
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-amber-300">
            {outOfStock.length}
          </p>
        </div>
        <div className="panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-emerald-300">
            <CheckCircle2 size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              Em dia
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-300">{okCount}</p>
        </div>
      </div>

      {/* Filters + search */}
      <div className="panel rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { key: "baixo", label: `Baixo (${lowStock.length})` },
                { key: "esgotado", label: `Esgotados (${outOfStock.length})` },
                { key: "todos", label: `Todos (${tracked.length})` },
              ] as { key: Filter; label: string }[]
            ).map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  filter === f.key
                    ? "bg-[var(--brand)] text-white"
                    : "bg-white/[0.04] text-zinc-400 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative ml-auto w-full sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar item..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-white outline-none focus:border-[var(--brand)]"
            />
          </div>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/15 px-4 py-2 text-sm font-bold text-red-300">
          {error}
        </p>
      )}

      {/* List */}
      <div className="panel overflow-hidden rounded-2xl">
        {visible.length === 0 ? (
          <div className="p-8 text-center">
            <ShoppingCart
              size={36}
              className="mx-auto mb-3 text-emerald-400"
            />
            <h3 className="font-black text-white">Nenhum item nesta lista</h3>
            <p className="mt-1 text-sm text-zinc-400">
              {filter === "baixo"
                ? "Estoque em dia. Nenhum item abaixo do mínimo."
                : "Nenhum item encontrado para o filtro."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {visible.map((product) => {
              const low = isLowStock(product);
              const stock = product.stock ?? 0;
              const min = product.lowStockAt ?? 5;
              const need = Math.max(0, min - stock + 1);
              return (
                <li
                  key={product.id}
                  className={`flex flex-wrap items-center gap-3 px-4 py-3 ${
                    low ? "bg-rose-500/[0.04]" : ""
                  }`}
                >
                  <Image
                    src={product.imageUrl || "/placeholder-food.svg"}
                    alt=""
                    width={48}
                    height={48}
                    className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-100">
                      {product.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {categoryName(product.categoryId)}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`rounded-full px-2 py-0.5 font-bold ${
                          stock <= 0
                            ? "bg-red-500/20 text-red-300"
                            : low
                              ? "bg-rose-500/20 text-rose-300"
                              : "bg-emerald-500/20 text-emerald-300"
                        }`}
                      >
                        Estoque: {stock}
                      </span>
                      <span className="text-zinc-500">Mínimo: {min}</span>
                      {need > 0 && (
                        <span className="text-zinc-500">
                          Repor: {need} un.
                        </span>
                      )}
                      {product.cost ? (
                        <span className="text-zinc-500">
                          Custo: {brl(product.cost)}/un.
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`qty-${product.id}`}
                      className="text-xs font-bold text-zinc-300"
                    >
                      Qtd.
                    </label>
                    <input
                      id={`qty-${product.id}`}
                      type="number"
                      value={quantities[product.id] || (need > 0 ? need : 1)}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      min="1"
                      className="w-16 rounded border border-white/10 bg-white/[0.03] px-2 py-1.5 text-center text-xs text-white outline-none focus:border-rose-400"
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
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}