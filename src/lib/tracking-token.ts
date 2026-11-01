import { createHmac } from "crypto";

const SECRET = process.env.TRACKING_TOKEN_SECRET || "dev-secret";

export function createTrackingToken(orderId: string, code: string, expiresAt: Date): string {
  const payload = `${orderId}:${code}:${Math.floor(expiresAt.getTime() / 1000)}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

export function verifyTrackingToken(token: string, expectedOrderId: string, expectedCode: string): boolean {
  try {
    const [payloadB64, sig] = token.split(".");
    if (!payloadB64 || !sig) return false;
    const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
    const [orderId, code, expStr] = payload.split(":");
    if (orderId !== expectedOrderId || code !== expectedCode) return false;
    const exp = Number(expStr);
    if (Number.isNaN(exp) || Date.now() > exp * 1000) return false;
    const expectedSig = createHmac("sha256", SECRET).update(payload).digest("hex");
    return sig === expectedSig;
  } catch {
    return false;
  }
}
