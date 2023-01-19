const { contextBridge, ipcRenderer } = require('electron');
// const fs = require('fs');
// const path = require('path');

const ELECTRON_API = {
  startAutoLocating: () => ipcRenderer.send('start-auto-locating'),
  stopAutoLocating: () => ipcRenderer.send('stop-auto-locating'),
  getSources: () => ipcRenderer.invoke('get-sources'),
  calculateHash: async (imageSrc) => {
    //  // save file for testing purposes
    // fs.writeFileSync(
    //   `${path.join(__dirname, 'data', Date.now().toString())}.bmp`,
    //   imageSrc.replace(/^data:image\/png;base64,/, ''),
    //   { encoding: 'base64' }
    // );
    return ipcRenderer.invoke('calculate-hash', imageSrc);
  },
  sendHashResponse: (hash) => ipcRenderer.invoke('send-hash-response', hash),
  sendHashRequest: () => ipcRenderer.send('send-hash-request'),
  waitForHashResponse: () =>
    new Promise((resolve) => {
      ipcRenderer.on('hash-message', (event, message) => {
        resolve(message);
      });
    }),
  waitForHashRequest: (f) => {
    ipcRenderer.on('hash-requested', async (event, ...args) => await f(...args));
  }
};

contextBridge.exposeInMainWorld('electronAPI', ELECTRON_API);
