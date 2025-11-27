import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AuthError, getUserIdFromRequest } from "../../src/lib/auth";
import type { IntentType, UserIntent } from "@vyte/shared";
import { upsertUserIntent } from "../../src/lib/intents";

const ALLOWED_INTENTS: IntentType[] = [
  "NONE",
  "JUST_CHAT",
  "DRINKS",
  "DATE",
  "SEE_WHERE_IT_GOES",
];

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const userId = await getUserIdFromRequest(req);

    const body = (req.body || {}) as { intent?: IntentType };
    const intent = body.intent;

    if (!intent || !ALLOWED_INTENTS.includes(intent)) {
      res.status(400).json({ error: "Invalid intent" });
      return;
    }

    const result: UserIntent = await upsertUserIntent(userId, intent);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }

    console.error("/api/me/intent error", err);
    res.status(500).json({ error: "Unexpected error" });
  }
}
