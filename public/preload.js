const { contextBridge, ipcRenderer } = require('electron');

const WINDOW_API = {
  startAutoLocating: () => ipcRenderer.send('start-auto-locating'),
  getSources: () => ipcRenderer.invoke('get-sources'),
  calculateHash: async (imageSrc) => ipcRenderer.invoke('calculate-hash', imageSrc),
  sendHashResponse: (hash) => ipcRenderer.invoke('send-hash-response', hash),
  sendHashRequest: () => ipcRenderer.send('send-hash-request'),
  waitForHashResponse: () =>
    new Promise((resolve) => {
      ipcRenderer.on('hash-message', (event, message) => {
        resolve(message);
      });
    }),
  waitForHashRequest: (f) => {
    console.log('on wait for hash request');
    f();
    ipcRenderer.on('wait-for-hash-request', (event, ...args) => f(...args));
  }
};

contextBridge.exposeInMainWorld('electronAPI', WINDOW_API);
