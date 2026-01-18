// ============================================================================
// profile data utilities
// loads profiles from the json file and provides helper functions
// the chat history is stored here but hidden from the client ui
// ============================================================================

import profiles from "@/data/profiles.json";

// profile type - what we store in profiles.json
export type Profile = {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  avatarUrl?: string;
  chat: string;  // the chat history used for analysis
};

// get all profiles
export function getProfiles(): Profile[] {
  return profiles as Profile[];
}

// get a single profile by id
export function getProfileById(id: string): Profile | undefined {
  return getProfiles().find((p) => p.id === id);
}

// get profile card data (without chat history - for ui display)
export function getProfileCards(): Omit<Profile, "chat">[] {
  return getProfiles().map(({ chat, ...rest }) => rest);
}
