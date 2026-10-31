import {
  ArrowUpRight,
  Bike,
  ClipboardList,
  CreditCard,
  DollarSign,
  Package,
  Receipt,
  Store,
  TrendingUp,
  Trophy,
  UtensilsCrossed,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import type { Category, Order, Product, Settings } from "@/lib/types";
import { ORDER_STATUS_LABEL, PAYMENT_LABEL } from "@/lib/types";
import { brl } from "@/lib/format";
import { isLowStock, orderCost } from "@/lib/store";

const STATUS_COLORS: Record<string, string> = {
  novo: "#e11d48",
  preparando: "#f59e0b",
  pronto: "#a78bfa",
  saiu: "#38bdf8",
  concluido: "#34d399",
  cancelado: "#52525b",
};

const PAYMENT_COLORS: Record<string, string> = {
  pix: "#34d399",
  cartao: "#38bdf8",
  dinheiro: "#fbbf24",
  vr: "#a78bfa",
};

export default function Dashboard({
  settings,
  orders,
  categories,
  products,
}: {
  settings: Settings;
  orders: Order[];
  categories: Category[];
  products: Product[];
}) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isSameDay = (iso: string, base: Date) => {
    const d = new Date(iso);
    return (
      d.getFullYear() === base.getFullYear() &&
      d.getMonth() === base.getMonth() &&
      d.getDate() === base.getDate()
    );
  };

  const valid = orders.filter((o) => o.status !== "cancelado");
  const today = valid.filter((o) => isSameDay(o.createdAt, now));
  const revenueToday = today.reduce((a, o) => a + o.total, 0);
  const profitToday = today.reduce((a, o) => a + o.total - orderCost(o), 0);
  const ticket = today.length ? revenueToday / today.length : 0;
  const receivable = valid
    .filter((o) => o.paymentStatus !== "pago")
    .reduce((a, o) => a + o.total, 0);
  const waiting = orders.filter(
    (o) => o.status === "novo" || o.status === "preparando" || o.status === "pronto",
  ).length;

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - (6 - i));
    const dayOrders = valid.filter((o) => isSameDay(o.createdAt, d));
    return {
      label: new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
        .format(d)
        .replace(".", ""),
      full: new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      }).format(d),
      revenue: dayOrders.reduce((a, o) => a + o.total, 0),
      count: dayOrders.length,
    };
  });
  const maxRevenue = Math.max(...last7.map((d) => d.revenue), 1);
  const revenue7 = last7.reduce((a, d) => a + d.revenue, 0);

  const productStats = new Map<
    string,
    { name: string; qty: number; revenue: number }
  >();
  for (const order of valid) {
    for (const item of order.items) {
      const current = productStats.get(item.productId) ?? {
        name: item.name,
        qty: 0,
        revenue: 0,
      };
      current.qty += item.qty;
      current.revenue += item.qty * item.price;
      productStats.set(item.productId, current);
    }
  }
  const topProducts = [...productStats.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);
  const maxQty = Math.max(...topProducts.map((p) => p.qty), 1);

  const statusCounts = (
    ["novo", "preparando", "pronto", "saiu", "concluido", "cancelado"] as const
  ).map((status) => ({
    status,
    label: ORDER_STATUS_LABEL[status],
    count: orders.filter((o) => o.status === status).length,
    color: STATUS_COLORS[status],
  }));
  const statusTotal = statusCounts.reduce((a, s) => a + s.count, 0);

  let acc = 0;
  const donutSegments = statusCounts
    .filter((s) => s.count > 0)
    .map((s) => {
      const start = (acc / statusTotal) * 360;
      acc += s.count;
      const end = (acc / statusTotal) * 360;
      return `${s.color} ${start}deg ${end}deg`;
    })
    .join(", ");

  const paymentCounts = (["pix", "cartao", "dinheiro", "vr"] as const).map(
    (payment) => ({
      payment,
      label: PAYMENT_LABEL[payment],
      count: valid.filter((o) => o.payment === payment).length,
      value: valid
        .filter((o) => o.payment === payment)
        .reduce((a, o) => a + o.total, 0),
    }),
  );
  const paymentTotal = paymentCounts.reduce((a, p) => a + p.count, 0);

  const deliveryCount = valid.filter((o) => o.type === "delivery").length;
  const pickupCount = valid.length - deliveryCount;

  const activeProducts = products.filter((p) => p.active).length;
  const lowStock = products
    .filter((p) => p.trackStock && isLowStock(p))
    .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
    .slice(0, 4);
  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <div className="animate-fade-in">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            Visão geral
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Olá, {settings.storeName} 👋
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            {settings.isOpen ? (
              <span className="font-semibold text-emerald-400">Loja aberta</span>
            ) : (
              <span className="font-semibold text-red-400">Loja fechada</span>
            )}{" "}
            · {activeProducts} itens ativos · {categories.length} categorias
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/produtos" className="btn btn-light">
            <UtensilsCrossed size={14} /> Cardápio
          </Link>
          <Link href="/admin/pedidos" className="btn btn-ghost">
            Pedidos <ArrowUpRight size={14} />
          </Link>
        </div>
      </header>

      {/* KPIs */}
      <section className="stagger grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Kpi
          label="Faturamento hoje"
          value={brl(revenueToday)}
          hint={`${brl(revenue7)} nos últimos 7 dias`}
          icon={<DollarSign size={17} />}
          tone="emerald"
        />
        <Kpi
          label="Lucro estimado"
          value={brl(profitToday)}
          hint={
            revenueToday > 0
              ? `margem de ${Math.round((profitToday / revenueToday) * 100)}% hoje`
              : "sem vendas hoje"
          }
          icon={<TrendingUp size={17} />}
          tone="brand"
        />
        <Kpi
          label="Pedidos hoje"
          value={String(today.length)}
          hint={`${waiting} em andamento agora`}
          icon={<ClipboardList size={17} />}
          tone="sky"
        />
        <Kpi
          label="A receber"
          value={brl(receivable)}
          hint={`ticket médio ${brl(ticket)}`}
          icon={<Wallet size={17} />}
          tone="amber"
        />
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* GRÁFICO 7 DIAS */}
        <section className="panel rounded-3xl p-5 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-white">
                Faturamento dos últimos 7 dias
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                Pedidos válidos, sem cancelamentos
              </p>
            </div>
            <span className="rounded-full bg-white/[0.06] px-3 py-1 text-[11px] font-bold text-zinc-300">
              Total {brl(revenue7)}
            </span>
          </div>

          <div className="mt-6 flex h-48 items-end gap-2 sm:gap-3">
            {last7.map((day, i) => {
              const height =
                day.revenue === 0
                  ? 4
                  : Math.max(8, (day.revenue / maxRevenue) * 100);
              const isToday = i === last7.length - 1;
              return (
                <div
                  key={day.full}
                  className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
                  title={`${day.full} · ${brl(day.revenue)} · ${day.count} pedido(s)`}
                >
                  <span className="text-[10px] font-bold text-zinc-400 opacity-0 transition group-hover:opacity-100">
                    {brl(day.revenue)}
                  </span>
                  <div
                    style={{ height: `${height}%` }}
                    className={`w-full max-w-14 rounded-t-xl transition-all duration-500 ${
                      isToday
                        ? "bg-gradient-to-t from-[var(--brand-strong)] to-[var(--brand-soft)] shadow-[0_0_26px_rgba(225,29,72,0.35)]"
                        : "bg-white/[0.09] group-hover:bg-white/[0.16]"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase ${
                      isToday ? "text-[var(--brand-soft)]" : "text-zinc-500"
                    }`}
                  >
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* DONUT STATUS */}
        <section className="panel rounded-3xl p-5">
          <h2 className="text-sm font-extrabold text-white">Status dos pedidos</h2>
          <p className="mt-0.5 text-xs text-zinc-500">Todos os pedidos</p>

          {statusTotal === 0 ? (
            <EmptyBlock text="Nenhum pedido ainda" />
          ) : (
            <div className="mt-5 flex items-center gap-5">
              <div
                className="relative h-28 w-28 shrink-0 rounded-full"
                style={{ background: `conic-gradient(${donutSegments})` }}
              >
                <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[#0d0d11]">
                  <span className="text-xl font-black text-white">
                    {statusTotal}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                    pedidos
                  </span>
                </div>
              </div>
              <ul className="flex-1 space-y-1.5">
                {statusCounts.map((s) => (
                  <li key={s.status} className="flex items-center gap-2 text-xs">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="flex-1 text-zinc-400">{s.label}</span>
                    <span className="font-bold text-zinc-200">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* TOP PRODUTOS */}
        <section className="panel rounded-3xl p-5 xl:col-span-2">
          <div className="flex items-center gap-2">
            <Trophy size={16} className="text-amber-400" />
            <h2 className="text-sm font-extrabold text-white">Mais vendidos</h2>
          </div>
          {topProducts.length === 0 ? (
            <EmptyBlock text="As vendas aparecem aqui" />
          ) : (
            <ul className="mt-4 space-y-3">
              {topProducts.map((p, i) => (
                <li key={p.name}>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-4 text-center font-black text-zinc-600">
                      {i + 1}
                    </span>
                    <span className="flex-1 truncate font-semibold text-zinc-200">
                      {p.name}
                    </span>
                    <span className="text-zinc-500">{p.qty}x</span>
                    <span className="w-16 text-right font-bold text-zinc-100">
                      {brl(p.revenue)}
                    </span>
                  </div>
                  <div className="mt-1.5 ml-6 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[var(--brand)] to-[var(--brand-soft)]"
                      style={{ width: `${(p.qty / maxQty) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* PAGAMENTOS + TIPO */}
        <section className="panel rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-zinc-400" />
            <h2 className="text-sm font-extrabold text-white">Pagamentos</h2>
          </div>

          {paymentTotal === 0 ? (
            <EmptyBlock text="Sem dados de pagamento" />
          ) : (
            <>
              <ul className="mt-4 space-y-2.5">
                {paymentCounts.map((p) => (
                  <li key={p.payment}>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">{p.label}</span>
                      <span className="font-bold text-zinc-200">
                        {brl(p.value)}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${(p.count / paymentTotal) * 100}%`,
                          background: PAYMENT_COLORS[p.payment],
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <TypeCard
                  icon={<Bike size={15} />}
                  label="Entrega"
                  value={deliveryCount}
                  total={valid.length}
                />
                <TypeCard
                  icon={<Store size={15} />}
                  label="Retirada"
                  value={pickupCount}
                  total={valid.length}
                />
              </div>
            </>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        {/* ESTOQUE */}
        <section className="panel rounded-3xl p-5">
          <div className="flex items-center gap-2">
            <Package size={16} className="text-zinc-400" />
            <h2 className="text-sm font-extrabold text-white">Estoque</h2>
            <Link
              href="/admin/produtos"
              className="ml-auto text-[11px] font-bold text-zinc-500 hover:text-white"
            >
              gerenciar
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <EmptyBlock text="Nenhum item em falta" />
          ) : (
            <ul className="mt-4 space-y-2">
              {lowStock.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-zinc-200">
                    {p.name}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      (p.stock ?? 0) <= 0
                        ? "bg-red-500/20 text-red-300"
                        : "bg-amber-500/20 text-amber-300"
                    }`}
                  >
                    {(p.stock ?? 0) <= 0 ? "esgotado" : `${p.stock} un.`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ÚLTIMOS PEDIDOS */}
        <section className="panel rounded-3xl p-5 xl:col-span-2">
          <div className="flex items-center gap-2">
            <Receipt size={16} className="text-zinc-400" />
            <h2 className="text-sm font-extrabold text-white">
              Últimos pedidos
            </h2>
            <Link
              href="/admin/pedidos"
              className="ml-auto text-[11px] font-bold text-zinc-500 hover:text-white"
            >
              ver todos
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyBlock text="Os pedidos aparecem aqui" />
          ) : (
            <ul className="mt-4 divide-y divide-white/[0.06]">
              {recent.map((o) => (
                <li
                  key={o.id}
                  className="flex items-center gap-3 py-2.5 text-xs first:pt-0 last:pb-0"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[10px] font-black text-zinc-200">
                    {o.code}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-zinc-200">
                      {o.customerName}
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      {o.items.length} item(ns) · {PAYMENT_LABEL[o.payment]}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide"
                    style={{
                      background: `${STATUS_COLORS[o.status]}22`,
                      color: STATUS_COLORS[o.status],
                    }}
                  >
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                  <span className="w-16 text-right font-bold text-zinc-100">
                    {brl(o.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  tone: "brand" | "emerald" | "sky" | "amber";
}) {
  const tones: Record<string, string> = {
    brand: "bg-[rgba(225,29,72,0.16)] text-[var(--brand-soft)]",
    emerald: "bg-emerald-500/15 text-emerald-300",
    sky: "bg-sky-500/15 text-sky-300",
    amber: "bg-amber-500/15 text-amber-300",
  };
  return (
    <div className="panel group rounded-3xl p-4 transition hover:border-white/15">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 truncate text-2xl font-black tracking-tight text-white num">
        {value}
      </p>
      <p className="mt-0.5 truncate text-[11px] text-zinc-500">{hint}</p>
    </div>
  );
}

function TypeCard({
  icon,
  label,
  value,
  total,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
        {icon} {label}
      </span>
      <p className="mt-1 text-lg font-black text-white num">
        {value}{" "}
        <span className="text-[11px] font-semibold text-zinc-500">({pct}%)</span>
      </p>
    </div>
  );
}

function EmptyBlock({ text }: { text: string }) {
  return (
    <div className="mt-4 flex h-28 items-center justify-center rounded-2xl border border-dashed border-white/10 text-xs font-semibold text-zinc-600">
      {text}
    </div>
  );
}
