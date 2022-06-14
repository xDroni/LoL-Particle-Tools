const electron = require('electron');
const { app } = electron;
const { BrowserWindow } = electron;

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    fullscreen: false,
    webPreferences: { webSecurity: false, spellcheck: false }
  });
  mainWindow.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`
  );
  mainWindow.webContents.on('new-window',
      (event, url, frameName, disposition, options, additionalFeatures) =>
      {
        if (frameName === 'NewWindowComponent ') {
          event.preventDefault();
          Object.assign(options, {
            parent: mainWindow,
            width: 100,
            height: 300,
          });
          event.newGuest = new BrowserWindow(options);
        }
      });
  mainWindow.on('closed', () => (mainWindow = null));
}

app.commandLine.appendSwitch('ignore-certificate-errors');

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
