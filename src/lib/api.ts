const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7000";

export interface UserConfig {
  userId: string;
  groqKey: string;
  deepseekKey: string;
  geminiKey: string;
  traktConnected: boolean;
  hasTrakt: boolean;
  genres: string[] | null;
  contentTypes: string[] | null;
  language: string;
  mood: string;
  minRating: number;
}

export interface CreateConfigResponse {
  userId: string;
  addonURL: string;
  configURL: string;
}

export interface ConfigPayload {
  groqKey: string;
  deepseekKey: string;
  geminiKey: string;
  genres: string[];
  contentTypes: string[];
  language: string;
  mood: string;
  minRating: number;
}

export async function getConfig(userId: string): Promise<UserConfig> {
  const res = await fetch(`${API_URL}/api/config/${userId}`);
  if (!res.ok) throw new Error("User not found");
  return res.json();
}

export async function createConfig(
  data: ConfigPayload
): Promise<CreateConfigResponse> {
  const res = await fetch(`${API_URL}/api/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create config");
  return res.json();
}

export async function updateConfig(
  userId: string,
  data: ConfigPayload
): Promise<void> {
  const res = await fetch(`${API_URL}/api/config/${userId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update config");
}

export async function disconnectTrakt(userId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/trakt/disconnect/${userId}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to disconnect Trakt");
}

export function getTraktAuthURL(userId: string): string {
  return `${API_URL}/api/trakt/auth/${userId}`;
}

export function getAddonURL(userId: string): string {
  return `${API_URL}/${userId}/manifest.json`;
}

export function getInstallURL(userId: string): string {
  const url = getAddonURL(userId);
  return `stremio://${url.replace(/^https?:\/\//, "")}`;
}
