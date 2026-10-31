"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChefHat,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Bike,
  Settings,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { logoutAction } from "@/app/admin/actions";
import { ROLE_LABEL, type Role } from "@/lib/types";
import OrderAlert from "@/components/admin/OrderAlert";

type NavItem = {
  href: string;
  label: string;
  short: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
};

const links: NavItem[] = [
  {
    href: "/admin",
    label: "Dashboard",
    short: "Início",
    icon: LayoutDashboard,
    roles: ["dono", "atendente"],
  },
  {
    href: "/admin/pedidos",
    label: "Pedidos",
    short: "Pedidos",
    icon: ClipboardList,
    roles: ["dono", "atendente"],
  },
  {
    href: "/admin/cozinha",
    label: "Cozinha",
    short: "Cozinha",
    icon: ChefHat,
    roles: ["dono", "atendente", "cozinha"],
  },
  {
    href: "/admin/produtos",
    label: "Cardápio",
    short: "Cardápio",
    icon: UtensilsCrossed,
    roles: ["dono", "atendente", "cozinha"],
  },
  {
    href: "/admin/entregas",
    label: "Entregas",
    short: "Entregas",
    icon: Bike,
    roles: ["dono", "atendente"],
  },
  {
    href: "/admin/usuarios",
    label: "Equipe",
    short: "Equipe",
    icon: Users,
    roles: ["dono"],
  },
  {
    href: "/admin/config",
    label: "Configurações",
    short: "Config",
    icon: Settings,
    roles: ["dono"],
  },
];

export default function AdminShell({
  storeName,
  newOrders,
  unreadChats = 0,
  role,
  userName,
  isOpen,
  children,
}: {
  storeName: string;
  newOrders: number;
  unreadChats?: number;
  role: Role;
  userName: string;
  isOpen: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const visible = links.filter((l) => l.roles.includes(role));
  const initials = storeName.slice(0, 2).toUpperCase();

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const badgeFor = (item: NavItem) =>
    item.href === "/admin/pedidos" ? newOrders : 0;

  return (
    <div className="min-h-screen lg:flex">
      <OrderAlert newOrders={newOrders} unreadChats={unreadChats} />
      {/* SIDEBAR DESKTOP */}
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-white/[0.06] bg-[#0a0a0c] lg:flex">
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] text-sm font-black text-white shadow-lg shadow-[#e11d48]/25">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-tight text-white">
              {storeName}
            </p>
            <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isOpen ? "bg-emerald-400" : "bg-red-500"
                }`}
              />
              {isOpen ? "Aberta" : "Fechada"}
            </p>
          </div>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {visible.map(({ href, label, icon: Icon, roles }) => {
            const active = isActive(href);
            const badge = badgeFor({ href, label, short: label, icon: Icon, roles });
            return (
              <Link
                key={`${href}-${label}`}
                href={href}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition ${
                  active
                    ? "bg-white/[0.07] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--brand)]" />
                )}
                <Icon
                  size={17}
                  className={active ? "text-[var(--brand-soft)]" : ""}
                />
                {label}
                {href === "/admin/pedidos" && unreadChats > 0 && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-sky-400" />
                )}
                {badge > 0 && (
                  <span
                    className={`${
                      href === "/admin/pedidos" && unreadChats > 0 ? "" : "ml-auto"
                    } rounded-full bg-[var(--brand)] px-1.5 py-0.5 text-[10px] font-black text-white`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/[0.06] p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] font-black text-white">
              {userName.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-zinc-100">{userName}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                {ROLE_LABEL[role]}
              </p>
            </div>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-500 transition hover:bg-white/5 hover:text-white"
          >
            <ExternalLink size={15} /> Ver cardápio
          </Link>
          <form action={logoutAction}>
            <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-500 transition hover:bg-white/5 hover:text-white">
              <LogOut size={15} /> Sair
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* TOPBAR MOBILE */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/[0.06] bg-[#08080a]/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-strong)] text-xs font-black text-white">
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold leading-tight">
              {storeName}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              {ROLE_LABEL[role]} · {userName}
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400"
            aria-label="Ver cardápio"
          >
            <ExternalLink size={17} />
          </Link>
          <form action={logoutAction}>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400"
              aria-label="Sair"
            >
              <LogOut size={17} />
            </button>
          </form>
        </header>

        <main className="flex-1 px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7">
          {children}
        </main>

        {/* TABBAR MOBILE */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.08] bg-[#0a0a0c]/92 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
          <div className="no-scrollbar flex items-stretch overflow-x-auto">
            {visible.map(({ href, short, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={`${href}-${short}`}
                  href={href}
                  className={`relative flex min-w-[72px] flex-1 flex-col items-center gap-1 px-2 py-2.5 text-[10px] font-bold transition ${
                    active ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {active && (
                    <span className="absolute inset-x-4 top-0 h-[2px] rounded-b-full bg-[var(--brand)]" />
                  )}
                  <Icon
                    size={19}
                    className={active ? "text-[var(--brand-soft)]" : ""}
                  />
                  {short}
                  {href === "/admin/pedidos" && newOrders > 0 && (
                    <span className="absolute right-2 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--brand)] px-1 text-[9px] font-black text-white">
                      {newOrders}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
