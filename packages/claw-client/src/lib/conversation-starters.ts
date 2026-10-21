/**
 * Prompt di avvio sulla chat vuota.
 */

export interface ConversationStarter {
  displayText: string;
  prompt: string;
  accent?: "info" | "accent" | "success" | "alert";
  iconKey?: "newspaper" | "radar" | "trending-up" | "search-check";
}

export const DEFAULT_STARTERS: ConversationStarter[] = [
  {
    displayText: "Riassumimi le novità di oggi",
    prompt:
      "Riassumimi le novità più importanti di oggi su tecnologia e AI, in italiano, in modo chiaro e breve.",
    accent: "info",
    iconKey: "newspaper",
  },
  {
    displayText: "Aiutami a pianificare la giornata",
    prompt:
      "Aiutami a pianificare la giornata: chiedimi priorità e impegni, poi proponi un piano realistico in italiano.",
    accent: "accent",
    iconKey: "radar",
  },
  {
    displayText: "Spiegami qualcosa in modo semplice",
    prompt:
      "Sono pronto: chiedimi di cosa voglio una spiegazione semplice e chiara, in italiano.",
    accent: "success",
    iconKey: "trending-up",
  },
  {
    displayText: "Controlla un testo che ti passo",
    prompt:
      "Chiedimi di incollare un testo e poi correggilo o migliorarlo in italiano, senza cambiare il senso.",
    accent: "alert",
    iconKey: "search-check",
  },
];
