"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPasswordWithToken } from "../actions";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setStatus({ kind: "error", message: "As senhas não coincidem." });
      return;
    }
    setStatus({ kind: "loading" });
    const result = await resetPasswordWithToken(token, password);
    if (result.ok) setStatus({ kind: "ok" });
    else setStatus({ kind: "error", message: result.error });
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#121215] px-4">
        <p className="text-sm text-zinc-400">Link inválido.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121215] px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#0e0e13]/80 p-6 shadow-2xl backdrop-blur-xl space-y-4"
      >
        <h1 className="text-xl font-black text-white">Redefinir senha</h1>
        {status.kind === "ok" ? (
          <p className="rounded-xl bg-emerald-500/15 p-3 text-xs font-semibold text-emerald-300">
            Senha alterada. Faça login novamente.
          </p>
        ) : (
          <>
            {status.kind === "error" && (
              <p className="rounded-xl bg-rose-500/15 p-3 text-xs font-semibold text-rose-300">
                {status.message}
              </p>
            )}
            <label className="block">
              <span className="label">Nova senha</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="label">Confirmar senha</span>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="input"
              />
            </label>
            <button
              type="submit"
              disabled={status.kind === "loading"}
              className="btn btn-primary w-full !py-3 text-sm font-black disabled:opacity-50"
            >
              {status.kind === "loading" ? "Salvando..." : "Salvar nova senha"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}