"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import type { Role, User } from "@/lib/types";
import { ROLE_LABEL } from "@/lib/types";
import { deleteUser, saveUser, setUserActive } from "@/app/admin/actions";

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: "dono", label: "Dono", desc: "Acesso total a tudo, faturamento e equipe" },
  { id: "atendente", label: "Atendente", desc: "Pedidos, cardápio, entregas e chat" },
  { id: "cozinha", label: "Cozinha", desc: "Tela KDS simplificada para a chapa" },
  { id: "entregador", label: "Entregador", desc: "Fila de entregas com rotas e Maps" },
];

export default function UsersManager({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<User | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "atendente" as Role,
    active: true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setIsNew(true);
    setEditing(null);
    setForm({
      name: "",
      username: "",
      password: "",
      role: "atendente",
      active: true,
    });
    setError("");
  }

  function openEdit(user: User) {
    setIsNew(false);
    setEditing(user);
    setForm({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role,
      active: user.active,
    });
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await saveUser({
      id: editing?.id,
      name: form.name,
      username: form.username,
      password: form.password || undefined,
      role: form.role,
      active: form.active,
    });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setEditing(null);
    setIsNew(false);
    router.refresh();
  }

  async function handleToggle(user: User) {
    const res = await setUserActive(user.id, !user.active);
    if (!res.ok) alert(res.error);
    router.refresh();
  }

  async function handleDelete(user: User) {
    if (!confirm(`Excluir o usuário "${user.name}"?`)) return;
    const res = await deleteUser(user.id);
    if (!res.ok) alert(res.error);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Equipe e permissões
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Crie acessos separados para cozinha, entregadores e atendentes.
          </p>
        </div>
        <button onClick={openNew} className="btn btn-primary text-xs">
          <Plus size={14} /> Novo usuário
        </button>
      </header>

      {/* PAPÉIS EXPLICADOS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((r) => (
          <div key={r.id} className="card p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-xs font-black text-white">
              {r.label[0]}
            </span>
            <p className="mt-2 text-sm font-bold text-white">{r.label}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* LISTA */}
      <section className="card overflow-hidden">
        <div className="border-b border-white/[0.06] p-4">
          <h2 className="text-sm font-extrabold text-white">
            Usuários cadastrados ({users.length})
          </h2>
        </div>

        <div className="divide-y divide-white/[0.06]">
          {users.map((user) => {
            const isMe = user.id === currentUserId;
            return (
              <div
                key={user.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white">
                    {user.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-white">
                      {user.name} {isMe && <span className="text-zinc-500">(você)</span>}
                    </p>
                    <p className="text-zinc-400">
                      @{user.username} ·{" "}
                      <span className="font-semibold text-rose-300">
                        {ROLE_LABEL[user.role]}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                      user.active
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-zinc-500/15 text-zinc-400"
                    }`}
                  >
                    {user.active ? "Ativo" : "Inativo"}
                  </span>

                  <button
                    onClick={() => openEdit(user)}
                    className="btn btn-ghost !py-1 text-xs"
                  >
                    Editar
                  </button>

                  {!isMe && (
                    <>
                      <button
                        onClick={() => handleToggle(user)}
                        className="btn btn-ghost !py-1 text-xs"
                        title={user.active ? "Desativar" : "Ativar"}
                      >
                        {user.active ? <UserX size={13} /> : <UserCheck size={13} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="btn btn-ghost !py-1 text-xs text-zinc-500 hover:text-rose-400"
                        title="Excluir"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* MODAL */}
      {(isNew || editing) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmit}
            className="card w-full max-w-md p-6 animate-slide-up"
          >
            <h3 className="text-lg font-black text-white">
              {isNew ? "Novo usuário" : `Editar ${editing?.name}`}
            </h3>
            <p className="mt-0.5 text-xs text-zinc-400">
              {isNew
                ? "Crie uma conta para um membro da equipe."
                : "Atualize os dados ou redefina a senha."}
            </p>

            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="label">Nome</span>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="Nome completo"
                  className="input"
                />
              </label>

              <label className="block">
                <span className="label">Usuário de acesso</span>
                <input
                  value={form.username}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, username: e.target.value }))
                  }
                  required
                  placeholder="ex: joao.cozinha"
                  className="input"
                />
              </label>

              <label className="block">
                <span className="label">
                  {isNew ? "Senha" : "Nova senha (deixe vazio para manter)"}
                </span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, password: e.target.value }))
                  }
                  placeholder="••••••••"
                  className="input"
                />
              </label>

              <label className="block">
                <span className="label">Função / Papel</span>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value as Role }))
                  }
                  className="input"
                >
                  {ROLES.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label} — {r.desc}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 pt-1 text-xs font-semibold text-zinc-300">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, active: e.target.checked }))
                  }
                  className="h-4 w-4 accent-rose-500"
                />
                Usuário ativo (pode fazer login)
              </label>
            </div>

            {error && (
              <p className="mt-3 rounded-xl bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-300">
                {error}
              </p>
            )}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className="btn btn-ghost text-xs"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary text-xs"
              >
                {saving ? "Salvando..." : "Salvar usuário"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
