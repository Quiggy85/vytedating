import type { FeatureEntitlements, SubscriptionTier } from "@vyte/shared";

const FREE_ENTITLEMENTS: FeatureEntitlements = {
  maxAiOpenersPerDay: 3,
  meetMeHalfwayVenuesCount: 3,
  vibeRoomsJoinLimit: 2,
  boostsPerDay: 0,
  canCreateVibeRoom: false,
  canSeeWhoLikedMe: false,
  canUsePassport: false,
};

const PLUS_ENTITLEMENTS: FeatureEntitlements = {
  maxAiOpenersPerDay: 10,
  meetMeHalfwayVenuesCount: 5,
  vibeRoomsJoinLimit: 5,
  boostsPerDay: 1,
  canCreateVibeRoom: true,
  canSeeWhoLikedMe: false,
  canUsePassport: false,
};

const ELITE_ENTITLEMENTS: FeatureEntitlements = {
  maxAiOpenersPerDay: 50,
  meetMeHalfwayVenuesCount: 10,
  vibeRoomsJoinLimit: 10,
  boostsPerDay: 3,
  canCreateVibeRoom: true,
  canSeeWhoLikedMe: true,
  canUsePassport: true,
};

export function getEntitlementsForTier(tier: SubscriptionTier): FeatureEntitlements {
  switch (tier) {
    case "PLUS":
      return PLUS_ENTITLEMENTS;
    case "ELITE":
      return ELITE_ENTITLEMENTS;
    case "FREE":
    default:
      return FREE_ENTITLEMENTS;
  }
}
