import { getDb } from "@/lib/db";
import { verifyTrackingToken } from "@/lib/tracking-token";
import { getDeliveryLocation } from "@/lib/location";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const db = await getDb();
  const order = db.orders.find((o) => o.code.toUpperCase() === code.toUpperCase());
  if (!order || !token || !verifyTrackingToken(token, order.id, order.code))
    return new Response("Unauthorized", { status: 403 });

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(`data: ${JSON.stringify({ type: "connected" })}\n\n`);
      const interval = setInterval(async () => {
        try {
          const loc = await getDeliveryLocation(order.id);
          controller.enqueue(`data: ${JSON.stringify({ type: "location", data: loc })}\n\n`);
        } catch {
          // ignora
        }
      }, 15000);
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
