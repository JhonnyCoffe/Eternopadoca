"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, mutateDb } from "@/lib/db";
import {
  authenticate,
  destroySession,
  requireRole,
  setSession,
  type Session,
} from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import type { OrderStatus, Role, Weekday } from "@/lib/types";
import { ORDER_STATUS_LABEL, ROLE_HOME } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

function refreshAll() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/cozinha");
  revalidatePath("/admin/entregas");
  revalidatePath("/entregador");
}

async function guard(roles: Role[]): Promise<Session> {
  const session = await requireRole(roles);
  if (!session) throw new Error("Sessão expirada. Faça login novamente.");
  return session;
}

function parseMoney(value: string | number, fallback = 0): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  const raw = value.trim();
  if (!raw) return fallback;
  const normalized = raw.includes(",")
    ? raw.replace(/\./g, "").replace(",", ".")
    : raw;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseIntSafe(value: string | number, fallback = 0): number {
  const parsed = Math.trunc(parseMoney(value, fallback));
  return Number.isFinite(parsed) ? parsed : fallback;
}

/* ---------------------------------- AUTH --------------------------------- */

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const user = await authenticate(username || "admin", password);
  if (!user) redirect("/admin/login?erro=1");

  await setSession(user);
  redirect(ROLE_HOME[user.role]);
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changeOwnPassword(
  current: string,
  next: string,
): Promise<ActionResult> {
  const session = await guard(["dono", "atendente", "cozinha", "entregador"]);
  if (next.trim().length < 4) {
    return { ok: false, error: "A nova senha precisa de pelo menos 4 caracteres." };
  }
  const db = await getDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) return { ok: false, error: "Usuário não encontrado." };
  if (hashPassword(current, user.username) !== user.passwordHash) {
    return { ok: false, error: "Senha atual incorreta." };
  }
  await mutateDb((data) => {
    const target = data.users.find((u) => u.id === session.userId);
    if (target) target.passwordHash = hashPassword(next, target.username);
  });
  return { ok: true };
}

/* --------------------------------- USERS --------------------------------- */

export async function saveUser(input: {
  id?: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  active: boolean;
}): Promise<ActionResult> {
  await guard(["dono"]);

  const name = input.name.trim();
  const username = input.username.trim().toLowerCase();
  const password = (input.password ?? "").trim();
  const roles: Role[] = ["dono", "atendente", "cozinha", "entregador"];

  if (name.length < 2) return { ok: false, error: "Informe o nome da pessoa." };
  if (username.length < 3)
    return { ok: false, error: "O usuário precisa de pelo menos 3 letras." };
  if (!/^[a-z0-9._-]+$/.test(username))
    return {
      ok: false,
      error: "Use apenas letras, números, ponto, hífen ou underline.",
    };
  if (!roles.includes(input.role))
    return { ok: false, error: "Função inválida." };

  if (!input.id && password.length < 4)
    return { ok: false, error: "Defina uma senha com pelo menos 4 caracteres." };
  if (password && password.length < 4)
    return { ok: false, error: "A senha precisa de pelo menos 4 caracteres." };

  const result = await mutateDb((db) => {
    const duplicated = db.users.some(
      (u) => u.username === username && u.id !== input.id,
    );
    if (duplicated)
      return { ok: false as const, error: "Esse usuário já existe." };

    if (input.id) {
      const user = db.users.find((u) => u.id === input.id);
      if (!user) return { ok: false as const, error: "Usuário não encontrado." };

      const usernameChanged = user.username !== username;
      if (usernameChanged && !password) {
        return {
          ok: false as const,
          error: "Ao trocar o usuário, defina uma nova senha (4+ caracteres).",
        };
      }

      user.name = name;
      user.role = input.role;
      user.active = input.active;
      if (password) user.passwordHash = hashPassword(password, username);
      user.username = username;
    } else {
      db.users.push({
        id: crypto.randomUUID(),
        name,
        username,
        passwordHash: hashPassword(password, username),
        role: input.role,
        active: input.active,
        createdAt: new Date().toISOString(),
      });
    }

    return { ok: true as const };
  });

  if (result.ok) refreshAll();
  return result;
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await guard(["dono"]);
  if (session.userId === id)
    return { ok: false, error: "Você não pode excluir o próprio usuário." };

  const result = await mutateDb((db) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return { ok: false as const, error: "Usuário não encontrado." };
    const owners = db.users.filter((u) => u.role === "dono" && u.active);
    if (user.role === "dono" && owners.length <= 1) {
      return { ok: false as const, error: "Mantenha pelo menos um dono ativo." };
    }
    db.users = db.users.filter((u) => u.id !== id);
    return { ok: true as const };
  });

  return result;
}

export async function setUserActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  const session = await guard(["dono"]);
  if (session.userId === id && !active)
    return { ok: false, error: "Você não pode desativar o próprio acesso." };

  const result = await mutateDb((db) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return { ok: false as const, error: "Usuário não encontrado." };
    if (!active) {
      const owners = db.users.filter((u) => u.role === "dono" && u.active);
      if (user.role === "dono" && owners.length <= 1) {
        return {
          ok: false as const,
          error: "Mantenha pelo menos um dono ativo.",
        };
      }
    }
    user.active = active;
    return { ok: true as const };
  });

  return result;
}

/* -------------------------------- PRODUCTS ------------------------------- */

export type ProductInput = {
  id?: string;
  categoryId: string;
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  active: boolean;
  featured: boolean;
  badge: string;
  cost?: string | number;
  stock?: string | number;
  trackStock?: boolean;
  lowStockAt?: string | number;
};

export async function saveProduct(input: ProductInput): Promise<ActionResult> {
  await guard(["dono", "atendente"]);

  const name = input.name.trim();
  const price = parseMoney(input.price);

  if (name.length < 2) return { ok: false, error: "Informe o nome do produto." };
  if (!Number.isFinite(price) || price <= 0)
    return { ok: false, error: "Informe um preço válido." };
  if (!input.categoryId) return { ok: false, error: "Escolha uma categoria." };

  const db = await getDb();
  if (!db.categories.some((c) => c.id === input.categoryId))
    return { ok: false, error: "Categoria não encontrada." };

  const data = {
    categoryId: input.categoryId,
    name,
    description: input.description.trim(),
    price: Math.round(price * 100) / 100,
    imageUrl:
      input.imageUrl.trim() ||
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
    active: input.active,
    featured: input.featured,
    badge: input.badge.trim() || undefined,
    cost: Math.max(0, parseMoney(input.cost ?? 0)),
    stock: Math.max(0, parseIntSafe(input.stock ?? 0)),
    trackStock: Boolean(input.trackStock),
    lowStockAt: Math.max(0, parseIntSafe(input.lowStockAt ?? 5, 5)),
  };

  const result = await mutateDb((target) => {
    if (!target.categories.some((c) => c.id === input.categoryId))
      return { ok: false as const, error: "Categoria não encontrada." };

    if (input.id) {
      const product = target.products.find((p) => p.id === input.id);
      if (!product)
        return { ok: false as const, error: "Produto não encontrado." };
      Object.assign(product, data);
    } else {
      target.products.push({ id: crypto.randomUUID(), ...data });
    }
    return { ok: true as const };
  });

  if (result.ok) refreshAll();
  return result;
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  await guard(["dono", "atendente"]);
  await mutateDb((db) => {
    db.products = db.products.filter((p) => p.id !== id);
  });
  refreshAll();
  return { ok: true };
}

export async function setProductActive(
  id: string,
  active: boolean,
): Promise<ActionResult> {
  await guard(["dono", "atendente"]);
  const result = await mutateDb((db) => {
    const product = db.products.find((p) => p.id === id);
    if (!product) return { ok: false as const, error: "Produto não encontrado." };
    product.active = active;
    return { ok: true as const };
  });
  refreshAll();
  return result;
}

export async function restockProduct(
  id: string,
  quantity: number,
): Promise<ActionResult> {
  await guard(["dono", "atendente"]);
  const result = await mutateDb((db) => {
    const product = db.products.find((p) => p.id === id);
    if (!product) return { ok: false as const, error: "Produto não encontrado." };
    product.stock = Math.max(0, (product.stock ?? 0) + Math.trunc(quantity));
    product.trackStock = true;
    return { ok: true as const };
  });
  refreshAll();
  return result;
}

/* -------------------------------- CATEGORIES ----------------------------- */

export async function saveCategory(input: {
  id?: string;
  name: string;
  emoji: string;
}): Promise<ActionResult> {
  await guard(["dono", "atendente"]);
  const name = input.name.trim();
  if (name.length < 2)
    return { ok: false, error: "Informe o nome da categoria." };

  const result = await mutateDb((db) => {
    if (input.id) {
      const category = db.categories.find((c) => c.id === input.id);
      if (!category)
        return { ok: false as const, error: "Categoria não encontrada." };
      category.name = name;
      category.emoji = input.emoji.trim() || "🍽️";
    } else {
      db.categories.push({
        id: crypto.randomUUID(),
        name,
        emoji: input.emoji.trim() || "🍽️",
        order: db.categories.length + 1,
      });
    }
    return { ok: true as const };
  });

  if (result.ok) refreshAll();
  return result;
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  await guard(["dono", "atendente"]);
  const db = await getDb();
  if (db.products.some((p) => p.categoryId === id)) {
    return {
      ok: false,
      error: "Mova ou exclua os produtos desta categoria antes de removê-la.",
    };
  }
  await mutateDb((target) => {
    target.categories = target.categories.filter((c) => c.id !== id);
  });
  refreshAll();
  return { ok: true };
}

/* --------------------------------- ORDERS -------------------------------- */

const KITCHEN_STATUSES: OrderStatus[] = ["novo", "preparando", "pronto"];

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  const session = await guard(["dono", "atendente", "cozinha", "entregador"]);
  if (!(status in ORDER_STATUS_LABEL))
    return { ok: false, error: "Status inválido." };
  if (session.role === "cozinha" && !KITCHEN_STATUSES.includes(status)) {
    return {
      ok: false,
      error: "A cozinha só pode mover o pedido até “Pronto”.",
    };
  }

  const result = await mutateDb((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) return { ok: false as const, error: "Pedido não encontrado." };

    order.status = status;
    if (status === "pronto") order.readyAt = new Date().toISOString();
    if (status === "saiu") order.dispatchedAt = new Date().toISOString();
    if (status === "concluido") order.deliveredAt = new Date().toISOString();
    if (status === "cancelado") order.deliveredAt = undefined;
    return { ok: true as const };
  });

  if (result.ok) refreshAll();
  return result;
}

export async function setOrderPaid(
  id: string,
  paid: boolean,
): Promise<ActionResult> {
  await guard(["dono", "atendente"]);
  const result = await mutateDb((db) => {
    const order = db.orders.find((o) => o.id === id);
    if (!order) return { ok: false as const, error: "Pedido não encontrado." };
    order.paymentStatus = paid ? "pago" : "pendente";
    order.paidAt = paid ? new Date().toISOString() : undefined;
    return { ok: true as const };
  });
  if (result.ok) refreshAll();
  return result;
}

export async function assignDriver(
  orderId: string,
  driverId: string | null,
): Promise<ActionResult> {
  const session = await guard(["dono", "atendente", "entregador"]);
  const result = await mutateDb((db) => {
    const order = db.orders.find((o) => o.id === orderId);
    if (!order) return { ok: false as const, error: "Pedido não encontrado." };

    if (!driverId) {
      order.driverId = undefined;
      order.driverName = undefined;
      return { ok: true as const };
    }

    const driver = db.users.find(
      (u) => u.id === driverId && u.active && u.role === "entregador",
    );
    if (!driver)
      return { ok: false as const, error: "Entregador não encontrado." };
    if (session.role === "entregador" && driver.id !== session.userId) {
      return {
        ok: false as const,
        error: "Você só pode assumir entregas para si.",
      };
    }

    order.driverId = driver.id;
    order.driverName = driver.name;
    if (order.status === "pronto") {
      order.status = "saiu";
      order.dispatchedAt = new Date().toISOString();
    }
    return { ok: true as const };
  });
  if (result.ok) refreshAll();
  return result;
}

/* -------------------------------- SETTINGS ------------------------------- */

export async function saveSettings(formData: FormData): Promise<ActionResult> {
  await guard(["dono"]);

  const text = (key: string) => String(formData.get(key) ?? "").trim();
  const storeName = text("storeName");
  if (storeName.length < 2)
    return { ok: false, error: "Informe o nome da loja." };

  const days: Weekday[] = ["0", "1", "2", "3", "4", "5", "6"];
  const hours = {} as Record<Weekday, { closed: boolean; open: string; close: string }>;
  for (const day of days) {
    hours[day] = {
      closed: formData.get(`hours-${day}-closed`) === "on",
      open: text(`hours-${day}-open`) || "18:00",
      close: text(`hours-${day}-close`) || "23:30",
    };
  }

  const result = await mutateDb((db) => {
    db.settings = {
      ...db.settings,
      storeName,
      tagline: text("tagline"),
      whatsapp: text("whatsapp"),
      address: text("address"),
      instagram: text("instagram"),
      logoUrl: text("logoUrl"),
      heroImage: text("heroImage"),
      pixKey: text("pixKey"),
      primaryColor: text("primaryColor") || "#e11d48",
      avgDeliveryTime: text("avgDeliveryTime") || "30–45 min",
      deliveryFee: Math.max(0, parseMoney(text("deliveryFee"), db.settings.deliveryFee)),
      minOrder: Math.max(0, parseMoney(text("minOrder"), db.settings.minOrder)),
      isOpen: formData.get("isOpen") === "on",
      autoHours: formData.get("autoHours") === "on",
      hours,
    };
    return { ok: true as const };
  });

  refreshAll();
  return result;
}

export async function saveZone(input: {
  id?: string;
  name: string;
  fee: string | number;
  active: boolean;
}): Promise<ActionResult> {
  await guard(["dono"]);
  const name = input.name.trim();
  if (name.length < 2) return { ok: false, error: "Informe o nome do bairro." };
  const fee = Math.max(0, parseMoney(input.fee));

  const result = await mutateDb((db) => {
    if (input.id) {
      const zone = db.settings.deliveryZones.find((z) => z.id === input.id);
      if (!zone) return { ok: false as const, error: "Zona não encontrada." };
      zone.name = name;
      zone.fee = fee;
      zone.active = input.active;
    } else {
      db.settings.deliveryZones.push({
        id: crypto.randomUUID(),
        name,
        fee,
        active: input.active,
      });
    }
    return { ok: true as const };
  });

  refreshAll();
  return result;
}

export async function deleteZone(id: string): Promise<ActionResult> {
  await guard(["dono"]);
  await mutateDb((db) => {
    db.settings.deliveryZones = db.settings.deliveryZones.filter(
      (z) => z.id !== id,
    );
  });
  refreshAll();
  return { ok: true };
}
