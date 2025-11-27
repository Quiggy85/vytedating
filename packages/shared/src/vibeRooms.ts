import type { IntentType, UserProfile } from "./index";

export interface VibeRoom {
  id: string;
  city: string;
  country: string;
  intent: IntentType;
  createdAt: string;
  isActive: boolean;
}

export interface VibeRoomMember {
  roomId: string;
  userId: string;
  joinedAt: string;
  lastSeenAt: string;
  profile: UserProfile | null;
}

export interface VibeRoomWithMembers extends VibeRoom {
  members: VibeRoomMember[];
}
