import type { VercelRequest, VercelResponse } from "@vercel/node";
import { SubscriptionTier, UserProfile } from "@vyte/shared";

// Vercel-style handler: this file can be deployed as an API route
// (e.g. /api/health) when mapped appropriately in the project config.
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === "GET" && req.url?.includes("/health")) {
    const mockUser: UserProfile = {
      id: "user_1",
      displayName: "HealthCheck",
      birthdate: "2000-01-01",
      gender: "NON_SPECIFIED",
      bio: null,
      locationLat: null,
      locationLng: null,
      locationCity: null,
      locationCountry: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const tier: SubscriptionTier = "FREE";

    res.status(200).json({ status: "ok", tier });
    return;
  }

  res.status(404).send("Not found");
}
