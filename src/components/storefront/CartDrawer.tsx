"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, ShoppingBag, Bike, Store } from "lucide-react";
import type { OrderType, PaymentMethod, Settings } from "@/lib/types";
import { brl } from "@/lib/format";
import { productImage } from "@/lib/image";

type Props = {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  subtotal: number;
  settings: Settings;
  onAdd: (id: string) => void;
  onDec: (id: string) => void;
  onClear: () => void;
};

export type CartLine = {
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
  qty: number;
  size?: string;
  flavor?: string;
  unitPrice?: number;
};

const PAYMENTS: { value: PaymentMethod; label: string }[] = [
  { value: "pix", label: "Pix" },
  { value: "cartao", label: "Cartão na entrega" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "vr", label: "Vale refeição" },
];

export default function CartDrawer({
  open,
  onClose,
  lines,
  subtotal,
  settings,
  onAdd,
  onDec,
  onClear,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState<"cart" | "checkout">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<OrderType>("delivery");
  const [address, setAddress] = useState("");
  const [zoneId, setZoneId] = useState(settings.deliveryZones?.[0]?.id ?? "");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  if (!open) return null;

  const zones = settings.deliveryZones ?? [];
  const zone = zones.find((z) => z.id === zoneId);
  const deliveryFee =
    type === "delivery" ? (zone?.fee ?? settings.deliveryFee ?? 0) : 0;
  const total = subtotal + deliveryFee;

  const close = () => {
    setStep("cart");
    setError(null);
    onClose();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setError(null);
    setSending(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({
              productId: l.product.id,
              qty: l.qty,
              size: l.size,
              flavor: l.flavor,
            })),
          customerName: name,
          customerPhone: phone,
          type,
          address: type === "delivery" ? address : undefined,
          payment,
          notes,
          zoneId: type === "delivery" ? zoneId || undefined : undefined,
          termsAccepted,
          marketingConsent,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        order?: { code: string };
      };
      if (!res.ok || !data.ok || !data.order) {
        setError(data.error ?? "Não foi possível enviar o pedido.");
        setSending(false);
        return;
      }
      onClear();
      setStep("cart");
      router.push(`/pedido/${data.order.code}`);
    } catch {
      setError("Falha de conexão. Tente novamente.");
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="max-h-[92vh] w-full max-w-lg animate-slide-up overflow-y-auto rounded-t-3xl border border-white/10 bg-[#0e0e13] p-5 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-black tracking-tight text-white">
            {step === "cart" ? "Carrinho" : "Finalizar pedido"}
          </h2>
          <button
            type="button"
            onClick={close}
            aria-label="Fechar carrinho"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-white/[0.06]"
          >
            <X size={18} />
          </button>
        </div>

        {step === "cart" ? (
          <>
            <div className="space-y-3">
              {lines.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-3xl">🛒</p>
                  <p className="mt-2 font-bold text-zinc-200">Carrinho vazio</p>
                </div>
              ) : (
                lines.map((line) => (
                  <div
                    key={line.product.id}
                    className="flex items-center gap-3 border-b border-white/[0.06] py-3"
                  >
                    <Image
                      src={productImage(line.product.imageUrl)}
                      alt={line.product.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-xl bg-white/[0.06] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-zinc-100">
                        {line.product.name}
                      </h4>
                      {line.size || line.flavor ? (
                        <p className="text-[11px] text-zinc-400 font-medium">
                          {[line.size && `Tamanho: ${line.size}`].filter(Boolean).join(" · ")}
                          {[line.flavor && `Sabor: ${line.flavor}`].filter(Boolean).join(" · ")}
                        </p>
                      ) : null}
                      <p className="text-[12px] text-zinc-500">
                        {brl(line.unitPrice ?? line.product.price)} × {line.qty}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onDec(line.product.id)}
                        aria-label="Remover um"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-zinc-200 transition hover:text-white"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-xs font-black">
                        {line.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onAdd(line.product.id)}
                        aria-label="Adicionar um"
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white shadow-sm transition hover:brightness-110"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {lines.length > 0 && (
              <div className="mt-4 space-y-3 border-t border-white/[0.06] pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-black text-white">{brl(subtotal)}</span>
                </div>
                <p className="text-xs font-semibold text-zinc-500">
                  {lines.reduce((a, l) => a + l.qty, 0)} item(ns) · mínimo{" "}
                  {brl(settings.minOrder)}
                </p>

                <button
                  type="button"
                  onClick={onClear}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold text-zinc-300 transition hover:bg-white/15 hover:text-white"
                >
                  Limpar carrinho
                </button>

                <button
                  type="button"
                  onClick={() => setStep("checkout")}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/20 transition hover:brightness-110"
                >
                  <ShoppingBag size={16} />
                  Finalizar pedido · {brl(subtotal)}
                </button>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-bold text-zinc-400">
                Nome
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
                />
              </label>
              <label className="block text-xs font-bold text-zinc-400">
                WhatsApp
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("delivery")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                  type === "delivery"
                    ? "border-[var(--brand)] bg-[var(--brand)]/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-zinc-400"
                }`}
              >
                <Bike size={15} /> Entrega
              </button>
              <button
                type="button"
                onClick={() => setType("retirada")}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
                  type === "retirada"
                    ? "border-[var(--brand)] bg-[var(--brand)]/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-zinc-400"
                }`}
              >
                <Store size={15} /> Retirada
              </button>
            </div>

            {type === "delivery" && (
              <>
                <label className="block text-xs font-bold text-zinc-400">
                  Endereço
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder="Rua, número, bairro e complemento"
                    className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
                  />
                </label>
                {zones.length > 0 && (
                  <label className="block text-xs font-bold text-zinc-400">
                    Região de entrega
                    <select
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
                    >
                      {zones.map((z) => (
                        <option key={z.id} value={z.id} className="bg-[#0e0e13]">
                          {z.name} · {brl(z.fee)}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </>
            )}

            <label className="block text-xs font-bold text-zinc-400">
              Pagamento
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value as PaymentMethod)}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
              >
                {PAYMENTS.map((p) => (
                  <option key={p.value} value={p.value} className="bg-[#0e0e13]">
                    {p.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold text-zinc-400">
              Observações
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: sem cebola"
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
              />
            </label>

            <div className="space-y-1 rounded-xl bg-white/[0.04] p-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span>{brl(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Entrega</span>
                <span>{brl(deliveryFee)}</span>
              </div>
              <div className="flex justify-between font-black text-white">
                <span>Total</span>
                <span>{brl(total)}</span>
              </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-zinc-300 leading-relaxed cursor-pointer select-none group">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                required
                className="rounded border-white/30 bg-[#0e0e13] text-[var(--brand)] focus:ring-[var(--brand)]"
              />
              <span className="font-semibold">Li e aceito os </span>
              <Link
                href="/termos-de-uso"
                className="text-[var(--brand)] underline underline-offset-2 hover:text-white"
              >
                Termos de Uso
              </Link>
              <span className="text-zinc-500"> e a </span>
              <Link
                href="/privacidade"
                className="text-[var(--brand)] underline underline-offset-2 hover:text-white"
              >
                Política de Privacidade
              </Link>
            </label>

            <label className="flex items-start gap-2 text-xs text-zinc-400 leading-relaxed cursor-pointer select-none group mt-2">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(e) => setMarketingConsent(e.target.checked)}
                className="rounded border-white/30 bg-[#0e0e13] text-[var(--brand)] focus:ring-[var(--brand)]"
              />
              <span>Quero receber promoções e novidades por WhatsApp (opcional, pode cancelar a qualquer momento).</span>
            </label>

            {error && (
              <p className="rounded-xl bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/15"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
              >
                {sending ? "Enviando…" : `Confirmar pedido · ${brl(total)}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
