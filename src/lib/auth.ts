import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { getDb } from "./db";
import { verifyPassword } from "./password";
import type { Role, User } from "./types";

const COOKIE_NAME = "kawan_session";

/**
 * Segredo de assinatura. Em producao AUTH_SECRET e obrigatorio: sem ele o
 * fallback e previsivel e permite forjar sessoes.
 */
function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "AUTH_SECRET ausente. Defina AUTH_SECRET em producao (openssl rand -hex 32).",
    );
  }
  return `kawan-store::${process.env.ADMIN_PASSWORD || "admin123"}`;
}

export type Session = {
  userId: string;
  name: string;
  role: Role;
};

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createToken(session: Session, days = 7): string {
  const body = Buffer.from(
    JSON.stringify({ ...session, exp: Date.now() + days * 86_400_000 }),
  ).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function readToken(token?: string | null): Session | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (sign(body) !== signature) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString()) as
      | (Session & { exp: number })
      | null;
    if (!data || !data.userId || !data.role) return null;
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { userId: data.userId, name: data.name, role: data.role };
  } catch {
    return null;
  }
}

/** Sessão atual, validada contra o banco (usuário precisa existir e estar ativo). */
export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const parsed = readToken(jar.get(COOKIE_NAME)?.value);
  if (!parsed) return null;

  const db = await getDb();
  const user = db.users.find((u) => u.id === parsed.userId);
  if (!user || !user.active) return null;

  return { userId: user.id, name: user.name, role: user.role };
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getSession()) !== null;
}

export async function requireRole(roles: Role[]): Promise<Session | null> {
  const session = await getSession();
  if (!session) return null;
  return roles.includes(session.role) ? session : null;
}

export async function setSession(user: User): Promise<void> {
  const jar = await cookies();
  jar.set(
    COOKIE_NAME,
    createToken({ userId: user.id, name: user.name, role: user.role }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    },
  );
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export async function authenticate(
  username: string,
  password: string,
): Promise<User | null> {
  const db = await getDb();
  const user = db.users.find(
    (u) => u.username.toLowerCase() === username.trim().toLowerCase(),
  );
  if (!user || !user.active) return null;
  if (!verifyPassword(password, user.username, user.passwordHash)) return null;
  return user;
}

/* ------------------------------- permissões ------------------------------- */

export const ROLES_ADMIN: Role[] = ["dono", "atendente"];
export const ROLES_KITCHEN: Role[] = ["dono", "atendente", "cozinha"];
export const ROLES_DELIVERY: Role[] = ["dono", "atendente", "entregador"];
export const ROLES_ALL: Role[] = ["dono", "atendente", "cozinha", "entregador"];

export function canAccessArea(role: Role, area: string): boolean {
  if (role === "dono") return true;
  if (area === "admin") return role === "atendente";
  if (area === "pedidos") return role === "atendente";
  if (area === "cardapio") return role === "atendente";
  if (area === "cozinha") return role === "cozinha" || role === "atendente";
  if (area === "entregas") return role === "atendente" || role === "entregador";
  return false;
}
