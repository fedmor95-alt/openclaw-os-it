/**
 * Badge non letti per agente — solo locale, senza token o contenuti sensibili.
 */

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "claw-unread-v1";

type UnreadMap = Record<string, number>;

let cached: UnreadMap | null = null;
const listeners = new Set<() => void>();

function read(): UnreadMap {
  if (cached) return cached;
  if (typeof localStorage === "undefined") {
    cached = {};
    return cached;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    cached = raw ? (JSON.parse(raw) as UnreadMap) : {};
  } catch {
    cached = {};
  }
  return cached;
}

function write(next: UnreadMap): void {
  cached = next;
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  for (const fn of listeners) fn();
}

export function getUnreadCounts(): UnreadMap {
  return read();
}

export function getUnread(agentId: string): number {
  return read()[agentId] ?? 0;
}

export function bumpUnread(agentId: string, by = 1): void {
  if (!agentId) return;
  const cur = read();
  write({ ...cur, [agentId]: (cur[agentId] ?? 0) + by });
}

export function clearUnread(agentId: string): void {
  if (!agentId) return;
  const cur = { ...read() };
  if (!(agentId in cur)) return;
  delete cur[agentId];
  write(cur);
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useUnreadCounts(): UnreadMap {
  return useSyncExternalStore(subscribe, getUnreadCounts, () => ({}));
}
