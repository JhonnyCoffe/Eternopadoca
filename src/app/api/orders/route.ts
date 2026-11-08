import { NextResponse } from "next/server";
import { mutateDb } from "@/lib/db";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buildOrder, type CreateOrderInput } from "@/lib/orders";
import { isStoreOpen } from "@/lib/store";

const TERMS_VERSION = "1.0";

function getClientIp(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return undefined;
}

export async function POST(request: Request) {
  let body: CreateOrderInput;
  try {
    const json = (await request.json()) as Record<string, unknown>;
    body = {
      ...json,
      termsVersion: TERMS_VERSION,
      termsIp: getClientIp(request),
    } as CreateOrderInput;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Requisição inválida." },
      { status: 400 },
    );
  }

  const payload = await mutateDb((db) => {
    if (!isStoreOpen(db.settings)) {
      return {
        ok: false as const,
        error: "A loja está fechada neste momento.",
        status: 409,
      };
    }

    const built = buildOrder(db, body);
    if (!built.ok) return built;

    db.orders.push(built.order);

    return {
      ok: true as const,
      order: built.order,
      whatsappUrl: buildWhatsAppUrl(db.settings, built.order),
    };
  });

  if (!payload.ok) {
    return NextResponse.json(
      { ok: false, error: payload.error },
      { status: payload.status },
    );
  }

  return NextResponse.json({
    ok: true,
    order: payload.order,
    whatsappUrl: payload.whatsappUrl,
  });
}
