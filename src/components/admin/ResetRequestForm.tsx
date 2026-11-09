"use client";

import { useState } from "react";

export default function ResetRequestForm() {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok"; url?: string }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/auth/reset-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setStatus({ kind: "error", message: data.error ?? "Falha ao solicitar." });
        return;
      }
      setStatus({ kind: "ok", url: data.resetUrl });
    } catch {
      setStatus({ kind: "error", message: "Falha ao solicitar." });
    }
  }

  return (
    <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-[11px] text-zinc-400">
      <p className="mb-2 font-bold text-zinc-300">Esqueceu a senha?</p>
      <form onSubmit={submit} className="space-y-2">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Usuário"
          className="input !h-9 !text-xs"
        />
        <button
          type="submit"
          disabled={status.kind === "loading"}
          className="btn btn-ghost w-full !py-2 text-xs disabled:opacity-50"
        >
          {status.kind === "loading" ? "Gerando..." : "Gerar link de redefinição"}
        </button>
      </form>
      {status.kind === "ok" && (
        <p className="mt-2 break-all text-emerald-300">
          {status.url ? (
            <a href={status.url} className="underline">
              Abrir link de redefinição
            </a>
          ) : (
            "Se o usuário existir, o link foi gerado."
          )}
        </p>
      )}
      {status.kind === "error" && (
        <p className="mt-2 text-rose-300">{status.message}</p>
      )}
    </div>
  );
}