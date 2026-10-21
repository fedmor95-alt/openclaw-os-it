"use client";

import { agentAvatar, displayAgentName } from "@/lib/agent-avatar";
import { APP_NAME, APP_TAGLINE } from "@/lib/defaults";
import { ConnectionState } from "@/lib/gateway/types";
import { navigate, useHashRoute } from "@/lib/hooks/useHashRoute";
import { useUnreadCounts } from "@/lib/unread";
import type { ClawThread } from "@/types/claw-thread";
import { useThreadList } from "@openuidev/react-headless";
import { Moon, Settings, Sun, Wifi, WifiOff } from "lucide-react";
import { useEffect, useMemo } from "react";

type AgentRow = {
  agentId: string;
  name: string;
  mainThreadId: string;
};

function buildAgents(threads: ClawThread[]): AgentRow[] {
  const map = new Map<string, AgentRow>();
  for (const t of threads) {
    const aid = t.clawAgentId ?? t.id;
    const existing = map.get(aid);
    const name =
      t.clawKind === "main" ? displayAgentName(t.title || aid) : (existing?.name ?? displayAgentName(aid));
    if (!existing) {
      map.set(aid, {
        agentId: aid,
        name,
        mainThreadId: t.clawKind === "main" ? t.id : t.id,
      });
    } else if (t.clawKind === "main") {
      map.set(aid, { ...existing, name, mainThreadId: t.id });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "it"));
}

const STATUS_LABEL: Record<ConnectionState, string> = {
  [ConnectionState.DISCONNECTED]: "Disconnesso",
  [ConnectionState.CONNECTING]: "Connessione…",
  [ConnectionState.CONNECTED]: "Connesso",
  [ConnectionState.AUTH_FAILED]: "Token non valido",
  [ConnectionState.PAIRING]: "In attesa di approvazione…",
  [ConnectionState.UNREACHABLE]: "Gateway non raggiungibile",
};

interface Props {
  connectionState: ConnectionState;
  onSettingsClick: () => void;
  themeMode: "light" | "dark";
  onToggleThemeMode: () => void;
  hiddenThreadIds?: Set<string>;
}

export function SimpleAgentsSidebar({
  connectionState,
  onSettingsClick,
  themeMode,
  onToggleThemeMode,
  hiddenThreadIds = new Set(),
}: Props) {
  const { threads, isLoadingThreads, selectThread } = useThreadList();
  const threadsCast = (threads as ClawThread[]).filter((t) => !hiddenThreadIds.has(t.id));
  const agents = useMemo(() => buildAgents(threadsCast), [threadsCast]);
  const unread = useUnreadCounts();
  const route = useHashRoute();
  const activeSessionId = route?.view === "chat" ? route.sessionId : null;

  const activeAgentId = useMemo(() => {
    if (!activeSessionId) return null;
    const t = threadsCast.find((x) => x.id === activeSessionId);
    return t?.clawAgentId ?? t?.id ?? null;
  }, [activeSessionId, threadsCast]);

  // All’avvio, apri la chat del primo agente se non c’è una rotta chat.
  useEffect(() => {
    if (isLoadingThreads) return;
    if (route?.view === "chat") return;
    const first = agents[0];
    if (!first) return;
    selectThread(first.mainThreadId);
    navigate({ view: "chat", sessionId: first.mainThreadId });
  }, [isLoadingThreads, agents, route?.view, selectThread]);

  const connected = connectionState === ConnectionState.CONNECTED;
  const StatusIcon = connected ? Wifi : WifiOff;

  return (
    <aside className="relative flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-border-default/40 bg-foreground dark:border-border-default/16 dark:bg-sunk-deep">
      <div className="flex h-14 items-center gap-3 border-b border-border-default/40 px-4 dark:border-border-default/16">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-text-neutral-primary text-lg text-background">
          🦞
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-heading text-md font-bold text-text-neutral-primary">
            {APP_NAME}
          </div>
          <div className="truncate text-xs text-text-neutral-tertiary">{APP_TAGLINE}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 text-xs text-text-neutral-tertiary">
        <StatusIcon
          size={12}
          className={connected ? "text-status-online" : "text-text-danger-primary"}
        />
        <span className={connected ? "text-status-online" : undefined}>
          {STATUS_LABEL[connectionState]}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
        {isLoadingThreads ? (
          <p className="px-3 py-4 text-sm text-text-neutral-tertiary">Caricamento agenti…</p>
        ) : agents.length === 0 ? (
          <p className="px-3 py-4 text-sm text-text-neutral-tertiary">
            {connected
              ? "Nessun agente trovato sul gateway."
              : "Collega il gateway dalle impostazioni."}
          </p>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {agents.map((agent) => {
              const avatar = agentAvatar(agent.agentId);
              const active = activeAgentId === agent.agentId;
              const count = unread[agent.agentId] ?? 0;
              return (
                <li key={agent.agentId}>
                  <button
                    type="button"
                    onClick={() => {
                      selectThread(agent.mainThreadId);
                      navigate({ view: "chat", sessionId: agent.mainThreadId });
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "bg-background text-text-neutral-primary shadow-sm dark:bg-elevated"
                        : "text-text-neutral-secondary hover:bg-sunk-light/80 dark:hover:bg-foreground"
                    }`}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg"
                      style={{ backgroundColor: `${avatar.color}22`, color: avatar.color }}
                      aria-hidden
                    >
                      {avatar.emoji}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium text-sm">{agent.name}</span>
                    {count > 0 ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-text-danger-primary px-1.5 text-[11px] font-semibold text-white">
                        {count > 99 ? "99+" : count}
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-1 border-t border-border-default/40 p-2 dark:border-border-default/16">
        <button
          type="button"
          onClick={onToggleThemeMode}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-neutral-tertiary hover:bg-sunk-light hover:text-text-neutral-primary dark:hover:bg-foreground"
          title={themeMode === "dark" ? "Tema chiaro" : "Tema scuro"}
        >
          {themeMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          type="button"
          onClick={onSettingsClick}
          className="flex h-9 flex-1 items-center gap-2 rounded-lg px-3 text-sm text-text-neutral-secondary hover:bg-sunk-light hover:text-text-neutral-primary dark:hover:bg-foreground"
        >
          <Settings size={16} />
          Impostazioni
        </button>
      </div>
    </aside>
  );
}
