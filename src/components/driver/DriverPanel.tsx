"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  LogOut,
  MapPin,
  Phone,
  RefreshCw,
} from "lucide-react";
import type { Order } from "@/lib/types";
import { PAYMENT_LABEL } from "@/lib/types";
import { brl, onlyDigits } from "@/lib/format";
import { assignDriver, logoutAction, updateOrderStatus } from "@/app/admin/actions";
import { mapsRouteUrl } from "@/lib/orders";

export default function DriverPanel({
  user,
  storeName,
  orders,
}: {
  user: { userId: string; name: string };
  storeName: string;
  orders: Order[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"minhas" | "disponiveis" | "historico">("minhas");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 10000);
    return () => clearInterval(id);
  }, [router]);

  const myOrders = orders.filter(
    (o) => o.driverId === user.userId && o.status === "saiu",
  );
  const available = orders.filter(
    (o) => o.status === "pronto" && !o.driverId,
  );
  const history = orders.filter(
    (o) => o.driverId === user.userId && o.status === "concluido",
  );

  function takeOrder(order: Order) {
    setBusyId(order.id);
    startTransition(async () => {
      const res = await assignDriver(order.id, user.userId);
      setBusyId(null);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  }

  function markDelivered(order: Order) {
    setBusyId(order.id);
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, "concluido");
      setBusyId(null);
      if (!res.ok) alert(res.error);
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.08] bg-[#0c0c10]/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] text-white">
            <Bike size={18} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              {storeName}
            </p>
            <p className="text-sm font-black text-white">{user.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => router.refresh()}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-white"
            aria-label="Atualizar"
          >
            <RefreshCw size={16} className={isPending ? "animate-spin" : ""} />
          </button>
          <form action={logoutAction}>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:text-white"
              aria-label="Sair"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </header>

      {/* TABS */}
      <div className="border-b border-white/[0.06] bg-[#0a0a0d] px-4">
        <div className="flex gap-2">
          <TabButton
            active={tab === "minhas"}
            onClick={() => setTab("minhas")}
            label="Comigo"
            count={myOrders.length}
          />
          <TabButton
            active={tab === "disponiveis"}
            onClick={() => setTab("disponiveis")}
            label="Prontas p/ pegar"
            count={available.length}
          />
          <TabButton
            active={tab === "historico"}
            onClick={() => setTab("historico")}
            label="Entregues hoje"
            count={history.length}
          />
        </div>
      </div>

      <main className="mx-auto max-w-xl p-4 space-y-3">
        {tab === "minhas" && (
          <>
            {myOrders.length === 0 ? (
              <Empty
                icon={<Bike size={32} />}
                title="Nenhuma entrega com você"
                subtitle="Pegue pedidos na aba 'Prontas p/ pegar'."
              />
            ) : (
              myOrders.map((order) => {
                const busy = busyId === order.id;
                const phone = onlyDigits(order.customerPhone);
                const waPhone = phone.length <= 11 ? `55${phone}` : phone;
                return (
                  <div key={order.id} className="card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-black text-zinc-900">
                          #{order.code}
                        </span>
                        <p className="mt-1 text-base font-extrabold text-white">
                          {order.customerName}
                        </p>
                      </div>
                      <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-bold text-sky-300">
                        Na rota
                      </span>
                    </div>

                    {order.address && (
                      <div className="rounded-xl bg-white/[0.04] p-3 text-xs leading-relaxed">
                        <p className="flex items-start gap-2 text-zinc-200">
                          <MapPin size={15} className="mt-0.5 shrink-0 text-rose-400" />
                          <span>{order.address}</span>
                        </p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {order.address && (
                        <a
                          href={mapsRouteUrl(order.address)}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-primary flex-1 !py-3 text-xs"
                        >
                          <ExternalLink size={14} /> Abrir GPS (Google Maps)
                        </a>
                      )}
                      <a
                        href={`https://wa.me/${waPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost !py-3 text-xs"
                      >
                        <Phone size={14} /> WhatsApp
                      </a>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-xs space-y-1">
                      <div className="flex justify-between text-zinc-400">
                        <span>Receber do cliente:</span>
                        <span className="font-bold text-white num">
                          {order.paymentStatus === "pago"
                            ? "JÁ PAGO (não cobrar)"
                            : brl(order.total)}
                        </span>
                      </div>
                      <div className="flex justify-between text-zinc-500 text-[11px]">
                        <span>Forma:</span>
                        <span>{PAYMENT_LABEL[order.payment]}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => markDelivered(order)}
                      disabled={busy}
                      className="btn btn-light w-full !py-3 text-sm"
                    >
                      {busy ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Check size={16} />
                      )}
                      Confirmar entrega realizada
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}

        {tab === "disponiveis" && (
          <>
            {available.length === 0 ? (
              <Empty
                icon={<CheckCircle2 size={32} />}
                title="Tudo em dia!"
                subtitle="Nenhum pedido novo pronto para entrega agora."
              />
            ) : (
              available.map((order) => {
                const busy = busyId === order.id;
                return (
                  <div key={order.id} className="card p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="rounded-lg bg-white px-2 py-0.5 text-xs font-black text-zinc-900">
                          #{order.code}
                        </span>
                        <p className="mt-1 text-sm font-bold text-white">
                          {order.customerName}
                        </p>
                      </div>
                      <span className="rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-black text-violet-300">
                        Pronto
                      </span>
                    </div>

                    {order.address && (
                      <p className="flex items-start gap-1.5 text-xs text-zinc-300">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-rose-400" />
                        <span>{order.address}</span>
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span>{order.items.length} itens</span>
                      <span className="font-bold text-white num">
                        {brl(order.total)}
                      </span>
                    </div>

                    <button
                      onClick={() => takeOrder(order)}
                      disabled={busy}
                      className="btn btn-primary w-full !py-2.5 text-xs"
                    >
                      {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Bike size={14} />
                      )}
                      Pegar esta entrega
                    </button>
                  </div>
                );
              })
            )}
          </>
        )}

        {tab === "historico" && (
          <>
            {history.length === 0 ? (
              <Empty
                icon={<Clock size={32} />}
                title="Nenhuma entrega finalizada hoje"
                subtitle="Suas entregas concluídas aparecerão aqui."
              />
            ) : (
              history.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white">#{order.code}</span> ·{" "}
                    <span className="text-zinc-400">{order.customerName}</span>
                    <p className="text-[11px] text-zinc-500 truncate max-w-[240px]">
                      {order.address}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-400 num">
                    {brl(order.total)}
                  </span>
                </div>
              ))
            )}
          </>
        )}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-1.5 py-3 text-xs font-bold transition ${
        active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-1.5 py-0.2 text-[10px] ${
          active ? "bg-white/15 text-white" : "bg-white/[0.06] text-zinc-500"
        }`}
      >
        {count}
      </span>
      {active && (
        <span className="absolute inset-x-0 bottom-0 h-[2px] bg-[var(--brand)]" />
      )}
    </button>
  );
}

function Empty({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-white/10 p-12 text-center">
      <div className="flex justify-center text-zinc-600">{icon}</div>
      <p className="mt-3 text-sm font-bold text-zinc-200">{title}</p>
      <p className="mt-1 text-xs text-zinc-500">{subtitle}</p>
    </div>
  );
}
