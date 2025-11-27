import type { VercelRequest, VercelResponse } from "@vercel/node";
import { AuthError, getUserIdFromRequest } from "../../src/lib/auth";
import type { IntentType, UserIntent, SubscriptionTier, FeatureEntitlements } from "@vyte/shared";
import { findNearbyUsersWithIntent } from "../../src/lib/intents";
import { getEntitlementsForTier } from "../../src/lib/entitlements";
import { supabaseServer } from "../../src/lib/supabaseClient";

const ALLOWED_INTENTS: IntentType[] = [
  "JUST_CHAT",
  "DRINKS",
  "DATE",
  "SEE_WHERE_IT_GOES",
];

function isValidIntent(value: string): value is IntentType {
  return (ALLOWED_INTENTS as string[]).includes(value);
}

async function resolveTier(userId: string): Promise<SubscriptionTier> {
  if (!supabaseServer) {
    throw new Error("Supabase not configured");
  }

  const { data: rows, error } = await supabaseServer
    .from("user_subscriptions")
    .select("status, plan:plan_id(slug)")
    .eq("user_id", userId)
    .eq("status", "ACTIVE")
    .order("current_period_end", { ascending: false })
    .limit(1);

  if (error) {
    throw new Error(error.message);
  }

  let tier: SubscriptionTier = "FREE";

  if (rows && rows.length > 0) {
    const plan: any = (rows[0] as any).plan;
    const slug = plan?.slug as string | undefined;
    if (slug === "FREE" || slug === "PLUS" || slug === "ELITE") {
      tier = slug;
    }
  }

  return tier;
}

function computeNearbyLimit(tier: SubscriptionTier, entitlements: FeatureEntitlements): number {
  const anyEnt = entitlements as any;
  if (typeof anyEnt.maxNearbyIntentsResults === "number") {
    return anyEnt.maxNearbyIntentsResults;
  }

  switch (tier) {
    case "PLUS":
      return 25;
    case "ELITE":
      return 50;
    case "FREE":
    default:
      return 10;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const userId = await getUserIdFromRequest(req);

    // Determine requested intent (optional query param)
    let resolvedIntent: IntentType | "NONE" = "NONE";
    const queryIntent = req.query.intent;

    if (typeof queryIntent === "string") {
      if (!isValidIntent(queryIntent)) {
        res.status(400).json({ error: "Invalid intent" });
        return;
      }
      resolvedIntent = queryIntent as IntentType;
    } else if (Array.isArray(queryIntent) && queryIntent[0]) {
      const candidate = queryIntent[0];
      if (!isValidIntent(candidate)) {
        res.status(400).json({ error: "Invalid intent" });
        return;
      }
      resolvedIntent = candidate as IntentType;
    } else {
      // No intent in query: we could read the user's current intent; for v1, treat as NONE
      resolvedIntent = "NONE";
    }

    if (resolvedIntent === "NONE") {
      res.status(200).json([]);
      return;
    }

    const tier = await resolveTier(userId);
    const entitlements = getEntitlementsForTier(tier);
    const limit = computeNearbyLimit(tier, entitlements);

    const results = await findNearbyUsersWithIntent(userId, resolvedIntent as IntentType, limit);

    res.status(200).json(results);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }

    console.error("/api/intents/nearby error", err);

    const message = err instanceof Error && err.message ? err.message : "Unexpected error";
    res.status(500).json({ error: message });
  }
}
