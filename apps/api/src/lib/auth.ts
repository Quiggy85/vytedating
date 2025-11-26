import type { VercelRequest } from "@vercel/node";
import { supabaseServer } from "./supabaseClient";

export class AuthError extends Error {}

export async function getUserIdFromRequest(req: VercelRequest): Promise<string> {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || Array.isArray(authHeader)) {
    throw new AuthError("Missing Authorization header");
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    throw new AuthError("Invalid Authorization header format");
  }

  if (!supabaseServer) {
    throw new Error("Supabase server client is not configured");
  }

  const { data, error } = await supabaseServer.auth.getUser(token);

  if (error || !data?.user) {
    throw new AuthError("Invalid or expired token");
  }

  return data.user.id;
}
