const { contextBridge, ipcRenderer } = require('electron');

const ELECTRON_API = {
  startAutoLocating: () => ipcRenderer.send('start-auto-locating'),
  stopAutoLocating: () => ipcRenderer.send('stop-auto-locating'),
  getLeagueClient: () => ipcRenderer.invoke('get-league-client'),
  sendLeagueClientReady: () => ipcRenderer.send('league-client-ready'),
  onClientNotFound: (stopLocatingFunc) => ipcRenderer.on('client-not-found', stopLocatingFunc),
  waitForToastNotification: (f) => ipcRenderer.on('toast-notification', (_, ...args) => f(...args)),
  sendToastNotification: (type, message) =>
    ipcRenderer.invoke('send-toast-notification', type, message),
  sendImageSrcResponse: (imageSrc) => ipcRenderer.invoke('send-imgsrc-response', imageSrc),
  sendImageSrcRequest: () => ipcRenderer.send('send-imgsrc-request'),
  waitForImageSrcResponse: () =>
    new Promise((resolve) => {
      const listener = (_, message) => {
        ipcRenderer.removeListener('imgsrc-message', listener);
        resolve(message);
      };
      return ipcRenderer.on('imgsrc-message', listener);
    }),
  waitForImageSrcRequest: (f) => ipcRenderer.on('imgsrc-requested', () => f())
};

contextBridge.exposeInMainWorld('electronAPI', ELECTRON_API);
