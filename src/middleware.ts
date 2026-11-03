import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getStoreBySubdomain } from "./lib/store";

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const sub = host.split(".")[0];
  if (!sub || sub === "localhost" || sub === "www") {
    return NextResponse.next();
  }
  const store = getStoreBySubdomain(sub);
  if (!store) {
    return NextResponse.next();
  }
  const res = NextResponse.next();
  res.headers.set("x-store-id", store.id);
  res.headers.set("x-store-subdomain", store.subdomain);
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|sw.js).*)"],
};
