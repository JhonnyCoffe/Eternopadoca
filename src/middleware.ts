import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limit simples em memória (reset a cada 60s).
// Chave = IP. Em ambientes serverless cada instância tem seu próprio contador.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 300;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
// Rate limit específico para checkout (pedidos por IP).
const orderRateLimitMap = new Map<string, { count: number; resetAt: number }>();
const ORDER_RATE_LIMIT_MAX = 30;
const ORDER_RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(
  map: Map<string, { count: number; resetAt: number }>,
  ip: string,
  max: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = map.get(ip);

  if (!entry || now > entry.resetAt) {
    map.set(ip, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: max - entry.count };
}

function securityHeaders(res: NextResponse, req: NextRequest): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self';",
  );

  // Forçar HTTPS em produção (não localhost).
  const isProd = process.env.NODE_ENV === "production";
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.headers.get("x-forwarded-port") === "443";
  if (isProd && !isHttps) {
    return NextResponse.redirect(
      `https://${req.headers.get("host")}${req.nextUrl.pathname}${req.nextUrl.search}`,
      308,
    );
  }

  // CORS restrito: apenas mesma origem pode ler chamadas cross-origin.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (!!host && originHost === host) {
        res.headers.set("Access-Control-Allow-Origin", origin);
        res.headers.set("Access-Control-Allow-Credentials", "true");
        res.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS",
        );
        res.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization",
        );
      }
    } catch {}
  }

  return res;
}

/**
 * Proteção CSRF por origem: aceita apenas mutações same-origin.
 * Não usar allowlist de token em memória: Server Actions usam POST na
 * própria rota e um token não emitido bloquearia login e todo o admin.
 */
function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // navegação direta / curl sem Origin
  const host = req.headers.get("host");
  try {
    const originHost = new URL(origin).host;
    return !!host && originHost === host;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  // Remove a porta: "localhost:3000" -> "localhost"
  const hostname = host.split(":")[0];
  const sub = hostname.split(".")[0];

  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !isSameOrigin(req)) {
    return securityHeaders(
      new NextResponse("Origem não permitida", {
        status: 403,
        headers: { "Content-Type": "text/plain" },
      }),
      req,
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (!checkRateLimit(rateLimitMap, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS).allowed) {
    return securityHeaders(
      new NextResponse("Too Many Requests", {
        status: 429,
        headers: { "Retry-After": "60", "Content-Type": "text/plain" },
      }),
      req,
    );
  }

  // Rate limit específico para checkout (pedidos).
  if (req.nextUrl.pathname.startsWith("/api/orders") && req.method === "POST") {
    const orderLimit = checkRateLimit(
      orderRateLimitMap,
      ip,
      ORDER_RATE_LIMIT_MAX,
      ORDER_RATE_LIMIT_WINDOW_MS,
    );
    if (!orderLimit.allowed) {
      return securityHeaders(
        new NextResponse("Too Many Requests", {
          status: 429,
          headers: { "Retry-After": "60", "Content-Type": "text/plain" },
        }),
        req,
      );
    }
  }

  let response: NextResponse | null = null;

  if (!hostname.includes(".") || sub === "www") {
    response = NextResponse.next();
  } else if (req.nextUrl.pathname.startsWith("/api/store-lookup")) {
    response = NextResponse.next();
  } else {
    try {
      const url = new URL("/api/store-lookup", req.url);
      url.searchParams.set("sub", sub);
      const lookup = await fetch(url);
      if (!lookup.ok) response = NextResponse.next();
      else {
        const data = (await lookup.json()) as {
          store?: { id: string; subdomain: string } | null;
        };
        if (!data?.store) response = NextResponse.next();
        else {
          response = NextResponse.next();
          response.headers.set("x-store-id", data.store.id);
          response.headers.set("x-store-subdomain", data.store.subdomain);
        }
      }
    } catch {
      response = NextResponse.next();
    }
  }

  return securityHeaders(response!, req);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js).*)"],
};
