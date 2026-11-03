"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  MapPin,
  Menu,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  X,
} from "lucide-react";
import type { Category, Product, Settings } from "@/lib/types";
import { brl } from "@/lib/format";
import CartDrawer, { type CartLine } from "./CartDrawer";

type Props = {
  settings: Settings;
  categories: Category[];
  products: Product[];
};

export default function StoreFront({ settings, categories, products }: Props) {
  const [cart, setCart] = useState<Record<string, number>>({});
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<string>("todos");
  const [menuOpen, setMenuOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const storageKey = "brasa_cart_v1";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      // Hidratação: o carrinho só existe no navegador, então carregamos após montar.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setCart(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart, hydrated]);

  const lines: CartLine[] = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, qty]) => {
        const product = products.find((p) => p.id === productId);
        if (!product || qty <= 0) return null;
        return { product, qty };
      })
      .filter((l): l is CartLine => Boolean(l));
  }, [cart, products]);

  const count = lines.reduce((acc, l) => acc + l.qty, 0);
  const subtotal = lines.reduce((acc, l) => acc + l.product.price * l.qty, 0);

  const add = (product: Product) =>
    setCart((prev) => ({ ...prev, [product.id]: (prev[product.id] ?? 0) + 1 }));

  const dec = (productId: string) =>
    setCart((prev) => {
      const next = { ...prev };
      const q = (next[productId] ?? 0) - 1;
      if (q <= 0) delete next[productId];
      else next[productId] = q;
      return next;
    });

  const remove = (productId: string) =>
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });

  const clear = () => setCart({});

  const ordered = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const filtered = products.filter((p) => {
    if (!p.active) return false;
    const byCat = activeCat === "todos" || p.categoryId === activeCat;
    const q = query.trim().toLowerCase();
    const byQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return byCat && byQuery;
  });

  const sections = ordered
    .map((cat) => ({
      cat,
      items: filtered.filter((p) => p.categoryId === cat.id),
    }))
    .filter((s) => s.items.length > 0);

  const bestSellers = products.filter((p) => p.active && p.featured);

  return (
    <div
      className="min-h-screen text-zinc-100"
      style={{ "--brand": settings.primaryColor } as React.CSSProperties}
    >
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#09090b]/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
          <a href="#top" className="flex min-w-0 items-center gap-3">
            {settings.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={settings.logoUrl}
                alt={settings.storeName}
                className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-white/15 shadow-sm"
              />
            ) : (
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-lg font-black text-white shadow-sm">
                {settings.storeName.slice(0, 2).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-extrabold leading-tight tracking-tight">
                {settings.storeName}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
                <span
                  className={`inline-block h-1.5 w-1.5 rounded-full ${
                    settings.isOpen ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {settings.isOpen ? "Aberto agora" : "Fechado"}
              </span>
            </span>
          </a>

          <nav className="ml-auto hidden items-center gap-1 md:flex">
            <a
              href="#cardapio"
              className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              Cardápio
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
            >
              WhatsApp
            </a>
            <a
              href="/admin"
              className="rounded-full px-4 py-2 text-sm font-semibold text-zinc-500 transition hover:bg-white/[0.07] hover:text-zinc-200"
            >
              Painel
            </a>
          </nav>

          <button
            onClick={() => setOpen(true)}
            className="relative ml-auto flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 transition hover:bg-zinc-200 md:ml-2"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">
              {count > 0 ? brl(subtotal) : "Carrinho"}
            </span>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 animate-pop items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[11px] font-black text-white ring-2 ring-[#09090b]">
                {count}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-300 md:hidden"
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {menuOpen && (
          <div className="animate-fade-in border-t border-white/10 bg-[#09090b] px-4 py-3 md:hidden">
            <a
              href="#cardapio"
              onClick={() => setMenuOpen(false)}
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-200"
            >
              Cardápio
            </a>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-200"
            >
              Falar no WhatsApp
            </a>
            <a
              href="/admin"
              className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-zinc-500"
            >
              Painel do restaurante
            </a>
          </div>
        )}
      </header>

      <main id="top">
        {/* HERO */}
        <section className="relative mx-auto mt-4 w-full max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[28px] bg-[#0b0b0d]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />
            <div className="relative z-10 flex flex-col gap-6 px-6 py-12 sm:px-10 sm:py-16 md:py-20">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white/90 backdrop-blur">
                  <Sparkles size={12} className="text-amber-300" />
                  Cardápio digital
                </span>
                <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
                  {settings.storeName}
                </h1>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/80">
                  {settings.tagline}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur">
                  <Clock size={14} /> {settings.avgDeliveryTime}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur">
                  <Store size={14} /> Pedido mín. {brl(settings.minOrder)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur">
                  <MapPin size={14} /> Entrega {brl(settings.deliveryFee)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#cardapio"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:brightness-110"
                >
                  <ShoppingBag size={16} /> Ver cardápio
                </a>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-white/70">
                  <Star size={14} className="fill-amber-300 text-amber-300" />
                  4.9 · mais de 2 mil pedidos
                </span>
              </div>
            </div>
          </div>

          {!settings.isOpen && (
            <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
              Estamos fechados neste momento. Você pode montar seu pedido, mas a
              loja precisa estar aberta para enviar. ⏰
            </div>
          )}
        </section>

        {/* BUSCA + CATEGORIAS */}
        <section
          id="cardapio"
          className="sticky top-16 z-20 mt-6 border-b border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar no cardápio..."
                  className="w-full rounded-full border border-white/10 bg-white/[0.04] py-2.5 pl-11 pr-4 text-sm font-medium outline-none transition placeholder:text-zinc-500 focus:border-[var(--brand)] focus:ring-4 focus:ring-orange-500/15"
                />
              </div>
            </div>
            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
              <CategoryPill
                active={activeCat === "todos"}
                onClick={() => setActiveCat("todos")}
                label="Tudo"
                emoji="✨"
              />
              {ordered.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  active={activeCat === cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  label={cat.name}
                  emoji={cat.emoji}
                />
              ))}
            </div>
          </div>
        </section>

        {/* PRODUTOS */}
        <section className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
          {activeCat === "todos" && !query && bestSellers.length > 0 && (
            <div className="mb-8">
              <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                <span className="text-xl">🔥</span> Destaques da casa
              </h2>
              <div className="stagger no-scrollbar mt-3 flex gap-4 overflow-x-auto pb-2">
                {bestSellers.map((p) => (
                  <div key={p.id} className="w-[260px] shrink-0">
                    <ProductCard product={p} qty={cart[p.id] ?? 0} onAdd={add} onDec={dec} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {sections.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] py-16 text-center">
              <p className="text-3xl">🔎</p>
              <p className="mt-2 font-bold text-zinc-200">
                Nada encontrado por aqui
              </p>
              <p className="mt-1 text-sm text-zinc-400">
                Tente outra busca ou escolha outra categoria.
              </p>
            </div>
          )}

          {sections.map(({ cat, items }) => (
            <div key={cat.id} id={`cat-${cat.id}`} className="mb-9">
              <div className="mb-4 flex items-baseline gap-2">
                <h2 className="text-xl font-extrabold tracking-tight">
                  {cat.emoji} {cat.name}
                </h2>
                <span className="text-xs font-semibold text-zinc-500">
                  {items.length} {items.length === 1 ? "item" : "itens"}
                </span>
              </div>
              <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    qty={cart[p.id] ?? 0}
                    onAdd={add}
                    onDec={dec}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-white/[0.04]">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-black text-white">
                {settings.storeName.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-extrabold">{settings.storeName}</span>
            </div>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-400">
              {settings.tagline}
            </p>
          </div>
          <div className="text-sm text-zinc-300">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Onde estamos
            </p>
            <p className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              {settings.address}
            </p>
            <p className="mt-2 flex items-center gap-2">
              <Clock size={16} /> Entrega em {settings.avgDeliveryTime}
            </p>
          </div>
          <div className="text-sm text-zinc-300">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              Contato
            </p>
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-emerald-700 hover:underline"
            >
              WhatsApp: {settings.whatsapp}
            </a>
            {settings.instagram && (
              <p className="mt-2 text-zinc-400">{settings.instagram}</p>
            )}
            <a
              href="/admin"
              className="mt-4 inline-block text-xs font-semibold text-zinc-500 hover:text-zinc-200"
            >
              Painel do restaurante →
            </a>
          </div>
        </div>
        <div className="border-t border-white/[0.06] py-5 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} {settings.storeName} · Cardápio digital
        </div>
      </footer>

      {/* BARRA MOBILE */}
      {count > 0 && !open && (
        <div className="fixed inset-x-0 bottom-0 z-30 animate-slide-up border-t border-white/10 bg-[#0b0b0d]/90 p-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full items-center justify-between rounded-full bg-[var(--brand)] px-5 py-3.5 text-sm font-bold text-white shadow-lg"
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={17} /> Ver carrinho ({count})
            </span>
            <span>{brl(subtotal)}</span>
          </button>
        </div>
      )}

      <CartDrawer
        open={open}
        onClose={() => setOpen(false)}
        lines={lines}
        subtotal={subtotal}
        settings={settings}
        onAdd={add}
        onDec={dec}
        onRemove={remove}
        onClear={clear}
      />
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
  emoji,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  emoji: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-bold transition ${
        active
          ? "border-transparent bg-white text-zinc-900 shadow-sm"
          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:border-white/15 hover:text-white"
      }`}
    >
      <span>{emoji}</span>
      {label}
    </button>
  );
}

function ProductCard({
  product,
  qty,
  onAdd,
  onDec,
}: {
  product: Product;
  qty: number;
  onAdd: (p: Product) => void;
  onDec: (id: string) => void;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-white/[0.07]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-zinc-100 shadow-sm backdrop-blur">
            {product.badge}
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
            <button
              onClick={() => onAdd(product)}
              className="flex items-center gap-1.5 rounded-full bg-[var(--brand)] px-3.5 py-2 text-xs font-bold text-white transition hover:brightness-110 active:scale-95"
            >
              + Adicionar
            </button>
          ) : (
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
              <button
                onClick={() => onDec(product.id)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-zinc-200 shadow-sm transition hover:text-white"
                aria-label="Remover um"
              >
                −
              </button>
              <span className="w-5 text-center text-xs font-black">{qty}</span>
              <button
                onClick={() => onAdd(product)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white shadow-sm transition hover:brightness-110"
                aria-label="Adicionar um"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
