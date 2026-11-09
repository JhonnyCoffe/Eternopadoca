import { randomBytes } from "crypto";
import { promises as fs } from "fs";
import path from "path";

const STORE_PATH = path.join(process.cwd(), "data", "password-reset-tokens.json");

type ResetToken = {
  token: string;
  userId: string;
  expiresAt: number;
  used: boolean;
};

async function readTokens(): Promise<ResetToken[]> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    const parsed = JSON.parse(raw) as ResetToken[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeTokens(tokens: ResetToken[]): Promise<void> {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(tokens, null, 2), "utf8");
}

export async function createResetToken(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const tokens = (await readTokens()).filter(
    (t) => !t.used && t.expiresAt > Date.now(),
  );
  tokens.push({
    token,
    userId,
    expiresAt: Date.now() + 60 * 60 * 1000,
    used: false,
  });
  await writeTokens(tokens);
  return token;
}

export async function verifyResetToken(token: string): Promise<string | null> {
  const tokens = await readTokens();
  const found = tokens.find(
    (t) => t.token === token && !t.used && t.expiresAt > Date.now(),
  );
  return found?.userId ?? null;
}

export async function consumeResetToken(token: string): Promise<void> {
  const tokens = await readTokens();
  const next = tokens.map((t) =>
    t.token === token ? { ...t, used: true } : t,
  );
  await writeTokens(next);
}