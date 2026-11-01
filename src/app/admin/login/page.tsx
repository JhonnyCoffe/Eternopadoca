import { redirect } from "next/navigation";
import Link from "next/link";
import { Lock, UtensilsCrossed, User } from "lucide-react";
import { getSession } from "@/lib/auth";
import { ROLE_HOME } from "@/lib/types";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(ROLE_HOME[session.role] ?? "/admin");
  }

  const { erro } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08080a] px-4">
      {/* Background radial glow */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-rose-600/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-rose-950/20 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] text-white shadow-xl shadow-rose-900/30 ring-1 ring-white/10">
            <UtensilsCrossed size={26} />
          </span>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-white">
            Painel da equipe
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Acesso para donos, atendentes, cozinha e entregadores.
          </p>
        </div>

        <form
          action={loginAction}
          className="rounded-3xl border border-white/10 bg-[#0e0e13]/80 p-6 shadow-2xl backdrop-blur-xl space-y-4"
        >
          {erro && (
            <p className="rounded-xl bg-rose-500/15 p-3 text-xs font-semibold text-rose-300">
              Usuário ou senha incorretos. Tente novamente.
            </p>
          )}

          <label className="block">
            <span className="label">Usuário</span>
            <div className="relative">
              <User
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                name="username"
                type="text"
                autoFocus
                defaultValue="admin"
                placeholder="ex: admin ou joao.cozinha"
                className="input !pl-10"
              />
            </div>
          </label>

          <label className="block">
            <span className="label">Senha de acesso</span>
            <div className="relative">
              <Lock
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input !pl-10"
              />
            </div>
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full !py-3 text-sm font-black"
          >
            Entrar no sistema
          </button>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center text-[11px] leading-relaxed text-zinc-400">
            Acesso principal: <strong className="text-zinc-200">admin</strong> /{" "}
            <span className="text-rose-300">senha configurada no ambiente</span>
          </div>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-xs font-semibold text-zinc-500 transition hover:text-zinc-200"
        >
          ← Voltar para o cardápio
        </Link>
      </div>
    </div>
  );
}
