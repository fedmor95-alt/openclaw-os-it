import { DEFAULT_GATEWAY_URL } from "./defaults";

export interface Settings {
  gatewayUrl: string;
  token?: string;
  deviceToken?: string;
}

const STORAGE_KEY = "claw-settings-v1";

/** Impostazioni di default senza token (il token lo inserisce l’utente). */
export function defaultSettings(): Settings {
  return { gatewayUrl: DEFAULT_GATEWAY_URL };
}

/**
 * Restituisce le impostazioni salvate, oppure i default (URL gateway Tailscale)
 * se non c’è ancora nulla in localStorage. Il token resta undefined finché
 * l’utente non lo inserisce.
 */
export function getSettings(): Settings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings();
    const parsed = JSON.parse(raw) as Settings;
    if (!parsed.gatewayUrl) {
      return { ...parsed, gatewayUrl: DEFAULT_GATEWAY_URL };
    }
    return parsed;
  } catch {
    return defaultSettings();
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function saveDeviceToken(token: string): void {
  const settings = getSettings();
  if (settings) saveSettings({ ...settings, deviceToken: token });
}

export function clearDeviceToken(): void {
  const settings = getSettings();
  if (settings) {
    const { deviceToken: _, ...rest } = settings;
    saveSettings(rest as Settings);
  }
}

export function clearAuthCredentials(): void {
  const settings = getSettings();
  if (settings) {
    const { deviceToken: _dt, token: _t, ...rest } = settings;
    saveSettings(rest as Settings);
  }
}
