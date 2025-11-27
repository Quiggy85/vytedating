import type { VercelRequest } from "@vercel/node";
import { Buffer } from "buffer";

export class AuthError extends Error {}

function getUserIdFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const payloadJson = Buffer.from(parts[1], "base64").toString("utf8");
    const payload = JSON.parse(payloadJson);

    if (payload && typeof payload.sub === "string") {
      return payload.sub;
    }

    return null;
  } catch {
    return null;
  }
}

export async function getUserIdFromRequest(req: VercelRequest): Promise<string> {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || Array.isArray(authHeader)) {
    throw new AuthError("Missing Authorization header");
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AuthError("Invalid Authorization header format");
  }

  const userId = getUserIdFromToken(token);

  if (!userId) {
    throw new AuthError("Invalid or expired token");
  }

  return userId;
}
