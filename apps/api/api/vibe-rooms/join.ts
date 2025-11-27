import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserIdFromRequest } from "../../src/lib/auth";
import { joinVibeRoom } from "../../src/lib/vibeRooms";
import type { IntentType } from "@vyte/shared";

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

    const { intent } = req.body as { intent?: IntentType };
    if (!intent || intent === "NONE") {
      res.status(400).json({ error: "intent is required" });
      return;
    }

    const room = await joinVibeRoom(userId, intent);
    res.status(200).json(room);
  } catch (error: any) {
    console.error("JOIN_VIBE_ROOM_ERROR", error);
    res.status(500).json({ error: error?.message ?? "Internal server error" });
  }
}
