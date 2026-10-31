"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import type { ChatMessage } from "@/lib/types";

function timeLabel(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export default function OrderChat({
  orderId,
  mode,
  initialMessages = [],
  height = "h-80",
}: {
  orderId: string;
  /** "loja" quando quem está usando é o restaurante. */
  mode: "loja" | "cliente";
  initialMessages?: ChatMessage[];
  height?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/${orderId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { ok: boolean; messages: ChatMessage[] };
      if (data.ok) setMessages(data.messages);
    } catch {
      /* sem conexão: tenta de novo no próximo ciclo */
    }
  }, [orderId]);

  useEffect(() => {
    const timer = setInterval(() => void load(), 4000);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const value = text.trim();
    if (!value || sending) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/chat/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Não foi possível enviar.");
        return;
      }
      setText("");
      await load();
    } catch {
      setError("Falha de conexão. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/25">
      <div className="flex items-center gap-2 border-b border-white/10 px-3.5 py-2.5">
        <MessageCircle size={14} className="text-[var(--brand-soft)]" />
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
          Conversa do pedido
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          online
        </span>
      </div>

      <div
        ref={listRef}
        className={`${height} space-y-2 overflow-y-auto px-3.5 py-3`}
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <MessageCircle size={22} className="text-zinc-600" />
            <p className="mt-2 text-xs font-semibold text-zinc-400">
              Nenhuma mensagem ainda
            </p>
            <p className="mt-0.5 max-w-[220px] text-[11px] text-zinc-600">
              {mode === "loja"
                ? "Fale com o cliente sobre este pedido."
                : "Fale direto com a loja, sem sair do app."}
            </p>
          </div>
        )}

        {messages.map((message) => {
          const mine = message.from === mode;
          return (
            <div
              key={message.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${
                  mine
                    ? "rounded-br-md bg-[var(--brand)] text-white"
                    : "rounded-bl-md border border-white/10 bg-white/[0.06] text-zinc-100"
                }`}
              >
                {!mine && (
                  <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-60">
                    {message.author}
                  </p>
                )}
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <p
                  className={`mt-0.5 text-right text-[9px] font-medium ${
                    mine ? "text-white/60" : "text-zinc-500"
                  }`}
                >
                  {timeLabel(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <form
        onSubmit={send}
        className="flex items-center gap-2 border-t border-white/10 p-2.5"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            mode === "loja" ? "Responder ao cliente..." : "Escreva para a loja..."
          }
          maxLength={1000}
          className="input !rounded-full !py-2 !text-[13px]"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--brand)] text-white transition hover:brightness-110 disabled:opacity-40"
          aria-label="Enviar mensagem"
        >
          {sending ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Send size={15} />
          )}
        </button>
      </form>

      {error && (
        <p className="border-t border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[11px] font-semibold text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
