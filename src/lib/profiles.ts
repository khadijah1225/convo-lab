import profiles from "@/data/profiles.json";

export type Profile = {
  id: string;
  name: string;
  age?: number;
  occupation?: string;
  avatarUrl?: string;
  chat: string;
};

export function getProfiles(): Profile[] {
  return profiles as Profile[];
}

export function getProfileById(id: string): Profile | undefined {
  return getProfiles().find((p) => p.id === id);
}
