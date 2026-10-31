"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Loader2,
  MapPin,
  Palette,
  Save,
  ShoppingBag,
} from "lucide-react";
import type { Settings, Weekday } from "@/lib/types";
import { WEEKDAY_LABEL } from "@/lib/types";
import { saveSettings } from "@/app/admin/actions";

const DAYS: Weekday[] = ["0", "1", "2", "3", "4", "5", "6"];

export default function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(settings.isOpen);
  const [autoHours, setAutoHours] = useState(Boolean(settings.autoHours));

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await saveSettings(new FormData(e.currentTarget));
    setSaving(false);
    if (result.ok) {
      setMessage({ kind: "ok", text: "Configurações salvas com sucesso!" });
      router.refresh();
      setTimeout(() => setMessage(null), 4000);
    } else {
      setMessage({ kind: "error", text: result.error });
    }
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Configurações da loja
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Personalize a loja, horários semanais, taxas e regras de pedido.
        </p>
      </div>

      {/* STATUS MANUAL */}
      <section className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.035] p-4">
        <div>
          <p className="text-sm font-extrabold text-zinc-100">
            Status da loja: {isOpen ? "Aberta" : "Fechada"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {isOpen
              ? "Os clientes podem fazer pedidos normalmente."
              : "O cardápio fica visível para consulta, mas pedidos ficam travados."}
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            name="isOpen"
            checked={isOpen}
            onChange={(e) => setIsOpen(e.target.checked)}
            className="peer sr-only"
          />
          <span className="h-7 w-12 rounded-full bg-white/20 transition peer-checked:bg-emerald-500" />
          <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
        </label>
      </section>

      {/* GESTÃO DE HORÁRIOS */}
      <Section
        title="Horários de funcionamento por dia"
        icon={<Clock size={16} />}
      >
        <div className="flex items-center justify-between rounded-xl bg-white/[0.03] p-3 text-xs">
          <div>
            <p className="font-bold text-white">Abertura e fechamento automático</p>
            <p className="text-zinc-400">
              Abre e fecha a loja sozinho de acordo com a programação dos dias abaixo.
            </p>
          </div>
          <input
            type="checkbox"
            name="autoHours"
            checked={autoHours}
            onChange={(e) => setAutoHours(e.target.checked)}
            className="h-4 w-4 accent-rose-500"
          />
        </div>

        <div className="divide-y divide-white/[0.06] pt-1">
          {DAYS.map((day) => {
            const current = settings.hours?.[day] ?? {
              closed: false,
              open: "18:00",
              close: "23:30",
            };
            return (
              <div
                key={day}
                className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-xs"
              >
                <span className="w-32 font-bold text-zinc-200">
                  {WEEKDAY_LABEL[day]}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-zinc-400">
                    <input
                      type="checkbox"
                      name={`hours-${day}-closed`}
                      defaultChecked={current.closed}
                      className="h-4 w-4 accent-rose-500"
                    />
                    <span>Fechado</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="time"
                      name={`hours-${day}-open`}
                      defaultValue={current.open}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-white outline-none focus:border-rose-500"
                    />
                    <span className="text-zinc-500">às</span>
                    <input
                      type="time"
                      name={`hours-${day}-close`}
                      defaultValue={current.close}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-white outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* IDENTIDADE */}
      <Section title="Identidade da loja" icon={<Palette size={16} />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nome da loja">
            <input
              name="storeName"
              defaultValue={settings.storeName}
              required
              className="input"
            />
          </Field>
          <Field label="Cor de destaque (Hex)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="primaryColor"
                defaultValue={settings.primaryColor || "#e11d48"}
                className="h-10 w-14 cursor-pointer rounded-lg border border-white/10 bg-white/[0.035] p-1"
              />
              <span className="text-xs text-zinc-400">
                Padrão escuro com vermelho/rose ({settings.primaryColor || "#e11d48"}).
              </span>
            </div>
          </Field>
        </div>
        <Field label="Frase de apresentação">
          <input
            name="tagline"
            defaultValue={settings.tagline}
            className="input"
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="URL do logo (opcional)">
            <input
              name="logoUrl"
              defaultValue={settings.logoUrl}
              placeholder="https://..."
              className="input"
            />
          </Field>
          <Field label="URL da imagem de capa">
            <input
              name="heroImage"
              defaultValue={settings.heroImage}
              placeholder="https://..."
              className="input"
            />
          </Field>
        </div>
      </Section>

      {/* CONTATO */}
      <Section title="Contato e endereço" icon={<MapPin size={16} />}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="WhatsApp da loja (DDI + DDD)">
            <input
              name="whatsapp"
              defaultValue={settings.whatsapp}
              placeholder="5511999999999"
              className="input"
            />
          </Field>
          <Field label="Instagram">
            <input
              name="instagram"
              defaultValue={settings.instagram}
              placeholder="@sualoja"
              className="input"
            />
          </Field>
        </div>
        <Field label="Endereço físico">
          <input
            name="address"
            defaultValue={settings.address}
            className="input"
          />
        </Field>
      </Section>

      {/* REGRAS */}
      <Section title="Regras de pedido e entrega" icon={<ShoppingBag size={16} />}>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Taxa padrão de entrega (R$)">
            <input
              name="deliveryFee"
              defaultValue={String(settings.deliveryFee).replace(".", ",")}
              inputMode="decimal"
              className="input"
            />
          </Field>
          <Field label="Pedido mínimo (R$)">
            <input
              name="minOrder"
              defaultValue={String(settings.minOrder).replace(".", ",")}
              inputMode="decimal"
              className="input"
            />
          </Field>
          <Field label="Tempo médio de entrega">
            <input
              name="avgDeliveryTime"
              defaultValue={settings.avgDeliveryTime}
              placeholder="30–45 min"
              className="input"
            />
          </Field>
        </div>
        <Field label="Chave Pix da loja">
          <input
            name="pixKey"
            defaultValue={settings.pixKey}
            placeholder="CNPJ, celular, e-mail ou aleatória"
            className="input"
          />
        </Field>
      </Section>

      {message && (
        <p
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold ${
            message.kind === "ok"
              ? "bg-emerald-500/10 text-emerald-300"
              : "bg-rose-500/10 text-rose-300"
          }`}
        >
          {message.kind === "ok" && <CheckCircle2 size={16} />}
          {message.text}
        </p>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <button
          disabled={saving}
          className="btn btn-primary !px-6 !py-3 text-sm shadow-xl"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Save size={16} />
          )}
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5 space-y-4">
      <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
        {icon && <span className="text-rose-400">{icon}</span>}
        <h2 className="text-sm font-extrabold text-zinc-100">{title}</h2>
      </div>
      {children}
    </section>
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
      <span className="label">{label}</span>
      {children}
    </label>
  );
}
