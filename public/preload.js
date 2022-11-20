const { contextBridge, ipcRenderer } = require('electron');

const WINDOW_API = {
  autoParticleLocating: () => ipcRenderer.invoke('autoParticleLocating'),
  getSources: () => ipcRenderer.invoke('get-sources'),
  calculateHash: (imageSrc) => ipcRenderer.invoke('calculate-hash', imageSrc)
};

contextBridge.exposeInMainWorld('electronAPI', WINDOW_API);
