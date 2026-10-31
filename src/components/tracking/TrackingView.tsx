"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  ExternalLink,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type { Order, OrderStatus, Settings } from "@/lib/types";
import { ORDER_STATUS_LABEL, PAYMENT_LABEL } from "@/lib/types";
import { brl, formatDate, onlyDigits } from "@/lib/format";
import { mapsSearchUrl } from "@/lib/orders";
import OrderChat from "@/components/chat/OrderChat";

const STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "novo", label: "Recebido", desc: "Aguardando confirmação da loja" },
  { status: "preparando", label: "Na chapa", desc: "Seus itens estão sendo preparados" },
  { status: "pronto", label: "Pronto", desc: "Aguardando retirada ou entregador" },
  { status: "saiu", label: "A caminho", desc: "Entregador saiu com seu pedido" },
  { status: "concluido", label: "Entregue", desc: "Bom apetite!" },
];

function stepIndex(status: OrderStatus) {
  const i = STEPS.findIndex((s) => s.status === status);
  return i < 0 ? 0 : i;
}

export default function TrackingView({
  order: initialOrder,
  settings,
}: {
  order: Order;
  settings: Settings;
}) {
  const router = useRouter();
  const [order] = useState<Order>(initialOrder);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(id);
  }, [router]);

  const currentStep = stepIndex(order.status);
  const isCanceled = order.status === "cancelado";
  const isDelivery = order.type === "delivery";
  const wa = onlyDigits(settings.whatsapp);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0c0c10]/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-white"
          >
            <ArrowLeft size={16} /> Cardápio
          </Link>
          <span className="text-xs font-bold text-zinc-400">
            {settings.storeName}
          </span>
          <button
            onClick={() => router.refresh()}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:text-white"
            aria-label="Atualizar status"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-xl p-4 pb-24 space-y-4">
        {/* CARD PRINCIPAL */}
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Acompanhamento do pedido
              </span>
              <h1 className="mt-0.5 text-2xl font-black text-white">
                #{order.code}
              </h1>
              <p className="text-xs text-zinc-400">
                Feito em {formatDate(order.createdAt)}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${
                isCanceled
                  ? "bg-red-500/20 text-red-300"
                  : order.status === "concluido"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-[var(--brand)]/20 text-[var(--brand-soft)]"
              }`}
            >
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>

          {/* PROGRESSO */}
          {!isCanceled && (
            <div className="pt-2">
              <div className="space-y-4">
                {STEPS.map((s, idx) => {
                  const done = idx < currentStep;
                  const current = idx === currentStep;
                  return (
                    <div key={s.status} className="flex items-start gap-3">
                      <div className="relative flex flex-col items-center">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                            done
                              ? "bg-emerald-500 text-white"
                              : current
                              ? "bg-[var(--brand)] text-white shadow-lg shadow-[#e11d48]/40 ring-4 ring-rose-500/20"
                              : "border border-white/10 bg-white/[0.04] text-zinc-500"
                          }`}
                        >
                          {done ? <CheckCircle2 size={16} /> : idx + 1}
                        </span>
                        {idx < STEPS.length - 1 && (
                          <span
                            className={`h-8 w-[2px] transition ${
                              done ? "bg-emerald-500" : "bg-white/10"
                            }`}
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <p
                          className={`text-sm font-bold ${
                            current
                              ? "text-white"
                              : done
                              ? "text-zinc-200"
                              : "text-zinc-500"
                          }`}
                        >
                          {s.label}
                        </p>
                        <p className="text-xs text-zinc-500">{s.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {isCanceled && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-300">
              Este pedido foi cancelado pela loja ou a seu pedido. Se precisar de
              ajuda, fale pelo chat abaixo ou chame no WhatsApp.
            </div>
          )}

          {/* MOTORISTA */}
          {order.driverName && order.status === "saiu" && (
            <div className="flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-sky-500/10 p-3.5 text-xs text-sky-200">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500 text-white">
                <Bike size={18} />
              </span>
              <div>
                <p className="font-extrabold text-white">
                  {order.driverName} está a caminho
                </p>
                <p className="text-[11px] text-sky-300">
                  Fique atento ao interfone ou ao celular!
                </p>
              </div>
            </div>
          )}

          {/* AÇÕES */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setChatOpen((v) => !v)}
              className="btn btn-primary flex-1 !py-3 text-xs"
            >
              <MessageCircle size={15} />
              {chatOpen ? "Ocultar chat" : "Falar com a loja (chat)"}
            </button>
            <a
              href={`https://wa.me/${wa}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost !py-3 text-xs"
            >
              <Phone size={14} /> WhatsApp
            </a>
          </div>

          {chatOpen && (
            <div className="pt-2">
              <OrderChat orderId={order.id} mode="cliente" height="h-72" />
            </div>
          )}
        </div>

        {/* DETALHES DO PEDIDO */}
        <div className="card p-5 space-y-3">
          <h2 className="text-sm font-extrabold text-white">Resumo dos itens</h2>

          <ul className="divide-y divide-white/[0.06]">
            {order.items.map((it) => (
              <li
                key={it.productId}
                className="flex items-center justify-between py-2 text-xs"
              >
                <div>
                  <span className="font-bold text-white">
                    {it.qty}x {it.name}
                  </span>
                  {it.notes && (
                    <p className="text-[11px] text-zinc-500">↳ {it.notes}</p>
                  )}
                </div>
                <span className="font-bold text-zinc-200 num">
                  {brl(it.price * it.qty)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/[0.06] pt-3 text-xs space-y-1">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal</span>
              <span className="num">{brl(order.subtotal)}</span>
            </div>
            {isDelivery && (
              <div className="flex justify-between text-zinc-400">
                <span>Entrega ({order.zoneName ?? "padrão"})</span>
                <span className="num">{brl(order.deliveryFee)}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 text-sm font-black text-white">
              <span>Total</span>
              <span className="num">{brl(order.total)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-3 text-xs text-zinc-400 space-y-1">
            <p>
              <strong className="text-zinc-200">Pagamento:</strong>{" "}
              {PAYMENT_LABEL[order.payment]} (
              {order.paymentStatus === "pago" ? "pago" : "a pagar na entrega/retirada"}
              )
            </p>
            {isDelivery && order.address && (
              <p className="flex items-start gap-1 text-zinc-300 pt-1">
                <MapPin size={13} className="mt-0.5 shrink-0 text-rose-400" />
                <span className="flex-1">{order.address}</span>
                <a
                  href={mapsSearchUrl(order.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-rose-400 hover:underline"
                >
                  <ExternalLink size={12} />
                </a>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
