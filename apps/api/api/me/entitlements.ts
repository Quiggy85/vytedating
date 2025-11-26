import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getUserIdFromRequest, AuthError } from "../../src/lib/auth";
import { supabaseServer } from "../../src/lib/supabaseClient";
import { getEntitlementsForTier } from "../../src/lib/entitlements";
import type { FeatureEntitlements, SubscriptionTier } from "@vyte/shared";

interface MeEntitlementsResponse {
  tier: SubscriptionTier;
  entitlements: FeatureEntitlements;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const userId = await getUserIdFromRequest(req);

    if (!supabaseServer) {
      res.status(500).json({ error: "Supabase not configured" });
      return;
    }

    // Find the user's active subscription, if any
    const { data: rows, error } = await supabaseServer
      .from("user_subscriptions")
      .select("status, plan:plan_id(slug)")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("current_period_end", { ascending: false })
      .limit(1);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    let tier: SubscriptionTier = "FREE";

    if (rows && rows.length > 0) {
      // row.plan will be a single joined object because we used plan:plan_id(slug)
      const plan: any = (rows[0] as any).plan;
      const slug = plan?.slug as string | undefined;
      if (slug === "FREE" || slug === "PLUS" || slug === "ELITE") {
        tier = slug;
      }
    }

    const entitlements = getEntitlementsForTier(tier);

    const response: MeEntitlementsResponse = { tier, entitlements };

    res.status(200).json(response);
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(401).json({ error: err.message });
      return;
    }

    res.status(500).json({ error: "Unexpected error" });
  }
}
