"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  Check,
  ChefHat,
  Clock,
  Flame,
  Loader2,
  RefreshCw,
  Store,
} from "lucide-react";
import type { Order } from "@/lib/types";
import { updateOrderStatus } from "@/app/admin/actions";

function elapsedMinutes(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(diff / 60000));
}

export default function KitchenDisplay({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(id);
  }, [router]);

  function advance(order: Order) {
    const nextStatus =
      order.status === "novo"
        ? "preparando"
        : order.status === "preparando"
        ? "pronto"
        : null;

    if (!nextStatus) return;

    setBusyId(order.id);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, nextStatus);
      setBusyId(null);
      if (!result.ok) alert(result.error);
      router.refresh();
    });
  }

  const sorted = [...orders].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );

  const nov = sorted.filter((o) => o.status === "novo");
  const prep = sorted.filter((o) => o.status === "preparando");
  const ready = sorted.filter((o) => o.status === "pronto");

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ChefHat size={22} className="text-rose-400" />
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Cozinha (KDS)
            </h1>
          </div>
          <p className="mt-1 text-sm text-zinc-400">
            Fila de preparo limpa e em tempo real para tablets e monitores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-bold text-zinc-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            {sorted.length} na fila
          </span>
          <button
            onClick={() => router.refresh()}
            className="btn btn-ghost text-xs"
          >
            <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] py-24 text-center">
          <p className="text-4xl">👨‍🍳</p>
          <p className="mt-3 text-lg font-bold text-zinc-200">
            Cozinha zerada!
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Nenhum pedido em preparo no momento.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <Column
            title="Novos"
            count={nov.length}
            accent="border-rose-500/30 text-rose-300 bg-rose-500/10"
            orders={nov}
            busyId={busyId}
            onAdvance={advance}
            buttonLabel="Iniciar preparo"
          />
          <Column
            title="Preparando"
            count={prep.length}
            accent="border-amber-500/30 text-amber-300 bg-amber-500/10"
            orders={prep}
            busyId={busyId}
            onAdvance={advance}
            buttonLabel="Pronto"
          />
          <Column
            title="Prontos"
            count={ready.length}
            accent="border-violet-500/30 text-violet-300 bg-violet-500/10"
            orders={ready}
            busyId={busyId}
            buttonLabel="Aguardando saída"
          />
        </div>
      )}
    </div>
  );
}

function Column({
  title,
  count,
  accent,
  orders,
  busyId,
  onAdvance,
  buttonLabel,
}: {
  title: string;
  count: number;
  accent: string;
  orders: Order[];
  busyId: string | null;
  onAdvance?: (o: Order) => void;
  buttonLabel: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <span className="text-sm font-extrabold text-white">{title}</span>
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-black ${accent}`}
        >
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const minutes = elapsedMinutes(order.createdAt);
          const urgent = minutes >= 25;
          const busy = busyId === order.id;

          return (
            <article
              key={order.id}
              className={`card overflow-hidden p-4 transition ${
                urgent
                  ? "border-rose-500/40 bg-[rgba(225,29,72,0.06)]"
                  : "bg-white/[0.035]"
              }`}
            >
              <header className="flex items-start justify-between gap-2 border-b border-white/[0.06] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-base font-black text-zinc-900">
                    {order.code}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {order.customerName}
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                      {order.type === "delivery" ? (
                        <>
                          <Bike size={12} /> Entrega
                        </>
                      ) : (
                        <>
                          <Store size={12} /> Retirada
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    urgent
                      ? "bg-rose-500/20 text-rose-300"
                      : "bg-white/10 text-zinc-400"
                  }`}
                >
                  {urgent && <Flame size={12} className="text-rose-400" />}
                  <Clock size={11} /> {minutes}m
                </span>
              </header>

              <ul className="my-3 space-y-2">
                {order.items.map((it) => (
                  <li
                    key={it.productId}
                    className="rounded-xl bg-white/[0.03] p-2 text-sm leading-snug"
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="flex h-6 min-w-6 items-center justify-center rounded-lg bg-[var(--brand)] text-xs font-black text-white">
                        {it.qty}x
                      </span>
                      <span className="font-bold text-zinc-100">{it.name}</span>
                    </div>
                    {it.notes && (
                      <p className="mt-1 pl-8 text-xs font-medium text-amber-300">
                        ↳ {it.notes}
                      </p>
                    )}
                  </li>
                ))}
              </ul>

              {order.notes && (
                <p className="mb-3 rounded-xl bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300">
                  Obs do pedido: {order.notes}
                </p>
              )}

              {onAdvance ? (
                <button
                  onClick={() => onAdvance(order)}
                  disabled={busy}
                  className="btn btn-primary w-full !py-2.5 text-xs"
                >
                  {busy ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Check size={14} />
                  )}
                  {buttonLabel}
                </button>
              ) : (
                <span className="block text-center text-xs font-semibold text-zinc-500">
                  {buttonLabel}
                </span>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
