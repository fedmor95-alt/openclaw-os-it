export type GatewayUrlValidation = { ok: true } | { ok: false; error: string };

/**
 * Client-side gateway URL check. Catches the common typos (missing protocol,
 * `http://` instead of `ws://`, port out of range) before we hand the URL to
 * `new WebSocket()`, which would either throw synchronously or silently fail
 * to connect — both bad UX. Defense-in-depth: the socket layer also catches
 * a sync throw and surfaces UNREACHABLE.
 */
export function validateGatewayUrl(raw: string): GatewayUrlValidation {
  if (!raw) return { ok: false, error: "L’URL del gateway è obbligatorio." };
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return {
      ok: false,
      error: "URL non valido. Usa ws://host:porta oppure wss://host:porta.",
    };
  }
  if (parsed.protocol !== "ws:" && parsed.protocol !== "wss:") {
    return {
      ok: false,
      error: `Protocollo non supportato "${parsed.protocol}". Usa ws:// in locale o wss:// in remoto.`,
    };
  }
  if (!parsed.hostname) {
    return { ok: false, error: "Nell’URL manca l’hostname." };
  }
  return { ok: true };
}
