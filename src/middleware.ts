import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const sub = host.split(".")[0];
  if (!sub || sub === "localhost" || sub === "www") {
    return NextResponse.next();
  }
  if (req.nextUrl.pathname.startsWith("/api/store-lookup")) {
    return NextResponse.next();
  }
  try {
    const url = new URL("/api/store-lookup", req.url);
    url.searchParams.set("sub", sub);
    const lookup = await fetch(url);
    if (!lookup.ok) return NextResponse.next();
    const data = (await lookup.json()) as { store?: { id: string; subdomain: string } | null };
    if (!data?.store) return NextResponse.next();
    const res = NextResponse.next();
    res.headers.set("x-store-id", data.store.id);
    res.headers.set("x-store-subdomain", data.store.subdomain);
    return res;
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js).*)"],
};
