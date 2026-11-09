"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Check,
  ChevronDown,
  ChevronUp,
  CircleDollarSign,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Ruler,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type { Category, Product, ProductVariant } from "@/lib/types";
import { brl } from "@/lib/format";
import { TextAnimate } from "@/components/ui/text-animate";
import { ProductImageUploadDrawer } from "@/components/ui/product-image-upload-drawer";
import {
  deleteCategory,
  deleteProduct,
  moveProductPosition,
  moveProductsToCategory,
  reorderProducts,
  saveCategory,
  saveProduct,
  setProductActive,
} from "@/app/admin/actions";

function readImageSize(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    img.src = src;
  });
}

function parseMoney(value: string | number, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const raw = value.trim();
  if (!raw) return fallback;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

type DraftVariant = {
  id: string;
  productId: string;
  size: string;
  flavor: string;
  price: string;
  stock: string;
  active: boolean;
};

type Draft = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  badge: string;
  active: boolean;
  featured: boolean;
  cost: string;
  stock: string;
  trackStock: boolean;
  lowStockAt: string;
  variants: DraftVariant[];
};

const emptyDraft = (categoryId: string): Draft => ({
  id: undefined,
  categoryId,
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  badge: "",
  active: true,
  featured: false,
  cost: "",
  stock: "20",
  trackStock: false,
  lowStockAt: "5",
  variants: [],
});

export default function ProductsManager({
  categories,
  products,
  canEdit = true,
}: {
  categories: Category[];
  products: Product[];
  canEdit?: boolean;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [catFilter, setCatFilter] = useState("todos");

  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [imageUploadDrawerOpen, setImageUploadDrawerOpen] = useState(false);
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(
    null,
  );
  const [dims, setDims] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [moveTargetCat, setMoveTargetCat] = useState<string>("todos");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const isSelected = (id: string) => selectedIds.has(id);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.effectAllowed = "move";
    (e.currentTarget as HTMLElement).dataset.dragId = id;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleReorderDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const dragId = (e.currentTarget as HTMLElement).dataset.dragId;
    if (!dragId || dragId === targetId) return;
    const ordered = [...filtered];
    const fromIndex = ordered.findIndex((p) => p.id === dragId);
    const toIndex = ordered.findIndex((p) => p.id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;
    const [moved] = ordered.splice(fromIndex, 1);
    ordered.splice(toIndex, 0, moved);
    await reorderProducts(ordered.map((p) => p.id));
    clearSelection();
  };

  const [newCat, setNewCat] = useState({ name: "", emoji: "" });
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [catDraft, setCatDraft] = useState({ name: "", emoji: "" });
  const [catError, setCatError] = useState("");

  const ordered = [...categories].sort((a, b) => a.order - b.order);

  const q = debouncedSearch.trim().toLowerCase();
  const filtered = products
    .filter((p) => {
      const byCat = catFilter === "todos" || p.categoryId === catFilter;
      const bySearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return byCat && bySearch;
    })
    .sort((a, b) => a.position - b.position || a.name.localeCompare(b.name));

  const PAGE_SIZE = 24;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [debouncedSearch, catFilter]);

  function openNew() {
    setDraft(emptyDraft(ordered[0]?.id ?? ""));
    setFormError("");
    setUploadError("");
    setImageMeta(null);
  }

  function openEdit(product: Product) {
    setDraft({
      id: product.id,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price.toFixed(2).replace(".", ","),
      imageUrl: product.imageUrl,
      badge: product.badge ?? "",
      active: product.active,
      featured: Boolean(product.featured),
      cost: (product.cost ?? 0) > 0 ? (product.cost ?? 0).toFixed(2).replace(".", ",") : "",
      stock: String(product.stock ?? 0),
      trackStock: Boolean(product.trackStock),
      lowStockAt: String(product.lowStockAt ?? 5),
      variants: (product.variants ?? []).map((v) => ({
        id: v.id,
        productId: v.productId,
        size: v.size ?? "",
        flavor: v.flavor ?? "",
        price: String(v.price),
        stock: String(v.stock ?? ""),
        active: v.active ?? true,
      })),
    });
    setFormError("");
    setUploadError("");
    setImageMeta(null);
    readImageSize(product.imageUrl)
      .then(setImageMeta)
      .catch(() => setImageMeta(null));
  }

  async function uploadImage(file: File) {
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setUploadError(data.error ?? "Não foi possível enviar a imagem.");
        return;
      }
      setDraft((d) => (d ? { ...d, imageUrl: data.url } : d));
      const size = await readImageSize(data.url);
      setImageMeta(size);
    } catch {
      setUploadError("Falha ao enviar a imagem. Tente novamente.");
    } finally {
      setUploading(false);
    }
  }

  async function handleProductImageUpload(file: File): Promise<string> {
    setUploading(true);
    setUploadError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setUploadError(data.error ?? "Não foi possível enviar a imagem.");
        return "";
      }
      const url = data.url;
      setDraft((d) => (d ? { ...d, imageUrl: url } : d));
      const size = await readImageSize(url);
      setImageMeta(size);
      return url;
    } catch {
      setUploadError("Falha ao enviar a imagem. Tente novamente.");
      return "";
    } finally {
      setUploading(false);
    }
  }

  function addVariant() {
    setDraft((d) =>
      d
        ? {
            ...d,
            variants: [
              ...d.variants,
              {
                id: `var-${Date.now()}`,
                productId: d.id ?? "",
                size: "",
                flavor: "",
                price: "0",
                stock: "",
                active: true,
              },
            ],
          }
        : d
    );
  }

  function removeVariant(index: number) {
    setDraft((d) =>
      d ? { ...d, variants: d.variants.filter((_, i) => i !== index) } : d
    );
  }

  function updateVariantField(index: number, field: keyof ProductVariant, value: string) {
    setDraft((d) =>
      d
        ? {
            ...d,
            variants: d.variants.map((v, i) =>
              i === index ? { ...v, [field]: value } : v
            ),
          }
        : d
    );
  }

  function toggleVariantActive(index: number) {
    setDraft((d) =>
      d
        ? {
            ...d,
            variants: d.variants.map((v, i) =>
              i === index ? { ...v, active: !v.active } : v
            ),
          }
        : d
    );
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) void uploadImage(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    setFormError("");
    const result = await saveProduct({
      id: draft.id,
      categoryId: draft.categoryId,
      name: draft.name,
      description: draft.description,
      price: draft.price,
      imageUrl: draft.imageUrl,
      active: draft.active,
      featured: draft.featured,
      badge: draft.badge,
      cost: draft.cost,
      stock: draft.stock,
      trackStock: draft.trackStock,
      lowStockAt: draft.lowStockAt,
      variants: draft.variants.map((v) => ({
        id: v.id,
        size: v.size,
        flavor: v.flavor,
        price: v.price,
        stock: v.stock,
        active: v.active,
      })),
    });
    setSaving(false);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setDraft(null);
    router.refresh();
  }

  async function remove(product: Product) {
    if (!confirm(`Excluir "${product.name}" do cardápio?`)) return;
    setBusyId(product.id);
    const result = await deleteProduct(product.id);
    setBusyId(null);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  function toggle(product: Product) {
    setBusyId(product.id);
    startTransition(async () => {
      const result = await setProductActive(product.id, !product.active);
      setBusyId(null);
      if (!result.ok) alert(result.error);
      router.refresh();
    });
  }

  async function movePosition(product: Product, direction: "up" | "down") {
    setBusyId(product.id);
    const result = await moveProductPosition(product.id, direction);
    setBusyId(null);
    if (!result.ok) alert(result.error);
    router.refresh();
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    setCatError("");
    const result = await saveCategory(newCat);
    if (!result.ok) {
      setCatError(result.error);
      return;
    }
    setNewCat({ name: "", emoji: "" });
    router.refresh();
  }

  async function saveCatEdit(id: string) {
    const result = await saveCategory({ id, ...catDraft });
    if (!result.ok) {
      setCatError(result.error);
      return;
    }
    setEditingCat(null);
    setCatError("");
    router.refresh();
  }

  async function removeCategory(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (!confirm(`Excluir a categoria "${cat?.name}"?`)) return;
    const result = await deleteCategory(id);
    if (!result.ok) {
      setCatError(result.error);
      return;
    }
    router.refresh();
  }

  const pPrice = draft ? parseMoney(draft.price) : 0;
  const pCost = draft ? parseMoney(draft.cost) : 0;
  const marginGross = pPrice - pCost;
  const marginPct = pPrice > 0 ? (marginGross / pPrice) * 100 : 0;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Cardápio e insumos
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {products.length} itens · {categories.length} categorias · controle de estoque e CMV
          </p>
        </div>
        {canEdit && (
          <button
            onClick={openNew}
            disabled={categories.length === 0}
            className="btn btn-primary text-xs"
          >
            <Plus size={15} /> Novo produto
          </button>
        )}
      </div>

      {/* CATEGORIAS */}
      <section className="mb-6 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <h2 className="text-sm font-extrabold text-zinc-100">Categorias</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {ordered.map((cat) => (
            <div
              key={cat.id}
              className="group flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-3 pr-1"
            >
              {editingCat === cat.id ? (
                <>
                  <input
                    value={catDraft.emoji}
                    onChange={(e) =>
                      setCatDraft((p) => ({ ...p, emoji: e.target.value }))
                    }
                    className="w-9 rounded border border-white/15 px-1 py-0.5 text-center text-sm"
                  />
                  <input
                    value={catDraft.name}
                    onChange={(e) =>
                      setCatDraft((p) => ({ ...p, name: e.target.value }))
                    }
                    className="w-24 rounded border border-white/15 px-2 py-0.5 text-xs font-semibold"
                  />
                  <button
                    onClick={() => saveCatEdit(cat.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"
                  >
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => setEditingCat(null)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500"
                  >
                    <X size={12} />
                  </button>
                </>
              ) : (
                <>
                  <span className="text-sm">{cat.emoji}</span>
                  <span className="text-xs font-bold text-zinc-200">
                    {cat.name}
                  </span>
                  {canEdit && (
                    <>
                      <button
                        onClick={() => {
                          setEditingCat(cat.id);
                          setCatDraft({ name: cat.name, emoji: cat.emoji });
                        }}
                        className="ml-1 flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10"
                        aria-label="Editar categoria"
                      >
                        <Pencil size={11} />
                      </button>
                      <button
                        onClick={() => removeCategory(cat.id)}
                        className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-500 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/20 hover:text-rose-400"
                        aria-label="Excluir categoria"
                      >
                        <Trash2 size={11} />
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ))}

          {canEdit && (
            <form onSubmit={addCategory} className="flex items-center gap-1">
              <input
                value={newCat.emoji}
                onChange={(e) => setNewCat((p) => ({ ...p, emoji: e.target.value }))}
                placeholder="🍽️"
                className="w-12 rounded-full border border-dashed border-white/15 px-2 py-1.5 text-center text-sm outline-none focus:border-white/40"
              />
              <input
                value={newCat.name}
                onChange={(e) => setNewCat((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nova categoria"
                className="w-32 rounded-full border border-dashed border-white/20 px-3 py-1.5 text-xs font-semibold outline-none focus:border-white/40"
              />
              <button className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-zinc-900">
                <Plus size={13} />
              </button>
            </form>
          )}
        </div>
        {catError && (
          <p className="mt-2 text-xs font-semibold text-rose-400">{catError}</p>
        )}
      </section>

      {/* FILTROS */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou descrição..."
            className="input !pl-10"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="input sm:w-60"
        >
          <option value="todos">Todas as categorias</option>
          {ordered.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* LISTA */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl">🍽️</p>
            <p className="mt-2 font-bold text-zinc-200">
              Nenhum produto encontrado
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              Cadastre seu primeiro item no cardápio.
            </p>
          </div>
        ) : (
          <div>
            {selectedIds.size > 0 && (
              <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2">
                <span className="text-xs font-bold text-zinc-200">
                  {selectedIds.size} selecionado(s)
                </span>
                <select
                  value={moveTargetCat}
                  onChange={(e) => setMoveTargetCat(e.target.value)}
                  className="input sm:w-60 text-xs"
                >
                  <option value="todos">Mover para categoria</option>
                  {ordered.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.emoji} {c.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    if (moveTargetCat === "todos") return;
                    void moveProductsToCategory([...selectedIds], moveTargetCat);
                    clearSelection();
                    setMoveTargetCat("todos");
                  }}
                  disabled={moveTargetCat === "todos"}
                  className="btn btn-primary text-xs disabled:opacity-50"
                >
                  Mover
                </button>
                <button
                  onClick={clearSelection}
                  className="btn btn-ghost text-xs"
                >
                  Limpar
                </button>
              </div>
            )}
            <ul className="divide-y divide-white/[0.06]">
            {paged.map((product) => {              const cat = categories.find((c) => c.id === product.categoryId);
              const cost = product.cost ?? 0;
              const margin = product.price - cost;
              const pct = product.price > 0 ? (margin / product.price) * 100 : 0;

              const hasImage = Boolean(product.imageUrl && String(product.imageUrl).trim());

              return (
                <li
                  key={product.id}
                  draggable={canEdit}
                  onDragStart={(e) => handleDragStart(e, product.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleReorderDrop(e, product.id)}
                  className={`flex flex-wrap items-center gap-3 px-3 py-3 sm:px-4 ${
                    isSelected(product.id)
                      ? "bg-white/[0.08] border border-white/10 rounded-xl"
                      : ""
                  }`}
                >
                  {canEdit && (
                    <label className="flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelected(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="h-4 w-4 accent-rose-500"
                      />
                      <span className="sr-only">Selecionar {product.name}</span>
                    </label>
                  )}
                  {hasImage ? (
                    <img
                      src={String(product.imageUrl)}
                      alt=""
                      onLoad={(e) =>
                        setDims((prev) => {
                          const target = e.currentTarget as HTMLImageElement | null;
                          if (!target || prev[product.id]) return prev;
                          return {
                            ...prev,
                            [product.id]: `${target.naturalWidth}×${target.naturalHeight}`,
                          };
                        })
                      }
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 shrink-0 rounded-xl bg-white/[0.05] flex items-center justify-center text-zinc-500">
                      <span className="text-xs">Sem foto</span>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-zinc-100">
                        {product.name}
                      </p>
                      {!product.active && (
                        <span className="shrink-0 rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                          Pausado
                        </span>
                      )}
                      {product.featured && (
                        <span className="shrink-0 rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                          Destaque
                        </span>
                      )}
                      {(product.trackStock || (product.stock ?? 0) > 0) && (
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            product.trackStock && (product.stock ?? 0) <= 0
                              ? "bg-red-500/25 text-red-300 border border-red-500/30"
                              : product.trackStock && (product.stock ?? 0) <= (product.lowStockAt ?? 5)
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : "bg-emerald-500/15 text-emerald-300"
                          }`}
                        >
                          {product.trackStock && (product.stock ?? 0) <= 0
                            ? "Esgotado (0 un)"
                            : `Estoque: ${product.stock ?? 0} un`}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-400">
                      <span>{cat ? `${cat.emoji} ${cat.name}` : "Sem categoria"}</span>
                      <span>·</span>
                      <span className="font-bold text-white num">
                        {brl(product.price)}
                      </span>
                      {cost > 0 && (
                        <>
                          <span>·</span>
                          <span className="text-zinc-500">
                            Custo: {brl(cost)} (Margem {pct.toFixed(0)}%)
                          </span>
                        </>
                      )}
                      {dims[product.id] && (
                        <span className="text-zinc-600">· {dims[product.id]} px</span>
                      )}
                    </p>
                  </div>

                  {canEdit && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggle(product)}
                        disabled={busyId === product.id}
                        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                          product.active ? "bg-emerald-500" : "bg-white/20"
                        }`}
                        aria-label={product.active ? "Pausar" : "Ativar"}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                            product.active ? "left-[22px]" : "left-0.5"
                          }`}
                        />
                      </button>

                      <button
                        onClick={() => void movePosition(product, "up")}
                        disabled={
                          busyId === product.id ||
                          product.position <= 0
                        }
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                        aria-label="Subir posição"
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        onClick={() => void movePosition(product, "down")}
                        disabled={busyId === product.id}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
                        aria-label="Descer posição"
                      >
                        <ChevronDown size={15} />
                      </button>
                      <button
                        onClick={() => openEdit(product)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                        aria-label="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => remove(product)}
                        disabled={busyId === product.id}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                        aria-label="Excluir"
                      >
                        {busyId === product.id ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <Trash2 size={15} />
                        )}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
            </div>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="btn btn-ghost text-xs disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-xs text-zinc-400">
            Página {page} de {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="btn btn-ghost text-xs disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      )}

      {/* MODAL PRODUTO */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <form
            onSubmit={submit}
            className="max-h-[92vh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0e0e13] p-5 shadow-2xl sm:rounded-3xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight text-white">
                <TextAnimate
                  text={draft.id ? "Editar produto" : "Novo produto"}
                  type="fadeInUp"
                  className="text-lg font-black tracking-tight text-white"
                  delay={0.05}
                />
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-white/[0.06]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="label">Nome</span>
                <input
                  value={draft.name}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, name: e.target.value } : d))
                  }
                  required
                  placeholder="Ex: Brasa Burger Clássico"
                  className="input"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Categoria</span>
                  <select
                    value={draft.categoryId}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, categoryId: e.target.value } : d,
                      )
                    }
                    className="input"
                  >
                    {ordered.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji} {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="label">Preço de venda (R$)</span>
                  <input
                    value={draft.price}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, price: e.target.value } : d))
                    }
                    required
                    inputMode="decimal"
                    placeholder="29,90"
                    className="input"
                  />
                </label>
              </div>

              {/* SEÇÃO GESTÃO: CMV E ESTOQUE */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <CircleDollarSign size={16} className="text-rose-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Gestão: CMV e Lucro Bruto
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="label">Custo do prato / insumos (R$)</span>
                    <input
                      value={draft.cost}
                      onChange={(e) =>
                        setDraft((d) => (d ? { ...d, cost: e.target.value } : d))
                      }
                      inputMode="decimal"
                      placeholder="ex: 11,50"
                      className="input"
                    />
                  </label>
                  <div className="flex flex-col justify-end pb-1 text-xs">
                    <span className="text-zinc-500">Lucro Bruto estimado:</span>
                    <span
                      className={`text-sm font-black num ${
                        marginGross > 0 ? "text-emerald-400" : "text-zinc-400"
                      }`}
                    >
                      {brl(marginGross)} ({marginPct.toFixed(0)}%)
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-200">
                    <input
                      type="checkbox"
                      checked={draft.trackStock}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, trackStock: e.target.checked } : d,
                        )
                      }
                      className="h-4 w-4 accent-rose-500"
                    />
                    Controlar estoque automaticamente ao vender
                  </label>

                  {draft.trackStock && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="label">Quantidade em estoque</span>
                        <input
                          type="number"
                          value={draft.stock}
                          onChange={(e) =>
                            setDraft((d) =>
                              d ? { ...d, stock: e.target.value } : d,
                            )
                          }
                          min="0"
                          className="input"
                        />
                      </label>
                      <label className="block">
                        <span className="label">Alerta de estoque baixo em</span>
                        <input
                          type="number"
                          value={draft.lowStockAt}
                          onChange={(e) =>
                            setDraft((d) =>
                              d ? { ...d, lowStockAt: e.target.value } : d,
                            )
                          }
                          min="0"
                          className="input"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <label className="block">
                <span className="label">Descrição</span>
                <textarea
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) =>
                      d ? { ...d, description: e.target.value } : d,
                    )
                  }
                  rows={3}
                  placeholder="Ingredientes, gramatura, acompanhamentos..."
                  className="input resize-none"
                />
              </label>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="label">Foto do produto</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-zinc-500">
                    <Ruler size={11} /> ideal 800 × 800
                  </span>
                </div>

                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="relative overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.03]"
                >
                  {draft.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={draft.imageUrl}
                      alt="Prévia"
                      onLoad={(e) =>
                        setImageMeta({
                          width: e.currentTarget.naturalWidth,
                          height: e.currentTarget.naturalHeight,
                        })
                      }
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center gap-1.5 text-zinc-500">
                      <ImagePlus size={26} />
                      <p className="text-xs font-semibold">
                        Arraste uma imagem aqui
                      </p>
                      <p className="text-[10px]">JPG, PNG, WebP ou GIF · até 5 MB</p>
                    </div>
                  )}

                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                      <Loader2 size={22} className="animate-spin text-rose-400" />
                    </div>
                  )}

                  {imageMeta && !uploading && (
                    <span
                      className={`absolute bottom-2 right-2 rounded-full px-2.5 py-1 text-[10px] font-black backdrop-blur ${
                        imageMeta.width === imageMeta.height
                          ? "bg-black/65 text-emerald-300"
                          : "bg-amber-500/25 text-amber-200"
                      }`}
                    >
                      {imageMeta.width} × {imageMeta.height} px
                      {imageMeta.width === imageMeta.height ? " ✓" : ""}
                    </span>
                  )}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    value={draft.imageUrl}
                    onChange={(e) => {
                      setDraft((d) =>
                        d ? { ...d, imageUrl: e.target.value } : d,
                      );
                      setImageMeta(null);
                    }}
                    placeholder="ou cole uma URL..."
                    className="input min-w-[160px] flex-1"
                  />
                  {draft.imageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft((d) => (d ? { ...d, imageUrl: "" } : d));
                        setImageMeta(null);
                      }}
                      className="text-xs font-bold text-zinc-500 transition hover:text-rose-400"
                    >
                      Remover
                    </button>
                  )}
                </div>

                {uploadError && (
                  <p className="mt-2 text-xs font-semibold text-rose-300">
                    {uploadError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="label">Selo (opcional)</span>
                  <input
                    value={draft.badge}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, badge: e.target.value } : d,
                      )
                    }
                    placeholder="Mais pedido"
                    className="input"
                  />
                </label>
                <div className="flex flex-col justify-end gap-2 pb-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input
                      type="checkbox"
                      checked={draft.active}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, active: e.target.checked } : d,
                        )
                      }
                      className="h-4 w-4 accent-rose-500"
                    />
                    Disponível no cardápio
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                    <input
                      type="checkbox"
                      checked={draft.featured}
                      onChange={(e) =>
                        setDraft((d) =>
                          d ? { ...d, featured: e.target.checked } : d,
                        )
                      }
                      className="h-4 w-4 accent-rose-500"
                    />
                    Mostrar em destaques
                  </label>
                </div>
              </div>

              {/* VARIAÇÕES (tamanho / sabor / preço / estoque) */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-3.5 space-y-3">
                <div className="flex items-center gap-2">
                  <Plus size={16} className="text-brand-soft" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Variações do produto
                  </span>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="ml-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-bold text-zinc-200 transition hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Ex: tamanho 350ml / 2L · sabor uva / laranja / limão / guaraná
                </p>
                <div className="space-y-2">
                  {draft.variants.map((v, i) => (
                    <div
                      key={v.id}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <div className="col-span-3">
                        <input
                          value={v.size}
                          onChange={(e) =>
                            updateVariantField(i, "size", e.target.value)
                          }
                          placeholder="Tamanho (ex: 350ml)"
                          className="input text-xs"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          value={v.flavor}
                          onChange={(e) =>
                            updateVariantField(i, "flavor", e.target.value)
                          }
                          placeholder="Sabor (ex: uva)"
                          className="input text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          value={v.price}
                          onChange={(e) =>
                            updateVariantField(i, "price", e.target.value)
                          }
                          inputMode="decimal"
                          placeholder="Preço"
                          className="input text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          value={v.stock}
                          onChange={(e) =>
                            updateVariantField(i, "stock", e.target.value)
                          }
                          placeholder="Estoque"
                          className="input text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-zinc-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={v.active}
                            onChange={() => toggleVariantActive(i)}
                            className="h-4 w-4 accent-rose-500"
                          />
                          Ativo
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="col-span-1 flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:text-rose-400 transition"
                        aria-label="Remover variação"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {draft.variants.length === 0 && (
                    <p className="text-xs text-zinc-500 italic">
                      Nenhuma variação cadastrada. O produto será vendido com o
                      preço único acima.
                    </p>
                  )}
                </div>
              </div>

              {formError && (
                <p className="rounded-xl bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300">
                  {formError}
                </p>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="btn btn-ghost flex-1 text-xs"
              >
                Cancelar
              </button>
              <button
                disabled={saving}
                className="btn btn-primary flex-1 text-xs"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                {saving ? "Salvando..." : "Salvar produto"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Drawer de upload renderizado fora do modal (portal no body) */}
      {createPortal(
        <ProductImageUploadDrawer
          open={imageUploadDrawerOpen}
          onOpenChange={setImageUploadDrawerOpen}
          onUploadFile={handleProductImageUpload}
          currentUrl={draft?.imageUrl ?? ""}
          onConfirm={(url) => {
            setDraft((d) =>
              d ? { ...d, imageUrl: url } : d,
            );
            setImageMeta(null);
            setImageUploadDrawerOpen(false);
          }}
        />,
        document.body,
      )}
    </div>
  );
}
