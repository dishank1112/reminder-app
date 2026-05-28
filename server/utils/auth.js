import crypto from "node:crypto";
import { promisify } from "node:util";
import { config } from "../config.js";

const scrypt = promisify(crypto.scrypt);
const tokenMaxAgeMs = 1000 * 60 * 60 * 24 * 7;

function base64Url(input) {
  return Buffer.from(input).toString("base64url");
}

function sign(value) {
  return crypto.createHmac("sha256", config.authSecret).update(value).digest("base64url");
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("base64url");
  const key = await scrypt(password, salt, 64);
  return `${salt}:${Buffer.from(key).toString("base64url")}`;
}

export async function verifyPassword(password, passwordHash) {
  const [salt, storedKey] = passwordHash.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const key = await scrypt(password, salt, 64);
  const stored = Buffer.from(storedKey, "base64url");

  return stored.length === key.length && crypto.timingSafeEqual(stored, key);
}

export function createToken(user) {
  const payload = base64Url(
    JSON.stringify({
      sub: user.id,
      email: user.email,
      exp: Date.now() + tokenMaxAgeMs
    })
  );

  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token) {
  const [payload, signature] = token.split(".");

  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

  if (!parsed.sub || parsed.exp < Date.now()) {
    return null;
  }

  return parsed;
}

export function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
}
