import { createHash, randomBytes } from "crypto";

/** Hash de senha (suficiente para uso interno; troque por bcrypt/argon2 se crescer). */
export function hashPassword(password: string, username: string): string {
  return createHash("sha256")
    .update(`${password}::${username.trim().toLowerCase()}::kawan-store::v2`)
    .digest("hex");
}

export function verifyPassword(
  password: string,
  username: string,
  hash: string,
): boolean {
  return hashPassword(password, username) === hash;
}

export function randomId(): string {
  return randomBytes(12).toString("hex");
}
