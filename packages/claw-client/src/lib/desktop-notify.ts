/**
 * Notifiche desktop del sistema operativo.
 * Non include mai token, URL gateway o contenuti di messaggi grezzi nei log.
 */

import { isTabHidden } from "./chime";

export function isWindowInBackground(): boolean {
  if (typeof document === "undefined") return false;
  if (document.visibilityState === "hidden") return true;
  if (typeof document.hasFocus === "function" && !document.hasFocus()) return true;
  return isTabHidden();
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  try {
    const result = await Notification.requestPermission();
    return result === "granted";
  } catch {
    return false;
  }
}

/**
 * Mostra una notifica solo se la finestra non è in primo piano.
 * `body` deve essere un anteprima corta, senza segreti.
 */
export async function notifyAgentReply(opts: {
  agentName: string;
  body?: string;
  onClick?: () => void;
}): Promise<void> {
  if (!isWindowInBackground()) return;
  const ok = await ensureNotificationPermission();
  if (!ok) return;

  try {
    const n = new Notification(`${opts.agentName} ha risposto`, {
      body: opts.body?.slice(0, 140) || "Nuovo messaggio",
      silent: false,
      tag: `openclaw-reply:${opts.agentName}`,
    });
    if (opts.onClick) {
      n.onclick = () => {
        try {
          window.focus();
        } catch {
          /* ignore */
        }
        opts.onClick?.();
        n.close();
      };
    }
  } catch {
    /* Notification API non disponibile (es. permesso revocato a runtime) */
  }
}
