"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Bike,
  Check,
  Clock,
  DollarSign,
  ExternalLink,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  Store,
  UserCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import type { Order, OrderStatus, Role, User } from "@/lib/types";
import { ORDER_STATUS_LABEL, PAYMENT_LABEL } from "@/lib/types";
import { brl, formatDate, onlyDigits } from "@/lib/format";
import {
  assignDriver,
  setOrderPaid,
  updateOrderStatus,
} from "@/app/admin/actions";
import { mapsRouteUrl, mapsSearchUrl } from "@/lib/orders";
import OrderChat from "@/components/chat/OrderChat";

const FILTERS: { id: string; label: string; match: (o: Order) => boolean }[] = [
  { id: "todos", label: "Todos", match: () => true },
  { id: "novo", label: "Novos", match: (o) => o.status === "novo" },
  {
    id: "andamento",
    label: "Em andamento",
    match: (o) =>
      o.status === "preparando" || o.status === "pronto" || o.status === "saiu" || o.status === "chegou",
  },
  { id: "pronto", label: "Prontos", match: (o) => o.status === "pronto" },
  { id: "saiu", label: "Na rua", match: (o) => o.status === "saiu" },
  { id: "chegou", label: "Chegou", match: (o) => o.status === "chegou" },
  { id: "concluido", label: "Concluídos", match: (o) => o.status === "concluido" },
  { id: "cancelado", label: "Cancelados", match: (o) => o.status === "cancelado" },
];

const NEXT: Record<string, { label: string; status: OrderStatus }> = {
  novo: { label: "Iniciar preparo", status: "preparando" },
  preparando: { label: "Pronto p/ entrega/retirada", status: "pronto" },
  pronto: { label: "Despachar pedido", status: "saiu" },
  saiu: { label: "Marcar chegada", status: "chegou" },
  chegou: { label: "Concluir pedido", status: "concluido" },
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  novo: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  preparando: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  pronto: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  saiu: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  chegou: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  concluido: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cancelado: "border-white/10 bg-white/[0.05] text-zinc-400",
};

export default function OrdersBoard({
  orders,
  role = "dono",
  drivers = [],
}: {
  orders: Order[];
  role?: Role;
  drivers?: User[];
}) {
  const router = useRouter();
  const [filter, setFilter] = useState("todos");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [chatOrderId, setChatOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(id);
  }, [router]);

  const today = new Date();
  const isToday = (iso: string) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  };

  const todayOrders = orders.filter((o) => isToday(o.createdAt));
  const validToday = todayOrders.filter((o) => o.status !== "cancelado");
  const revenue = validToday.reduce((acc, o) => acc + o.total, 0);
  const newCount = orders.filter((o) => o.status === "novo").length;

  const visible = orders.filter(
    (o) => FILTERS.find((f) => f.id === filter)?.match(o) ?? true,
  );

  function setStatus(order: Order, status: OrderStatus) {
    setPendingId(order.id);
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      setPendingId(null);
      if (!result.ok) alert(result.error);
      router.refresh();
    });
  }

  function togglePaid(order: Order) {
    setPendingId(order.id);
    startTransition(async () => {
      const result = await setOrderPaid(
        order.id,
        order.paymentStatus !== "pago",
      );
      setPendingId(null);
      if (!result.ok) alert(result.error);
      router.refresh();
    });
  }

  function onAssign(orderId: string, driverId: string) {
    setPendingId(orderId);
    startTransition(async () => {
      const result = await assignDriver(orderId, driverId || null);
      setPendingId(null);
      if (!result.ok) alert(result.error);
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Pedidos
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Acompanhe pedidos, despache entregadores e converse com o cliente.
          </p>
        </div>
        <button
          onClick={() => router.refresh()}
          className="btn btn-ghost text-xs"
        >
          <RefreshCw size={13} className={isPending ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Pedidos hoje" value={String(todayOrders.length)} />
        <StatCard label="Faturamento hoje" value={brl(revenue)} />
        <StatCard label="Novos pedidos" value={String(newCount)} accent />
        <StatCard
          label="Ticket médio"
          value={validToday.length ? brl(revenue / validToday.length) : brl(0)}
        />
      </div>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => {
          const count = orders.filter(f.match).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`chip ${active ? "chip-active" : ""}`}
            >
              {f.label}
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  active ? "bg-black/15 text-zinc-900" : "bg-white/10 text-zinc-400"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.02] py-20 text-center">
          <p className="text-3xl">🧾</p>
          <p className="mt-3 font-bold text-zinc-200">Nenhum pedido por aqui</p>
          <p className="mt-1 text-sm text-zinc-400">
            Os pedidos do cardápio aparecem nesta tela.
          </p>
          <Link href="/" target="_blank" className="btn btn-light mt-5">
            Abrir cardápio
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visible.map((order) => {
            const next = NEXT[order.status];
            const busy = isPending && pendingId === order.id;
            const phone = onlyDigits(order.customerPhone);
            const waPhone = phone.length <= 11 ? `55${phone}` : phone;
            const isDelivery = order.type === "delivery";
            const isPaid = order.paymentStatus === "pago";
            const chatOpen = chatOrderId === order.id;

            return (
              <article
                key={order.id}
                className="card overflow-hidden transition hover:border-white/15"
              >
                <header className="flex items-start gap-3 border-b border-white/[0.06] p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-zinc-900 shadow-sm">
                    {order.code}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-bold text-white">
                        {order.customerName}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${STATUS_STYLE[order.status]}`}
                      >
                        {order.type === "retirada" && order.status === "pronto"
                          ? "Pronto p/ retirada"
                          : ORDER_STATUS_LABEL[order.status]}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                          isPaid
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-amber-500/15 text-amber-300"
                        }`}
                      >
                        {isPaid ? "Pago" : "A receber"}
                      </span>
                    </div>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {formatDate(order.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        {isDelivery ? (
                          <>
                            <Bike size={11} /> Entrega
                            {order.zoneName ? ` · ${order.zoneName}` : ""}
                          </>
                        ) : (
                          <>
                            <Store size={11} /> Retirada
                          </>
                        )}
                      </span>
                      <span>{PAYMENT_LABEL[order.payment]}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setChatOrderId((cur) => (cur === order.id ? null : order.id))
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
                        chatOpen
                          ? "bg-[var(--brand)] text-white"
                          : "bg-white/[0.06] text-zinc-300 hover:bg-white/10"
                      }`}
                      title="Abrir chat do pedido"
                      aria-label="Abrir chat do pedido"
                    >
                      <MessageCircle size={15} />
                    </button>
                    <a
                      href={`https://wa.me/${waPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 transition hover:bg-emerald-500/20"
                      aria-label="Chamar no WhatsApp"
                    >
                      <Phone size={15} />
                    </a>
                  </div>
                </header>

                <div className="p-4">
                  <ul className="space-y-1">
                    {order.items.map((it) => (
                      <li
                        key={it.productId}
                        className="flex justify-between gap-3 text-[13px] text-zinc-200"
                      >
                        <span className="truncate">
                          <span className="font-black text-zinc-500">
                            {it.qty}x
                          </span>{" "}
                          {it.name}
                        </span>
                        <span className="shrink-0 font-semibold num">
                          {brl(it.price * it.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {order.address && (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white/[0.03] p-2.5 text-[11px] text-zinc-300">
                      <p className="flex items-start gap-1.5 min-w-0 flex-1 leading-snug">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-rose-400" />
                        <span className="truncate">{order.address}</span>
                      </p>
                      <div className="flex gap-1.5 shrink-0">
                        <a
                          href={mapsRouteUrl(order.address)}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 rounded-md bg-white/10 px-2 py-1 text-[10px] font-bold text-white transition hover:bg-white/20"
                        >
                          <ExternalLink size={10} /> Rota Maps
                        </a>
                        <a
                          href={mapsSearchUrl(order.address)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold text-zinc-300 transition hover:bg-white/5"
                        >
                          Ver local
                        </a>
                      </div>
                    </div>
                  )}

                  {order.notes && (
                    <p className="mt-2 rounded-xl bg-amber-500/10 px-3 py-2 text-[11px] font-medium text-amber-300">
                      Obs: {order.notes}
                    </p>
                  )}

                  {/* Entregador atribuído */}
                  {isDelivery && drivers.length > 0 && role !== "cozinha" && (
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 text-xs">
                      <UserCheck size={14} className="text-zinc-500" />
                      <span className="text-[11px] font-bold text-zinc-400">
                        Entregador:
                      </span>
                      <select
                        value={order.driverId ?? ""}
                        onChange={(e) => onAssign(order.id, e.target.value)}
                        disabled={busy}
                        className="input !h-8 !py-1 !text-xs !bg-transparent"
                      >
                        <option value="">(sem entregador)</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-white/10 pt-2.5">
                    <span className="text-[11px] text-zinc-500">
                      {isDelivery
                        ? `Entrega ${brl(order.deliveryFee)}`
                        : "Sem taxa de entrega"}
                    </span>
                    <span className="text-base font-black text-white num">
                      {brl(order.total)}
                    </span>
                  </div>

                  {chatOpen && (
                    <div className="mt-3">
                      <OrderChat orderId={order.id} mode="loja" height="h-64" />
                    </div>
                  )}
                </div>

                <footer className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] bg-white/[0.02] p-3">
                  {next ? (
                    <button
                      onClick={() => setStatus(order, next.status)}
                      disabled={busy}
                      className="btn btn-primary flex-1 !py-2.5 text-xs"
                    >
                      {busy ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Check size={14} />
                      )}
                      {next.label}
                    </button>
                  ) : (
                    <span className="flex-1 text-xs font-semibold text-zinc-500">
                      {order.status === "concluido"
                        ? "Pedido finalizado ✓"
                        : "Pedido cancelado"}
                    </span>
                  )}

                  {role !== "cozinha" && (
                    <button
                      onClick={() => togglePaid(order)}
                      disabled={busy}
                      className={`btn !py-2 text-xs ${
                        isPaid ? "btn-ghost" : "btn-light"
                      }`}
                      title={isPaid ? "Marcar como a receber" : "Marcar como pago"}
                    >
                      <DollarSign size={13} />
                      {isPaid ? "Pago ✓" : "Receber"}
                    </button>
                  )}

                  <Link
                    href={`/pedido/${order.code}`}
                    target="_blank"
                    className="btn btn-ghost !py-2 text-xs"
                    title="Abrir tela do cliente"
                  >
                    Rastreio
                  </Link>

                  {order.status !== "concluido" &&
                    order.status !== "cancelado" && (
                      <button
                        onClick={() => setStatus(order, "cancelado")}
                        disabled={busy}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-500 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                        aria-label="Cancelar pedido"
                        title="Cancelar pedido"
                      >
                        <X size={15} />
                      </button>
                    )}

                  {(order.status === "concluido" ||
                    order.status === "cancelado") && (
                    <button
                      onClick={() => setStatus(order, "novo")}
                      disabled={busy}
                      className="btn btn-ghost !py-2 text-xs"
                    >
                      Reabrir
                    </button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`card p-4 ${
        accent
          ? "border-rose-500/30 bg-[rgba(225,29,72,0.08)]"
          : "bg-white/[0.035]"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p
        className={`mt-1 text-xl font-black tracking-tight num ${
          accent ? "text-rose-400" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
