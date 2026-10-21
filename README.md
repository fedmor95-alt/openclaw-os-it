# OpenClaw — client desktop italiano

Client a finestra semplice per parlare con gli agenti del tuo gateway OpenClaw. Interfaccia in italiano, stile pulito (lista agenti a sinistra, chat a destra). Niente pannelli tecnici in vista: log, tool call e opzioni avanzate stanno sotto **Impostazioni → Avanzate**.

Fork di [OpenClaw OS](https://github.com/thesysdev/openclaw-os), adattato per uso desktop su Windows.

## Requisiti

- Windows 10/11
- Node.js ≥ 20
- [pnpm](https://pnpm.io/) ≥ 9
- Gateway OpenClaw raggiungibile (di default via Tailscale: `wss://steamdeck.tail9f17e3.ts.net`)

## Installazione (sviluppo)

```powershell
git clone <url-di-questo-repo>
cd openclaw-os-it
pnpm install
```

## Configurazione del token

1. Avvia l’app (vedi sotto).
2. Si apre **Impostazioni**.
3. Controlla l’**URL del gateway** (precompilato con `wss://steamdeck.tail9f17e3.ts.net`).
4. Incolla il **token** del gateway (`gateway.auth.token` nella config OpenClaw sul server).
5. Clicca **Salva e connetti**.

Il token resta solo in `localStorage` su questo PC. Non viene scritto nel codice, nei commit o nei log.

Se il gateway chiede l’approvazione del dispositivo, esegui sul server il comando mostrato a schermo (`openclaw devices approve …`).

## Avvio in sviluppo (browser)

```powershell
pnpm dev
```

Apri `http://localhost:18790`.

## App desktop Windows

Costruisce l’UI statica e la pacchetta con Electron:

```powershell
# Solo cartella eseguibile (più veloce, per prova)
pnpm desktop:dir

# Installer NSIS + portable .exe
pnpm desktop:build
```

Gli artefatti finiscono in:

```
packages/desktop/release/
```

Tipici file:

- `OpenClaw Setup … .exe` — installer
- `OpenClaw-…-portable.exe` — versione portable
- `win-unpacked/OpenClaw.exe` — dopo `desktop:dir`

Avvio rapido senza installer (dopo `desktop:dir`):

```powershell
.\packages\desktop\release\win-unpacked\OpenClaw.exe
```

Oppure in modalità sviluppo Electron (serve già `out/`):

```powershell
pnpm desktop:dev
```

## Uso quotidiano

1. Apri OpenClaw.
2. Nella barra laterale scegli un agente (icona colorata + nome).
3. Scrivi, allega immagini/file, leggi le risposte in streaming (markdown).
4. Se la finestra non è in primo piano, ricevi una notifica desktop e un badge sui non letti.

## Protocollo

Il client negozia il protocollo gateway **v4** (già presente nel codice originale).

## Licenza

MIT — vedi `LICENSE`.
