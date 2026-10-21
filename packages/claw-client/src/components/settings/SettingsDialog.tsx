"use client";

import { Wifi, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { IconButton } from "@/components/layout/sidebar/IconButton";
import { PreferencesPanel } from "@/components/settings/PreferencesPanel";
import { Button } from "@/components/ui/Button";
import { DEFAULT_GATEWAY_URL } from "@/lib/defaults";
import { ConnectionState } from "@/lib/gateway/types";
import { validateGatewayUrl } from "@/lib/gateway/url";
import { setPreferences, usePreferences } from "@/lib/preferences";
import type { Settings } from "@/lib/storage";

interface Props {
  open: boolean;
  currentSettings: Settings | null;
  connectionState: ConnectionState;
  onClose: () => void;
  onSave: (settings: Settings) => void;
}

const STATUS_BANNER: Record<
  ConnectionState,
  {
    label: string;
    description: string;
    accent: string;
    tileBg: string;
    tileBorder: string;
    icon: typeof Wifi;
    pulse?: boolean;
  }
> = {
  [ConnectionState.CONNECTED]: {
    label: "Connesso",
    description: "Il gateway è raggiungibile e pronto.",
    accent: "text-text-success-primary",
    tileBg: "bg-success-background",
    tileBorder: "border-border-success/50",
    icon: Wifi,
  },
  [ConnectionState.CONNECTING]: {
    label: "Connessione…",
    description: "Sto contattando il gateway.",
    accent: "text-text-alert-primary",
    tileBg: "bg-alert-background",
    tileBorder: "border-border-alert/50",
    icon: Wifi,
    pulse: true,
  },
  [ConnectionState.PAIRING]: {
    label: "Approvazione dispositivo…",
    description: "Attendo l’handshake con il gateway.",
    accent: "text-text-alert-primary",
    tileBg: "bg-alert-background",
    tileBorder: "border-border-alert/50",
    icon: Wifi,
    pulse: true,
  },
  [ConnectionState.DISCONNECTED]: {
    label: "Disconnesso",
    description: "Inserisci l’URL del gateway e il token, poi salva.",
    accent: "text-text-danger-primary",
    tileBg: "bg-danger-background",
    tileBorder: "border-border-danger/50",
    icon: WifiOff,
  },
  [ConnectionState.AUTH_FAILED]: {
    label: "Autenticazione fallita",
    description: "Il token è stato rifiutato. Controllalo nelle impostazioni.",
    accent: "text-text-danger-primary",
    tileBg: "bg-danger-background",
    tileBorder: "border-border-danger/50",
    icon: WifiOff,
  },
  [ConnectionState.UNREACHABLE]: {
    label: "Non raggiungibile",
    description: "Non riesco a raggiungere il gateway. Verifica Tailscale e l’URL.",
    accent: "text-text-danger-primary",
    tileBg: "bg-danger-background",
    tileBorder: "border-border-danger/50",
    icon: WifiOff,
  },
};

export function SettingsDialog({ open, currentSettings, connectionState, onClose, onSave }: Props) {
  const prefs = usePreferences();
  const [gatewayUrl, setGatewayUrl] = useState(
    currentSettings?.gatewayUrl ?? DEFAULT_GATEWAY_URL,
  );
  const [token, setToken] = useState(currentSettings?.token ?? "");
  const [pending, setPending] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const submitSnapshotRef = useRef<ConnectionState | null>(null);
  const hasLeftSnapshotRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!open) return;
    setGatewayUrl(currentSettings?.gatewayUrl ?? DEFAULT_GATEWAY_URL);
    setToken(currentSettings?.token ?? "");
    setPending(false);
    submitSnapshotRef.current = null;
    hasLeftSnapshotRef.current = false;
    setError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  useEffect(() => {
    if (!pending) return;
    const snapshot = submitSnapshotRef.current;
    if (snapshot !== null && connectionState !== snapshot) {
      hasLeftSnapshotRef.current = true;
    }
    if (snapshot !== null && !hasLeftSnapshotRef.current) return;
    if (connectionState === ConnectionState.CONNECTED) {
      setPending(false);
      submitSnapshotRef.current = null;
      hasLeftSnapshotRef.current = false;
      setError(null);
      onClose();
    } else if (connectionState === ConnectionState.UNREACHABLE) {
      setPending(false);
      submitSnapshotRef.current = null;
      hasLeftSnapshotRef.current = false;
      setError("Impossibile raggiungere il gateway a quell’URL. Controlla Tailscale e riprova.");
    } else if (connectionState === ConnectionState.AUTH_FAILED) {
      setPending(false);
      submitSnapshotRef.current = null;
      hasLeftSnapshotRef.current = false;
      setError("Il gateway ha rifiutato il token. Verifica il token e riprova.");
    }
  }, [pending, connectionState, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = gatewayUrl.trim();
    const validation = validateGatewayUrl(trimmedUrl);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    const trimmedToken = token.trim() || undefined;
    const credsChanged =
      trimmedUrl !== currentSettings?.gatewayUrl || trimmedToken !== currentSettings?.token;
    const newSettings: Settings = {
      gatewayUrl: trimmedUrl,
      token: trimmedToken,
      deviceToken: credsChanged ? undefined : currentSettings?.deviceToken,
    };
    setError(null);
    setPending(true);
    submitSnapshotRef.current = connectionState;
    hasLeftSnapshotRef.current = false;
    onSave(newSettings);
  };

  const banner = STATUS_BANNER[connectionState];
  const Icon = banner.icon;

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg rounded-2xl border border-border-default/50 bg-background p-l text-text-neutral-primary shadow-2xl outline-none backdrop:bg-overlay dark:border-border-default/16 dark:bg-foreground"
      onClose={onClose}
    >
      <div className="flex max-h-[85vh] flex-col overflow-y-auto">
        <div className="mb-ml flex items-center justify-between">
          <h2 className="font-heading text-md font-bold text-text-neutral-primary">Impostazioni</h2>
          <IconButton
            icon={X}
            variant="tertiary"
            size="md"
            title="Chiudi"
            aria-label="Chiudi"
            onClick={onClose}
          />
        </div>

        <div className="mb-ml flex items-stretch gap-m rounded-lg border border-border-default/50 bg-background p-m dark:border-border-default/16 dark:bg-foreground">
          <div
            className={`flex h-2xl w-2xl shrink-0 items-center justify-center rounded-md border ${banner.tileBg} ${banner.tileBorder}`}
          >
            <Icon size={16} className={`${banner.accent} ${banner.pulse ? "animate-pulse" : ""}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-label text-sm font-medium leading-tight text-text-neutral-primary">
              {banner.label}
            </p>
            <p className="mt-3xs font-body text-md leading-snug text-text-neutral-tertiary">
              {banner.description}
            </p>
          </div>
        </div>

        <p className="mb-ml font-body text-md leading-snug text-text-neutral-tertiary">
          Collega l’app al gateway OpenClaw. L’URL predefinito punta al Steam Deck via Tailscale.
          Il token si salva solo su questo computer — non viene mai inviato nei log o nei commit.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-l">
          <div className="flex flex-col gap-xs">
            <label className="font-label text-sm font-medium text-text-neutral-secondary">
              URL del gateway
            </label>
            <input
              type="url"
              required
              placeholder={DEFAULT_GATEWAY_URL}
              value={gatewayUrl}
              onChange={(e) => setGatewayUrl(e.target.value)}
              disabled={pending}
              className="rounded-lg border border-border-default bg-background px-m py-s font-body text-md text-text-neutral-primary outline-none focus:border-border-interactive-emphasis disabled:opacity-60 dark:border-border-default/16 dark:bg-foreground"
            />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label text-sm font-medium text-text-neutral-secondary">
              Token di autenticazione
            </label>
            <input
              type="password"
              placeholder="Incolla il token del gateway"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={pending}
              autoComplete="off"
              className="rounded-lg border border-border-default bg-background px-m py-s font-body text-md text-text-neutral-primary outline-none focus:border-border-interactive-emphasis disabled:opacity-60 dark:border-border-default/16 dark:bg-foreground"
            />
            <p className="font-body text-sm text-text-neutral-tertiary">
              Lo trovi in <code className="font-mono">gateway.auth.token</code> nella config
              OpenClaw sul server. Salvato solo in locale.
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-border-danger bg-danger-background px-m py-s font-body text-md text-text-danger-primary"
            >
              {error}
            </div>
          ) : null}

          {pending ? (
            <div className="flex items-center gap-xs font-body text-md text-text-neutral-tertiary">
              <Wifi size={14} className="animate-pulse" />
              Connessione in corso…
            </div>
          ) : null}

          <div className="mt-s flex justify-end gap-s">
            <Button variant="secondary" size="md" onClick={onClose}>
              Annulla
            </Button>
            <Button variant="primary" size="md" type="submit" disabled={pending}>
              {pending ? "Connessione…" : "Salva e connetti"}
            </Button>
          </div>
        </form>

        <div className="mt-l border-t border-border-default/40 pt-ml dark:border-border-default/16">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="mb-m flex w-full items-center justify-between text-left text-sm font-medium text-text-neutral-secondary hover:text-text-neutral-primary"
          >
            <span>Avanzate</span>
            <span className="text-text-neutral-tertiary">{advancedOpen ? "▾" : "▸"}</span>
          </button>
          {advancedOpen ? (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-text-neutral-secondary">
                  Dettagli tecnici in chat
                </label>
                <p className="text-sm text-text-neutral-tertiary">
                  Mostra tool call, reasoning, scelta modello e token. Di solito resta spento.
                </p>
                <div className="mt-1 inline-flex gap-1 rounded-lg border border-border-default bg-foreground p-1">
                  {(
                    [
                      { value: false, label: "Nascosti" },
                      { value: true, label: "Visibili" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => setPreferences({ showAdvanced: opt.value })}
                      className={`rounded-md px-3 py-1 text-sm transition-colors ${
                        prefs.showAdvanced === opt.value
                          ? "bg-background text-text-neutral-primary shadow-sm"
                          : "text-text-neutral-secondary hover:text-text-neutral-primary"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <PreferencesPanel />
            </div>
          ) : null}
        </div>
      </div>
    </dialog>
  );
}
