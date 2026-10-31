"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  Check,
  ExternalLink,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import type { DeliveryZone, Order, User } from "@/lib/types";
import { brl } from "@/lib/format";
import { assignDriver, deleteZone, saveZone, updateOrderStatus } from "@/app/admin/actions";
import { mapsRouteUrl } from "@/lib/orders";

export default function DeliveryManager({
  orders,
  drivers,
  zones,
}: {
  orders: Order[];
  drivers: User[];
  zones: DeliveryZone[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  const [newZone, setNewZone] = useState({ name: "", fee: "" });
  const [zoneError, setZoneError] = useState("");

  const pendingDeliveries = orders.filter(
    (o) => o.status === "preparando" || o.status === "pronto" || o.status === "saiu",
  );

  function assign(orderId: string, driverId: string) {
    setBusyId(orderId);
    startTransition(async () => {
      const res = await assignDriver(orderId, driverId || null);
      setBusyId(null);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  }

  function advance(order: Order) {
    const next =
      order.status === "pronto"
        ? "saiu"
        : order.status === "saiu"
        ? "concluido"
        : null;
    if (!next) return;
    setBusyId(order.id);
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, next);
      setBusyId(null);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  }

  async function handleAddZone(e: React.FormEvent) {
    e.preventDefault();
    setZoneError("");
    const res = await saveZone({
      name: newZone.name,
      fee: newZone.fee,
      active: true,
    });
    if (!res.ok) {
      setZoneError(res.error);
      return;
    }
    setNewZone({ name: "", fee: "" });
    router.refresh();
  }

  async function removeZone(id: string) {
    if (!confirm("Excluir esta taxa por bairro?")) return;
    const res = await deleteZone(id);
    if (!res.ok) alert(res.error);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Gestão de entregas
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Despache pedidos, atribua entregadores e configure taxas por bairro.
          </p>
        </div>
        <Link href="/entregador" target="_blank" className="btn btn-ghost text-xs">
          <Bike size={14} /> Abrir painel do entregador →
        </Link>
      </header>

      {/* FILA DE ENTREGAS */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bike size={18} className="text-rose-400" />
            <h2 className="text-base font-extrabold text-white">
              Entregas em andamento
            </h2>
          </div>
          <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs font-bold text-zinc-300">
            {pendingDeliveries.length} entregas ativas
          </span>
        </div>

        {pendingDeliveries.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-white/10 p-10 text-center text-xs text-zinc-500">
            Nenhuma entrega precisando de despacho no momento.
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {pendingDeliveries.map((order) => {
              const busy = busyId === order.id;
              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-lg bg-white px-2 py-0.5 text-xs font-black text-zinc-900">
                        #{order.code}
                      </span>
                      <p className="mt-1 text-sm font-bold text-white">
                        {order.customerName}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                        order.status === "saiu"
                          ? "bg-sky-500/20 text-sky-300"
                          : order.status === "pronto"
                          ? "bg-violet-500/20 text-violet-300"
                          : "bg-amber-500/20 text-amber-300"
                      }`}
                    >
                      {order.status === "saiu"
                        ? "Na rua"
                        : order.status === "pronto"
                        ? "Pronto"
                        : "Preparando"}
                    </span>
                  </div>

                  {order.address && (
                    <div className="mt-2.5 flex items-start gap-1.5 rounded-xl bg-black/20 p-2 text-xs text-zinc-300">
                      <MapPin size={13} className="mt-0.5 shrink-0 text-rose-400" />
                      <span className="truncate">{order.address}</span>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {order.address && (
                      <a
                        href={mapsRouteUrl(order.address)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost !py-1.5 text-xs"
                      >
                        <ExternalLink size={12} /> Rota no Maps
                      </a>
                    )}
                    <Link
                      href={`/pedido/${order.code}`}
                      target="_blank"
                      className="btn btn-ghost !py-1.5 text-xs"
                    >
                      Rastreio
                    </Link>
                  </div>

                  <div className="mt-3 flex items-center gap-2 border-t border-white/[0.06] pt-3">
                    <UserCheck size={14} className="text-zinc-500" />
                    <select
                      value={order.driverId ?? ""}
                      onChange={(e) => assign(order.id, e.target.value)}
                      disabled={busy}
                      className="input !h-8 !py-1 !text-xs !bg-transparent"
                    >
                      <option value="">(escolha o entregador)</option>
                      {drivers
                        .filter((d) => d.active)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                    </select>

                    {order.status === "pronto" && (
                      <button
                        onClick={() => advance(order)}
                        disabled={busy}
                        className="btn btn-primary !py-1.5 text-xs shrink-0"
                      >
                        {busy ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Despachar
                      </button>
                    )}
                    {order.status === "saiu" && (
                      <button
                        onClick={() => advance(order)}
                        disabled={busy}
                        className="btn btn-light !py-1.5 text-xs shrink-0"
                      >
                        {busy ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                        Entregue
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* TAXAS POR BAIRRO */}
      <section className="card p-5">
        <h2 className="text-base font-extrabold text-white">
          Taxas por bairro / região
        </h2>
        <p className="mt-0.5 text-xs text-zinc-400">
          Quando o cliente seleciona o bairro no carrinho, a taxa é aplicada
          automaticamente.
        </p>

        <form
          onSubmit={handleAddZone}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <input
            value={newZone.name}
            onChange={(e) => setNewZone((z) => ({ ...z, name: e.target.value }))}
            placeholder="Nome do bairro (ex: Centro, Bela Vista...)"
            required
            className="input min-w-[200px] flex-1 !py-2 text-xs"
          />
          <input
            value={newZone.fee}
            onChange={(e) => setNewZone((z) => ({ ...z, fee: e.target.value }))}
            placeholder="Taxa (R$)"
            required
            inputMode="decimal"
            className="input w-28 !py-2 text-xs"
          />
          <button type="submit" className="btn btn-primary !py-2 text-xs">
            <Plus size={14} /> Adicionar bairro
          </button>
        </form>

        {zoneError && (
          <p className="mt-2 text-xs font-semibold text-rose-400">{zoneError}</p>
        )}

        <div className="mt-4 divide-y divide-white/[0.06]">
          {zones.length === 0 ? (
            <p className="py-4 text-center text-xs text-zinc-500">
              Nenhuma taxa personalizada cadastrada. A taxa padrão da loja será
              usada.
            </p>
          ) : (
            zones.map((z) => (
              <div
                key={z.id}
                className="flex items-center justify-between py-2.5 text-xs"
              >
                <span className="font-semibold text-zinc-200">{z.name}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-white num">{brl(z.fee)}</span>
                  <button
                    onClick={() => removeZone(z.id)}
                    className="text-zinc-500 transition hover:text-rose-400"
                    aria-label="Excluir taxa"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
