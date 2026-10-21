/**
 * Avatar deterministici per gli agenti: emoji + colore da hash dell’id.
 * Stesso agente = stesso aspetto su ogni avvio.
 */

const EMOJIS = [
  "🤖",
  "🦊",
  "🦉",
  "🐙",
  "🐯",
  "🐧",
  "🦄",
  "🐲",
  "🐝",
  "🐸",
  "🦁",
  "🐺",
  "🐬",
  "🦜",
  "🦋",
  "🦔",
  "🐨",
  "🦝",
  "🐱",
  "🐶",
  "🪄",
  "⚡",
  "🌙",
  "☀️",
];

const COLORS = [
  "#E11D48", // rose
  "#EA580C", // orange
  "#CA8A04", // yellow
  "#16A34A", // green
  "#0D9488", // teal
  "#2563EB", // blue
  "#7C3AED", // violet
  "#DB2777", // pink
  "#0891B2", // cyan
  "#4F46E5", // indigo
];

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type AgentAvatar = {
  emoji: string;
  color: string;
};

export function agentAvatar(agentId: string): AgentAvatar {
  const h = hashString(agentId.trim().toLowerCase() || "main");
  return {
    emoji: EMOJIS[h % EMOJIS.length]!,
    color: COLORS[(h >>> 8) % COLORS.length]!,
  };
}

/** Nome leggibile: capitalizza id tipo `main` → `Main`, lascia titoli già belli. */
export function displayAgentName(raw: string): string {
  const t = raw.trim();
  if (!t) return "Agente";
  if (/^[a-z0-9_-]+$/i.test(t) && t === t.toLowerCase()) {
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  return t;
}
