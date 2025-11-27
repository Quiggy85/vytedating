export type IntentType =
  | "NONE"
  | "JUST_CHAT"
  | "DRINKS"
  | "DATE"
  | "SEE_WHERE_IT_GOES";

export interface UserIntent {
  userId: string;
  intent: IntentType;
  updatedAt: string; // ISO timestamp
}
