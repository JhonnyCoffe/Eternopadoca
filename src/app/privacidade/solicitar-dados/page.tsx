"use client";

import { useState } from "react";
import Link from "next/link";

type RequestType = "access" | "deletion" | "rectification";

const TYPE_LABELS: Record<RequestType, string> = {
  access: "Acesso aos meus dados",
  deletion: "Exclusão dos meus dados",
  rectification: "Correção dos meus dados",
};

export default function SolicitarDados() {
  const [type, setType] = useState<RequestType>("access");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/data-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name,
          email: email || undefined,
          phone: phone || undefined,
          orderCode: orderCode || undefined,
          message: message || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus("error");
        setMsg(data.error ?? "Não foi possível enviar a solicitação.");
        return;
      }
      setStatus("ok");
      setMsg("Solicitação enviada com sucesso. Entraremos em contato em até 15 dias.");
      setName("");
      setEmail("");
      setPhone("");
      setOrderCode("");
      setMessage("");
    } catch {
      setStatus("error");
      setMsg("Falha de conexão. Tente novamente.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="max-w-lg mx-auto px-6 py-12 text-zinc-900 dark:text-zinc-100">
      <div className="mb-8">
        <Link href="/privacidade" className="text-xs text-zinc-500 hover:underline">
          ← Voltar à Política de Privacidade
        </Link>
        <h1 className="text-2xl font-bold mt-2">Solicitar acesso ou exclusão de dados</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Conforme a LGPD, você pode solicitar acesso, correção ou exclusão dos
          seus dados pessoais. Responderemos em até 15 dias.
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4 rounded-xl border border-white/[0.08] bg-[#0e0e13] p-6 shadow-lg">
        <div className="space-y-2">
          <label className="block text-xs font-bold text-zinc-400">Tipo de solicitação</label>
          <div className="grid gap-1 sm:grid-cols-3">
            {(Object.keys(TYPE_LABELS) as RequestType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                  type === t
                    ? "border-[var(--brand)] bg-[var(--brand)]/15 text-white"
                    : "border-white/10 bg-white/[0.04] text-zinc-300"
                }`}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-zinc-400">
            Nome completo
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
            />
          </label>

          <label className="block text-xs font-bold text-zinc-400">
            E-mail
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="seu@email.com"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
            />
          </label>

          <label className="block text-xs font-bold text-zinc-400">
            WhatsApp
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              inputMode="tel"
              placeholder="(11) 99999-9999"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
            />
          </label>

          <label className="block text-xs font-bold text-zinc-400">
            Código do pedido (opcional)
            <input
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Ex: NQ44"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)]"
            />
          </label>

          <label className="block text-xs font-bold text-zinc-400">
            Mensagem adicional
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Detalhes da sua solicitação"
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-[var(--brand)] resize-none"
            />
          </label>
        </div>

        {msg && (
          <p
            className={`rounded-xl px-3 py-2 text-xs font-bold ${
              status === "ok"
                ? "bg-emerald-500/10 text-emerald-300"
                : "bg-red-500/10 text-red-300"
            }`}
          >
            {msg}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-60"
        >
          {sending ? "Enviando…" : "Enviar solicitação"}
        </button>
      </form>

      <p className="mt-6 text-xs text-zinc-600 dark:text-zinc-400">
        Canal direto: contato@padocaeterno.com.br · (11) 99999-9999
      </p>
    </main>
  );
}
