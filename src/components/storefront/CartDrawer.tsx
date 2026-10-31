"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  CreditCard,
  Loader2,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-react";
import type { Order, OrderType, PaymentMethod, Product, Settings } from "@/lib/types";
import { brl, formatPhone, onlyDigits } from "@/lib/format";

export type CartLine = { product: Product; qty: number };

type Props = {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  subtotal: number;
  settings: Settings;
  onAdd: (p: Product) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

type Step = "cart" | "checkout" | "success";

export default function CartDrawer({
  open,
  onClose,
  lines,
  subtotal,
  settings,
  onAdd,
  onDec,
  onRemove,
  onClear,
}: Props) {
  const [step, setStep] = useState<Step>("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState<OrderType>("delivery");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("pix");
  const [zoneId, setZoneId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{ order: Order; whatsappUrl: string } | null>(
    null,
  );

  const activeZones = (settings.deliveryZones ?? []).filter((z) => z.active);
  const selectedZone = activeZones.find((z) => z.id === zoneId);
  const deliveryFee =
    type === "delivery"
      ? selectedZone
        ? selectedZone.fee
        : settings.deliveryFee
      : 0;
  const total = subtotal + deliveryFee;
  const count = lines.reduce((a, l) => a + l.qty, 0);

  const canSubmit = useMemo(() => {
    if (!settings.isOpen) return false;
    if (name.trim().length < 2) return false;
    if (onlyDigits(phone).length < 10) return false;
    if (type === "delivery" && address.trim().length < 8) return false;
    if (subtotal < settings.minOrder) return false;
    return lines.length > 0;
  }, [name, phone, type, address, subtotal, settings, lines.length]);

  const resetAll = () => {
    setStep("cart");
    setPlaced(null);
    setError("");
    setNotes("");
    onClear();
    onClose();
  };

  async function submit() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
          customerName: name.trim(),
          customerPhone: phone,
          type,
          address: address.trim(),
          payment,
          notes: notes.trim(),
          zoneId: type === "delivery" && zoneId ? zoneId : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Não foi possível enviar seu pedido. Tente novamente.");
      } else {
        setPlaced({ order: data.order, whatsappUrl: data.whatsappUrl });
        setStep("success");
        onClear();
      }
    } catch {
      setError("Falha de conexão. Verifique sua internet e tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 animate-fade-in bg-stone-950/45 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-md animate-slide-in-right flex-col border-l border-white/10 bg-[#0c0c0f] shadow-2xl">
        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-white/[0.06] px-5 py-4">
          {step === "checkout" && (
            <button
              onClick={() => setStep("cart")}
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06]"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <h2 className="flex-1 text-base font-extrabold tracking-tight">
            {step === "cart" && `Seu carrinho${count ? ` · ${count}` : ""}`}
            {step === "checkout" && "Finalizar pedido"}
            {step === "success" && "Pedido enviado!"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>

        {step === "cart" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {lines.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.06] text-zinc-500">
                    <ShoppingBag size={26} />
                  </span>
                  <p className="mt-4 font-bold text-zinc-200">
                    Seu carrinho está vazio
                  </p>
                  <p className="mt-1 max-w-[240px] text-sm text-zinc-400">
                    Adicione itens do cardápio para começar seu pedido.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-zinc-900"
                  >
                    Ver cardápio
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map(({ product, qty }) => (
                    <li
                      key={product.id}
                      className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                      />
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start gap-2">
                          <p className="flex-1 truncate text-sm font-bold text-zinc-100">
                            {product.name}
                          </p>
                          <button
                            onClick={() => onRemove(product.id)}
                            className="text-zinc-500 transition hover:text-red-400"
                            aria-label="Remover item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-400">
                          {brl(product.price)} cada
                        </p>
                        <div className="mt-auto flex items-center justify-between pt-1.5">
                          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-0.5">
                            <button
                              onClick={() => onDec(product.id)}
                              className="flex h-6 w-6 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-5 text-center text-xs font-black">
                              {qty}
                            </span>
                            <button
                              onClick={() => onAdd(product)}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-zinc-900"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-extrabold">
                            {brl(product.price * qty)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {lines.length > 0 && (
              <div className="border-t border-white/[0.06] px-5 py-4">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="font-bold">{brl(subtotal)}</span>
                </div>
                <div className="mb-3 flex items-center justify-between text-xs text-zinc-500">
                  <span>Entrega calculada no próximo passo</span>
                </div>
                {subtotal < settings.minOrder && (
                  <p className="mb-2 rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                    Pedido mínimo de {brl(settings.minOrder)}. Faltam{" "}
                    {brl(settings.minOrder - subtotal)}.
                  </p>
                )}
                {!settings.isOpen && (
                  <p className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-[11px] font-semibold text-red-700">
                    A loja está fechada. Não é possível enviar pedidos agora.
                  </p>
                )}
                <button
                  disabled={subtotal < settings.minOrder || !settings.isOpen}
                  onClick={() => setStep("checkout")}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continuar · {brl(subtotal)}
                </button>
              </div>
            )}
          </>
        )}

        {step === "checkout" && (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Como você quer receber?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <TypeButton
                    active={type === "delivery"}
                    onClick={() => setType("delivery")}
                    icon={<Bike size={17} />}
                    title="Entrega"
                    subtitle={brl(settings.deliveryFee)}
                  />
                  <TypeButton
                    active={type === "retirada"}
                    onClick={() => setType("retirada")}
                    icon={<Store size={17} />}
                    title="Retirada"
                    subtitle="Grátis"
                  />
                </div>
              </div>

              <Field label="Seu nome">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="input"
                />
              </Field>

              <Field label="WhatsApp">
                <input
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  inputMode="tel"
                  placeholder="(11) 99999-9999"
                  className="input"
                />
              </Field>

              {type === "delivery" && activeZones.length > 0 && (
                <Field label="Bairro / Região de entrega">
                  <select
                    value={zoneId}
                    onChange={(e) => setZoneId(e.target.value)}
                    className="input"
                  >
                    <option value="">Taxa padrão ({brl(settings.deliveryFee)})</option>
                    {activeZones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {brl(z.fee)}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {type === "delivery" && (
                <Field label="Endereço de entrega">
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder="Rua, número, complemento e bairro"
                    className="input resize-none"
                  />
                </Field>
              )}

              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Forma de pagamento
                </p>
                <div className="space-y-2">
                  {(
                    [
                      ["pix", "Pix", "Chave enviada pelo WhatsApp"],
                      ["cartao", "Cartão na entrega", "Débito ou crédito na maquininha física"],
                      ["vr", "Vale-refeição / VR na entrega", "Maquininha física enviada com o entregador"],
                      ["dinheiro", "Dinheiro", "Informe o troco nas observações"],
                    ] as [PaymentMethod, string, string][]
                  ).map(([value, label, hint]) => (
                    <button
                      key={value}
                      onClick={() => setPayment(value)}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                        payment === value
                          ? "border-[var(--brand)] bg-[rgba(225,29,72,0.12)] ring-1 ring-[var(--brand)]"
                          : "border-white/10 hover:border-white/15"
                      }`}
                    >
                      <CreditCard
                        size={17}
                        className={
                          payment === value ? "text-[var(--brand)]" : "text-zinc-500"
                        }
                      />
                      <span className="flex-1">
                        <span className="block text-sm font-bold text-zinc-100">
                          {label}
                        </span>
                        <span className="block text-[11px] text-zinc-400">
                          {hint}
                        </span>
                      </span>
                      <span
                        className={`h-4 w-4 rounded-full border-2 ${
                          payment === value
                            ? "border-[var(--brand)] bg-[var(--brand)]"
                            : "border-white/15"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Observações (opcional)">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Ponto da carne, troco, sem cebola..."
                  className="input resize-none"
                />
              </Field>

              <div className="rounded-2xl bg-white/[0.03] p-4">
                <SummaryRow label="Subtotal" value={brl(subtotal)} />
                {type === "delivery" && (
                  <SummaryRow
                    label={`Entrega ${selectedZone ? `(${selectedZone.name})` : ""}`}
                    value={brl(deliveryFee)}
                  />
                )}
                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2 text-base">
                  <span className="font-bold text-white">Total</span>
                  <span className="font-black text-white">{brl(total)}</span>
                </div>
              </div>

              {error && (
                <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="border-t border-white/[0.06] px-5 py-4">
              <button
                onClick={submit}
                disabled={!canSubmit || loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Enviando...
                  </>
                ) : (
                  <>
                    <Send size={16} /> Enviar pedido · {brl(total)}
                  </>
                )}
              </button>
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                Você confirma o pedido no WhatsApp do restaurante.
              </p>
            </div>
          </>
        )}

        {step === "success" && placed && (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-8 text-center">
            <span className="flex h-20 w-20 animate-pop items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={42} />
            </span>
            <h3 className="mt-5 text-xl font-black tracking-tight">
              Pedido #{placed.order.code}
            </h3>
            <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-zinc-400">
              Registramos seu pedido no valor de{" "}
              <strong className="text-zinc-100">{brl(placed.order.total)}</strong>.
              Agora envie a mensagem no WhatsApp para o restaurante confirmar.
            </p>

            <a
              href={placed.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <Send size={16} /> Abrir WhatsApp e enviar
            </a>
            <a
              href={`/pedido/${placed.order.code}`}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110"
            >
              Acompanhar pedido e abrir chat →
            </a>
            <button
              onClick={resetAll}
              className="mt-2.5 w-full rounded-full border border-white/10 px-5 py-3 text-sm font-bold text-zinc-300 transition hover:bg-white/[0.05]"
            >
              Fazer novo pedido
            </button>

            <div className="mt-6 w-full rounded-2xl bg-white/[0.03] p-4 text-left">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Resumo
              </p>
              {placed.order.items.map((it) => (
                <p
                  key={it.productId}
                  className="flex justify-between gap-3 text-xs text-zinc-300"
                >
                  <span className="truncate">
                    {it.qty}x {it.name}
                  </span>
                  <span className="shrink-0 font-semibold">
                    {brl(it.price * it.qty)}
                  </span>
                </p>
              ))}
              <p className="mt-2 flex justify-between border-t border-white/10 pt-2 text-xs font-black text-zinc-100">
                <span>Total</span>
                <span>{brl(placed.order.total)}</span>
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function TypeButton({
  active,
  onClick,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-xl border px-3 py-3 text-left transition ${
        active
          ? "border-[var(--brand)] bg-[rgba(225,29,72,0.12)] ring-1 ring-[var(--brand)]"
          : "border-white/10 hover:border-white/15"
      }`}
    >
      <span className={active ? "text-[var(--brand)]" : "text-zinc-500"}>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-bold text-zinc-100">{title}</span>
        <span className="block text-[11px] text-zinc-400">{subtitle}</span>
      </span>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex items-center justify-between text-sm text-zinc-300">
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}
