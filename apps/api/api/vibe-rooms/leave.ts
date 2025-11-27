import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserIdFromRequest } from "../../src/lib/auth";
import { leaveVibeRoom } from "../../src/lib/vibeRooms";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    await leaveVibeRoom(userId);
    res.status(200).json({ ok: true });
  } catch (error: any) {
    console.error("LEAVE_VIBE_ROOM_ERROR", error);
    res.status(500).json({ error: error?.message ?? "Internal server error" });
  }
}
