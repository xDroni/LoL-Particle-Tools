const { contextBridge, ipcRenderer } = require('electron');

const ELECTRON_API = {
  startAutoLocating: () => ipcRenderer.send('start-auto-locating'),
  stopAutoLocating: () => ipcRenderer.send('stop-auto-locating'),
  getLeagueClient: () => ipcRenderer.invoke('get-league-client'),
  onClientNotFound: (stopLocatingFunc) => ipcRenderer.on('client-not-found', stopLocatingFunc),
  waitForToastNotification: (f) => ipcRenderer.on('toast-notification', (_, ...args) => f(...args)),
  sendToastNotification: (type, args) => ipcRenderer.invoke('send-toast-notification', type, args),
  calculateHash: async (imageSrc) => ipcRenderer.invoke('calculate-hash', imageSrc),
  sendHashResponse: (hash) => ipcRenderer.invoke('send-hash-response', hash),
  sendHashRequest: () => ipcRenderer.send('send-hash-request'),
  waitForHashResponse: () =>
    new Promise((resolve) => {
      ipcRenderer.on('hash-message', (_, message) => {
        resolve(message);
      });
    }),
  waitForHashRequest: (f) => ipcRenderer.on('hash-requested', (_, ...args) => f(...args))
};

contextBridge.exposeInMainWorld('electronAPI', ELECTRON_API);
