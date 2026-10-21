/**
 * Processo principale Electron — apre una finestra e serve l’UI statica
 * di claw-client su localhost (più affidabile di file:// con Next.js).
 * Non legge né registra mai il token del gateway.
 */

const { app, BrowserWindow, shell, Notification } = require("electron");
const http = require("http");
const path = require("path");
const fs = require("fs");
const handler = require("serve-handler");

const PREFERRED_PORT = 18790;
let mainWindow = null;
let staticServer = null;
let uiOrigin = null;

function resolveUiRoot() {
  // In produzione: resources/ui (extraResources). In dev: claw-client/out.
  const packaged = path.join(process.resourcesPath, "ui");
  if (fs.existsSync(path.join(packaged, "index.html"))) return packaged;
  const dev = path.join(__dirname, "..", "claw-client", "out");
  if (fs.existsSync(path.join(dev, "index.html"))) return dev;
  return null;
}

function startStaticServer(uiRoot) {
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) =>
      handler(request, response, {
        public: uiRoot,
        rewrites: [{ source: "**", destination: "/index.html" }],
      }),
    );

    const tryListen = (port) => {
      server.once("error", (err) => {
        if (err.code === "EADDRINUSE" && port < PREFERRED_PORT + 20) {
          tryListen(port + 1);
          return;
        }
        reject(err);
      });
      server.listen(port, "127.0.0.1", () => {
        staticServer = server;
        uiOrigin = `http://127.0.0.1:${port}`;
        resolve(uiOrigin);
      });
    };

    tryListen(PREFERRED_PORT);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 780,
    minWidth: 880,
    minHeight: 560,
    title: "OpenClaw",
    backgroundColor: "#0E0E0E",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  void mainWindow.loadURL(uiOrigin);

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  const uiRoot = resolveUiRoot();
  if (!uiRoot) {
    console.error(
      "[openclaw-desktop] UI non trovata. Esegui prima: pnpm --filter @openuidev/claw-client build:desktop",
    );
    app.quit();
    return;
  }

  try {
    await startStaticServer(uiRoot);
  } catch (err) {
    console.error("[openclaw-desktop] Impossibile avviare il server UI:", err);
    app.quit();
    return;
  }

  if (Notification.isSupported()) {
    // Permessi notifiche: su Windows bastano le Notification Web API nella pagina.
  }

  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (staticServer) {
    staticServer.close();
    staticServer = null;
  }
  if (process.platform !== "darwin") app.quit();
});
