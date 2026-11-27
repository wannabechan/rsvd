/**
 * Server-only password hashing (scrypt). Do not import from client components.
 */

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;
const SALT_LEN = 16;

function scryptHash(
  password: string,
  salt: Buffer,
  keyLen: number,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLen, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

/** Format: scrypt$saltB64$hashB64 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LEN);
  const derived = await scryptHash(password, salt, KEY_LEN);
  return ["scrypt", salt.toString("base64url"), derived.toString("base64url")].join(
    "$",
  );
}

export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }

  const salt = Buffer.from(parts[1], "base64url");
  const expected = Buffer.from(parts[2], "base64url");
  if (salt.length === 0 || expected.length === 0) {
    return false;
  }

  const derived = await scryptHash(password, salt, expected.length);
  if (derived.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(derived, expected);
}
