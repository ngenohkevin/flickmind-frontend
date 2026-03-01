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

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const body = await res.json();
    return body.error || body.message || fallback;
  } catch {
    if (res.status === 404) return "Not found";
    if (res.status === 500) return "Server error — please try again later";
    if (res.status === 0) return "Network error — check your connection";
    return `${fallback} (${res.status})`;
  }
}

export async function getConfig(userId: string): Promise<UserConfig> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/config/${userId}`);
  } catch {
    throw new Error("Cannot reach server — check your connection");
  }
  if (!res.ok) throw new Error(await parseError(res, "User not found"));
  return res.json();
}

export async function createConfig(
  data: ConfigPayload
): Promise<CreateConfigResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Cannot reach server — check your connection");
  }
  if (!res.ok) throw new Error(await parseError(res, "Failed to create config"));
  return res.json();
}

export async function updateConfig(
  userId: string,
  data: ConfigPayload
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/config/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error("Cannot reach server — check your connection");
  }
  if (!res.ok) throw new Error(await parseError(res, "Failed to update config"));
}

export async function disconnectTrakt(userId: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/trakt/disconnect/${userId}`, {
      method: "POST",
    });
  } catch {
    throw new Error("Cannot reach server — check your connection");
  }
  if (!res.ok)
    throw new Error(await parseError(res, "Failed to disconnect Trakt"));
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
