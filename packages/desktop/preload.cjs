/**
 * Preload minimale — espone solo un flag “siamo in Electron”.
 * Nessun token o credenziale passa da qui.
 */

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("openclawDesktop", {
  isDesktop: true,
  platform: process.platform,
});
